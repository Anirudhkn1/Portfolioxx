import { asset } from "../lib/asset";

const Z = asset("img/zensation/");
const A = asset("img/avance/");
const I = asset("img/indu/");

// The headings on the "See all" page (#/shipped), in order. Each work picks one with `category`.
export const CATEGORIES = [
  { id: "web", title: "Web dev" },
  { id: "projects", title: "Projects" },
  { id: "niche", title: "Niche" },
];

// Every work card + detail page is built from this list. The first HOME_LIMIT also show on the home page.
export const WORKS = [
  {
    slug: "zensation-dojo",
    category: "web",
    title: "Zensation Dojo",
    sub: "Website",
    tag: "Website · Motion",
    year: "2026",
    cover: Z + "events-festival.webp",
    hero: Z + "fan-lockup.webp",
    summary:
      "A code-drawn anime website for a Bengaluru Japanese-games dojo: a cinematic intro, a scroll-unrolling nav, an anime dojo interior and real event pages.",
    role: "Design · Front-end · Motion",
    tools: ["HTML", "CSS", "JavaScript", "GSAP", "Framer Motion", "Canvas2D", "SVG", "Cloudflare"],
    repo: "https://github.com/Anirudhkn1/Zensation_Dojo",
    live: "https://zensation-dojo.knanirudh509.workers.dev/",
    story: [
      "Zensation Dojo brings Japanese traditional games, workshops and experiences to events across Bengaluru. The website had to feel like the brand looks: vintage Japanese paper-cut art, but sharp and alive, not a template.",
      "It opens with a roughly ten second real-time anime intro (dusk to night, a sakura tree rush, wind, a whip-pan, then a closed fan opens into the night lockup). It is drawn in code on Canvas2D layers, not played from a video file, so it stays crisp at any size. It plays once per session and can be skipped.",
      "The navigation is a parchment scroll that unrolls on tap. The “What we do” section sits in front of a hand-built perspective SVG dojo interior, with one slow scroll push-in. The About section pins a stage and runs six scroll-driven scenes, with background-removed portraits.",
      "Events live on their own pages (Pax Culture ’26 and a Japanese Horror Night at Kongsi Tea Bar, Jayanagar). Each event is one entry in a data file, and the page lays out its photos in an automatic asymmetric grid with a full-screen viewer (arrows, swipe, keyboard). The call to action goes straight to WhatsApp, because that is how people here actually book.",
    ],
    highlights: [
      "Real-time code-drawn anime intro, once per session, skippable",
      "Parchment-scroll navigation",
      "Perspective SVG dojo interior backdrop",
      "Event pages from a single data file + photo viewer",
      "Static site, no build step; Cloudflare and GitHub Pages configs",
    ],
    gallery: [Z + "card-01-games.webp", Z + "card-02-workshops.webp", Z + "card-03-experiences.webp", Z + "fan.webp"],
  },
  {
    slug: "avance-schools",
    category: "projects",
    title: "Avance Schools",
    sub: "Mobile app",
    tag: "Mobile app · EdTech",
    year: "2026",
    cover: A + "cover.webp",
    hero: A + "cover.webp",
    summary:
      "Homework, but make it a game: one app where students, teachers and parents keep up with school, so nothing gets lost in a group chat.",
    role: "Product · Design · Full-stack",
    tools: ["Expo / React Native", "Node.js API", "SQLite + Turso", "Vercel", "OpenRouter (AI study buddy)"],
    repo: "https://github.com/Anirudhkn1/AvanceSchools",
    live: "https://avance-schools.vercel.app",
    story: [
      "Homework, notices and class updates usually end up scattered across WhatsApp groups, notebooks and memory. Students miss things, teachers repeat themselves and parents are left guessing. Avance Schools puts all of it in one app, with a small game layer on top that keeps students moving.",
      "A school signs up and gets a school ID. Students join with it (the class teacher approves every new student), then see homework, announcements, what was taught today and activities beyond homework. Finishing things earns XP and a homework streak; XP rewards finishing, never marks, so effort counts. Levels run from Sprout to Maestro.",
      "For studying there are quizzes, spaced-repetition flashcards (hard cards return soon, easy ones later) and Dot, a free AI study buddy that explains topics and can make summaries, quizzes and mind maps. Pets and classmates keep it friendly.",
      "Teachers run the whole class from a phone: homework, announcements, today's class, quizzes, activities, student data and streak restores (read the reason, then restore or decline). Parents get a read-only progress view with a parent code: they can look, never change.",
    ],
    highlights: [
      "Three roles in one app: students, teachers, parents",
      "XP for finishing, never marks; streaks; levels Sprout to Maestro",
      "Spaced-repetition flashcards and quizzes",
      "Dot, a free AI study buddy (check important facts)",
      "Read-only parent dashboard, teacher approvals and streak restores",
      "Live on the web and buildable as an Android app",
    ],
    gallery: ["n_home", "s_homework", "s_quiz", "i_spaced_back", "n_chat_mindmap", "n_profile_pets", "s_parents", "t_home", "t_restores"].map((n) => A + n + ".webp"),
    galleryFit: "phones",
  },
  {
    slug: "indu-music-video",
    category: "niche",
    title: "INDU Music Video",
    tag: "Music video · Cast",
    year: "2026",
    cover: I + "cover.webp",
    hero: I + "cover.webp", // poster shown until the video is played
    video: { id: "wGFgFlQ_iHE", title: "INDU - Sumedh K (Official Music Video) | Rectangle Films" },
    summary: "INDU by Sumedh K, an official music video from Rectangle Films. I am part of the cast.",
    role: "Cast",
    facts: [
      ["LOCATION", "Western Ghats · Sharavati River backwaters · Kavaledurga Fort"],
      ["CREDITS", "@rectangle_films · @sumedhk119"],
    ],
    // @handles in `story` and `facts` that become Instagram links
    mentions: {
      rectangle_films: "https://www.instagram.com/rectangle_films/",
      sumedhk119: "https://www.instagram.com/sumedhk119/",
    },
    story: [
      "Picture yourself in the hills of the Western Ghats, surrounded by ancient architecture in the middle of the monsoon, with clouds drifting right past you.",
      "Then, picture running barefoot through the wet mud by the Sharavati River backwaters in a dhoti with your friends—shivering in the rain, yet soaking in every bit of nature's magic.",
      "Nothing short of a dream, right? Pure heaven. Grateful to have experienced this, all thanks to the @rectangle_films team and @sumedhk119.",
    ],
    // order matters: the "film" layout is two wide shots, then one wide + one tall
    gallery: ["friends-hills", "coracle", "set-crane", "mask"].map((n) => I + n + ".webp"),
    galleryFit: "film",
  },
];

export const HOME_LIMIT = 3;
export const FEATURED = WORKS.slice(0, HOME_LIMIT);

// The free guide from the old site's "Nerdify" section.
export const DROP = {
  title: "AI Tech Nerdmax Guide",
  sub: "Free PDF",
  blurb:
    "A 62-page plain-words field guide to AI and tech. It starts from \"what is a program?\" and climbs to machine learning, LLMs, APIs, RAG, MCP, agents and Docker, with a real-life comparison for every term. You can also hand it to an AI assistant as background when brainstorming agent or ML projects.",
  facts: ["62 pages", "271 term cards", "33 diagrams", "4 mind maps", "12-month roadmap"],
  forWho: ["Beginners curious about AI", "Students", "Developers moving into AI and agents", "Founders and freelancers working with AI builders"],
  file: asset("downloads/AI_Tech_Nerdmax_Guide.pdf"),
};

export const workBySlug = (slug) => WORKS.find((w) => w.slug === slug);
