import { Suspense } from 'react';
import LoginForm from '@/app/components/LoginForm';

export const metadata = {
  title: 'Log in | PearLNet',
  description: 'Log in to your PearLNet account.',
};

export default function LoginPage() {
  const googleEnabled = Boolean(
    process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET,
  );

  return (
    <Suspense fallback={null}>
      <LoginForm googleEnabled={googleEnabled} />
    </Suspense>
  );
}