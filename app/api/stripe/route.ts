import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import Stripe from 'stripe';
import {
  isValidStripePriceId,
  checkRateLimit,
  getClientIp,
} from '@/lib/security';

// Stripe 클라이언트 초기화 (환경 변수 검증)
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.trim().length === 0) {
    throw new Error('Stripe secret key is not configured');
  }
  
  // Stripe 키 형식 검증
  if (!secretKey.startsWith('sk_')) {
    throw new Error('Invalid Stripe secret key format');
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia',
  });
};

export async function POST(request: Request) {
  try {
    // 인증 확인
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`stripe:${clientIp}`, 5, 60000); // 1분에 5회
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

    const body = await request.json();
    const { priceId } = body;

    // 입력 검증
    if (!priceId || typeof priceId !== 'string') {
      return NextResponse.json(
        { error: '가격 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Stripe Price ID 검증
    if (!isValidStripePriceId(priceId)) {
      return NextResponse.json(
        { error: '유효하지 않은 가격 ID입니다.' },
        { status: 400 }
      );
    }

    // Stripe 클라이언트 초기화
    const stripe = getStripe();

    // NEXTAUTH_URL 검증
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    if (!nextAuthUrl || !nextAuthUrl.startsWith('https://')) {
      return NextResponse.json(
        { error: '서버 설정 오류' },
        { status: 500 }
      );
    }

    const checkoutSession = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${nextAuthUrl}/dashboard?success=true`,
      cancel_url: `${nextAuthUrl}/pricing?canceled=true`,
      customer_email: session.user.email,
    });

    return NextResponse.json(
      { sessionId: checkoutSession.id },
      {
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Stripe API Error:', error instanceof Error ? error.message : 'Unknown error');
    
    if (error instanceof Stripe.errors.StripeError) {
      return NextResponse.json(
        { error: '결제 세션 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { error: '결제 세션 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    // Rate limiting
    const clientIp = getClientIp({ headers: new Headers() } as Request);
    const rateLimit = await checkRateLimit(`stripe-get:${clientIp}`, 20, 60000); // 1분에 20회
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

    const stripe = getStripe();
    const prices = await stripe.prices.list({
      active: true,
      limit: 10,
      expand: ['data.product']
    });

    return NextResponse.json(prices.data, {
      headers: {
        'X-RateLimit-Limit': '20',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      },
    });
  } catch (error) {
    console.error('Stripe API Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: '가격 정보를 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
} 