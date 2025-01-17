import React from "react";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";

const plans = [
  {
    name: "Basic",
    price: "$9",
    description: "Perfect for getting started",
    features: [
      "Access to all basic courses",
      "ChatGPT-based Q&A",
      "Basic learning materials",
      "Email support",
    ],
  },
  {
    name: "Pro",
    price: "$19",
    description: "Best for professional creators",
    features: [
      "Everything in Basic",
      "Advanced AI assistance",
      "Premium course content",
      "Priority support",
      "Certificate of completion",
      "1-on-1 mentoring sessions",
    ],
    isPro: true,
  },
];

const PricingPage: React.FC = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Simple, Transparent Pricing
          </h1>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Choose the plan that works best for you. All plans include access to our platform and basic features.
          </p>
        </div>
        <div className="mx-auto mt-16 grid max-w-5xl grid-cols-1 gap-8 lg:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col justify-between rounded-3xl bg-background px-8 py-10 ring-1 ring-gray-200 ${
                plan.isPro ? "ring-2 ring-primary" : ""
              }`}
            >
              <div>
                <h3 className="text-lg font-semibold leading-8">
                  {plan.name}
                </h3>
                <p className="mt-4 text-sm leading-6 text-muted-foreground">
                  {plan.description}
                </p>
                <p className="mt-6 flex items-baseline gap-x-1">
                  <span className="text-4xl font-bold">{plan.price}</span>
                  <span className="text-sm font-semibold leading-6 text-muted-foreground">/month</span>
                </p>
                <ul role="list" className="mt-8 space-y-3 text-sm leading-6">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex gap-x-3">
                      <CheckCircle2
                        className="h-6 w-5 flex-none text-primary"
                        aria-hidden="true"
                      />
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
              <Link
                href={plan.isPro ? "/register?plan=pro" : "/register?plan=basic"}
                className={`mt-8 block rounded-md px-3 py-2 text-center text-sm font-semibold leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  plan.isPro
                    ? "bg-primary text-primary-foreground hover:bg-primary/90 focus-visible:outline-primary"
                    : "bg-background text-foreground ring-1 ring-inset ring-gray-200 hover:ring-gray-300"
                }`}
              >
                Get Started
              </Link>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PricingPage; 