"use client";

interface VideoPlayerProps {
  videoUrl: string;
}

export function VideoPlayer({ videoUrl }: VideoPlayerProps) {
  const embedUrl = videoUrl.replace('/view?usp=share_link', '/preview');

  return (
    <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-black">
      <iframe
        src={embedUrl}
        className="w-full h-full"
        allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
        allowFullScreen
        frameBorder="0"
      />
    </div>
  );
} 