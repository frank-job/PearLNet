'use client';

import EditListing from '@/app/components/EditListing';

export default function EditListingPage() {
  return (
    <>
      <main className="-mt-14 min-h-screen transition-all duration-300 ml-0 lg:mt-0 lg:ml-64 pb-0 lg:pb-8 px-4 md:px-8">
        <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
          <div>
            <h1 className="text-blue-600 font-extrabold text-3xl md:text-4xl tracking-widest">
              PearlNet
            </h1>
            <p className="text-sm text-muted mt-1">Edit listing</p>
          </div>
        </header>

        <div className="max-w-2xl mx-auto mt-4">
          <EditListing />
        </div>
      </main>
    </>
  );
}