import { A_STROKES } from "../lib/aMark";

// Tapered, slightly broken strokes, like a brush cut with a blade.
function strokePolys([a, b], w, i) {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len = Math.hypot(dx, dy);
  const nx = -dy / len;
  const ny = dx / len;
  const P = (t, k, off = 0) => [a[0] + dx * t + nx * (k + off), a[1] + dy * t + ny * (k + off)];
  const cut = 0.55 + (i % 3) * 0.08; // each stroke snaps once
  const off = i % 2 ? 0.9 : -0.9;
  const seg = (t0, t1, o) => {
    const prof = (t) => w * (0.18 + 0.32 * Math.sin(Math.PI * t));
    const ts = [t0, (t0 * 2 + t1) / 3, (t0 + t1 * 2) / 3, t1];
    const top = ts.map((t) => P(t, prof(t), o));
    const bot = ts.slice().reverse().map((t) => P(t, -prof(t), o));
    return [...top, ...bot].map((p) => p.map((v) => v.toFixed(2)).join(",")).join(" ");
  };
  return [seg(0, cut - 0.015, 0), seg(cut + 0.015, 1, off)];
}

const SLICES = [
  [18, 7],
  [47, 5],
  [71, 9],
];

export default function AMark({
  color = "#ff2b3d",
  ghostA = "#35f2ff",
  ghostB = "#ffffff",
  stroke = 4.2,
  className = "",
  animated = true,
  title = "A",
}) {
  const polys = A_STROKES.flatMap((s, i) => strokePolys(s, stroke, i));
  const shape = polys.map((p, i) => <polygon key={i} points={p} />);
  return (
    <svg className={`amark ${animated ? "amark--live" : ""} ${className}`} viewBox="-8 -6 116 112" role="img" aria-label={title}>
      <defs>
        {SLICES.map(([y, h], i) => (
          <clipPath id={`am-slice-${i}`} key={i}>
            <rect x="-10" y={y} width="120" height={h} />
          </clipPath>
        ))}
      </defs>
      <g className="amark__ghost amark__ghost--a" fill={ghostA}>{shape}</g>
      <g className="amark__ghost amark__ghost--b" fill={ghostB}>{shape}</g>
      <g className="amark__main" fill={color}>{shape}</g>
      {SLICES.map((_, i) => (
        <g key={i} className={`amark__slice amark__slice--${i}`} clipPath={`url(#am-slice-${i})`} fill={i === 1 ? ghostA : color}>
          {shape}
        </g>
      ))}
      <g className="amark__bits">
        <rect x="58" y="30" width="7" height="1.4" fill={ghostA} />
        <rect x="21" y="62" width="10" height="1.2" fill={ghostB} />
        <rect x="83" y="52" width="5" height="2" fill={color} />
        <rect x="4" y="44" width="4" height="1" fill={ghostA} />
        <rect x="40" y="88" width="9" height="1" fill={color} />
      </g>
    </svg>
  );
}
