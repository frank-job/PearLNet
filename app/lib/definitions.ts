// ===== Core User Types =====

export type User = {
  id: string;
  email: string;
  password: string;
  name?: string;
};

export type SessionUser = {
  id: string;
  email: string;
  name?: string;
};

// ===== Post Types =====

export type Post = {
  id: string;
  image_url: string;
  caption: string;
  created_at: string;
  user_id?: string;
  user_email?: string;
  view_count?: number;
  images?: string[];
};

// ===== Comment Types =====

export type Comment = {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  user_email?: string;
};

// ===== Like Types =====

export type Like = {
  id: string;
  post_id: string;
  user_id: string;
  created_at: string;
};

// ===== Follow Types (NEW) =====

export type Follow = {
  id: string;
  follower_id: string;   // The user who follows
  following_id: string;  // The user being followed
  created_at: string;
};

// ===== User Profile Type (for displaying on posts) =====

export type UserProfile = {
  id: string;
  email: string;
  name?: string;
  avatar_url?: string;
};

// definitions.ts

export type NewSignup = {
  id: string;
  username: string;
  email: string;
  password: string;
};


// ===== Notification Types =====

export type Notification = {
  id: string;
  user_id: string;
  type: string;
  message: string;
  link: string | null;
  read: boolean;
  created_at: string;
};

export type ProfileData = {
  id: string;
  username: string;
  email: string;
  bio: string | null;
  location: string | null;
  image_url: string | null;
  birth_year: number | null;
  date_of_birth: string | null;
};

// ===== User List Item (for followers / following lists) =====

export type UserListItem = {
  id: string;
  username: string;
  image_url: string | null;
  bio: string | null;
};

export type SearchUserResult = {
  user_id: string;
  username: string;
  image_url: string | null;
};

// ===== Share Types =====

export type Share = {
  id: string;
  post_id: string;
  user_id: string;
  shared_with_user_id: string | null;
  created_at: string;
};
export type greetings = {
  id: string;
  username: string;
}

export type SavedPost = {
  id: string;
  user_id: string;
  post_id: string;
  created_at: string;
};

export type Story = {
  id: string;
  user_id: string;
  image_url: string;
  caption: string | null;
  expires_at: string;
  created_at: string;
};

export type StoryUser = {
  id: string;
  username: string;
  image_url: string | null;
  hasStory: boolean;
};

// ===== Events Types =====

export type Event = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  image_url: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  creator_id: string;
  creator_email: string | null;
  creator_username?: string;
  creator_image_url?: string | null;
  created_at: string;
  rsvp_count?: number;
  my_rsvp?: 'going' | 'maybe' | 'not_going' | null;
};

export type EventRsvp = {
  id: string;
  event_id: string;
  user_id: string;
  status: 'going' | 'maybe' | 'not_going';
  created_at: string;
};

// ===== Marketplace Types =====

export type Listing = {
  id: string;
  title: string;
  description: string | null;
  category: string;
  price: number;
  currency: string;
  image_url: string | null;
  condition: string;
  location: string | null;
  seller_id: string;
  seller_email: string | null;
  status: 'active' | 'sold' | 'removed';
  created_at: string;
  seller_username?: string;
  seller_image_url?: string | null;
};

// ===== Chat / DM Types =====

export type Conversation = {
  id: string;
  participant_a: string;
  participant_b: string;
  last_message: string | null;
  last_message_at: string | null;
  created_at: string;
  other_user_id?: string;
  other_username?: string;
  other_image_url?: string | null;
  unread_count?: number;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  read: boolean;
  created_at: string;
  sender_username?: string;
  sender_image_url?: string | null;
};