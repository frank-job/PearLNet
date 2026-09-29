import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import bcrypt from 'bcryptjs';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limiter';
import { createServer } from 'http';
import { initSocketServer } from '@/lib/socket/server';
import type { Server as IOServer } from 'socket.io';

export const runtime = 'nodejs';
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  try {
    if (global.io) {
      return NextResponse.json({ message: 'Socket.IO already initialized' });
    }

    const httpServer = createServer();
    const io = initSocketServer(httpServer);

    return NextResponse.json({
      message: 'Socket.IO server initialized',
      connections: io.engine.clientsCount,
    });
  } catch (error) {
    console.error('[Socket.IO] Error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize socket server' },
      { status: 500 },
    );
  }
}
