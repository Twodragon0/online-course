import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import {
  checkRateLimit,
  getClientIp,
} from '@/lib/security';

/**
 * PayPal 결제 세션 생성 API
 * PayPal SDK를 사용하여 결제 세션을 생성합니다.
 */
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
    const rateLimit = await checkRateLimit(`paypal:${clientIp}`, 5, 60000); // 1분에 5회
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
    const { planId, price } = body;

    // 입력 검증
    if (!planId || (planId !== 'basic' && planId !== 'pro')) {
      return NextResponse.json(
        { error: '유효한 플랜 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!price || typeof price !== 'number' || price <= 0) {
      return NextResponse.json(
        { error: '유효한 가격이 필요합니다.' },
        { status: 400 }
      );
    }

    // PayPal 클라이언트 ID 및 시크릿 확인
    const paypalClientId = process.env.PAYPAL_CLIENT_ID;
    const paypalClientSecret = process.env.PAYPAL_CLIENT_SECRET;

    if (!paypalClientId || !paypalClientSecret) {
      return NextResponse.json(
        { error: 'PayPal 설정이 완료되지 않았습니다.' },
        { status: 500 }
      );
    }

    // NEXTAUTH_URL 검증
    const nextAuthUrl = process.env.NEXTAUTH_URL;
    if (!nextAuthUrl) {
      return NextResponse.json(
        { error: '서버 설정 오류' },
        { status: 500 }
      );
    }

    // PayPal 환경 설정 (sandbox 또는 live)
    const isProduction = process.env.NODE_ENV === 'production';
    const paypalBaseUrl = isProduction
      ? 'https://api-m.paypal.com'
      : 'https://api-m.sandbox.paypal.com';

    // PayPal 액세스 토큰 가져오기
    const tokenResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${Buffer.from(`${paypalClientId}:${paypalClientSecret}`).toString('base64')}`,
      },
      body: 'grant_type=client_credentials',
    });

    if (!tokenResponse.ok) {
      console.error('PayPal token error:', await tokenResponse.text());
      return NextResponse.json(
        { error: 'PayPal 인증에 실패했습니다.' },
        { status: 500 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    // PayPal 주문 생성
    const orderResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
        'PayPal-Request-Id': `${Date.now()}-${Math.random().toString(36).substring(7)}`,
      },
      body: JSON.stringify({
        intent: 'CAPTURE',
        application_context: {
          brand_name: 'Online Course Platform',
          locale: 'ko-KR',
          landing_page: 'BILLING',
          user_action: 'PAY_NOW',
          return_url: `${nextAuthUrl}/dashboard?payment=success&plan=${planId}&method=paypal`,
          cancel_url: `${nextAuthUrl}/pricing?canceled=true&method=paypal`,
        },
        purchase_units: [
          {
            amount: {
              currency_code: 'USD',
              value: price.toFixed(2),
            },
            description: `${planId === 'pro' ? 'Pro' : 'Basic'} Plan Subscription`,
          },
        ],
      }),
    });

    if (!orderResponse.ok) {
      const errorData = await orderResponse.json();
      console.error('PayPal order error:', errorData);
      return NextResponse.json(
        { error: 'PayPal 주문 생성에 실패했습니다.' },
        { status: 500 }
      );
    }

    const orderData = await orderResponse.json();

    // 주문에서 approval URL 추출
    const approvalUrl = orderData.links?.find(
      (link: { rel: string; href: string }) => link.rel === 'approve'
    )?.href;

    if (!approvalUrl) {
      return NextResponse.json(
        { error: 'PayPal 결제 URL을 생성할 수 없습니다.' },
        { status: 500 }
      );
    }

    // 데이터베이스에 주문 정보 저장
    const { prisma } = await import('@/lib/prisma');
    if (prisma) {
      try {
        await prisma.user.update({
          where: { email: session.user.email },
          data: {
            paypalOrderId: orderData.id,
          },
        });
      } catch (error) {
        console.error('Failed to save PayPal order ID:', error);
        // 주문 ID 저장 실패는 치명적이지 않으므로 계속 진행
      }
    }

    return NextResponse.json(
      {
        approvalUrl,
        orderId: orderData.id,
      },
      {
        headers: {
          'X-RateLimit-Limit': '5',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error) {
    // 에러 로깅 (민감한 정보 제외)
    console.error('PayPal session error:', error instanceof Error ? error.message : 'Unknown error');

    return NextResponse.json(
      { error: 'PayPal 결제 세션 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
}
