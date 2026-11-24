import { useEffect, useLayoutEffect, useRef, useState } from "react";
import gsap from "gsap";
import SkullPoints, { makeControls, preloadSkull } from "../engine/SkullPoints";
import EyeWall from "../engine/EyeWall";
import AMark from "../shared/AMark";
import { asset } from "../lib/asset";
import { CONFIG } from "../config";
import { useReducedMotion } from "../lib/hooks";

const BOOT = [
  "> power ........................ ok",
  "> handshake  node://anirudh ..... ok",
  "> mount /works /whoami /contact . ok",
  "> decrypt identity .............. 3%",
  "> warning: subject is watching back",
];

// deterministic hash for the slice jitter
const hh = (n) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

export default function Intro({ onReveal, onDone }) {
  const root = useRef(null);
  const ctrl = useRef(makeControls({ assemble: 0, opacity: 1 })).current;
  const tlRef = useRef(null);
  const [pct, setPct] = useState(0);
  const reduced = useReducedMotion();

  useEffect(() => {
    if (reduced) {
      onReveal?.();
      onDone?.();
    }
  }, [reduced, onReveal, onDone]);

  useLayoutEffect(() => {
    if (reduced) return;
    const q = gsap.utils.selector(root);
    const counter = { v: 0 };
    let revealed = false;
    const reveal = () => {
      if (!revealed) {
        revealed = true;
        onReveal?.();
      }
    };

    const tl = gsap.timeline({ paused: true, onComplete: () => onDone?.() });
    tlRef.current = tl;

    gsap.set(q(".i1-load, .i1-eyes, .i1-void, .i1-id, .i1-flash, .i1-boot li, .i1-sigil"), { opacity: 0 });
    gsap.set(q(".i1-line"), { scaleX: 0, opacity: 1 });

    // 1 ─ CRT power-on line
    tl.to(q(".i1-line"), { scaleX: 1, duration: 0.32, ease: "power4.out" }, 0.15)
      .to(q(".i1-line"), { scaleY: 60, opacity: 0, duration: 0.35, ease: "expo.in" }, 0.5)
      // 2 ─ boot log types in
      .fromTo(q(".i1-boot li"), { opacity: 0, x: -14 }, { opacity: 1, x: 0, duration: 0.18, stagger: 0.16, ease: "steps(4)" }, 0.75)
      // 3 ─ eyes + hood + skull assembles from the orbit ring
      .to(q(".i1-eyes"), { opacity: 0.5, duration: 1.4, ease: "sine.out" }, 1.0)
      .fromTo(q(".i1-void"), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 1.5, ease: "expo.out" }, 1.15)
      .to(ctrl, { assemble: 1, duration: 2.7, ease: "power2.inOut" }, 1.1)
      .to(ctrl, { zoom: 0.14, duration: 4.0, ease: "sine.inOut" }, 1.1)
      .to(q(".i1-boot"), { opacity: 0, duration: 0.3 }, 3.3)
      // 4 ─ identify: text slam + scan stripes + glitch bursts
      .fromTo(q(".i1-id"), { opacity: 0, x: 30, skewX: -20 }, { opacity: 1, x: 0, skewX: 0, duration: 0.35, ease: "back.out(2)" }, 3.55)
      .set(ctrl, { stripe: 1 }, 3.85)
      .set(ctrl, { stripe: 0 }, 4.05)
      .set(ctrl, { stripe: 1 }, 4.15)
      .to(ctrl, { glitch: 1, duration: 0.05 }, 4.0)
      .to(ctrl, { glitch: 0, duration: 0.35, ease: "power3.in" }, 4.05)
      .to(ctrl, { glitch: 1, duration: 0.05 }, 4.55)
      .to(ctrl, { glitch: 0, duration: 0.25, ease: "power3.in" }, 4.6)
      .set(ctrl, { stripe: 0 }, 4.7)
      // 5 ─ hard cut: red flash, the world drops away, skull becomes the sigil
      .to(q(".i1-flash"), { opacity: 0.95, duration: 0.05 }, 4.9)
      .set(q(".i1-eyes, .i1-void, .i1-id"), { opacity: 0 }, 4.95)
      .to(q(".i1-flash"), { opacity: 0, duration: 0.3, ease: "power2.out" }, 4.97)
      .to(ctrl, { morph: 1, duration: 1.35, ease: "expo.inOut" }, 4.95)
      .to(ctrl, { tint: 1, duration: 0.7, ease: "power1.inOut" }, 4.95)
      .to(ctrl, { zoom: 0, duration: 1.35, ease: "expo.inOut" }, 4.95)
      .to(q(".i1-load"), { opacity: 1, duration: 0.6 }, 5.2)
      .add(reveal, 5.4)
      // 6 ─ crisp SVG sigil takes over from the points
      .to(q(".i1-sigil"), { opacity: 1, duration: 0.25 }, 6.2)
      .to(ctrl, { opacity: 0, duration: 0.5 }, 6.25)
      .fromTo(q(".i1-ghost"), { opacity: 0, x: -80 }, { opacity: 1, x: 0, duration: 1.2, ease: "expo.out", stagger: 0.1 }, 5.6)
      .fromTo(
        q(".i1-sticker"),
        { opacity: 0, scale: 1.7, rotate: (i) => (i % 2 ? 6 : -6) },
        { opacity: 1, scale: 1, rotate: 0, duration: 0.3, ease: "steps(3)", stagger: 0.11 },
        5.9,
      )
      .fromTo(q(".i1-badge"), { opacity: 0, rotate: -200, scale: 0.4 }, { opacity: 1, rotate: 0, scale: 1, duration: 0.8, ease: "back.out(1.6)" }, 6.3)
      .fromTo(q(".i1-face"), { opacity: 0, clipPath: "inset(0 0 100% 0)" }, { opacity: 1, clipPath: "inset(0 0 0% 0)", duration: 0.6, ease: "steps(6)" }, 6.4)
      .to(counter, { v: 100, duration: 1.9, ease: "power1.inOut", onUpdate: () => setPct(Math.round(counter.v)) }, 6.2)
      // 7 ─ exit: slice tear, then gone
      .add(() => root.current?.classList.add("is-tearing"), 8.25)
      .to(root.current, { opacity: 0, duration: 0.25, ease: "steps(4)" }, 8.55);

    // wait for the skull model (or 4s) so the assembly is never empty
    let started = false;
    const start = () => {
      if (started) return;
      started = true;
      tl.play();
    };
    preloadSkull().then(() => setTimeout(start, 120));
    const fallback = setTimeout(start, 4000);

    const skip = (e) => {
      if (e.type === "keydown" && !["Escape", "Enter", " "].includes(e.key)) return;
      reveal();
      tl.progress(1);
    };
    window.addEventListener("keydown", skip);
    return () => {
      clearTimeout(fallback);
      window.removeEventListener("keydown", skip);
      tl.kill();
    };
    // the film is built once
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  if (reduced) return null;

  return (
    <div className="i1" ref={root} role="dialog" aria-label="Intro">
      <div className="i1-line" />
      <ul className="i1-boot">
        {BOOT.map((l) => (
          <li key={l}>{l}</li>
        ))}
      </ul>
      <div className="i1-eyes">
        <EyeWall tint="#8e8e8e" cell={140} />
      </div>
      {/* soft dark pool behind the skull so the eye wall doesn't show through the dots; no edges, covers nothing */}
      <div className="i1-void" />
      <div className="i1-skull">
        <SkullPoints controls={ctrl} selfAssemble={false} autoGlitch={false} follow tintColor="#ff2b3d" accent="#ff2b3d" />
      </div>
      <div className="i1-id">
        <span>SUBJECT</span>
        <b>{CONFIG.name}</b>
        <span>MATCH 99.7%</span>
      </div>

      {/* the loading screen */}
      <div className="i1-load">
        <div className="i1-ghost i1-ghost--a">{CONFIG.name}</div>
        <div className="i1-ghost i1-ghost--b">P O R T F O L I O</div>
        <div className="i1-sticker i1-sticker--tl">
          <small>built</small>
          <b>DIFFERENT</b>
        </div>
        <div className="i1-sticker i1-sticker--red">
          <b>FREE</b>
          <b>LANCE</b>
          <b>2026</b>
        </div>
        <div className="i1-sticker i1-sticker--br">
          <b>STAY</b>
          <b>CURIOUS</b>
          <small>and</small>
          <b>SHIP IT</b>
        </div>
        <div className="i1-face">
          <img src={asset("img/profile.webp")} alt="" />
        </div>
        <div className="i1-badge">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="44" fill="none" stroke="currentColor" strokeWidth="4" />
            <text x="50" y="62" textAnchor="middle" fontSize="34" fill="currentColor" fontFamily="Anton">
              KNA
            </text>
          </svg>
        </div>
        <div className="i1-sigil">
          <AMark />
        </div>
        <div className="i1-progress">
          <span>LOADING SIGNAL</span>
          <i style={{ transform: `scaleX(${pct / 100})` }} />
          <b>{String(pct).padStart(3, "0")}%</b>
        </div>
      </div>

      <div className="i1-flash" />
      <div className="i1-tear" aria-hidden="true">
        {Array.from({ length: 9 }, (_, i) => (
          <span key={i} style={{ "--y": `${(i / 9) * 100}%`, "--h": `${100 / 9}%`, "--x": `${(hh(i) * 2 - 1) * 40}vw` }} />
        ))}
      </div>
      <button
        className="intro-skip"
        onClick={() => {
          onReveal?.();
          tlRef.current?.progress(1);
        }}
      >
        SKIP ▸▸
      </button>
    </div>
  );
}
