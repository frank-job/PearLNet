import { Suspense } from 'react';
import ChatApp from '@/app/components/ChatApp';
import PageHeader from '@/app/components/PageHeader';

export default function ChatPage() {
  return (
    <main className="min-h-screen transition-all duration-300 ml-0 pb-24 overflow-y-auto bg-surface">
      <div className="max-w-5xl mx-auto w-full h-[calc(100vh-80px)]">
        <PageHeader
          title="PearlNet"
          subtitle="Messages"
          backHref="/PearLNet/home"
        />

        <div className="px-4 py-4 h-[calc(100%-65px)]">
          <Suspense fallback={<div className="py-8 text-center text-xs text-muted">Loading messages...</div>}>
            <ChatApp />
          </Suspense>
        </div>
      </div>
    </main>
  );
}
