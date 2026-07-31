import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';
import { readFileSync } from 'fs';
import { join } from 'path';

export async function GET() {
  try {
    const schemaPath = join(process.cwd(), 'app', 'lib', 'db', 'init.sql');
    const schema = readFileSync(schemaPath, 'utf-8');

    // Execute the full schema as a multi-statement query
    await sql.query(schema);

    return NextResponse.json({
      message: 'Database initialized successfully. Tables created: users, profiles, posts, comments, likes, follows',
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error('Init DB error:', message);
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

