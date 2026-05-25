'use client';

import { useState } from 'react';
import { usePersonality } from '@/hooks/usePersonality';

export default function NotFound() {
  const { voice } = usePersonality();
  const [message] = useState(
    () =>
      voice.notFoundMessages[
        Math.floor(Math.random() * voice.notFoundMessages.length)
      ] ?? '',
  );

  return (
    <main>
      <h1>{message}</h1>
    </main>
  );
}
