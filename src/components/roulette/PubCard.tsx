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
    <div>
      <h2>{pub.name}</h2>
      <p>{pub.walkingMinutes} min walk</p>
      <PubMap lat={pub.lat} lng={pub.lng} />
      <p>
        {challengePrefix} {challenge}
      </p>
      <button type="button" onClick={onGetDirections}>
        {getDirectionsLabel}
      </button>
      <button type="button" onClick={onSpinAgain}>
        {spinAgainLabel}
      </button>
    </div>
  );
}
