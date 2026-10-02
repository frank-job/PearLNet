export interface InboxStoryUser {
  userId: string;
  username: string | null;
  name: string | null;
  image: string | null;
  verified: boolean;
  storyImageUrl: string | null;
  storyVideoUrl: string | null;
  caption: string | null;
  isSeen: boolean;
  isOwn: boolean;
}

export interface InboxNotificationSummary {
  activityUnread: number;
  activityTotal: number;
  systemUnread: number;
  systemTotal: number;
  totalUnread: number;
}

export interface InboxConversation {
  id: string;
  type: string;
  name: string | null;
  imageUrl: string | null;
  otherUserId: string | null;
  otherUsername: string | null;
  otherName?: string | null;
  otherImage: string | null;
  otherVerified: boolean;
  lastMessage: string | null;
  lastMessageAt: string | Date | null;
  lastMessageSender: string | null;
  lastMessageFromMe?: boolean;
  lastMessageHasMedia?: boolean;
  unreadCount: number;
  createdAt: string | Date;
}

export interface InboxViewer {
  id: string;
  username: string | null;
  name: string | null;
  image: string | null;
}

export interface InboxPayload {
  stories: InboxStoryUser[];
  notifications: InboxNotificationSummary;
  conversations: InboxConversation[];
  viewer: InboxViewer;
}

export const EMPTY_INBOX: InboxPayload = {
  stories: [],
  notifications: {
    activityUnread: 0,
    activityTotal: 0,
    systemUnread: 0,
    systemTotal: 0,
    totalUnread: 0,
  },
  conversations: [],
  viewer: { id: '', username: null, name: null, image: null },
};