import RatLogo from './ui/RatLogo';
import LoginForm from "@/app/ui/login_form";

export default function WelcomePage() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-surface px-4 py-12">
      <div className="relative mx-auto flex w-full max-w-[400px] flex-col items-center space-y-6">
        {/* Brand Header */}
        <div className="flex flex-col items-center text-center">
          <RatLogo size="lg" />
          <h1 className="mt-4 text-3xl font-extrabold text-blue-600 tracking-widest">
            R A T
          </h1>
          <p className="mt-2 text-sm text-muted">
            Your premium social network. Connect, share, and discover.
          </p>
        </div>

        {/* Login Card */}
        <div className="w-full">
          <LoginForm />
        </div>
      </div>
    </main>
  );
}
