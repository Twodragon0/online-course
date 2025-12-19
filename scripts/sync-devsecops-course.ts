/**
 * DevSecOps 과정 동기화 스크립트
 * Google Drive 폴더에서 비디오를 가져와 데이터베이스에 추가
 */

import { PrismaClient } from '@prisma/client';
import { getDriveService, getVideosInFolder } from '../lib/google-drive';

const prisma = new PrismaClient();

// Google Drive 루트 폴더 ID
const ROOT_FOLDER_ID = '1SaaPQmXPTyAtceM8BMv7xFKwCPg55L6Y';

interface FolderInfo {
  id: string;
  name: string;
}

/**
 * 폴더 내의 하위 폴더 목록 조회
 */
async function getSubFolders(folderId: string): Promise<FolderInfo[]> {
  try {
    const drive = await getDriveService();
    const response = await drive.files.list({
      q: `'${folderId}' in parents and mimeType = 'application/vnd.google-apps.folder' and trashed=false`,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      orderBy: 'name',
    });

    return (response.data.files || []).map((file) => ({
      id: file.id!,
      name: file.name!,
    }));
  } catch (error) {
    console.error(`Error getting subfolders for ${folderId}:`, error);
    return [];
  }
}

/**
 * DevSecOps 관련 폴더 찾기
 */
async function findDevSecOpsFolders(rootFolderId: string): Promise<FolderInfo[]> {
  const folders = await getSubFolders(rootFolderId);
  
  // DevSecOps 관련 키워드
  const keywords = [
    'devsecops',
    '클라우드 시큐리티',
    '클라우드 보안',
    '시큐리티',
    '보안',
    'security',
    'cloud security',
  ];

  return folders.filter((folder) =>
    keywords.some((keyword) =>
      folder.name.toLowerCase().includes(keyword.toLowerCase())
    )
  );
}

/**
 * 코스 생성 또는 업데이트
 */
async function upsertCourse(
  title: string,
  description: string,
  imageUrl?: string
): Promise<string> {
  const existing = await prisma.course.findFirst({
    where: { title },
  });

  if (existing) {
    return existing.id;
  }

  const course = await prisma.course.create({
    data: {
      title,
      description,
      price: 0, // 무료
      imageUrl: imageUrl || null,
    },
  });

  return course.id;
}

/**
 * 비디오 생성 또는 업데이트
 */
async function upsertVideo(
  courseId: string,
  title: string,
  description: string,
  url: string,
  position: number,
  driveFileId?: string
): Promise<void> {
  const existing = await prisma.video.findFirst({
    where: {
      courseId,
      title,
    },
  });

  if (existing) {
    await prisma.video.update({
      where: { id: existing.id },
      data: {
        description,
        url,
        position,
        // driveFileId 필드는 스키마에 없으므로 제거
      },
    });
    console.log(`✅ 비디오 업데이트: ${title}`);
  } else {
    await prisma.video.create({
      data: {
        courseId,
        title,
        description,
        url,
        position,
        // driveFileId 필드는 스키마에 없으므로 제거
      },
    });
    console.log(`✅ 비디오 생성: ${title}`);
  }
}

/**
 * 폴더에서 비디오를 가져와 코스에 추가
 */
async function processFolder(
  courseId: string,
  folderId: string,
  folderName: string,
  basePosition: number = 0
): Promise<number> {
  console.log(`\n📁 폴더 처리 중: ${folderName} (${folderId})`);

  // 비디오 파일 가져오기
  const videos = await getVideosInFolder(folderId);
  console.log(`   발견된 비디오: ${videos.length}개`);

  // 하위 폴더 확인
  const subFolders = await getSubFolders(folderId);
  console.log(`   발견된 하위 폴더: ${subFolders.length}개`);

  let position = basePosition;

  // 하위 폴더 처리
  for (const subFolder of subFolders) {
    const subVideos = await getVideosInFolder(subFolder.id);
    
    if (subVideos.length > 0) {
      // 하위 폴더 이름을 섹션 제목으로 사용
      for (const video of subVideos) {
        const videoUrl = `https://drive.google.com/file/d/${video.id}/view`;
        await upsertVideo(
          courseId,
          `${subFolder.name} - ${video.name}`,
          `Google Drive에서 가져온 비디오: ${video.name}`,
          videoUrl,
          position++,
          video.id
        );
      }
    } else {
      // 하위 폴더가 비어있으면 폴더 자체를 섹션으로 처리
      const nestedSubFolders = await getSubFolders(subFolder.id);
      for (const nestedFolder of nestedSubFolders) {
        const nestedVideos = await getVideosInFolder(nestedFolder.id);
        for (const video of nestedVideos) {
          const videoUrl = `https://drive.google.com/file/d/${video.id}/view`;
          await upsertVideo(
            courseId,
            `${subFolder.name} - ${nestedFolder.name} - ${video.name}`,
            `Google Drive에서 가져온 비디오: ${video.name}`,
            videoUrl,
            position++,
            video.id
          );
        }
      }
    }
  }

  // 현재 폴더의 직접 비디오 처리
  for (const video of videos) {
    const videoUrl = `https://drive.google.com/file/d/${video.id}/view`;
    await upsertVideo(
      courseId,
      video.name,
      `Google Drive에서 가져온 비디오: ${video.name}`,
      videoUrl,
      position++,
      video.id
    );
  }

  return position;
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    console.log('🚀 DevSecOps 과정 동기화 시작...\n');

    // 루트 폴더의 하위 폴더 확인
    const rootFolders = await getSubFolders(ROOT_FOLDER_ID);
    console.log(`📂 루트 폴더에서 발견된 폴더: ${rootFolders.length}개\n`);

    // DevSecOps 관련 폴더 찾기
    const devsecopsFolders = await findDevSecOpsFolders(ROOT_FOLDER_ID);
    console.log(`🛡️ DevSecOps 관련 폴더: ${devsecopsFolders.length}개\n`);

    // 모든 폴더 출력
    console.log('📋 발견된 모든 폴더:');
    rootFolders.forEach((folder, index) => {
      console.log(`   ${index + 1}. ${folder.name} (${folder.id})`);
    });

    // DevSecOps 코스 생성
    const courseId = await upsertCourse(
      '🛡️ DevSecOps & 클라우드 보안',
      'DevSecOps와 클라우드 보안에 대한 종합적인 학습 과정입니다. 보안을 개발 프로세스에 통합하고, 클라우드 환경에서의 보안 모범 사례를 학습합니다.',
      null
    );

    console.log(`\n✅ 코스 ID: ${courseId}\n`);

    // 주요 폴더 처리
    const targetFolders = [
      { name: '클라우드 시큐리티 1기', id: null as string | null },
      { name: '5기 클라우드 거버넌스', id: null as string | null },
      { name: '클라우드 거버넌스 서기원님 자료', id: null as string | null },
    ];

    // 폴더 ID 찾기
    for (const target of targetFolders) {
      const found = rootFolders.find((f) => f.name === target.name);
      if (found) {
        target.id = found.id;
      }
    }

    let position = 0;

    // 각 폴더 처리
    for (const target of targetFolders) {
      if (target.id) {
        position = await processFolder(courseId, target.id, target.name, position);
      }
    }

    // DevSecOps 관련 폴더 처리
    for (const folder of devsecopsFolders) {
      if (!targetFolders.some((t) => t.name === folder.name)) {
        position = await processFolder(courseId, folder.id, folder.name, position);
      }
    }

    console.log(`\n✅ 동기화 완료! 총 ${position}개의 비디오가 처리되었습니다.`);
  } catch (error) {
    console.error('❌ 오류 발생:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// 스크립트 실행
if (require.main === module) {
  main()
    .then(() => {
      console.log('\n✨ 스크립트 실행 완료');
      process.exit(0);
    })
    .catch((error) => {
      console.error('\n💥 스크립트 실행 실패:', error);
      process.exit(1);
    });
}

export { main };

