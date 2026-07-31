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
