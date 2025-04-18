'use client';

import Link from "next/link";
import { ArrowRight, CheckCircle2, PlayCircle, AlertCircle, ExternalLink, FileText } from "lucide-react";
import { VideoCard } from "@/components/video-card";
import { PdfCard } from "@/components/pdf-card";
import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";

const features = [
  "AI-powered learning assistance",
  "HD video content",
  "Interactive exercises",
  "Expert instructors",
  "Certificate of completion",
  "24/7 support",
];

// 콘텐츠 타입 정의
interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  driveFileId: string | null;
  course: {
    id: string;
    title: string;
  };
  courseId?: string;
  position: number;
  isFolder: boolean;
  folderUrl: string | null;
  type?: 'video' | 'pdf' | 'folder';
}

export default function Home() {
  const { data: session, status } = useSession();
  const [isClient, setIsClient] = useState(false);
  const [content, setContent] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (session) {
      fetch('/api/videos')
        .then(response => response.json())
        .then(data => {
          setContent(data);
          setLoading(false);
        })
        .catch(error => {
          console.error('Error fetching content:', error);
          setLoading(false);
        });
    }
  }, [session]);

  // 코스별로 콘텐츠 그룹화
  const otItems = content.filter(
    item => item.course.id === 'ot-course' && !item.isFolder && item.type === 'video'
  );
  
  const week1Items = content.filter(
    item => item.course.id === 'week1-course' && !item.isFolder && item.type === 'video'
  );
  
  const pdfItems = content.filter(
    item => item.type === 'pdf' && !item.isFolder
  );

  // 각 코스별 폴더 URL 찾기
  const otFolder = content.find(item => item.course.id === 'ot-course' && item.isFolder)?.folderUrl || null;
  const week1Folder = content.find(item => item.course.id === 'week1-course' && item.isFolder)?.folderUrl || null;
  const pdfFolder = content.find(item => item.course.id === 'cloud-security-course' && item.isFolder)?.folderUrl || null;

  // 콘텐츠 아이템 렌더링 함수
  const renderContentItem = (item: ContentItem) => {
    if (item.type === 'pdf') {
      return (
        <PdfCard
          key={item.id}
          id={item.id}
          title={item.title}
          description={item.description}
          driveFileId={item.driveFileId}
        />
      );
    } else {
      return (
        <VideoCard
          key={item.id}
          id={item.id}
          title={item.title}
          description={item.description}
          driveFileId={item.driveFileId}
        />
      );
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col lg:flex-row items-center justify-between max-w-6xl mx-auto px-4 py-12 gap-8">
        <div className="flex-1 space-y-6">
          <div className="inline-flex items-center rounded-full border px-4 py-1.5 text-sm font-medium">
            <span className="text-primary">New Feature</span>
            <span className="mx-2">|</span>
            <span>AI Chat Support</span>
          </div>
          <h1 className="text-4xl lg:text-6xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
            Transform Your Business with Online Courses
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Create and share professional courses with your audience. Engage with AI-powered learning tools and grow your business.
          </p>
          <div className="flex flex-col sm:flex-row gap-4">
            <Link 
              href="/courses" 
              className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
            >
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            <Link 
              href="/pricing"
              className="inline-flex items-center justify-center rounded-lg border border-input bg-background px-8 py-3 text-sm font-medium shadow-sm transition-colors hover:bg-accent hover:text-accent-foreground"
            >
              View Pricing
            </Link>
          </div>
        </div>
        <div className="flex-1 relative w-full max-w-xl aspect-video bg-gradient-to-br from-primary/20 via-primary/10 to-background rounded-lg shadow-lg flex items-center justify-center p-8">
          <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(white,transparent_70%)] rounded-lg" />
          <div className="relative text-2xl font-semibold text-foreground/80">
            Interactive Demo
          </div>
        </div>
      </section>

      {/* Featured Courses Section */}
      {isClient && (
        <section className="border-t bg-muted/30">
          <div className="max-w-6xl mx-auto px-4 py-16">
            <div className="text-center space-y-4 mb-12">
              <h2 className="text-3xl font-bold">최신 강의</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                DevSecOps 및 클라우드 보안 학습을 위한 최신 강의를 확인하세요.
              </p>
            </div>
            
            {status === "loading" || loading ? (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-2">
                {[1, 2, 3, 4].map((_, i) => (
                  <Card key={i}>
                    <CardHeader>
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2 mt-2" />
                    </CardHeader>
                    <CardContent>
                      <Skeleton className="h-40 w-full rounded-md" />
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : !session ? (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>로그인이 필요합니다</AlertTitle>
                <AlertDescription>
                  강의 콘텐츠를 보려면 먼저 로그인을 해주세요.
                </AlertDescription>
                <div className="mt-4">
                  <Button asChild>
                    <Link href="/auth/signin">로그인 하기</Link>
                  </Button>
                </div>
              </Alert>
            ) : (
              <Tabs defaultValue="ot" className="w-full">
                <TabsList className="grid w-full grid-cols-4 mb-8">
                  <TabsTrigger value="ot">OT 주차</TabsTrigger>
                  <TabsTrigger value="week1">1주차</TabsTrigger>
                  <TabsTrigger value="pdf">보안 가이드</TabsTrigger>
                  <TabsTrigger value="more">더보기</TabsTrigger>
                </TabsList>

                {/* OT 주차 비디오 */}
                <TabsContent value="ot" className="space-y-6">
                  <Alert className="bg-blue-50">
                    <AlertTitle className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      강의 자료 다운로드
                    </AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                      <span>OT 주차 전체 강의 자료는 Google Drive 폴더에서도 확인할 수 있습니다.</span>
                      <Button variant="outline" size="sm" asChild className="ml-4">
                        <a 
                          href={otFolder || ''} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          폴더 열기
                        </a>
                      </Button>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {otItems.map((item) => renderContentItem(item))}
                  </div>
                </TabsContent>

                {/* 1주차 비디오 */}
                <TabsContent value="week1" className="space-y-6">
                  <Alert className="bg-blue-50">
                    <AlertTitle className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      강의 자료 다운로드
                    </AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                      <span>1주차 전체 강의 자료는 Google Drive 폴더에서도 확인할 수 있습니다.</span>
                      <Button variant="outline" size="sm" asChild className="ml-4">
                        <a 
                          href={week1Folder || ''} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          폴더 열기
                        </a>
                      </Button>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {week1Items.map((item) => renderContentItem(item))}
                  </div>
                </TabsContent>

                {/* PDF 문서 탭 */}
                <TabsContent value="pdf" className="space-y-6">
                  <Alert className="bg-blue-50">
                    <AlertTitle className="flex items-center">
                      <FileText className="h-4 w-4 mr-2" />
                      클라우드 보안 가이드 문서
                    </AlertTitle>
                    <AlertDescription className="flex items-center justify-between">
                      <span>클라우드 보안 가이드 문서는 Google Drive 폴더에서도 확인할 수 있습니다.</span>
                      <Button variant="outline" size="sm" asChild className="ml-4">
                        <a 
                          href={pdfFolder || ''} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="flex items-center gap-2"
                        >
                          <ExternalLink className="h-4 w-4" />
                          폴더 열기
                        </a>
                      </Button>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
                    {pdfItems.map((item) => renderContentItem(item))}
                  </div>
                </TabsContent>

                {/* 더보기 탭 */}
                <TabsContent value="more" className="space-y-6">
                  <Alert>
                    <AlertTitle>더 많은 콘텐츠</AlertTitle>
                    <AlertDescription>
                      모든 강의 콘텐츠를 보려면 강의 자료 페이지로 이동하세요.
                    </AlertDescription>
                    <div className="mt-4">
                      <Button asChild>
                        <Link href="/courses">강의 자료 보기</Link>
                      </Button>
                    </div>
                  </Alert>
                </TabsContent>
              </Tabs>
            )}
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="border-t bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center space-y-4 mb-12">
            <h2 className="text-3xl font-bold">Everything You Need</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Our platform provides all the tools and features you need to create, manage, and grow your online courses.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => (
              <div key={i} className="flex items-center gap-2 p-4 rounded-lg bg-background shadow-sm">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                <span>{feature}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-t">
        <div className="max-w-6xl mx-auto px-4 py-16 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join thousands of instructors who are already using our platform to reach students worldwide.
          </p>
          <Link 
            href="/register"
            className="inline-flex items-center justify-center rounded-lg bg-primary px-8 py-3 text-sm font-medium text-primary-foreground shadow transition-colors hover:bg-primary/90"
          >
            Create Your Course
            <ArrowRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
