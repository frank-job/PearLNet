'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Camera, ImageIcon } from 'lucide-react';
import { formatInboxTime, toSnippet, displayNameOf } from './format';
import type { InboxConversation } from './types';

interface ConversationListProps {
  conversations: InboxConversation[];
}

function Avatar({
  src,
  name,
  sizeClass = 'h-12 w-12',
}: {
  src: string | null;
  name: string;
  sizeClass?: string;
}) {
  if (src) {
    return (
      <span className={`relative shrink-0 overflow-hidden rounded-full bg-white/10 ${sizeClass}`}>
        <Image src={src} alt={name} fill sizes="48px" className="object-cover" />
      </span>
    );
  }

  return (
    <span
      className={`grid shrink-0 place-items-center rounded-full bg-white/10 font-bold text-white/70 ${sizeClass}`}
    >
      {name.charAt(0).toUpperCase()}
    </span>
  );
}

/**
 * Direct message list.
 *
 * Names render as plain text so emoji in a profile name display correctly, and
 * the camera affordance sits on the right of every row as in the reference UI.
 */
export default function ConversationList({ conversations }: ConversationListProps) {
  if (conversations.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 px-6 py-20 text-center">
        <p className="text-sm font-medium text-white">No messages yet</p>
        <p className="max-w-xs text-xs text-white/50">
          Find someone in Explore and start a conversation. Your chats will show up here.
        </p>
        <Link
          href="/explore"
          className="mt-3 rounded-full bg-white px-4 py-2 text-sm font-semibold text-black transition-opacity hover:opacity-90"
        >
          Find people
        </Link>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-white/5">
      {conversations.map((conversation) => {
        const isGroup = conversation.type !== 'DIRECT';
        const name = isGroup
          ? (conversation.name ?? 'Group chat')
          : displayNameOf({
              name: conversation.otherName,
              username: conversation.otherUsername,
              fallback: 'Conversation',
            });

        const unread = conversation.unreadCount > 0;
        const snippet = toSnippet(
          conversation.lastMessage,
          Boolean(conversation.lastMessageHasMedia),
        );

        return (
          <li key={conversation.id}>
            <div className="flex items-center gap-3 px-4 py-3 transition-colors hover:bg-white/5">
              <Link
                href={`/PearLNet/chat?conversation=${conversation.id}`}
                className="flex min-w-0 flex-1 items-center gap-3"
              >
                <Avatar
                  src={isGroup ? conversation.imageUrl : conversation.otherImage}
                  name={name}
                />

                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-2">
                    <span
                      className={`truncate text-sm ${
                        unread ? 'font-semibold text-white' : 'font-medium text-white/90'
                      }`}
                    >
                      {name}
                    </span>
                    <span className="ml-auto shrink-0 text-[11px] text-white/40">
                      {formatInboxTime(conversation.lastMessageAt)}
                    </span>
                  </span>

                  <span className="mt-0.5 flex items-center gap-1.5">
                    {conversation.lastMessageFromMe && (
                      <span className="shrink-0 text-[11px] text-white/35">You:</span>
                    )}
                    {conversation.lastMessageHasMedia && (
                      <ImageIcon className="h-3 w-3 shrink-0 text-white/35" aria-hidden="true" />
                    )}
                    <span
                      className={`truncate text-xs ${
                        unread ? 'text-white/80' : 'text-white/45'
                      }`}
                    >
                      {snippet}
                    </span>
                    {unread && (
                      <span className="ml-auto shrink-0 rounded-full bg-blue-500 px-1.5 py-0.5 text-[10px] font-bold text-white tabular-nums">
                        {conversation.unreadCount > 99 ? '99+' : conversation.unreadCount}
                      </span>
                    )}
                  </span>
                </span>
              </Link>

              <Link
                href={`/PearLNet/chat?conversation=${conversation.id}`}
                aria-label={`Open the conversation with ${name}`}
                className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white/10 text-white/80 transition-colors hover:bg-white/20 hover:text-white"
              >
                <Camera className="h-4 w-4" />
              </Link>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
