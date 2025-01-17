 "use client";

import { signIn } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold">로그인</h1>
          <p className="text-gray-500 dark:text-gray-400">
            소셜 계정으로 로그인하세요
          </p>
        </div>
        <Button
          className="w-full"
          onClick={() => signIn("google", { callbackUrl: "/" })}
        >
          Google로 로그인
        </Button>
      </div>
    </div>
  );
}