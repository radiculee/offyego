/**
 * Pendant lamp illustration — Grumpy Barman personality only.
 * Shown via CSS: .pendant-lamp-icon is display:none by default;
 * html.theme-grumpy-barman .pendant-lamp-icon sets display:block.
 *
 * When animated=true (AgeGate only), the .lamp-animated class applies
 * a gentle 4.5s swing anchored at the cord attachment (top centre).
 * prefers-reduced-motion disables the animation in globals.css.
 */
export function PendantLamp({ animated = false }: { animated?: boolean }) {
  return (
    <span
      className={`pendant-lamp-icon${animated ? ' lamp-animated' : ''}`}
      aria-hidden="true"
    >
      <svg
        style={{ height: 'clamp(80px, 18vh, 160px)', width: 'auto' }}
        viewBox="0 0 16 26"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* cord */}
        <rect x="7.5" y="0" width="1" height="8" rx="0.5" />
        {/* lampshade */}
        <path d="M4.5 8 L2.5 18 L13.5 18 L11.5 8 Z" />
        {/* bottom ring */}
        <rect x="2.5" y="18" width="11" height="1.5" rx="0.75" />
        {/* light pool / glow halo */}
        <ellipse cx="8" cy="23" rx="4.5" ry="1.8" opacity="0.35" />
      </svg>
    </span>
  );
}
