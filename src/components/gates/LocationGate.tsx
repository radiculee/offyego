'use client';

import type { GeolocationError } from '@/hooks/useGeolocation';

type Props =
  | { status: 'requesting' }
  | { status: 'error'; error: GeolocationError; onRetry: () => void };

const ERROR_COPY: Record<GeolocationError, string> = {
  PERMISSION_DENIED:
    "We can't pick a pub if you won't tell us where you are. Enable location and try again.",
  TIMEOUT: 'Your phone is being shy. Try again.',
  POSITION_UNAVAILABLE: 'GPS is having a moment. Try again in a sec.',
};

export function LocationGate(props: Props) {
  if (props.status === 'requesting') {
    return <p>Asking your phone where you are...</p>;
  }

  return (
    <div>
      <p>{ERROR_COPY[props.error]}</p>
      <button type="button" onClick={props.onRetry}>
        Try again
      </button>
    </div>
  );
}
