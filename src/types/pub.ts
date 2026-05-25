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
  spinButton: string;
  challengePrefix: string;
  spinAgainButton: string;
  getDirectionsButton: string;
  guiltTripBuyButton: string;
  guiltTripDismissButton: string;
  loadingMessages: string[];
  noPubsFoundButton: string;
  noPubsFoundMessages: string[];
  resultIntros: string[];
  guiltTripMessages: string[];
  outOfIrelandMessages: string[];
  locationDeniedMessages: string[];
  overpassErrorMessages: string[];
};
