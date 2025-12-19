import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import {
  checkRateLimit,
  getClientIp,
  isValidMessage,
  sanitizeInput,
} from '@/lib/security';

export async function POST(req: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIp(req);
    const rateLimit = await checkRateLimit(`related-questions:${clientIp}`, 20, 60000); // 1분에 20회
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          },
        }
      );
    }

    const body = await req.json();
    const { response: rawResponse } = body;

    // 입력 검증
    if (!rawResponse || typeof rawResponse !== 'string') {
      return NextResponse.json(
        { error: '응답 내용이 필요합니다.' },
        { status: 400 }
      );
    }

    // 메시지 검증
    const responseValidation = isValidMessage(rawResponse, 10000); // 최대 10000자
    if (!responseValidation.valid) {
      return NextResponse.json(
        { error: responseValidation.error },
        { status: 400 }
      );
    }

    // 응답 내용 sanitization (XSS 방지)
    const response = sanitizeInput(rawResponse);
    
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

    // 질문 중복 제거 함수 (정교한 버전)
    const removeDuplicateQuestions = (questions: string[]): string[] => {
      const seen = new Set<string>();
      const normalizedQuestions: string[] = [];
      
      for (const question of questions) {
        // 이모지 제거 후 정규화
        const normalized = question
          .replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, '') // 이모지 제거 (서로게이트 페어)
          .replace(/[🔹🔄🐳📊🔍⚡💡🎨📱🛠️💼📚🔧📝📅]/g, '') // 특정 이모지 제거
          .trim()
          .toLowerCase()
          .replace(/\s+/g, ' '); // 공백 정규화
        
        // 유사한 질문이 이미 있는지 확인 (단어 기반)
        const words = normalized.split(' ').filter(w => w.length > 2);
        const isDuplicate = normalizedQuestions.some(existing => {
          const existingWords = existing
            .replace(/[\uD83C-\uDBFF\uDC00-\uDFFF]+/g, '') // 이모지 제거
            .trim()
            .toLowerCase()
            .split(' ')
            .filter(w => w.length > 2);
          
          // 공통 단어가 50% 이상이면 중복으로 간주
          const commonWords = words.filter(w => existingWords.includes(w));
          return commonWords.length / Math.max(words.length, existingWords.length) > 0.5;
        });
        
        if (!isDuplicate && normalized.length > 10) {
          normalizedQuestions.push(question);
          seen.add(normalized);
        }
      }
      
      return normalizedQuestions;
    };

    // DeepSeek API를 통한 질문 생성
    const generateDeepSeekQuestions = async (content: string, existingQuestions: string[] = []): Promise<string[]> => {
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey || apiKey.trim().length === 0) {
        console.error('DeepSeek API key is not configured');
        return [];
      }

      // 기존 질문을 피하기 위한 컨텍스트
      const existingContext = existingQuestions.length > 0 
        ? `\n\n다음 질문들과는 다른 새로운 질문을 생성해주세요:\n${existingQuestions.map(q => `- ${q}`).join('\n')}`
        : '';

      const prompt = `다음 답변에 대한 적절한 후속 질문 2개를 생성해주세요. 
      질문은 실무적이고 구체적이어야 하며, 서로 다른 관점에서 접근해야 합니다.
      
      답변 내용:
      ${content.substring(0, 2000)}${existingContext}
      
      요구사항:
      - 각 질문은 한 줄로 작성
      - 이모지로 시작 (🔹, 🔄, 🐳, 📊, 🔍, ⚡, 💡, 🛠️, 💼, 📚, 🔧 중 하나)
      - 실무적이고 구체적인 내용
      - 서로 다른 주제나 관점으로 질문 생성
      - 마지막에 물음표 포함
      - 기존 질문과 중복되지 않도록 주의`;

      try {
        // API 호출 타임아웃 설정 (20초)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000);

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
                content: `당신은 전문적인 질문 생성 도우미입니다. 주어진 답변에 대해 실무적이고 구체적인 후속 질문을 생성합니다.

중요 규칙:
1. 생성하는 질문들은 서로 다른 주제나 관점을 다뤄야 합니다
2. 기존 질문과 중복되거나 유사한 내용을 피해야 합니다
3. 각 질문은 독립적이고 구체적이어야 합니다
4. 이모지는 질문의 주제를 나타내는 하나만 사용합니다`
              },
              {
                role: "user",
                content: prompt
              }
            ],
            temperature: 0.7,
            max_tokens: 200
          }),
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!deepseekResponse.ok) {
          const errorText = await deepseekResponse.text().catch(() => 'Unknown error');
          console.error('DeepSeek API error:', deepseekResponse.status, errorText);
          return [];
        }

        const result = await deepseekResponse.json();
        const content = result.choices[0]?.message?.content;
        
        if (!content || typeof content !== 'string') {
          return [];
        }

        // 생성된 질문 sanitization
        const generatedQuestions = content
          .split('\n')
          .filter((q: string) => q.trim() && q.includes('?'))
          .map((q: string) => sanitizeInput(q.trim()))
          .slice(0, 2);

        return generatedQuestions;
      } catch (error) {
        if (error instanceof Error && error.name === 'AbortError') {
          console.error('DeepSeek API timeout');
        } else {
          console.error('DeepSeek API error:', error instanceof Error ? error.message : 'Unknown error');
        }
        return [];
      }
    };

    // 질문 생성 및 조합
    const patternQuestions = generateDynamicQuestions(response);
    
    // 패턴 매칭으로 충분한 질문이 생성되지 않은 경우 DeepSeek 활용
    const deepseekQuestions = await generateDeepSeekQuestions(response, patternQuestions);
    const combinedQuestions = [...patternQuestions, ...deepseekQuestions];

    // 정교한 중복 제거
    const uniqueQuestions = removeDuplicateQuestions(combinedQuestions);
    
    // 최종 질문 선택 (다양성 확보)
    const defaultQuestions = [
      "💡 이 주제와 관련된 실제 사례가 궁금합니다.",
      "🔍 더 자세한 기술적인 내용이 알고 싶습니다."
    ];
    
    let finalQuestions: string[] = [];
    
    if (uniqueQuestions.length >= 2) {
      // 다양한 주제를 다루는 질문 선택
      finalQuestions = uniqueQuestions.slice(0, 2);
    } else if (uniqueQuestions.length === 1) {
      // 하나만 있으면 기본 질문과 조합
      const defaultQ = defaultQuestions.find(q => {
        const qWords = q.toLowerCase().split(' ').filter(w => w.length > 2);
        const existingWords = uniqueQuestions[0].toLowerCase().split(' ').filter(w => w.length > 2);
        const commonWords = qWords.filter(w => existingWords.includes(w));
        return commonWords.length / Math.max(qWords.length, existingWords.length) < 0.3;
      }) || defaultQuestions[0];
      finalQuestions = [uniqueQuestions[0], defaultQ];
    } else {
      finalQuestions = defaultQuestions;
    }
    
    // 최종 중복 제거 (안전장치)
    finalQuestions = removeDuplicateQuestions(finalQuestions);

    return NextResponse.json(
      { questions: finalQuestions },
      {
        headers: {
          'X-RateLimit-Limit': '20',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      }
    );

  } catch (error) {
    console.error('Error generating related questions:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      {
        questions: [
          "💡 이 주제와 관련된 실제 사례가 궁금합니다.",
          "🔍 더 자세한 기술적인 내용이 알고 싶습니다."
        ]
      },
      { status: 500 }
    );
  }
} 