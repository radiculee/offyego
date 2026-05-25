'use client';

import { usePersonality } from '@/hooks/usePersonality';
import type { Personality } from '@/types/pub';

const OPTIONS: ReadonlyArray<{ value: Personality; label: string }> = [
  { value: 'GRUMPY_BARMAN', label: 'The Grumpy Barman' },
  { value: 'LOCAL_LAD', label: 'The Local Lad' },
];

export function PersonalityToggle() {
  const { personality, setPersonality } = usePersonality();

  return (
    <div
      role="group"
      aria-label="Personality"
      className="inline-flex gap-2"
    >
      {OPTIONS.map((opt) => {
        const active = personality === opt.value;
        const stateClasses = active
          ? 'bg-bg-elevated border-border-strong text-fg-primary'
          : 'bg-transparent border-border-subtle text-fg-muted';
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => setPersonality(opt.value)}
            className={`rounded-md border px-4 py-2 text-sm font-medium transition-[background-color,border-color,color] duration-150 ease-out ${stateClasses}`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
