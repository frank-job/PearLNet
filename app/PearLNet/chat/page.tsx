import PageHeader from '@/app/components/PageHeader';

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-surface pb-24 lg:pb-8">
      <PageHeader title="Messages" subtitle="Chat with your connections" backHref="/PearLNet/home" />
      <div className="px-4 py-4">
        <div className="py-8 text-center text-xs text-muted">Chat coming soon</div>
      </div>
    </main>
  );
}