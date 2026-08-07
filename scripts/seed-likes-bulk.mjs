// Seed LIKES for the 50 fresh posts (bulk version).
// - Creates extra demo "liker" users in bulk via multi-row INSERT
// - Assigns a random number of likes (40-200) to each fresh post
// - Uses batch INSERTs for performance
// Run with:  node scripts/seed-likes-bulk.mjs  (from the rat/ directory)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

function loadEnv(file) {
  const content = fs.readFileSync(file, 'utf8');
  for (const line of content.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    let key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

const envFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env.local');
if (fs.existsSync(envFile)) loadEnv(envFile);

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('No POSTGRES_URL / DATABASE_URL found.');
  process.exit(1);
}

const NUM_EXTRA_USERS = 200;
const MIN_LIKES = 40;
const MAX_LIKES = 200;

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function fakeUuid(n) {
  return `eeeeeeee-0000-4000-8000-${String(n).padStart(12, '0')}`;
}

async function main() {
  const sql = postgres(connectionString, { ssl: 'require' });

  // 1. Create extra liker users in bulk via VALUES multi-row insert.
  console.log(`Creating/ensuring ${NUM_EXTRA_USERS} extra liker users...`);
  const userValues = [];
  const profileValues = [];
  for (let i = 1; i <= NUM_EXTRA_USERS; i++) {
    const id = fakeUuid(i);
    const username = `filler_user_${i}`;
    const email = `filler_user_${i}@example.com`;
    userValues.push({ id, username, email, password: 'seedpass123' });
    profileValues.push({ user_id: id, username, email, image_url: `https://i.pravatar.cc/150?u=${id}` });
  }
  // Batch insert users
  const batchSize = 50;
  for (let i = 0; i < userValues.length; i += batchSize) {
    const batch = userValues.slice(i, i + batchSize);
    await sql`
      INSERT INTO users ${sql(batch, 'id', 'username', 'email', 'password')}
      ON CONFLICT (username) DO NOTHING
    `;
    const pBatch = profileValues.slice(i, i + batchSize);
    await sql`
      INSERT INTO profiles ${sql(pBatch, 'user_id', 'username', 'email', 'image_url')}
      ON CONFLICT (user_id) DO NOTHING
    `;
  }
  console.log(`Extra liker users ensured.`);

  // 2. Grab ALL user ids.
  const allUsers = await sql`SELECT id, username FROM users`;
  console.log(`Total users available to like: ${allUsers.length}`);

  // 3. Get the 50 fresh posts.
  const posts = await sql`
    SELECT id, user_id FROM posts WHERE id::text LIKE 'f2a3b4c5-%' ORDER BY id
  `;
  console.log(`Found ${posts.length} fresh posts to like.`);

  let totalLikes = 0;
  let skipped = 0;

  for (const post of posts) {
    const numLikes = randInt(MIN_LIKES, MAX_LIKES);
    const shuffled = shuffle(allUsers);
    const likers = shuffled.slice(0, Math.min(numLikes, shuffled.length)).filter((u) => u.id !== post.user_id);
    skipped += (shuffled.length - likers.length);

    if (likers.length === 0) continue;

    // Batch insert all likes for this post
    const likeValues = likers.map((u) => ({ post_id: post.id, user_id: u.id }));
    const r = await sql`
      INSERT INTO likes ${sql(likeValues, 'post_id', 'user_id')}
      ON CONFLICT (post_id, user_id) DO NOTHING
    `;
    totalLikes += r.count ?? 0;
  }

  console.log(`Inserted ${totalLikes} new like(s). Skipped ${skipped} self-likes.`);
  await sql.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed likes error:', err);
  process.exit(1);
});

