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
    <div className="container mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="space-y-4 pb-6 border-b border-border">
          {video.course && (
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
              <Book className="h-4 w-4" />
              {video.course.title}
            </div>
          )}
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground leading-tight">
            {video.title}
          </h1>
          {video.description && (
            <p className="text-lg text-muted-foreground leading-relaxed max-w-3xl">
              {video.description}
            </p>
          )}
        </div>
        
        {/* Video Player Section */}
        <div className="relative">
          <VideoPlayer url={video.url} title={video.title} />
        </div>

        {/* Chat Bot */}
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