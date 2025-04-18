import prisma from '@/lib/prisma';
import { notFound } from 'next/navigation';
import { VideoPlayer } from '@/components/video-player';
import { ChatBot } from '@/components/chat-bot';
import { Button } from '@/components/ui/button';
import { Book } from 'lucide-react';

// Define the params type to match Next.js expected interface
type PageParams = {
  videoId: string;
};

interface PageProps {
  params: PageParams;
}

export default async function VideoPage({ 
  params 
}: PageProps) {
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

export async function generateMetadata({ 
  params 
}: PageProps) {
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