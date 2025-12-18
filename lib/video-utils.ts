/**
 * 동영상 관련 유틸리티 함수
 * 클라이언트와 서버 모두에서 사용 가능
 */

import { extractFileIdFromUrl, getDriveFileLink } from './google-drive-client';

/**
 * Google Drive URL에서 파일 ID 추출
 * @param url Google Drive URL 또는 파일 ID
 * @returns 파일 ID
 */
export function getDriveFileId(url: string): string | null {
  // 이미 파일 ID인 경우 (짧은 문자열, 특수문자 없음)
  if (/^[a-zA-Z0-9_-]+$/.test(url) && url.length > 10) {
    return url;
  }

  // URL에서 파일 ID 추출
  return extractFileIdFromUrl(url);
}

/**
 * Google Drive 파일 ID로부터 임베드 URL 생성
 * @param fileId Google Drive 파일 ID 또는 URL
 * @returns 임베드 URL
 */
export function getEmbedUrl(fileId: string): string {
  const id = getDriveFileId(fileId);
  if (!id) {
    return fileId; // 파일 ID를 찾을 수 없으면 원본 반환
  }
  return getDriveFileLink(id, 'preview');
}

/**
 * Google Drive 파일 ID로부터 공유 링크 생성
 * @param fileId Google Drive 파일 ID 또는 URL
 * @returns 공유 링크 URL
 */
export function getShareUrl(fileId: string): string {
  const id = getDriveFileId(fileId);
  if (!id) {
    return fileId; // 파일 ID를 찾을 수 없으면 원본 반환
  }
  return getDriveFileLink(id, 'view');
}

/**
 * Video 모델의 url 필드에서 driveFileId 추출
 * @param videoUrl Video 모델의 url 필드 값
 * @returns driveFileId 또는 null
 */
export function extractDriveFileIdFromVideo(videoUrl: string): string | null {
  return getDriveFileId(videoUrl);
}

