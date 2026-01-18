// components/courses-client.tsx
'use client';

import { useEffect, useState, Suspense } from 'react';
import { CourseCard } from '@/components/course-card';
import { VideoCard } from '@/components/video-card';
import { useSession } from "next-auth/react";
import { motion } from "framer-motion";
import { FileVideo } from "lucide-react";

interface Video {
  driveFileId?: string;
  id: string;
  title: string;
  description: string | null;
  url: string;
  courseId: string;
  position: number;
  course: {
    id: string;
    title: string;
  };
}

interface Course {
  id: string;
  title: string;
  description: string | null;
  price: number;
  imageUrl: string | null;
  videos: Video[];
}

interface CoursesClientProps {
  initialCourses: Course[];
  initialVideos: Video[];
}

export function CoursesClient({ initialCourses, initialVideos }: CoursesClientProps) {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [allVideos, setAllVideos] = useState<Video[]>(initialVideos);
  const [loading, setLoading] = useState(false); // Data already loaded server-side

  // Filter out videos that are already part of a course
  const otherVideos = allVideos.filter(v => !courses.some(c => c.id === v.courseId));

  if (loading) { // This state might not be reached if initial data is provided
    return (
      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-16">
            <div className="text-center space-y-4">
              <div className="h-12 bg-muted rounded-lg w-1/3 mx-auto"></div>
              <div className="h-6 bg-muted rounded-lg w-1/2 mx-auto"></div>
            </div>
            {/* Course Card Skeleton */}
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card-enhanced p-0 overflow-hidden">
                  <div className="aspect-video bg-muted rounded-t-lg"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                    <div className="h-4 bg-muted rounded w-1/4 mt-2"></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-20">
        {/* Hero Header */}
        <div className="text-center space-y-6 relative">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-transparent to-primary/10 rounded-3xl blur-3xl -z-10" />
          <motion.h1
            className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight gradient-text"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Explore Our Courses
          </motion.h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Transform your blog posts into comprehensive online learning experiences.
          </p>
        </div>

        {/* All Courses Section */}
        {courses.length > 0 && (
          <motion.section
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4 pb-4 border-b border-border">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">All Courses</h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
                Dive into our collection of expert-led courses.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {courses.map((course, index) => (
                <motion.div
                  key={course.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <CourseCard
                    id={course.id}
                    title={course.title}
                    description={course.description}
                    imageUrl={course.imageUrl}
                    videoCount={course.videos ? course.videos.length : 0}
                  />
                </motion.div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Other Videos Section */}
        {otherVideos.length > 0 && (
          <motion.section
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="space-y-4 pb-4 border-b border-border">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">Other Videos</h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
                Standalone videos not part of a specific course.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {otherVideos.map((video, index) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
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
          </motion.section>
        )}

        {courses.length === 0 && otherVideos.length === 0 && !loading && (
          <div className="col-span-full text-center py-16">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
              <FileVideo className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground text-lg">
              아직 표시할 코스나 비디오가 없습니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
