import { NextResponse } from "next/server";
import prisma from '@/lib/prisma';

// Set a specific runtime config for Vercel
export const runtime = 'nodejs'; // 'edge' | 'nodejs'
export const maxDuration = 30; // This is in seconds, only works on pro plans for > 10s

// API 요청에 타임아웃 설정을 추가하는 함수
async function fetchWithTimeout(url: string, options: RequestInit, timeout = 8000) {
  // AbortController를 사용하여 요청 타임아웃 구현
  const controller = new AbortController();
  const { signal } = controller;
  
  // 타임아웃 설정
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error: any) {
    clearTimeout(timeoutId);
    
    if (error.name === 'AbortError') {
      throw new Error('요청 시간이 초과되었습니다.');
    }
    
    throw error;
  }
}

// 기본 질문 생성 함수
function getDefaultQuestions() {
  return [
    "💡 이 주제와 관련된 실제 사례가 궁금합니다.",
    "🔍 더 자세한 기술적인 내용이 알고 싶습니다."
  ];
}

export async function POST(req: Request) {
  try {
    const { response } = await req.json();
    
    // 컨텍스트 기반 동적 질문 생성
    const generateDynamicQuestions = (content: string): string[] => {
      const context = content.toLowerCase();
      const questions: string[] = [];

      // DevSecOps 관련 응답일 경우
      if (context.includes('devsecops') || context.includes('보안')) {
        if (context.includes('파이프라인') || context.includes('ci/cd')) {
          questions.push("🔄 파이프라인에 어떤 보안 테스트들을 추가하면 좋을까요?");
        }
        if (context.includes('컨테이너') || context.includes('docker')) {
          questions.push("🐳 컨테이너 보안을 강화하는 구체적인 방법이 궁금합니다.");
        }
        if (context.includes('모니터링') || context.includes('로깅')) {
          questions.push("📊 보안 모니터링 대시보드는 어떻게 구성하나요?");
        }
        if (context.includes('취약점') || context.includes('스캔')) {
          questions.push("🔍 취약점 스캔 결과는 어떻게 관리하고 대응하나요?");
        }
        if (context.includes('자동화') || context.includes('도구')) {
          questions.push("⚡ 보안 자동화를 위한 추천 도구가 궁금합니다.");
        }
      }

      // AI/SNS 관련 응답일 경우
      if (context.includes('ai') || context.includes('sns')) {
        if (context.includes('이미지') || context.includes('생성')) {
          questions.push("🎨 AI로 생성한 이미지의 품질을 높이는 팁이 있을까요?");
        }
        if (context.includes('콘텐츠') || context.includes('최적화')) {
          questions.push("📱 플랫폼별 콘텐츠 최적화 전략이 궁금합니다.");
        }
        if (context.includes('자동화') || context.includes('워크플로우')) {
          questions.push("⚡ 콘텐츠 제작 자동화 워크플로우를 설명해주세요.");
        }
        if (context.includes('성과') || context.includes('분석')) {
          questions.push("📈 AI 기반 콘텐츠 성과 분석 방법을 알려주세요.");
        }
        if (context.includes('도구') || context.includes('툴')) {
          questions.push("🛠️ 추천하는 AI 도구와 활용 사례가 궁금합니다.");
        }
      }

      // 학습/커리큘럼 관련 응답일 경우
      if (context.includes('학습') || context.includes('커리큘럼')) {
        if (context.includes('로드맵') || context.includes('과정')) {
          questions.push("📚 단계별 학습 로드맵을 자세히 설명해주세요.");
        }
        if (context.includes('실무') || context.includes('실전')) {
          questions.push("💼 실무에서 가장 중요한 스킬은 무엇인가요?");
        }
        if (context.includes('도구') || context.includes('환경')) {
          questions.push("🔧 학습에 필요한 개발 환경 구성 방법이 궁금합니다.");
        }
      }

      // 코스 관련 질문 패턴 추가
      if (context.includes('devsecops') && context.includes('코스')) {
        if (context.includes('실습') || context.includes('과제')) {
          questions.push("💻 실습 환경 구성은 어떻게 진행되나요?");
        }
        if (context.includes('평가') || context.includes('프로젝트')) {
          questions.push("📝 프로젝트 평가 기준이 궁금합니다.");
        }
        if (context.includes('기간') || context.includes('일정')) {
          questions.push("📅 각 주차별 학습 시간은 어떻게 되나요?");
        }
        if (context.includes('환경') || context.includes('준비')) {
          questions.push("🔧 수강 전 필요한 사전 지식이나 준비사항이 있나요?");
        }
        if (context.includes('취업') || context.includes('커리어')) {
          questions.push("💼 과정 수료 후 취업 지원이 있나요?");
        }
      }

      return questions;
    };

    // 패턴 매칭만 수행하여 질문 생성
    const patternQuestions = generateDynamicQuestions(response);
    
    // 패턴 매칭으로 충분한 질문이 생성되면 바로 반환
    if (patternQuestions.length >= 2) {
      return NextResponse.json({ questions: patternQuestions.slice(0, 2) });
    }

    // 패턴 매칭으로 충분한 질문이 생성되지 않은 경우에만 DeepSeek API 호출 시도
    // 매우 짧은 타임아웃으로 시도하고, 실패하면 기본 질문 반환
    try {
      // DeepSeek API를 통한 질문 생성 (간소화된 버전)
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        // API 키가 없으면 기본 질문 + 패턴 질문으로 응답
        const finalQuestions = [...patternQuestions, ...getDefaultQuestions()].slice(0, 2);
        return NextResponse.json({ questions: finalQuestions });
      }

      // 간소화된 프롬프트
      const shortPrompt = `답변 내용을 바탕으로 후속 질문 2개 생성 (이모지로 시작, 실무적, 구체적, 물음표 끝):\n${response.substring(0, 300)}`;

      // 매우 짧은 타임아웃으로 API 호출
      const promptPromise = fetchWithTimeout(
        'https://api.deepseek.com/v1/chat/completions',
        {
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
                content: "당신은 전문적인 질문 생성 도우미입니다."
              },
              {
                role: "user",
                content: shortPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 100,
            timeout: 5
          })
        },
        8000 // 8초 타임아웃
      );

      // 6초 후에는 기본값으로 응답하도록 경쟁
      const deepseekResponse = await Promise.race([
        promptPromise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 6000))
      ]);

      // API 응답이 없으면 기본 질문 사용
      if (!deepseekResponse) {
        throw new Error('DeepSeek API timeout');
      }

      // API 응답이 있고 성공적인 경우
      if (deepseekResponse.ok) {
        const result = await deepseekResponse.json();
        const content = result.choices[0]?.message?.content;
        
        if (content) {
          const generatedQuestions = content
            .split('\n')
            .filter((q: string) => q.trim() && q.includes('?'))
            .slice(0, 2);
          
          if (generatedQuestions.length > 0) {
            const combinedQuestions = [...patternQuestions, ...generatedQuestions];
            const uniqueQuestions = Array.from(new Set(combinedQuestions));
            return NextResponse.json({ 
              questions: uniqueQuestions.slice(0, 2),
              source: "ai" 
            });
          }
        }
      }
      
      // API 응답 처리 중 문제가 있으면 기본 질문 사용
      throw new Error('Invalid DeepSeek API response');
      
    } catch (error) {
      // 오류 발생 시 패턴 질문 + 기본 질문 사용
      const fallbackQuestions = [...patternQuestions, ...getDefaultQuestions()].slice(0, 2);
      return NextResponse.json({ 
        questions: fallbackQuestions, 
        fallback: true,
        source: "pattern" 
      });
    }

  } catch (error) {
    console.error('Error generating related questions:', error);
    return NextResponse.json({
      questions: getDefaultQuestions(),
      fallback: true,
      source: "default"
    });
  }
} 