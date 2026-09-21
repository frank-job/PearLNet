import Link from 'next/link';
import { ArrowUpRight, Heart, MessageCircle, Sparkles } from 'lucide-react';
import Image from 'next/image';

const proofPoints = [
  ['Share the moment', 'Post photos, thoughts, and everyday wins in seconds.'],
  ['Find your people', 'Follow real interests and conversations that feel like yours.'],
  ['Keep the signal', 'A feed built for connection, not endless noise.'],
];

export default function Features() {
  return (
    <main className="rounded-2xl bg-white text-[#17221d]">
      <Image
        src="/logo.svg"          // Points to public/logo.png
        alt="PearLNet Logo"      // Descriptive alt text for accessibility
        width={100}              // Rendered width in pixels
        height={100}             // Rendered height in pixels
        priority                 // Optional: loads image immediately if in view on page load
      />
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/Features" className="flex items-center gap-3" aria-label="PearLNet home">
        
          {/* <span className="grid h-10 w-10 place-items-center rounded-full bg-blue-700 text-sm font-black tracking-[-0.08em]">PL</span> */}
          <span className="text-xl font-black tracking-[-0.06em]">PearLNet</span>
        </Link>
        <Link href="/login" className="text-2xl shadow-[15px_0px_15px_#0627e0] bg-blue-600 border-y-white py-3 px-3 rounded-2xl border-2 font-bold text-white underline decoration-[#ededf3] decoration-2 underline-offset-4 ">
         Login
        </Link>
      </nav>

      <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10 lg:pb-24 lg:pt-16">
        <div className="animate-[rise-in_700ms_ease-out_both]">
          <p className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#0627e0]">
            <Sparkles className="h-4 w-4" /> A social space for good things
          </p>
          <h1 className="max-w-3xl text-[clamp(3.75rem,9vw,8.5rem)] text-shadow-[15px_0px_15px_#ebefed] font-black leading-[0.84] tracking-[-0.09em]">
            Share what makes your world <span className="text-white/70  italic text-shadow-[15px_0px_15px_#0627e0]">feel alive.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-7 text-[#526057] sm:text-xl">
            PearLNet is where people post the little moments, discover new perspectives, and stay close to the people they care about.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/signup" className="group flex items-center gap-3 rounded-full text-2xl shadow-[15px_0px_15px_#0627e0] bg-blue-600 border-y-white py-3 px-3 rounded-2xl border-2 font-bold text-white transition-transform hover:-translate-y-1">
              Join PearLNet
              <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
            <Link href="/PearLNet" className="l text-2xl  bg-white border-[#5174dd] border-y-blue py-3 px-3 border-#fff8ed rounded-2xl border-2 font-bold text- hover:border-[#9588de] hover:text-blue-400">
              Explore the feed
            </Link>
          </div>
        </div>

        <div className="relative animate-[rise-in_700ms_180ms_ease-out_both] lg:pl-10">
          <div className="absolute -right-2 -top-8 hidden rotate-6 rounded-full bg-[#f0694f] px-5 py-3 text-sm font-black text-[#fff8ed] shadow-xl sm:block">
            Your people are here.
          </div>
          <article className="relative mx-auto max-w-md rotate-[-3deg] overflow-hidden rounded-[2rem] bg-[#fff8ed] p-4 shadow-[18px_20px_0_#d7f36b] transition-transform duration-500 hover:rotate-0">
            <div className="flex items-center justify-between border-b border-[#17221d]/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-full bg-[#a8c5bc] text-sm font-black">M</div>
                <div>
                  <p className="font-black">Maya Chen</p>
                  <p className="text-xs text-[#718077]">2 min ago · Portland</p>
                </div>
              </div>
              <span className="text-xl">•••</span>
            </div>
            <div className="my-4 grid aspect-[4/3] place-items-center overflow-hidden rounded-2xl bg-[#dce8d7]">
              <div className="relative h-36 w-36 rounded-full border-[18px] border-[#f0694f] bg-[#d7f36b] shadow-[25px_20px_0_#17221d]">
                <span className="absolute -right-8 top-5 h-8 w-8 rounded-full bg-[#fff8ed]" />
              </div>
            </div>
            <p className="text-base font-bold leading-6">Found a tiny piece of summer on my walk home.</p>
            <div className="mt-5 flex items-center gap-5 border-t border-[#17221d]/10 pt-4 text-sm font-bold">
              <span className="flex items-center gap-1.5 text-[#f2320b]"><Heart className="h-4 w-4 fill-current" /> 128</span>
              <span className="flex items-center gap-1.5 text-[#718077]"><MessageCircle className="h-4 w-4" /> 14</span>
              <span className="ml-auto text-[#718077]">•••</span>
            </div>
          </article>
        </div>
      </section>

      <section className="border-t border-[#17221d]/10 bg-[#353ff4] text-[#f4f1e8]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 sm:grid-cols-3 lg:px-10">
          {proofPoints.map(([title, description], index) => (
            <div key={title} className="border-l-2 border-[#0c3ad1] pl-5">
              <p className="mb-5 text-xs font-black text-[#d7f36b]">0{index + 1}</p>
              <h2 className="text-xl font-black tracking-tight">{title}</h2>
              <p className="mt-2 max-w-xs text-sm leading-6 text-[#b4c0b8]">{description}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
