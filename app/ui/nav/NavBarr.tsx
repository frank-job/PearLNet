import Link from 'next/link';
import NavLinks from './NavLinks';
// import RatLogo from '@/app/ui/RatLogo';

export default function NavBar() {
    return (
     
    <nav className="fixed z-50 
        /* Mobile: Bottom Bar */
        bottom-0 left-0 w-full h-20 bg-white border-t border-gray-200 
        /* Desktop: Sidebar */
        lg:top-0 lg:left-0 lg:w-4 lg:h-screen lg:border-t-0 
        ">
      
      <div className="flex 
          /* Mobile: Horizontal items */
          flex-row justify-around  items-center 
          /* Desktop: Vertical items */
          lg:flex-col lg:justify-start lg:items-start lg:px-4 lg:py-6 lg:gap-8">
        
        {/* Logo - Hidden on mobile bottom bar, visible on desktop sidebar */}
        <div className="hidden lg:block mb-4">
          <Link href="/" className="flex items-center">
            {/* <RatLogo /> */}
          </Link>
        </div>

        {/* Links Container */}
        <div className="flex w-full 
            /* Mobile: Row */
            flex-row justify-around items-center 
            /* Desktop: Column */
            lg:flex-col lg:items-start lg:gap-4">
          <NavLinks />
        </div>

        {/* Optional: Profile Icon or Logo for mobile */}
        {/* <div className="lg:hidden">
           <Link href="/">< /></Link>
        </div> */}

      </div>
    </nav>
  );
}