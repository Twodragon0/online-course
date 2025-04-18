import Link from 'next/link';
import { prisma } from '@/lib/db';

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

// 폴백 데이터 (Prisma 연결 실패시 사용)
const fallbackCourses: Course[] = [
  {
    id: 'cloud-security-course',
    title: '클라우드 보안 가이드',
    description: 'AWS, Azure, GCP 클라우드 환경에서의 보안 설정 및 Best Practices',
    price: 99.99,
    imageUrl: null,
    videos: [
      { id: 'cloud-security-aws-2024', title: '2024 AWS 클라우드 보안 가이드' },
      { id: 'cloud-security-azure-2024', title: '2024 Azure 클라우드 보안 가이드' }
    ]
  },
  {
    id: 'devsecops-course',
    title: 'DevSecOps 과정',
    description: '개발, 보안, 운영을 통합한 DevSecOps 실무 학습',
    price: 129.99,
    imageUrl: null,
    videos: [
      { id: 'devsecops-intro', title: 'DevSecOps 과정 - intro' }
    ]
  }
];

export default async function GetStartedPage() {
  let courses: Course[] = [];
  
  try {
    // Prisma로 데이터 가져오기 시도
    courses = await prisma.course.findMany({
      include: {
        videos: true,
      },
    }) as Course[];
    
    // 데이터가 없으면 폴백 데이터 사용
    if (!courses || courses.length === 0) {
      courses = fallbackCourses;
    }
  } catch (error) {
    console.error('데이터베이스 쿼리 실패:', error);
    // 오류 발생시 폴백 데이터 사용
    courses = fallbackCourses;
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