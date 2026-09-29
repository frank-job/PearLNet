import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const config = {
  matcher: [
    '/admin/:path*',
    '/api/admin/:path*',
  ],
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });

  if (!token) {
    return NextResponse.redirect(new URL('/login?callbackUrl=/admin', request.url));
  }

  const role = token.role as string;
  if (role !== 'ADMIN' && role !== 'MODERATOR') {
    return NextResponse.redirect(new URL('/unauthorized', request.url));
  }

  return NextResponse.next();
}
