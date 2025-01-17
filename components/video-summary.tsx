"use client";

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Play, FileText, Share2, Bookmark, X, Facebook, Twitter, Instagram } from 'lucide-react';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface VideoSummaryProps {
  video: {
    url: string;
    title: string;
    summary: string;
  };
  courseType: 'devsecops' | 'aiSns';
}

interface SharePlatform {
  facebook: (url: string, title: string) => string;
  twitter: (url: string, title: string) => string;
  linkedin: (url: string, title: string) => string;
}

export function VideoSummary({ video, courseType }: VideoSummaryProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [showSummary, setShowSummary] = useState(false);
  const [showVideo, setShowVideo] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

  const getVideoUrl = (url: string) => {
    const fileId = url.split('/d/')[1]?.split('/')[0];
    return `https://drive.google.com/file/d/${fileId}/preview`;
  };

  const handleVideoAccess = () => {
    setShowVideo(true);
  };

  const handleBookmark = () => {
    setIsBookmarked(!isBookmarked);
    toast.success(isBookmarked ? '북마크가 해제되었습니다.' : '북마크에 추가되었습니다.');
  };

  const shareUrls: SharePlatform = {
    facebook: (url, title) => 
      `https://www.facebook.com/dialog/share?app_id=${process.env.NEXT_PUBLIC_FACEBOOK_APP_ID || ''}&href=${encodeURIComponent(url)}&quote=${encodeURIComponent(title)}`,
    twitter: (url, title) => 
      `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`,
    linkedin: (url, title) => 
      `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  };

  const handleShare = (platform: keyof SharePlatform) => {
    const shareUrl = window.location.origin + '/courses';
    const shareTitle = `${video.title} - OnlineCourse`;
    
    // 클립보드 복사 함수
    const copyToClipboard = async (text: string) => {
      try {
        await navigator.clipboard.writeText(text);
        toast.success('링크가 클립보드에 복사되었습니다.');
      } catch (err) {
        toast.error('클립보드 복사에 실패했습니다.');
      }
    };

    // 플랫폼별 공유 처리
    switch (platform) {
      case 'facebook':
        if (process.env.NEXT_PUBLIC_FACEBOOK_APP_ID) {
          window.open(shareUrls.facebook(shareUrl, shareTitle), '_blank', 'width=600,height=400');
        } else {
          copyToClipboard(shareUrl);
          window.open('https://www.facebook.com', '_blank');
        }
        break;
      case 'twitter':
        window.open(shareUrls.twitter(shareUrl, shareTitle), '_blank', 'width=600,height=400');
        break;
      case 'linkedin':
        window.open(shareUrls.linkedin(shareUrl, shareTitle), '_blank', 'width=600,height=400');
        break;
      default:
        copyToClipboard(shareUrl);
    }
  };

  const handleGetSummary = async () => {
    if (summary) {
      setShowSummary(!showSummary);
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('/api/video-summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.url, courseType })
      });
      
      if (!response.ok) throw new Error('요약 생성 실패');
      
      const data = await response.json();
      setSummary(data.summary);
      setTitle(data.title);
      setShowSummary(true);
    } catch (error) {
      toast.error('요약 생성에 실패했습니다.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Card className="p-6 space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-xl font-semibold">
              {courseType === 'devsecops' ? '🛡️' : '🤖'} {title || video.title}
            </h3>
            <p className="text-sm text-muted-foreground mt-2">{video.summary}</p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleBookmark}
              className={isBookmarked ? "text-primary" : ""}
            >
              <Bookmark className="h-4 w-4" fill={isBookmarked ? "currentColor" : "none"} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <Share2 className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleShare('facebook')}>
                  <Facebook className="h-4 w-4 mr-2" />
                  Facebook에 공유
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('twitter')}>
                  <Twitter className="h-4 w-4 mr-2" />
                  Twitter에 공유
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleShare('linkedin')}>
                  <svg
                    className="h-4 w-4 mr-2"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.32 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.79M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z" />
                  </svg>
                  LinkedIn에 공유
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => {
                  navigator.clipboard.writeText(window.location.origin + '/courses');
                  toast.success('링크가 클립보드에 복사되었습니다.');
                }}>
                  <Share2 className="h-4 w-4 mr-2" />
                  링크 복사
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {showSummary && summary && (
          <div className="mt-4 space-y-4 bg-muted/50 p-4 rounded-lg">
            <div 
              className="prose prose-sm dark:prose-invert"
              dangerouslySetInnerHTML={{ 
                __html: summary
                  .replace(/\n/g, '<br/>')
                  .replace(/#(\w+)/g, '<span class="text-primary">#$1</span>')
              }} 
            />
          </div>
        )}
        
        <div className="flex gap-2 pt-2">
          <Button
            variant="default"
            size="sm"
            onClick={handleVideoAccess}
          >
            <Play className="h-4 w-4 mr-2" />
            영상 보기
          </Button>
          <Button
            variant={showSummary ? "secondary" : "outline"}
            size="sm"
            onClick={handleGetSummary}
            disabled={isLoading}
          >
            <FileText className="h-4 w-4 mr-2" />
            {isLoading ? '요약 생성 중...' : 
             summary ? (showSummary ? '요약 접기' : '요약 보기') : 
             '요약 생성'}
          </Button>
        </div>
      </Card>

      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="sm:max-w-[900px] p-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowVideo(false)}
            className="absolute right-4 top-4 z-10"
          >
            <X className="h-4 w-4" />
          </Button>
          <div className="relative aspect-video">
            <iframe
              src={getVideoUrl(video.url)}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute top-0 left-0 w-full h-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
} 