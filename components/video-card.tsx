'use client';

import { Button } from "@/components/ui/button";
import { useSession } from "next-auth/react";
import { extractFileIdFromUrl } from "@/lib/google-drive-client";
import { Play, Lock, Clock, FileVideo } from "lucide-react";
import Link from "next/link";

interface VideoCardProps {
  id: string;
  title: string;
  description: string | null;
  driveFileId: string;
  duration?: string;
  progress?: number;
}

export function VideoCard({ id, title, description, driveFileId, duration, progress }: VideoCardProps) {
  const { data: session } = useSession();

  // Google Drive 파일 ID 추출 (URL 형식이거나 파일 ID일 수 있음)
  const fileId = extractFileIdFromUrl(driveFileId) || driveFileId;
  
  // Google Drive 파일 ID로부터 임베드 URL 생성
  const embedUrl = `https://drive.google.com/file/d/${fileId}/preview`;
  const thumbnailUrl = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1280`;

  if (!session) {
    return (
      <div className="group card-enhanced p-0 overflow-hidden">
        <div className="video-card-thumbnail relative mb-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-primary/10 to-background flex items-center justify-center">
            <div className="text-center space-y-3">
              <div className="w-20 h-20 rounded-full bg-primary/20 backdrop-blur-sm flex items-center justify-center mx-auto border-2 border-primary/30">
                <Lock className="h-10 w-10 text-primary" />
              </div>
              <p className="text-sm font-medium text-foreground">로그인 필요</p>
            </div>
          </div>
        </div>
        <div className="p-6 space-y-3">
          <h3 className="text-xl font-semibold line-clamp-2 text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>
          )}
          <div className="flex items-center gap-4 text-xs text-muted-foreground">
            {duration && (
              <div className="flex items-center gap-1.5">
                <Clock className="h-4 w-4" />
                <span>{duration}</span>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <FileVideo className="h-4 w-4" />
              <span>비디오</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="group card-enhanced p-0 overflow-hidden">
      <Link href={`/watch/${id}`} className="block">
        <div className="video-card-thumbnail relative">
          {/* Thumbnail with overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          {/* Play button overlay */}
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <div className="w-16 h-16 rounded-full bg-primary/90 backdrop-blur-sm flex items-center justify-center shadow-xl transform group-hover:scale-110 transition-transform">
              <Play className="h-8 w-8 text-primary-foreground ml-1" fill="currentColor" />
            </div>
          </div>
          
          {/* Progress bar */}
          {progress !== undefined && progress > 0 && (
            <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/30">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          )}
          
          {/* Duration badge */}
          {duration && (
            <div className="absolute bottom-3 right-3 px-2 py-1 rounded-md bg-black/70 backdrop-blur-sm text-white text-xs font-medium flex items-center gap-1.5">
              <Clock className="h-3 w-3" />
              {duration}
            </div>
          )}
          
          {/* Video preview */}
          <iframe
            src={embedUrl}
            className="absolute inset-0 w-full h-full pointer-events-none"
            allow="autoplay"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </Link>
      
      <div className="p-6 space-y-4">
        <div className="space-y-2">
          <Link href={`/watch/${id}`}>
            <h3 className="text-xl font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors">
              {title}
            </h3>
          </Link>
          {description && (
            <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
              {description}
            </p>
          )}
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3 pt-2">
          <Button asChild className="flex-1 group/btn">
            <Link href={`/watch/${id}`} className="flex items-center justify-center gap-2">
              <Play className="h-4 w-4" />
              재생하기
            </Link>
          </Button>
          <Button variant="outline" asChild className="flex-1">
            <Link href={`/courses/${id}/summary`}>요약 보기</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}