

import Link from 'next/link';

import RatLogo from '@/app/ui/Components/RatLogo';


export default function Login() {
    return (
        <>
            <RatLogo/>
            <h1 className="text-2xl text-blue-500">Login To Continue </h1>
            <form method='get'>
                <label
              className="mb-3 mt-5 block text-xs font-medium text-gray-900"
              htmlFor="email"
            >
              Email
                </label>
                 <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-gray-500"
                id="email"
                type="email"
                name="email"
                placeholder="Enter your email address"
                required
                />
                
                  <label
              className="mb-3 mt-5 block text-xs font-medium text-black"
              htmlFor="password"
            >
              Password
                </label>
                <input
                className="peer block w-full rounded-md border border-gray-200 py-[9px] pl-10 text-sm outline-2 placeholder:text-blue-600"
                id="password"
                type="password"
                name="password"
                placeholder="Enter password"
                required
                minLength={6}
              />
            </form>
            <Link href='/Ratpage' className='text-2xl text-white py-2 px-2 mt-10 ml-50 shadow-blue-400 rounded-2xl justify-center flex align-super bg-blue-600'>Finish</Link>
        </>
    )
}