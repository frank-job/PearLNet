import SignupForm from "@/app/ui/signup_form";
import Link from "next/link";

export default function SignupPage() {
  return (
    <>
    <main className="min-h-screen bg-white text-[#17221d] lg:grid lg:grid-cols-[1.1fr_0.9fr]">
      <section 
      className="order-2 flex min-h-screen items-center justify-center px-5 py-8 sm:px-8 lg:order-1">
        <div className="relative mx-auto flex w-full max-w-[430px] flex-col gap-6">
          <Link href="/Features" className="flex items-center gap-3 text-lg font-black tracking-[-0.06em] lg:hidden">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-[#d7f36b] text-xs">PL</span>PearLNet
          </Link><SignupForm />
          </div>
          </section>
      <section
       className="relative order-1 hidden overflow-hidden bg-blue-400 px-10 py-10 text-[#17221d] lg:order-2 lg:flex lg:flex-col lg:justify-between"><Link href="/Features" className="flex items-center justify-end gap-3 text-xl font-black tracking-[-0.06em]">PearLNet<span className="grid h-10 w-10 place-items-center rounded-full bg-[#17221d] text-sm text-[#d7f36b]">
        PL</span></Link><div className="relative z-10 max-w-lg pb-10">
          <p className="mb-6 text-xs font-black uppercase tracking-[0.22em]">Make room for more connection</p><h1 className="text-6xl font-black leading-[0.9] tracking-[-0.08em]">
            Your next favorite corner of the internet starts here.</h1>
            <p className="mt-6 max-w-sm text-base leading-7 text-[#4d302a]">Join a social space for sharing what makes your world feel alive.
              </p></div><div className="absolute -bottom-20 -left-16 h-72 w-72 rounded-full border-[42px] border-white" />
              <div className="absolute right-24 top-32 h-24 w-24 rounded-full bg-[#f4f1e8]" />
              </section>
    </main>
    </>
  );
}