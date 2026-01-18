// components/course-card.tsx
'use client';

import Link from "next/link";
import Image from "next/image";
import { Play, BookOpen, Video, Lock } from "lucide-react";
import { Button } from "./ui/button";
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface CourseCardProps {
  id: string;
  title: string;
  description: string | null;
  imageUrl?: string | null;
  videoCount?: number;
  isLocked?: boolean; // For future premium/pro courses
}

export function CourseCard({ id, title, description, imageUrl, videoCount, isLocked = false }: CourseCardProps) {
  const { data: session } = useSession();
  const isLoggedIn = !!session;

  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    setImageError(false); // Reset error state when imageUrl changes
  }, [imageUrl]);

  const displayDescription = description || 'A comprehensive course covering essential topics.';
  const displayImageUrl = imageUrl || '/default-course-thumbnail.png'; // Use a default image if none provided

  return (
    <motion.div
      className="group card-enhanced p-0 overflow-hidden relative"
      whileHover={{ y: -5 }}
      transition={{ duration: 0.2 }}
    >
      <Link href={`/courses/${id}`} className="block">
        <div className="relative aspect-video overflow-hidden rounded-t-lg">
          <Image
            src={imageError ? '/course-placeholder.png' : displayImageUrl}
            alt={title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300 ease-in-out"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            priority={false}
            onError={() => setImageError(true)}
          />
          {isLocked && !isLoggedIn && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-white text-lg font-semibold z-10">
              <Lock className="w-8 h-8 mr-2" /> Locked
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
            <Button
              className="w-full bg-primary/80 hover:bg-primary backdrop-blur-sm"
              size="lg"
            >
              <Play className="w-5 h-5 mr-2" /> Start Course
            </Button>
          </div>
        </div>
      </Link>

      <div className="p-6 space-y-3">
        <Link href={`/courses/${id}`}>
          <h3 className="text-xl font-semibold line-clamp-2 text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
        </Link>
        <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">
          {displayDescription}
        </p>
        {videoCount !== undefined && (
          <div className="flex items-center text-sm text-muted-foreground pt-2">
            <Video className="w-4 h-4 mr-1.5" /> {videoCount} Videos
          </div>
        )}
      </div>
    </motion.div>
  );
}
