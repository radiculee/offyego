'use client';

import { useCallback, useEffect, useState } from 'react';
import { voices } from '@/constants/voices';
import { storage } from '@/lib/storage';
import type { Personality, Voice } from '@/types/pub';

const DEFAULT_PERSONALITY: Personality = 'GRUMPY_BARMAN';

export function usePersonality() {
  const [personality, setPersonalityState] = useState<Personality>(
    DEFAULT_PERSONALITY,
  );

  useEffect(() => {
    const stored = storage.get('personality');
    if (stored !== null) setPersonalityState(stored);
  }, []);

  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const next =
      personality === 'LOCAL_LAD' ? 'theme-local-lad' : 'theme-grumpy-barman';
    const other =
      personality === 'LOCAL_LAD' ? 'theme-grumpy-barman' : 'theme-local-lad';
    root.classList.remove(other);
    root.classList.add(next);
  }, [personality]);

  const setPersonality = useCallback((next: Personality) => {
    setPersonalityState(next);
    storage.set('personality', next);
  }, []);

  const voice: Voice = voices[personality];

  return { personality, setPersonality, voice };
}
