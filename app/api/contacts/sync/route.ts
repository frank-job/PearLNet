// app/api/contacts/sync/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const { userId, contactHashes } = await req.json(); 
    // contactHashes = array of strings (mix of hashed phones & emails)

    if (!userId || !Array.isArray(contactHashes) || contactHashes.length === 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
    }

    // 1. Bulk insert contact hashes to current user's graph
    const records = contactHashes.map((hash: string) => ({
      userId,
      contactHash: hash,
      type: hash.length === 64 ? "HASH" : "UNKNOWN",
    }));

    await prisma.userContact.createMany({
      data: records,
      skipDuplicates: true,
    });

    // 2. Query matching users on either phone OR email
    const suggestions = await prisma.user.findMany({
      where: {
        OR: [
          { phoneHash: { in: contactHashes } },
          { emailHash: { in: contactHashes } },
        ],
        NOT: { id: userId },
      },
      select: {
        id: true,
        username: true,
      },
      take: 25,
    });

    return NextResponse.json({ success: true, suggestions });
  } catch (error) {
    console.error("Sync Error:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}