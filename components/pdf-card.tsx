'use client';

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { useState, useEffect } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ExternalLink } from "lucide-react";

interface PdfCardProps {
  id: string;
  title: string;
  description: string | null;
  driveFileId: string | null;
}

export function PdfCard({ id, title, description, driveFileId }: PdfCardProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [embedError, setEmbedError] = useState(false);

  // Return early if no driveFileId
  if (!driveFileId) {
    return (
      <div className="rounded-lg border p-6 space-y-4">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold flex items-center">
            <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
            {title}
          </h3>
          {description && (
            <p className="text-muted-foreground">{description}</p>
          )}
          <p className="text-red-500">PDF 파일을 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }

  // Google Drive 파일 ID로부터 임베드 URL 생성
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

  if (!session) {
    return (
      <div className="rounded-lg border p-6">
        <h3 className="text-xl font-semibold flex items-center">
          <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
          {title}
        </h3>
        <p className="text-muted-foreground mt-2">로그인이 필요합니다</p>
      </div>
    );
  }

  return (
    <div className="rounded-lg border p-6 space-y-4">
      <div className="aspect-[4/3] relative">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-muted rounded-lg">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        )}
        
        {embedError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted rounded-lg p-4">
            <p className="text-red-500 text-center font-medium">PDF를 로드할 수 없습니다</p>
            <p className="text-sm text-muted-foreground text-center mt-2">
              Google Drive에서 직접 보기: 
              <a 
                href={`https://drive.google.com/file/d/${driveFileId}/view`} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary ml-1 hover:underline"
              >
                PDF 링크
              </a>
            </p>
          </div>
        ) : (
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full rounded-lg"
            frameBorder="0"
            allowFullScreen
            onError={handleIframeError}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold flex items-center">
          <FileText className="mr-2 h-5 w-5 text-muted-foreground" />
          {title}
        </h3>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
      
      <div className="flex gap-4">
        <Button variant="outline" asChild>
          <a 
            href={`https://drive.google.com/file/d/${driveFileId}/view`} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center"
          >
            <ExternalLink className="mr-2 h-4 w-4" />
            Google Drive에서 보기
          </a>
        </Button>
      </div>
    </div>
  );
} 