// Seeds a realistic-looking feed: named accounts, image posts, and matching
// likes / comments / views. Safe to re-run (every insert is idempotent).
// Run with: node scripts/seed-social.cjs
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const U = (id) => `seed-user-${id}`;

const PEOPLE = [
  {
    key: 'amara',
    name: 'Amara Okonkwo',
    username: 'amara.v',
    bio: 'Lagos-born, London-based. Style, travel, and too much coffee.',
    location: 'London, UK',
    avatar: 'https://i.pravatar.cc/300?img=47',
    verified: true,
  },
  {
    key: 'sofia',
    name: 'Sofia Marchetti',
    username: 'sofia.m',
    bio: 'Photographer. Chasing golden hour and good espresso.',
    location: 'Milan, Italy',
    avatar: 'https://i.pravatar.cc/300?img=45',
  },
  {
    key: 'priya',
    name: 'Priya Raghavan',
    username: 'priya_builds',
    bio: 'Product designer. Interfaces that feel obvious.',
    location: 'Bengaluru, India',
    avatar: 'https://i.pravatar.cc/300?img=32',
  },
  {
    key: 'naomi',
    name: 'Naomi Carter',
    username: 'naomi.carter',
    bio: 'Marathoner and pastry obsessive. Currently training for Berlin.',
    location: 'Berlin, Germany',
    avatar: 'https://i.pravatar.cc/300?img=44',
  },
  {
    key: 'lucia',
    name: 'Lucía Fernández',
    username: 'lucia.fernandez',
    bio: 'Ceramicist. My kiln is hotter than my temper.',
    location: 'Valencia, Spain',
    avatar: 'https://i.pravatar.cc/300?img=49',
  },
  {
    key: 'ingrid',
    name: 'Ingrid Sørensen',
    username: 'ingrid.s',
    bio: 'Trail runner, map hoarder, dog person.',
    location: 'Bergen, Norway',
    avatar: 'https://i.pravatar.cc/300?img=23',
  },
  {
    key: 'marcus',
    name: 'Marcus Whitfield',
    username: 'marcusw_10',
    bio: 'Striker. Birmingham born, still loud about it.',
    location: 'Birmingham, UK',
    avatar: 'https://i.pravatar.cc/300?img=12',
  },
  {
    key: 'diego',
    name: 'Diego Álvarez',
    username: 'diego.leftfoot',
    bio: 'Left winger. Podcasts about football, badly.',
    location: 'Madrid, Spain',
    avatar: 'https://i.pravatar.cc/300?img=52',
  },
  {
    key: 'kenji',
    name: 'Kenji Watanabe',
    username: 'kenji_keeper',
    bio: 'Goalkeeper. I save things.',
    location: 'Osaka, Japan',
    avatar: 'https://i.pravatar.cc/300?img=60',
  },
  {
    key: 'fatima',
    name: 'Fatima Al-Rashid',
    username: 'fatima.plays',
    bio: 'Midfielder. Weekend league captain, weekday coffee reviewer.',
    location: 'Dubai, UAE',
    avatar: 'https://i.pravatar.cc/300?img=26',
  },
  {
    key: 'tomas',
    name: 'Tomáš Novák',
    username: 'tomas.n',
    bio: 'Defender. I read the game before it happens.',
    location: 'Prague, Czechia',
    avatar: 'https://i.pravatar.cc/300?img=56',
  },
  {
    key: 'elena',
    name: 'Elena Petrova',
    username: 'elena.petrova',
    bio: 'Fashion editor. Everything is a colour story.',
    location: 'Sofia, Bulgaria',
    avatar: 'https://i.pravatar.cc/300?img=20',
  },
  {
    key: 'chiara',
    name: 'Chiara Bellini',
    username: 'chiara.b',
    bio: 'Sunrise chaser. I will outrun the alarm.',
    location: 'Rome, Italy',
    avatar: 'https://i.pravatar.cc/300?img=16',
  },
  {
    key: 'nadia',
    name: 'Nadia Haddad',
    username: 'nadia.haddad',
    bio: 'Chef. I cook for people I love.',
    location: 'Beirut, Lebanon',
    avatar: 'https://i.pravatar.cc/300?img=41',
  },
  {
    key: 'aisha',
    name: 'Aisha Bello',
    username: 'aisha.b',
    bio: 'Lagos. Personal trainer. Ask me about protein.',
    location: 'Lagos, Nigeria',
    avatar: 'https://i.pravatar.cc/300?img=5',
  },
  {
    key: 'hana',
    name: 'Hana Kim',
    username: 'hana.k',
    bio: 'Illustrator. Ink first, pixels later.',
    location: 'Seoul, South Korea',
    avatar: 'https://i.pravatar.cc/300?img=9',
  },
  {
    key: 'oliver',
    name: 'Oliver Grant',
    username: 'oliver.grant',
    bio: 'Analyst. I explain football with spreadsheets.',
    location: 'Manchester, UK',
    avatar: 'https://i.pravatar.cc/300?img=33',
  },
  {
    key: 'mateo',
    name: 'Mateo Rossi',
    username: 'mateo.rossi',
    bio: 'Barista by day, drummer by night.',
    location: 'Turin, Italy',
    avatar: 'https://i.pravatar.cc/300?img=37',
  },
];

const FOOTBALL_IMAGES = [
  'https://images.unsplash.com/photo-1431324155629-1a6deb1dec8d?w=1000',
  'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=1000',
  'https://images.unsplash.com/photo-1518604666860-9ed391f76460?w=1000',
  'https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1000',
  'https://images.unsplash.com/photo-1553778263-73a83bab9b0c?w=1000',
  'https://images.unsplash.com/photo-1519861531473-9200262188bf?w=1000',
  'https://images.unsplash.com/photo-1571731956672-f2b94d7dd0cb?w=1000',
  'https://images.unsplash.com/photo-1560272564-c83b66b1ad12?w=1000',
  'https://images.unsplash.com/photo-1594736797933-d0501ba2fe65?w=1000',
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=1000',
];

const PORTRAIT_IMAGES = [
  'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=1000',
  'https://images.unsplash.com/photo-1502823403499-6ccfcf4fb453?w=1000',
  'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=1000',
  'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=1000',
  'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=1000',
  'https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=1000',
  'https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=1000',
  'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=1000',
  'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=1000',
  'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=1000',
  'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=1000',
  'https://images.unsplash.com/photo-1552374196-c4e7ffc6e126?w=1000',
];

// key -> posts. `audience` decides who receives the likes.
const POSTS = [
  {
    by: 'marcus',
    image: 0,
    caption:
      "Full ninety today. The crowd was loud enough to hear my boots on the second leg. Still think we should have gone earlier, though. 3-1, and that's what matters. #football #matchday",
    stats: { likes: 1840, comments: 214, views: 41200 },
  },
  {
    by: 'diego',
    image: 1,
    caption:
      'Left foot, right pocket, no excuses. Genuinely the best cross I have hit all season. My manager said "again" which from him is basically a standing ovation.',
    stats: { likes: 2310, comments: 318, views: 58400 },
  },
  {
    by: 'kenji',
    image: 2,
    caption:
      'Two saves and a clean sheet. I will take it. Defending the space is 80% of the job and nobody talks about it.',
    stats: { likes: 990, comments: 87, views: 22100 },
  },
  {
    by: 'fatima',
    image: 3,
    caption:
      'Captain\'s armband, weekend league, five-a-side pitch with three goalposts. Still the best football I play all week.',
    stats: { likes: 1520, comments: 143, views: 30900 },
  },
  {
    by: 'tomas',
    image: 4,
    caption:
      'Read the game, won the game. Nobody highlights a clean tackle but I know I made three that mattered.',
    stats: { likes: 760, comments: 61, views: 17800 },
  },
  {
    by: 'oliver',
    image: 5,
    caption:
      'Spreadsheet says we win when we press high. Spreadsheet was right again. Expected goals 2.31, actual 3. I will be insufferable about this all week.',
    stats: { likes: 1180, comments: 176, views: 27400 },
  },
  {
    by: 'amara',
    image: 6,
    caption:
      'Soft light, hard deadlines. This is what a good shoot day looks like. Swipe for the ones that did not make the edit. #portrait #studio',
    stats: { likes: 3420, comments: 402, views: 88600 },
  },
  {
    by: 'sofia',
    image: 7,
    caption:
      'Told the model to "just be natural" and she immediately looked at the camera and smiled. Natural. Incredible.',
    stats: { likes: 2890, comments: 356, views: 74100 },
  },
  {
    by: 'elena',
    image: 8,
    caption:
      'Wardrobe test for the spring issue. Deep green against warm skin tones does something no other colour manages. Notes in the caption.',
    stats: { likes: 2640, comments: 288, views: 66900 },
  },
  {
    by: 'chiara',
    image: 9,
    caption:
      '5:40am alarm, 6:11am summit, worth every second of complaining. The fog came off the valley like someone pulled a curtain.',
    stats: { likes: 1960, comments: 174, views: 43200 },
  },
  {
    by: 'naomi',
    image: 10,
    caption:
      '28 kilometres before breakfast. The legs feel like wet sand and I have never felt more myself. Long run Sunday complete.',
    stats: { likes: 1420, comments: 121, views: 29800 },
  },
  {
    by: 'nadia',
    image: 11,
    caption:
      'Slow braised lamb, eight hours, one bowl. Some things are worth the patience.',
    stats: { likes: 3180, comments: 267, views: 71200 },
  },
  {
    by: 'lucia',
    image: 2,
    caption:
      'Opened the kiln at midnight. Forty-two pieces, eleven survived, and I would do it all again tomorrow.',
    stats: { likes: 1270, comments: 98, views: 24500 },
  },
  {
    by: 'hana',
    image: 8,
    caption:
      'Ink first. Always ink first. The sketchbook is where the drawing actually happens, the tablet is just paperwork.',
    stats: { likes: 2140, comments: 231, views: 52300 },
  },
  {
    by: 'ingrid',
    image: 4,
    caption:
      'Twelve maps and counting. New route this weekend, proper scramble in the middle section, worth the soaked socks.',
    stats: { likes: 1080, comments: 94, views: 21300 },
  },
  {
    by: 'aisha',
    image: 7,
    caption:
      'Client asked for a "quick" six-week transformation. I said six weeks of showing up is not quick, but it works. Down 9kg and stronger than ever.',
    stats: { likes: 1760, comments: 189, views: 39100 },
  },
  {
    by: 'priya',
    image: 9,
    caption:
      'Redrew the onboarding so the third step disappeared entirely. Activation went up eleven points. Sometimes the feature is the absence of a feature.',
    stats: { likes: 1580, comments: 202, views: 33400 },
  },
  {
    by: 'mateo',
    image: 10,
    caption:
      'Milk, temperature, timing. People think barista work is a costume. It is a craft and I will argue about it at length.',
    stats: { likes: 940, comments: 112, views: 18900 },
  },
  {
    by: 'diego',
    image: 8,
    caption:
      'Away day kit. Same boots, worse socks, better result. Some things never change.',
    stats: { likes: 1130, comments: 78, views: 23700 },
  },
  {
    by: 'marcus',
    image: 3,
    caption:
      'Pre-season starts Monday. Fourteen weeks. We are going to be a problem this year and I am telling you now.',
    stats: { likes: 2470, comments: 341, views: 61600 },
  },
  {
    by: 'kenji',
    image: 7,
    caption:
      'Training ground, 6am, nobody else here. This is the part of the job nobody sees and the part that decides the season.',
    stats: { likes: 1340, comments: 108, views: 28400 },
  },
  {
    by: 'fatima',
    image: 9,
    caption:
      'Tactical board came out at halftime and the whole shape changed. Two goals in the next twelve minutes. Coach of the year, honestly.',
    stats: { likes: 1690, comments: 152, views: 37100 },
  },
  {
    by: 'sofia',
    image: 10,
    caption:
      'Shot this at 1/250th and hoped. The look on her face said I had about two frames of luck left.',
    stats: { likes: 3010, comments: 298, views: 75800 },
  },
  {
    by: 'tomas',
    image: 1,
    caption:
      'Back four, no ball, pure defending. Nobody posts a clip of a good tackle. I am posting one anyway.',
    stats: { likes: 880, comments: 72, views: 19600 },
  },
  {
    by: 'elena',
    image: 11,
    caption:
      'Backstage thirty seconds before the shoot. The calm before someone says "we have five minutes" and everything becomes chaos.',
    stats: { likes: 2240, comments: 246, views: 59400 },
  },
  {
    by: 'diego',
    image: 5,
    caption:
      'Set pieces all afternoon. The delivery is fine. The movement is what actually scores goals and nobody films that.',
    stats: { likes: 1220, comments: 96, views: 25800 },
  },
  {
    by: 'priya',
    image: 3,
    caption:
      'Shipped a feature that took three months. The button looks like one line of code. It was not.',
    stats: { likes: 1870, comments: 214, views: 41200 },
  },
  {
    by: 'oliver',
    image: 0,
    caption:
      'Every scout report I read this week said the same thing about the same midfielder. The data is not subtle, we are just slow to accept it.',
    stats: { likes: 1050, comments: 137, views: 22900 },
  },
  {
    by: 'nadia',
    image: 4,
    caption:
      'Twelve people, one table, three hours. Best cooking I have done all year and it started with a market at dawn.',
    stats: { likes: 2760, comments: 251, views: 64800 },
  },
];

const COMMENT_LINES = [
  'This is unreal. How long was the session?',
  'The lighting here is doing so much work.',
  'Absolutely robbed you and I would do it again.',
  'Saving this for reference, thank you.',
  'Third time I have seen this and it still hits.',
  'Instant follow.',
  'Okay this is the one. This is the post.',
  'The effort here is obvious in the best way.',
  'Where was this? Now I want to go.',
  'Genuinely helpful, thanks for sharing.',
  'My algorithm needed this today.',
  'This deserves way more views than it has.',
  'Underrated post of the week.',
  'The patience in this is wild.',
  'Watched it three times.',
  'Completely agree with the comments above.',
  'Not me crying at a football post.',
  'This is going straight on a wall.',
  'You never miss.',
  'Tell me more about this one.',
];

/* Image pools. The `image` index on a post picks within the author's pool. */
const FOOTBALL_KEYS = new Set(['marcus', 'diego', 'kenji', 'fatima', 'tomas', 'oliver']);

const rand = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = (arr) => arr[rand(0, arr.length - 1)];

/* ------------------------------------------------------------
   Filler likers.
   The schema allows one like per (post, user), so 18 named accounts
   can only back 17 likes per post. These low-profile accounts exist
   purely to back the larger like counts with real rows. They are
   never added to the follow graph, so they stay out of the
   followers/following lists.
   ------------------------------------------------------------ */
const FILLER_COUNT = 320;
const FILLER_ADJECTIVES = [
  'amber', 'blue', 'calm', 'daily', 'eager', 'fern', 'gentle', 'happy',
  'ivory', 'jolly', 'keen', 'lively', 'mellow', 'noble', 'olive', 'prime',
  'quiet', 'rapid', 'silver', 'tidal', 'urban', 'vivid', 'warm', 'young',
];
const FILLER_NOUNS = [
  'harbor', 'lantern', 'meadow', 'orbit', 'prairie', 'quartz', 'river',
  'summit', 'thicket', 'valley', 'willow', 'zenith',
];

function fillerName(index) {
  const adjective = FILLER_ADJECTIVES[index % FILLER_ADJECTIVES.length];
  const noun = FILLER_NOUNS[Math.floor(index / FILLER_ADJECTIVES.length) % FILLER_NOUNS.length];
  return { username: `${adjective}.${noun}${index}`, display: `${adjective} ${noun}` };
}

async function main() {
  console.log('Seeding named accounts...');
  const passwordHash = await bcrypt.hash('Seedpass123!', 10);

  const byKey = {};

  for (const person of PEOPLE) {
    const id = U(person.key);

    const user = await prisma.user.upsert({
      where: { id },
      update: {
        name: person.name,
        username: person.username,
        verified: person.verified,
      },
      create: {
        id,
        name: person.name,
        username: person.username,
        email: `${person.username.replace(/[^a-z0-9]/gi, '')}@seed.pearlnet.app`,
        password: passwordHash,
        verified: person.verified,
        verifiedAt: person.verified ? new Date() : null,
        role: person.verified ? 'VERIFIED' : 'USER',
        profile: {
          create: {
            username: person.username,
            email: `${person.username.replace(/[^a-z0-9]/gi, '')}@seed.pearlnet.app`,
            bio: person.bio,
            location: person.location,
            imageUrl: person.avatar,
            gender: 'other',
          },
        },
      },
    });

    // A profile may already exist from an earlier run.
    await prisma.profile.upsert({
      where: { userId: user.id },
      update: {
        bio: person.bio,
        location: person.location,
        imageUrl: person.avatar,
      },
      create: {
        userId: user.id,
        username: person.username,
        email: person.email,
        bio: person.bio,
        location: person.location,
        imageUrl: person.avatar,
        gender: 'other',
      },
    });

    byKey[person.key] = user;
  }

  const ids = Object.values(byKey).map((u) => u.id);
  console.log(`  ${ids.length} accounts ready.`);

  console.log('Seeding posts...');
  const created = [];

  console.log('Seeding filler liker accounts...');
  const fillerIds = [];

  for (let batch = 0; batch < FILLER_COUNT; batch += 80) {
    const users = [];
    const profiles = [];

    for (let i = batch; i < Math.min(batch + 80, FILLER_COUNT); i += 1) {
      const { username, display } = fillerName(i);
      const email = `filler${i}@seed.pearlnet.app`;

      users.push({
        id: `seed-filler-${i}`,
        name: display,
        username,
        email,
        password: passwordHash,
        role: 'USER',
        verified: false,
      });
      profiles.push({
        userId: `seed-filler-${i}`,
        username,
        email,
        bio: null,
        location: null,
        imageUrl: null,
        gender: 'other',
      });
    }

    await prisma.user.createMany({ data: users, skipDuplicates: true });
    await prisma.profile.createMany({ data: profiles, skipDuplicates: true });

    for (let i = batch; i < Math.min(batch + 80, FILLER_COUNT); i += 1) {
      fillerIds.push(`seed-filler-${i}`);
    }
  }

  console.log(`  ${fillerIds.length} filler likers ready.`);

  const likerPool = [...ids, ...fillerIds];

  for (const entry of POSTS) {
    const author = byKey[entry.by];
    const postId = `seed-post-${entry.by}-${created.length}`;

    const now = Date.now() - created.length * 3_600_000 * 5;
    const pool = FOOTBALL_KEYS.has(entry.by) ? FOOTBALL_IMAGES : PORTRAIT_IMAGES;
    const image = pool[entry.image % pool.length];

    const post = await prisma.post.upsert({
      where: { id: postId },
      update: {},
      create: {
        id: postId,
        userId: author.id,
        userEmail: author.email,
        caption: entry.caption,
        imageUrl: image,
        mediaType: 'IMAGE',
        viewCount: entry.stats.views,
        createdAt: new Date(now),
        updatedAt: new Date(now),
      },
    });

    created.push({ post, author, stats: entry.stats });
  }

  console.log(`  ${created.length} posts ready.`);

  console.log('Seeding likes, comments and views...');

  const peopleKeys = Object.keys(byKey);

  for (const { post, stats } of created) {
    // Likes come from other accounts so the count is backed by real rows.
    // The filler pool lets a post hold the thousands of likes the caption
    // implies, which the schema requires to be one row per (post, user).
    const candidates = likerPool.filter((id) => id !== post.userId);
    const likeTarget = Math.min(stats.likes, candidates.length);
    const shuffled = [...candidates].sort(() => Math.random() - 0.5);

    await prisma.like.createMany({
      data: shuffled.slice(0, likeTarget).map((userId) => ({ postId: post.id, userId })),
      skipDuplicates: true,
    });

    // One view per viewer, matching how the view endpoint deduplicates.
    const viewerPool = [post.userId, ...candidates];
    const viewsForPost = Math.min(viewerPool.length, Math.max(4, Math.round(stats.views / 200)));
    await prisma.postView.createMany({
      data: viewerPool.slice(0, viewsForPost).map((userId) => ({ postId: post.id, userId })),
      skipDuplicates: true,
    });

    const commentTarget = Math.min(stats.comments, 25);
    const commentRows = [];
    for (let i = 0; i < commentTarget; i += 1) {
      const key = pick(peopleKeys);
      const commenter = byKey[key];
      if (commenter.id === post.userId) continue;
      commentRows.push({
        postId: post.id,
        userId: commenter.id,
        userEmail: commenter.email,
        content: pick(COMMENT_LINES),
        createdAt: new Date(Date.now() - rand(1, 400) * 60_000),
      });
    }

    // Comments have no unique key, so guard against duplicating on a re-run.
    if (commentRows.length > 0) {
      const existing = await prisma.comment.findMany({
        where: { postId: post.id },
        select: { userId: true, content: true },
      });
      const seen = new Set(existing.map((row) => `${row.userId}|${row.content}`));
      const fresh = commentRows.filter((row) => {
        const key = `${row.userId}|${row.content}`;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
      if (fresh.length > 0) await prisma.comment.createMany({ data: fresh });
    }
  }

  // A small follow graph so the Following feed and profile tabs have content.
  console.log('Seeding follow graph...');
  for (const follower of ids) {
    for (const following of ids) {
      if (follower === following) continue;
      if (Math.random() > 0.35) continue;
      await prisma.follow.upsert({
        where: { followerId_followingId: { followerId: follower, followingId: following } },
        update: {},
        create: { followerId: follower, followingId: following },
      });
    }
  }

  console.log('\nSeed complete:');
  console.log(`  users:  ${ids.length} named accounts + ${fillerIds.length} filler likers`);
  console.log(`  posts:  ${created.length} seeded`);

  // The pooled connection can drop between batches, so the summary is best
  // effort rather than the thing that decides whether the run passed.
  for (const label of ['posts', 'likes', 'comments', 'follows']) {
    try {
      const count = await prisma[label].count();
      console.log(`  ${label}: ${count}`);
    } catch (err) {
      console.log(`  ${label}: unavailable (${err.code ?? err.message})`);
    }
  }
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
