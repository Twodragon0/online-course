import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

// DATABASE_URL 검증
function isDatabaseUrlValid(): boolean {
  const dbUrl = process.env.DATABASE_URL;
  return !!(dbUrl && (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql+pooler://')));
}

export const authOptions: NextAuthOptions = {
  // DATABASE_URL이 유효한 경우에만 PrismaAdapter 사용
  ...(isDatabaseUrlValid() && prisma ? { adapter: PrismaAdapter(prisma) } : {}),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID || '',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || '',
    }),
  ],
  callbacks: {
    session: async ({ session, token, user }) => {
      if (session?.user) {
        // PrismaAdapter를 사용하지 않는 경우 token에서 id 가져오기
        if (user) {
          session.user.id = user.id;
        } else if (token?.sub) {
          session.user.id = token.sub;
        }
      }
      return session;
    },
    jwt: async ({ token, user }) => {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
  pages: {
    signIn: '/login',
  },
  session: {
    strategy: isDatabaseUrlValid() && prisma ? 'database' : 'jwt',
  },
  secret: process.env.NEXTAUTH_SECRET,
}; 