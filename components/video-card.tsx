'use client';

import { Button } from "@/components/ui/button";

interface VideoCardProps {
  id: string;
  title: string;
  description: string | null;
}

export function VideoCard({ id, title, description }: VideoCardProps) {
  return (
    <div className="group relative rounded-lg border p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex flex-col space-y-4">
        <h3 className="text-xl font-semibold">{title}</h3>
        <p className="text-muted-foreground">{description}</p>
        <div className="flex items-center gap-4">
          <Button
            asChild
            className="w-32"
          >
            <a href={`/watch/${id}`}>영상 보기</a>
          </Button>
          <Button
            variant="outline"
            asChild
            className="w-32"
          >
            <a href={`/watch/${id}/summary`}>요약 생성</a>
          </Button>
        </div>
      </div>
    </div>
  )
} 