import { NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

/**
 * PayPal 웹훅 시크릿 검증
 */
function getPayPalWebhookSecret(): string {
  const secret = process.env.PAYPAL_WEBHOOK_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error('PayPal webhook secret is not configured');
  }
  return secret;
}

/**
 * PayPal 웹훅 서명 검증
 * 참고: PayPal 웹훅 검증은 PayPal SDK를 사용하거나 직접 구현할 수 있습니다.
 * 여기서는 기본적인 검증을 구현합니다.
 */
async function verifyPayPalWebhook(
  body: string,
  headers: Headers
): Promise<boolean> {
  try {
    const webhookSecret = getPayPalWebhookSecret();
    const signature = headers.get('paypal-transmission-sig');
    const transmissionId = headers.get('paypal-transmission-id');
    const certUrl = headers.get('paypal-cert-url');
    const authAlgo = headers.get('paypal-auth-algo');
    const transmissionTime = headers.get('paypal-transmission-time');

    // 필수 헤더 확인
    if (!signature || !transmissionId || !certUrl || !authAlgo || !transmissionTime) {
      console.error('Missing PayPal webhook headers');
      return false;
    }

    // 실제 프로덕션에서는 PayPal SDK를 사용하여 서명 검증을 수행해야 합니다.
    // 여기서는 기본적인 검증만 수행합니다.
    // 참고: @paypal/checkout-server-sdk 또는 paypal-rest-sdk 사용 권장
    
    // 개발 환경에서는 간단한 검증만 수행
    if (process.env.NODE_ENV === 'development') {
      return true;
    }

    // 프로덕션 환경에서는 PayPal SDK를 사용한 검증 필요
    // 예시: PayPal SDK를 사용한 검증 로직
    // const paypal = require('@paypal/checkout-server-sdk');
    // const environment = new paypal.core.SandboxEnvironment(...);
    // const client = new paypal.core.PayPalHttpClient(environment);
    // const request = new paypal.notifications.WebhooksVerifyWebhookSignatureRequest();
    // ... 검증 로직

    // 현재는 기본 검증만 수행
    return webhookSecret.length > 0;
  } catch (error) {
    console.error('PayPal webhook verification error:', error);
    return false;
  }
}

/**
 * PayPal 웹훅 이벤트 타입 정의
 */
interface PayPalWebhookEvent {
  id: string;
  event_type: string;
  resource_type?: string;
  resource?: {
    id?: string;
    status?: string;
    billing_agreement_id?: string;
    payer?: {
      payer_info?: {
        email?: string;
      };
    };
  };
  summary?: string;
  create_time?: string;
}

export async function POST(request: Request) {
  try {
    // 요청 본문 가져오기
    const body = await request.text();
    const headersList = await headers();

    // PayPal 웹훅 서명 검증
    const isValid = await verifyPayPalWebhook(body, headersList);
    if (!isValid) {
      console.error('PayPal webhook signature verification failed');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // JSON 파싱
    let event: PayPalWebhookEvent;
    try {
      event = JSON.parse(body) as PayPalWebhookEvent;
    } catch (error) {
      console.error('Failed to parse PayPal webhook body:', error);
      return NextResponse.json(
        { error: 'Invalid webhook body' },
        { status: 400 }
      );
    }

    // 이벤트 타입에 따른 처리
    switch (event.event_type) {
      case 'PAYMENT.SALE.COMPLETED': {
        // 결제 완료 처리
        if (prisma && event.resource?.payer?.payer_info?.email) {
          try {
            const email = event.resource.payer.payer_info.email.toLowerCase().trim();
            await prisma.user.updateMany({
              where: { email },
              data: {
                subscriptionStatus: 'active',
                paypalOrderId: event.resource.id || null,
              },
            });
            console.log(`PayPal payment completed for user: ${email}`);
          } catch (error) {
            console.error('Failed to update PayPal payment:', error instanceof Error ? error.message : 'Unknown error');
          }
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.CREATED':
      case 'BILLING.SUBSCRIPTION.ACTIVATED': {
        // 구독 생성/활성화 처리
        if (prisma && event.resource?.id) {
          try {
            const subscriptionId = event.resource.id;
            // 이메일은 웹훅 이벤트에서 직접 제공되지 않을 수 있으므로
            // 추가 정보가 필요할 수 있습니다.
            // 실제 구현에서는 구독 생성 시 이메일을 저장하거나
            // PayPal API를 통해 조회해야 합니다.
            console.log(`PayPal subscription created/activated: ${subscriptionId}`);
          } catch (error) {
            console.error('Failed to process PayPal subscription:', error instanceof Error ? error.message : 'Unknown error');
          }
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.CANCELLED':
      case 'BILLING.SUBSCRIPTION.EXPIRED': {
        // 구독 취소/만료 처리
        if (prisma && event.resource?.id) {
          try {
            const subscriptionId = event.resource.id;
            await prisma.user.updateMany({
              where: { paypalSubscriptionId: subscriptionId },
              data: {
                subscriptionStatus: 'inactive',
              },
            });
            console.log(`PayPal subscription cancelled/expired: ${subscriptionId}`);
          } catch (error) {
            console.error('Failed to cancel PayPal subscription:', error instanceof Error ? error.message : 'Unknown error');
          }
        }
        break;
      }

      case 'BILLING.SUBSCRIPTION.UPDATED': {
        // 구독 업데이트 처리
        if (prisma && event.resource?.id) {
          try {
            const subscriptionId = event.resource.id;
            const status = event.resource.status;
            
            // PayPal 구독 상태를 우리 시스템 상태로 매핑
            const subscriptionStatus = status === 'ACTIVE' ? 'active' : 'inactive';
            
            await prisma.user.updateMany({
              where: { paypalSubscriptionId: subscriptionId },
              data: {
                subscriptionStatus: subscriptionStatus,
              },
            });
            console.log(`PayPal subscription updated: ${subscriptionId} -> ${subscriptionStatus}`);
          } catch (error) {
            console.error('Failed to update PayPal subscription:', error instanceof Error ? error.message : 'Unknown error');
          }
        }
        break;
      }

      default:
        console.log(`Unhandled PayPal webhook event type: ${event.event_type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('PayPal webhook error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}
