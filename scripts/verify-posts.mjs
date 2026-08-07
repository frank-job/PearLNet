// Verify the seeded posts in the DB.
// Run with:  node scripts/verify-posts.mjs  (from the rat/ directory)
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

const result = await sql`SELECT count(*)::int AS cnt FROM posts`;
console.log('Total posts in DB:', result[0].cnt);

const rows = await sql`SELECT caption, user_email FROM posts ORDER BY created_at DESC LIMIT 5`;
for (const r of rows) console.log(`- [${r.user_email}] ${r.caption}`);

await sql.end();

