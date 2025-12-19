import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

/**
 * NextAuth 핸들러
 * 
 * NextAuth는 요청의 호스트를 기반으로 자동으로 base URL을 감지합니다.
 * Vercel에서는 x-forwarded-host 헤더를 통해 호스트 정보를 전달합니다.
 * 
 * 참고: NEXTAUTH_URL이 설정되어 있으면 우선 사용되지만,
 * 설정되지 않은 경우 요청의 호스트를 기반으로 자동 설정됩니다.
 */
const handler = NextAuth(authOptions);

export const GET = handler;
export const POST = handler; 