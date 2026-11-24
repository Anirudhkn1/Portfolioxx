// The "A" sigil: thin glitch strokes in a 100×100 box (y down).
// Two short posts + a tall Λ + a crossing V that forms the crossbar.
export const A_STROKES = [
  [[9, 24], [9, 84]],
  [[91, 24], [91, 84]],
  [[19, 97], [50, 4]],
  [[50, 4], [81, 97]],
  [[27, 40], [50, 80]],
  [[50, 80], [73, 40]],
];

// Seeded RNG so every visitor gets the same sampling.
export function rng(seed = 1) {
  let s = seed >>> 0 || 1;
  return () => {
    s ^= s << 13;
    s ^= s >>> 17;
    s ^= s << 5;
    return ((s >>> 0) % 1e6) / 1e6;
  };
}

/** Sample `count` 3D points on the sigil, centred, height ≈ 2.1 units. */
export function sampleAMark(count, seed = 7) {
  const r = rng(seed);
  const lens = A_STROKES.map(([a, b]) => Math.hypot(b[0] - a[0], b[1] - a[1]));
  const total = lens.reduce((s, l) => s + l, 0);
  const out = new Float32Array(count * 3);
  for (let i = 0; i < count; i++) {
    let pick = r() * total;
    let k = 0;
    while (pick > lens[k] && k < lens.length - 1) pick -= lens[k++];
    const [a, b] = A_STROKES[k];
    const t = r();
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len = lens[k];
    const nx = -dy / len;
    const ny = dx / len;
    // taper: thinner toward the ends, like a brush-cut stroke
    const w = (r() - 0.5) * 2.4 * (0.45 + 0.55 * Math.sin(Math.PI * t));
    const x = a[0] + dx * t + nx * w;
    const y = a[1] + dy * t + ny * w;
    out[i * 3] = ((x - 50) / 50) * 1.02;
    out[i * 3 + 1] = (-(y - 50.5) / 50) * 1.05;
    out[i * 3 + 2] = (r() - 0.5) * 0.06;
  }
  return out;
}
