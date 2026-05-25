'use client';

import { useState } from 'react';
import type { Voice } from '@/types/pub';

type Props = {
  voice: Voice;
};

export function IrelandGate({ voice }: Props) {
  const [message] = useState(
    () =>
      voice.outOfIrelandMessages[
        Math.floor(Math.random() * voice.outOfIrelandMessages.length)
      ] ?? '',
  );

  return (
    <div className="flex flex-1 flex-col items-center justify-center text-center">
      <p className="text-fg-primary max-w-xs text-base leading-relaxed">
        {message}
      </p>
    </div>
  );
}
