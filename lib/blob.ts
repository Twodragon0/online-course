/**
 * Vercel Blob Storage 유틸리티
 * 파일 업로드, 다운로드, 삭제 기능 제공
 */

import { put, head, del, list } from '@vercel/blob';
import { getServerSession } from 'next-auth/next';

/**
 * 파일 업로드 옵션
 */
export interface UploadOptions {
  contentType?: string;
  addRandomSuffix?: boolean;
  cacheControlMaxAge?: number;
}

/**
 * 파일 업로드 결과
 */
export interface UploadResult {
  url: string;
  pathname: string;
  contentType?: string;
  contentDisposition?: string;
  size: number;
  uploadedAt: Date;
}

/**
 * 파일 업로드 (인증 필요)
 * @param filename 파일명
 * @param data 파일 데이터 (Blob, Buffer, 또는 string)
 * @param options 업로드 옵션
 * @returns 업로드 결과
 */
export async function uploadFile(
  filename: string,
  data: Blob | Buffer | string,
  options: UploadOptions = {}
): Promise<UploadResult> {
  try {
    // 세션 확인 (인증 필요)
    const session = await getServerSession();
    if (!session?.user?.email) {
      throw new Error('인증이 필요합니다.');
    }

    // 파일명 검증
    if (!filename || filename.trim().length === 0) {
      throw new Error('파일명이 필요합니다.');
    }

    // 파일명 sanitization (보안)
    const sanitizedFilename = sanitizeFilename(filename);

    // 기본 옵션 설정 (access는 항상 'public')
    const uploadOptions = {
      access: 'public' as const,
      addRandomSuffix: true,
      contentType: options.contentType,
      cacheControlMaxAge: options.cacheControlMaxAge,
    };

    // 파일 업로드
    const blob = await put(sanitizedFilename, data, uploadOptions);

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      contentDisposition: blob.contentDisposition,
      size: blob.size ?? 0,
      uploadedAt: blob.uploadedAt ?? new Date(),
    };
  } catch (error) {
    console.error('File upload error:', error);
    throw error;
  }
}

/**
 * 파일 정보 조회
 * @param url Blob URL
 * @returns 파일 정보
 */
export async function getFileInfo(url: string): Promise<UploadResult | null> {
  try {
    const blob = await head(url);
    if (!blob) {
      return null;
    }

    return {
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      contentDisposition: blob.contentDisposition,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    };
  } catch (error) {
    console.error('Get file info error:', error);
    return null;
  }
}

/**
 * 파일 삭제
 * @param url Blob URL
 * @returns 삭제 성공 여부
 */
export async function deleteFile(url: string): Promise<boolean> {
  try {
    // 세션 확인 (인증 필요)
    const session = await getServerSession();
    if (!session?.user?.email) {
      throw new Error('인증이 필요합니다.');
    }

    await del(url);
    return true;
  } catch (error) {
    console.error('File delete error:', error);
    return false;
  }
}

/**
 * 파일 목록 조회
 * @param prefix 경로 prefix (예: 'courses/', 'users/')
 * @param limit 최대 개수
 * @returns 파일 목록
 */
export async function listBlobFiles(
  prefix?: string,
  limit: number = 100
): Promise<UploadResult[]> {
  try {
    const { blobs } = await list({
      prefix,
      limit,
    });

    return blobs.map((blob) => ({
      url: blob.url,
      pathname: blob.pathname,
      contentType: blob.contentType,
      contentDisposition: blob.contentDisposition,
      size: blob.size,
      uploadedAt: blob.uploadedAt,
    }));
  } catch (error) {
    console.error('List files error:', error);
    return [];
  }
}

/**
 * 파일명 sanitization (보안)
 * @param filename 원본 파일명
 * @returns sanitized 파일명
 */
function sanitizeFilename(filename: string): string {
  // 경로 탐색 공격 방지
  let sanitized = filename
    .replace(/\.\./g, '') // 상위 디렉토리 탐색 방지
    .replace(/\//g, '-') // 슬래시 제거
    .replace(/\\/g, '-') // 백슬래시 제거
    .trim();

  // 파일명 길이 제한
  if (sanitized.length > 255) {
    const ext = sanitized.substring(sanitized.lastIndexOf('.'));
    sanitized = sanitized.substring(0, 255 - ext.length) + ext;
  }

  // 빈 파일명 방지
  if (sanitized.length === 0) {
    sanitized = 'file';
  }

  return sanitized;
}

/**
 * 파일 확장자 검증
 * @param filename 파일명
 * @param allowedExtensions 허용된 확장자 목록
 * @returns 허용 여부
 */
export function isValidFileExtension(
  filename: string,
  allowedExtensions: string[] = ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp']
): boolean {
  const ext = filename.toLowerCase().split('.').pop();
  if (!ext) {
    return false;
  }
  return allowedExtensions.includes(ext);
}

/**
 * 파일 크기 검증
 * @param size 파일 크기 (bytes)
 * @param maxSize 최대 크기 (bytes, 기본 10MB)
 * @returns 허용 여부
 */
export function isValidFileSize(size: number, maxSize: number = 10 * 1024 * 1024): boolean {
  return size > 0 && size <= maxSize;
}

/**
 * MIME 타입 검증
 * @param contentType MIME 타입
 * @param allowedTypes 허용된 MIME 타입 목록
 * @returns 허용 여부
 */
export function isValidContentType(
  contentType: string,
  allowedTypes: string[] = [
    'application/pdf',
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
  ]
): boolean {
  return allowedTypes.includes(contentType.toLowerCase());
}

