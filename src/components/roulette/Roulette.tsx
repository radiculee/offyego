'use client';

import { useEffect, useRef, useState } from 'react';
import { computeSettleDelayMs } from '@/lib/spin-timing';
import type { Pub } from '@/types/pub';

type Props = {
  // undefined while Overpass is still fetching; defined once results arrive.
  pubs: readonly Pub[] | undefined;
  onSettled: (pub: Pub) => void;
};

const GIF_SRC = '/spin/stout-pour.gif';
const FAST_INTERVAL_MS = 80;
// Final approach: each name held a little longer, last one ~400ms before settle.
const DECEL_DELAYS_MS = [120, 180, 250, 400] as const;
const DECEL_TOTAL_MS = DECEL_DELAYS_MS.reduce((a, b) => a + b, 0);

function pickRandom<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function Roulette({ pubs, onSettled }: Props) {
  // Read once on mount; the spin's whole lifetime uses this single value.
  const [reducedMotion] = useState(prefersReducedMotion);
  const [displayName, setDisplayName] = useState<string>('');

  const startRef = useRef<number | null>(null);
  const startedRef = useRef(false);
  const onSettledRef = useRef(onSettled);
  useEffect(() => {
    onSettledRef.current = onSettled;
  });

  // Record spin-start at mount, before Overpass returns, so the 1.5s floor is
  // measured from when the user committed to the spin. Declared before the
  // settle effect below so it runs first on mount (including Spin Again, where
  // pubs are already defined).
  useEffect(() => {
    startRef.current = Date.now();
  }, []);

  // Runs once, the first time pubs become available (which may be at mount on
  // a Spin Again, or moments later once Overpass returns on a fresh spin).
  useEffect(() => {
    if (!pubs || pubs.length === 0) return;
    if (startedRef.current) return;
    startedRef.current = true;

    // Picking logic preserved: choose the landing pub up front, settle on it.
    const finalPub = pickRandom(pubs);

    if (reducedMotion) {
      // Defer out of the effect body to avoid a synchronous cascading render.
      const t = setTimeout(() => {
        setDisplayName(finalPub.name);
        onSettledRef.current(finalPub);
      }, 0);
      return () => clearTimeout(t);
    }

    const elapsedMs = Date.now() - (startRef.current ?? Date.now());
    const remainingMs = computeSettleDelayMs({ elapsedMs, reducedMotion: false });

    // Build a decelerating tick schedule that fills `remainingMs`, then lands.
    // If Overpass was the slow part (remaining < decel budget), skip the ramp.
    const schedule: number[] = [];
    const fastBudgetMs = Math.max(0, remainingMs - DECEL_TOTAL_MS);
    const fastTicks = Math.floor(fastBudgetMs / FAST_INTERVAL_MS);
    for (let i = 0; i < fastTicks; i += 1) schedule.push(FAST_INTERVAL_MS);
    if (remainingMs >= DECEL_TOTAL_MS) {
      for (const d of DECEL_DELAYS_MS) schedule.push(d);
    }

    let idx = 0;
    let timer: ReturnType<typeof setTimeout> | null = null;
    const runTick = () => {
      if (idx >= schedule.length) {
        setDisplayName(finalPub.name);
        onSettledRef.current(finalPub);
        return;
      }
      setDisplayName(pickRandom(pubs).name);
      const delay = schedule[idx] as number;
      idx += 1;
      timer = setTimeout(runTick, delay);
    };
    // Defer the first tick out of the effect body (no synchronous setState).
    timer = setTimeout(runTick, 0);

    return () => {
      if (timer) clearTimeout(timer);
    };
  }, [pubs, reducedMotion]);

  return (
    <div className="flex flex-1 flex-col items-center justify-start pt-[14vh]">
      {reducedMotion ? (
        <StaticStout />
      ) : (
        // Native <img>, not next/image: next/image tries to optimise GIFs and
        // breaks the loop. This element only mounts during SPINNING, so the
        // asset never loads on initial page visit.
        // eslint-disable-next-line @next/next/no-img-element -- next/image breaks animated GIF loops; native img is required
        <img
          src={GIF_SRC}
          alt=""
          aria-hidden="true"
          loading="lazy"
          decoding="async"
          width={480}
          height={480}
          style={{ height: 'clamp(180px, 32vh, 320px)', width: 'auto' }}
        />
      )}
      <p
        aria-live="polite"
        className="text-fg-primary mt-7 text-center text-lg font-medium"
      >
        {displayName || ' '}
      </p>
    </div>
  );
}

/**
 * Static stout-pint silhouette shown to prefers-reduced-motion users instead
 * of the animated GIF. Dark stout body with a cream head; no animation, no
 * GIF network request.
 */
function StaticStout() {
  return (
    <span aria-hidden="true">
      <svg
        style={{ height: 'clamp(180px, 32vh, 320px)', width: 'auto' }}
        viewBox="0 0 100 140"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* glass body — stout dark, with a faint warm rim so it stays legible
            against the near-black Grumpy background, not only the green one */}
        <path
          d="M24 30 L30 132 L70 132 L76 30 Z"
          fill="#16100a"
          stroke="#6b5a44"
          strokeWidth="1.5"
        />
        {/* base */}
        <rect x="28" y="131" width="44" height="5" rx="2.5" fill="#6b5a44" />
        {/* cream head */}
        <path d="M22 30 Q50 18 78 30 L76 42 Q50 32 24 42 Z" fill="#ede0cc" />
        <ellipse cx="50" cy="29" rx="28" ry="7" fill="#f4ecdc" />
      </svg>
    </span>
  );
}
