const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'test@example.com';
  const password = 'password123';
  const name = 'Test User';
  const username = 'testuser';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log('User already exists:', existing.email);
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: {
      name,
      email,
      username,
      password: hashedPassword,
      role: 'USER',
      verified: true,
      profile: {
        create: {
          username,
          email,
          bio: 'Test user for PearLNet',
          location: '',
          birthYear: null,
          dateOfBirth: null,
          gender: 'other',
        },
      },
    },
  });

  console.log('Created user:', { id: user.id, email: user.email, name: user.name });
}

main().catch(console.error).finally(() => prisma.$disconnect());