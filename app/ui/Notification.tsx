// notification logo
import { Bell } from 'lucide-react';

export default function Notification() {
    return (
        <>
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-blue-600 hover:bg-blue-50 transition-colors cursor-pointer">
                <Bell className="w-6 h-6" size={20} />
            </div>
        </>
    )
}