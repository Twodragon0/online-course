import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import { VideoPlayer } from '@/components/video-player';
import { ChatBot } from '@/components/chat-bot';

const prisma = new PrismaClient();

interface PageProps {
  params: {
    courseId: string;
    videoId: string;
  };
}

export default async function VideoPage({ params }: PageProps) {
  const video = await prisma.video.findUnique({
    where: {
      id: params.videoId,
    },
    include: {
      course: true,
    },
  });

  if (!video) {
    notFound();
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

export async function generateMetadata({ params }: PageProps) {
  const video = await prisma.video.findUnique({
    where: {
      id: params.videoId,
    },
    include: {
      course: true,
    },
  });

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