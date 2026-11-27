import { useEffect, useState, useSyncExternalStore } from "react";

// ── hash router: "#/work/zensation-dojo" → ["work","zensation-dojo"]
const readHash = () => window.location.hash.replace(/^#\/?/, "").split("/").filter(Boolean);
const subHash = (cb) => {
  window.addEventListener("hashchange", cb);
  return () => window.removeEventListener("hashchange", cb);
};
let lastHash = "";
let lastParts = [];
const snapHash = () => {
  if (window.location.hash !== lastHash) {
    lastHash = window.location.hash;
    lastParts = readHash();
  }
  return lastParts;
};
export const useRoute = () => useSyncExternalStore(subHash, snapHash);
export const go = (path) => {
  window.location.hash = "/" + path.replace(/^\/+/, "");
};

// ── media queries
export function useMedia(query) {
  const [m, setM] = useState(() => typeof window !== "undefined" && window.matchMedia(query).matches);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const on = () => setM(mq.matches);
    on();
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, [query]);
  return m;
}
export const useFinePointer = () => useMedia("(hover: hover) and (pointer: fine)");
export const useMobile = () => useMedia("(max-width: 760px)");
export const useReducedMotion = () => useMedia("(prefers-reduced-motion: reduce)");

// ── once-per-session intro flag
export const introSeen = (key) => sessionStorage.getItem("intro:" + key) === "1";
export const markIntro = (key) => sessionStorage.setItem("intro:" + key, "1");
export const resetIntro = (key) => sessionStorage.removeItem("intro:" + key);

// ── live clock string for HUD bars
export function useClock() {
  const [t, setT] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setT(new Date()), 1000);
    return () => clearInterval(id);
  }, []);
  return t.toLocaleTimeString("en-GB", { hour12: false });
}

// ── stable random visitor id, per tab
export function visitorId() {
  let id = sessionStorage.getItem("visitor");
  if (!id) {
    const c = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    id = Array.from({ length: 7 }, () => c[Math.floor(Math.random() * c.length)]).join("");
    sessionStorage.setItem("visitor", id);
  }
  return id;
}

// lock body scroll while an overlay is open; counted, because overlays stack and can close in any order
let locks = 0;
export function useScrollLock(on) {
  useEffect(() => {
    if (!on) return;
    locks += 1;
    document.documentElement.style.overflow = "hidden";
    return () => {
      locks -= 1;
      if (!locks) document.documentElement.style.overflow = "";
    };
  }, [on]);
}
