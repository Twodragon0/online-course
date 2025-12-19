import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import type { NextRequest } from "next/server";

/**
 * NextAuth 핸들러
 * 요청의 호스트를 기반으로 동적으로 base URL을 설정합니다.
 */
const handler = async (req: NextRequest, context: { params: { nextauth: string[] } }) => {
  // 요청의 호스트를 기반으로 NEXTAUTH_URL 동적 설정
  const host = req.headers.get('host') || '';
  const protocol = req.headers.get('x-forwarded-proto') || 'https';
  const baseUrl = `${protocol}://${host}`;
  
  // 허용된 도메인 확인
  const allowedDomains = [
    'edu.2twodragon.com',
    'twodragon.vercel.app',
    'localhost:3000',
  ];
  
  const isAllowedDomain = allowedDomains.some(domain => 
    host === domain || host.endsWith(`.${domain}`)
  );
  
  if (isAllowedDomain && process.env.NODE_ENV === 'production') {
    // 동적으로 NEXTAUTH_URL 설정 (요청 시점에만)
    process.env.NEXTAUTH_URL = baseUrl;
  }
  
  return NextAuth(authOptions)(req, context);
};

export const GET = handler;
export const POST = handler; 