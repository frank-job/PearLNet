// Verify seeded views for the fresh posts.
// Run with:  node scripts/verify-views.mjs  (from the rat/ directory)
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
const sql = postgres(connectionString, { ssl: 'require' });

const totalViews = await sql`
  SELECT COALESCE(SUM(view_count), 0)::int AS total FROM posts WHERE id::text LIKE 'f2a3b4c5-%'
`;
console.log('Total view_count across fresh posts:', totalViews[0].total);

const withZero = await sql`
  SELECT count(*)::int AS cnt FROM posts WHERE id::text LIKE 'f2a3b4c5-%' AND COALESCE(view_count, 0) = 0
`;
console.log('Fresh posts with 0 views:', withZero[0].cnt);

const top10 = await sql`
  SELECT id, view_count FROM posts WHERE id::text LIKE 'f2a3b4c5-%'
  ORDER BY view_count DESC LIMIT 10
`;
console.log('Top 10 fresh posts by views:');
for (const r of top10) console.log(`- post ${r.id.slice(0, 8)}… → ${r.view_count} views`);

const pvTotal = await sql`
  SELECT count(*)::int AS cnt FROM post_views WHERE post_id::text LIKE 'f2a3b4c5-%'
`;
console.log('Total post_views rows for fresh posts:', pvTotal[0].cnt);

await sql.end();

