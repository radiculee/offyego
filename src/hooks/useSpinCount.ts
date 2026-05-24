'use client';

import { useCallback, useEffect, useState } from 'react';
import { GUILT_TRIP_THRESHOLD } from '@/constants/config';
import { storage } from '@/lib/storage';

export function useSpinCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const stored = storage.get('spinCount');
    if (stored !== null) setCount(stored);
  }, []);

  const increment = useCallback(() => {
    setCount((prev) => {
      const next = prev + 1;
      storage.set('spinCount', next);
      return next;
    });
  }, []);

  const reset = useCallback(() => {
    setCount(0);
    storage.set('spinCount', 0);
  }, []);

  const shouldShowGuiltTrip = count > 0 && count % GUILT_TRIP_THRESHOLD === 0;

  return { count, increment, reset, shouldShowGuiltTrip };
}
