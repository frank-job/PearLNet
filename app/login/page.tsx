import LoginForm from "@/app/ui/login_form";
import RatLogo from "@/app/ui/RatLogo";

export default function LoginPage() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-[#FAF9F6] px-4 py-12">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col space-y-4">
        {/* Header / Logo */}
         <div className="flex items-center ">
                   <RatLogo />
                </div>
        {/* <div className="flex h-32 w-full items-center justify-center rounded-3xl p-6 shadow-lg" /> */}

        {/* Login Form Component */}
        <LoginForm />
      </div>
    </main>
  );
}