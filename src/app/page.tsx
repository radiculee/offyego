'use client';

import { useEffect, useReducer } from 'react';
import { AgeGate } from '@/components/gates/AgeGate';
import { IrelandGate } from '@/components/gates/IrelandGate';
import { LocationGate } from '@/components/gates/LocationGate';
import { Shell } from '@/components/layout/Shell';
import {
  useGeolocation,
  type GeolocationCoords,
  type GeolocationError,
} from '@/hooks/useGeolocation';
import { isInIreland } from '@/lib/ireland-polygon';

type State =
  | { kind: 'AGE_GATE' }
  | { kind: 'REQUESTING_LOCATION' }
  | { kind: 'LOCATION_DENIED'; error: GeolocationError }
  | { kind: 'OUT_OF_IRELAND' }
  | { kind: 'READY'; coords: GeolocationCoords };

type Action =
  | { type: 'ACCEPT_AGE' }
  | { type: 'LOCATION_ERROR'; error: GeolocationError }
  | { type: 'LOCATION_SUCCESS'; coords: GeolocationCoords }
  | { type: 'RETRY_LOCATION' };

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case 'ACCEPT_AGE':
      return { kind: 'REQUESTING_LOCATION' };
    case 'LOCATION_ERROR':
      return { kind: 'LOCATION_DENIED', error: action.error };
    case 'LOCATION_SUCCESS':
      if (!isInIreland(action.coords.lat, action.coords.lng)) {
        return { kind: 'OUT_OF_IRELAND' };
      }
      return { kind: 'READY', coords: action.coords };
    case 'RETRY_LOCATION':
      return { kind: 'REQUESTING_LOCATION' };
    default:
      return state;
  }
}

export default function Page() {
  const [state, dispatch] = useReducer(reducer, { kind: 'AGE_GATE' });
  const { state: geoState, request: requestLocation } = useGeolocation();

  useEffect(() => {
    if (state.kind === 'REQUESTING_LOCATION' && geoState.status === 'idle') {
      void requestLocation();
    }
  }, [state.kind, geoState.status, requestLocation]);

  useEffect(() => {
    if (geoState.status === 'success') {
      dispatch({ type: 'LOCATION_SUCCESS', coords: geoState.coords });
    } else if (geoState.status === 'error') {
      dispatch({ type: 'LOCATION_ERROR', error: geoState.error });
    }
  }, [geoState]);

  return (
    <Shell>
      <h1>Off Ye Go</h1>

      {state.kind === 'AGE_GATE' && (
        <AgeGate onAccept={() => dispatch({ type: 'ACCEPT_AGE' })} />
      )}

      {state.kind === 'REQUESTING_LOCATION' && (
        <LocationGate status="requesting" />
      )}

      {state.kind === 'LOCATION_DENIED' && (
        <LocationGate
          status="error"
          error={state.error}
          onRetry={() => {
            dispatch({ type: 'RETRY_LOCATION' });
            void requestLocation();
          }}
        />
      )}

      {state.kind === 'OUT_OF_IRELAND' && <IrelandGate />}

      {state.kind === 'READY' && (
        <div>
          <p>READY (placeholder)</p>
          <p>
            Coords: {state.coords.lat.toFixed(4)}, {state.coords.lng.toFixed(4)}
          </p>
        </div>
      )}
    </Shell>
  );
}
