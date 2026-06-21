import NextAuth from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
  },
  providers: [
    Credentials({
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        isSignUp: { label: 'Is Sign Up', type: 'boolean' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Email and password are required');
        }

        const isSignUp = credentials.isSignUp === 'true';
        const email = credentials.email as string;
        const password = credentials.password as string;
        const name = (credentials.name as string) || email.split('@')[0];

        if (isSignUp) {
          const existing = await prisma.user.findUnique({ where: { email } });
          if (existing) {
            throw new Error('User already exists');
          }

          const hashedPassword = await bcrypt.hash(password, 10);
          const user = await prisma.user.create({
            data: { email, name, password: hashedPassword },
          });

          return { id: user.id, email: user.email, name: user.name };
        } else {
          const user = await prisma.user.findUnique({
            where: { email },
            select: { id: true, email: true, name: true, password: true },
          });

          if (!user || !user.password) {
            throw new Error('Invalid email or password');
          }

          const isValid = await bcrypt.compare(password, user.password);
          if (!isValid) {
            throw new Error('Invalid email or password');
          }

          return { id: user.id, email: user.email, name: user.name };
        }
      },
    }),
  ],
  pages: {
    signIn: '/auth/signin',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.id) {
        session.user.id = token.id as string;
      }
      return session;
    },
  },
});
