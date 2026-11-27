import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import DecryptedText from "../rb/DecryptedText";
import { workBySlug, WORKS } from "../data/works";
import { go, useScrollLock } from "../lib/hooks";

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.25 } },
};
const item = {
  hidden: { opacity: 0, x: -24, filter: "blur(6px)" },
  show: { opacity: 1, x: 0, filter: "blur(0px)", transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

function Lightbox({ images, index, onClose, onStep }) {
  useEffect(() => {
    const k = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onStep(1);
      if (e.key === "ArrowLeft") onStep(-1);
    };
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [onClose, onStep]);
  let sx = 0;
  return (
    <motion.div
      className="wd-lightbox"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      onTouchStart={(e) => (sx = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - sx;
        if (Math.abs(dx) > 40) onStep(dx < 0 ? 1 : -1);
      }}
    >
      <AnimatePresence mode="wait">
        <motion.img
          key={index}
          src={images[index]}
          alt=""
          initial={{ opacity: 0, scale: 0.96, clipPath: "inset(0 0 100% 0)" }}
          animate={{ opacity: 1, scale: 1, clipPath: "inset(0 0 0% 0)" }}
          exit={{ opacity: 0, x: -30 }}
          transition={{ duration: 0.35 }}
          onClick={(e) => e.stopPropagation()}
        />
      </AnimatePresence>
      <button className="wd-lightbox__nav wd-lightbox__nav--l" onClick={(e) => (e.stopPropagation(), onStep(-1))} aria-label="Previous">‹</button>
      <button className="wd-lightbox__nav wd-lightbox__nav--r" onClick={(e) => (e.stopPropagation(), onStep(1))} aria-label="Next">›</button>
      <span className="wd-lightbox__count">{String(index + 1).padStart(2, "0")} / {String(images.length).padStart(2, "0")}</span>
    </motion.div>
  );
}

// poster first; YouTube is only contacted after the visitor presses play
function Video({ video, poster }) {
  const [playing, setPlaying] = useState(false);
  if (playing)
    return (
      <iframe
        src={`https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`}
        title={video.title}
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture; web-share; fullscreen"
        allowFullScreen
        referrerPolicy="strict-origin-when-cross-origin"
      />
    );
  return (
    <button className="wd__play cursor-target" onClick={() => setPlaying(true)} aria-label={`Play ${video.title}`}>
      <img src={poster} alt="" />
      <span>▶︎ PLAY VIDEO</span>
    </button>
  );
}

// turns the known @handles in a string into links
function withMentions(text, mentions) {
  if (!mentions) return text;
  return text.split(/(@\w+)/).map((part, i) => {
    const url = part.startsWith("@") && mentions[part.slice(1)];
    if (!url) return part;
    return (
      <a key={i} className="wd__mention cursor-target" href={url} target="_blank" rel="noreferrer">
        {part}
      </a>
    );
  });
}

export default function WorkDetail({ slug, base, theme = "", label = "FILE" }) {
  const w = workBySlug(slug);
  const [lb, setLb] = useState(-1);
  useScrollLock(true);
  useEffect(() => {
    const k = (e) => e.key === "Escape" && lb < 0 && go(base);
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [base, lb]);
  if (!w) return null;
  const idx = WORKS.indexOf(w);
  const next = WORKS[(idx + 1) % WORKS.length];

  return (
    <motion.div
      className={"wd " + theme}
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      animate={{ clipPath: "inset(0 0 0% 0)" }}
      exit={{ clipPath: "inset(100% 0 0 0)" }}
      transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="wd__bar">
        <button className="wd__back cursor-target" onClick={() => go(base)}>
          ◂ RETURN
        </button>
        <span className="wd__file">
          {label} {String(idx + 1).padStart(2, "0")} // {w.slug.toUpperCase()}
        </span>
      </div>

      <header className="wd__hero">
        {w.video ? (
          <div className="wd__heroimg wd__heroimg--video">
            <Video video={w.video} poster={w.hero} />
          </div>
        ) : (
          <div className="wd__heroimg">
            <img src={w.hero} alt={w.title} />
            <span className="wd__scan" />
          </div>
        )}
        <div className="wd__heading">
          <span className="wd__tag">{w.tag} · {w.year}</span>
          <h1 className="wd__title">
            <DecryptedText text={w.title} animateOn="view" sequential speed={28} revealDirection="start" />
          </h1>
          <p className="wd__summary">{w.summary}</p>
          <div className="wd__links">
            {w.video && (
              <a className="wd__btn wd__btn--main cursor-target" href={`https://youtu.be/${w.video.id}`} target="_blank" rel="noreferrer">
                ▸ WATCH ON YOUTUBE
              </a>
            )}
            {w.live && (
              <a className="wd__btn wd__btn--main cursor-target" href={w.live} target="_blank" rel="noreferrer">
                ▸ OPEN LIVE
              </a>
            )}
            {w.repo && (
              <a className="wd__btn cursor-target" href={w.repo} target="_blank" rel="noreferrer">
                ⌥ SOURCE
              </a>
            )}
          </div>
        </div>
      </header>

      <motion.section className={"wd__body " + (w.highlights ? "" : "wd__body--duo")} variants={list} initial="hidden" animate="show">
        <motion.div className="wd__meta" variants={item}>
          <div>
            <span>ROLE</span>
            <b>{w.role}</b>
          </div>
          {w.tools && (
            <div>
              <span>STACK</span>
              <ul className="wd__chips">
                {w.tools.map((t) => (
                  <li key={t}>{t}</li>
                ))}
              </ul>
            </div>
          )}
          {w.facts?.map(([k, v]) => (
            <div key={k}>
              <span>{k}</span>
              <b>{withMentions(v, w.mentions)}</b>
            </div>
          ))}
        </motion.div>
        <div className="wd__story">
          {w.story.map((p, i) => (
            <motion.p key={i} variants={item}>
              {withMentions(p, w.mentions)}
            </motion.p>
          ))}
        </div>
        {w.highlights && (
          <motion.ul className="wd__highlights" variants={item}>
            {w.highlights.map((h) => (
              <li key={h}>{h}</li>
            ))}
          </motion.ul>
        )}
      </motion.section>

      <section className={"wd__gallery " + (w.galleryFit ? "wd__gallery--" + w.galleryFit : "")}>
        {w.gallery.map((g, i) => (
          <motion.button
            key={g}
            className="wd__shot cursor-target"
            onClick={() => setLb(i)}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-60px" }}
            transition={{ duration: 0.5, delay: (i % 4) * 0.06 }}
          >
            <img src={g} alt="" loading="lazy" />
          </motion.button>
        ))}
      </section>

      <footer className="wd__next">
        <button className="cursor-target" onClick={() => go(`${base}/work/${next.slug}`)}>
          <span>NEXT FILE</span>
          <b>{next.title} ▸</b>
        </button>
      </footer>

      <AnimatePresence>
        {lb >= 0 && (
          <Lightbox
            images={w.gallery}
            index={lb}
            onClose={() => setLb(-1)}
            onStep={(d) => setLb((v) => (v + d + w.gallery.length) % w.gallery.length)}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}
