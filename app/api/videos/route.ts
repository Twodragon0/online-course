import { NextResponse } from 'next/server';
import { prisma, isPrismaAvailable } from '@/lib/prisma';
import { checkRateLimit, getClientIp, getCached } from '@/lib/security';

export async function GET(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`videos:${clientIp}`, 30, 60000); // 1분에 30회
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          },
        }
      );
    }

    // 빌드 시점에는 빈 배열 반환
    if (process.env.NEXT_PHASE === 'phase-production-build') {
      return NextResponse.json([]);
    }

    // DATABASE_URL 검증
    if (!isPrismaAvailable()) {
      console.error('[Videos API] Prisma is not available');
      return NextResponse.json(
        { error: '데이터베이스가 설정되지 않았습니다. 관리자에게 문의해주세요.' },
        { status: 503 }
      );
    }

    // Prisma 사용 가능 여부 확인 (에러 처리)

    // Redis 캐싱 적용 (5분 TTL)
    const videos = await getCached(
      'videos:list',
      async () => {
        return await prisma.video.findMany({
          orderBy: {
            createdAt: 'asc',
          },
          include: {
            course: true,
          },
          take: 100, // 결과 제한 (DoS 방지)
        });
      },
      300 // 5분 캐시
    );

    return NextResponse.json(videos, {
      headers: {
        'X-RateLimit-Limit': '30',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Failed to fetch videos:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: '비디오 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 