import { PrismaClient } from '@prisma/client';
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

export default async function GetStartedPage() {
  let courses: Course[] = [];
  
  try {
    courses = await prisma.course.findMany({
      include: {
        videos: true,
      },
    }) as Course[];
  } catch (error) {
    console.error('Failed to fetch courses:', error);
    courses = [];
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      <h1 className="text-3xl font-bold">시작하기</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {courses.map((course: Course) => (
          <div key={course.id} className="border rounded-lg p-4 space-y-4">
            <h2 className="text-xl font-semibold">{course.title}</h2>
            <p className="text-gray-600 dark:text-gray-300">
              {course.description}
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
    </div>
  );
} 