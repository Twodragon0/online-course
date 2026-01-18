// app/courses/page.tsx
import { Suspense } from 'react';
import { CoursesClient } from '@/components/courses-client';

export const dynamic = 'force-dynamic'; // Force dynamic rendering for this page

// These interfaces are used by the server component to type the data fetched
// They can be moved to a shared types file later.
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

// Server Component for CoursesPage
export default async function CoursesPage() {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://edu.2twodragon.com';

  // Fetch data server-side
  const [coursesResponse, videosResponse] = await Promise.all([
    fetch(`${baseUrl}/api/courses`),
    fetch(`${baseUrl}/api/videos`),
  ]);

  const initialCourses: Course[] = coursesResponse.ok ? await coursesResponse.json() : [];
  const initialVideos: Video[] = videosResponse.ok ? await videosResponse.json() : [];

  return (
    <Suspense fallback={
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
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    }>
      <CoursesClient initialCourses={initialCourses} initialVideos={initialVideos} />
    </Suspense>
  );
}
