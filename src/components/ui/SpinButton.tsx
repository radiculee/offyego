'use client';

import { Loader2 } from 'lucide-react';

type Props = {
  label: string;
  onClick: () => void;
  loading?: boolean;
  disabled?: boolean;
};

export function SpinButton({
  label,
  onClick,
  loading = false,
  disabled = false,
}: Props) {
  const isInactive = loading || disabled;
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={isInactive}
      aria-busy={loading}
      aria-label={label}
      style={{ width: '100%' }}
    >
      {loading ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      <span>{label}</span>
    </button>
  );
}
