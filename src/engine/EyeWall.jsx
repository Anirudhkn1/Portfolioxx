import { useEffect, useRef } from "react";

/*
  Wallpaper of 1-bit dithered eyeballs. Drawn in code, then pushed through a 4×4 Bayer
  threshold so they read as printed dots. Pupils look at the pointer; the wall drifts slowly.
*/
const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];

function eyeSprite(size, lookX, lookY, tint, blink = 0) {
  const c = document.createElement("canvas");
  c.width = c.height = size;
  const g = c.getContext("2d");
  const R = size * 0.46;
  const cx = size / 2;
  const cy = size / 2;
  // sclera with falloff
  const sc = g.createRadialGradient(cx - R * 0.3, cy - R * 0.35, R * 0.1, cx, cy, R);
  sc.addColorStop(0, "#fff");
  sc.addColorStop(0.65, "#b9b9b9");
  sc.addColorStop(1, "#2a2a2a");
  g.fillStyle = sc;
  g.beginPath();
  g.arc(cx, cy, R, 0, Math.PI * 2);
  g.fill();
  // veins
  g.strokeStyle = "rgba(40,40,40,.85)";
  g.lineWidth = size * 0.012;
  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2 + 0.4;
    g.beginPath();
    g.moveTo(cx + Math.cos(a) * R * 0.95, cy + Math.sin(a) * R * 0.95);
    g.quadraticCurveTo(
      cx + Math.cos(a + 0.3) * R * 0.7, cy + Math.sin(a + 0.3) * R * 0.7,
      cx + Math.cos(a - 0.1) * R * 0.5, cy + Math.sin(a - 0.1) * R * 0.5,
    );
    g.stroke();
  }
  // iris + pupil, pushed toward the look direction
  const ix = cx + lookX * R * 0.42;
  const iy = cy + lookY * R * 0.42;
  const ir = R * 0.42;
  const ig = g.createRadialGradient(ix, iy, ir * 0.2, ix, iy, ir);
  ig.addColorStop(0, "#5a5a5a");
  ig.addColorStop(0.8, "#8a8a8a");
  ig.addColorStop(1, "#1a1a1a");
  g.fillStyle = ig;
  g.beginPath();
  g.ellipse(ix, iy, ir * (1 - Math.abs(lookX) * 0.18), ir * (1 - Math.abs(lookY) * 0.18), 0, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#000";
  g.beginPath();
  g.arc(ix, iy, ir * 0.45, 0, Math.PI * 2);
  g.fill();
  g.fillStyle = "#fff";
  g.beginPath();
  g.arc(ix - ir * 0.35, iy - ir * 0.35, ir * 0.16, 0, Math.PI * 2);
  g.fill();
  // eyelid for blinks
  if (blink > 0) {
    g.fillStyle = "#000";
    g.fillRect(0, 0, size, size * 0.5 * blink + 1);
    g.fillRect(0, size - size * 0.5 * blink, size, size);
  }
  // 1-bit dither → tinted dots on transparent
  const id = g.getImageData(0, 0, size, size);
  const d = id.data;
  const [tr, tg, tb] = tint;
  const step = 2;
  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = (y * size + x) * 4;
      const on =
        d[i + 3] > 20 &&
        x % step === 0 && y % step === 0 &&
        (d[i] / 255) * 16 > BAYER[((y / step) % 4) * 4 + ((x / step) % 4)] + 0.5;
      d[i] = tr; d[i + 1] = tg; d[i + 2] = tb;
      d[i + 3] = on ? 255 : 0;
    }
  }
  g.putImageData(id, 0, 0);
  return c;
}

const hexRgb = (h) => {
  const n = parseInt(h.replace("#", ""), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
};

export default function EyeWall({ tint = "#9a9a9a", cell = 150, className = "", opacity = 1 }) {
  const wrapRef = useRef(null);
  const canvasRef = useRef(null);

  useEffect(() => {
    const wrap = wrapRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const mobile = window.matchMedia("(max-width: 760px)").matches;
    const size = Math.round(mobile ? cell * 0.7 : cell);
    const rgb = hexRgb(tint);
    // 3×3 look directions + blink frames
    const sprites = {};
    for (let y = -1; y <= 1; y++) for (let x = -1; x <= 1; x++) sprites[`${x},${y}`] = eyeSprite(size, x * 0.85, y * 0.75, rgb);
    const blinks = [0.5, 1].map((b) => eyeSprite(size, 0, 0, rgb, b));

    let W = 0, H = 0;
    const resize = () => {
      W = wrap.clientWidth;
      H = wrap.clientHeight;
      canvas.width = W;
      canvas.height = H;
    };
    const ro = new ResizeObserver(resize);
    ro.observe(wrap);
    resize();

    const ptr = { x: W / 2, y: H / 2 };
    const onMove = (e) => {
      const r = canvas.getBoundingClientRect();
      ptr.x = e.clientX - r.left;
      ptr.y = e.clientY - r.top;
    };
    window.addEventListener("pointermove", onMove, { passive: true });

    let visible = true;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting));
    io.observe(wrap);

    const gap = size * 1.12;
    let raf = 0, last = 0;
    const t0 = performance.now();
    const draw = (now) => {
      raf = requestAnimationFrame(draw);
      if (!visible || document.hidden || now - last < 40) return;
      last = now;
      const t = (now - t0) / 1000;
      ctx.clearRect(0, 0, W, H);
      const drift = (t * 10) % gap;
      const colsN = Math.ceil(W / gap) + 2;
      const rowsN = Math.ceil(H / gap) + 2;
      for (let r = -1; r < rowsN; r++) {
        for (let c = -1; c < colsN; c++) {
          const x = c * gap + (r % 2 ? gap / 2 : 0) - drift * 0.5;
          const y = r * gap - drift;
          const ex = x + size / 2;
          const ey = y + size / 2;
          const seed = ((r + 50) * 73 + (c + 50) * 31) % 97;
          // occasional blink, staggered per eye
          const ph = (t * 0.35 + seed * 0.137) % 6;
          let spr;
          if (ph < 0.08) spr = blinks[0];
          else if (ph < 0.16) spr = blinks[1];
          else if (ph < 0.24) spr = blinks[0];
          else {
            const dx = ptr.x - ex;
            const dy = ptr.y - ey;
            const lx = Math.abs(dx) < size * 0.6 ? 0 : Math.sign(dx);
            const ly = Math.abs(dy) < size * 0.6 ? 0 : Math.sign(dy);
            spr = sprites[`${lx},${ly}`];
          }
          ctx.drawImage(spr, x, y);
        }
      }
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      window.removeEventListener("pointermove", onMove);
    };
  }, [tint, cell]);

  return (
    <div ref={wrapRef} className={"eye-wall " + className} style={{ opacity }} aria-hidden="true">
      <canvas ref={canvasRef} />
    </div>
  );
}
