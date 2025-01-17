import { NextResponse } from "next/server";

const defaultSummaries = {
  devsecops: {
    "1GmOEhnRrBYcgBEVMT25gL8wpZX2hysXC": {
      title: "클라우드 보안과 DevSecOps의 완벽한 시작",
      content: `📝 제목: [강의 소개] 클라우드 보안 전문가로 가는 첫걸음: DevSecOps 마스터 과정

🎯 TL;DR
• AWS, Azure, GCP를 아우르는 종합적인 클라우드 보안 과정
• 실무 프로젝트로 배우는 DevSecOps 파이프라인 구축
• 9주 과정으로 설계된 체계적인 커리큘럼

💡 주요 학습 포인트
• 클라우드 보안의 핵심 개념과 아키텍처 이해
• 3대 클라우드 플랫폼의 보안 설정 실습
• 컨테이너 보안과 CI/CD 파이프라인 통합
• DevSecOps 자동화 도구 활용 방법

🔧 실무 적용 꿀팁
• 실제 기업 환경에서 사용되는 보안 도구 실습
• 클라우드 환경별 보안 설정 자동화 방법
• 보안 취약점 자동 진단 및 대응 프로세스

📚 추천 학습 키워드
#CloudSecurity #DevSecOps #AWS #Azure #GCP #컨테이너보안 #CI/CD #보안자동화

⭐ 다음 추천 강의
• AWS 클라우드 보안 심화 과정
• 컨테이너 보안 마스터 클래스
• DevSecOps 파이프라인 구축 실습`
    }
  },
  aiSns: {
    "example2": {
      title: "AI 기반 SNS 콘텐츠 최적화 마스터",
      content: `📝 제목: [강의 소개] AI로 시작하는 SNS 마케팅 혁신: 콘텐츠 제작부터 성과 분석까지

�� TL;DR
• AI 도구를 활용한 효율적인 SNS 콘텐츠 제작
• 데이터 기반 콘텐츠 최적화 전략
• 실전 사례로 배우는 AI 마케팅

💡 주요 학습 포인트
• AI 이미지 생성 도구 활용 (Midjourney, DALL-E)
• AI 작문 도구를 통한 콘텐츠 제작
• 콘텐츠 성과 분석 및 최적화
• 자동화된 포스팅 전략

🔧 실무 적용 꿀팁
• 플랫폼별 최적화된 콘텐츠 제작 방법
• AI 도구를 활용한 제작 시간 단축
• 데이터 기반 콘텐츠 개선 전략

📚 추천 학습 키워드
#AI마케팅 #SNS최적화 #콘텐츠제작 #Midjourney #ChatGPT #성과분석

⭐ 다음 추천 강의
• AI 콘텐츠 제작 심화 과정
• SNS 마케팅 데이터 분석
• AI 크리에이티브 디자인 실습`
    }
  }
};

export async function POST(req: Request) {
  try {
    const { videoId, courseType } = await req.json();
    const apiKey = process.env.DEEPSEEK_API_KEY;

    if (!apiKey) {
      throw new Error('DeepSeek API key is not configured');
    }

    // 파일 ID 추출
    const fileId = videoId.split('/d/')[1]?.split('/')[0];
    
    // 기본 요약 정보가 있는 경우 반환
    if (defaultSummaries[courseType]?.[fileId]) {
      return NextResponse.json({
        summary: defaultSummaries[courseType][fileId].content,
        title: defaultSummaries[courseType][fileId].title
      });
    }

    const prompt = `다음 강의 영상의 내용을 SNS 포스팅 형태로 요약해주세요:
    강의: ${courseType === 'devsecops' ? 'DevSecOps 보안 과정' : 'AI 활용 SNS 마케팅 과정'}
    영상 ID: ${videoId}

    포스팅 형식:
    📝 제목: (흥미를 끌 수 있는 제목)

    🎯 TL;DR
    (핵심 내용 2-3줄 요약)

    💡 주요 학습 포인트
    • (bullet point 3-4개)

    🔧 실무 적용 꿀팁
    • (2-3개 실용적인 팁)

    📚 추천 학습 키워드
    #키워드1 #키워드2 #키워드3

    ⭐ 다음 추천 강의
    (다음 단계 학습 추천)`;

    const deepseekResponse = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: "당신은 전문적인 강의 요약 전문가입니다. 강의 내용을 명확하고 실용적으로 요약해주세요."
          },
          {
            role: "user",
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 800
      })
    });

    if (!deepseekResponse.ok) {
      throw new Error('DeepSeek API error');
    }

    const result = await deepseekResponse.json();
    const summary = result.choices[0]?.message?.content || '';

    return NextResponse.json({ 
      summary,
      title: summary.split('\n')[0].replace('📝 제목: ', '').trim()
    });

  } catch (error) {
    console.error('Video summary error:', error);
    return NextResponse.json(
      { error: '영상 요약 생성에 실패했습니다.' },
      { status: 500 }
    );
  }
} 