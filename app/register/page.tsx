'use client';

import React from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { UserPlus, Sparkles, Zap, CheckCircle2 } from "lucide-react";

const RegisterPage: React.FC = () => {
  const searchParams = useSearchParams();
  const plan = searchParams?.get('plan');
  const isPro = plan === 'pro';

  const planFeatures = isPro 
    ? [
        "Advanced AI assistance",
        "Premium course content",
        "Priority support",
        "Certificate of completion",
        "1-on-1 mentoring sessions",
      ]
    : [
        "Access to all basic courses",
        "ChatGPT-based Q&A",
        "Basic learning materials",
        "Email support",
      ];

  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-8 shadow-lg">
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                isPro ? "bg-primary/20" : "bg-muted"
              }`}>
                {isPro ? (
                  <Zap className="h-8 w-8 text-primary" />
                ) : (
                  <Sparkles className="h-8 w-8 text-muted-foreground" />
                )}
              </div>
              <h2 className="text-3xl font-bold tracking-tight">
                Create your account
              </h2>
              <div className="inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-sm font-medium">
                {isPro ? (
                  <>
                    <Zap className="h-4 w-4 text-primary" />
                    <span className="text-primary font-semibold">Pro Plan Selected</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 text-muted-foreground" />
                    <span>Basic Plan Selected</span>
                  </>
                )}
              </div>
            </div>

            {planFeatures.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-semibold text-foreground">Plan includes:</p>
                <ul className="space-y-2">
                  {planFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                      <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <Button
              className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
              onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            >
              <UserPlus className="mr-2 h-5 w-5" />
              Continue with Google
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              계정 생성 시 이용약관 및 개인정보처리방침에 동의하게 됩니다
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default RegisterPage; 