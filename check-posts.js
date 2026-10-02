const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  const posts = await prisma.post.findMany({ take: 3, select: { id: true, caption: true, viewCount: true } });
  console.log('Posts:', posts);
  
  for (const post of posts) {
    const likes = await prisma.like.count({ where: { postId: post.id } });
    const comments = await prisma.comment.count({ where: { postId: post.id } });
    console.log(`Post ${post.id}: likes=${likes}, comments=${comments}, views=${post.viewCount}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());