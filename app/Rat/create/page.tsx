'use client';

import NavBar from '../../ui/nav/NavBarr';
import CreatePost from '@/app/components/CreatePost';

// ============================================================
// Create Post Page
// - Dedicated page for creating new posts
// - Users can add a photo, caption, or both
// ============================================================

export default function CreatePostPage() {
  return (
    <main className="min-h-screen transition-all duration-300 ml-0 lg:ml-64 pb-24 lg:pb-8 px-4 md:px-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
        <div>
          <h1 className="text-blue-600 font-extrabold text-3xl md:text-4xl tracking-widest">
            R A T
          </h1>
          <p className="text-sm text-gray-500 mt-1">Create a new post</p>
        </div>
      </header>

      <div className="max-w-2xl mx-auto mt-4">
        <CreatePost onPostCreated={() => {}} />
      </div>

      <NavBar />
    </main>
  );
}