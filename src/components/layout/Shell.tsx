import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
};

export function Shell({ children }: Props) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[420px] flex-col gap-6 px-5 py-8">
      {children}
    </div>
  );
}
