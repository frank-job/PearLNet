// Verify seeded likes in the DB.
// Run with:  node scripts/verify-likes.mjs  (from the rat/ directory)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import postgres from 'postgres';

function loadEnv(file) {
  const content = fs.readFileSync(file, 'utf8');
  for (const line of content.split(/\r?\n/)) {
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
const sql = postgres(connectionString, { ssl: 'require' });

const total = await sql`SELECT count(*)::int AS cnt FROM likes`;
console.log('Total likes in DB:', total[0].cnt);

const fresh = await sql`
  SELECT l.post_id, count(*)::int AS likes
  FROM likes l
  WHERE l.post_id::text LIKE 'f2a3b4c5-%'
  GROUP BY l.post_id
  ORDER BY likes DESC
  LIMIT 10
`;
console.log('Top 10 fresh posts by likes:');
for (const r of fresh) console.log(`- post ${r.post_id.slice(0, 8)}… → ${r.likes} likes`);

const noLikes = await sql`
  SELECT count(*)::int AS cnt FROM posts WHERE id::text LIKE 'f2a3b4c5-%'
  AND id NOT IN (SELECT post_id FROM likes WHERE post_id::text LIKE 'f2a3b4c5-%')
`;
console.log('Fresh posts with 0 likes:', noLikes[0].cnt);

await sql.end();

