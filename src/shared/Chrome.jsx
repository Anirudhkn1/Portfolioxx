import TargetCursor from "../rb/TargetCursor";
import { useFinePointer } from "../lib/hooks";

// Bracket cursor from ReactBits, desktop only (touch devices keep their native behaviour).
export function Cursor({ color = "#ffffff", onTarget }) {
  const fine = useFinePointer();
  if (!fine) return null;
  return <TargetCursor targetSelector=".cursor-target, a, button" cursorColor={color} cursorColorOnTarget={onTarget || color} size={30} cornerSize={9} thickness={2} spinDuration={3} showLabel={false} />;
}
