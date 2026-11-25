import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import GlitchText from "../rb/GlitchText";
import Noise from "../rb/Noise";
import AsciiPortrait from "../engine/AsciiPortrait";
import AMark from "../shared/AMark";
import PixelCritter from "../shared/PixelCritter";
import WorkDetail from "../shared/WorkDetail";
import { Cursor } from "../shared/Chrome";
import Intro from "./Intro";
import { Header, Hero, Files, Who } from "./Sections";
import { Blogs, BlogReader } from "./Blogs";
import { CONFIG } from "../config";
import { asset } from "../lib/asset";
import { introSeen, markIntro, resetIntro, useScrollLock } from "../lib/hooks";
import "./intro.css";
import "./site.css";

/*
  The portfolio:
  intro from SIGNAL (hood skull → A sigil loader), hero / shipped / who from OFFLINE (red-black-white),
  channel rail + guide with REPLAY from CATHODE, and an ASCII portrait in SAY HI.
*/

const CHANNELS = [
  ["o-top", "HOME"],
  ["o-files", "SHIPPED"],
  ["o-blogs", "BLOGS"],
  ["o-who", "WHO"],
  ["o-hi", "SAY HI"],
];
const tune = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });

function useActiveChannel() {
  const [active, setActive] = useState("o-top");
  useEffect(() => {
    const io = new IntersectionObserver((es) => es.forEach((e) => e.isIntersecting && setActive(e.target.id)), {
      rootMargin: "-45% 0px -45% 0px",
    });
    // sections mount after the intro reveal; observe once they exist
    const t = setTimeout(() => CHANNELS.forEach(([id]) => document.getElementById(id) && io.observe(document.getElementById(id))), 50);
    return () => {
      clearTimeout(t);
      io.disconnect();
    };
  }, []);
  return active;
}

function Rail({ active, onReplay }) {
  return (
    <nav className="f-rail" aria-label="Channels">
      <button className="f-rail__mark" onClick={() => tune("o-top")} aria-label="Home">
        <AMark color="#ff1f3d" ghostA="#ffffff" />
      </button>
      {CHANNELS.map(([id, label], i) => (
        <button key={id} className={"f-rail__ch cursor-target " + (active === id ? "is-on" : "")} onClick={() => tune(id)}>
          <span>{String(i + 1).padStart(2, "0")}</span>
          <b>{label}</b>
        </button>
      ))}
      <button className="f-rail__replay cursor-target" onClick={onReplay} title="Watch the intro again">
        <i>↺</i>
        <b>REPLAY</b>
        <small>INTRO</small>
      </button>
    </nav>
  );
}

function Guide({ active, onClose, onReplay }) {
  useScrollLock(true);
  useEffect(() => {
    const k = (e) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose]);
  const pick = (fn) => {
    onClose();
    setTimeout(fn, 380);
  };
  return (
    <motion.div
      className="f-guide"
      initial={{ scaleY: 0.004, opacity: 1 }}
      animate={{ scaleY: 1 }}
      exit={{ scaleY: 0.004, opacity: 0 }}
      transition={{ duration: 0.32, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="f-guide__shard" aria-hidden="true" />
      <p className="f-guide__kicker">// CHANNEL GUIDE</p>
      <nav className="f-guide__list">
        {CHANNELS.map(([id, label], i) => (
          <motion.button
            key={id}
            className={"cursor-target " + (active === id ? "is-on" : "")}
            onClick={() => pick(() => tune(id))}
            initial={{ x: -60, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.12 + i * 0.05, ease: [0.16, 1, 0.3, 1], duration: 0.45 }}
          >
            <span>CH {String(i + 1).padStart(2, "0")}</span>
            {label}
          </motion.button>
        ))}
      </nav>
      <motion.button
        className="f-guide__replay cursor-target"
        onClick={() => pick(onReplay)}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.35, type: "spring", stiffness: 420, damping: 20 }}
      >
        <i>↺</i>
        <span>
          <b>REPLAY INTRO</b>
          <small>hood → skull → sigil, one more time</small>
        </span>
      </motion.button>
      <div className="f-guide__foot">
        <button className="f-guide__x cursor-target" onClick={onClose}>
          CLOSE ✕
        </button>
      </div>
    </motion.div>
  );
}

function SayHi() {
  const links = [
    CONFIG.email && ["EMAIL", `mailto:${CONFIG.email}`],
    CONFIG.socials.github && ["GITHUB", CONFIG.socials.github],
    CONFIG.socials.instagram && ["INSTAGRAM", CONFIG.socials.instagram],
    CONFIG.socials.linkedin && ["LINKEDIN", CONFIG.socials.linkedin],
  ].filter(Boolean);
  return (
    <section className="f-hi" id="o-hi">
      <div className="f-hi__shard" aria-hidden="true" />
      <div className="f-hi__portrait">
        <AsciiPortrait src={asset("img/profile.webp")} />
        <span className="f-hi__caption">SUBJECT // {CONFIG.fullName.toUpperCase()}</span>
      </div>
      <div className="f-hi__text">
        <div className="f-hi__status">
          <span className="f-hi__bot">
            <PixelCritter online label={false} />
          </span>
          <span>
            STATUS: <b>ONLINE</b>
          </span>
        </div>
        <h2 className="f-hi__big">
          <GlitchText fontSize="1em" fontWeight={400} trigger="hover" mode="slices" shadowColors={["#ff1f3d", "#ffffff"]}>
            SAY HI
          </GlitchText>
        </h2>
        <p>Freelance slots are open. Websites, apps, motion, intros. Tell me what you are building.</p>
        <div className="f-hi__links">
          {links.map(([k, href]) => (
            <a key={k} className="o-btn cursor-target" href={href} target="_blank" rel="noreferrer">
              {k} ↗
            </a>
          ))}
        </div>
      </div>
      <footer className="o-foot">
        <span>© 2026 {CONFIG.fullName}</span>
        <span>status: ONLINE</span>
      </footer>
    </section>
  );
}

function Page({ onReplay }) {
  const active = useActiveChannel();
  const [guide, setGuide] = useState(false);
  return (
    <>
      <Header onMenu={() => setGuide(true)} />
      <Rail active={active} onReplay={onReplay} />
      <main className="f-main">
        <Hero />
        <Files />
        <Blogs />
        <Who />
        <SayHi />
      </main>
      <AnimatePresence>{guide && <Guide active={active} onClose={() => setGuide(false)} onReplay={onReplay} />}</AnimatePresence>
    </>
  );
}

export default function Site({ sub }) {
  const [intro, setIntro] = useState(() => !introSeen("v4"));
  const [ready, setReady] = useState(() => introSeen("v4"));
  const [run, setRun] = useState(0); // remounts the intro on replay
  const slug = sub[0] === "work" ? sub[1] : null;
  const blog = sub[0] === "blog" ? sub[1] : null;

  const replay = () => {
    resetIntro("v4");
    window.scrollTo(0, 0);
    setReady(false);
    setRun((n) => n + 1);
    setIntro(true);
  };

  return (
    <div className="o f">
      <Cursor color="#ffffff" onTarget="#ff1f3d" />
      <Noise opacity={0.1} fixed blendMode="screen" zIndex={700} />
      {intro && (
        <div className="f-introvars">
          <Intro
            key={run}
            onReveal={() => setReady(true)}
            onDone={() => {
              markIntro("v4");
              setIntro(false);
            }}
          />
        </div>
      )}
      {ready && <Page onReplay={replay} />}
      <AnimatePresence>{slug && <WorkDetail key={slug} slug={slug} base="" theme="wd--o" label="FILE" />}</AnimatePresence>
      {/* one overlay at a time; the key remounts so each post opens at the top */}
      <AnimatePresence>{blog && <BlogReader key={blog} slug={blog} />}</AnimatePresence>
    </div>
  );
}
