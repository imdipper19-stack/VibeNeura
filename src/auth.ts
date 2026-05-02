// NextAuth v5 (Auth.js) configuration.
// - Google OAuth (one-click sign-in)
// - Telegram Login Widget via Credentials provider (HMAC verified server-side)
// - JWT session strategy (no DB Session model — keeps deploy simple)
// - Prisma adapter is used only to upsert the User row, identities are linked via googleId / telegramId.

import NextAuth, { type DefaultSession } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import Google from 'next-auth/providers/google';
import bcrypt from 'bcryptjs';
import { nanoid } from 'nanoid';
import { prisma } from '@/lib/prisma/client';
import { verifyTelegramAuth, type TelegramAuthPayload } from '@/lib/auth/telegram';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      referralCode: string;
      tokenBalance: number;
      proPassUntil: string | null;
      role: string;
    } & DefaultSession['user'];
  }
}

type OmniJWT = {
  uid?: string;
  referralCode?: string;
  tokenBalance?: number;
  proPassUntil?: string | null;
  role?: string;
  [key: string]: unknown;
};

async function generateUniqueReferralCode(): Promise<string> {
  for (let i = 0; i < 5; i++) {
    const code = nanoid(8);
    const existing = await prisma.user.findUnique({ where: { referralCode: code } });
    if (!existing) return code;
  }
  return nanoid(12);
}

async function consumeReferralCookie(): Promise<string | null> {
  const { cookies } = await import('next/headers');
  const code = cookies().get('omnichat_ref')?.value;
  if (!code) return null;
  const referrer = await prisma.user.findUnique({ where: { referralCode: code } });
  return referrer?.id ?? null;
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: 'jwt' },
  pages: { signIn: '/ru/login' },
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      allowDangerousEmailAccountLinking: true,
    }),
    Credentials({
      id: 'telegram',
      name: 'Telegram',
      credentials: {
        id: {},
        first_name: {},
        last_name: {},
        username: {},
        photo_url: {},
        auth_date: {},
        hash: {},
      },
      async authorize(raw) {
        const token = process.env.TELEGRAM_BOT_TOKEN;
        if (!token) return null;
        const payload = raw as unknown as TelegramAuthPayload;
        if (!verifyTelegramAuth(payload, token)) return null;

        const tgId = BigInt(payload.id);
        const referredById = await consumeReferralCookie();

        const user = await prisma.user.upsert({
          where: { telegramId: tgId },
          update: {
            name: [payload.first_name, payload.last_name].filter(Boolean).join(' ') || undefined,
            avatarUrl: payload.photo_url ?? undefined,
          },
          create: {
            telegramId: tgId,
            name: [payload.first_name, payload.last_name].filter(Boolean).join(' '),
            avatarUrl: payload.photo_url,
            referralCode: await generateUniqueReferralCode(),
            referredById: referredById ?? undefined,
          },
        });

        if (user.banned) return null;

        return {
          id: user.id,
          name: user.name,
          image: user.avatarUrl,
          email: user.email,
        };
      },
    }),
    Credentials({
      id: 'email',
      name: 'Email',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(raw) {
        const email = raw?.email as string | undefined;
        const password = raw?.password as string | undefined;
        if (!email || !password) return null;

        const user = await prisma.user.findUnique({ where: { email } });
        if (!user || !user.passwordHash) return null;
        if (!user.emailVerified) return null;
        if (user.banned) return null;

        const valid = await bcrypt.compare(password, user.passwordHash);
        if (!valid) return null;

        return {
          id: user.id,
          name: user.name ?? user.email,
          email: user.email,
          image: user.avatarUrl,
        };
      },
    }),
  ],
  callbacks: {
    async signIn({ user, account, profile }) {
      // Google branch — Credentials branch handled in authorize().
      if (account?.provider !== 'google' || !profile) return true;
      const email = (profile as any).email as string | undefined;
      const sub = account.providerAccountId;
      const referredById = await consumeReferralCookie();

      const dbUser = await prisma.user.upsert({
        where: { googleId: sub },
        update: {
          email: email ?? undefined,
          name: (profile as any).name ?? undefined,
          avatarUrl: (profile as any).picture ?? undefined,
        },
        create: {
          googleId: sub,
          email: email,
          name: (profile as any).name,
          avatarUrl: (profile as any).picture,
          referralCode: await generateUniqueReferralCode(),
          referredById: referredById ?? undefined,
        },
        select: { id: true, banned: true },
      });
      // Stash dbUser.id on the user object so jwt() picks it up.
      (user as any).id = dbUser.id;
      if (dbUser.banned) return false;
      return true;
    },
    async jwt({ token, user }) {
      const t = token as OmniJWT;
      if (user?.id) t.uid = user.id as string;
      if (t.uid) {
        const dbUser = await prisma.user.findUnique({
          where: { id: t.uid },
          select: { referralCode: true, tokenBalance: true, proPassUntil: true, role: true },
        });
        if (dbUser) {
          t.referralCode = dbUser.referralCode;
          t.tokenBalance = dbUser.tokenBalance;
          t.proPassUntil = dbUser.proPassUntil ? dbUser.proPassUntil.toISOString() : null;
          t.role = dbUser.role;
        }
      }
      return t as typeof token;
    },
    async session({ session, token }) {
      const t = token as OmniJWT;
      if (t.uid) {
        session.user.id = t.uid;
        session.user.referralCode = t.referralCode ?? '';
        session.user.tokenBalance = t.tokenBalance ?? 0;
        session.user.proPassUntil = t.proPassUntil ?? null;
        session.user.role = t.role ?? 'USER';
      }
      return session;
    },
  },
});
