'use client';

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";

interface VideoCardProps {
  id: string;
  title: string;
  description: string | null;
  driveFileId: string | null;
}

export function VideoCard({ id, title, description, driveFileId }: VideoCardProps) {
  const { data: session, status } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [embedError, setEmbedError] = useState(false);

  // Return early if no driveFileId
  if (!driveFileId) {
    return (
      <div className="rounded-lg border p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
          <p className="text-red-500">비디오 파일을 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  // Google Drive 파일 ID로부터 임베드 URL 생성 (더 안정적인 방식)
  // 영상 보기 가능하도록 공유 링크 형식으로 수정
  const embedUrl = `https://drive.google.com/file/d/${driveFileId}/preview`;
  
  // 로딩 상태 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);
    
    return () => clearTimeout(timer);
  }, []);

  // 임베드 에러 처리
  const handleIframeError = () => {
    setEmbedError(true);
    setIsLoading(false);
  };

  // Check if user is authenticated - use status instead of checking session directly
  if (status === 'unauthenticated') {
    return (
      <div className="rounded-lg border p-6">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground mt-2">로그인이 필요합니다</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="aspect-video relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        )}
        
        {embedError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted rounded-lg p-4">
            <p className="text-red-500 text-center font-medium">영상을 로드할 수 없습니다</p>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Google Drive에서 직접 보기: 
              <a 
                href={`https://drive.google.com/file/d/${driveFileId}/view`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary ml-1 hover:underline"
              >
                영상 링크
              </a>
            </p>
          </div>
        ) : (
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full rounded-lg"
            frameBorder="0"
            allow="autoplay; encrypted-media; picture-in-picture"
            allowFullScreen
            onError={handleIframeError}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold">{title}</h3>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      
      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <a href={`/watch/${id}/summary`}>요약 보기</a>
        </Button>
        <Button variant="outline" asChild>
          <a href={`https://drive.google.com/file/d/${driveFileId}/view`} target="_blank" rel="noopener noreferrer">
            Google Drive에서 보기
          </a>
        </Button>
      </div>
    </div>
  );
}