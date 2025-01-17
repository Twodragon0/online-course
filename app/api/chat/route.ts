import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';

const courseContent = {
  devsecops: {
    overview: `🎓 DevSecOps & 클라우드 보안 온라인 코스

📌 과정 개요:
• 대상: 보안관제/CERT 경험자 (기본 네트워크 보안 지식 필요)
• 목표: 클라우드 보안 기초 및 실무 역량 강화
• 기간: 9주 과정
• 실습: AWS, Azure, GCP 클라우드 환경 제공

💡 주요 학습 내용:
1. 클라우드 보안 기초 및 아키텍처
2. AWS, Azure, GCP 보안 설정
3. 컨테이너 보안 및 DevSecOps 구현
4. CI/CD 파이프라인 보안 통합

⚡ 차별화 포인트:
• 실무 중심의 hands-on 실습
• 3대 주요 클라우드 플랫폼 학습
• DevSecOps 파이프라인 구축 경험`,

    details: {
      week1_3: `🔰 1-3주차: 클라우드 보안 기초
- 클라우드 전환 배경 및 보안 개념
- AWS EC2, S3, Security Group 실습
- Azure, GCP 보안 기초`,

      week4_5: `🛡️ 4-5주차: 보안 모니터링 및 정책
- 클라우드 로그 수집 및 분석
- CSPM, CWPP 구현
- DevSecOps 기초`,

      week6_8: `🐳 6-8주차: 컨테이너 보안
- Docker와 Kubernetes 보안
- 컨테이너 네트워크 보안
- 클러스터 보안 설정`,

      week9: `⚡ 9주차: CI/CD 보안 통합
- GitLab, Jenkins 보안 설정
- 파이프라인 보안 자동화
- 실전 프로젝트 수행`
    },
    resources: {
      videos: [
        {
          url: "https://drive.google.com/file/d/1GmOEhnRrBYcgBEVMT25gL8wpZX2hysXC/view",
          title: "DevSecOps 과정 소개",
          summary: "클라우드 보안과 DevSecOps 기초 학습"
        },
        {
          url: "https://drive.google.com/file/d/example1/view",
          title: "AWS 보안 실습",
          summary: "AWS 클라우드 환경의 보안 설정 실습"
        }
      ],
      document: {
        url: "https://drive.google.com/file/d/1GphNKefbdBTz-92Mlvl2xQ9bo_tJABTN/view",
        title: "커리큘럼 상세 자료"
      }
    }
  },
  aiSns: {
    resources: {
      videos: [
        {
          url: "https://drive.google.com/file/d/example2/view",
          title: "AI 기반 SNS 콘텐츠 제작",
          summary: "AI 도구를 활용한 콘텐츠 최적화"
        },
        {
          url: "https://drive.google.com/file/d/example3/view",
          title: "SNS 성과 분석",
          summary: "AI 기반 데이터 분석 및 인사이트 도출"
        }
      ],
      document: {
        url: "https://drive.google.com/file/d/example4/view",
        title: "AI SNS 마케팅 가이드"
      }
    }
  }
};

// 시스템 프롬프트 업데이트
const systemPrompt = `당신은 DevSecOps와 AI 전문가입니다. 다음 규칙을 따라 답변해주세요:
1. 코스 관련 질문인 경우:
   ${courseContent.devsecops.overview}
2. 코드 블록 형식:
   - 언어 표시 필수: \`\`\`python, \`\`\`yaml, \`\`\`shell 등
   - 들여쓰기 유지
   - 주석 추가 권장

3. 답변 형식:
   - 섹션별 이모지 사용
   - 실무 예시 포함
   - URL은 파란색 링크로 표시

4. 주차별 상세 내용:
   ${Object.values(courseContent.devsecops.details).join('\n   ')}`;

// 기본 응답에 코스 정보 추가
const defaultResponses = {
  'course_info': courseContent.devsecops.overview,
  'learning_resources': `🎓 학습 자료 추천

🛠️ DevSecOps 관련 유용한 YouTube 채널
1. [Cloud Security by AWS](https://www.youtube.com/aws) - 클라우드 보안과 관련된 최신 트렌드와 도구 소개
2. [DevOps Journey](https://www.youtube.com/c/DevOpsJourney) - CI/CD 파이프라인 보안 전략
3. [TechWorld with Nana](https://www.youtube.com/c/TechWorldwithNana) - Jenkins, Kubernetes 보안 자동화

🤖 AI 관련 유용한 YouTube 채널
1. [Weights & Biases](https://www.youtube.com/c/WeightsBiases) - MLOps와 AI 모델 배포
2. [AI Engineering](https://www.youtube.com/c/AIEngineeringLife) - AI 시스템 보안과 최적화
3. [DeepLearning.AI](https://www.youtube.com/c/Deeplearningai) - 실시간 AI 모델 통합

📚 추천 학습 플랫폼
1. [Coursera DevSecOps 과정](https://www.coursera.org/search?query=devsecops)
2. [Udemy 보안 자동화 강좌](https://www.udemy.com/topic/devsecops/)
3. [edX Cloud Security 과정](https://www.edx.org/search?q=cloud+security)

💬 커뮤니티 및 포럼
1. [DevSecOps Stack Overflow](https://stackoverflow.com/questions/tagged/devsecops)
2. [Reddit DevSecOps](https://www.reddit.com/r/devsecops/)
3. [DevSecOps GitHub Discussions](https://github.com/topics/devsecops)`
};

// 이전 대화 로그에서 관련 답변 검색
async function findRelevantResponses(message: string) {
  try {
    const keywords = message.split(' ').filter(word => word.length > 1);
    const relevantLogs = await prisma.chatLog.findMany({
      where: {
        OR: [
          { message: { contains: keywords[0], mode: 'insensitive' } },
          { response: { contains: keywords[0], mode: 'insensitive' } }
        ]
      },
      orderBy: { timestamp: 'desc' },
      take: 5
    });
    return relevantLogs;
  } catch (error) {
    console.error('Error finding relevant responses:', error);
    return [];
  }
}

export async function POST(req: Request) {
  try {
    const { message, category, sessionId } = await req.json();

    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('DeepSeek API key is not configured');
    }

    // 관련 이전 대화 검색
    const relevantResponses = await findRelevantResponses(message);
    const contextMessages = relevantResponses.map(log => ({
      role: "assistant" as const,
      content: log.response
    }));

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
            content: systemPrompt
          },
          ...contextMessages, // 이전 관련 대화 컨텍스트 추가
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.3,
        max_tokens: 800,
        top_p: 0.9,
        frequency_penalty: 0.3,
        presence_penalty: 0.3,
        stream: false
      })
    });

    if (!deepseekResponse.ok) {
      throw new Error('API error');
    }

    const aiResponse = await deepseekResponse.json();
    const response = aiResponse.choices[0]?.message?.content || '';

    // 응답 개선을 위한 후처리
    const enhancedResponse = response
      .replace(/###/g, '') // 마크다운 헤더 제거
      .replace(/\*\*/g, '') // bold 마크다운 제거
      .trim();

    // Prisma 로그 저장
    try {
      await prisma.chatLog.create({
        data: {
          sessionId,
          message,
          response: enhancedResponse,
          category,
          timestamp: new Date(),
        },
      });
    } catch (logError) {
      console.error('Error saving chat log:', logError);
    }

    return NextResponse.json({ response: enhancedResponse });

  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json({
      response: `🔧 죄송합니다. 일시적인 오류가 발생했습니다. 다시 시도해 주세요.

🔍 문의하신 내용에 대해 다음과 같은 기본 정보를 제공해 드립니다:

- DevSecOps: 보안 자동화 및 파이프라인 구축
- AI 기술: 실용적인 응용 및 구현 방법
- 학습 로드맵: 단계별 실습 가이드

자세한 내용은 다시 질문해 주시면 답변 드리겠습니다.`
    });
  }
} 