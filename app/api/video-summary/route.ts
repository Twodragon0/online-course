import { NextResponse } from "next/server";
import {
  isValidFileId,
  checkRateLimit,
  getClientIp,
} from '@/lib/security';

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
    const rateLimit = checkRateLimit(`video-summary:${clientIp}`, 10, 60000); // 1분에 10회
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

    // DeepSeek API를 사용한 요약 생성 로직...
    return NextResponse.json({
      summary: "생성된 요약 내용...",
      title: "생성된 제목..."
    }, {
      headers: {
        'X-RateLimit-Limit': '10',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
      },
    });

  } catch (error) {
    console.error('Video summary error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: '비디오 요약 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 