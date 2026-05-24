'use client';

import {
  RADIUS_MAX_KM,
  RADIUS_MIN_KM,
  RADIUS_STEP_KM,
} from '@/constants/config';

type Props = {
  value: number;
  onChange: (value: number) => void;
  disabled?: boolean;
};

export function RadiusSlider({ value, onChange, disabled = false }: Props) {
  return (
    <div>
      <label htmlFor="radius-slider">
        Find me a pub within <strong>{value}km</strong>
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
      />
    </div>
  );
}
