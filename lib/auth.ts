import { PrismaAdapter } from "@auth/prisma-adapter";
import { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { prisma } from "./prisma";

// DATABASE_URL 검증
function isDatabaseUrlValid(): boolean {
  // 빌드 시점에는 false 반환
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    return false;
  }
  
  const dbUrl = process.env.DATABASE_URL;
  return !!(dbUrl && (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql+pooler://')));
}

// 환경 변수 검증
function validateAuthEnv(): { valid: boolean; errors: string[] } {
  const errors: string[] = [];
  
  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const nextAuthSecret = process.env.NEXTAUTH_SECRET;
  const nextAuthUrl = process.env.NEXTAUTH_URL;

  if (!googleClientId || googleClientId.trim().length === 0) {
    errors.push('GOOGLE_CLIENT_ID is required');
  }

  if (!googleClientSecret || googleClientSecret.trim().length === 0) {
    errors.push('GOOGLE_CLIENT_SECRET is required');
  }

  if (!nextAuthSecret || nextAuthSecret.trim().length === 0) {
    errors.push('NEXTAUTH_SECRET is required');
  } else if (nextAuthSecret.length < 32) {
    errors.push('NEXTAUTH_SECRET must be at least 32 characters');
  }

  if (!nextAuthUrl || nextAuthUrl.trim().length === 0) {
    errors.push('NEXTAUTH_URL is required');
  } else if (!nextAuthUrl.startsWith('https://') && process.env.NODE_ENV === 'production') {
    errors.push('NEXTAUTH_URL must use HTTPS in production');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
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
    maxAge: 30 * 24 * 60 * 60, // 30일
    updateAge: 24 * 60 * 60, // 24시간마다 업데이트
  },
  secret: process.env.NEXTAUTH_SECRET,
  // 보안 설정
  useSecureCookies: process.env.NODE_ENV === 'production',
  cookies: {
    sessionToken: {
      name: process.env.NODE_ENV === 'production' 
        ? '__Secure-next-auth.session-token' 
        : 'next-auth.session-token',
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
};

// 개발 환경에서만 환경 변수 검증 경고 출력
if (process.env.NODE_ENV === 'development') {
  const envValidation = validateAuthEnv();
  if (!envValidation.valid) {
    console.warn('Auth environment variables validation failed:');
    envValidation.errors.forEach(error => console.warn(`  - ${error}`));
  }
} 