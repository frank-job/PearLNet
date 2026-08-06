-- ============================================================
-- RAT App - Database Migration
-- Fixes: column "images" of relation "posts" does not exist
--
-- Run this ONCE in your database (Vercel Postgres SQL editor,
-- Neon SQL editor, or `psql -f migrate-images.sql`).
-- It is idempotent (safe to run multiple times).
-- ============================================================

-- 1) Add the missing "images" column for multi-image posts.
--    JSONB array of image URLs. Defaults to an empty array.
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;

-- 2) Make sure image_url stays nullable (text-only posts store NULL here).
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'image_url' AND is_nullable = 'NO'
  ) THEN
    ALTER TABLE posts ALTER COLUMN image_url DROP NOT NULL;
  END IF;
END $$;

-- 3) Ensure view_count exists (some older schemas are missing it).
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'posts' AND column_name = 'view_count'
  ) THEN
    ALTER TABLE posts ADD COLUMN view_count INTEGER DEFAULT 0;
  END IF;
END $$;

-- ============================================================
-- Optional: Backfill the new images column for existing posts
-- that only have image_url set, so multi-image rendering works.
-- ============================================================
UPDATE posts
SET images = CASE
  WHEN image_url IS NOT NULL AND image_url <> '' THEN jsonb_build_array(image_url)
  ELSE '[]'::jsonb
END
WHERE images IS NULL OR images = '[]'::jsonb;

-- ============================================================
-- Verify the fix
-- ============================================================
-- SELECT column_name FROM information_schema.columns
-- WHERE table_name = 'posts' ORDER BY ordinal_position;
