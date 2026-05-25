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
    <main className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col items-center justify-center px-5 text-center">
      <h1 className="text-fg-primary text-xl font-semibold">{message}</h1>
    </main>
  );
}
