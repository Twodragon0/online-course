import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const response = NextResponse.next()

  // CORS 헤더 설정
  response.headers.set('Access-Control-Allow-Origin', 'https://edu.2twodragon.com')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')

  // 기본 보안 헤더
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Referrer-Policy', 'origin-when-cross-origin')

  return response
}