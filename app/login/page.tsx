 "use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { motion } from "framer-motion";
import { LogIn, Shield } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 sm:px-6 lg:px-8">
      <motion.div 
        className="mx-auto w-full max-w-md"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="p-8 shadow-lg">
          <div className="space-y-6">
            <div className="text-center space-y-3">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">로그인</h1>
              <p className="text-muted-foreground">
                소셜 계정으로 안전하게 로그인하세요
              </p>
            </div>
            <Button
              className="w-full h-12 text-base font-semibold shadow-md hover:shadow-lg transition-all hover:scale-[1.02]"
              onClick={() => signIn("google", { callbackUrl: "/" })}
            >
              <LogIn className="mr-2 h-5 w-5" />
              Google로 로그인
            </Button>
            <p className="text-xs text-center text-muted-foreground">
              로그인 시 이용약관 및 개인정보처리방침에 동의하게 됩니다
            </p>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}