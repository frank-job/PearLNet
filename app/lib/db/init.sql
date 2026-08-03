-- ============================================================
-- RAT App - Database Initialization Script
-- Run this in your Supabase SQL Editor or via psql
-- ============================================================

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(255) NOT NULL UNIQUE,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. PROFILES TABLE
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
  username VARCHAR(255),
  email VARCHAR(255),
  gender VARCHAR(16) DEFAULT 'other',
  bio TEXT DEFAULT 'Hello! I am new to Handcrafted.',
  location TEXT DEFAULT '',
  image_url TEXT,
  birth_year INTEGER,
  date_of_birth DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. POSTS TABLE
CREATE TABLE IF NOT EXISTS posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  image_url TEXT,
  caption TEXT,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  user_email VARCHAR(255),
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMMENTS TABLE
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  user_email VARCHAR(255),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. LIKES TABLE
CREATE TABLE IF NOT EXISTS likes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(post_id, user_id)
);

-- 6. FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS follows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(follower_id, following_id)
);

-- 7. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL DEFAULT 'follow',
  message TEXT NOT NULL,
  link TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================
-- Migrations: Add missing columns to existing tables
-- ============================================================

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE posts ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
END $$;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'image_url' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE posts ALTER COLUMN image_url DROP NOT NULL;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'notifications' AND column_name = 'link'
  ) THEN
    ALTER TABLE notifications ADD COLUMN link TEXT;
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'images'
  ) THEN
    ALTER TABLE posts ADD COLUMN images JSONB DEFAULT '[]'::jsonb;
  END IF;
END $$;

-- ============================================================
-- SEED DATA: Sample users, profiles, and posts
-- ============================================================

-- Seed users
INSERT INTO users (id, username, email, password, created_at) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'frank_dev', 'frank_dev@example.com', 'seedpass123', NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'handcrafted_haven', 'handcrafted_haven@example.com', 'seedpass123', NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'maya_design', 'maya_design@example.com', 'seedpass123', NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'wood_master', 'wood_master@example.com', 'seedpass123', NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'jdm_vibes', 'jdm_vibes@example.com', 'seedpass123', NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'sarah_create', 'sarah_create@example.com', 'seedpass123', NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567807', 'mark_tech', 'mark_tech@example.com', 'seedpass123', NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567808', 'elena_ceramics', 'elena_ceramics@example.com', 'seedpass123', NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567809', 'city_snaps', 'city_snaps@example.com', 'seedpass123', NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567810', 'dev_lina', 'dev_lina@example.com', 'seedpass123', NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567811', 'retro_finds', 'retro_finds@example.com', 'seedpass123', NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567812', 'plant_dad', 'plant_dad@example.com', 'seedpass123', NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567813', 'hike_life', 'hike_life@example.com', 'seedpass123', NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567814', 'pixel_perfect', 'pixel_perfect@example.com', 'seedpass123', NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567815', 'hide_and_seek', 'hide_and_seek@example.com', 'seedpass123', NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567816', 'chef_kitchen', 'chef_kitchen@example.com', 'seedpass123', NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567817', 'remote_work', 'remote_work@example.com', 'seedpass123', NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567818', 'shine_bright', 'shine_bright@example.com', 'seedpass123', NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567819', 'arch_daily', 'arch_daily@example.com', 'seedpass123', NOW()),
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567820', 'neon_beats', 'neon_beats@example.com', 'seedpass123', NOW())
ON CONFLICT (username) DO NOTHING;

-- Seed profiles
INSERT INTO profiles (id, user_id, username, email, image_url, created_at) VALUES
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567801', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'frank_dev', 'frank_dev@example.com', 'https://i.pravatar.cc/150?u=1', NOW()),
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567802', 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'handcrafted_haven', 'handcrafted_haven@example.com', 'https://i.pravatar.cc/150?u=2', NOW()),
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567803', 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'maya_design', 'maya_design@example.com', 'https://i.pravatar.cc/150?u=3', NOW()),
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567804', 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'wood_master', 'wood_master@example.com', 'https://i.pravatar.cc/150?u=4', NOW()),
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567805', 'a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'jdm_vibes', 'jdm_vibes@example.com', 'https://i.pravatar.cc/150?u=5', NOW()),
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567806', 'a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'sarah_create', 'sarah_create@example.com', 'https://i.pravatar.cc/150?u=6', NOW()),
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567807', 'a1b2c3d4-e5f6-7890-abcd-ef1234567807', 'mark_tech', 'mark_tech@example.com', 'https://i.pravatar.cc/150?u=7', NOW()),
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567808', 'a1b2c3d4-e5f6-7890-abcd-ef1234567808', 'elena_ceramics', 'elena_ceramics@example.com', 'https://i.pravatar.cc/150?u=8', NOW()),
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567809', 'a1b2c3d4-e5f6-7890-abcd-ef1234567809', 'city_snaps', 'city_snaps@example.com', 'https://i.pravatar.cc/150?u=9', NOW()),
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567810', 'a1b2c3d4-e5f6-7890-abcd-ef1234567810', 'dev_lina', 'dev_lina@example.com', 'https://i.pravatar.cc/150?u=10', NOW()),
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567811', 'a1b2c3d4-e5f6-7890-abcd-ef1234567811', 'retro_finds', 'retro_finds@example.com', 'https://i.pravatar.cc/150?u=11', NOW()),
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567812', 'a1b2c3d4-e5f6-7890-abcd-ef1234567812', 'plant_dad', 'plant_dad@example.com', 'https://i.pravatar.cc/150?u=12', NOW()),
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567813', 'a1b2c3d4-e5f6-7890-abcd-ef1234567813', 'hike_life', 'hike_life@example.com', 'https://i.pravatar.cc/150?u=13', NOW()),
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567814', 'a1b2c3d4-e5f6-7890-abcd-ef1234567814', 'pixel_perfect', 'pixel_perfect@example.com', 'https://i.pravatar.cc/150?u=14', NOW()),
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567815', 'a1b2c3d4-e5f6-7890-abcd-ef1234567815', 'hide_and_seek', 'hide_and_seek@example.com', 'https://i.pravatar.cc/150?u=15', NOW()),
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567816', 'a1b2c3d4-e5f6-7890-abcd-ef1234567816', 'chef_kitchen', 'chef_kitchen@example.com', 'https://i.pravatar.cc/150?u=16', NOW()),
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567817', 'a1b2c3d4-e5f6-7890-abcd-ef1234567817', 'remote_work', 'remote_work@example.com', 'https://i.pravatar.cc/150?u=17', NOW()),
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567818', 'a1b2c3d4-e5f6-7890-abcd-ef1234567818', 'shine_bright', 'shine_bright@example.com', 'https://i.pravatar.cc/150?u=18', NOW()),
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567819', 'a1b2c3d4-e5f6-7890-abcd-ef1234567819', 'arch_daily', 'arch_daily@example.com', 'https://i.pravatar.cc/150?u=19', NOW()),
  ('p1b2c3d4-e5f6-7890-abcd-ef1234567820', 'a1b2c3d4-e5f6-7890-abcd-ef1234567820', 'neon_beats', 'neon_beats@example.com', 'https://i.pravatar.cc/150?u=20', NOW())
ON CONFLICT (user_id) DO NOTHING;

-- Seed posts
INSERT INTO posts (id, image_url, caption, user_id, user_email, view_count, created_at) VALUES
  ('b1c2d3e4-f5a6-7890-bcde-f12345678001', 'https://picsum.photos/seed/dev1/800/1200', 'Best car wallpaper for the developer 🏎️ #coding #setup', 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', 'frank_dev@example.com', 0, NOW() - INTERVAL '1 day'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678002', 'https://picsum.photos/seed/pottery/800/1200', 'Just finished this hand-thrown ceramic vase. The glaze came out perfect! ✨', 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', 'handcrafted_haven@example.com', 0, NOW() - INTERVAL '1 day'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678003', 'https://picsum.photos/seed/minimal/800/1200', 'Less is more. A clean desk is a clean mind. 💻 #minimalism', 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', 'maya_design@example.com', 0, NOW() - INTERVAL '2 days'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678004', 'https://picsum.photos/seed/wood/800/1200', 'Polishing this walnut table today. Nature''s patterns are unbeatable. 🌲', 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', 'wood_master@example.com', 0, NOW() - INTERVAL '2 days'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678005', 'https://picsum.photos/seed/car2/800/1200', 'Night drives and city lights. The perfect aesthetic. 🌃🏎️', 'a1b2c3d4-e5f6-7890-abcd-ef1234567805', 'jdm_vibes@example.com', 0, NOW() - INTERVAL '3 days'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678006', 'https://picsum.photos/seed/art/800/1200', 'Back in the studio. Watercolor mornings are the best mornings. 🎨', 'a1b2c3d4-e5f6-7890-abcd-ef1234567806', 'sarah_create@example.com', 0, NOW() - INTERVAL '3 days'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678007', 'https://picsum.photos/seed/gpu/800/1200', 'The build is finally complete. 4090 never looked so good. 🖥️⚡', 'a1b2c3d4-e5f6-7890-abcd-ef1234567807', 'mark_tech@example.com', 0, NOW() - INTERVAL '4 days'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678008', 'https://picsum.photos/seed/clay/800/1200', 'Earth and fire. Hand-carved details on today''s batch. 🏺', 'a1b2c3d4-e5f6-7890-abcd-ef1234567808', 'elena_ceramics@example.com', 0, NOW() - INTERVAL '4 days'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678009', 'https://picsum.photos/seed/city/800/1200', 'Hidden alleys in Tokyo. There is beauty in every corner. 🏮', 'a1b2c3d4-e5f6-7890-abcd-ef1234567809', 'city_snaps@example.com', 0, NOW() - INTERVAL '5 days'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678010', 'https://picsum.photos/seed/code/800/1200', 'Debugging is just being the detective in a crime movie where you are also the murderer. 🕵️‍♀️💻', 'a1b2c3d4-e5f6-7890-abcd-ef1234567810', 'dev_lina@example.com', 0, NOW() - INTERVAL '5 days'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678011', 'https://picsum.photos/seed/retro/800/1200', 'Found this 1970s film camera at a local market. Can''t wait to test it! 📸', 'a1b2c3d4-e5f6-7890-abcd-ef1234567811', 'retro_finds@example.com', 0, NOW() - INTERVAL '6 days'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678012', 'https://picsum.photos/seed/plants/800/1200', 'My indoor jungle is growing. New leaf on the Monstera! 🌿🍃', 'a1b2c3d4-e5f6-7890-abcd-ef1234567812', 'plant_dad@example.com', 0, NOW() - INTERVAL '6 days'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678013', 'https://picsum.photos/seed/mountain/800/1200', 'The view from the top makes the climb worth it. 🏔️☀️', 'a1b2c3d4-e5f6-7890-abcd-ef1234567813', 'hike_life@example.com', 0, NOW() - INTERVAL '7 days'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678014', 'https://picsum.photos/seed/ui/800/1200', 'Working on a new dark mode dashboard. Thoughts on the contrast? 🟦⬛', 'a1b2c3d4-e5f6-7890-abcd-ef1234567814', 'pixel_perfect@example.com', 0, NOW() - INTERVAL '7 days'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678015', 'https://picsum.photos/seed/leather/800/1200', 'Hand-stitched card holder. Built to last a lifetime. 💼🛠️', 'a1b2c3d4-e5f6-7890-abcd-ef1234567815', 'hide_and_seek@example.com', 0, NOW() - INTERVAL '8 days'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678016', 'https://picsum.photos/seed/food/800/1200', 'Fresh ingredients, simple flavors. The secret to great pasta. 🍝🍅', 'a1b2c3d4-e5f6-7890-abcd-ef1234567816', 'chef_kitchen@example.com', 0, NOW() - INTERVAL '8 days'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678017', 'https://picsum.photos/seed/beach/800/1200', 'My office for the week. Grateful for the remote life. 🌊💻', 'a1b2c3d4-e5f6-7890-abcd-ef1234567817', 'remote_work@example.com', 0, NOW() - INTERVAL '9 days'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678018', 'https://picsum.photos/seed/car_detail/800/1200', 'Ceramic coating finished. That reflection is like a mirror! ✨🚘', 'a1b2c3d4-e5f6-7890-abcd-ef1234567818', 'shine_bright@example.com', 0, NOW() - INTERVAL '9 days'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678019', 'https://picsum.photos/seed/building/800/1200', 'Modern brutalism. Raw concrete and sharp angles. 🏛️📐', 'a1b2c3d4-e5f6-7890-abcd-ef1234567819', 'arch_daily@example.com', 0, NOW() - INTERVAL '10 days'),
  ('b1c2d3e4-f5a6-7890-bcde-f12345678020', 'https://picsum.photos/seed/synth/800/1200', 'Cooking up some retro-futuristic beats tonight. 🎹🌌', 'a1b2c3d4-e5f6-7890-abcd-ef1234567820', 'neon_beats@example.com', 0, NOW() - INTERVAL '10 days')
ON CONFLICT (id) DO NOTHING;

-- ============================================================
-- INDEXES for performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id);
CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id);
CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id);

