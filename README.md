# 🐀 RAT — Social Feed App

RAT is a full-stack social feed application built with **Next.js 16 (App Router)**, **TypeScript**, **Tailwind CSS v4**, and **Vercel Postgres**. It's a modern, mobile-first social platform with a post feed, image posts, likes, comments, follows, notifications, profile management, sharing, and a personalized news feed — all wrapped in a clean, rounded, blue-accented UI.

> **R.A.T** — a social media experience where you can share, react, comment, follow, and stay in the loop with trending news — all in one place.

---

## ✨ Features

### 🏠 Social Feed
- **For You / Following tabs** — browse posts from everyone or only from people you follow
- **Randomized post order** — the feed shuffles posts so every refresh feels fresh
- **Infinite scroll pagination** — 30 posts load at a time with a "Load more posts" button and de-duplication by post ID
- **Post creation** — currently **text-only** posts (image upload is disabled until a valid `BLOB_READ_WRITE_TOKEN` is configured)
- **Image feed** — visual grid of image posts

### ❤️ Engagement
- **Likes** — tap to like/unlike, with live counts (creates a notification for the author)
- **Comments** — add and delete comments inline
- **Follow / Unfollow** — follow other creators to build your feed

### 🔔 Notifications
- Bell icon in the nav with an **unread badge**
- Real-time-ish refresh (polling every 30s)
- Mark individual or **all-as-read** actions
- Notifications for likes, comments, and new interactions, with links back to the feed

### 📰 Trending News
- **News icon in the header** on Home & News pages — tap it to jump straight to the news feed
- **Category selector** — Technology, Business, Entertainment, General, Health, Science, Sports
- **Add your own interests** — type any topic (e.g. *movies*, *cars*, *space*) to create a personalized news query. Your interests become tappable chips you can switch between or remove
- **True infinite scroll** — keeps loading the next page of headlines until you stop scrolling
- Backed by a server-side API route (keeps your `NEWS_API_KEY` secret) with 1-hour revalidation + 5s timeout guard

### 👤 Accounts & Profiles
- Sign up / Log in with **bcrypt-hashed passwords**
- Cookie-based session (1-week, httpOnly)
- Profile page with **avatar, bio, location, birth year, date of birth**
- Edit profile
- Log out

### 📤 Sharing
- **Share drawer** — modern bottom-sheet with real brand icons
- Share to **WhatsApp, Telegram, TikTok, Instagram, X (Twitter)**, or **copy link**

### 🎨 UX Touches
- **Dynamic greetings** — time-aware greetings (morning/afternoon/evening/night) with emoji and animated gradients (Framer Motion)
- **Dynamic tagline** — rotating messages under the logo
- **Skeleton loading** for news and feeds
- Fully responsive: bottom nav bar on mobile, sidebar-friendly on desktop

---

## 🧰 Tech Stack

| Layer | Tech |
|-------|------|
| Framework | [Next.js 16](https://nextjs.org) (App Router, Server & Client Components) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 + CSS variables |
| Database | [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres) (`@vercel/postgres`) |
| Auth | Cookie-based sessions + bcrypt password hashing |
| Animation | Framer Motion |
| Icons | Heroicons + Lucide React |
| Forms | react-hook-form + Zod |
| News | [NewsAPI.org](https://newsapi.org) (server-side proxy route) |

---

## 📁 Project Structure

```
rat/
├── app/
│   ├── page.tsx              # Landing / entry page
│   ├── layout.tsx            # Root layout
│   ├── globals.css           # Global styles + keyframes
│   ├── login/                # Login page + form
│   ├── signup/               # Signup page + form
│   ├── account/              # Account profile page
│   ├── notes/                # Notes page
│   ├── Rat/                  # Main authenticated app
│   │   ├── home/page.tsx     # Feed (For You / Following) + news icon header
│   │   ├── feed/page.tsx     # Image feed
│   │   ├── create/page.tsx   # Create post
│   │   ├── news/page.tsx     # News feed page
│   │   ├── Notification/     # Notifications page
│   │   ├── account/          # Account page + edit profile
│   │   └── layout.tsx
│   ├── api/                  # Route handlers
│   │   ├── posts/            # GET/POST posts, seed endpoint
│   │   ├── likes/            # Like/unlike
│   │   ├── comments/         # Comments CRUD
│   │   ├── follows/          # Follow/unfollow
│   │   ├── notifications/    # Notifications + read states
│   │   ├── news/             # News proxy (route.ts + newsapi.ts helper)
│   │   ├── share/            # Share actions
│   │   ├── signup/ session/ seed/ init-db/
│   ├── components/           # Shared UI (PostFeed, NewsFeed, NotificationBell, …)
│   ├── ui/                   # Nav, share drawer, logo, forms
│   ├── lib/                  # action.ts (server actions), data/definitions, SQL init
│   └── utils/db/             # DB clients (neon)
├── public/                   # Brand icons, SVG assets
└── ...config files
```

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js 18.18+** (or 20+ recommended)
- **pnpm**, npm, or yarn
- A **Vercel Postgres** (or Postgres-compatible) database
- A free **NewsAPI.org** API key (*optional* — news feed degrades gracefully if missing)

### 2. Install dependencies

```bash
cd rat
pnpm install
# or: npm install / yarn
```

### 3. Configure environment variables

Create a `.env.local` in the `rat/` directory:

```bash
# Vercel Postgres connection (from your Vercel Postgres dashboard)
POSTGRES_URL=postgres://...
# or the individual parts:
POSTGRES_HOST=...
POSTGRES_USER=...
POSTGRES_PASSWORD=...
POSTGRES_DATABASE=...

# NewsAPI.org key (optional, enables the news feed)
NEWS_API_KEY=your_newsapi_key_here

# Optional: Neon database URL (if using Neon via utils/db)
DATABASE_URL=postgres://...

# Vercel Blob (REQUIRED only if you re-enable image uploads)
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxx
```

### 4. Initialize the database

The schema lives in `app/lib/db/init.sql`. Run it in your Postgres database (e.g. via `psql` or your DB's SQL editor) to create **users, profiles, posts, comments, likes, follows, notifications**, plus seed users, profiles, and 20 sample posts.

You can also hit the **init-db** or **seed** endpoints after booting the app:

```bash
# Start the dev server first, then:
curl http://localhost:3000/api/init-db        # runs the full schema + migrations
curl -X POST http://localhost:3000/api/posts/seed   # non-destructive, idempotent
```

> **If you get `column "images" of relation "posts" does not exist`:** your `posts` table is missing the `images` column that the app reads. Run the ready-made migration `app/lib/db/migrate-images.sql` once against your database (or hit `GET /api/init-db`). The core statement is:
>
> ```sql
> ALTER TABLE posts ADD COLUMN IF NOT EXISTS images JSONB DEFAULT '[]'::jsonb;
> ```

### 5. Run the dev server

```bash
pnpm dev
# or: npm run dev
```

Open **[http://localhost:3000](http://localhost:3000)** and sign up for an account — you're in! 🎉

---

## 🧪 Useful Commands

```bash
pnpm dev          # Start the dev server
pnpm build        # Production build
pnpm start        # Start the production server
pnpm lint         # Run ESLint
npx tsc --noEmit  # Type-check without emitting
```

---

## 🔌 API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/posts?limit=&offset=` | Paginated post feed (randomized) |
| `POST` | `/api/posts` | Create a post (form data: caption, imageBase64) |
| `POST` | `/api/posts/seed` | Insert more seed posts (idempotent, `ON CONFLICT DO NOTHING`) |
| `GET/POST` | `/api/likes` | Like state & toggle likes |
| `GET/POST` | `/api/comments` | Fetch & add comments |
| `GET/POST` | `/api/follows` | Fetch & toggle follows |
| `GET/POST/PATCH` | `/api/notifications` | Fetch, create, mark-notifications-read |
| `GET/POST` | `/api/news?category=&q=&limit=&page=` | News proxy (server-side `NEWS_API_KEY`), custom topic via `q` |
| `POST` | `/api/share` | Record a share action |
| `POST` | `/api/signup` | Create account |
| `GET` | `/api/session` | Read session |
| `POST` | `/api/seed` | Seed the database |

---

## 🗄️ Database Schema

- **users** — `id`, `username`, `email`, `password` (bcrypt), `created_at`
- **profiles** — `user_id`, `username`, `email`, `gender`, `bio`, `location`, `image_url`, `birth_year`, `date_of_birth`
- **posts** — `image_url`, `caption`, `user_id`, `user_email`, `view_count`, `created_at`
- **comments** — `post_id`, `user_id`, `content`, `created_at`
- **likes** — `post_id`, `user_id` (unique pair), `created_at`
- **follows** — `follower_id`, `following_id` (unique pair), `created_at`
- **notifications** — `user_id`, `type`, `message`, `link`, `read`, `created_at`

---

## 🧠 Notes & Tips

- **News feed**: if no `NEWS_API_KEY` is set or the API is unreachable (e.g. VPN/network blocks), the feed shows a friendly "temporarily unavailable" message instead of crashing.
- **Session**: simple, secure httpOnly cookie named `rat_session`, valid for 7 days.
- **Seed data**: 20 demo users + 60+ posts are available. `POST /api/posts/seed` inserts only *new* rows — it never wipes or duplicates data.
- **Pagination**: the feed defaults to 30 posts per page; load more to keep scrolling indefinitely.

---

## 📚 Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Learn Next.js](https://nextjs.org/learn)
- [Tailwind CSS v4](https://tailwindcss.com)
- [Vercel Postgres](https://vercel.com/docs/storage/vercel-postgres)
- [NewsAPI.org](https://newsapi.org)

## ☁️ Deploy on Vercel

The easiest way to deploy is the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme).

Set the same environment variables above in your Vercel project settings, then push — that's it.

---

*Built with ⚡ Next.js, 💙 Vercel Postgres & a whole lot of ☕.*
