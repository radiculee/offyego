'use client';

import {
  RADIUS_MAX_KM,
  RADIUS_MIN_KM,
  RADIUS_STEP_KM,
} from '@/constants/config';
import type { Voice } from '@/types/pub';

type Props = {
  voice: Voice;
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

const TOKEN = '{value}';

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
        <strong>{value}km</strong>
        {template.slice(idx + TOKEN.length)}
      </>
    );

  return (
    <div>
      <label htmlFor="radius-slider">{labelContent}</label>
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
      />
    </div>
  );
}
