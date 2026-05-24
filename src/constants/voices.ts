import type { Personality, Voice } from '@/types/pub';
import { grumpyBarmanVoice } from './voices.grumpyBarman';
import { localLadVoice } from './voices.localLad';

export const voices: Record<Personality, Voice> = {
  GRUMPY_BARMAN: grumpyBarmanVoice,
  LOCAL_LAD: localLadVoice,
};
