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

  // Pick a random error message once on mount. Hook must run before any
  // conditional return. State machine remounts this component on each new
  // error entry (REQUESTING_LOCATION ↔ LOCATION_DENIED branches), so a fresh
  // pick is guaranteed per error.
  const [errorMessage] = useState(() => {
    if (props.status !== 'error') return '';
    const pool = poolFor(voice, props.error);
    return pool[Math.floor(Math.random() * pool.length)] ?? '';
  });

  if (props.status === 'requesting') {
    return <p>{voice.locationRequestingMessage}</p>;
  }

  return (
    <div>
      <p>{errorMessage}</p>
      <button type="button" onClick={props.onRetry}>
        {voice.locationRetryButton}
      </button>
    </div>
  );
}
