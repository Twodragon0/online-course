'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CreditCard, Wallet, Loader2 } from 'lucide-react';
import { PaymentCheckout } from './payment-checkout';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

interface PaymentMethodSelectorProps {
  planId: 'basic' | 'pro';
  planName: string;
  price: number;
  stripePriceId?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

type PaymentMethod = 'stripe' | 'paypal' | null;

// Type guard helper
const isStripe = (method: PaymentMethod): method is 'stripe' => {
  return method === 'stripe';
};

export function PaymentMethodSelector({
  planId,
  planName,
  price,
  stripePriceId,
  onSuccess,
  onCancel,
}: PaymentMethodSelectorProps) {
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [isProcessingPayPal, setIsProcessingPayPal] = useState(false);
  const { data: session } = useSession();
  const router = useRouter();

  const handlePayPalPayment = async () => {
    if (!session?.user?.email) {
      router.push('/login');
      return;
    }

    try {
      setIsProcessingPayPal(true);

      const response = await fetch('/api/create-paypal-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          planId,
          price,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'PayPal 결제 세션 생성에 실패했습니다.');
      }

      const data = await response.json();
      
      // PayPal 결제 페이지로 리다이렉트
      if (data.approvalUrl) {
        window.location.href = data.approvalUrl;
      } else {
        throw new Error('PayPal 결제 URL을 받을 수 없습니다.');
      }
    } catch (error) {
      console.error('PayPal payment error:', error);
      alert(error instanceof Error ? error.message : 'PayPal 결제에 실패했습니다.');
      setIsProcessingPayPal(false);
    }
  };

  if (selectedMethod === 'stripe') {
    return (
      <PaymentCheckout
        planId={planId}
        planName={planName}
        price={price}
        priceId={stripePriceId}
        onSuccess={onSuccess}
        onCancel={() => setSelectedMethod(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold mb-2">결제 방법 선택</h3>
        <p className="text-sm text-muted-foreground">
          안전하고 편리한 결제 방법을 선택해주세요
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card
          className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
            isStripe(selectedMethod)
              ? 'ring-2 ring-primary'
              : 'hover:border-primary/50'
          }`}
          onClick={() => setSelectedMethod('stripe')}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CreditCard className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-1">신용카드</h4>
              <p className="text-xs text-muted-foreground">
                Visa, Mastercard, Amex 등
              </p>
            </div>
            <Button
              variant={isStripe(selectedMethod) ? 'default' : 'outline'}
              className="w-full"
            >
              {isStripe(selectedMethod) ? '선택됨' : '선택하기'}
            </Button>
          </div>
        </Card>

        <Card
          className={`p-6 cursor-pointer transition-all hover:shadow-lg ${
            selectedMethod === 'paypal'
              ? 'ring-2 ring-primary'
              : 'hover:border-primary/50'
          }`}
          onClick={handlePayPalPayment}
        >
          <div className="flex flex-col items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Wallet className="h-6 w-6 text-primary" />
            </div>
            <div className="text-center">
              <h4 className="font-semibold mb-1">PayPal</h4>
              <p className="text-xs text-muted-foreground">
                PayPal 계정으로 결제
              </p>
            </div>
            <Button
              variant={selectedMethod === 'paypal' ? 'default' : 'outline'}
              className="w-full"
              disabled={isProcessingPayPal}
            >
              {isProcessingPayPal ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                '선택하기'
              )}
            </Button>
          </div>
        </Card>
      </div>

      {onCancel && (
        <Button
          variant="ghost"
          onClick={onCancel}
          className="w-full"
        >
          취소
        </Button>
      )}

      <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground pt-4">
        <span>🔒 모든 결제는 SSL로 암호화됩니다</span>
      </div>
    </div>
  );
}
