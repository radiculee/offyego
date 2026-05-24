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

  // Pick once on mount — stable across re-renders.
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
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.75)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 50,
      }}
    >
      <div
        ref={modalRef}
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        style={{ background: '#fff', padding: '1.5rem', maxWidth: '360px', width: '90%' }}
      >
        <p>{message}</p>
        <a
          href={REVOLUT_URL}
          target="_blank"
          rel="noopener noreferrer"
          onClick={onBuyPint}
        >
          <button type="button">{voice.guiltTripBuyButton}</button>
        </a>
        <button type="button" onClick={onClose}>
          {voice.guiltTripDismissButton}
        </button>
      </div>
    </div>
  );
}
