// An original pixel skull-bot. Eyes switch between X (offline) and pupils (online).
const BODY = [
  "....#######....",
  "..###########..",
  ".#############.",
  "###############",
  "###############",
  "###############",
  "###############",
  "###############",
  ".######.######.",
  "..###########..",
  "..#.#.#.#.#.#..",
  "..###########..",
  ".#..#.....#..#.",
];
const EYE_X = [[0, 0], [2, 0], [1, 1], [0, 2], [2, 2]];
const EYE_ON = [[1, 1], [2, 1], [1, 2], [2, 2]];
const EYES = [[3, 4], [9, 4]];

export const CRITTER_PIXELS = BODY.flatMap((row, y) => [...row].map((ch, x) => (ch === "#" ? [x, y] : null)).filter(Boolean));

export default function PixelCritter({ online = false, color = "#ff2238", eye = "#0a0a0a", label, className = "", pixelClass = "px" }) {
  const eyePx = EYES.flatMap(([ex, ey]) => (online ? EYE_ON : EYE_X).map(([x, y]) => [ex + x, ey + y]));
  return (
    <div className={"critter " + className}>
      <svg viewBox="-1 -1 17 15" shapeRendering="crispEdges" aria-hidden="true">
        {CRITTER_PIXELS.map(([x, y], i) => (
          <rect key={i} className={pixelClass} style={{ "--i": i }} x={x} y={y} width="1.02" height="1.02" fill={color} />
        ))}
        {eyePx.map(([x, y], i) => (
          <rect key={"e" + i} className="critter__eye" x={x} y={y} width="1.02" height="1.02" fill={eye} />
        ))}
      </svg>
      {label !== false && <span className="critter__label">{label ?? (online ? "ONLINE" : "OFFLINE")}</span>}
    </div>
  );
}
