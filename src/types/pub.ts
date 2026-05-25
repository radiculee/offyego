export type Pub = {
  id: number;
  name: string;
  lat: number;
  lng: number;
  distanceMeters: number;
  walkingMinutes: number;
};

export type Personality = 'GRUMPY_BARMAN' | 'LOCAL_LAD';

export type Voice = {
  /** Brand wordmark. Identical across personalities; routed through
   *  voice anyway because the project rule is "no hardcoded English
   *  in components", full stop. */
  brandMark: string;
  /** Age gate body. Identical across personalities — spec §6.1 mandates
   *  the same legal-ish copy regardless of voice. */
  ageGateBody: string;
  /** Age gate accept button. Identical across personalities (see
   *  ageGateBody). */
  ageGateButton: string;
  spinButton: string;
  challengePrefix: string;
  spinAgainButton: string;
  getDirectionsButton: string;
  guiltTripBuyButton: string;
  guiltTripDismissButton: string;
  locationRequestingMessage: string;
  locationRetryButton: string;
  /** Slider label. Must contain the `{value}` placeholder; the
   *  component substitutes the current radius at render time. */
  radiusSliderLabel: string;
  loadingMessages: string[];
  noPubsFoundButton: string;
  noPubsFoundMessages: string[];
  resultIntros: string[];
  guiltTripMessages: string[];
  outOfIrelandMessages: string[];
  locationDeniedMessages: string[];
  locationTimeoutMessages: readonly string[];
  locationUnavailableMessages: readonly string[];
  notFoundMessages: readonly string[];
  overpassErrorMessages: string[];
};
