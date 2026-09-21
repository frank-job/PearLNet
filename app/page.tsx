import RatLogo from './ui/RatLogo';
import LoginForm from "@/app/ui/login_form";
import Image from 'next/image';
import   Features from '@/app/components/features'

export default function WelcomePage() {
  return (
    <main className="h-full bg-white flex items-center justify-center bg-surface px-4 py-12">
      <Features />
    </main>
  );
}
