'use client';

import { useEffect, useRef, useState } from 'react';
import { REVOLUT_URL } from '@/constants/config';
import type { Voice } from '@/types/pub';

type Props = {
  voice: Voice;
  onClose: () => void;
  onBuyPint: () => void;
};

export function GuiltTripModal({ voice, onClose, onBuyPint }: Props) {
  const modalRef = useRef<HTMLDivElement>(null);

  const [message] = useState(
    () =>
      voice.guiltTripMessages[
        Math.floor(Math.random() * voice.guiltTripMessages.length)
      ] ?? '',
  );

  useEffect(() => {
    const modal = modalRef.current;
    if (!modal) return;

    const focusable = modal.querySelectorAll<HTMLElement>(
      'button, [href], [tabindex]:not([tabindex="-1"])',
    );
    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    first?.focus();

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === first) {
          e.preventDefault();
          last?.focus();
        }
      } else {
        if (document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  return (
    <div
      onClick={onClose}
      style={{ zIndex: 'var(--z-modal)' }}
      className="fixed inset-0 flex items-center justify-center bg-black/60 px-5 backdrop-blur-sm"
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className="bg-bg-surface border-border-strong mx-auto w-full max-w-sm space-y-5 rounded-lg border p-6"
      >
        <p className="text-fg-primary text-base leading-relaxed">{message}</p>
        <div className="space-y-3">
          <a
            href={REVOLUT_URL}
            target="_blank"
            rel="noopener noreferrer"
            onClick={onBuyPint}
            className="bg-fg-accent text-bg-page block w-full rounded-md py-4 text-center text-base font-medium transition-[opacity,transform] duration-150 ease-out hover:opacity-90 active:scale-[0.98]"
          >
            {voice.guiltTripBuyButton}
          </a>
          <button
            type="button"
            onClick={onClose}
            className="text-fg-muted hover:text-fg-primary w-full bg-transparent py-2 text-sm font-medium underline-offset-4 transition-colors duration-150 ease-out hover:underline"
          >
            {voice.guiltTripDismissButton}
          </button>
        </div>
      </div>
    </div>
  );
}
