'use client';

import dynamic from 'next/dynamic';
import type { Pub } from '@/types/pub';

const PubMap = dynamic(() => import('@/components/map/PubMap'), { ssr: false });

type Props = {
  pub: Pub;
  challenge: string;
  challengePrefix: string;
  spinAgainLabel: string;
  getDirectionsLabel: string;
  onSpinAgain: () => void;
  onGetDirections: () => void;
};

export function PubCard({
  pub,
  challenge,
  challengePrefix,
  spinAgainLabel,
  getDirectionsLabel,
  onSpinAgain,
  onGetDirections,
}: Props) {
  return (
    <div className="bg-bg-surface border-border-subtle space-y-4 rounded-lg border p-5">
      <h2 className="text-fg-primary text-2xl font-semibold">{pub.name}</h2>
      <p className="text-fg-muted text-sm uppercase tracking-wider">
        {pub.walkingMinutes} min walk
      </p>
      <div className="border-border-subtle h-48 overflow-hidden rounded-md border">
        <PubMap lat={pub.lat} lng={pub.lng} />
      </div>
      <p className="text-fg-primary text-base italic">
        {challengePrefix} {challenge}
      </p>
      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          onClick={onGetDirections}
          className="bg-fg-accent text-bg-page rounded-md py-3 text-base font-medium transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.98]"
        >
          {getDirectionsLabel}
        </button>
        <button
          type="button"
          onClick={onSpinAgain}
          className="border-border-strong text-fg-primary hover:bg-bg-elevated rounded-md border bg-transparent py-3 text-base font-medium transition-colors duration-150 ease-out"
        >
          {spinAgainLabel}
        </button>
      </div>
    </div>
  );
}
