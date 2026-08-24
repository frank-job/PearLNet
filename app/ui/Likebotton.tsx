// like button

import { Heart } from 'lucide-react';

export default function LikeButton() {
    return (
        <button className="flex justify-around gap-1 rounded-full bg-white ml-20  px-2 py-2 text-red-600 font-bold transition-transform hover:scale-105">
            <Heart  className="w-6 transition-colors  placeholder:text-red-600 font-200 group-hover:text-red-600"  size={50} />
       
        </button>
    );
}