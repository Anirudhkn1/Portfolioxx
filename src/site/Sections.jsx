import { useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue, useSpring } from "framer-motion";
import GlitchText from "../rb/GlitchText";
import DecryptedText from "../rb/DecryptedText";
import LetterGlitch from "../rb/LetterGlitch";
import Dither from "../rb/Dither";
import SkullPoints from "../engine/SkullPoints";
import AMark from "../shared/AMark";
import { CONFIG } from "../config";
import { WORKS, DROP } from "../data/works";
import { go, useFinePointer, useMobile } from "../lib/hooks";
import "./sections.css";

const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

export function Header({ onMenu }) {
  return (
    <header className="o-head">
      <button className="o-head__brand" onClick={() => jump("o-top")}>
        <span className="o-head__mark">
          <AMark color="#ff1f3d" ghostA="#fff" />
        </span>
        <span>{CONFIG.name}</span>
      </button>
      <span className="o-head__status">
        <i /> ONLINE · OPEN FOR WORK
      </span>
      <button className="o-head__menu cursor-target" onClick={onMenu}>
        MENU
      </button>
    </header>
  );
}

export function Hero() {
  const mobile = useMobile();
  return (
    <section className="o-hero" id="o-top">
      <div className="o-hero__glyphs">
        <LetterGlitch glitchColors={["#ff1f3d", "#f2f2f2", "#5a0a14"]} baseColor="#141414" baseOpacity={0.35} glitchAmount={0.55} speed={0.8} fontSize={mobile ? 12 : 15} edgeFade={0.25} clickEffect="tear" />
      </div>
      <div className="o-hero__shard o-hero__shard--a" aria-hidden="true" />
      <div className="o-hero__shard o-hero__shard--b" aria-hidden="true" />
      <div className="o-hero__skull">
        <SkullPoints color="#f2f2f2" accent="#ff1f3d" instances={[{ x: 0, y: 0, z: 0, s: 1, ry: -0.25 }]} />
      </div>
      <div className="o-hero__text">
        <p className="o-kicker">// {CONFIG.fullName.toUpperCase()} — FILE 000</p>
        <h1 className="o-hero__name">
          <GlitchText fontSize="1em" fontWeight={400} mode="rgb" speed={0.5} intensity={0.7} shadowColors={["#ff1f3d", "#ffffff"]}>
            {CONFIG.name}
          </GlitchText>
        </h1>
        <div className="o-hero__tags">
          {["DESIGN", "CODE", "MOTION"].map((t, i) => (
            <motion.span key={t} initial={{ scale: 2, opacity: 0, rotate: 0 }} animate={{ scale: 1, opacity: 1, rotate: [-4, 3, -2][i] }} transition={{ delay: 0.3 + i * 0.12, type: "spring", stiffness: 500, damping: 18 }}>
              {t}
            </motion.span>
          ))}
        </div>
        <p className="o-hero__tag">
          <DecryptedText text={CONFIG.tagline} animateOn="view" speed={30} maxIterations={14} />
        </p>
      </div>
      <div className="o-marquee" aria-hidden="true">
        <div>
          {Array.from({ length: 2 }, (_, k) => (
            <span key={k}>OPEN FOR FREELANCE ✕ WEBSITES ✕ APPS ✕ MOTION ✕ INTROS THAT SLAP ✕ OPEN FOR FREELANCE ✕ WEBSITES ✕ APPS ✕ MOTION ✕ INTROS THAT SLAP ✕&nbsp;</span>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Files() {
  const fine = useFinePointer();
  const [hover, setHover] = useState(-1);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 300, damping: 28 });
  const sy = useSpring(my, { stiffness: 300, damping: 28 });
  const listRef = useRef(null);
  const onMove = (e) => {
    const r = listRef.current.getBoundingClientRect();
    mx.set(e.clientX - r.left);
    my.set(e.clientY - r.top);
  };
  return (
    <section className="o-files" id="o-files">
      <div className="o-sechead">
        <span className="o-kicker">// FILES</span>
        <h2>SHIPPED.</h2>
      </div>
      <div className="o-list" ref={listRef} onPointerMove={fine ? onMove : undefined} onPointerLeave={() => setHover(-1)}>
        {WORKS.map((w, i) => (
          <motion.button
            key={w.slug}
            className="o-row cursor-target"
            onPointerEnter={() => setHover(i)}
            onClick={() => go(`work/${w.slug}`)}
            initial={{ opacity: 0, x: i % 2 ? 80 : -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="o-row__i">0{i + 1}</span>
            <span className="o-row__t">{w.title}</span>
            <span className="o-row__tag">{w.tag}</span>
            <span className="o-row__y">{w.year} ↗</span>
            {!fine && <img className="o-row__thumb" src={w.cover} alt="" loading="lazy" />}
          </motion.button>
        ))}
        <motion.a
          className="o-row o-row--drop cursor-target"
          href={DROP.file}
          download
          initial={{ opacity: 0, x: -80 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          onPointerEnter={() => setHover(-1)}
        >
          <span className="o-row__i">↓</span>
          <span className="o-row__t">{DROP.title}</span>
          <span className="o-row__tag">{DROP.sub}</span>
          <span className="o-row__y">PDF</span>
        </motion.a>
        <motion.div
          className="o-drop"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.5 }}
          onPointerEnter={() => setHover(-1)}
        >
          <p className="o-drop__blurb">{DROP.blurb}</p>
          <ul className="o-drop__facts">
            {DROP.facts.map((f) => (
              <li key={f}>{f}</li>
            ))}
          </ul>
          <div className="o-drop__for">
            <span className="o-kicker">// USEFUL FOR</span>
            <ul>
              {DROP.forWho.map((f) => (
                <li key={f}>{f}</li>
              ))}
            </ul>
          </div>
        </motion.div>
        {fine && (
          <motion.div className="o-preview" style={{ x: sx, y: sy }} animate={{ opacity: hover >= 0 ? 1 : 0, scale: hover >= 0 ? 1 : 0.6, rotate: hover >= 0 ? -3 : 0 }} transition={{ duration: 0.25 }}>
            <AnimatePresence mode="popLayout">
              {hover >= 0 && (
                <motion.img
                  key={hover}
                  src={WORKS[hover].cover}
                  alt=""
                  initial={{ clipPath: "inset(0 0 100% 0)" }}
                  animate={{ clipPath: "inset(0 0 0% 0)" }}
                  exit={{ clipPath: "inset(100% 0 0 0)" }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                />
              )}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </section>
  );
}

export function Who() {
  return (
    <section className="o-who" id="o-who">
      <div className="o-who__art">
        <Dither waveColor={[1, 0.12, 0.24]} backgroundColor={[0.04, 0.04, 0.04]} colorNum={3} pixelSize={3} waveSpeed={0.04} waveAmplitude={0.35} mouseEffect="ripple" />
        <h2 className="o-who__big">
          WHO
          <br />
          IS THIS
          <br />
          <span>?</span>
        </h2>
      </div>
      <div className="o-who__text">
        <span className="o-kicker">// WHOAMI</span>
        {CONFIG.bio.map((p, i) => (
          <motion.p key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }}>
            {p}
          </motion.p>
        ))}
        <ul className="o-meters">
          {CONFIG.skills.map(([k, v], i) => (
            <li key={k}>
              <span>{k}</span>
              <span className="o-meter" aria-label={v}>
                {Array.from({ length: 10 }, (_, b) => (
                  <motion.i
                    key={b}
                    className={v === "ON" ? "on" : b < 1 ? "on" : ""}
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.2 + i * 0.08 + b * 0.03, duration: 0.01 }}
                  />
                ))}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
