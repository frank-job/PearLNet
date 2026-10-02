'use client';

import { signOut } from 'next-auth/react';
import { useState } from 'react';

export default function LogoutButton({
  className = '',
  label = 'Log out',
}: {
  className?: string;
  label?: string;
}) {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      // /api/session has no DELETE handler, so the sign-out has to go through
      // NextAuth or the session cookie survives and the user stays signed in.
      await signOut({ callbackUrl: '/login' });
    } catch {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      onClick={handleLogout}
      disabled={loading}
      className={className}
    >
      {loading ? 'Logging out...' : label}
    </button>
  );
}