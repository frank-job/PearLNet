import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/server';
import { fetchConversations } from '@/lib/services/chat-service';
import {
  getInboxStoryUsers,
  getInboxNotificationSummary,
  getInboxViewer,
} from '@/app/lib/inbox-data';
import InboxClient from '@/app/components/inbox/InboxClient';
import InboxSkeleton from '@/app/components/inbox/InboxSkeleton';
import { EMPTY_INBOX, type InboxPayload } from '@/app/components/inbox/types';

// The inbox is per-user and always fresh; never cache the render.
export const dynamic = 'force-dynamic';

/* ============================================================
   Inbox Page
   - Server-rendered first paint: stories, notification summary
     and the DM list are fetched in parallel before responding
   - InboxClient then revalidates in the background and owns all
     interactive state
   ============================================================ */

export default async function InboxPage() {
  const session = await auth();
  const userId = session?.user?.id as string | undefined;

  if (!userId) {
    redirect('/login');
  }

  let payload: InboxPayload = EMPTY_INBOX;

  try {
    const [stories, notifications, conversations, viewer] = await Promise.all([
      getInboxStoryUsers(userId),
      getInboxNotificationSummary(userId),
      fetchConversations(userId, 30, 0),
      getInboxViewer(userId),
    ]);

    payload = { stories, notifications, conversations, viewer } as InboxPayload;
  } catch (error) {
    // Let the client surface the failure and offer a retry rather than
    // throwing a 500 on first paint.
    console.error('[Inbox] Server preload failed:', error);
  }

  if (payload === EMPTY_INBOX) {
    return <InboxSkeleton />;
  }

  return <InboxClient initialData={payload} />;
}