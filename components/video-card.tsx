'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { Play, ExternalLink } from "lucide-react";
import { getDriveFileLink } from '@/lib/google-drive-client';

interface VideoCardProps {
  id: string;
  title: string;
  description: string | null;
  driveFileId: string;
}

export function VideoCard({ id, title, description, driveFileId }: VideoCardProps) {
  const { data: session } = useSession();
  const [iframeError, setIframeError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Google Drive 파일 ID로부터 임베드 URL 생성
  const embedUrl = getDriveFileLink(driveFileId, 'preview');
  const viewUrl = getDriveFileLink(driveFileId, 'view');

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
        {iframeError ? (
          // iframe 로드 실패 시 대체 UI
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-primary/10 to-primary/5 p-6">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center mx-auto">
                <Play className="w-10 h-10 text-primary ml-1" />
              </div>
              <div className="space-y-2">
                <p className="text-sm font-medium">동영상을 재생할 수 없습니다</p>
                <p className="text-xs text-muted-foreground">
                  Google Drive에서 직접 확인해주세요
                </p>
              </div>
              <Button
                asChild
                variant="outline"
                size="sm"
                className="mt-2"
              >
                <a
                  href={viewUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  Google Drive에서 보기
                </a>
              </Button>
            </div>
          </div>
        ) : (
          <>
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-muted">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
              </div>
            )}
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIframeError(true);
                setIsLoading(false);
              }}
              style={{ display: isLoading ? 'none' : 'block' }}
            />
          </>
        )}
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