/**
 * 기수별 1주차, 2주차 동기화 스크립트
 * Google Drive 폴더에서 각 기수의 1주차, 2주차 비디오를 가져와 데이터베이스에 추가
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
 * 기수 폴더 찾기 (1기, 2기, 3기 등)
 */
function isBatchFolder(folderName: string): boolean {
  // 기수 패턴: 숫자 + "기" 또는 "편집본" 포함
  const batchPattern = /^\d+기|편집본/;
  return batchPattern.test(folderName);
}

/**
 * 주차 폴더 찾기 (1주차, 2주차)
 */
function isWeekFolder(folderName: string, week: number): boolean {
  return folderName === `${week}주차` || folderName === `Week ${week}`;
}

/**
 * 코스 생성 또는 업데이트
 */
async function upsertCourse(
  title: string,
  description: string,
  summary: string,
  imageUrl?: string
): Promise<string> {
  const existing = await prisma.course.findFirst({
    where: { title },
  });

  if (existing) {
    // 기존 코스 업데이트
    await prisma.course.update({
      where: { id: existing.id },
      data: {
        description,
        imageUrl: imageUrl || existing.imageUrl,
      },
    });
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
      },
    });
    console.log(`   ✅ 비디오 업데이트: ${title}`);
  } else {
    await prisma.video.create({
      data: {
        courseId,
        title,
        description,
        url,
        position,
      },
    });
    console.log(`   ✅ 비디오 생성: ${title}`);
  }
}

/**
 * 주차 폴더 처리
 */
async function processWeekFolder(
  courseId: string,
  weekFolderId: string,
  weekFolderName: string,
  batchName: string,
  position: number
): Promise<number> {
  console.log(`      📂 ${weekFolderName} 처리 중...`);

  const videos = await getVideosInFolder(weekFolderId);
  console.log(`         발견된 비디오: ${videos.length}개`);

  for (const video of videos) {
    const videoUrl = `https://drive.google.com/file/d/${video.id}/view`;
    const videoTitle = `${weekFolderName} - ${video.name}`;
    const videoDescription = `${batchName} ${weekFolderName} 강의 비디오입니다.\n\n${video.name}`;

    await upsertVideo(
      courseId,
      videoTitle,
      videoDescription,
      videoUrl,
      position++,
      video.id
    );
  }

  return position;
}

/**
 * 기수 폴더 처리
 */
async function processBatchFolder(
  batchFolder: FolderInfo
): Promise<void> {
  console.log(`\n📁 기수 폴더 처리: ${batchFolder.name} (${batchFolder.id})`);

  // 기수 폴더 내의 하위 폴더 확인
  const subFolders = await getSubFolders(batchFolder.id);
  console.log(`   하위 폴더: ${subFolders.length}개`);

  // 1주차, 2주차 폴더 찾기
  const week1Folder = subFolders.find((f) => isWeekFolder(f.name, 1));
  const week2Folder = subFolders.find((f) => isWeekFolder(f.name, 2));

  if (!week1Folder && !week2Folder) {
    console.log(`   ⚠️  1주차, 2주차 폴더를 찾을 수 없습니다.`);
    return;
  }

  // 코스 제목 및 설명 생성
  const courseTitle = `${batchFolder.name} - 1주차 & 2주차`;
  const courseDescription = `${batchFolder.name}의 1주차와 2주차 강의를 포함한 코스입니다.\n\n이 코스에서는 ${batchFolder.name} 과정의 초기 단계인 1주차와 2주차 강의를 학습할 수 있습니다.`;
  
  // 요약 생성
  const week1Count = week1Folder ? (await getVideosInFolder(week1Folder.id)).length : 0;
  const week2Count = week2Folder ? (await getVideosInFolder(week2Folder.id)).length : 0;
  const courseSummary = `${batchFolder.name}의 1주차(${week1Count}개 비디오)와 2주차(${week2Count}개 비디오) 강의를 제공합니다.`;

  // 코스 생성 또는 업데이트
  const courseId = await upsertCourse(
    courseTitle,
    courseDescription,
    courseSummary
  );

  console.log(`   ✅ 코스 ID: ${courseId}`);

  let position = 0;

  // 기존 비디오의 최대 position 찾기
  const existingVideos = await prisma.video.findMany({
    where: { courseId },
    orderBy: { position: 'desc' },
    take: 1,
  });
  if (existingVideos.length > 0) {
    position = existingVideos[0].position + 1;
  }

  // 1주차 처리
  if (week1Folder) {
    position = await processWeekFolder(
      courseId,
      week1Folder.id,
      week1Folder.name,
      batchFolder.name,
      position
    );
  }

  // 2주차 처리
  if (week2Folder) {
    position = await processWeekFolder(
      courseId,
      week2Folder.id,
      week2Folder.name,
      batchFolder.name,
      position
    );
  }

  console.log(`   ✅ ${batchFolder.name} 처리 완료 (총 ${position}개 비디오)`);
}

/**
 * 메인 실행 함수
 */
async function main() {
  try {
    console.log('🚀 기수별 1주차, 2주차 동기화 시작...\n');

    // 루트 폴더의 하위 폴더 확인
    const rootFolders = await getSubFolders(ROOT_FOLDER_ID);
    console.log(`📂 루트 폴더에서 발견된 폴더: ${rootFolders.length}개\n`);

    // 기수 폴더 필터링
    const batchFolders = rootFolders.filter((folder) => isBatchFolder(folder.name));
    console.log(`📋 기수 폴더: ${batchFolders.length}개`);
    batchFolders.forEach((folder, index) => {
      console.log(`   ${index + 1}. ${folder.name} (${folder.id})`);
    });

    if (batchFolders.length === 0) {
      console.log('\n⚠️  기수 폴더를 찾을 수 없습니다.');
      return;
    }

    console.log('\n');

    // 각 기수 폴더 처리
    for (const batchFolder of batchFolders) {
      try {
        await processBatchFolder(batchFolder);
      } catch (error) {
        console.error(`❌ ${batchFolder.name} 처리 중 오류:`, error);
      }
    }

    console.log(`\n✅ 동기화 완료!`);
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



