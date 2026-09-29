import NextAuth from 'next-auth';
import { authConfig } from '@/lib/auth/config';
import { prisma } from '@/lib/prisma';

const { auth, signIn, signOut, handlers, unstable_update } = NextAuth(authConfig);

export { auth, signIn, signOut, handlers, unstable_update };

export async function getCurrentUser() {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    include: {
      profile: true,
    },
  });

  if (!user) return null;

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    username: user.username,
    role: user.role,
    verified: user.verified,
    image: user.profile?.imageUrl,
  };
}

export async function getUserIdFromSession(): Promise<string | null> {
  const session = await auth();
  if (!session?.user?.email) return null;

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true },
  });

  return user?.id ?? null;
}
