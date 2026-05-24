'use client';

import { useEffect, useRef, useState } from 'react';
import type { Pub } from '@/types/pub';

type Props = {
  pubs: readonly Pub[];
  onSettled: (pub: Pub) => void;
};

const FAST_INTERVAL_MS = 80;
const FAST_DURATION_MS = 1500;
// Last four ticks ramp the delay up before settling.
const DECELERATION_DELAYS_MS = [120, 180, 250, 400] as const;

// TODO(phase-4): replace with useVoiceMessage() hook
function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function Roulette({ pubs, onSettled }: Props) {
  const [displayName, setDisplayName] = useState<string>(
    () => pubs[0]?.name ?? '',
  );
  // Keep latest onSettled in a ref so we can run the effect once on mount
  // without restarting the animation when the parent re-renders.
  const onSettledRef = useRef(onSettled);
  useEffect(() => {
    onSettledRef.current = onSettled;
  });

  useEffect(() => {
    if (pubs.length === 0) return;

    // Pick the final landing pub up front so the animation just settles on it.
    const finalPub = pickRandom(pubs);

    if (prefersReducedMotion()) {
      setDisplayName(finalPub.name);
      onSettledRef.current(finalPub);
      return;
    }

    const fastTickCount = Math.floor(FAST_DURATION_MS / FAST_INTERVAL_MS);
    let tickIndex = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;

    const tick = () => {
      if (tickIndex < fastTickCount) {
        setDisplayName(pickRandom(pubs).name);
        tickIndex += 1;
        timer = setTimeout(tick, FAST_INTERVAL_MS);
        return;
      }

      const decelIndex = tickIndex - fastTickCount;
      if (decelIndex < DECELERATION_DELAYS_MS.length) {
        setDisplayName(pickRandom(pubs).name);
        tickIndex += 1;
        timer = setTimeout(tick, DECELERATION_DELAYS_MS[decelIndex]);
        return;
      }

      setDisplayName(finalPub.name);
      onSettledRef.current(finalPub);
    };

    timer = setTimeout(tick, FAST_INTERVAL_MS);

    return () => {
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentionally run once per mount; pubs is stable while SPINNING
  }, []);

  return <div aria-live="polite">{displayName}</div>;
}
