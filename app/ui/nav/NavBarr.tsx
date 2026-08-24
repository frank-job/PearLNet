// import Link from 'next/link';
import NavLinks from './NavLinks';
// import NotificationBell from '@/app/components/NotificationBell';

export default function NavBar() {
    return (
      <nav className="  ">
        <div className="flex flex-row justify-between items-center h-full px-4">
   
          <NavLinks />
        </div>
      </nav>
    );
}