import Link from 'next/link';
import NavLinks from './NavLinks';
import NotificationBell from '@/app/components/NotificationBell';

export default function NavBar() {
    return (
      <nav className="fixed z-50 bottom-0 left-0 w-full h-20 bg-white border-t border-gray-200">
        <div className="flex flex-row justify-around items-center h-full px-4">
          <NavLinks />
          <NotificationBell />
        </div>
      </nav>
    );
}