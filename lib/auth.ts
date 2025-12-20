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

  // NEXTAUTH_URL이 없어도 동적으로 처리할 수 있도록 경고만 출력
  if (!nextAuthUrl || nextAuthUrl.trim().length === 0) {
    if (process.env.NODE_ENV === 'development') {
      console.warn('NEXTAUTH_URL이 설정되지 않았습니다. 요청 호스트를 기반으로 동적으로 설정됩니다.');
    }
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

        // 구독 상태 가져오기 (우선순위: token > database)
        if (token?.subscriptionStatus) {
          // JWT token에서 구독 상태 가져오기 (JWT 전략 사용 시)
          session.user.subscriptionStatus = token.subscriptionStatus as string;
        } else if (isDatabaseUrlValid() && prisma && session.user.email) {
          // 데이터베이스에서 구독 상태 가져오기 (database 전략 사용 시)
          try {
            const dbUser = await prisma.user.findUnique({
              where: { email: session.user.email },
              select: { subscriptionStatus: true },
            });
            if (dbUser) {
              session.user.subscriptionStatus = dbUser.subscriptionStatus;
            } else {
              // 사용자를 찾을 수 없으면 기본값 설정
              session.user.subscriptionStatus = 'inactive';
            }
          } catch (error) {
            console.warn('[Auth] Failed to fetch subscription status:', error);
            session.user.subscriptionStatus = 'inactive';
          }
        } else {
          // 기본값 설정
          session.user.subscriptionStatus = 'inactive';
        }
      }
      return session;
    },
    jwt: async ({ token, user, trigger, account }) => {
      if (user) {
        token.id = user.id;
        // user 객체에서 email 가져오기 (PrismaAdapter 사용 시)
        if ('email' in user && user.email) {
          token.email = user.email;
        }
      }
      
      // account에서 email 가져오기 (Google OAuth)
      if (account && 'email' in account && account.email && typeof account.email === 'string') {
        token.email = account.email;
      }
      
      // 구독 상태를 JWT token에 포함 (JWT 전략 사용 시)
      if (token.email && isDatabaseUrlValid() && prisma) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { subscriptionStatus: true },
          });
          if (dbUser) {
            token.subscriptionStatus = dbUser.subscriptionStatus;
          } else {
            token.subscriptionStatus = 'inactive';
          }
        } catch (error) {
          console.warn('[Auth] Failed to fetch subscription status in JWT:', error);
          token.subscriptionStatus = 'inactive';
        }
      }
      
      // 세션 업데이트 시 구독 상태 갱신
      if (trigger === 'update' && token.email && isDatabaseUrlValid() && prisma) {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: token.email as string },
            select: { subscriptionStatus: true },
          });
          if (dbUser) {
            token.subscriptionStatus = dbUser.subscriptionStatus;
          } else {
            token.subscriptionStatus = 'inactive';
          }
        } catch (error) {
          console.warn('[Auth] Failed to update subscription status in JWT:', error);
        }
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