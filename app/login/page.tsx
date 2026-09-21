import LoginForm from "@/app/ui/login_form";
import Link from "next/link";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-[#f4f1e8] text-[#17221d] lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <section className="relative hidden overflow-hidden bg-blue-600 px-10 py-10 text-[#f4f1e8] lg:flex lg:flex-col lg:justify-between">
        <Link href="/Features" className="flex items-center gap-3 text-xl font-black tracking-[-0.06em]"><span className="grid h-10 w-10 place-items-center rounded-full bg-white text-sm text-blue-600">PL</span>PearLNet</Link>
        <div className="relative z-10 max-w-lg pb-10"><p className="mb-6 text-xs font-black uppercase tracking-[0.22em] text-shadow-white">Welcome back to the good stuff</p><h1 className="text-6xl font-black leading-[0.9] tracking-[-0.08em]">The people and moments you care about are waiting.</h1><p className="mt-6 max-w-sm text-base leading-7 text-[#b4c0b8]">Pick up where you left off. Your feed is ready.</p></div>
        <div className="absolute -bottom-24 -right-20 h-72 w-72 rounded-full border-[42px] border-white" />
        <div className="absolute right-20 top-32 h-24 w-24 rounded-full bg-white" />
      </section>
      <section className="flex min-h-screen items-center justify-center px-5 py-8 sm:px-8"><div className="relative mx-auto flex w-full max-w-[430px] flex-col gap-6"><Link href="/Features" className="flex items-center gap-3 text-lg font-black tracking-[-0.06em] lg:hidden"><span className="grid h-9 w-9 place-items-center rounded-full bg-blue-600 text-xs">PL</span>PearLNet</Link><LoginForm /></div></section>
    </main>
  );
}