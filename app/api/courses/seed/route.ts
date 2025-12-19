import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/security';

/**
 * 관리자 이메일 목록 (환경 변수에서 가져오거나 하드코딩)
 */
function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS;
  if (adminEmailsEnv) {
    return adminEmailsEnv.split(',').map(email => email.trim().toLowerCase());
  }
  // 기본 관리자 이메일 (개발 환경용)
  return [];
}

/**
 * 관리자 권한 확인
 */
async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    // 관리자 이메일이 설정되지 않은 경우 개발 환경에서만 허용
    return process.env.NODE_ENV === 'development';
  }
  return adminEmails.includes(email.toLowerCase().trim());
}

/**
 * 코스 시드 API
 * 개발 환경에서만 사용 가능하며, 관리자 권한이 필요합니다.
 * 프로덕션 환경에서는 비활성화됩니다.
 */
export async function GET(request: Request) {
  try {
    // 프로덕션 환경에서는 비활성화
    if (process.env.NODE_ENV === 'production') {
      return NextResponse.json(
        { error: '이 API는 프로덕션 환경에서 사용할 수 없습니다.' },
        { status: 403 }
      );
    }

    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`seed:${clientIp}`, 5, 60000); // 1분에 5회
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          },
        }
      );
    }

    // 인증 확인
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    const email = session.user.email.toLowerCase().trim();
    if (!(await isAdmin(email))) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    // 실제 시드 로직은 여기에 구현
    // 예시: 기본 코스 데이터 생성
    // const courses = await prisma.course.createMany({
    //   data: [
    //     { title: 'DevSecOps 기초', description: '...', price: 0 },
    //     // ...
    //   ],
    //   skipDuplicates: true,
    // });

    // 현재는 더미 응답 반환
    return NextResponse.json(
      { 
        message: 'Seeding completed',
        note: '실제 시드 로직은 구현되지 않았습니다. 필요시 prisma/seed.ts를 참고하여 구현하세요.',
      },
      {
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Seed error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Failed to seed database' },
      { status: 500 }
    );
  }
}
