import { NextResponse } from "next/server";

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
    const { fileId, courseType } = await request.json() as { fileId: string; courseType: CourseType };

    if (!fileId || !courseType) {
      return NextResponse.json(
        { error: 'Missing required parameters' },
        { status: 400 }
      );
    }

    if (courseType !== 'devsecops' && courseType !== 'aiSns') {
      return NextResponse.json(
        { error: 'Invalid course type' },
        { status: 400 }
      );
    }

    if (defaultSummaries[courseType] && defaultSummaries[courseType][fileId]) {
      const summary = defaultSummaries[courseType][fileId];
      return NextResponse.json({
        summary: summary.content,
        title: summary.title
      });
    }

    // DeepSeek API를 사용한 요약 생성 로직...
    return NextResponse.json({
      summary: "생성된 요약 내용...",
      title: "생성된 제목..."
    });

  } catch (error) {
    console.error('Video summary error:', error);
    return NextResponse.json(
      { error: 'Failed to generate video summary' },
      { status: 500 }
    );
  }
} 