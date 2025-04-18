'use client';

import React from "react";
import { signIn } from "next-auth/react";
import { useSearchParams } from "next/navigation";

const RegisterPage: React.FC = () => {
  const searchParams = useSearchParams();
  const plan = searchParams?.get('plan');

  return (
    <div className="flex min-h-[calc(100vh-73px)] flex-col items-center justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight">
          Create your account
        </h2>
        <p className="mt-2 text-center text-sm text-muted-foreground">
          {plan === 'pro' ? 'Pro Plan Selected' : 'Basic Plan Selected'}
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-background px-4 py-8 shadow sm:rounded-lg sm:px-10">
          <button
            onClick={() => signIn('google', { callbackUrl: '/dashboard' })}
            className="flex w-full justify-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          >
            Continue with Google
          </button>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage; 