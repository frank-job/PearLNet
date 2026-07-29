"use client";
import { useState } from 'react';

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      await fetch('/api/session', { method: 'DELETE' });
      // reload to update UI
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      className="px-3 py-2 rounded-xl bg-red-50 text-red-600 border border-red-100 text-sm"
    >
      {loading ? 'Logging out...' : 'Logout'}
    </button>
  );
}
