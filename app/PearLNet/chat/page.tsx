import { Suspense } from 'react';
import ChatApp from '@/app/components/ChatApp';
import ThemeToggle from '@/app/ui/theme/ThemeToggle';

export default function ChatPage() {
  return (
    <main className="min-h-screen transition-all duration-300 ml-0 pb-24 overflow-y-auto bg-surface">
      <div className="max-w-5xl mx-auto w-full h-[calc(100vh-80px)]">
        <header className="sticky top-0 z-40 px-4 py-4 bg-surface-strong border-b border-border backdrop-blur-md">
          <div className="flex items-center justify-between">
            <h1 className="text-blue-600 font-extrabold text-3xl md:text-4xl tracking-widest">
              PearlNet <span className="text-muted">Messages</span>
            </h1>
            <ThemeToggle />
          </div>
        </header>

        <div className="px-4 py-4 h-[calc(100%-65px)]">
          <Suspense fallback={<div className="py-8 text-center text-xs text-muted">Loading messages...</div>}>
            <ChatApp />
          </Suspense>
        </div>
      </div>
    </main>
  );
}