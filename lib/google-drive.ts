/**
 * Google Drive API 서비스
 * share 폴더의 drive_service.py 로직을 참고하여 구현
 */

import { google } from 'googleapis';
import { JWT } from 'google-auth-library';
import path from 'path';
import fs from 'fs';

// Google Drive API 스코프
const SCOPES = ['https://www.googleapis.com/auth/drive.readonly'];

interface DriveFile {
  id: string;
  name: string;
  mimeType: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
}

interface FolderConfig {
  [key: string]: string; // 기수별 폴더 ID (예: "1기": "folder-id")
}

/**
 * Google Drive 서비스 인스턴스 생성
 */
export async function getDriveService() {
  // Service Account 인증 정보
  const credentialsPath = process.env.GOOGLE_CREDENTIALS_PATH || 
    path.join(process.cwd(), 'share', 'data', 'bjchoi_service_account.json');
  
  let credentials: any;
  
  // 환경변수에서 credentials 가져오기 (Vercel 등)
  if (process.env.GOOGLE_CREDENTIALS) {
    credentials = JSON.parse(process.env.GOOGLE_CREDENTIALS);
  } else if (fs.existsSync(credentialsPath)) {
    // 파일에서 credentials 읽기
    credentials = JSON.parse(fs.readFileSync(credentialsPath, 'utf-8'));
  } else {
    throw new Error('Google Drive credentials not found');
  }

  // JWT 클라이언트 생성
  const auth = new JWT({
    email: credentials.client_email,
    key: credentials.private_key,
    scopes: SCOPES,
  });

  return google.drive({ version: 'v3', auth });
}

/**
 * 폴더 설정 파일 로드
 */
export function loadFolders(): FolderConfig {
  const foldersPath = process.env.FOLDERS_CONFIG_PATH ||
    path.join(process.cwd(), 'share', 'data', 'folders.json');
  
  if (!fs.existsSync(foldersPath)) {
    console.warn(`Folders config not found at ${foldersPath}`);
    return {};
  }

  return JSON.parse(fs.readFileSync(foldersPath, 'utf-8'));
}

/**
 * 특정 기수의 주차 폴더 ID 조회
 * @param batch 기수 (예: "3기")
 * @param week 주차 (예: 3)
 * @returns 폴더 ID 또는 null
 */
export async function getWeekFolderId(batch: string, week: number): Promise<string | null> {
  const folders = loadFolders();
  const batchFolderId = folders[batch];

  if (!batchFolderId) {
    return null;
  }

  const drive = await getDriveService();
  const weekName = `${week}주차`;

  const query = `'${batchFolderId}' in parents and name = '${weekName}' and mimeType = 'application/vnd.google-apps.folder'`;

  try {
    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
    });

    const files = response.data.files || [];
    return files.length > 0 ? files[0].id || null : null;
  } catch (error) {
    console.error(`Error getting week folder for ${batch} ${week}주차:`, error);
    return null;
  }
}

/**
 * 폴더 내의 동영상 파일 목록 조회
 * @param folderId Google Drive 폴더 ID
 * @returns 동영상 파일 목록
 */
export async function getVideosInFolder(folderId: string): Promise<DriveFile[]> {
  const drive = await getDriveService();

  // 동영상 파일 MIME 타입들
  const videoMimeTypes = [
    'video/mp4',
    'video/webm',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/3gpp',
    'video/x-flv',
  ];

  const mimeTypeQuery = videoMimeTypes.map(type => `mimeType='${type}'`).join(' or ');

  const query = `'${folderId}' in parents and (${mimeTypeQuery}) and trashed=false`;

  try {
    const response = await drive.files.list({
      q: query,
      fields: 'files(id, name, mimeType, webViewLink, webContentLink, thumbnailLink)',
      supportsAllDrives: true,
      includeItemsFromAllDrives: true,
      orderBy: 'name',
    });

    return (response.data.files || []) as DriveFile[];
  } catch (error) {
    console.error(`Error getting videos in folder ${folderId}:`, error);
    return [];
  }
}

/**
 * Google Drive 파일 ID로부터 공유 링크 생성 (서버/클라이언트 공용)
 * 클라이언트에서는 google-drive-client.ts의 함수를 사용하세요.
 * @deprecated 클라이언트에서는 google-drive-client.ts를 사용하세요.
 */
export { getDriveFileLink, extractFileIdFromUrl } from './google-drive-client';

/**
 * 특정 기수와 주차의 모든 동영상 강의 조회
 * @param batch 기수 (예: "3기")
 * @param week 주차 (예: 3)
 * @returns 동영상 파일 목록
 */
export async function getWeekVideos(batch: string, week: number): Promise<DriveFile[]> {
  const folderId = await getWeekFolderId(batch, week);
  
  if (!folderId) {
    console.warn(`폴더를 찾을 수 없습니다: ${batch} ${week}주차`);
    return [];
  }

  return await getVideosInFolder(folderId);
}

/**
 * 모든 기수의 특정 주차 동영상 강의 조회
 * @param week 주차
 * @param batches 조회할 기수 목록 (없으면 모든 기수)
 * @returns 기수별 동영상 파일 목록
 */
export async function getAllWeekVideos(
  week: number,
  batches?: string[]
): Promise<{ batch: string; videos: DriveFile[] }[]> {
  const folders = loadFolders();
  const targetBatches = batches || Object.keys(folders);

  const results = await Promise.all(
    targetBatches.map(async (batch) => {
      const videos = await getWeekVideos(batch, week);
      return { batch, videos };
    })
  );

  return results.filter((result) => result.videos.length > 0);
}
