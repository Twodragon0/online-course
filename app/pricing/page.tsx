'use client';

import React, { useState } from "react";
import { CheckCircle2, Sparkles, Zap, X } from "lucide-react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { PaymentMethodSelector } from "@/components/payment-method-selector";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const plans = [
  {
    id: "basic" as const,
    name: "Basic",
    price: 9,
    priceDisplay: "$9",
    description: "Perfect for getting started",
    icon: Sparkles,
    features: [
      "Access to all basic courses",
      "ChatGPT-based Q&A",
      "Basic learning materials",
      "Email support",
    ],
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_BASIC_PRICE_ID,
  },
  {
    id: "pro" as const,
    name: "Pro",
    price: 19,
    priceDisplay: "$19",
    description: "Best for professional creators",
    icon: Zap,
    features: [
      "Everything in Basic",
      "Advanced AI assistance",
      "Premium course content",
      "Priority support",
      "Certificate of completion",
      "1-on-1 mentoring sessions",
    ],
    isPro: true,
    stripePriceId: process.env.NEXT_PUBLIC_STRIPE_PRO_PRICE_ID,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5
    }
  }
};

const PricingPage: React.FC = () => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [selectedPlan, setSelectedPlan] = useState<typeof plans[0] | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // URL 파라미터에서 결제 성공/실패 확인
  React.useEffect(() => {
    const payment = searchParams.get('payment');
    const canceled = searchParams.get('canceled');
    
    if (payment === 'success') {
      // 결제 성공 처리 (대시보드로 리다이렉트)
      router.push('/dashboard?payment=success');
    } else if (canceled) {
      // 결제 취소 처리
      router.push('/pricing');
    }
  }, [searchParams, router]);

  const handlePlanSelect = (plan: typeof plans[0]) => {
    if (status === 'loading') {
      return;
    }

    if (!session?.user) {
      router.push(`/login?redirect=/pricing&plan=${plan.id}`);
      return;
    }

    // 이미 구독 중인 경우 확인
    if (session.user.subscriptionStatus === 'active') {
      const confirmed = window.confirm(
        '이미 구독 중입니다. 새로운 플랜으로 변경하시겠습니까?'
      );
      if (!confirmed) {
        return;
      }
    }

    setSelectedPlan(plan);
    setIsDialogOpen(true);
  };

  const handlePaymentSuccess = () => {
    setIsDialogOpen(false);
    setSelectedPlan(null);
    router.push('/dashboard?payment=success');
  };

  const handlePaymentCancel = () => {
    setIsDialogOpen(false);
    setSelectedPlan(null);
  };

  return (
    <>
      <div className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div 
            className="mx-auto max-w-4xl text-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Simple, Transparent Pricing
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground max-w-2xl mx-auto">
              Choose the plan that works best for you. All plans include access to our platform and basic features.
            </p>
          </motion.div>
          <motion.div 
            className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {plans.map((plan) => {
              const Icon = plan.icon;
              return (
                <motion.div
                  key={plan.name}
                  variants={itemVariants}
                  className={`group relative flex flex-col justify-between rounded-3xl bg-background px-8 py-10 shadow-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 ${
                    plan.isPro 
                      ? "ring-2 ring-primary border-primary/20 lg:scale-105" 
                      : "ring-1 ring-border"
                  }`}
                >
                  {plan.isPro && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                      <span className="inline-flex items-center rounded-full bg-primary px-4 py-1 text-xs font-semibold text-primary-foreground shadow-lg">
                        Most Popular
                      </span>
                    </div>
                  )}
                  <div>
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                        plan.isPro ? "bg-primary/20" : "bg-muted"
                      }`}>
                        <Icon className={`h-6 w-6 ${plan.isPro ? "text-primary" : "text-muted-foreground"}`} />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold leading-8">
                          {plan.name}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm leading-6 text-muted-foreground mb-6">
                      {plan.description}
                    </p>
                    <p className="flex items-baseline gap-x-1 mb-8">
                      <span className="text-5xl font-bold">{plan.priceDisplay}</span>
                      <span className="text-base font-semibold leading-6 text-muted-foreground">/month</span>
                    </p>
                    <ul role="list" className="space-y-4 text-sm leading-6">
                      {plan.features.map((feature, index) => (
                        <li key={index} className="flex items-start gap-x-3">
                          <CheckCircle2
                            className="h-5 w-5 flex-none text-primary mt-0.5"
                            aria-hidden="true"
                          />
                          <span className="text-foreground">{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <button
                    onClick={() => handlePlanSelect(plan)}
                    className={`mt-8 w-full rounded-lg px-4 py-3 text-center text-base font-semibold leading-6 transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                      plan.isPro
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-primary shadow-md shadow-primary/25 hover:shadow-lg hover:shadow-primary/30 hover:scale-105"
                        : "bg-background text-foreground ring-2 ring-inset ring-border hover:ring-primary/50 hover:bg-accent hover:scale-105"
                    }`}
                  >
                    {status === 'loading' ? 'Loading...' : session?.user ? 'Subscribe Now' : 'Get Started'}
                  </button>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center justify-between">
              <span>결제하기</span>
              <Button
                variant="ghost"
                size="icon"
                onClick={handlePaymentCancel}
                className="h-6 w-6"
              >
                <X className="h-4 w-4" />
              </Button>
            </DialogTitle>
          </DialogHeader>
          {selectedPlan && (
            <PaymentMethodSelector
              planId={selectedPlan.id}
              planName={selectedPlan.name}
              price={selectedPlan.price}
              stripePriceId={selectedPlan.stripePriceId}
              onSuccess={handlePaymentSuccess}
              onCancel={handlePaymentCancel}
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}

export default PricingPage; 