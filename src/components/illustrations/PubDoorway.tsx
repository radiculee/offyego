/**
 * Pub doorway silhouette — shown on the READY screen for BOTH personalities.
 *
 * Unlike PendantLamp / PintGlass (which are personality-specific and toggled
 * via CSS display), the doorway always renders. Its fill is a stack of three
 * semi-transparent black shadow tones (frame darkest, door body mid, glass
 * lightest) defined as CSS variables in globals.css. Because the fills are
 * translucent black, the door reads as a shadow over whichever personality
 * background sits behind it: a warm-charcoal shadow on Grumpy Barman, a
 * darker green on Local Lad. Never the accent colour.
 *
 * Static. No animation (the spin button is the moving element on this screen).
 * Decorative only, so aria-hidden.
 *
 * viewBox is 100x220 (~1:2.2 door proportions). Sized by height via clamp so
 * it fills the vertical space below the spin button across phone heights.
 */
export function PubDoorway() {
  return (
    <span className="pub-doorway-icon" aria-hidden="true">
      <svg
        style={{ height: 'clamp(150px, 28vh, 260px)', width: 'auto' }}
        viewBox="0 0 100 220"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* casing / frame — darkest, slightly wider than the door inside it */}
        <rect x="6" y="4" width="88" height="212" rx="2" fill="var(--door-frame)" />
        {/* door panel — mid shadow, inset within the frame */}
        <rect x="14" y="12" width="72" height="198" rx="1" fill="var(--door-fill)" />
        {/* upper glass — two panes split by a mullion, lightest shadow
            (suggests faint light from the street beyond) */}
        <rect x="22" y="22" width="26" height="62" rx="1" fill="var(--door-glass)" />
        <rect x="52" y="22" width="26" height="62" rx="1" fill="var(--door-glass)" />
        {/* handle hint — short vertical push bar, right side, ~60% from top */}
        <rect x="76" y="120" width="3.5" height="26" rx="1.75" fill="var(--door-glass)" />
      </svg>
    </span>
  );
}
