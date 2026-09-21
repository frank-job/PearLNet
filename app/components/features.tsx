'use client';

import Link from 'next/link';
import { ArrowUpRight, Heart, MessageCircle, Sparkles, Users, Zap, Shield, Globe, CheckCircle, Image } from 'lucide-react';
import ThemeToggle from '@/app/ui/theme/ThemeToggle';

const proofPoints = [
  ['Share the moment', 'Post photos, thoughts, and everyday wins in seconds.'],
  ['Find your people', 'Follow real interests and conversations that feel like yours.'],
  ['Keep the signal', 'A feed built for connection, not endless noise.'],
];

const featureCards = [
  { icon: Image, title: 'Visual Stories', desc: 'Share photos and videos with a built-in audience that cares.' },
  { icon: Users, title: 'Real Connections', desc: 'Follow people, not algorithms. Your feed reflects your interests.' },
  { icon: Zap, title: 'Instant Posts', desc: 'Create and publish content in seconds with a streamlined composer.' },
  { icon: Shield, title: 'Safe Space', desc: 'Built-in tools to manage your privacy and curate your experience.' },
];

export default function Features() {
  return (
    <main className="rounded-2xl text-[var(--color-brand-dark)] bg-surface">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6 lg:px-10">
        <Link href="/Features" className="flex items-center gap-3" aria-label="PearLNet home">
          <span className="text-xl font-black tracking-[-0.06em]">PearLNet</span>
        </Link>
        <div className="flex items-center gap-4">
          <ThemeToggle />
          <Link href="/login" className="text-2xl shadow-[15px_0px_15px_#0627e0] bg-blue-600 border-y-white py-3 px-3 rounded-2xl border-2 font-bold text-white underline decoration-[#ededf3] decoration-2 underline-offset-4 ">
            Login
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="mx-auto grid w-full max-w-7xl gap-12 px-6 pb-16 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:px-10 lg:pb-24 lg:pt-16">
        <div className="animate-[rise-in_700ms_ease-out_both]">
          <p className="mb-6 flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-blue-600">
            <Sparkles className="h-4 w-4" /> A social space for good things
          </p>
          <h1 className="max-w-3xl text-[clamp(3.75rem,9vw,8.5rem)] text-shadow-[15px_0px_15px_#ebefed] font-black leading-[0.84] tracking-[-0.09em]">
            Share what makes your world <span className="text-[var(--color-brand-gray)] italic text-shadow-[15px_0px_15px_#0627e0]">feel alive.</span>
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-7 text-[var(--color-brand-muted)] sm:text-xl">
            PearLNet is where people post the little moments, discover new perspectives, and stay close to the people they care about.
          </p>
          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link href="/signup" className="group flex items-center gap-3 rounded-full text-2xl shadow-[15px_0px_15px_#0627e0] bg-blue-600 border-y-white py-3 px-3 rounded-2xl border-2 font-bold text-white transition-transform hover:-translate-y-1">
              Join PearLNet
              <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
            <Link href="/PearLNet" className="l text-2xl bg-white border-[#5174dd] border-y-blue py-3 px-3 border-2 font-bold text-[var(--color-brand-dark)] hover:border-[#9588de] hover:text-blue-400">
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

      {/* FEATURE CARDS SECTION */}
      <section className="border-t border-[var(--border)] bg-surface">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-16 lg:px-10">
          <div className="text-center">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-blue-600">
              <Sparkles className="inline h-4 w-4 mr-2" /> Everything you need
            </p>
            <h2 className="text-4xl font-black tracking-tight">Built for how you actually use social</h2>
          </div>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featureCards.map((card) => (
              <FeatureCard key={card.title} {...card} />
            ))}
          </div>
        </div>
      </section>

      {/* PROOF POINTS SECTION */}
      <section className="border-t border-[var(--border)] bg-[var(--color-brand-blue)] text-[var(--color-brand-dark)]">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 sm:grid-cols-3 lg:px-10">
          {proofPoints.map(([title, description], index) => (
            <div key={title} className="border-l-2 border-[#0c3ad1] pl-5">
              <p className="mb-5 text-xs font-black text-[var(--color-brand-lime)]">0{index + 1}</p>
              <h2 className="text-xl font-black tracking-tight">{title}</h2>
              <p className="mt-2 max-w-xs text-sm leading-6 text-[var(--color-brand-gray)]">{description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* HOW IT WORKS SECTION */}
      <section className="border-t border-[var(--border)] bg-surface-strong">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-16 lg:px-10">
          <div className="text-center">
            <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-blue-600">
              <Globe className="inline h-4 w-4 mr-2" /> How it works
            </p>
            <h2 className="text-4xl font-black tracking-tight">Three steps to your community</h2>
          </div>
          <div className="grid gap-8 md:grid-cols-3">
            <StepCard number="01" title="Create your profile" desc="Set up in minutes. Share what matters and tell the world who you are." Icon={CheckCircle} />
            <StepCard number="02" title="Discover your feed" desc="Follow topics, people, and conversations that spark your curiosity." Icon={Sparkles} />
            <StepCard number="03" title="Share and connect" desc="Post moments, engage with others, and grow your community." Icon={Users} />
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="border-t border-[var(--border)] bg-surface">
        <div className="mx-auto grid w-full max-w-4xl gap-8 px-6 py-20 text-center lg:px-10">
          <h2 className="text-4xl font-black tracking-tight">Ready to join the good stuff?</h2>
          <p className="mx-auto max-w-xl text-lg leading-7 text-[var(--color-brand-muted)]">
            PearLNet is where people post the little moments, discover new perspectives, and stay close to the people they care about.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-4">
            <Link href="/signup" className="group flex items-center gap-3 rounded-full text-2xl shadow-[15px_0px_15px_#0627e0] bg-blue-600 border-y-white py-3 px-6 rounded-2xl border-2 font-bold text-white transition-transform hover:-translate-y-1">
              Join PearLNet
              <ArrowUpRight className="h-5 w-5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </Link>
            <Link href="/login" className="flex items-center gap-3 rounded-full border border-border bg-surface-strong px-6 py-3 text-xl font-bold text-foreground transition-colors hover:bg-surface">
              Already a member?
            </Link>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-[var(--border)] bg-surface-strong">
        <div className="mx-auto grid w-full max-w-7xl gap-8 px-6 py-10 lg:px-10">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <Link href="/Features" className="text-xl font-black tracking-[-0.06em]">PearLNet</Link>
            <p className="text-sm text-muted">&copy; 2026 PearLNet. All rights reserved.</p>
            <div className="flex items-center gap-6">
              <Link href="/terms" className="text-sm text-muted hover:text-foreground transition-colors">Terms</Link>
              <Link href="/privacy" className="text-sm text-muted hover:text-foreground transition-colors">Privacy</Link>
              <Link href="/login" className="text-sm text-muted hover:text-foreground transition-colors">Login</Link>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({ icon: Icon, title, desc }: { icon: typeof Image; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-surface p-6 transition-colors hover:bg-surface-strong">
      <div className="mb-4 grid h-12 w-12 place-items-center rounded-xl bg-primary-soft text-primary">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="text-lg font-black tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--color-brand-muted)]">{desc}</p>
    </div>
  );
}

function StepCard({ number, title, desc, Icon }: { number: string; title: string; desc: string; Icon: typeof Sparkles }) {
  return (
    <div className="relative">
      <span className="mb-4 block text-5xl font-black text-[var(--color-brand-lime)]">{number}</span>
      <h3 className="text-xl font-black tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[var(--color-brand-muted)]">{desc}</p>
    </div>
  );
}
