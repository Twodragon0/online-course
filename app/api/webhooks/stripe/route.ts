import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { headers } from 'next/headers';
import { prisma } from '@/lib/prisma';

// Stripe 클라이언트 초기화
const getStripe = () => {
  const secretKey = process.env.STRIPE_SECRET_KEY;
  if (!secretKey || secretKey.trim().length === 0) {
    throw new Error('Stripe secret key is not configured');
  }
  
  if (!secretKey.startsWith('sk_')) {
    throw new Error('Invalid Stripe secret key format');
  }

  return new Stripe(secretKey, {
    apiVersion: '2025-02-24.acacia',
  });
};

// Stripe 웹훅 시크릿 검증
function getStripeWebhookSecret(): string {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret || secret.trim().length === 0) {
    throw new Error('Stripe webhook secret is not configured');
  }
  return secret;
}

export async function POST(request: Request) {
  try {
    const stripe = getStripe();
    const webhookSecret = getStripeWebhookSecret();
    
    // 요청 본문과 헤더 가져오기
    const body = await request.text();
    const headersList = await headers();
    const signature = headersList.get('stripe-signature');

    if (!signature) {
      return NextResponse.json(
        { error: 'Missing stripe-signature header' },
        { status: 400 }
      );
    }

    // Stripe 웹훅 서명 검증
    let event: Stripe.Event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      console.error('Webhook signature verification failed:', err instanceof Error ? err.message : 'Unknown error');
      return NextResponse.json(
        { error: 'Invalid signature' },
        { status: 400 }
      );
    }

    // 이벤트 타입에 따른 처리
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentIntent = event.data.object as Stripe.PaymentIntent;
        
        // Payment Intent 성공 시 구독 활성화
        if (prisma && paymentIntent.metadata?.userId && paymentIntent.metadata?.planId) {
          try {
            const email = paymentIntent.metadata.userId;
            const planId = paymentIntent.metadata.planId;
            
            await prisma.user.update({
              where: { email },
              data: {
                subscriptionStatus: 'active',
                stripeCustomerId: typeof paymentIntent.customer === 'string' 
                  ? paymentIntent.customer 
                  : paymentIntent.customer?.id || null,
              },
            });
            
            console.log(`Payment succeeded for user: ${email}, plan: ${planId}`);
          } catch (error) {
            console.error('Failed to update subscription from payment intent:', error instanceof Error ? error.message : 'Unknown error');
          }
        }
        break;
      }

      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        
        if (session.mode === 'subscription' && session.customer) {
          // 구독 활성화 처리
          if (prisma && session.customer_email) {
            try {
              await prisma.user.update({
                where: { email: session.customer_email },
                data: {
                  subscriptionStatus: 'active',
                  stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer.id,
                },
              });
            } catch (error) {
              console.error('Failed to update subscription:', error instanceof Error ? error.message : 'Unknown error');
            }
          }
        }
        break;
      }

      case 'customer.subscription.deleted':
      case 'customer.subscription.updated': {
        const subscription = event.data.object as Stripe.Subscription;
        
        if (prisma) {
          try {
            const customerId = typeof subscription.customer === 'string' 
              ? subscription.customer 
              : subscription.customer.id;
            
            const user = await prisma.user.findUnique({
              where: { stripeCustomerId: customerId },
            });

            if (user) {
              await prisma.user.update({
                where: { id: user.id },
                data: {
                  subscriptionStatus: event.type === 'customer.subscription.deleted' ? 'inactive' : 'active',
                },
              });
            }
          } catch (error) {
            console.error('Failed to update subscription status:', error instanceof Error ? error.message : 'Unknown error');
          }
        }
        break;
      }

      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Webhook error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
} 