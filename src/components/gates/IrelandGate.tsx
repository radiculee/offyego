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
    <div>
      <p>{message}</p>
    </div>
  );
}
