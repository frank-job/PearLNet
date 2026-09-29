'use client';

import { ReactNode } from 'react';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children, session }: { children: ReactNode; session: unknown }) {
  return (
    <SessionProvider session={session}>
      {children}
    </SessionProvider>
  );
}
