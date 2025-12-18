import { NextRequest, NextResponse } from 'next/server';
import { deleteFile } from '@/lib/blob';
import { checkRateLimit, getClientIp } from '@/lib/security';

/**
 * 파일 삭제 API
 * DELETE /api/upload/delete
 */
export async function DELETE(request: NextRequest) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`upload-delete:${clientIp}`, 10, 60000); // 1분에 10회
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

    const body = await request.json();
    const { url } = body;

    // URL 검증
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: '파일 URL이 필요합니다.' },
        { status: 400 }
      );
    }

    // Blob URL 형식 검증
    if (!url.includes('blob.vercel-storage.com')) {
      return NextResponse.json(
        { error: '유효하지 않은 파일 URL입니다.' },
        { status: 400 }
      );
    }

    // 파일 삭제
    const success = await deleteFile(url);

    if (!success) {
      return NextResponse.json(
        { error: '파일 삭제에 실패했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { success: true, message: '파일이 삭제되었습니다.' },
      {
        status: 200,
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );
  } catch (error) {
    console.error('Delete file error:', error instanceof Error ? error.message : 'Unknown error');
    
    // 인증 에러
    if (error instanceof Error && error.message.includes('인증')) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    return NextResponse.json(
      { error: '파일 삭제에 실패했습니다.' },
      { status: 500 }
    );
  }
}




