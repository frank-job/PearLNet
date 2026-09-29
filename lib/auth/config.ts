import { NextAuthConfig } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';

export const authConfig = {
  pages: {
    signIn: '/login',
    signUp: '/signup',
    error: '/login',
    signOut: '/login',
  },
  secret: process.env.AUTH_SECRET,
  session: {
    strategy: 'jwt' as const,
    maxAge: 7 * 24 * 60 * 60, // 7 days
  },
  callbacks: {
    async jwt({ token, user, account }) {
      if (user && account) {
        token.userId = user.id;
        token.role = user.role;
        token.verified = user.verified;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          id: token.userId as string,
          email: token.email ?? session.user?.email ?? null,
          name: token.name as string ?? session.user?.name ?? null,
          image: token.picture as string | null,
          role: token.role as string,
          verified: token.verified as boolean,
        };
      }
      return session;
    },
  },
  providers: [
    Credentials({
      name: 'Credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('[Auth] Missing credentials');
          return null;
        }

        console.log('[Auth] Looking up user:', credentials.email);

        const user = await prisma.user.findUnique({
          where: { email: credentials.email as string },
          select: {
            id: true,
            email: true,
            name: true,
            password: true,
            role: true,
            verified: true,
          },
        });

        if (!user) {
          console.log('[Auth] User not found:', credentials.email);
          return null;
        }

        console.log('[Auth] User found:', user.email, 'verified:', user.verified);

        const passwordsMatch = await bcrypt.compare(
          credentials.password as string,
          user.password,
        );

        if (!passwordsMatch) {
          console.log('[Auth] Password mismatch for:', credentials.email);
          return null;
        }

        console.log('[Auth] Login successful for:', user.email);

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          verified: user.verified,
        };
      },
    }),
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
} satisfies NextAuthConfig;

export default authConfig;
