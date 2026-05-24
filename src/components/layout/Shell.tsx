import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function Shell({ children }: Props) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col px-4 py-6">
      {children}
    </div>
  );
}
