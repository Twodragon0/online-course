import { NextResponse } from 'next/server';
import { hash } from 'bcrypt';
import { prisma } from '@/lib/prisma';
import {
  isValidEmail,
  isValidPassword,
  sanitizeInput,
  checkRateLimit,
  getClientIp,
} from '@/lib/security';

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`register:${clientIp}`, 5, 60000); // 1분에 5회
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

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { email: rawEmail, password: rawPassword, name: rawName } = body;

    // 입력 검증
    if (!rawEmail || !rawPassword || !rawName) {
      return NextResponse.json(
        { error: '이메일, 비밀번호, 이름은 필수입니다.' },
        { status: 400 }
      );
    }

    // 이메일 검증 및 sanitization
    const email = sanitizeInput(rawEmail).toLowerCase();
    if (!isValidEmail(email)) {
      return NextResponse.json(
        { error: '유효한 이메일 주소를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 비밀번호 검증
    const passwordValidation = isValidPassword(rawPassword);
    if (!passwordValidation.valid) {
      return NextResponse.json(
        { error: passwordValidation.errors.join(' ') },
        { status: 400 }
      );
    }

    // 이름 sanitization
    const name = sanitizeInput(rawName);
    if (name.length < 1 || name.length > 100) {
      return NextResponse.json(
        { error: '이름은 1자 이상 100자 이하여야 합니다.' },
        { status: 400 }
      );
    }

    // 이메일 중복 체크
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 400 }
      );
    }

    // 비밀번호 해시화
    const hashedPassword = await hash(rawPassword, 12); // salt rounds 증가

    // 사용자 생성
    const user = await prisma.user.create({
      data: {
        email,
        name,
        password: hashedPassword,
      },
    });

    return NextResponse.json(
      {
        user: {
          email: user.email,
          name: user.name,
        },
      },
      {
        status: 201,
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error) {
    // 에러 로깅 (민감한 정보 제외)
    console.error('Registration error:', error instanceof Error ? error.message : 'Unknown error');
    
    // 데이터베이스 오류인 경우 구체적인 정보 노출 방지
    if (error instanceof Error && error.message.includes('Unique constraint')) {
      return NextResponse.json(
        { error: '이미 등록된 이메일입니다.' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: '회원가입에 실패했습니다.' },
      { status: 500 }
    );
  }
} 