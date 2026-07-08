
import NavBar from '../ui/nav/NavBarr';
import SearchBar from '../ui/Components/SearchBar';

export default function WelcomePage() {
  return (
  
    <>
    
<main className="min-h-screen transition-all duration-300 ml-0 lg:ml-64 pb-24 lg:pb-8 px-4 md:px-8">
  
  {/* Header Section: RAT + SearchBar */}
  <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 py-6">
    <h1 className="text-blue-600 font-extrabold text-3xl md:text-4xl tracking-widest">
      R A T
    </h1>
    
    <div className=" flex sm:flex-row sm:max-w-md">
      <SearchBar />
    </div>
  </header>

  {/* Page Content goes here */}
  <div className="mt-4">
    {/* Your Dashboard Content, Cards, etc. */}
  </div>

  {/* The Navigation Component */}
  <NavBar />
</main>
    </>
  )
}


