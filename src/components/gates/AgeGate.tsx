'use client';

import { DRINKAWARE_URL } from '@/constants/config';
import { PendantLamp } from '@/components/illustrations/PendantLamp';
import { PintGlass } from '@/components/illustrations/PintGlass';
import type { Voice } from '@/types/pub';

type Props = {
  voice: Voice;
  onAccept: () => void;
};

const SECONDARY_BUTTON =
  'border-border-strong text-fg-primary hover:bg-bg-elevated rounded-md border bg-transparent py-3 text-base font-medium transition-colors duration-150 ease-out';

export function AgeGate({ voice, onAccept }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="w-full max-w-sm space-y-5">
        {/* Both illustrations rendered; CSS show/hide matches the active personality.
            animated=true applies the signature AgeGate animation (swing/tilt).
            Both illustrations are only mounted in this state — they unmount on transition. */}
        <div className="flex justify-center">
          <PendantLamp animated />
          <PintGlass animated />
        </div>
        <p className="text-fg-primary text-base leading-relaxed">
          {voice.ageGateBody}
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            aria-label="I am 18 or older, enter the app"
            onClick={onAccept}
            className={SECONDARY_BUTTON}
          >
            {voice.ageGateButtonAccept}
          </button>
          <button
            type="button"
            aria-label="I am under 18, redirect to Drinkaware"
            onClick={() => window.location.assign(DRINKAWARE_URL)}
            className={SECONDARY_BUTTON}
          >
            {voice.ageGateButtonDecline}
          </button>
        </div>
      </div>
    </div>
  );
}
