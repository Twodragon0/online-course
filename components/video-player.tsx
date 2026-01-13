"use client";

import { useState } from 'react';
import { Play, Maximize2, Volume2, Settings } from 'lucide-react';

interface VideoPlayerProps {
  url: string;
  title?: string;
}

export function VideoPlayer({ url, title }: VideoPlayerProps) {
  // Google Drive 비디오 URL을 임베드 URL로 변환
  const getEmbedUrl = (url: string) => {
    const fileId = url.match(/\/d\/(.*?)\/view/)?.[1] || url.match(/\/d\/(.*?)\//)?.[1] || url;
    return `https://drive.google.com/file/d/${fileId}/preview`;
  };

  const embedUrl = getEmbedUrl(url);

  return (
    <div className="relative w-full group">
      {/* Video Container */}
      <div className="relative w-full rounded-xl overflow-hidden bg-black shadow-2xl" style={{ paddingBottom: '56.25%' }}>
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full"
          allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
          allowFullScreen
          style={{
            border: 'none',
          }}
        />
        
        {/* Overlay gradient for better UI */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
      
      {/* Video Info */}
      {title && (
        <div className="mt-4 space-y-2">
          <h2 className="text-2xl font-bold text-foreground">{title}</h2>
        </div>
      )}
    </div>
  );
} 