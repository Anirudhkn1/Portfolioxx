import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useSpring } from "framer-motion";
import DecryptedText from "../rb/DecryptedText";
import EyeWall from "../engine/EyeWall";
import { BLOGS } from "../data/blogs";
import { go, useScrollLock } from "../lib/hooks";

const fmtDate = (d) =>
  new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }).toUpperCase();

/* ═════════════ the list on the home page ═════════════ */
export function Blogs() {
  return (
    <section className="o-blogs" id="o-blogs">
      {/* the intro's dithered eye wall, watching the pointer, as the section backdrop */}
      <div className="o-blogs__eyes" aria-hidden="true">
        <EyeWall tint="#8e8e8e" cell={140} />
      </div>
      <div className="o-sechead">
        <span className="o-kicker">// LOGS</span>
        <h2>BLOGS.</h2>
      </div>
      <p className="o-blogs__sub">Notes on thinking, attention and growing up online. Written for my own head first, shared in case it helps yours.</p>
      <div className="o-list">
        {BLOGS.map((b, i) => (
          <motion.button
            key={b.slug}
            className="o-row o-blog cursor-target"
            onClick={() => go(`blog/${b.slug}`)}
            initial={{ opacity: 0, x: i % 2 ? 80 : -80 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          >
            <span className="o-row__i">0{i + 1}</span>
            <span className="o-blog__main">
              <span className="o-blog__t">{b.title}</span>
              <span className="o-blog__s">{b.summary}</span>
            </span>
            <span className="o-blog__meta">
              <span>{fmtDate(b.date)}</span>
              <span>{b.readTime}</span>
            </span>
            <span className="o-row__y">READ ↗</span>
          </motion.button>
        ))}
      </div>
    </section>
  );
}

/* classify a paragraph so short punchlines and quotes get their own look */
function kind(p) {
  const t = p.trim();
  if (/^["“].*["”]$/.test(t)) return "quote";
  if (/^[-—–]\s*\w+$/.test(t)) return "sig";
  if (/^[A-C]:\s/.test(t)) return "opt";
  if (t.length <= 70 && !/[?:]$/.test(t) && t.split(" ").length <= 9) return "beat";
  return "p";
}

/* ═════════════ the full-screen reader ═════════════ */
export function BlogReader({ slug }) {
  const idx = BLOGS.findIndex((b) => b.slug === slug);
  const post = BLOGS[idx];
  const ref = useRef(null);
  const [mounted, setMounted] = useState(false);
  useScrollLock(true);
  useEffect(() => setMounted(true), []);
  useEffect(() => {
    const k = (e) => e.key === "Escape" && go("");
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, []);
  // each post opens at the top
  useEffect(() => {
    ref.current?.scrollTo(0, 0);
  }, [slug]);
  const { scrollYProgress } = useScroll(mounted ? { container: ref } : undefined);
  const bar = useSpring(scrollYProgress, { stiffness: 220, damping: 30 });
  if (!post) return null;
  const next = BLOGS[(idx + 1) % BLOGS.length];

  return (
    <motion.div
      className="wd wd--o bl"
      ref={ref}
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      animate={{ clipPath: "inset(0 0 0% 0)" }}
      exit={{ clipPath: "inset(100% 0 0 0)" }}
      transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="wd__bar">
        <button className="wd__back cursor-target" onClick={() => go("")}>
          ◂ RETURN
        </button>
        <span className="wd__file">
          LOG {String(idx + 1).padStart(2, "0")} // {post.slug.toUpperCase()}
        </span>
        <motion.i className="bl__progress" style={{ scaleX: bar }} />
      </div>

      <header className="bl__head">
        <span className="wd__tag">
          {fmtDate(post.date)} · {post.readTime}
        </span>
        <h1 className="bl__title">
          <DecryptedText text={post.title} animateOn="view" sequential speed={22} revealDirection="start" />
        </h1>
        <ul className="bl__tags">
          {post.tag.split("/").map((t) => (
            <li key={t}>{t.trim()}</li>
          ))}
        </ul>
        <p className="bl__lede">{post.summary}</p>
      </header>

      <article className="bl__body">
        {post.body.map((p, i) => (
          <motion.p
            key={i}
            className={"bl__" + kind(p)}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "0px 0px -8% 0px" }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          >
            {p}
          </motion.p>
        ))}
      </article>

      <footer className="wd__next">
        <button className="cursor-target" onClick={() => go(`blog/${next.slug}`)}>
          <span>NEXT LOG</span>
          <b>{next.title} ▸</b>
        </button>
      </footer>
    </motion.div>
  );
}
