import { NextResponse } from "next/server";
import {
  isValidFileId,
  checkRateLimit,
  getClientIp,
  getCached, // Import getCached
} from '@/lib/security';
import { generateChat, isGeminiConfigured } from '@/lib/gemini'; // Assuming AI generation logic is here

type CourseType = 'devsecops' | 'aiSns';

interface Summary {
  title: string;
  content: string;
}

interface SummaryMap {
  [fileId: string]: Summary;
}

interface DefaultSummaries {
  devsecops: SummaryMap;
  aiSns: SummaryMap;
}

const defaultSummaries: DefaultSummaries = {
  devsecops: {
    "1GmOEhnRrBYcgBEVMT25gL8wpZX2hysXC": {
      title: "DevSecOps 보안 자동화 파이프라인 구축",
      content: "이 강의에서는 DevSecOps 보안 자동화 파이프라인 구축 방법을 다룹니다..."
    }
  },
  aiSns: {
    "example2": {
      title: "AI를 활용한 SNS 콘텐츠 제작",
      content: "이 강의에서는 AI 도구를 활용한 SNS 콘텐츠 제작 방법을 다룹니다..."
    }
  }
};

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`video-summary:${clientIp}`, 10, 60000); // 1분에 10회
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
    const { fileId, courseType } = body;

    // 입력 검증
    if (!fileId || typeof fileId !== 'string') {
      return NextResponse.json(
        { error: '파일 ID가 필요합니다.' },
        { status: 400 }
      );
    }

    if (!courseType || typeof courseType !== 'string') {
      return NextResponse.json(
        { error: '코스 타입이 필요합니다.' },
        { status: 400 }
      );
    }

    // 파일 ID 검증
    if (!isValidFileId(fileId)) {
      return NextResponse.json(
        { error: '유효하지 않은 파일 ID입니다.' },
        { status: 400 }
      );
    }

    // 코스 타입 검증
    if (courseType !== 'devsecops' && courseType !== 'aiSns') {
      return NextResponse.json(
        { error: '유효하지 않은 코스 타입입니다.' },
        { status: 400 }
      );
    }

    if (defaultSummaries[courseType] && defaultSummaries[courseType][fileId]) {
      const summary = defaultSummaries[courseType][fileId];
      return NextResponse.json({
        summary: summary.content,
        title: summary.title
      }, {
        headers: {
          'X-RateLimit-Limit': '10',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      });
    }

    // Cache key for AI generated summaries
    const cacheKey = `video-summary:${courseType}:${fileId}`;
    const cachedSummary = await getCached(cacheKey, async () => {
        // --- AI Summary Generation Logic ---
        const useDeepSeek = process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY.startsWith('sk-');
        const useGemini = isGeminiConfigured();

        if (!useDeepSeek && !useGemini) {
            console.error('[Video Summary API] No AI service configured');
            return null; // Return null to indicate failure, not throw
        }

        let aiResponseSummary = "AI가 생성한 요약 내용...";
        let aiResponseTitle = "AI가 생성한 제목...";

        // Placeholder for actual AI call
        if (useDeepSeek) {
            // Example: Call DeepSeek API
            // const deepseekResult = await callDeepSeekForSummary(fileId, courseType);
            // aiResponseSummary = deepseekResult.summary;
            // aiResponseTitle = deepseekResult.title;
        } else if (useGemini) {
            // Example: Call Gemini API
            // const geminiResult = await callGeminiForSummary(fileId, courseType);
            // aiResponseSummary = geminiResult.summary;
            // aiResponseTitle = geminiResult.title;
        }

        return { summary: aiResponseSummary, title: aiResponseTitle };
    }, 86400); // Cache for 24 hours (can be adjusted)

    if (cachedSummary && cachedSummary.summary && cachedSummary.title) {
        return NextResponse.json({
            summary: cachedSummary.summary,
            title: cachedSummary.title
        }, {
            headers: {
                'X-RateLimit-Limit': '10',
                'X-RateLimit-Remaining': rateLimit.remaining.toString(),
                'Cache-Control': 'public, s-maxage=86400', // Cache control header for Vercel
            },
        });
    } else {
        // Fallback or error if AI generation failed and no cache
        return NextResponse.json(
            { error: '비디오 요약 생성에 실패했습니다. AI 서비스가 구성되지 않았거나 응답이 없습니다.' },
            { status: 500 }
        );
    }

  } catch (error) {
    console.error('Video summary error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: '비디오 요약 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 