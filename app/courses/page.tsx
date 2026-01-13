'use client';

import { useEffect, useState, Suspense } from 'react';
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

interface Section {
  id: string;
  title: string;
  description: string;
  videos: Video[];
  driveFileIds?: {
    [key: string]: string;
  };
}

function CoursesContent() {
  const { data: session } = useSession();
  const [courses, setCourses] = useState<Course[]>([]);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 코스와 비디오를 모두 가져오기
        const [coursesResponse, videosResponse] = await Promise.all([
          fetch('/api/courses'),
          fetch('/api/videos'),
        ]);
        
        const coursesData = await coursesResponse.json();
        const videosData = await videosResponse.json();
        
        // 배열 확인 및 타입 검증
        setCourses(Array.isArray(coursesData) ? coursesData : []);
        setVideos(Array.isArray(videosData) ? videosData : []);
      } catch (error) {
        console.error('Failed to fetch courses/videos:', error);
        setCourses([]);
        setVideos([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // 모든 코스를 섹션으로 변환
  const sections: Section[] = [
    // 하드코딩된 DevSecOps 섹션
    {
      id: 'devsecops',
      title: '🛡️ DevSecOps 과정',
      description: '클라우드 보안과 DevSecOps 기초 학습',
      videos: [],
      driveFileIds: {
        'intro': '1er3p4BdWsYmeLUuhMshS10EImWYvWWcU'
      }
    },
    // 데이터베이스에서 가져온 코스들
    ...courses.map(course => ({
      id: course.id,
      title: course.title,
      description: course.description || '',
      videos: course.videos.sort((a, b) => a.position - b.position),
    })),
    // 코스에 속하지 않은 비디오들도 표시
    ...(videos.filter(v => !courses.some(c => c.id === v.courseId)).length > 0 ? [{
      id: 'other',
      title: '📚 기타 비디오',
      description: '다양한 학습 자료',
      videos: videos.filter(v => !courses.some(c => c.id === v.courseId)),
    }] : []),
  ];

  if (loading) {
    return (
      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-16">
            <div className="text-center space-y-4">
              <div className="h-12 bg-muted rounded-lg w-1/3 mx-auto"></div>
              <div className="h-6 bg-muted rounded-lg w-1/2 mx-auto"></div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card-enhanced p-0 overflow-hidden">
                  <div className="aspect-video bg-muted"></div>
                  <div className="p-6 space-y-4">
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
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
            Our Courses
          </motion.h1>
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Master DevSecOps and cloud security with our comprehensive course collection
          </p>
        </div>

        {/* Course Sections */}
        {sections.map((section, sectionIndex) => (
          <motion.section 
            key={section.id} 
            className="space-y-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: sectionIndex * 0.1 }}
          >
            <div className="space-y-4 pb-4 border-b border-border">
              <h2 className="text-3xl sm:text-4xl font-bold text-foreground">{section.title}</h2>
              <p className="text-muted-foreground text-lg leading-relaxed max-w-3xl">
                {section.description}
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {section.videos && section.videos.length > 0 && section.videos.map((video, videoIndex) => (
                <motion.div
                  key={video.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: videoIndex * 0.05 }}
                >
                  <VideoCard
                    id={video.id}
                    title={video.title}
                    description={video.description}
                    driveFileId={video.driveFileId || video.url}
                  />
                </motion.div>
              ))}
              {section.driveFileIds && Object.entries(section.driveFileIds).map(([key, fileId], index) => (
                <motion.div
                  key={key}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.05 }}
                >
                  <VideoCard
                    id={key}
                    title={`${section.title} - ${key}`}
                    description={section.description}
                    driveFileId={fileId}
                  />
                </motion.div>
              ))}
              {(!section.videos || section.videos.length === 0) && (!section.driveFileIds || Object.keys(section.driveFileIds).length === 0) && (
                <div className="col-span-full text-center py-16">
                  <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-muted mb-4">
                    <FileVideo className="h-10 w-10 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground text-lg">
                    이 코스에는 아직 비디오가 없습니다.
                  </p>
                </div>
              )}
            </div>
          </motion.section>
        ))}

      </div>
    </div>
  );
}

export default function CoursesPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse space-y-8">
            <div className="space-y-4">
              <div className="h-10 bg-muted rounded-lg w-1/3"></div>
              <div className="h-6 bg-muted rounded-lg w-1/4"></div>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="border rounded-xl p-6 space-y-4">
                  <div className="aspect-video bg-muted rounded-lg"></div>
                  <div className="h-6 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <CoursesContent />
    </Suspense>
  );
}