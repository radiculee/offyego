'use client';

import type { Voice } from '@/types/pub';

type Props = {
  voice: Voice;
  onAccept: () => void;
};

export function AgeGate({ voice, onAccept }: Props) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="w-full max-w-xs space-y-5">
        <p className="text-fg-primary text-base leading-relaxed">
          {voice.ageGateBody}
        </p>
        <button
          type="button"
          onClick={onAccept}
          className="bg-fg-accent text-bg-page w-full rounded-md py-4 text-base font-medium transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.98]"
        >
          {voice.ageGateButton}
        </button>
      </div>
    </div>
  );
}
