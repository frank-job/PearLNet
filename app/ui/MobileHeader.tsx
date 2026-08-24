import Link from 'next/link';
import RatLogo from './RatLogo';

export default function MobileHeader() {
  return (
    <div className="flex h-16 items-center justify-center bg-blue-600 px-4 md:hidden fixed top-0 w-full z-50 shadow-md">
      <Link href="/">
        <div className="text-white transform scale-75">
          <RatLogo />
        </div>
      </Link>
    </div>
  );
}