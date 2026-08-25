'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function RatRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    // 1. Wait for 2.5 seconds to show the cool animation
    const timer = setTimeout(() => {
      router.push('/PearLNet/home');
    }, 2500);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-white">
      <div className="relative flex flex-col items-center">
        
        {/* TRIANGLE ANIMATION */}
        <div className="relative w-32 h-32 mb-8">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* The Blue Triangle Path */}
            <motion.path
              d="M 50 5 L 95 90 L 5 90 Z"
              fill="transparent"
              stroke="#2563eb" // RAT Blue
              strokeWidth="4"
              strokeLinecap="round"
              strokeLinejoin="round"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ 
                pathLength: 1, 
                opacity: 1,
                rotate: 360 
              }}
              transition={{
                pathLength: { duration: 1.5, ease: "easeInOut" },
                opacity: { duration: 0.5 },
                rotate: { duration: 4, repeat: Infinity, ease: "linear" }
              }}
            />
            
            {/* Inner pulsing triangle */}
            <motion.path
              d="M 50 25 L 80 80 L 20 80 Z"
              fill="#2563eb"
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0.8, 1.1, 0.8], opacity: [0.2, 0.5, 0.2] }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            />
          </svg>
        </div>

        {/* LOGO & TEXT */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <h1 className="text-4xl font-black text-black tracking-tighter uppercase">
            PearlNet
          </h1>
          <div className="mt-4 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce"></span>
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.2s]"></span>
            <span className="w-1.5 h-1.5 bg-blue-600 rounded-full animate-bounce [animation-delay:0.4s]"></span>
          </div>
          <p className="text-[10px] font-bold text-gray-400 uppercase tracking-[0.3em] mt-6">
            Welcome  to <span className="text-blue-600"> PearlNet</span>
          </p>
          <h1 className="text-6xl md:text-7xl font-light tracking-tighter text-slate-900 leading-tight">
  The future is <span className="font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-500 italic">yours to build.</span>
</h1>
        </motion.div>
      </div>

      {/* Decorative background lines */}
      <div className="fixed inset-0 -z-10 pointer-events-none opacity-5">
         <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(#2563eb_1px,transparent_1px)] [background-size:20px_20px]"></div>
      </div>
    </main>
  );
}
