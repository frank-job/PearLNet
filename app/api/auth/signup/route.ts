import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signUpSchema } from '@/lib/validations/schemas';
import { checkRateLimit, getClientIdentifier } from '@/lib/security/rate-limiter';
import { z } from 'zod';

export async function POST(request: NextRequest) {
  const ip = getClientIdentifier(request.headers);
  const rateKey = `signup:${ip}`;

  const allowed = await checkRateLimit(rateKey, {
    windowMs: 60 * 1000,
    max: 5,
  });

  if (!allowed) {
    return NextResponse.json(
      { error: 'Too many signup attempts. Please try again later.' },
      { status: 429, headers: { 'Retry-After': '60' } },
    );
  }

  const body = await request.json().catch(() => null);
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const result = signUpSchema.safeParse(body);
  if (!result.success) {
    return NextResponse.json({ error: result.error.issues[0].message }, { status: 400 });
  }

  const { name, email, password } = result.data;
  const username = email.split('@')[0];

  try {
    const existing = await prisma.user.findUnique({
      where: { email },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'A user with this email already exists.' },
        { status: 409 },
      );
    }

    const usernameExists = await prisma.user.findFirst({
      where: { username },
    });

    if (usernameExists) {
      return NextResponse.json(
        { error: 'That username is already taken. Please choose another.' },
        { status: 409 },
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        username,
        password: hashedPassword,
        role: 'USER',
        verified: false,
        profile: {
          create: {
            username,
            email,
            bio: 'Just joined PearLNet!',
            location: '',
            birthYear: null,
            dateOfBirth: null,
            gender: 'other',
          },
        },
      },
    });

    return NextResponse.json(
      { message: 'Account created successfully. Please log in.', userId: user.id },
      { status: 201 },
    );
  } catch (error) {
    console.error('[Signup] Error:', error);
    return NextResponse.json(
      { error: 'An error occurred during account creation. Please try again.' },
      { status: 500 },
    );
  }
}
