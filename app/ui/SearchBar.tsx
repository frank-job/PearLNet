'use client';

import { SearchIcon } from 'lucide-react';

export default function Search({ placeholder }: { placeholder: string }) {
  return (
    <div className="relative flex flex-1 flex-shrink-0">
      {/* Label is hidden visually but readable by screen readers (Accessibility!) */}
      <label htmlFor="search" className="sr-only">
        Search
      </label>
      
      <input
        id="search"
        className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
        placeholder={placeholder}
      />
      
      {/* Search Icon positioned inside the bar */}
      <SearchIcon className="absolute left-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-gray-500 peer-focus:text-blue-600" />
    </div>
  );
}