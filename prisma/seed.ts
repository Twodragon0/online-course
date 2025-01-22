const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  // DevSecOps 코스 생성
  const devSecOpsCourse = await prisma.course.upsert({
    where: { id: 'devsecops-course' },
    update: {},
    create: {
      id: 'devsecops-course',
      title: 'DevSecOps & 클라우드 보안',
      description: '실무 중심의 DevSecOps 및 클라우드 보안 과정',
      price: 299000,
      imageUrl: '/images/courses/devsecops.jpg',
      videos: {
        create: [
          {
            id: 'devsecops-intro',
            title: '🛡️ DevSecOps 과정 소개',
            description: '클라우드 보안과 DevSecOps 기초 학습',
            url: 'https://drive.google.com/file/d/your-video-id-1/view',
            position: 1,
          },
          {
            id: 'aws-security',
            title: '🛡️ AWS 보안 실습',
            description: 'AWS 클라우드 환경의 보안 설정 실습',
            url: 'https://drive.google.com/file/d/your-video-id-2/view',
            position: 2,
          },
          {
            id: 'aws-docker-web',
            title: '🐳 AWS Docker 기반 웹 실습',
            description: 'AWS 환경에서 Docker를 활용한 웹 애플리케이션 실행 및 보안 설정 실습',
            url: 'https://drive.google.com/file/d/1K7j2r6yw2Kx-xm65qfhYqSnhiv_g_NyI/view?usp=share_link',
            position: 3,
          }
        ],
      },
    },
  });

  console.log({ devSecOpsCourse });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  }); 