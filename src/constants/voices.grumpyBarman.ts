import type { Voice } from '@/types/pub';

/**
 * The Grumpy Barman.
 *
 * Mood: tired, low patience, has seen it all, doesn't want to be here.
 * Father Jack energy, dialled down to roughly half. Short sentences.
 * He's not insulting you specifically — he's annoyed at the species.
 *
 * Tone rules:
 *   - Short. Rarely more than 12 words.
 *   - No exclamation marks (he doesn't have the energy).
 *   - No emoji. No em-dashes.
 *   - Dry, observational, occasionally bleak.
 */
export const grumpyBarmanVoice: Voice = {
  spinButton: 'Get on with it',
  challengePrefix: "The barman's orders:",
  spinAgainButton: 'Spin Again',
  getDirectionsButton: 'Get Directions',
  guiltTripBuyButton: 'Buy a Pint (€5)',
  guiltTripDismissButton: "I'm just a cheapskate",

  loadingMessages: [
    "Aye. Hold on.",
    "I'm looking. Keep your hair on.",
    "These pubs aren't going anywhere. Neither am I.",
    "Checking. Don't rush me.",
    "Some of these places are too good for you. Filtering them out.",
    "Right, where are we sending you now.",
    "Patience. It's a virtue. You haven't got it.",
    "Counting the taps. Stop hovering.",
    "Looking. The longer you wait, the better it gets. Probably.",
    "Working on it. Try sitting down.",
  ],

  noPubsFoundButton: 'Widen the search',

  noPubsFoundMessages: [
    "Nothing. Try a bigger circle. Or move.",
    "No pubs. You're either in a field or a graveyard.",
    "Zero. Are you sure you're in Ireland? Genuinely.",
    "Empty. Widen the search before I lose interest.",
    "Nothing nearby. The countryside is harsh and so am I.",
    "No pubs at that radius. Stretch your legs and try again.",
    "Dry well. Either move or expand the slider.",
    "Nothing's coming up. I blame you, not the data.",
    "No pubs here. Whoever planned this town hates joy.",
    "Empty. Slide that bar up and we'll try once more.",
  ],

  resultIntros: [
    "Off ye go.",
    "Here. Off ye go. Don't make a scene.",
    "This one. Off ye go.",
    "Right. Off ye go, then.",
    "Found one. Off ye go.",
    "Off ye go. Try not to embarrass anyone.",
    "Off ye go. And don't come back complaining.",
    "Here you are. Off ye go.",
    "Off ye go. Tip the barman. Not me.",
    "Off ye go. The clock's ticking.",
  ],

  guiltTripMessages: [
    "Five spins. Five. You're harder to please than my mother in law. Throw the dev a pint.",
    "I've watched you reject five pubs. Buy the lad behind this app a pint and have a word with yourself.",
    "Five. In my day we walked into the first pub we saw. Pay the man.",
    "You've used five spins picking nothing. That's not indecision, that's a hobby. Donate.",
    "Five rejections. Even I'd have served you by now. Buy the dev a pint.",
    "Five pubs. None good enough. The dev's still here though. Pay him.",
    "Picky, picky. Five times. Throw a few quid the developer's way.",
    "Five spins, no commitment. Marriage material, you. The dev would like a pint.",
    "Five. I'd have closed the bar by now. Donate so the lad can afford pints of his own.",
    "Five rejections in. The dev's electricity isn't free. Help him out.",
  ],

  outOfIrelandMessages: [
    "You're not in Ireland. We don't serve your kind. Off ye go.",
    "Wrong country. Come back when you've crossed the sea.",
    "Not Ireland. Not interested. Door's behind you.",
    "You're abroad. The pubs here don't know you. Neither do I.",
    "Out of bounds. This app's for people on the right island.",
    "Geography failed you. Try Ireland next time.",
    "Wrong soil. We grow shamrocks here, not whatever you're standing on.",
    "You're not in the Republic. Come back when you are. Bring cash.",
    "No. Not in Ireland. No exceptions. Don't ask.",
    "Wrong coordinates. Book a flight. Try again Tuesday.",
  ],

  locationDeniedMessages: [
    "Won't say where you are? Then I won't say where to go. We're done.",
    "No location, no pub. That's the deal. Take it or leave.",
    "I can't send you to a pub if you won't say where you're standing. Use your head.",
    "Location off. So am I. Turn it back on.",
    "No coordinates, no craic. Enable location.",
    "If you won't share, I won't help. Simple.",
    "The app needs your location. The app does not need your trust issues.",
    "Permission denied. So is service. Fix it and try again.",
    "I'm not a mind reader. Enable location.",
    "No location. No service. There's the door.",
  ],

  // Phase 5: expand to 10 variants.
  overpassErrorMessages: [
    "The map server's down. Not my problem. Try in a bit.",
    "Overpass is asleep. So am I. Try later.",
    "Data's offline. The pubs are still there, but I can't see them.",
  ],
};
