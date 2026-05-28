import type { Voice } from '@/types/pub';

/**
 * The Local Lad.
 *
 * Mood: chaotic, friendly, runs his mouth, knows everyone. You're now in
 * his story whether you like it or not. He'll get you to the pub, but
 * you're hearing about his cousin on the way.
 *
 * Tone rules:
 *   - Longer than the Grumpy Barman, but still punchy.
 *   - "Ya", "lad", "feckin'", "grand", "the craic" are fair game.
 *   - One exclamation mark per line at most. Use them sparingly.
 *   - No emoji. No em-dashes.
 *   - He's positive about you. He's just a lot.
 */
export const localLadVoice: Voice = {
  brandMark: 'Off Ye Go',
  ageGateBody:
    'This app is for people over 18 with a sense of humour. If neither applies, the door is behind you.',
  ageGateButtonAccept: "I'm 18+",
  ageGateButtonDecline: "I'm under 18",
  spinButton: "Spin the feckin' wheel",
  spinAgainButton: 'Spin Again',
  getDirectionsButton: 'Get Directions',
  guiltTripBuyButton: 'Buy a Pint (€5)',
  guiltTripDismissButton: "I'm just a cheapskate",
  locationRequestingMessage: "Hold on lad, askin' yer phone where ya are.",
  locationRetryButton: 'Give it another bash',
  radiusSliderLabel: 'Find me a pub within {walkTime} walk, lad',

  loadingMessages: [
    "Hold on now, finding somewhere with a bit of life...",
    "Right, scanning the area. Few decent spots round here.",
    "Checking if anywhere has a fire lit...",
    "Hold tight, I know a spot. Few spots. Loads of spots.",
    "Looking. My cousin used to work in one of these.",
    "One sec, asking around in me head.",
    "Easy now. The good ones don't come up first.",
    "Patience, lad. I'm finding ya somewhere class.",
    "Rifling through the options. Most of 'em are grand.",
    "Sorting the wheat from the chaff. Mostly chaff to be fair.",
  ],

  noPubsFoundButton: 'Try a wider net',

  noPubsFoundMessages: [
    "Ah here, nothing 'round here? Stretch that radius, lad.",
    "Not a sausage. Try widening the search, ya melt.",
    "Zero pubs. Where are ya, the moon?",
    "Nothing. The Wi-Fi's bringing me bad news. Try again wider.",
    "No spots in that range. Bigger circle, better odds.",
    "Empty. Either you're in a bog or the slider's too tight.",
    "Nothing came up. Slide it out a touch and we'll go again.",
    "Ah no. Dead zone. Pull the radius up and we'll have another go.",
    "Nada. The map's lookin' at me funny. Try a wider net.",
    "Nothing nearby. The pubs are hidin' from ya. Widen up.",
  ],

  resultIntros: [
    "Right, off ye go!",
    "Got it. Off ye go, lad.",
    "This one. Off ye go, ya legend.",
    "Sorted. Off ye go!",
    "Found a beauty. Off ye go.",
    "Here's your spot. Off ye go and enjoy yourself.",
    "Off ye go! Tell 'em I sent ya. They won't know who I am.",
    "Off ye go. First round's on you.",
    "There we are. Off ye go. Don't be late.",
    "Off ye go, lad. Don't do anything I wouldn't do.",
  ],

  guiltTripMessages: [
    "Five spins, lad! Yer worse than a tourist looking for leprechauns. Throw the dev a few quid?",
    "Ah here, five pubs and none good enough? Buy the dev a pint, ya cheapskate.",
    "Five spins! The dev's been spinning with ya the whole time. Pay him for the company.",
    "Five! I've made fewer decisions getting married. Toss the dev a pint?",
    "Lad, that's five. The pubs are starting to take it personally. Donate, will ya?",
    "Five rejections! The dev built this app and you can't pick a feckin' pub. Pints aren't free.",
    "Five spins in! I'm getting tired just watching. Few bob for the developer?",
    "Five! Ya picky article. The lad who built this would love a pint, you know.",
    "Five pubs, all binned. The dev's not made of money. Throw him a euro.",
    "Five! The barman's pouring his own pint at this stage. Buy the dev one too.",
  ],

  outOfIrelandMessages: [
    "Ah lad, you're miles off! Get yerself to the Republic first.",
    "Yer not in Ireland. We can't be doing pints abroad. Come home.",
    "Look at the state of ya, all the way over there. Get back on the island.",
    "Wrong soil, lad. We do shamrocks, not whatever you've got going on.",
    "You're abroad! The app doesn't travel. Neither should you. Come back.",
    "Out of range, ya gallivanter. Republic of Ireland only.",
    "Not on the island, are ya? Awful behaviour. Come back.",
    "You're somewhere foreign and I don't like it. Get yerself to Ireland.",
    "Wrong country, lad. Book a flight. Bring me back a bag of Tayto.",
    "Yer not in Ireland. The pubs here don't even know yer coming. Sort it out.",
  ],

  locationDeniedMessages: [
    "Ah lad, ya gotta tell me where ya are. Otherwise we're just chattin'.",
    "No location, no pub. That's the rules. Switch it on.",
    "Can't help ya if ya won't tell me where ya are. Don't be shy now.",
    "Yer keeping yer location secret? From me? Yer one and only app guide?",
    "Switch the location on, lad. I'm not guessing. Could send ya to Cork.",
    "No GPS, no plan. Flip it on and we're off.",
    "Lad, I need yer coordinates. I'm not a wizard. Enable location.",
    "Won't share yer location? Fair enough. We're done here.",
    "Turn on location, lad. I promise I'm not selling it. Probably.",
    "Yer location's off. So is the spin button. Enable and we're back in business.",
  ],

  locationTimeoutMessages: [
    "Ah lad, yer phone took its sweet time. Try again.",
    "Timed out on us. Tap it again, will ya.",
    "Yer phone's gone for a wander. Give it another go.",
  ],

  locationUnavailableMessages: [
    "GPS can't find ya, lad. Try standin' near a window.",
    "Yer phone's lost. Aren't we all. Give it another bash.",
    "No fix on yer location. Step outside and we'll try again.",
  ],

  notFoundMessages: [
    "Ah here, wrong page lad. No pub down this road.",
    "Yer lost! Head back to where ya came from.",
    "Nothin' for ya here. Back to the start, lad.",
  ],

  // Phase 5: expand to 10 variants.
  overpassErrorMessages: [
    "Ah lad, the map's having a moment. Give it a minute.",
    "Server's gone for a pint itself. Try again in a sec.",
    "The internet's broken. Not yer fault. Probably.",
  ],
};
