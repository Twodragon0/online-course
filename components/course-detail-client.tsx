// components/course-detail-client.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { notFound } from 'next/navigation';
import { VideoCard } from '@/components/video-card';
import { useSession } from 'next-auth/react';
import { motion } from 'framer-motion';
import { BookOpen, Video, Loader2 } from 'lucide-react';
import Image from 'next/image';

interface Video {
  id: string;
  title: string;
  description: string | null;
  url: string;
  driveFileId?: string;
  position: number;
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  videos: Video[];
}

export function CourseDetailClient({ params }: { params: { courseId: string } }) {
  const { data: session } = useSession();
  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const response = await fetch(`/api/courses/${params.courseId}`);
        if (!response.ok) {
          if (response.status === 404) {
            notFound();
          }
          throw new Error(`Failed to fetch course: ${response.statusText}`);
        }
        const data: Course = await response.json();
        setCourse(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [params.courseId]);

  if (loading) {
    return (
      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl mx-auto animate-pulse space-y-8">
          <div className="h-10 bg-muted rounded-lg w-3/4"></div>
          <div className="h-6 bg-muted rounded-lg w-1/2"></div>
          <div className="aspect-video bg-muted rounded-lg"></div>
          <div className="space-y-4">
            <div className="h-4 bg-muted rounded-lg w-full"></div>
            <div className="h-4 bg-muted rounded-lg w-5/6"></div>
            <div className="h-4 bg-muted rounded-lg w-full"></div>
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            {[1, 2].map((i) => (
              <div key={i} className="card-enhanced p-0 overflow-hidden">
                <div className="aspect-video bg-muted"></div>
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-red-500 text-lg">Error: {error}</p>
        <p className="text-muted-foreground mt-4">Please try again later.</p>
      </div>
    );
  }

  if (!course) {
    notFound();
  }

  return (
    <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
      <motion.div
        className="max-w-4xl mx-auto space-y-12"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
      >
        <div className="text-center space-y-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight gradient-text">
            {course.title}
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            {course.description}
          </p>
        </div>

        <div className="relative aspect-video rounded-lg overflow-hidden shadow-2xl">
          <Image
            src={course.imageUrl || '/default-course-thumbnail.png'}
            alt={course.title}
            fill
            className="object-cover"
            priority
          />
          {/* A more interactive video preview might go here, or link to first video */}
        </div>

        <section className="space-y-8">
          <div className="flex items-center space-x-4 pb-4 border-b border-border">
            <BookOpen className="h-8 w-8 text-primary" />
            <h2 className="text-3xl font-bold text-foreground">Course Content</h2>
            {course.videos.length > 0 && (
              <span className="ml-auto text-muted-foreground flex items-center gap-2">
                <Video className="h-5 w-5" /> {course.videos.length} Videos
              </span>
            )}
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {course.videos.sort((a, b) => a.position - b.position).map((video, index) => (
              <motion.div
                key={video.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <VideoCard
                  id={video.id}
                  title={video.title}
                  description={video.description}
                  driveFileId={video.driveFileId || video.url}
                />
              </motion.div>
            ))}
          </div>
        </section>
      </motion.div>
    </div>
  );
}
