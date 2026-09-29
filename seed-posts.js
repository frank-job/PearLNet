const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // Get test users
  const user1 = await prisma.user.findUnique({ where: { email: 'test@example.com' } });
  const user2 = await prisma.user.findUnique({ where: { email: 'test2@example.com' } });

  if (!user1 || !user2) {
    console.log('Users not found');
    return;
  }

  // Create posts
  const posts = [
    {
      userId: user1.id,
      userEmail: user1.email,
      caption: 'Welcome to PearLNet! 🎉 This is my first post.',
      mediaType: 'TEXT',
    },
    {
      userId: user1.id,
      userEmail: user1.email,
      caption: 'Beautiful sunset today 🌅',
      mediaType: 'IMAGE',
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800',
    },
    {
      userId: user2.id,
      userEmail: user2.email,
      caption: 'Just joined! Looking forward to connecting with everyone.',
      mediaType: 'TEXT',
    },
    {
      userId: user2.id,
      userEmail: user2.email,
      caption: 'My morning coffee ☕',
      mediaType: 'IMAGE',
      imageUrl: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=800',
    },
    {
      userId: user1.id,
      userEmail: user1.email,
      caption: 'Working on some exciting projects! Stay tuned.',
      mediaType: 'TEXT',
    },
  ];

  for (const postData of posts) {
    const post = await prisma.post.create({ data: postData });
    console.log('Created post:', post.id, post.caption?.substring(0, 50));
  }

  // Create a follow relationship
  await prisma.follow.create({
    data: {
      followerId: user1.id,
      followingId: user2.id,
    },
  }).catch(() => {}); // Ignore if exists

  await prisma.follow.create({
    data: {
      followerId: user2.id,
      followingId: user1.id,
    },
  }).catch(() => {});

  console.log('Seeding complete!');
}

main().catch(console.error).finally(() => prisma.$disconnect());