'use client';

import type { Voice } from '@/types/pub';

type Props = {
  voice: Voice;
  onAccept: () => void;
};

export function AgeGate({ voice, onAccept }: Props) {
  return (
    <div>
      <p>{voice.ageGateBody}</p>
      <button type="button" onClick={onAccept}>
        {voice.ageGateButton}
      </button>
    </div>
  );
}
