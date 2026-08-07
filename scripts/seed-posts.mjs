// Standalone seed script for the 50 fresh posts.
// Uses Node 24 native TS type-stripping + the `postgres` package.
// Run with:  node scripts/seed-posts.mjs  (from the rat/ directory)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';
import { additionalPosts, SEED_USERS } from '../app/lib/additional-posts.ts';

// --- Load .env.local manually ---
function loadEnv(file) {
  const content = fs.readFileSync(file, 'utf8');
  for (const line of content.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq < 1) continue;
    let key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    // Strip surrounding quotes
    if ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'"))) {
      value = value.slice(1, -1);
    }
    if (!(key in process.env)) process.env[key] = value;
  }
}

const envFile = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env.local');
if (fs.existsSync(envFile)) loadEnv(envFile);
console.log('env file:', envFile, fs.existsSync(envFile) ? '(loaded)' : '(missing)');

const connectionString = process.env.POSTGRES_URL || process.env.DATABASE_URL;
if (!connectionString) {
  console.error('No POSTGRES_URL / DATABASE_URL found. Ensure .env.local is present.');
  process.exit(1);
}

async function main() {
  console.log('Connecting to DB...');
  const sql = postgres(connectionString, { ssl: 'require' });

  // 1. Ensure seed users exist (no-op if they already do).
  for (const user of SEED_USERS) {
    await sql`
      INSERT INTO users (id, username, email, password)
      VALUES (${user.id}, ${user.username}, ${user.email}, ${'seedpass123'})
      ON CONFLICT (id) DO NOTHING
    `;
  }
  console.log('Users ensured.');

  for (const user of SEED_USERS) {
    await sql`
      INSERT INTO profiles (user_id, username, email, image_url)
      VALUES (${user.id}, ${user.username}, ${user.email}, ${`https://i.pravatar.cc/150?u=${user.id}`})
      ON CONFLICT (user_id) DO NOTHING
    `;
  }
  console.log('Profiles ensured.');

  // 2. Insert the 50 posts.
  let inserted = 0;
  for (const post of additionalPosts) {
    const rows = await sql`
      INSERT INTO posts (id, image_url, caption, user_id, user_email)
      VALUES (${post.id}, ${post.image_url}, ${post.caption}, ${post.user_id}, ${post.user_email})
      ON CONFLICT (id) DO NOTHING
      RETURNING id
    `;
    if (rows.length > 0) inserted += 1;
  }

  console.log(`Seeded ${inserted} new post(s).`);
  await sql.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('Seed error:', err);
  process.exit(1);
});
