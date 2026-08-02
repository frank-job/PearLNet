'use client';

export default function Greetings({ userName }: { userName: string }) {
    const hour = new Date().getHours();
    
    let greet = '';
    let emoji = '';

    if (hour >= 5 && hour < 12) {
        greet = 'Good Morning';
        emoji = '☕';
    } else if (hour >= 12 && hour < 15) {
        greet = 'Good Afternoon';
        emoji = '☀️';
    } else if (hour >= 15 && hour < 21) {
        greet = 'Good Evening';
        emoji = '🌙😊  ';
    } else {
        greet = 'Good Night';
        emoji = '🌙';
    }

    return (
        <div className="py-6 px-4">
            {/* <h1 className="text-3xl md:text-4xl font-black text-black tracking-tighter uppercase leading-none"> */}
            <h1 className="text-3xl md:text-4xl font-black tracking-tighter uppercase leading-none bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent animate-gradient">
                {greet},
            </h1>
            <div className="flex items-center gap-2 mt-2">
                <span className="text-2xl md:text-3xl font-bold text-blue-600">
                {/* <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 via-purple-500 to-pink-500 bg-clip-text text-transparent"> */}
                {/* <span className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-blue-600 to-cyan-400 bg-clip-text text-transparent hover:animate-gradient"> */}
                    {userName} {emoji}
                </span>
            </div>
            
            {/* The Date Line */}
            <p className="text-gray-400 text-[8px] font-black uppercase tracking-[0.3em] mt-4 border-l-4 border-blue-600 pl-3">
                {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    month: 'short', 
                    day: 'numeric' 
                })}
            </p>
        </div>
    );
}