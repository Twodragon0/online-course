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
  driveFileId?: string | null;
  blobUrl?: string | null; // Vercel Blob Storage URL
}

export function PdfCard({ id, title, description, driveFileId, blobUrl }: PdfCardProps) {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(true);
  const [embedError, setEmbedError] = useState(false);

  // Blob URL 또는 Google Drive URL 결정
  const isBlobUrl = !!blobUrl;
  const pdfUrl = isBlobUrl ? blobUrl : (driveFileId ? `https://drive.google.com/file/d/${driveFileId}/preview` : null);
  const directUrl = isBlobUrl ? blobUrl : (driveFileId ? `https://drive.google.com/file/d/${driveFileId}/view` : null);

  // Return early if no file URL
  if (!pdfUrl) {
    return (
      <div className="group relative rounded-xl border bg-card p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
        <div className="space-y-2">
          <h3 className="text-xl font-semibold flex items-center line-clamp-2">
            <FileText className="mr-2 h-5 w-5 text-muted-foreground flex-shrink-0" />
            {title}
          </h3>
          {description && (
            <p className="text-muted-foreground text-sm line-clamp-2">{description}</p>
          )}
          <p className="text-red-500 text-sm">PDF 파일을 찾을 수 없습니다</p>
        </div>
      </div>
    );
  }
  
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
      <div className="group relative rounded-xl border bg-card p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
        <div className="aspect-[4/3] relative bg-muted rounded-lg mb-4 flex items-center justify-center">
          <div className="text-center space-y-2">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <FileText className="h-8 w-8 text-primary" />
            </div>
            <p className="text-sm text-muted-foreground">로그인 필요</p>
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold flex items-center line-clamp-2">
            <FileText className="mr-2 h-5 w-5 text-muted-foreground flex-shrink-0" />
            {title}
          </h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative rounded-xl border bg-card p-6 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-1 hover:border-primary/50">
      <div className="aspect-[4/3] relative rounded-lg overflow-hidden mb-4 bg-muted">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center">
            <Skeleton className="h-full w-full rounded-lg" />
          </div>
        )}
        
        {embedError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-muted rounded-lg p-4">
            <p className="text-red-500 text-center font-medium mb-2">PDF를 로드할 수 없습니다</p>
            <p className="text-sm text-muted-foreground text-center mb-4">
              {isBlobUrl ? 'PDF 파일을 직접 보기' : 'Google Drive에서 직접 보기'}
            </p>
            <Button variant="outline" size="sm" asChild>
              <a 
                href={directUrl || '#'} 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                PDF 링크
              </a>
            </Button>
          </div>
        ) : isBlobUrl ? (
          <iframe
            src={pdfUrl}
            className="absolute inset-0 w-full h-full rounded-lg"
            frameBorder="0"
            allowFullScreen
            onError={handleIframeError}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        ) : (
          <iframe
            src={pdfUrl}
            className="absolute inset-0 w-full h-full rounded-lg"
            frameBorder="0"
            allowFullScreen
            onError={handleIframeError}
            style={{ display: isLoading ? 'none' : 'block' }}
          />
        )}
      </div>
      
      <div className="space-y-2">
        <h3 className="text-xl font-semibold flex items-center line-clamp-2 group-hover:text-primary transition-colors">
          <FileText className="mr-2 h-5 w-5 text-muted-foreground flex-shrink-0" />
          {title}
        </h3>
        {description && (
          <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
        )}
      </div>
      
      <div className="flex gap-3 mt-4">
        <Button variant="outline" size="sm" asChild className="flex-1">
          <a 
            href={directUrl || '#'} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2"
          >
            <ExternalLink className="h-4 w-4" />
            {isBlobUrl ? 'PDF 보기' : 'Google Drive에서 보기'}
          </a>
        </Button>
      </div>
    </div>
  );
}


