'use client';

import { redirect } from 'next/navigation';
import { useState, useEffect } from 'react';
import { getCurrentUser, getProfile, updateProfile } from '@/app/lib/action';
import type { ProfileData } from '@/app/lib/definitions';
import { useActionState } from 'react';
import Link from 'next/link';

// ============================================================
// Edit Profile Page
// - Allows users to update username, bio, location, birth year, and date of birth
// - Requires authentication
// ============================================================

export default function EditProfilePage() {
  const [errorMessage, formAction, isPending] = useActionState(updateProfile, undefined);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    getCurrentUser().then(async (user) => {
      if (!user || !active) return redirect('/login');
      const result = await getProfile(user.userId);
      if ('data' in result && active) {
        setProfile(result.data ?? null);
      }
      setLoading(false);
    });
    return () => { active = false; };
  }, []);

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </main>
    );
  }

  return (
    <main className="min-h-screen transition-all duration-300 ml-0 lg:ml-64 pb-24 lg:pb-8 px-4 md:px-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
      
      </header>

      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Edit Profile</h2>

          {errorMessage?.message && (
            <div className="mb-4 rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
              {errorMessage.message}
            </div>
          )}

          <form action={formAction} className="space-y-5">
            {/* Username */}
            <div>
              <label
                htmlFor="username"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                name="username"
                defaultValue={profile?.username ?? ''}
                required
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Bio */}
            <div>
              <label
                htmlFor="bio"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                defaultValue={profile?.bio ?? ''}
                placeholder="Tell Peaple about yourself..."
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all resize-none"
              />
            </div>

            {/* Location */}
            <div>
              <label
                htmlFor="location"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Location
              </label>
              <input
                type="text"
                id="location"
                name="location"
                defaultValue={profile?.location ?? ''}
                placeholder="City, Country"
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div>

            {/* Birth Year */}
            {/* <div>
              <label
                htmlFor="birth_year"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Birth Year
              </label>
              <input
                type="number"
                id="birth_year"
                name="birth_year"
                defaultValue={profile?.birth_year ?? ''}
                placeholder="e.g. 1995"
                min="1900"
                max={new Date().getFullYear()}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div> */}

            {/* Date of Birth */}
            {/* <div>
              <label
                htmlFor="date_of_birth"
                className="mb-2 block text-sm font-medium text-gray-700"
              >
                Date of Birth
              </label>
              <input
                type="date"
                id="date_of_birth"
                name="date_of_birth"
                defaultValue={profile?.date_of_birth ?? ''}
                className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
            </div> */}

            <div>
  <label
    htmlFor="date_of_birth"
    className="mb-2 block text-sm font-semibold text-gray-700"
  >
    Date of Birth
  </label>
  <input
    type="date"
    id="date_of_birth"
    name="date_of_birth"
    // Sets the latest possible date to today
    max={new Date().toISOString().split("T")[0]} 
    defaultValue={profile?.date_of_birth ?? ''}
    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm 
               outline-none focus:ring-2 focus:ring-blue-500 transition-all
               appearance-none cursor-pointer"
  />
  <p className="mt-1 text-[10px] text-gray-400">Click the icon to browse or type YYYY-MM-DD</p>
</div>

            <button
              type="submit"
              disabled={isPending}
              className="w-full mt-2 bg-blue-600 text-white font-bold py-4 rounded-2xl active:scale-95 transition-all hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? 'Saving...' : 'Save Changes' } 

            
            </button>


          </form>

           <div className="text-center space-y-6">
  <h1 className="text-2xl md:text-3xl font-light tracking-[0.5em] text-blue-900 uppercase">
    PearLNet
  </h1>
  
  <div className="h-px w-20 bg-blue-900/20 mx-auto"></div>

  <Link
    href="/PearLNet/account"
    className="inline-block px-8 py-3 border border-blue-900 text-[10px] font-bold uppercase tracking-widest text-blue-900 hover:bg-blue-900 hover:text-white transition-all duration-500"
  >
    Continue to Profile
  </Link>
</div>
        </div>
      </div>

    </main>
  );
}
