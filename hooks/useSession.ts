'use client';

import { useSession as useNextAuthSession, signIn as nextSignIn, signOut as nextSignOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export function useSession() {
  const { data: session, status, update } = useNextAuthSession();
  return {
    user: session?.user as
      | {
          id?: string;
          email?: string | null;
          name?: string | null;
          image?: string | null;
          role?: string;
          verified?: boolean;
        }
      | undefined,
    loading: status === 'loading',
    authenticated: status === 'authenticated',
    update,
  };
}

export function signIn(
  provider?: string,
  options?: {
    redirectTo?: string;
    email?: string;
    password?: string;
  },
) {
  if (provider === 'credentials') {
    if (!options?.email || !options?.password) {
      throw new Error('Email and password are required for credentials sign-in');
    }
    return nextSignIn('credentials', {
      redirect: false,
      email: options.email,
      password: options.password,
      redirectTo: options?.redirectTo ?? '/PearLNet',
    });
  }
  return nextSignIn(provider, { redirectTo: options?.redirectTo });
}

export function signOut() {
  return nextSignOut({ redirectTo: '/login' });
}
