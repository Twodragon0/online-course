'use client';

import React, { useState, useEffect } from 'react';
import { loadStripe, StripeElementsOptions } from '@stripe/stripe-js';
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Loader2, CreditCard, Lock, CheckCircle2, XCircle } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';

// Stripe 초기화
const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || ''
);

interface PaymentCheckoutProps {
  planId: 'basic' | 'pro';
  planName: string;
  price: number;
  priceId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface CheckoutFormProps {
  planId: 'basic' | 'pro';
  planName: string;
  price: number;
  priceId?: string;
  clientSecret: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

function CheckoutForm({
  planId,
  planName,
  price,
  priceId,
  clientSecret,
  onSuccess,
  onCancel,
}: CheckoutFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsLoading(true);
    setError(null);
    setIsProcessing(true);

    try {
      // 결제 확인
      const { error: submitError } = await elements.submit();
      if (submitError) {
        setError(submitError.message || '결제 정보를 확인할 수 없습니다.');
        setIsLoading(false);
        setIsProcessing(false);
        return;
      }

      // 결제 처리
      const { error: paymentError, paymentIntent } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: `${window.location.origin}/dashboard?payment=success&plan=${planId}`,
        },
        redirect: 'if_required',
      });

      if (paymentError) {
        setError(paymentError.message || '결제에 실패했습니다.');
        setIsLoading(false);
        setIsProcessing(false);
      } else if (paymentIntent && paymentIntent.status === 'succeeded') {
        // 결제 성공
        if (onSuccess) {
          onSuccess();
        }
        router.push(`/dashboard?payment=success&plan=${planId}`);
      }
    } catch (err) {
      setError('결제 처리 중 오류가 발생했습니다.');
      setIsLoading(false);
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <PaymentElement
          options={{
            layout: 'tabs',
          }}
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm">
          <XCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        <Button
          type="submit"
          disabled={!stripe || !elements || isLoading || isProcessing}
          className="flex-1"
        >
          {isLoading || isProcessing ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              처리 중...
            </>
          ) : (
            <>
              <Lock className="mr-2 h-4 w-4" />
              ${price.toLocaleString()} 결제하기
            </>
          )}
        </Button>
        {onCancel && (
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isLoading || isProcessing}
          >
            취소
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Lock className="h-3 w-3" />
        <span>결제 정보는 안전하게 암호화되어 전송됩니다.</span>
      </div>
    </form>
  );
}

export function PaymentCheckout({
  planId,
  planName,
  price,
  priceId,
  onSuccess,
  onCancel,
}: PaymentCheckoutProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<'payment_intent' | 'checkout' | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();
  const router = useRouter();

  useEffect(() => {
    const createPaymentSession = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // 결제 세션 생성
        const response = await fetch('/api/create-payment-session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            planId,
            priceId,
            price,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || '결제 세션 생성에 실패했습니다.');
        }

        const data = await response.json();
        
        if (data.type === 'checkout' && data.sessionId) {
          // Checkout Session인 경우 Stripe Checkout으로 리다이렉트
          setSessionId(data.sessionId);
          setPaymentType('checkout');
          
          // Stripe Checkout으로 리다이렉트
          const stripe = await stripePromise;
          if (stripe && data.sessionId) {
            const { error: redirectError } = await stripe.redirectToCheckout({
              sessionId: data.sessionId,
            });
            
            if (redirectError) {
              setError(redirectError.message || '결제 페이지로 이동할 수 없습니다.');
              setIsLoading(false);
            }
          } else {
            setError('Stripe를 초기화할 수 없습니다.');
            setIsLoading(false);
          }
        } else if (data.type === 'payment_intent' && data.clientSecret) {
          // Payment Intent인 경우
          setClientSecret(data.clientSecret);
          setPaymentType('payment_intent');
        } else {
          throw new Error('결제 세션 정보를 받을 수 없습니다.');
        }
      } catch (err) {
        setError(
          err instanceof Error ? err.message : '결제 세션 생성에 실패했습니다.'
        );
      } finally {
        setIsLoading(false);
      }
    };

    if (session?.user) {
      createPaymentSession();
    } else {
      setError('로그인이 필요합니다.');
      setIsLoading(false);
    }
  }, [planId, priceId, price, session, router]);

  const options: StripeElementsOptions = {
    clientSecret: clientSecret || undefined,
    appearance: {
      theme: 'stripe',
      variables: {
        colorPrimary: 'hsl(var(--primary))',
        colorBackground: 'hsl(var(--background))',
        colorText: 'hsl(var(--foreground))',
        colorDanger: 'hsl(var(--destructive))',
        fontFamily: 'system-ui, sans-serif',
        spacingUnit: '4px',
        borderRadius: '8px',
      },
    },
    locale: 'ko',
  };

  if (isLoading) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">결제 세션을 준비하는 중...</p>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <XCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">{error}</p>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="mt-4">
              돌아가기
            </Button>
          )}
        </div>
      </Card>
    );
  }

  // Checkout Session인 경우 (리다이렉트 중)
  if (paymentType === 'checkout') {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">결제 페이지로 이동하는 중...</p>
        </div>
      </Card>
    );
  }

  // Payment Intent인 경우
  if (!clientSecret || paymentType !== 'payment_intent') {
    return (
      <Card className="p-8">
        <div className="flex flex-col items-center justify-center gap-4">
          <XCircle className="h-8 w-8 text-destructive" />
          <p className="text-sm text-destructive">결제 세션을 생성할 수 없습니다.</p>
          {onCancel && (
            <Button variant="outline" onClick={onCancel} className="mt-4">
              돌아가기
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold mb-2">{planName} 플랜</h3>
        <p className="text-2xl font-bold text-primary">
          {price.toLocaleString()}원
        </p>
      </div>

      <Elements stripe={stripePromise} options={options}>
        <CheckoutForm
          planId={planId}
          planName={planName}
          price={price}
          priceId={priceId}
          clientSecret={clientSecret}
          onSuccess={onSuccess}
          onCancel={onCancel}
        />
      </Elements>
    </Card>
  );
}
