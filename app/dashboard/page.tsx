'use client';

import React, { useEffect } from "react";
import { useSession } from "next-auth/react";
import { useSearchParams, useRouter } from "next/navigation";
import { Video, MessageSquare, Zap, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { toast } from "sonner";

const DashboardPage: React.FC = () => {
  const { data: session, update } = useSession();
  const searchParams = useSearchParams();
  const router = useRouter();
  const isPro = session?.user?.subscriptionStatus === 'active';

  // 결제 성공 알림 처리
  useEffect(() => {
    const payment = searchParams.get('payment');
    const plan = searchParams.get('plan');
    
    if (payment === 'success') {
      const planName = plan === 'pro' ? 'Pro' : 'Basic';
      toast.success(
        `결제가 완료되었습니다! ${planName} 플랜이 활성화되었습니다.`,
        {
          duration: 5000,
          icon: <CheckCircle2 className="h-5 w-5 text-green-500" />,
        }
      );
      
      // URL에서 파라미터 제거
      router.replace('/dashboard', { scroll: false });
      
      // 세션 갱신
      update();
    }
  }, [searchParams, router, update]);

  // 세션 갱신 (구독 상태 변경 확인)
  useEffect(() => {
    const checkAndUpdateSession = async () => {
      if (session?.user?.email) {
        try {
          // 구독 상태 확인
          const response = await fetch('/api/subscription');
          if (response.ok) {
            const data = await response.json();
            const dbSubscriptionStatus = data.subscriptionStatus;
            
            // 데이터베이스의 구독 상태와 세션의 구독 상태가 다르면 세션 갱신
            if (dbSubscriptionStatus !== session.user.subscriptionStatus) {
              await update();
            }
          }
        } catch (error) {
          console.error('Failed to check subscription status:', error);
        }
      }
    };

    // 컴포넌트 마운트 시 한 번 확인
    checkAndUpdateSession();
    
    // 5초마다 확인 (선택사항)
    const interval = setInterval(checkAndUpdateSession, 5000);
    
    return () => clearInterval(interval);
  }, [session, update]);

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
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-2 mb-8"
        >
          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Welcome back{session?.user?.name ? `, ${session.user.name}` : ''}
          </h1>
          <div className="flex items-center gap-2">
            {isPro ? (
              <>
                <Zap className="h-5 w-5 text-primary" />
                <p className="text-muted-foreground">
                  Pro Plan - Access to all features
                </p>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5 text-muted-foreground" />
                <p className="text-muted-foreground">
                  Basic Plan - Limited features
                </p>
              </>
            )}
          </div>
        </motion.div>

        {courses.length > 0 ? (
          <motion.div 
            className="grid gap-6 md:grid-cols-2 lg:grid-cols-3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            {courses.map((course) => (
              <Card
                key={course.id}
                className="group overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
              >
                <div className="p-6 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                      <Video className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold group-hover:text-primary transition-colors">
                      {course.title}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {course.description}
                  </p>
                  <Button asChild className="w-full">
                    <Link href="/courses">
                      Watch Course
                      <MessageSquare className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </Card>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="p-12 text-center">
              <Video className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">No courses yet</h3>
              <p className="text-muted-foreground mb-6">
                Start learning by browsing our course catalog
              </p>
              <Button asChild>
                <Link href="/courses">
                  Browse Courses
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </Card>
          </motion.div>
        )}

        {!isPro && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="mt-8"
          >
            <Card className="bg-gradient-to-br from-primary/10 via-primary/5 to-background border-primary/20 p-6 sm:p-8">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-primary/20 flex items-center justify-center flex-shrink-0">
                  <Zap className="h-6 w-6 text-primary" />
                </div>
                <div className="flex-1 space-y-3">
                  <div>
                    <h2 className="text-xl font-semibold">Upgrade to Pro</h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Get access to DeepSeek and OpenAI GPT-4 for enhanced learning experience
                    </p>
                  </div>
                  <Button asChild className="shadow-md hover:shadow-lg transition-all hover:scale-105">
                    <Link href="/pricing">
                      Upgrade Now
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </div>
    </div>
  );
}

export default DashboardPage; 