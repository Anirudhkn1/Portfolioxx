import { useEffect, useRef } from "react";

/*
  Fine-grained grey-on-black ASCII portrait.
  Detail comes from: a long 70-step character ramp, tiny cells (~150 columns on desktop),
  auto-levels on the subject only, and an unsharp mask on the luminance grid so edges
  (eyes, hairline, jacket folds) survive the downsample.
  Motion is kept quiet: a one-time scan-in, a slow scan line, and characters that
  scramble briefly around the pointer.
*/
const RAMP = " .'`^\",:;Il!i><~+_-?][}{1)(|\\/tfjrxnuvczXYUJCLQ0OZmwqpdbkhao*#MW&8%B@$";
const NOISE = "@#%&$*+=-:;!?/\\|<>";

const hash = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// fit "cover" crops toward `focus` (image-space 0..1, where the face is) and places it at `anchor` (box-space 0..1).
export default function AsciiPortrait({
  src,
  className = "",
  columns,
  accent = "#ff1f3d",
  fit = "cover",
  focus = [0.41, 0.26],
  anchor = [0.5, 0.36],
  zoom = 1.3,
}) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const img = new Image();
    img.decoding = "async";
    img.src = src;

    // grid state
    let W = 0, H = 0, cols = 0, rows = 0, cw = 0, ch = 0, ox = 0, oy = 0;
    let glyph = null; // ramp index per cell, -1 = empty
    let tone = null; // grey level per cell
    let base = null; // pre-rendered static layer
    let ready = false;
    let born = 0;
    const ptr = { x: -9999, y: -9999 };

    const build = () => {
      if (!img.naturalWidth) return;
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      if (!W || !H) return;
      canvas.width = Math.round(W * dpr);
      canvas.height = Math.round(H * dpr);

      // where the photo sits inside the box (px)
      let s, ix, iy;
      if (fit === "cover") {
        s = Math.max(W / img.naturalWidth, H / img.naturalHeight) * zoom;
        ix = anchor[0] * W - focus[0] * img.naturalWidth * s;
        iy = anchor[1] * H - focus[1] * img.naturalHeight * s;
        // never leave a gap at the bottom edge
        iy = Math.max(iy, H - img.naturalHeight * s);
      } else {
        s = Math.min(W / img.naturalWidth, H / img.naturalHeight);
        ix = (W - img.naturalWidth * s) / 2;
        iy = H - img.naturalHeight * s;
      }
      const iw = img.naturalWidth * s;
      const ih = img.naturalHeight * s;
      // the grid covers the whole box; cells outside the photo stay empty
      const target = columns ?? (mobile ? 110 : 180);
      cw = Math.max(2.2, W / target);
      ch = cw * 1.62; // monospace cell aspect
      cols = Math.floor(W / cw);
      rows = Math.floor(H / ch);
      ox = (W - cols * cw) / 2;
      oy = (H - rows * ch) / 2;

      // sample at 2× and average for cleaner tones
      const sx = cols * 2, sy = rows * 2;
      const off = document.createElement("canvas");
      off.width = sx;
      off.height = sy;
      const o = off.getContext("2d", { willReadFrequently: true });
      o.imageSmoothingQuality = "high";
      const k = 2 / cw;
      const kh = 2 / ch;
      o.drawImage(img, (ix - ox) * k, (iy - oy) * kh, iw * k, ih * kh);
      const d = o.getImageData(0, 0, sx, sy).data;
      const L = new Float32Array(cols * rows);
      const A = new Float32Array(cols * rows);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          let l = 0, a = 0;
          for (let yy = 0; yy < 2; yy++) {
            for (let xx = 0; xx < 2; xx++) {
              const i = ((r * 2 + yy) * sx + (c * 2 + xx)) * 4;
              const al = d[i + 3] / 255;
              l += ((0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) / 255) * al;
              a += al;
            }
          }
          A[r * cols + c] = a / 4;
          L[r * cols + c] = a > 0 ? l / a : 0;
        }
      }
      // auto-levels on the subject (2nd–98th percentile)
      const vals = [];
      for (let i = 0; i < L.length; i++) if (A[i] > 0.5) vals.push(L[i]);
      vals.sort((p, q) => p - q);
      const lo = vals[Math.floor(vals.length * 0.02)] ?? 0;
      const hi = vals[Math.floor(vals.length * 0.98)] ?? 1;
      const span = Math.max(0.05, hi - lo);
      // unsharp mask (3×3 box blur)
      const N = new Float32Array(L.length);
      for (let i = 0; i < L.length; i++) N[i] = Math.min(1, Math.max(0, (L[i] - lo) / span));
      glyph = new Int16Array(L.length);
      tone = new Uint8Array(L.length);
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          if (A[i] < 0.35) {
            glyph[i] = -1;
            continue;
          }
          let b = 0, n = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const rr = r + dy, cc = c + dx;
              if (rr < 0 || cc < 0 || rr >= rows || cc >= cols) continue;
              b += N[rr * cols + cc];
              n++;
            }
          }
          let v = N[i] + 0.75 * (N[i] - b / n);
          // lift mid-tones: thin glyphs carry little ink, so they need extra brightness
          v = Math.pow(Math.min(1, Math.max(0, v)), 0.68);
          // soft fade at the silhouette edge
          v *= Math.min(1, (A[i] - 0.35) / 0.4);
          glyph[i] = Math.max(1, Math.round(v * (RAMP.length - 1)));
          tone[i] = Math.round(58 + v * 190); // #3a3a3a → #f8f8f8
        }
      }

      // static layer
      base = document.createElement("canvas");
      base.width = canvas.width;
      base.height = canvas.height;
      const b = base.getContext("2d");
      b.setTransform(dpr, 0, 0, dpr, 0, 0);
      b.font = `${(ch * 0.92).toFixed(2)}px "JetBrains Mono", ui-monospace, monospace`;
      b.textBaseline = "top";
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const i = r * cols + c;
          const g = glyph[i];
          if (g <= 0) continue;
          const t = tone[i];
          b.fillStyle = `rgb(${t},${t},${t})`;
          b.fillText(RAMP[g], ox + c * cw, oy + r * ch);
        }
      }
      ready = true;
      born = performance.now();
    };

    img.onload = () => document.fonts.ready.then(build);
    const ro = new ResizeObserver(() => img.naturalWidth && build());
    ro.observe(wrap);

    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      ptr.x = e.clientX - r.left;
      ptr.y = e.clientY - r.top;
    };
    const onLeave = () => {
      ptr.x = ptr.y = -9999;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    wrap.addEventListener("pointerleave", onLeave);

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible && ready && born && performance.now() - born > 60000) born = performance.now() - 2000;
    });
    io.observe(wrap);

    let raf = 0, last = 0;
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      if (!ready || !visible || document.hidden || now - last < 66) return;
      last = now;
      const t = (now - born) / 1000;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // scan-in from the top over 1.4s
      const reveal = Math.min(1, t / 1.4);
      const cutY = oy * dpr + rows * ch * dpr * reveal;
      ctx.save();
      ctx.beginPath();
      ctx.rect(0, 0, canvas.width, cutY);
      ctx.clip();
      ctx.drawImage(base, 0, 0);
      ctx.restore();

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.font = `${(ch * 0.92).toFixed(2)}px "JetBrains Mono", ui-monospace, monospace`;
      ctx.textBaseline = "top";

      // leading edge of the scan
      if (reveal < 1) {
        ctx.fillStyle = accent;
        ctx.fillRect(ox, cutY / dpr - 1, cols * cw, 1.5);
      }

      // slow scan line that brightens what it passes
      const scanRow = Math.floor(((t * 0.18) % 1.3) * rows);
      if (reveal >= 1 && scanRow < rows) {
        ctx.globalAlpha = 0.18;
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(ox, oy + scanRow * ch, cols * cw, ch * 1.2);
        ctx.globalAlpha = 1;
      }

      // pointer: cells in a radius flicker to noise glyphs, a few in accent red
      if (ptr.x > -999) {
        const R = mobile ? 40 : 64;
        const c0 = Math.max(0, Math.floor((ptr.x - ox - R) / cw));
        const c1 = Math.min(cols - 1, Math.ceil((ptr.x - ox + R) / cw));
        const r0 = Math.max(0, Math.floor((ptr.y - oy - R) / ch));
        const r1 = Math.min(rows - 1, Math.ceil((ptr.y - oy + R) / ch));
        const tq = Math.floor(now / 90);
        for (let r = r0; r <= r1; r++) {
          for (let c = c0; c <= c1; c++) {
            const i = r * cols + c;
            if (glyph[i] <= 0) continue;
            const x = ox + c * cw;
            const y = oy + r * ch;
            const dist = Math.hypot(x - ptr.x, y - ptr.y);
            if (dist > R) continue;
            const h = hash(i * 0.7 + tq);
            if (h > 1 - (1 - dist / R) * 0.9) {
              ctx.fillStyle = "#000";
              ctx.fillRect(x, y, cw, ch);
              ctx.fillStyle = h > 0.94 ? accent : "#f2f2f2";
              ctx.fillText(NOISE[Math.floor(hash(i + tq) * NOISE.length)], x, y);
            }
          }
        }
      }
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
      wrap.removeEventListener("pointerleave", onLeave);
    };
    // focus/anchor compared by value
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [src, columns, accent, fit, focus.join(), anchor.join(), zoom]);

  return (
    <div ref={wrapRef} className={"ascii-portrait " + className} role="img" aria-label="Portrait of Anirudh drawn in ASCII">
      <canvas ref={canvasRef} />
    </div>
  );
}
