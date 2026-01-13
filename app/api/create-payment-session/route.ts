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
    const rateLimit = await checkRateLimit(`payment:${clientIp}`, 5, 60000); // 1분에 5회
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
    const { planId, priceId, price } = body;

    // 입력 검증
    if (!planId || (planId !== 'basic' && planId !== 'pro')) {
      return NextResponse.json(
        { error: '유효한 플랜 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    // Stripe 클라이언트 초기화
    const stripe = getStripe();

    // NEXTAUTH_URL 검증
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    if (!nextAuthUrl) {
      return NextResponse.json(
        { error: '서버 설정 오류' },
        { status: 500 }
      );
    }

    // 가격 정보 결정
    let finalPriceId = priceId;
    let finalPrice = price;

    // 환경 변수에서 Price ID 가져오기 (없으면 직접 가격 사용)
    if (!finalPriceId) {
      if (planId === 'basic') {
        finalPriceId = process.env.STRIPE_BASIC_PRICE_ID;
      } else if (planId === 'pro') {
        finalPriceId = process.env.STRIPE_PRO_PRICE_ID;
      }
    }

    // Price ID가 있으면 구독 모드, 없으면 일회성 결제
    if (finalPriceId && isValidStripePriceId(finalPriceId)) {
      // 구독 모드 (Price ID 사용)
      const checkoutSession = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: finalPriceId,
            quantity: 1,
          },
        ],
        mode: 'subscription',
        success_url: `${nextAuthUrl}/dashboard?payment=success&plan=${planId}`,
        cancel_url: `${nextAuthUrl}/pricing?canceled=true`,
        customer_email: session.user.email,
        metadata: {
          planId,
          userId: session.user.email,
        },
      });

      return NextResponse.json(
        { sessionId: checkoutSession.id, type: 'checkout' },
        {
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          },
        }
      );
    } else {
      // Payment Intent 모드 (직접 가격 사용)
      if (!finalPrice || typeof finalPrice !== 'number' || finalPrice <= 0) {
        return NextResponse.json(
          { error: '유효한 가격이 필요합니다.' },
          { status: 400 }
        );
      }

      // 고객 조회 또는 생성
      const { prisma } = await import('@/lib/prisma');
      let customerId: string | undefined;

      if (prisma) {
        const user = await prisma.user.findUnique({
          where: { email: session.user.email },
          select: { stripeCustomerId: true },
        });

        if (user?.stripeCustomerId) {
          customerId = user.stripeCustomerId;
        } else {
          // 고객 생성
          const customer = await stripe.customers.create({
            email: session.user.email,
            metadata: {
              userId: session.user.email,
            },
          });
          customerId = customer.id;

          // 데이터베이스에 저장
          await prisma.user.update({
            where: { email: session.user.email },
            data: { stripeCustomerId: customer.id },
          });
        }
      }

      // Payment Intent 생성
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(finalPrice * 100), // 원 단위를 센트로 변환
        currency: 'usd',
        customer: customerId,
        metadata: {
          planId,
          userId: session.user.email,
        },
        automatic_payment_methods: {
          enabled: true,
        },
      });

      return NextResponse.json(
        { clientSecret: paymentIntent.client_secret, type: 'payment_intent' },
        {
          headers: {
            'X-RateLimit-Limit': '5',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          },
        }
      );
    }
  } catch (error) {
    // 에러 로깅 (민감한 정보 제외)
    console.error('Payment session error:', error instanceof Error ? error.message : 'Unknown error');

    // Stripe 오류 처리
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