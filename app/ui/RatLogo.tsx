// // Rat Logo
// export default function RatLogo() {
//     return (
//         <>
//             <div className="bg-blue-600 w-25 rounded-2xl h-20 sticky flex border-20 border-r-blue-600">
//                <p className="text-white py-3  rounded-2xl  text-center uppercase shadow-blue-500  flex px-3"> RAT </p>
//             </div>
//         </>
//     )
// }



'use client';

import React from 'react';

interface RatLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

export default function RatLogo({ size = 'md', className = "" }: RatLogoProps) {
  // Size mapping for easy reuse
  const sizeMap = {
    sm: 'w-8 h-8',
    md: 'w-16 h-16',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
  };

  return (
    <div className={`flex flex-col items-center justify-center group ${className}`}>
      <div className={`relative ${sizeMap[size]} transition-transform duration-300 group-hover:scale-110 active:scale-90`}>
        
        {/* THE TRIANGLE SVG */}
        <svg 
          viewBox="0 0 100 100" 
          fill="none" 
          xmlns="http://www.w3.org/2000/svg"
          className="drop-shadow-xl"
        >
          {/* Main Blue Triangle Body */}
          <path 
            d="M50 5L95 85H5L50 5Z" 
            className="fill-blue-600 shadow-inner"
          />
          
          {/* Inner Accent Line (Creates the "A" feel) */}
          <path 
            d="M50 25L75 70H25L50 25Z" 
            className="fill-white/20"
          />

          {/* Bottom Cutout Detail */}
          <path 
            d="M40 85L50 75L60 85H40Z" 
            className="fill-white"
          />
        </svg>

        {/* LOGO TEXT OVERLAY (Centered inside the triangle) */}
        <div className="absolute inset-0 flex items-center justify-center pt-4">
          <span className={`
            font-black text-white tracking-tighter uppercase
            ${size === 'sm' ? 'text-[8px]' : ''}
            ${size === 'md' ? 'text-[12px]' : ''}
            ${size === 'lg' ? 'text-[24px]' : ''}
            ${size === 'xl' ? 'text-[32px]' : ''}
          `}>
            RAT
          </span>
        </div>
      </div>

      {/* Optional Tagline (Only for Large sizes) */}
      {(size === 'lg' || size === 'xl') && (
        <span className="mt-4 text-[10px] font-bold text-gray-400 uppercase tracking-[0.4em] animate-pulse">
          Premium Network
        </span>
      )}
    </div>
  );
}