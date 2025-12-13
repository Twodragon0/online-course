import { NextRequest, NextResponse } from 'next/server';
import { uploadFile, isValidFileExtension, isValidFileSize, isValidContentType } from '@/lib/blob';
import { checkRateLimit, getClientIp } from '@/lib/security';

/**
 * 파일 업로드 API
 * POST /api/upload
 */
export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`upload:${clientIp}`, 10, 60000); // 1분에 10회
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '10',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          },
        }
      );
    }

    // FormData 파싱
    const formData = await request.formData();
    const file = formData.get('file') as File | null;
    const folder = formData.get('folder') as string | null; // 'courses', 'users', 'pdfs' 등

    // 파일 검증
    if (!file) {
      return NextResponse.json(
        { error: '파일이 필요합니다.' },
        { status: 400 }
      );
    }

    // 파일명 검증
    if (!file.name || file.name.trim().length === 0) {
      return NextResponse.json(
        { error: '유효하지 않은 파일명입니다.' },
        { status: 400 }
      );
    }

    // 파일 확장자 검증
    if (!isValidFileExtension(file.name)) {
      return NextResponse.json(
        { error: '허용되지 않은 파일 형식입니다. PDF, JPG, PNG, GIF, WEBP만 업로드 가능합니다.' },
        { status: 400 }
      );
    }

    // 파일 크기 검증 (최대 10MB)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (!isValidFileSize(file.size, maxSize)) {
      return NextResponse.json(
        { error: `파일 크기는 최대 ${maxSize / 1024 / 1024}MB까지 허용됩니다.` },
        { status: 400 }
      );
    }

    // MIME 타입 검증
    if (!isValidContentType(file.type)) {
      return NextResponse.json(
        { error: '허용되지 않은 파일 타입입니다.' },
        { status: 400 }
      );
    }

    // 파일 데이터 읽기
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // 파일명 생성 (폴더 포함)
    const timestamp = Date.now();
    const sanitizedFolder = folder ? `${folder}/` : '';
    const filename = `${sanitizedFolder}${timestamp}-${file.name}`;

    // 파일 업로드
    const result = await uploadFile(filename, buffer, {
      access: 'public',
      contentType: file.type,
      addRandomSuffix: true,
    });

    return NextResponse.json(
      {
        success: true,
        url: result.url,
        pathname: result.pathname,
        size: result.size,
        contentType: result.contentType,
      },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Upload error:', error instanceof Error ? error.message : 'Unknown error');
    
    // 인증 에러
    if (error instanceof Error && error.message.includes('인증')) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: '파일 업로드에 실패했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 파일 목록 조회 API
 * GET /api/upload?prefix=courses/
 */
export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`upload-list:${clientIp}`, 30, 60000); // 1분에 30회
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '30',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || undefined;
    const limit = parseInt(searchParams.get('limit') || '100', 10);

    const { listBlobFiles } = await import('@/lib/blob');
    const files = await listBlobFiles(prefix, Math.min(limit, 100));

    return NextResponse.json(
      { files },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': '30',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error('List files error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: '파일 목록을 가져오는데 실패했습니다.' },
      { status: 500 }
    );
  }
}

