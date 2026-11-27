# ANIRUDH // portfolio

Hacker / glitch freelance portfolio (red / black / white). The mark is an original stylised **A** sigil.

- `#/` the site: intro film (boot log → eye wall → dotted skull assembles → glitch → skull morphs into the A sigil → loader), then hero, SHIPPED works, WHO, SAY HI with an ASCII portrait. The channel rail and the MENU guide both have **REPLAY INTRO**.
- `#/work/<slug>` work pages, e.g. `#/work/zensation-dojo`. A work with a `video` gets a YouTube player (e.g. `#/work/indu-music-video`).
- `#/shipped` the SEE ALL page: every work grouped into Web dev, Projects and Niche, plus the free downloads.

The intro plays once per tab, can be skipped (button, Esc, Enter, Space) and is skipped for `prefers-reduced-motion`.

## Deploy

```bash
npm install
npm run build      # → dist/
```

Upload the **contents of `dist/`** to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, a sub-folder…). Paths are relative and routing is hash-based, so no rewrite rules are needed.
Build settings for Git-connected hosts: build command `npm run build`, output directory `dist`.

Local: `npm run dev`, or double-click **Open-Portfolio.bat** (builds, serves `dist/`, opens the browser once the server is ready; keep its window open). A server is needed: the skull model can't load from a plain `file://` page.

## Edit

- `src/config.js`: name, role, tagline, **bio (draft, rewrite it)**, skills, email, socials.
- `src/data/works.js`: the works, their categories + the free PDF. The home page shows the first 3 works (`HOME_LIMIT`); every work appears on SEE ALL.
- `public/img/…`: work images and the profile photo used by the ASCII portrait.
- `photos/`: full-size originals, kept locally (not deployed, not in Git).

## Code map

- `src/site/Site.jsx`: page shell, channel rail, guide overlay, SAY HI.
- `src/site/Intro.jsx`: the intro film (GSAP timeline).
- `src/site/Sections.jsx`: header, hero, SHIPPED list, WHO.
- `src/site/AllShipped.jsx`: the SEE ALL page.
- `src/engine/SkullPoints.jsx`: `public/models/skull.glb` sampled into points with a custom shader (assembly, morph to sigil, glitch, cursor follow).
- `src/engine/AsciiPortrait.jsx`, `EyeWall.jsx`: ASCII portrait and dithered eyeball wall.
- `src/rb/`: ReactBits components (GlitchText, DecryptedText, LetterGlitch, Dither, Noise, TargetCursor), MIT + Commons Clause, see `src/rb/LICENSE.md`.
