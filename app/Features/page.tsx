
import Features from '@/app/components/features';
import Link from 'next/link';
export default function FeaturesPage () {
    return (
        <>
            <div className='bg-blue-300 w-50 h-10  py-9 rounded-md m-10'>
            <Link href = '/PearLNet' className=' text-white py-5 px-5'>
                Back to home
            </Link>
            </div>
            <Features />
        </>
    )
}