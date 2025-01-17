import React from "react";
import { Rocket, Users, Target } from "lucide-react";

const AboutPage: React.FC = () => {
  return (
    <div className="py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:text-center">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            About Our Platform
          </h2>
          <p className="mt-6 text-lg leading-8 text-muted-foreground">
            We are dedicated to revolutionizing online education by combining
            cutting-edge AI technology with high-quality learning content.
          </p>
        </div>
        <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
          <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Rocket className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Our Mission
              </dt>
              <dd className="mt-2 text-base leading-7 text-muted-foreground">
                To provide accessible, high-quality education enhanced by the latest AI technology,
                making learning more interactive and personalized than ever before.
              </dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Users className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Our Community
              </dt>
              <dd className="mt-2 text-base leading-7 text-muted-foreground">
                Join a growing community of learners and educators who are passionate
                about embracing AI-powered education for better learning outcomes.
              </dd>
            </div>
            <div className="relative pl-16">
              <dt className="text-base font-semibold leading-7">
                <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-primary">
                  <Target className="h-6 w-6 text-white" aria-hidden="true" />
                </div>
                Our Vision
              </dt>
              <dd className="mt-2 text-base leading-7 text-muted-foreground">
                To become the leading platform where AI and education intersect,
                creating a new standard for online learning experiences.
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}

export default AboutPage; 