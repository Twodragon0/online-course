// app/courses/[courseId]/page.tsx
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { CourseDetailClient } from '@/components/course-detail-client';
import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server'; // Although not directly used in page, keeping for consistency if needed elsewhere

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

export async function generateMetadata({ params }: { params: { courseId: string } }): Promise<Metadata> {
  // Use headers to ensure dynamic rendering for metadata generation
  // This helps Next.js understand this function needs to be re-evaluated on each request
  headers(); 

  const baseUrl = process.env.NEXTAUTH_URL || 'https://edu.2twodragon.com';

  // Fetch course data using the API route (which has caching)
  const response = await fetch(`${baseUrl}/api/courses/${params.courseId}`);
  if (!response.ok) {
    // If the API call fails or course is not found, return generic metadata
    return {
      title: 'Course Not Found - Edu Platform',
      description: 'The requested course could not be found.',
      alternates: {
        canonical: `${baseUrl}/courses`,
      },
    };
  }
  const course: Course = await response.json();

  const courseUrl = `${baseUrl}/courses/${params.courseId}`;

  return {
    title: `${course.title} - Edu Platform`,
    description: course.description || `Learn ${course.title} with our comprehensive online course.`,
    alternates: {
      canonical: courseUrl,
    },
    openGraph: {
      title: `${course.title} - Edu Platform`,
      description: course.description || `Learn ${course.title} with our comprehensive online course.`,
      url: courseUrl,
      images: [
        {
          url: course.imageUrl || `${baseUrl}/og-image.jpg`,
          alt: course.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${course.title} - Edu Platform`,
      description: course.description || `Learn ${course.title} with our comprehensive online course.`,
      images: [course.imageUrl || `${baseUrl}/og-image.jpg`],
    },
  };
}

export default function CourseDetailPage({ params }: { params: { courseId: string } }) {
  return (
    <Suspense fallback={
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
              <div key={i} className="border rounded-xl p-6 space-y-4">
                <div className="aspect-video bg-muted rounded-lg"></div>
                <div className="p-4 space-y-2">
                  <div className="h-5 bg-muted rounded w-3/4"></div>
                  <div className="h-4 bg-muted rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    }>
      <CourseDetailClient params={params} />
    </Suspense>
  );
}
