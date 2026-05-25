'use client';

import { useState } from 'react';
import type { GeolocationError } from '@/hooks/useGeolocation';
import type { Voice } from '@/types/pub';

type Props =
  | { status: 'requesting'; voice: Voice }
  | {
      status: 'error';
      error: GeolocationError;
      voice: Voice;
      onRetry: () => void;
    };

function poolFor(voice: Voice, error: GeolocationError): readonly string[] {
  switch (error) {
    case 'PERMISSION_DENIED':
      return voice.locationDeniedMessages;
    case 'TIMEOUT':
      return voice.locationTimeoutMessages;
    case 'POSITION_UNAVAILABLE':
      return voice.locationUnavailableMessages;
  }
}

export function LocationGate(props: Props) {
  const { voice } = props;

  const [errorMessage] = useState(() => {
    if (props.status !== 'error') return '';
    const pool = poolFor(voice, props.error);
    return pool[Math.floor(Math.random() * pool.length)] ?? '';
  });

  if (props.status === 'requesting') {
    return (
      <div className="flex flex-1 flex-col items-center justify-center text-center">
        <p className="text-fg-primary max-w-xs text-base leading-relaxed">
          {voice.locationRequestingMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <div className="w-full max-w-xs space-y-5">
        <p className="text-fg-primary text-base leading-relaxed">
          {errorMessage}
        </p>
        <button
          type="button"
          onClick={props.onRetry}
          className="border-border-strong text-fg-primary hover:bg-bg-elevated w-full rounded-md border bg-transparent py-4 text-base font-medium transition-colors duration-150 ease-out"
        >
          {voice.locationRetryButton}
        </button>
      </div>
    </div>
  );
}
