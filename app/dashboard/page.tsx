'use client';

import React from "react";
import { useSession } from "next-auth/react";
import { Video, MessageSquare } from "lucide-react";
import Link from "next/link";

const DashboardPage: React.FC = () => {
  const { data: session } = useSession();
  const isPro = session?.user?.subscriptionStatus === 'active';

  const courses = [
    {
      id: 1,
      title: "Introduction to AI",
      description: "Learn the basics of Artificial Intelligence",
      videoUrl: "https://drive.google.com/file/d/1Gb1Gj8X74znXUebaG9oBoRXRjXosCDZu/preview",
    },
    // Add more courses as needed
  ];

  return (
    <div className="py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <h1 className="text-2xl font-semibold">Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}</h1>
        <p className="mt-1 text-muted-foreground">
          {isPro ? 'Pro Plan - Access to all features' : 'Basic Plan - Limited features'}
        </p>

        <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {courses.map((course) => (
            <div
              key={course.id}
              className="overflow-hidden rounded-lg bg-background shadow"
            >
              <div className="p-6">
                <div className="flex items-center">
                  <Video className="h-6 w-6 text-primary" />
                  <h3 className="ml-2 text-lg font-medium">{course.title}</h3>
                </div>
                <p className="mt-2 text-muted-foreground">{course.description}</p>
                <div className="mt-4">
                  <Link
                    href="/courses"
                    className="inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
                  >
                    Watch Course
                    <MessageSquare className="ml-2 h-4 w-4" />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {!isPro && (
          <div className="mt-8 rounded-lg bg-primary/5 p-6">
            <h2 className="text-lg font-medium">Upgrade to Pro</h2>
            <p className="mt-2 text-muted-foreground">
              Get access to DeepSeek and OpenAI GPT-4 for enhanced learning experience
            </p>
            <Link
              href="/pricing"
              className="mt-4 inline-flex items-center rounded-md bg-primary px-3 py-2 text-sm font-semibold text-primary-foreground shadow-sm hover:bg-primary/90"
            >
              Upgrade Now
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage; 