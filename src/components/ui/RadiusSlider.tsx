'use client';

import {
  RADIUS_MAX_KM,
  RADIUS_MIN_KM,
  RADIUS_STEP_KM,
} from '@/constants/config';
import { formatSliderWalkLabel } from '@/lib/walking-time';
import type { Voice } from '@/types/pub';

type Props = {
  voice: Voice;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

const TOKEN = '{walkTime}';

export function RadiusSlider({
  voice,
  value,
  onChange,
  disabled = false,
}: Props) {
  const template = voice.radiusSliderLabel;
  const idx = template.indexOf(TOKEN);
  const labelContent =
    idx === -1 ? (
      template
    ) : (
      <>
        {template.slice(0, idx)}
        <strong className="font-semibold">{formatSliderWalkLabel(value)}</strong>
        {template.slice(idx + TOKEN.length)}
      </>
    );

  return (
    <div className="space-y-2">
      <label
        htmlFor="radius-slider"
        className="text-fg-primary block text-sm font-normal"
      >
        {labelContent}
      </label>
      <input
        id="radius-slider"
        type="range"
        min={RADIUS_MIN_KM}
        max={RADIUS_MAX_KM}
        step={RADIUS_STEP_KM}
        value={value}
        disabled={disabled}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuemin={RADIUS_MIN_KM}
        aria-valuemax={RADIUS_MAX_KM}
        aria-valuenow={value}
        className="bg-border-subtle h-2 w-full appearance-none rounded-full disabled:cursor-not-allowed disabled:opacity-60"
      />
    </div>
  );
}
