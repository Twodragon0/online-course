import Link from 'next/link';
import { prisma } from '@/lib/prisma';

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  imageUrl: string | null;
  videos: {
    id: string;
    title: string;
  }[];
}

export const dynamic = 'force-dynamic';
export const revalidate = 0;

function validateDatabaseUrl(): boolean {
  const dbUrl = process.env.DATABASE_URL;
  if (!dbUrl) return false;
  return dbUrl.startsWith('postgresql://') || 
         dbUrl.startsWith('postgres://') || 
         dbUrl.startsWith('postgresql+pooler://');
}

export default async function GetStartedPage() {
  let courses: Course[] = [];
  
  // 빌드 시점에는 데이터베이스 쿼리 건너뛰기
  if (process.env.NEXT_PHASE === 'phase-production-build') {
    courses = [];
  } else if (process.env.DATABASE_URL && validateDatabaseUrl()) {
    try {
      courses = await prisma.course.findMany({
        include: {
          videos: true,
        },
        take: 10, // Limit results
      }) as Course[];
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      courses = [];
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">시작하기</h1>
      
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground mb-4">현재 이용 가능한 코스가 없습니다.</p>
          <Link
            href="/courses"
            className="inline-flex items-center px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            모든 코스 보기
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course: Course) => (
            <div key={course.id} className="border rounded-lg p-4 space-y-4">
              <h2 className="text-xl font-semibold">{course.title}</h2>
              <p className="text-gray-600 dark:text-gray-300">
                {course.description || 'No description available'}
              </p>
              <div className="flex justify-between items-center">
                <span className="text-lg font-bold">
                  ${course.price.toFixed(2)}
                </span>
                <Link
                  href={`/courses/${course.id}`}
                  className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
                >
                  시작하기
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
} 