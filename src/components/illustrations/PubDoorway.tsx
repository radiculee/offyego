/**
 * Pub doorway — shown on the READY screen for BOTH personalities.
 *
 * Treatment: a warm cream patch of light, as if spilling through an open
 * doorway. The glass panes and handle are NOT a separate colour; they are
 * cut out of the cream via an SVG mask, so the page background shows through
 * them (near-black on Grumpy Barman, green on Local Lad). Same cream hex for
 * both personalities; only the background revealed through the cutouts differs.
 *
 * Static. No animation (the spin button is the only moving element here).
 * Decorative only, so aria-hidden.
 *
 * viewBox is 100x195 (~1:1.95). Sized by height via clamp with width auto, so
 * it lands at ~380x195 on a 390x844 phone (~45% of viewport height) and scales
 * down on shorter screens without distorting the door proportions.
 */
export function PubDoorway() {
  return (
    <span className="pub-doorway-icon" aria-hidden="true">
      <svg
        style={{ height: 'clamp(280px, 45vh, 480px)', width: 'auto' }}
        viewBox="0 0 100 195"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* white = cream stays, black = hole to the page background */}
          <mask id="pub-doorway-cut">
            <rect x="0" y="0" width="100" height="195" fill="#fff" />
            {/* upper glass — two panes split by a cream mullion */}
            <rect x="18" y="16" width="28" height="62" rx="1.5" fill="#000" />
            <rect x="54" y="16" width="28" height="62" rx="1.5" fill="#000" />
            {/* handle push-bar — right side, ~60% from top */}
            <rect x="80" y="104" width="4" height="26" rx="2" fill="#000" />
          </mask>
        </defs>
        <g mask="url(#pub-doorway-cut)">
          {/* casing / frame — slightly darker cream, wider than the door */}
          <rect x="2" y="2" width="96" height="191" rx="3" fill="var(--door-frame)" />
          {/* door panel — main warm cream */}
          <rect x="8" y="8" width="84" height="181" rx="2" fill="var(--door-fill)" />
        </g>
      </svg>
    </span>
  );
}
