import { prisma } from '@/lib/prisma';
import { Prisma } from '@prisma/client';

export const PrismaErrors = {
  P2000: 'The input value is too long for the database column.',
  P2001: 'No record was found that matches the given criteria.',
  P2002: 'A record with this value already exists.',
  P2003: 'Foreign key constraint failed.',
  P2004: 'A constraint violation occurred.',
  P2025: 'The referenced record was not found.',
};

export function handlePrismaError(error: unknown): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    return PrismaErrors[error.code as keyof typeof PrismaErrors] ?? 'A database error occurred.';
  }
  if (error instanceof Prisma.PrismaClientValidationError) {
    return 'Invalid input provided.';
  }
  if (error instanceof Error) return error.message;
  return 'An unexpected error occurred.';
}

export async function safeAction<T>(
  fn: () => Promise<T>,
): Promise<{ data?: T; error?: string }> {
  try {
    const data = await fn();
    return { data };
  } catch (error) {
    return { error: handlePrismaError(error) };
  }
}

export { prisma };
