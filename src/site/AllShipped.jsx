import { useEffect } from "react";
import { motion } from "framer-motion";
import { CATEGORIES, DROP, WORKS } from "../data/works";
import { go, useScrollLock } from "../lib/hooks";

const rise = {
  initial: { opacity: 0, y: 40 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, amount: 0.2 },
  transition: { duration: 0.55, ease: [0.16, 1, 0.3, 1] },
};

function Group({ n, title, children }) {
  return (
    <section className="sa__group">
      <h3 className="sa__title">
        <span>{String(n).padStart(2, "0")}</span>
        {title}
      </h3>
      {children}
    </section>
  );
}

/* ═════════════ "See all": every shipped file, by category ═════════════ */
// `covered`: a work page is open on top, so Escape belongs to that page.
export default function AllShipped({ covered }) {
  useScrollLock(true);
  useEffect(() => {
    if (covered) return;
    const k = (e) => e.key === "Escape" && go("");
    window.addEventListener("keydown", k);
    return () => window.removeEventListener("keydown", k);
  }, [covered]);

  const groups = CATEGORIES.map((c) => ({ ...c, items: WORKS.filter((w) => w.category === c.id) })).filter((c) => c.items.length);

  return (
    <motion.div
      className="wd wd--o sa"
      initial={{ clipPath: "inset(0 0 100% 0)" }}
      animate={{ clipPath: "inset(0 0 0% 0)" }}
      exit={{ clipPath: "inset(100% 0 0 0)" }}
      transition={{ duration: 0.55, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="wd__bar">
        <button className="wd__back cursor-target" onClick={() => go("")}>
          ◂ RETURN
        </button>
        <span className="wd__file">ALL FILES // SHIPPED</span>
      </div>

      <header className="o-sechead sa__head">
        <span className="o-kicker">// EVERY FILE</span>
        <h2>ALL SHIPPED.</h2>
      </header>

      {groups.map((c, i) => (
        <Group key={c.id} n={i + 1} title={c.title}>
          <div className="sa__grid">
            {c.items.map((w) => (
              <motion.button key={w.slug} className="sa-card cursor-target" onClick={() => go(`shipped/work/${w.slug}`)} {...rise}>
                <span className="sa-card__img">
                  <img src={w.cover} alt="" loading="lazy" />
                  {w.video && <i>▶︎ VIDEO</i>}
                </span>
                <span className="sa-card__t">{w.title}</span>
                <span className="sa-card__tag">
                  <span>
                    {w.tag} · {w.year}
                  </span>
                  <span>OPEN ↗</span>
                </span>
              </motion.button>
            ))}
          </div>
        </Group>
      ))}

      <Group n={groups.length + 1} title="Free downloads">
        <div className="o-list">
          <a className="o-row o-row--drop cursor-target" href={DROP.file} download>
            <span className="o-row__i">↓</span>
            <span className="o-row__t">{DROP.title}</span>
            <span className="o-row__tag">{DROP.sub}</span>
            <span className="o-row__y">PDF</span>
          </a>
          <div className="o-drop">
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
          </div>
        </div>
      </Group>
    </motion.div>
  );
}
