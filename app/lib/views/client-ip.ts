import type { NextRequest } from 'next/server';

export function getClientIp(request: NextRequest): string {
  // Use the first forwarded address supplied by the trusted hosting proxy.
  // Fall back to the direct socket address for local development.
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded?.split(',')[0]?.trim() || request.headers.get('x-real-ip') || 'unknown';
}