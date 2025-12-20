/**
 * Google Drive 클라이언트 사이드 유틸리티 함수
 * 서버 전용 모듈 없이 클라이언트에서 사용 가능한 순수 함수들
 */

/**
 * Google Drive 파일 ID로부터 공유 링크 생성
 * @param fileId Google Drive 파일 ID
 * @param type 링크 타입 ('view' | 'preview' | 'download')
 * @returns 공유 링크 URL
 */
export function getDriveFileLink(fileId: string, type: 'view' | 'preview' | 'download' = 'preview'): string {
  const baseUrl = 'https://drive.google.com/file/d';
  
  switch (type) {
    case 'view':
      return `${baseUrl}/${fileId}/view?usp=sharing`;
    case 'preview':
      return `${baseUrl}/${fileId}/preview`;
    case 'download':
      return `${baseUrl}/${fileId}/view?usp=sharing`;
    default:
      return `${baseUrl}/${fileId}/preview`;
  }
}

/**
 * Google Drive URL에서 파일 ID 추출
 * @param url Google Drive URL
 * @returns 파일 ID 또는 null
 */
export function extractFileIdFromUrl(url: string): string | null {
  // 다양한 Google Drive URL 형식 지원
  const patterns = [
    /\/d\/([a-zA-Z0-9_-]+)/, // /d/FILE_ID/view
    /id=([a-zA-Z0-9_-]+)/,   // ?id=FILE_ID
    /folders\/([a-zA-Z0-9_-]+)/, // /folders/FOLDER_ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return null;
}



