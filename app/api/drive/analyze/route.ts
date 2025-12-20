import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { checkRateLimit, getClientIp, isValidMessage, sanitizeInput } from '@/lib/security';
import { getDriveService } from '@/lib/google-drive';
import { generateText, isGeminiConfigured } from '@/lib/gemini';
import { google } from 'googleapis';

/**
 * Google Drive 파일 분석 API
 * Gemini API를 사용하여 Google Drive 파일의 내용을 분석합니다.
 */
export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`drive-analyze:${clientIp}`, 10, 60000); // 1분에 10회
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        { status: 429 }
      );
    }

    // 인증 확인
    const session = await getServerSession();
    if (!session?.user) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // Gemini API 확인
    if (!isGeminiConfigured()) {
      return NextResponse.json(
        { error: 'Gemini API가 설정되지 않았습니다.' },
        { status: 503 }
      );
    }

    const body = await request.json();
    const { fileId, prompt: rawPrompt } = body;

    // 입력 검증
    if (!fileId || typeof fileId !== 'string') {
      return NextResponse.json(
        { error: '파일 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!rawPrompt) {
      return NextResponse.json(
        { error: '분석 프롬프트가 필요합니다.' },
        { status: 400 }
      );
    }

    const promptValidation = isValidMessage(rawPrompt, 1000);
    if (!promptValidation.valid) {
      return NextResponse.json(
        { error: promptValidation.error },
        { status: 400 }
      );
    }

    const prompt = sanitizeInput(rawPrompt);

    // Google Drive 서비스 가져오기
    const drive = await getDriveService();

    // 파일 정보 가져오기
    const fileResponse = await drive.files.get({
      fileId,
      fields: 'id, name, mimeType, size',
      supportsAllDrives: true,
    });

    const file = fileResponse.data;
    if (!file) {
      return NextResponse.json(
        { error: '파일을 찾을 수 없습니다.' },
        { status: 404 }
      );
    }

    // 텍스트 파일인 경우 내용 가져오기
    let fileContent = '';
    const mimeType = file.mimeType || '';

    if (mimeType.startsWith('text/') || 
        mimeType === 'application/json' ||
        mimeType === 'application/pdf' ||
        mimeType.includes('document')) {
      try {
        // Google Docs 파일인 경우
        if (mimeType.includes('document')) {
          const exportResponse = await drive.files.export({
            fileId,
            mimeType: 'text/plain',
          }, { responseType: 'text' });
          fileContent = exportResponse.data as string;
        } else {
          // 일반 텍스트 파일
          const contentResponse = await drive.files.get({
            fileId,
            alt: 'media',
          }, { responseType: 'text' });
          fileContent = contentResponse.data as string;
        }

        // 내용이 너무 길면 잘라내기 (비용 절감)
        if (fileContent.length > 50000) {
          fileContent = fileContent.substring(0, 50000) + '\n\n... (내용이 길어 일부만 분석합니다)';
        }
      } catch (error) {
        console.error('Error reading file content:', error);
        // 파일 내용을 읽을 수 없어도 파일 정보만으로 분석 시도
        fileContent = `파일명: ${file.name}\n파일 크기: ${file.size} bytes\nMIME 타입: ${mimeType}`;
      }
    } else {
      // 비텍스트 파일인 경우 파일 정보만 제공
      fileContent = `파일명: ${file.name}\n파일 크기: ${file.size} bytes\nMIME 타입: ${mimeType}\n\n이 파일은 텍스트 형식이 아니므로 내용 분석이 제한적입니다.`;
    }

    // Gemini를 사용한 분석
    const analysisPrompt = `
다음 Google Drive 파일을 분석해주세요.

파일 정보:
- 파일명: ${file.name}
- 파일 ID: ${fileId}
- MIME 타입: ${mimeType}

파일 내용:
${fileContent}

사용자 요청: ${prompt}

파일 내용을 분석하고 요청에 맞는 답변을 제공해주세요. 한국어로 답변해주세요.
`;

    const analysis = await generateText(analysisPrompt, 'gemini-pro', {
      temperature: 0.5,
      maxTokens: 2000,
      cache: true,
      cacheKey: `drive-analyze:${fileId}:${prompt.substring(0, 50)}`,
    });

    return NextResponse.json({
      success: true,
      file: {
        id: file.id,
        name: file.name,
        mimeType: mimeType,
        size: file.size,
      },
      analysis: sanitizeInput(analysis),
      provider: 'gemini',
    }, {
      headers: {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      },
    });
  } catch (error) {
    console.error('Drive analyze error:', error);
    return NextResponse.json(
      {
        error: '파일 분석 중 오류가 발생했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}



