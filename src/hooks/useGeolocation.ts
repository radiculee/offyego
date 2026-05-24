'use client';

import { useCallback, useState } from 'react';
import { GEOLOCATION_OPTIONS } from '@/constants/config';
import { logger } from '@/lib/logger';

export type GeolocationCoords = { lat: number; lng: number };

export type GeolocationError =
  | 'PERMISSION_DENIED'
  | 'TIMEOUT'
  | 'POSITION_UNAVAILABLE';

export type GeolocationState =
  | { status: 'idle' }
  | { status: 'requesting' }
  | { status: 'success'; coords: GeolocationCoords }
  | { status: 'error'; error: GeolocationError };

export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({ status: 'idle' });

  const request = useCallback(async () => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setState({ status: 'error', error: 'POSITION_UNAVAILABLE' });
      return;
    }

    setState({ status: 'requesting' });

    if ('permissions' in navigator) {
      try {
        const result = await navigator.permissions.query({
          name: 'geolocation' as PermissionName,
        });
        if (result.state === 'denied') {
          setState({ status: 'error', error: 'PERMISSION_DENIED' });
          return;
        }
      } catch {
        // Permissions API not supported; fall through to getCurrentPosition.
      }
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          status: 'success',
          coords: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
        });
      },
      (error) => {
        let mapped: GeolocationError;
        switch (error.code) {
          case error.PERMISSION_DENIED:
            mapped = 'PERMISSION_DENIED';
            break;
          case error.TIMEOUT:
            mapped = 'TIMEOUT';
            break;
          case error.POSITION_UNAVAILABLE:
          default:
            mapped = 'POSITION_UNAVAILABLE';
            break;
        }
        logger.warn('Geolocation error:', error);
        setState({ status: 'error', error: mapped });
      },
      GEOLOCATION_OPTIONS,
    );
  }, []);

  return { state, request };
}
