// app/api/courses/[courseId]/route.ts
import { NextResponse } from 'next/server';
import { prisma, isPrismaAvailable } from '@/lib/prisma';
import { checkRateLimit, getClientIp, getCached } from '@/lib/security';

export async function GET(
  request: Request,
  { params }: { params: { courseId: string } }
) {
  try {
    const { courseId } = params;

    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`course:${courseId}:${clientIp}`, 20, 60000); // 1분에 20회
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          },
        }
      );
    }

    if (!isPrismaAvailable()) {
      console.error(`[Course API] Prisma is not available for courseId: ${courseId}`);
      return NextResponse.json(
        { error: '데이터베이스가 설정되지 않았습니다. 관리자에게 문의해주세요.' },
        { status: 503 }
      );
    }

    // Redis 캐싱 적용 (1시간 TTL)
    const course = await getCached(
      `course:${courseId}`,
      async () => {
        return await prisma.course.findUnique({
          where: { id: courseId },
          include: {
            videos: {
              orderBy: {
                position: 'asc',
              },
            },
          },
        });
      },
      3600 // 1시간 캐시
    );

    if (!course) {
      return NextResponse.json(
        { error: '코스를 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    return NextResponse.json(course, {
      headers: {
        'X-RateLimit-Limit': '20',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
      },
    });
  } catch (error) {
    console.error(`Failed to fetch course ${params.courseId}:`, error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: '코스를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}
