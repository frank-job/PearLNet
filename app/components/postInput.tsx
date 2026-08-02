'use client';

import { useMemo } from 'react';

export default function PostInput({
  userName = "Artisan",
  description,
  setDescription,
  clearFeedback,
}: {
  userName?: string;
  description: string;
  setDescription: (value: string) => void;
  clearFeedback: () => void;
}) {
  // 1. Logic to get a modern, time-based greeting
  const dynamicPlaceholder = useMemo(() => {
    const hour = new Date().getHours();
    const firstName = userName.split(' ')[0]; // Just use the first name

    if (hour >= 5 && hour < 12) {
      return `Good morning, ${firstName}! What's the plan for today? ☕`;
    } else if (hour >= 12 && hour < 17) {
      return `Good afternoon, ${firstName}. Sharing something new? ✨`;
    } else if (hour >= 17 && hour < 21) {
      return `Good evening, ${firstName}. How was your day? 🌙`;
    } else {
      return `Burning the midnight oil, ${firstName}? What's on your mind? 🦉`;
    }
  }, [userName]);

  return (
    <div className="w-full">
      <div className="relative rounded-2xl border-2 border-gray-200 bg-gray-50 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-4 focus-within:ring-blue-100 transition-all duration-200 px-4 py-2">
        <textarea
          placeholder={dynamicPlaceholder}
          value={description}
          onChange={(e) => {
            setDescription(e.target.value);
            if (clearFeedback) clearFeedback();
          }}
          className="w-full resize-none outline-none text-lg text-gray-900 placeholder-gray-400 min-h-[80px] bg-transparent leading-relaxed"
          rows={2}
        />
      </div>
      
      {/* Visual indicator of "Modern" UI: Character count or simple line */}
      <div className="flex justify-end pr-2">
         <span className={`text-[10px] font-bold ${description.length > 200 ? 'text-red-500' : 'text-gray-300'}`}>
            {description.length} / 280
         </span>
      </div>
    </div>
  );
}

