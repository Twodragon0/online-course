import React from "react";
import { CheckCircle2, Video, MessageSquare, Brain, Shield, Award } from "lucide-react";

const features = [
  {
    name: "AI-Powered Learning",
    description: "Basic plan includes Gemini and DeepSeek Basic, Pro plan includes DeepSeek and OpenAI GPT-4",
    icon: Brain,
  },
  {
    name: "Video Courses",
    description: "High-quality video content with interactive learning experience",
    icon: Video,
  },
  {
    name: "Real-time AI Chat",
    description: "Ask questions and get instant answers while watching videos",
    icon: MessageSquare,
  },
  {
    name: "Secure Platform",
    description: "Enterprise-grade security for your learning journey",
    icon: Shield,
  },
  {
    name: "Certification",
    description: "Earn certificates upon course completion",
    icon: Award,
  }
];

const FeaturesPage: React.FC = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-base font-semibold leading-7 text-primary">
            Everything you need
          </h2>
          <p className="mt-2 text-3xl font-bold tracking-tight sm:text-4xl">
            Advanced Learning Features
          </p>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            Our platform combines cutting-edge AI technology with comprehensive learning tools
            to provide you with the best educational experience.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.name} className="flex flex-col">
                <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                  <feature.icon className="h-5 w-5 flex-none text-primary" aria-hidden="true" />
                  {feature.name}
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                  <p className="flex-auto">{feature.description}</p>
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </div>
  );
}

export default FeaturesPage; 