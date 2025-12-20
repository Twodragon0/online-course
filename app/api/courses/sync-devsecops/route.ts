import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';
import { checkRateLimit, getClientIp } from '@/lib/security';
import { getDriveService, getVideosInFolder } from '@/lib/google-drive';

/**
 * 관리자 권한 확인
 */
function getAdminEmails(): string[] {
  const adminEmailsEnv = process.env.ADMIN_EMAILS;
  if (adminEmailsEnv) {
    return adminEmailsEnv.split(',').map(email => email.trim().toLowerCase());
  }
  return [];
}

async function isAdmin(email: string): Promise<boolean> {
  const adminEmails = getAdminEmails();
  if (adminEmails.length === 0) {
    return process.env.NODE_ENV === 'development';
  }
  return adminEmails.includes(email.toLowerCase().trim());
}

/**
 * DevSecOps 과정 동기화 API
 * Google Drive에서 비디오를 가져와 데이터베이스에 추가
 */
export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`sync-devsecops:${clientIp}`, 5, 60000);
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    // 인증 확인
    const session = await getServerSession();
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 관리자 권한 확인
    if (!(await isAdmin(session.user.email))) {
      return NextResponse.json(
        { error: '관리자 권한이 필요합니다.' },
        { status: 403 }
      );
    }

    if (!prisma) {
      return NextResponse.json(
        { error: 'Database not configured' },
        { status: 503 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const folderId = body.folderId || '1SaaPQmXPTyAtceM8BMv7xFKwCPg55L6Y';

    // Google Drive 서비스 가져오기
    const drive = await getDriveService();

    // 루트 폴더의 하위 폴더 목록 가져오기
    const foldersResponse = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      orderBy: 'name',
    });

    const folders = foldersResponse.data.files || [];
    console.log(`Found ${folders.length} folders in root`);

    // DevSecOps 코스 찾기 또는 생성
    let course = await prisma.course.findFirst({
      where: {
        title: {
          contains: 'DevSecOps',
        },
      },
    });

    if (!course) {
      course = await prisma.course.create({
        data: {
          title: '🛡️ DevSecOps & 클라우드 보안',
          description: 'DevSecOps와 클라우드 보안에 대한 종합적인 학습 과정입니다. 보안을 개발 프로세스에 통합하고, 클라우드 환경에서의 보안 모범 사례를 학습합니다.',
          price: 0,
        },
      });
    }

    const results = {
      courseId: course.id,
      foldersProcessed: 0,
      videosAdded: 0,
      errors: [] as string[],
    };

    // DevSecOps 관련 폴더 찾기
    const devsecopsKeywords = [
      '클라우드 시큐리티',
      '클라우드 보안',
      '시큐리티',
      '보안',
      'security',
      'cloud security',
      'devsecops',
    ];

    const devsecopsFolders = folders.filter((folder) =>
      devsecopsKeywords.some((keyword) =>
        folder.name?.toLowerCase().includes(keyword.toLowerCase())
      )
    );

    // 주요 폴더 우선 처리
    const priorityFolders = [
      '클라우드 시큐리티 1기',
      '5기 클라우드 거버넌스',
      '클라우드 거버넌스 서기원님 자료',
    ];

    const foldersToProcess = [
      ...folders.filter((f) => priorityFolders.includes(f.name || '')),
      ...devsecopsFolders.filter((f) => !priorityFolders.includes(f.name || '')),
    ];

    let position = 0;

    for (const folder of foldersToProcess) {
      if (!folder.id || !folder.name) continue;

      try {
        results.foldersProcessed++;

        // 폴더 내 비디오 가져오기
        const videos = await getVideosInFolder(folder.id);

        // 하위 폴더 확인
        const subFoldersResponse = await drive.files.list({
          q: `'${folder.id}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed=false`,
          fields: 'files(id, name)',
          supportsAllDrives: true,
          includeItemsFromAllDrives: true,
        });

        const subFolders = subFoldersResponse.data.files || [];

        // 하위 폴더의 비디오 처리
        for (const subFolder of subFolders) {
          if (!subFolder.id || !subFolder.name) continue;

          const subVideos = await getVideosInFolder(subFolder.id);
          for (const video of subVideos) {
            const videoUrl = `https://drive.google.com/file/d/${video.id}/view`;
            
            const existing = await prisma.video.findFirst({
              where: {
                courseId: course.id,
                title: `${subFolder.name} - ${video.name}`,
              },
            });

            if (!existing) {
              await prisma.video.create({
                data: {
                  courseId: course.id,
                  title: `${subFolder.name} - ${video.name}`,
                  description: `Google Drive에서 가져온 비디오: ${video.name}`,
                  url: videoUrl,
                  position: position++,
                },
              });
              results.videosAdded++;
            }
          }
        }

        // 직접 비디오 처리
        for (const video of videos) {
          const videoUrl = `https://drive.google.com/file/d/${video.id}/view`;
          
          const existing = await prisma.video.findFirst({
            where: {
              courseId: course.id,
              title: video.name,
            },
          });

          if (!existing) {
            await prisma.video.create({
              data: {
                courseId: course.id,
                title: video.name,
                description: `Google Drive에서 가져온 비디오: ${video.name}`,
                url: videoUrl,
                position: position++,
              },
            });
            results.videosAdded++;
          }
        }
      } catch (error) {
        const errorMsg = `Error processing folder ${folder.name}: ${error instanceof Error ? error.message : 'Unknown error'}`;
        console.error(errorMsg);
        results.errors.push(errorMsg);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'DevSecOps 과정 동기화 완료',
      results,
    });
  } catch (error) {
    console.error('Sync error:', error);
    return NextResponse.json(
      {
        error: '동기화 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



