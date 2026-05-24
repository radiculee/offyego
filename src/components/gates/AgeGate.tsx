'use client';

type Props = {
  onAccept: () => void;
};

export function AgeGate({ onAccept }: Props) {
  return (
    <div>
      <p>
        This app is for people over 18 with a sense of humour. If neither
        applies, the door&apos;s behind you.
      </p>
      <button type="button" onClick={onAccept}>
        I&apos;m 18+ and not easily offended
      </button>
    </div>
  );
}
