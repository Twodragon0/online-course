"use client";

import { useState } from 'react';

interface VideoPlayerProps {
  url: string;
}

export function VideoPlayer({ url }: VideoPlayerProps) {
  // Google Drive 비디오 URL을 임베드 URL로 변환
  const getEmbedUrl = (url: string) => {
    const fileId = url.match(/\/d\/(.*?)\/view/)?.[1];
    if (!fileId) return url;
    return `https://drive.google.com/file/d/${fileId}/preview`;
  };

  return (
    <div className="relative w-full" style={{ paddingBottom: '56.25%' }}>
      <iframe
        src={getEmbedUrl(url)}
        className="absolute top-0 left-0 w-full h-full"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowFullScreen
        style={{
          border: 'none',
          borderRadius: '8px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        }}
      />
    </div>
  );
} 