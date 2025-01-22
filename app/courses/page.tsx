'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Pagination } from '@/components/pagination';
import { VideoCard } from '@/components/video-card';

const ITEMS_PER_PAGE = 2;

interface Video {
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
}

export default function CoursesPage() {
  const searchParams = useSearchParams();
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  const currentPage = Number(searchParams.get('page')) || 1;
  const totalPages = Math.ceil(videos.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedVideos = videos.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  const sections: Section[] = [
    {
      id: 'devsecops',
      title: '🛡️ DevSecOps 과정',
      description: '클라우드 보안과 DevSecOps 기초 학습',
      videos: paginatedVideos.filter(video => video.courseId === 'devsecops-course'),
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

  useEffect(() => {
    const fetchVideos = async () => {
      try {
        const response = await fetch('/api/videos');
        const data = await response.json();
        setVideos(data);
      } catch (error) {
        console.error('Failed to fetch videos:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchVideos();
  }, []);

  if (loading) {
    return (
      <div className="container mx-auto py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-8 mt-8">
              {[1, 2].map((i) => (
                <div key={i} className="border rounded-lg p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-24 px-4">
      <div className="max-w-4xl mx-auto space-y-12">
        {sections.map((section) => (
          <section key={section.id} className="space-y-6">
            <div className="space-y-2">
              <h2 className="text-2xl font-bold">{section.title}</h2>
              <p className="text-muted-foreground">{section.description}</p>
            </div>

            <div className="grid gap-6">
              {section.videos.map((video) => (
                <VideoCard
                  key={video.id}
                  id={video.id}
                  title={video.title}
                  description={video.description}
                />
              ))}
            </div>
          </section>
        ))}

        {videos.length > ITEMS_PER_PAGE && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
          />
        )}
      </div>
    </div>
  );
} 