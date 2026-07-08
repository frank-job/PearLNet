import Link from 'next/link';
import RatLogo from './ui/Components/RatLogo';

export default function WelcomePage() {
  return (
    <>
      <main className="min-h-screen bg-white ml-0 lg:ml-64 flex flex-col justify-between px-6 py-12">
        
        {/* 1. TOP SECTION: Logo */}
        <div className="mt-10">
          <RatLogo />
          {/* <h1 className="text-blue-600 font-black text-5xl tracking-tighter">
            R A T
          </h1> */}
         <p className="text-gray-500 mt-4 leading-relaxed max-w-[250px]">
  Welcome to <span className="text-blue-600 font-semibold">R A T</span>. <br /> 
  Ready to connect with the world?
</p>
        </div>

        {/* 2. BOTTOM SECTION: Actions */}
        <div className="flex flex-col gap-4 mb-10 lg:mb-0 lg:max-w-md">
          
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Ready to explore?
          </h2>

          <Link 
            href="/signup" 
            className="w-full bg-blue-600 text-white text-center font-bold py-4 rounded-2xl shadow-lg shadow-blue-100 active:scale-95 transition-all"
          >
            CREATE ACCOUNT
          </Link>
          

          <Link 
          
            href ="/Ratpage/Login"
            className="w-full bg-white text-blue-600 border-2 border-blue-600 text-center font-bold py-4 rounded-2xl active:scale-95 transition-all"
          >
          
  
            LOG IN
          </Link>

          <p className="text-center text-xs text-gray-400 mt-2 px-6">
            By joining, you agree to our Terms and Privacy Policy.
          </p>
    </div >
        

        <button className="mt-4 text-gray-400 text-sm font-medium hover:text-blue-600 transition-colors">
  Skip for now
</button>
      </main>

      {/* This will show the Bottom Bar on phone and Sidebar on laptop */}
   
    </>
  );
}