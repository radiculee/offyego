/**
 * The challenge pool. One is picked at random and shown on the PubCard.
 *
 * Tone rules:
 *   - Medium-risk, cheeky, social. Drinking dares are fine if light.
 *   - No targeting strangers non-consensually (no "kiss", "photograph", etc.).
 *   - No illegal acts (no theft, no leaving without paying).
 *   - No abuse of staff. Tipping is fine. Mocking is not.
 *   - No driving-related dares.
 *   - Nothing eating-disorder or self-harm adjacent.
 *
 * The introducing line ("Your dare:", "The barman's orders:") comes from
 * the personality's voice file. Do not bake it into the challenge string.
 */
export const CHALLENGES: readonly string[] = [
  // The Guinness category
  "Order a pint of Guinness. Rate the head out of 10. Be honest.",
  "Ask the barman, with a straight face, if their Guinness is any good.",
  "Order a pint of Guinness and time how long it takes to settle. Anything under 119 seconds, complain.",
  "Order Guinness. Take a photo of the shamrock. Show no one.",
  "Order a pint and then loudly mention it tastes different in Dublin. Even if you're in Dublin.",

  // The barman interactions
  "Compliment the barman's pour. Mean it or don't, doesn't matter.",
  "Ask the barman where the nearest other pub is. Then don't go.",
  "Tip the barman two euro. Watch their face very carefully.",
  "Ask the barman for a pub recommendation, then come back here anyway.",
  "Ask the barman what the worst pint they've ever poured was. Listen.",
  "Order something, pause for two full seconds, then say 'and a bag of crisps'.",

  // The seat selection
  "Sit at the bar. Tables are for cowards.",
  "Sit in the snug if there is one. Pretend you're allowed.",
  "Sit at the table closest to the door. Leave whenever you want.",
  "Sit at the table furthest from the door. Commit to the night.",

  // The order
  "Order a small one. Just to confuse them.",
  "Order a whiskey you can't pronounce. Point at the bottle if you have to.",
  "Read the entire whiskey menu out loud before ordering a Heineken.",
  "Order a coffee. Watch the barman die a little inside.",
  "Order a pint of water before your first drink. Pace yourself, ya animal.",
  "Order the same drink the person before you ordered. Even if it's weird.",

  // The social
  "Find a regular. Ask them what the best night of their life was.",
  "Find someone wearing a GAA jersey. Tell them their county is overrated. Run.",
  "Compliment the dog if there is one. Compliment the dog twice if not.",
  "Listen to one full conversation at the next table. Walk away with an opinion on it.",
  "Spot the oldest person in the room. Wonder what stories they have. Don't ask.",

  // The pub itself
  "Read every sign on the wall. Find one that's older than you.",
  "Find the photo of someone famous on the wall. Pretend you know them.",
  "Visit the bathroom. Rate it on a scale of 'grand' to 'never again'.",
  "Count the number of taps. Order the one with the dustiest handle.",
  "Find the oldest piece of furniture in the pub. Sit on it.",
  "Inspect the fireplace. If there's no fire, demand answers.",

  // The traditions
  "Stand for a song if anyone starts one. Don't sing. Just stand.",
  "Buy a round for yourself. Toast no one in particular.",
  "Wait for someone to say 'sláinte'. If no one does, say it yourself, then sigh.",
  "Order a bag of Tayto for the table. Even if you're alone.",
  "If there's a fire, sit by it. If there isn't, that's a sign.",

  // The chaotic
  "Make eye contact with the barman from the door. Hold it for too long.",
  "Take exactly six sips of your pint before saying anything. Build the suspense.",
  "Order a drink. Change your mind. Order the first one again.",
  "Find the quietest corner. Make it yours for at least one drink.",
  "Walk in, scan the room slowly like an action hero, then go to the bar.",

  // The observation
  "Identify the type of pub it is in three words. Be brutal.",
  "Note the music. If it's good, stay. If it's bad, stay anyway.",
  "Count how many people are on their phones. Judge accordingly.",
  "Spot the tourist. Don't be the tourist.",

  // The commitment
  "Stay for at least one full pint before judging. The pub deserves a chance.",
  "If you don't like it, finish the pint anyway. You wanted this.",
  "Drink at the pace of the slowest person near you. Patience is a virtue.",
  "Don't check your phone for the duration of your first drink. The world will wait.",
  "Make a mental note of one thing you'll remember tomorrow. Just one.",
];
