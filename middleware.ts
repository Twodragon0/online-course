import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * 보안 미들웨어
 * - SSRF 방지 (리다이렉트 URL 검증)
 * - CORS 헤더 설정
 * - 보안 헤더 추가
 * - Authorization Bypass 방지
 */

// 허용된 도메인 목록 (SSRF 방지)
const ALLOWED_DOMAINS = [
  'edu.2twodragon.com',
  'twodragon.vercel.app',
  'vercel.app',
  'localhost',
];

/**
 * URL이 안전한지 검증 (SSRF 방지)
 */
function isSafeUrl(url: string): boolean {
  try {
    const parsed = new URL(url);

    // 프로토콜 검증 (http, https만 허용)
    if (!['http:', 'https:'].includes(parsed.protocol)) {
      return false;
    }

    // 내부 네트워크 접근 방지
    const hostname = parsed.hostname.toLowerCase();
    if (
      hostname === 'localhost' ||
      hostname === '127.0.0.1' ||
      hostname === '0.0.0.0' ||
      hostname.startsWith('192.168.') ||
      hostname.startsWith('10.') ||
      hostname.startsWith('172.16.') ||
      hostname.startsWith('172.17.') ||
      hostname.startsWith('172.18.') ||
      hostname.startsWith('172.19.') ||
      hostname.startsWith('172.20.') ||
      hostname.startsWith('172.21.') ||
      hostname.startsWith('172.22.') ||
      hostname.startsWith('172.23.') ||
      hostname.startsWith('172.24.') ||
      hostname.startsWith('172.25.') ||
      hostname.startsWith('172.26.') ||
      hostname.startsWith('172.27.') ||
      hostname.startsWith('172.28.') ||
      hostname.startsWith('172.29.') ||
      hostname.startsWith('172.30.') ||
      hostname.startsWith('172.31.') ||
      hostname === '[::1]' ||
      hostname === '::1'
    ) {
      // localhost는 개발 환경에서만 허용
      if (process.env.NODE_ENV === 'production') {
        return false;
      }
    }

    // 허용된 도메인 확인
    const isAllowed = ALLOWED_DOMAINS.some(domain =>
      hostname === domain || hostname.endsWith(`.${domain}`)
    );

    return isAllowed;
  } catch {
    return false;
  }
}

/**
 * 리다이렉트 URL 검증 (SSRF 방지)
 */
function validateRedirectUrl(url: string | null): string | null {
  if (!url) return null;

  // 상대 경로는 항상 안전
  if (url.startsWith('/')) {
    return url;
  }

  // 절대 URL은 검증 필요
  if (url.startsWith('http://') || url.startsWith('https://')) {
    if (isSafeUrl(url)) {
      return url;
    }
    // 안전하지 않은 URL은 홈으로 리다이렉트
    return '/';
  }

  // 기타 프로토콜은 차단
  return null;
}

export function middleware(request: NextRequest) {
  const response = NextResponse.next();

  // SSRF 방지: 리다이렉트 URL 검증
  const redirectUrl = request.nextUrl.searchParams.get('redirect') ||
    request.nextUrl.searchParams.get('callbackUrl') ||
    request.headers.get('x-redirect-url');

  if (redirectUrl) {
    const safeRedirect = validateRedirectUrl(redirectUrl);
    if (safeRedirect && safeRedirect !== redirectUrl) {
      // 안전하지 않은 리다이렉트는 제거
      const url = request.nextUrl.clone();
      url.searchParams.delete('redirect');
      url.searchParams.delete('callbackUrl');
      return NextResponse.redirect(url);
    }
  }

  // CORS 헤더 설정 (필요한 경우)
  const origin = request.headers.get('origin');
  const allowedOrigins = [
    process.env.NEXTAUTH_URL,
    'https://edu.2twodragon.com',
    'https://twodragon.vercel.app',
  ].filter(Boolean) as string[];

  // Origin 검증 (CORS 공격 방지)
  if (origin) {
    try {
      const originUrl = new URL(origin);
      const isAllowedOrigin = allowedOrigins.some(allowed => {
        try {
          const allowedUrl = new URL(allowed);
          return originUrl.hostname === allowedUrl.hostname;
        } catch {
          return origin === allowed;
        }
      });

      if (isAllowedOrigin) {
        response.headers.set('Access-Control-Allow-Origin', origin);
        response.headers.set('Access-Control-Allow-Credentials', 'true');
        response.headers.set(
          'Access-Control-Allow-Methods',
          'GET, POST, PUT, DELETE, OPTIONS'
        );
        response.headers.set(
          'Access-Control-Allow-Headers',
          'Content-Type, Authorization'
        );
      }
    } catch {
      // 잘못된 origin은 무시
    }
  }

  // Content Security Policy
  const csp = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://js.stripe.com *.googletagmanager.com *.google-analytics.com",
    "style-src 'self' 'unsafe-inline' *.googleapis.com *.gstatic.com",
    "img-src 'self' data: https: blob: *.googleusercontent.com *.googletagmanager.com *.google-analytics.com",
    "font-src 'self' data: *.gstatic.com",
    "connect-src 'self' https://api.deepseek.com https://api.openai.com https://api.stripe.com *.googleapis.com *.google.com *.youtube.com *.vimeo.com",
    "frame-src https://js.stripe.com https://hooks.stripe.com *.youtube.com *.vimeo.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "frame-ancestors 'none'",
    "upgrade-insecure-requests",
  ].join('; ');

  response.headers.set('Content-Security-Policy', csp);

  // Referrer Policy
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');

  // Permissions Policy
  response.headers.set(
    'Permissions-Policy',
    'camera=(), microphone=(), geolocation=()'
  );

  // OPTIONS 요청 처리 (CORS preflight)
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, {
      status: 200,
      headers: response.headers,
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * 다음 경로를 제외한 모든 요청:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};
