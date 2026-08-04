import { NextRequest, NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

const SEED_USERS = [
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567801', username: 'frank_dev', email: 'frank_dev@example.com', password: 'seedpass123' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567802', username: 'handcrafted_haven', email: 'handcrafted_haven@example.com', password: 'seedpass123' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567803', username: 'maya_design', email: 'maya_design@example.com', password: 'seedpass123' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567804', username: 'wood_master', email: 'wood_master@example.com', password: 'seedpass123' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567805', username: 'jdm_vibes', email: 'jdm_vibes@example.com', password: 'seedpass123' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567806', username: 'sarah_create', email: 'sarah_create@example.com', password: 'seedpass123' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567807', username: 'mark_tech', email: 'mark_tech@example.com', password: 'seedpass123' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567808', username: 'elena_ceramics', email: 'elena_ceramics@example.com', password: 'seedpass123' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567809', username: 'city_snaps', email: 'city_snaps@example.com', password: 'seedpass123' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567810', username: 'dev_lina', email: 'dev_lina@example.com', password: 'seedpass123' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567811', username: 'retro_finds', email: 'retro_finds@example.com', password: 'seedpass123' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567812', username: 'plant_dad', email: 'plant_dad@example.com', password: 'seedpass123' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567813', username: 'hike_life', email: 'hike_life@example.com', password: 'seedpass123' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567814', username: 'pixel_perfect', email: 'pixel_perfect@example.com', password: 'seedpass123' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567815', username: 'hide_and_seek', email: 'hide_and_seek@example.com', password: 'seedpass123' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567816', username: 'chef_kitchen', email: 'chef_kitchen@example.com', password: 'seedpass123' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567817', username: 'remote_work', email: 'remote_work@example.com', password: 'seedpass123' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567818', username: 'shine_bright', email: 'shine_bright@example.com', password: 'seedpass123' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567819', username: 'arch_daily', email: 'arch_daily@example.com', password: 'seedpass123' },
  { id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567820', username: 'neon_beats', email: 'neon_beats@example.com', password: 'seedpass123' },
];

const SEED_PROFILES = SEED_USERS.map((u) => ({
  user_id: u.id,
  username: u.username,
  email: u.email,
  image_url: `https://i.pravatar.cc/150?u=${u.id}`,
}));

const SEED_POSTS = [
  { image_url: 'https://picsum.photos/seed/dev1/800/1200', caption: 'Best car wallpaper for the developer 🏎️ #coding #setup', user_id: SEED_USERS[0].id, user_email: SEED_USERS[0].email },
  { image_url: 'https://picsum.photos/seed/pottery/800/1200', caption: 'Just finished this hand-thrown ceramic vase. The glaze came out perfect! ✨', user_id: SEED_USERS[1].id, user_email: SEED_USERS[1].email },
  { image_url: 'https://picsum.photos/seed/minimal/800/1200', caption: 'Less is more. A clean desk is a clean mind. 💻 #minimalism', user_id: SEED_USERS[2].id, user_email: SEED_USERS[2].email },
  { image_url: 'https://picsum.photos/seed/wood/800/1200', caption: "Polishing this walnut table today. Nature's patterns are unbeatable. 🌲", user_id: SEED_USERS[3].id, user_email: SEED_USERS[3].email },
  { image_url: 'https://picsum.photos/seed/car2/800/1200', caption: 'Night drives and city lights. The perfect aesthetic. 🌃🏎️', user_id: SEED_USERS[4].id, user_email: SEED_USERS[4].email },
  { image_url: 'https://picsum.photos/seed/art/800/1200', caption: 'Back in the studio. Watercolor mornings are the best mornings. 🎨', user_id: SEED_USERS[5].id, user_email: SEED_USERS[5].email },
  { image_url: 'https://picsum.photos/seed/gpu/800/1200', caption: 'The build is finally complete. 4090 never looked so good. 🖥️⚡', user_id: SEED_USERS[6].id, user_email: SEED_USERS[6].email },
  { image_url: 'https://picsum.photos/seed/clay/800/1200', caption: "Earth and fire. Hand-carved details on today's batch. 🏺", user_id: SEED_USERS[7].id, user_email: SEED_USERS[7].email },
  { image_url: 'https://picsum.photos/seed/city/800/1200', caption: 'Hidden alleys in Tokyo. There is beauty in every corner. 🏮', user_id: SEED_USERS[8].id, user_email: SEED_USERS[8].email },
  { image_url: 'https://picsum.photos/seed/code/800/1200', caption: 'Debugging is just being the detective in a crime movie where you are also the murderer. 🕵️‍♀️💻', user_id: SEED_USERS[9].id, user_email: SEED_USERS[9].email },
  { image_url: 'https://picsum.photos/seed/retro/800/1200', caption: "Found this 1970s film camera at a local market. Can't wait to test it! 📸", user_id: SEED_USERS[10].id, user_email: SEED_USERS[10].email },
  { image_url: 'https://picsum.photos/seed/plants/800/1200', caption: 'My indoor jungle is growing. New leaf on the Monstera! 🌿🍃', user_id: SEED_USERS[11].id, user_email: SEED_USERS[11].email },
  { image_url: 'https://picsum.photos/seed/mountain/800/1200', caption: 'The view from the top makes the climb worth it. 🏔️☀️', user_id: SEED_USERS[12].id, user_email: SEED_USERS[12].email },
  { image_url: 'https://picsum.photos/seed/ui/800/1200', caption: 'Working on a new dark mode dashboard. Thoughts on the contrast? 🟦⬛', user_id: SEED_USERS[13].id, user_email: SEED_USERS[13].email },
  { image_url: 'https://picsum.photos/seed/leather/800/1200', caption: 'Hand-stitched card holder. Built to last a lifetime. 💼🛠️', user_id: SEED_USERS[14].id, user_email: SEED_USERS[14].email },
  { image_url: 'https://picsum.photos/seed/food/800/1200', caption: 'Fresh ingredients, simple flavors. The secret to great pasta. 🍝🍅', user_id: SEED_USERS[15].id, user_email: SEED_USERS[15].email },
  { image_url: 'https://picsum.photos/seed/beach/800/1200', caption: 'My office for the week. Grateful for the remote life. 🌊💻', user_id: SEED_USERS[16].id, user_email: SEED_USERS[16].email },
  { image_url: 'https://picsum.photos/seed/car_detail/800/1200', caption: 'Ceramic coating finished. That reflection is like a mirror! ✨🚘', user_id: SEED_USERS[17].id, user_email: SEED_USERS[17].email },
  { image_url: 'https://picsum.photos/seed/building/800/1200', caption: 'Modern brutalism. Raw concrete and sharp angles. 🏛️📐', user_id: SEED_USERS[18].id, user_email: SEED_USERS[18].email },
  { image_url: 'https://picsum.photos/seed/synth/800/1200', caption: 'Cooking up some retro-futuristic beats tonight. 🎹🌌', user_id: SEED_USERS[19].id, user_email: SEED_USERS[19].email },
];

export async function GET() {
  return handleSeed();
}

export async function POST() {
  return handleSeed();
}

async function handleSeed() {
  try {
    const dropTables = `
      DROP TABLE IF EXISTS post_views CASCADE;
      DROP TABLE IF EXISTS notifications CASCADE;
      DROP TABLE IF EXISTS follows CASCADE;
      DROP TABLE IF EXISTS likes CASCADE;
      DROP TABLE IF EXISTS comments CASCADE;
      DROP TABLE IF EXISTS posts CASCADE;
      DROP TABLE IF EXISTS profiles CASCADE;
      DROP TABLE IF EXISTS users CASCADE;
    `;
    await sql.query(dropTables);

    await sql.query(`
      CREATE TABLE users (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        username VARCHAR(255) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await sql.query(`
      CREATE TABLE profiles (
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
      )
    `);

    await sql.query(`
      CREATE TABLE posts (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        image_url TEXT,
        caption TEXT,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        user_email VARCHAR(255),
        view_count INTEGER DEFAULT 0,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await sql.query(`
      CREATE TABLE comments (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        content TEXT NOT NULL,
        user_email VARCHAR(255),
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await sql.query(`
      CREATE TABLE likes (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(post_id, user_id)
      )
    `);

    await sql.query(`
      CREATE TABLE follows (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        follower_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        following_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        created_at TIMESTAMPTZ DEFAULT NOW(),
        UNIQUE(follower_id, following_id)
      )
    `);

await sql.query(`
      CREATE TABLE notifications (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        type VARCHAR(20) NOT NULL DEFAULT 'follow',
        message TEXT NOT NULL,
        link TEXT,
        read BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await sql.query(`
      CREATE TABLE post_views (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        post_id UUID NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
        user_id UUID REFERENCES users(id) ON DELETE CASCADE,
        guest_id TEXT,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `);

    await sql.query(`
      CREATE UNIQUE INDEX idx_post_views_user
        ON post_views(post_id, user_id) WHERE user_id IS NOT NULL
    `);
    await sql.query(`
      CREATE UNIQUE INDEX idx_post_views_guest
        ON post_views(post_id, guest_id) WHERE guest_id IS NOT NULL
    `);

    for (const user of SEED_USERS) {
      await sql`
        INSERT INTO users (id, username, email, password)
        VALUES (${user.id}, ${user.username}, ${user.email}, ${user.password})
      `;
    }

    for (const profile of SEED_PROFILES) {
      await sql`
        INSERT INTO profiles (user_id, username, email, image_url)
        VALUES (${profile.user_id}, ${profile.username}, ${profile.email}, ${profile.image_url})
      `;
    }

    for (const post of SEED_POSTS) {
      await sql`
        INSERT INTO posts (image_url, caption, user_id, user_email)
        VALUES (${post.image_url}, ${post.caption}, ${post.user_id}, ${post.user_email})
      `;
    }

    await sql.query(`
      CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)
    `);
    await sql.query(`
      CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id)
    `);
    await sql.query(`
      CREATE INDEX IF NOT EXISTS idx_posts_user_id ON posts(user_id)
    `);
    await sql.query(`
      CREATE INDEX IF NOT EXISTS idx_comments_post_id ON comments(post_id)
    `);
    await sql.query(`
      CREATE INDEX IF NOT EXISTS idx_likes_post_id ON likes(post_id)
    `);
    await sql.query(`
      CREATE INDEX IF NOT EXISTS idx_follows_follower_id ON follows(follower_id)
    `);
    await sql.query(`
      CREATE INDEX IF NOT EXISTS idx_follows_following_id ON follows(following_id)
    `);

    return NextResponse.json({
      message: 'Database seeded successfully',
      users: SEED_USERS.length,
      posts: SEED_POSTS.length,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    console.error('Seed error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}