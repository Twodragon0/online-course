'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Pagination } from '@/components/pagination';
import { VideoCard } from '@/components/video-card';
import { useSession } from "next-auth/react";

const ITEMS_PER_PAGE = 2;

interface Video {
  driveFileId: string;
  id: string;
  title: string;
  description: string | null;
  url: string;
  courseId: string;
  position: number;
  course: {
    id: string;
    title: string;
  };
}

interface Section {
  id: string;
  title: string;
  description: string;
  videos: Video[];
  driveFileIds?: {
    [key: string]: string;
  };
}

export default function CoursesPage() {
  const { data: session } = useSession();
  const searchParams = useSearchParams();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        const data = await response.json();
        // 배열 확인 및 타입 검증
        setVideos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
        setVideos([]); // 오류 시 빈 배열로 초기화
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  // 페이지네이션 로직 안전하게 처리
  const currentPage = Number(searchParams?.get('page') ?? '1');
  const totalPages = Math.ceil((videos?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  // 옵셔널 체이닝으로 안전하게 처리
  const paginatedVideos = videos?.slice?.(startIndex, startIndex + ITEMS_PER_PAGE) || [];

  const sections = [
    {
      id: 'devsecops',
      title: '🛡️ DevSecOps 과정',
      description: '클라우드 보안과 DevSecOps 기초 학습',
      driveFileIds: {
        'intro': '1er3p4BdWsYmeLUuhMshS10EImWYvWWcU'
      }
    },
    {
      id: 'aws',
      title: '☁️ AWS 보안 실습',
      description: 'AWS 클라우드 환경의 보안 설정 실습',
      videos: paginatedVideos.filter(video => video.courseId === 'aws-course'),
    },
    {
      id: 'docker',
      title: '🐳 Docker 실습',
      description: 'Docker를 활용한 컨테이너 보안 실습',
      videos: paginatedVideos.filter(video => video.courseId === 'docker-course'),
    },
  ];

  if (loading) {
    return (
      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded-lg w-1/3"></div>
              <div className="h-6 bg-muted rounded-lg w-1/4"></div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-xl p-6 space-y-4">
                  <div className="aspect-video bg-muted rounded-lg"></div>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-16">
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl font-bold tracking-tight">
            Our Courses
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Master DevSecOps and cloud security with our comprehensive course collection
          </p>
        </div>

        {sections.map((section) => (
          <section key={section.id} className="space-y-8">
            <div className="space-y-3">
              <h2 className="text-3xl font-bold">{section.title}</h2>
              <p className="text-muted-foreground text-lg">{section.description}</p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {section.videos && section.videos.map((video) => (
                <VideoCard
                  key={video.id}
                  id={video.id}
                  title={video.title}
                  description={video.description}
                  driveFileId={video.driveFileId}
                />
              ))}
              {section.driveFileIds && Object.entries(section.driveFileIds).map(([key, fileId]) => (
                <VideoCard
                  key={key}
                  id={key}
                  title={`${section.title} - ${key}`}
                  description={section.description}
                  driveFileId={fileId}
                />
              ))}
            </div>
          </section>
        ))}

        {videos.length > ITEMS_PER_PAGE && (
          <div className="flex justify-center pt-8">
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
            />
          </div>
        )}
      </div>
    </div>
  );
}