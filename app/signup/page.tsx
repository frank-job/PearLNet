import SignupForm from "@/app/ui/signup_form";
import Link from "next/link";
import RatLogo from "@/app/ui/RatLogo";

export default function SignupPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-[#FAF9F6] px-4 py-12">
      <div className="relative mx-auto flex w-full max-w-400px flex-col space-y-4">
        {/* Header / Logo */}
        <div className="flex items-center ">
           <RatLogo />
        </div>
       

        {/* <div className="flex h-32 w-full items-center justify-center rounded-3xl p-6 shadow-lg" /> */}

        {/* Signup Form Component */}
        <SignupForm />

        {/* Login Link */}
        <div className="text-center">
          <p className="text-xs text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-[#E7AB79] font-bold hover:underline">
              Log in here
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}