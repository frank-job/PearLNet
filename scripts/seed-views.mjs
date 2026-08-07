// Seed views for the 50 fresh posts (fast, bulk version).
// - Cleans up any previously seeded 'seed-*' post_views rows.
// - Sets view_count to a random value (30-400) per post.
// - Inserts matching post_views rows in bulk via generate_series.
// Run with:  node scripts/seed-views.mjs  (from the rat/ directory)
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

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function main() {
  const sql = postgres(connectionString, { ssl: 'require' });

  const posts = await sql`
    SELECT id FROM posts WHERE id::text LIKE 'f2a3b4c5-%' ORDER BY id
  `;
  console.log(`Found ${posts.length} fresh posts to give views.`);

  // 1. Clean up any previously seeded 'seed-*' post_views rows for fresh posts.
  const cleaned = await sql`
    DELETE FROM post_views WHERE guest_id LIKE 'seed-%' AND post_id::text LIKE 'f2a3b4c5-%'
  `;
  console.log(`Cleaned up ${cleaned.count} old seed view rows.`);

  let totalViews = 0;

  for (const post of posts) {
    const viewCount = randInt(30, 400);

    // Set view_count directly (one query).
    await sql`
      UPDATE posts SET view_count = ${viewCount} WHERE id = ${post.id}
    `;

    // Bulk-insert matching post_views rows in a single query.
    await sql`
      INSERT INTO post_views (post_id, guest_id)
      SELECT ${post.id}, 'seed-' || LEFT(${post.id}::text, 8) || '-' || g
      FROM generate_series(0, ${viewCount - 1}) AS g
    `;

    totalViews += viewCount;
  }

  console.log(`Seeded ${totalViews} views across ${posts.length} posts.`);
  await sql.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed views error:', err);
  process.exit(1);
});
