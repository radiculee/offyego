'use client';

import { useEffect, useReducer, useState } from 'react';
import { AgeGate } from '@/components/gates/AgeGate';
import { IrelandGate } from '@/components/gates/IrelandGate';
import { LocationGate } from '@/components/gates/LocationGate';
import { Shell } from '@/components/layout/Shell';
import { GuiltTripModal } from '@/components/modals/GuiltTripModal';
import { PubCard } from '@/components/roulette/PubCard';
import { Roulette } from '@/components/roulette/Roulette';
import { PersonalityToggle } from '@/components/ui/PersonalityToggle';
import { RadiusSlider } from '@/components/ui/RadiusSlider';
import { SpinButton } from '@/components/ui/SpinButton';
import { CHALLENGES } from '@/constants/challenges';
import { RADIUS_DEFAULT_KM } from '@/constants/config';
import {
  useGeolocation,
  type GeolocationCoords,
  type GeolocationError,
} from '@/hooks/useGeolocation';
import { usePersonality } from '@/hooks/usePersonality';
import { useSpinCount } from '@/hooks/useSpinCount';
import { fetchWalkingMinutes } from '@/lib/directions';
import { isInIreland } from '@/lib/ireland-polygon';
import { logger } from '@/lib/logger';
import { fetchPubs } from '@/lib/overpass';
import type { Pub } from '@/types/pub';

type NoPubsReason = 'EMPTY' | 'ERROR';

type State =
  | { kind: 'AGE_GATE' }
  | { kind: 'REQUESTING_LOCATION' }
  | { kind: 'LOCATION_DENIED'; error: GeolocationError }
  | { kind: 'OUT_OF_IRELAND' }
  | { kind: 'READY'; coords: GeolocationCoords }
  | {
      kind: 'SPINNING';
      coords: GeolocationCoords;
      radiusM: number;
      pubs?: readonly Pub[];
    }
  | { kind: 'NO_PUBS_FOUND'; coords: GeolocationCoords; reason: NoPubsReason; messageIndex: number }
  | {
      kind: 'FETCHING_WALKING_TIME';
      coords: GeolocationCoords;
      pubs: readonly Pub[];
      pickedPub: Pub;
      challengeIndex: number;
    }
  | {
      kind: 'RESULT';
      coords: GeolocationCoords;
      pubs: readonly Pub[];
      pickedPub: Pub;
      challengeIndex: number;
    };

type Action =
  | { type: 'ACCEPT_AGE' }
  | { type: 'LOCATION_ERROR'; error: GeolocationError }
  | { type: 'LOCATION_SUCCESS'; coords: GeolocationCoords }
  | { type: 'RETRY_LOCATION' }
  | { type: 'START_SPIN'; radiusM: number }
  | { type: 'SPIN_FETCH_SUCCESS'; pubs: readonly Pub[]; messageIndex: number }
  | { type: 'SPIN_FETCH_ERROR'; messageIndex: number }
  | { type: 'SPIN_SETTLED'; pickedPub: Pub; challengeIndex: number }
  | { type: 'DIRECTIONS_RESULT'; walkingMinutes: number; isEstimate: boolean }
  | { type: 'SPIN_AGAIN'; radiusM: number }
  | { type: 'BACK_TO_READY' };

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
    case 'START_SPIN':
      if (state.kind !== 'READY') return state;
      return { kind: 'SPINNING', coords: state.coords, radiusM: action.radiusM };
    case 'SPIN_FETCH_SUCCESS':
      if (state.kind !== 'SPINNING') return state;
      if (action.pubs.length === 0) {
        return { kind: 'NO_PUBS_FOUND', coords: state.coords, reason: 'EMPTY', messageIndex: action.messageIndex };
      }
      return { ...state, pubs: action.pubs };
    case 'SPIN_FETCH_ERROR':
      if (state.kind !== 'SPINNING') return state;
      return { kind: 'NO_PUBS_FOUND', coords: state.coords, reason: 'ERROR', messageIndex: action.messageIndex };
    case 'SPIN_SETTLED':
      if (state.kind !== 'SPINNING' || !state.pubs) return state;
      return {
        kind: 'FETCHING_WALKING_TIME',
        coords: state.coords,
        pubs: state.pubs,
        pickedPub: action.pickedPub,
        challengeIndex: action.challengeIndex,
      };
    case 'DIRECTIONS_RESULT':
      if (state.kind !== 'FETCHING_WALKING_TIME') return state;
      return {
        kind: 'RESULT',
        coords: state.coords,
        pubs: state.pubs,
        pickedPub: {
          ...state.pickedPub,
          walkingMinutes: action.walkingMinutes,
          walkingTimeIsEstimate: action.isEstimate,
        },
        challengeIndex: state.challengeIndex,
      };
    case 'SPIN_AGAIN':
      if (state.kind !== 'RESULT') return state;
      // Re-use cached pubs — no Overpass re-fetch (fetch effect skips when pubs defined).
      return { kind: 'SPINNING', coords: state.coords, radiusM: action.radiusM, pubs: state.pubs };
    case 'BACK_TO_READY':
      if (state.kind !== 'RESULT' && state.kind !== 'NO_PUBS_FOUND') return state;
      return { kind: 'READY', coords: state.coords };
    default:
      return state;
  }
}

export default function Page() {
  const [state, dispatch] = useReducer(reducer, { kind: 'AGE_GATE' });
  const { state: geoState, request: requestLocation } = useGeolocation();
  const { voice } = usePersonality();
  const {
    increment: incrementSpinCount,
    reset: resetSpinCount,
    shouldShowGuiltTrip,
  } = useSpinCount();
  const [radiusKm, setRadiusKm] = useState<number>(RADIUS_DEFAULT_KM);
  const [guiltModalOpen, setGuiltModalOpen] = useState(false);

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

  // Overpass fetch fires whenever SPINNING is entered without pubs.
  useEffect(() => {
    if (state.kind !== 'SPINNING' || state.pubs !== undefined) return;
    let cancelled = false;
    const { lat, lng } = state.coords;
    const radiusM = state.radiusM;
    const noPubsPoolLen = voice.noPubsFoundMessages.length;
    const errorPoolLen = voice.overpassErrorMessages.length;
    (async () => {
      try {
        const pubs = await fetchPubs({ lat, lng, radiusM });
        if (cancelled) return;
        const messageIndex = Math.floor(Math.random() * noPubsPoolLen);
        dispatch({ type: 'SPIN_FETCH_SUCCESS', pubs, messageIndex });
      } catch (err) {
        if (cancelled) return;
        logger.error('Overpass fetch failed (both mirrors):', err);
        const messageIndex = Math.floor(Math.random() * errorPoolLen);
        dispatch({ type: 'SPIN_FETCH_ERROR', messageIndex });
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [state, voice]);

  // Directions call fires once per spin, on the final settled pub.
  useEffect(() => {
    if (state.kind !== 'FETCHING_WALKING_TIME') return;
    let cancelled = false;
    const { coords, pickedPub } = state;
    void (async () => {
      const result = await fetchWalkingMinutes(
        { lat: coords.lat, lng: coords.lng },
        { lat: pickedPub.lat, lng: pickedPub.lng },
        pickedPub.walkingMinutes,
      );
      if (cancelled) return;
      dispatch({
        type: 'DIRECTIONS_RESULT',
        walkingMinutes: result.walkingMinutes,
        isEstimate: result.kind === 'fallback',
      });
    })();
    return () => {
      cancelled = true;
    };
  }, [state]);

  useEffect(() => {
    if (shouldShowGuiltTrip && state.kind === 'RESULT') {
      setGuiltModalOpen(true);
    }
  }, [shouldShowGuiltTrip, state.kind]);

  const handleSpin = () => {
    if (state.kind !== 'READY') return;
    incrementSpinCount();
    dispatch({ type: 'START_SPIN', radiusM: Math.round(radiusKm * 1000) });
  };

  const handleSpinAgain = () => {
    if (state.kind !== 'RESULT') return;
    setGuiltModalOpen(false);
    incrementSpinCount();
    dispatch({ type: 'SPIN_AGAIN', radiusM: Math.round(radiusKm * 1000) });
  };

  const handleGetDirections = () => {
    if (state.kind !== 'RESULT') return;
    resetSpinCount();
    setGuiltModalOpen(false);
    window.open(
      `https://www.google.com/maps/dir/?api=1&destination=${state.pickedPub.lat},${state.pickedPub.lng}`,
      '_blank',
      'noopener,noreferrer',
    );
  };

  const handleBuyPint = () => {
    // The modal's primary action is a styled <a target="_blank"> that handles
    // navigation; we just close the modal on click.
    setGuiltModalOpen(false);
  };

  return (
    <Shell>
      <div className="flex flex-col items-center">
        <span className="pint-glass-icon mb-2" aria-hidden="true">
          <svg width="16" height="26" viewBox="0 0 16 26" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="8" cy="5" rx="6" ry="3.5"/>
            <path d="M2.5 8 L1.5 22 L14.5 22 L13.5 8 Z"/>
            <rect x="1.5" y="22" width="13" height="2" rx="1"/>
          </svg>
        </span>
        <h1 className="font-display text-fg-primary text-3xl font-bold tracking-tight">
          {voice.brandMark}
        </h1>
      </div>

      {state.kind === 'AGE_GATE' && (
        <AgeGate
          voice={voice}
          onAccept={() => dispatch({ type: 'ACCEPT_AGE' })}
        />
      )}

      {state.kind === 'REQUESTING_LOCATION' && (
        <LocationGate status="requesting" voice={voice} />
      )}

      {state.kind === 'LOCATION_DENIED' && (
        <LocationGate
          status="error"
          error={state.error}
          voice={voice}
          onRetry={() => {
            dispatch({ type: 'RETRY_LOCATION' });
            void requestLocation();
          }}
        />
      )}

      {state.kind === 'OUT_OF_IRELAND' && <IrelandGate voice={voice} />}

      {state.kind === 'READY' && (
        <div className="space-y-6">
          <PersonalityToggle />
          <RadiusSlider voice={voice} value={radiusKm} onChange={setRadiusKm} />
          <SpinButton label={voice.spinButton} onClick={handleSpin} />
        </div>
      )}

      {state.kind === 'SPINNING' && (
        <div className="space-y-6">
          <RadiusSlider
            voice={voice}
            value={radiusKm}
            onChange={setRadiusKm}
            disabled
          />
          {state.pubs === undefined ? (
            <SpinButton
              label={voice.spinButton}
              onClick={() => {}}
              loading
              disabled
            />
          ) : (
            <Roulette
              pubs={state.pubs}
              onSettled={(pickedPub) => {
                const challengeIndex = Math.floor(Math.random() * CHALLENGES.length);
                dispatch({ type: 'SPIN_SETTLED', pickedPub, challengeIndex });
              }}
            />
          )}
        </div>
      )}

      {state.kind === 'FETCHING_WALKING_TIME' && (
        <div className="space-y-6">
          <RadiusSlider
            voice={voice}
            value={radiusKm}
            onChange={setRadiusKm}
            disabled
          />
          <div
            aria-live="polite"
            className="text-fg-primary py-8 text-center text-2xl font-semibold"
          >
            {state.pickedPub.name}
          </div>
        </div>
      )}

      {state.kind === 'NO_PUBS_FOUND' && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="w-full max-w-xs space-y-5">
            <p className="text-fg-primary text-base leading-relaxed">
              {state.reason === 'EMPTY'
                ? voice.noPubsFoundMessages[state.messageIndex % voice.noPubsFoundMessages.length]
                : voice.overpassErrorMessages[state.messageIndex % voice.overpassErrorMessages.length]}
            </p>
            <button
              type="button"
              onClick={() => dispatch({ type: 'BACK_TO_READY' })}
              className="border-border-strong text-fg-primary hover:bg-bg-elevated w-full rounded-md border bg-transparent py-4 text-base font-medium transition-colors duration-150 ease-out"
            >
              {voice.noPubsFoundButton}
            </button>
          </div>
        </div>
      )}

      {state.kind === 'RESULT' && (
        <>
          <PubCard
            pub={state.pickedPub}
            challenge={CHALLENGES[state.challengeIndex % CHALLENGES.length] ?? ''}
            spinAgainLabel={voice.spinAgainButton}
            getDirectionsLabel={voice.getDirectionsButton}
            onGetDirections={handleGetDirections}
            onSpinAgain={handleSpinAgain}
          />
          {guiltModalOpen && (
            <GuiltTripModal
              voice={voice}
              onClose={() => setGuiltModalOpen(false)}
              onBuyPint={handleBuyPint}
            />
          )}
        </>
      )}
    </Shell>
  );
}
