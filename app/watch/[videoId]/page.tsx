import { notFound } from 'next/navigation';
import { VideoPlayer } from '@/components/video-player';
import { ChatBot } from '@/components/chat-bot';
import { Button } from '@/components/ui/button';
import { Book } from 'lucide-react';
import { prisma } from '@/lib/prisma';

interface PageProps {
  params: {
    videoId: string;
  };
}

export default async function VideoPage({ params }: PageProps) {
  // DATABASE_URL 검증
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql+pooler://'))) {
    console.error('[Video Page] DATABASE_URL is not configured or invalid');
    notFound();
  }

  let video;
  try {
    video = await prisma.video.findUnique({
      where: {
        id: params.videoId,
      },
      include: {
        course: true,
      },
    });
  } catch (error) {
    console.error('[Video Page] Failed to fetch video:', error);
    notFound();
  }

  if (!video) {
    notFound();
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <div className="max-w-5xl mx-auto">
        <div className="space-y-4">
          <h1 className="text-2xl font-bold">{video.title}</h1>
          {video.description && (
            <p className="text-muted-foreground">
              {video.description}
            </p>
          )}
        </div>
        
        <div className="mt-6">
          <VideoPlayer url={video.url} />
        </div>

        <div className="fixed bottom-4 right-4 z-50">
          <ChatBot videoId={video.id} isEmbedded={false} />
        </div>
      </div>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  // DATABASE_URL 검증
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl || (!dbUrl.startsWith('postgresql://') && !dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql+pooler://'))) {
    return {
      title: 'Video Not Found',
    };
  }

  let video;
  try {
    video = await prisma.video.findUnique({
      where: {
        id: params.videoId,
      },
      include: {
        course: true,
      },
    });
  } catch (error) {
    console.error('[Video Metadata] Failed to fetch video:', error);
    return {
      title: 'Video Not Found',
    };
  }

  if (!video) {
    return {
      title: 'Video Not Found',
    };
  }

  return {
    title: video.title,
    description: video.description,
  };
} 