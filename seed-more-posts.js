const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ where: { email: { in: ['test@example.com', 'test2@example.com'] } } });
  
  if (users.length === 0) {
    console.log('No users found');
    return;
  }

  const posts = [
    // User 1 posts
    { userId: users[0].id, userEmail: users[0].email, caption: '🚀 Just launched my new project! Excited to share it with the community.', mediaType: 'TEXT' },
    { userId: users[0].id, userEmail: users[0].email, caption: 'Mountain hiking this weekend was amazing! 🏔️', mediaType: 'IMAGE', imageUrl: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=800' },
    { userId: users[0].id, userEmail: users[0].email, caption: 'Pro tip: Always write tests before you code. Saves so much time later! 💡', mediaType: 'TEXT' },
    { userId: users[0].id, userEmail: users[0].email, caption: 'Coffee shop vibes ☕ Working remotely today.', mediaType: 'IMAGE', imageUrl: 'https://images.unsplash.com/photo-1442512595331-e89e73853f31?w=800' },
    
    // User 2 posts  
    { userId: users[1].id, userEmail: users[1].email, caption: 'New here! 👋 What\'s the best way to get started?', mediaType: 'TEXT' },
    { userId: users[1].id, userEmail: users[1].email, caption: 'My desk setup 🖥️ Finally happy with it!', mediaType: 'IMAGE', imageUrl: 'https://images.unsplash.com/photo-1587831990711-23ca64414476?w=800' },
    { userId: users[1].id, userEmail: users[1].email, caption: 'Book recommendation: "Atomic Habits" - life changing 📚', mediaType: 'TEXT' },
    { userId: users[1].id, userEmail: users[1].email, caption: 'Sunset at the beach 🌊 Perfect end to the week.', mediaType: 'IMAGE', imageUrl: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800' },
    
    // More engaging content
    { userId: users[0].id, userEmail: users[0].email, caption: 'Weekend coding session 💻 Who else codes on weekends?', mediaType: 'TEXT' },
    { userId: users[1].id, userEmail: users[1].email, caption: 'Just finished a 5k run! 🏃‍♂️ Feeling great.', mediaType: 'TEXT' },
    { userId: users[0].id, userEmail: users[0].email, caption: 'Delicious homemade pizza 🍕', mediaType: 'IMAGE', imageUrl: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=800' },
    { userId: users[1].id, userEmail: users[1].email, caption: 'Learning React hooks today. The useEffect dependency array still confuses me sometimes 🤔', mediaType: 'TEXT' },
  ];

  for (const postData of posts) {
    const post = await prisma.post.create({ data: postData });
    console.log('Created post:', post.id, post.caption?.substring(0, 60));
  }

  // Add some likes
  const allPosts = await prisma.post.findMany({ select: { id: true } });
  for (const post of allPosts) {
    // User 1 likes some posts
    if (Math.random() > 0.5) {
      await prisma.like.create({ data: { userId: users[0].id, postId: post.id } }).catch(() => {});
    }
    // User 2 likes some posts
    if (Math.random() > 0.5) {
      await prisma.like.create({ data: { userId: users[1].id, postId: post.id } }).catch(() => {});
    }
  }

  // Add some comments
  const comments = [
    { userId: users[0].id, postId: allPosts[0].id, content: 'Thanks! 🙌' },
    { userId: users[1].id, postId: allPosts[0].id, content: 'Congrats! 🎉' },
    { userId: users[0].id, postId: allPosts[2].id, content: 'Looks amazing!' },
    { userId: users[1].id, postId: allPosts[4].id, content: 'Welcome! 👋' },
  ];
  
  for (const comment of comments) {
    await prisma.comment.create({ data: comment }).catch(() => {});
  }

  console.log('More posts seeded with likes and comments!');
}

main().catch(console.error).finally(() => prisma.$disconnect());