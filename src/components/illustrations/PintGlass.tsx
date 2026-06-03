/**
 * Pint glass illustration — Local Lad personality only.
 * Shown via CSS: .pint-glass-icon is display:none by default;
 * html.theme-local-lad .pint-glass-icon sets display:block.
 *
 * When animated=true (AgeGate only), the .glass-animated class applies
 * a gentle 3.5s tilt anchored at the glass base (bottom centre).
 * prefers-reduced-motion disables the animation in globals.css.
 */
export function PintGlass({ animated = false }: { animated?: boolean }) {
  return (
    <span
      className={`pint-glass-icon${animated ? ' glass-animated' : ''}`}
      aria-hidden="true"
    >
      <svg
        style={{ height: 'clamp(80px, 18vh, 160px)', width: 'auto' }}
        viewBox="0 0 16 26"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* foam head */}
        <ellipse cx="8" cy="5" rx="6" ry="3.5" />
        {/* glass body */}
        <path d="M2.5 8 L1.5 22 L14.5 22 L13.5 8 Z" />
        {/* base */}
        <rect x="1.5" y="22" width="13" height="2" rx="1" />
      </svg>
    </span>
  );
}
