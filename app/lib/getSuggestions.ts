// lib/getSuggestions.ts
import { prisma } from "@/app/lib/prisma";

export async function getPeopleYouMayKnow(userId: string) {
  // Find users who uploaded the current user's contact number (Reverse Lookup)
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { phoneHash: true },
  });

  if (!currentUser) return [];

  const reverseMatches = await prisma.userContact.findMany({
    where: {
      contactHash: currentUser.phoneHash,
      NOT: { userId: userId },
    },
    include: {
      user: {
        select: { id: true, username: true },
      },
    },
    take: 10,
  });

  return reverseMatches.map((item) => item.user);
}