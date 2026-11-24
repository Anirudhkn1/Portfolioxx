# ANIRUDH // portfolio

Hacker / glitch freelance portfolio (red / black / white). The mark is an original stylised **A** sigil.

- `#/` the site: intro film (boot log → eye wall → dotted skull assembles → glitch → skull morphs into the A sigil → loader), then hero, SHIPPED works, WHO, SAY HI with an ASCII portrait. The channel rail and the MENU guide both have **REPLAY INTRO**.
- `#/work/<slug>` work pages, e.g. `#/work/zensation-dojo`.

The intro plays once per tab, can be skipped (button, Esc, Enter, Space) and is skipped for `prefers-reduced-motion`.

## Deploy

```bash
npm install
npm run build      # → dist/
```

Upload the **contents of `dist/`** to any static host (Netlify, Vercel, Cloudflare Pages, GitHub Pages, a sub-folder…). Paths are relative and routing is hash-based, so no rewrite rules are needed.
Build settings for Git-connected hosts: build command `npm run build`, output directory `dist`.

Local: `npm run dev`, or double-click **Open-Portfolio.bat** (builds once, serves `dist/`, opens the browser). A server is needed: the skull model can't load from a plain `file://` page.

## Edit

- `src/config.js`: name, role, tagline, **bio (draft, rewrite it)**, skills, email, socials.
- `src/data/works.js`: the works + the free PDF.
- `public/img/…`: work images and the profile photo used by the ASCII portrait.

## Code map

- `src/site/Site.jsx`: page shell, channel rail, guide overlay, SAY HI.
- `src/site/Intro.jsx`: the intro film (GSAP timeline).
- `src/site/Sections.jsx`: header, hero, SHIPPED list, WHO.
- `src/engine/SkullPoints.jsx`: `public/models/skull.glb` sampled into points with a custom shader (assembly, morph to sigil, glitch, cursor follow).
- `src/engine/AsciiPortrait.jsx`, `EyeWall.jsx`: ASCII portrait and dithered eyeball wall.
- `src/rb/`: ReactBits components (GlitchText, DecryptedText, LetterGlitch, Dither, Noise, TargetCursor), MIT + Commons Clause, see `src/rb/LICENSE.md`.
