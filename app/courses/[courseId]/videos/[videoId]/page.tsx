"use client";

import { useEffect, useState, Suspense } from 'react';
import { useParams } from 'next/navigation';
import { VideoPlayer } from '@/components/video-player';
import { ChatBot } from '@/components/chat-bot';
import { Skeleton } from '@/components/ui/skeleton';

// 비디오 로딩을 위한 로딩 컴포넌트
function VideoSkeleton() {
  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-4">
        <Skeleton className="h-8 w-2/3" />
        <Skeleton className="h-4 w-1/2" />
      </div>
      <Skeleton className="aspect-video w-full" />
    </div>
  );
}

// 비디오 컴포넌트 - 클라이언트 사이드에서 데이터 로딩
function VideoContent() {
  const params = useParams();
  const [video, setVideo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const videoId = params?.videoId as string;
  const courseId = params?.courseId as string;

  useEffect(() => {
    async function loadVideo() {
      if (!videoId) return;
      
      try {
        // 서버 API 엔드포인트로부터 비디오 데이터를 가져옵니다
        const response = await fetch(`/api/videos/${videoId}`);
        if (!response.ok) {
          throw new Error('Failed to load video');
        }
        const data = await response.json();
        setVideo(data);
      } catch (error) {
        console.error('Error loading video:', error);
      } finally {
        setLoading(false);
      }
    }

    loadVideo();
  }, [videoId]);

  if (loading) {
    return <VideoSkeleton />;
  }

  if (!video) {
    return (
      <div className="container mx-auto p-4">
        <h1 className="text-2xl font-bold text-red-500">Video not found</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-6">
      <div className="flex flex-col space-y-4">
        <h1 className="text-2xl font-bold">{video.title}</h1>
        {video.description && (
          <p className="text-gray-600 dark:text-gray-300">
            {video.description}
          </p>
        )}
      </div>
      
      <div className="aspect-video relative rounded-lg overflow-hidden">
        <VideoPlayer url={video.url} />
      </div>

      <div className="fixed bottom-4 right-4">
        <ChatBot videoId={video.id} />
      </div>
    </div>
  );
}

// 메인 페이지 컴포넌트
export default function VideoPage() {
  return (
    <Suspense fallback={<VideoSkeleton />}>
      <VideoContent />
    </Suspense>
  );
}