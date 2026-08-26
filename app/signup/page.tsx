import SignupForm from "@/app/ui/signup_form";
import Link from "next/link";
import RatLogo from "@/app/ui/RatLogo";

export default function SignupPage() {
  return (
<main className="flex items-center justify-center min-h-screen bg-surface px-4 py-12">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-6">
        {/* Header / Logo */}
        <div className="flex items-center justify-center">
           <RatLogo size="lg" />
        </div>
       

        {/* <div className="flex h-32 w-full items-center justify-center rounded-3xl p-6 shadow-lg" /> */}

        {/* Signup Form Component */}
        <SignupForm />

        {/* Login Link */}
        <div className="text-center">
          <p className="text-xs text-muted">
            Already have an account?{" "}
            <Link href="/login" className="text-[#E7AB79] font-bold hover:underline">
              Log in here
            </Link>
          </p>
          <p className="text-foreground">sign up with Google</p>
        </div>
      </div>
    </main>
  );
}