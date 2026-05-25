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
      className="bg-bg-surface flex gap-2 p-1"
    >
      {OPTIONS.map((opt) => {
        const active = personality === opt.value;
        return (
          <button
            key={opt.value}
            type="button"
            aria-pressed={active}
            onClick={() => setPersonality(opt.value)}
            className={`text-fg-primary font-body flex-1 px-3 py-2 ${
              active ? 'border-border-strong border' : 'border-border-subtle border'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
