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
 * 사용자를 Pro로 업그레이드하는 API
 * 관리자 권한이 필요합니다.
 */
export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`upgrade-pro:${clientIp}`, 10, 60000); // 1분에 10회
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '10',
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
    const adminEmail = session.user.email.toLowerCase().trim();
    if (!(await isAdmin(adminEmail))) {
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

    // 요청 본문에서 업그레이드할 이메일 가져오기
    const body = await request.json();
    const targetEmail = body.email?.toLowerCase().trim();

    if (!targetEmail) {
      return NextResponse.json(
        { error: '이메일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(targetEmail)) {
      return NextResponse.json(
        { error: '유효하지 않은 이메일 형식입니다.' },
        { status: 400 }
      );
    }

    // 사용자 찾기 또는 생성
    let user = await prisma.user.findUnique({
      where: { email: targetEmail },
    });

    if (!user) {
      // 사용자가 없으면 생성
      user = await prisma.user.create({
        data: {
          email: targetEmail,
          subscriptionStatus: 'active',
        },
      });
    } else {
      // 사용자가 있으면 Pro로 업그레이드
      user = await prisma.user.update({
        where: { email: targetEmail },
        data: {
          subscriptionStatus: 'active',
        },
      });
    }

    // Subscription 레코드도 생성/업데이트
    await prisma.subscription.upsert({
      where: { userId: user.id },
      update: {
        status: 'active',
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        status: 'active',
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: `${targetEmail}이(가) Pro로 업그레이드되었습니다.`,
        user: {
          email: user.email,
          subscriptionStatus: user.subscriptionStatus,
        },
      },
      {
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Upgrade Pro error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Pro 업그레이드에 실패했습니다.' },
      { status: 500 }
    );
  }
}



