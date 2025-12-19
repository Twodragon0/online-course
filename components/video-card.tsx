'use client';

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";

interface VideoCardProps {
  id: string;
  title: string;
  description: string | null;
  driveFileId: string;
}

export function VideoCard({ id, title, description, driveFileId }: VideoCardProps) {
  const { data: session } = useSession();

  // Google Drive 파일 ID로부터 임베드 URL 생성
  const embedUrl = `https://drive.google.com/file/d/${driveFileId}/preview`;

  if (!session) {
    return (
      <div className="group relative rounded-xl border bg-card p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
        <div className="aspect-video relative bg-muted rounded-lg mb-4 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <svg className="w-8 h-8 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm text-muted-foreground">로그인 필요</p>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold line-clamp-2">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative rounded-xl border bg-card p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
      <div className="aspect-video relative rounded-lg overflow-hidden mb-4 bg-muted">
        <iframe
          src={embedUrl}
          className="absolute inset-0 w-full h-full"
          allow="autoplay"
          allowFullScreen
        />
      </div>
      <div className="space-y-3">
        <h3 className="text-xl font-semibold line-clamp-2 group-hover:text-primary transition-colors">{title}</h3>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
      </div>
      <div className="flex flex-col sm:flex-row gap-3 mt-4">
        <Button asChild className="flex-1">
          <a href={`/watch/${id}`}>전체화면으로 보기</a>
        </Button>
        <Button variant="outline" asChild className="flex-1">
          <a href={`/watch/${id}/summary`}>요약 보기</a>
        </Button>
      </div>
    </div>
  );
}