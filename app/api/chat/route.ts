import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// Set a specific runtime config for Vercel
export const runtime = 'nodejs'; // 'edge' | 'nodejs'
export const maxDuration = 60; // This is in seconds, only works on pro plans for > 10s

// TextEncoder 추가
const encoder = new TextEncoder();

// 시스템 프롬프트 개선
const SYSTEM_PROMPT = `당신은 DevSecOps & 클라우드 보안 전문가입니다.

답변 작성 규칙:
1. 💡 각 섹션은 명확한 이모지와 함께 구분하여 작성
2. 📚 전문 용어는 한글(영문) 형태로 병기
3. 🔍 핵심 내용은 **볼드 처리**로 강조
4. 🛠 실제 적용 가능한 예시 코드나 사례 포함
5. 💭 답변 마지막에는 3개의 추천 질문 제시

답변 구조:
- 🎯 **핵심 요약** (2-3줄)
- 📚 **상세 설명** 
- 💻 **실습 예시**
- 🔑 **핵심 포인트**
- 💡 **추천 질문**`;

interface ChatLog {
  id: string;
  sessionId: string;
  response: string | null;
  message: string;
  category: string;
  timestamp: Date;
}

async function findRelevantResponses(message: string): Promise<ChatLog[]> {
  const logs = await prisma.chatLog.findMany({
    where: {
      OR: [
        { message: { contains: message, mode: 'insensitive' } },
        { response: { contains: message, mode: 'insensitive' } }
      ]
    },
    orderBy: {
      timestamp: 'desc'
    },
    take: 5
  });

  return logs;
}

// API 요청에 타임아웃 설정을 추가하는 함수
async function fetchWithTimeout(url: string, options: RequestInit, timeout = 15000) {
  // AbortController를 사용하여 요청 타임아웃 구현
  const controller = new AbortController();
  const { signal } = controller;
  
  // 타임아웃 설정 - 더 짧게 설정
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

// 간단한 응답 생성 함수
function generateFallbackResponse(message: string) {
  return `🎯 **핵심 요약**
죄송합니다. 현재 AI 서비스에 일시적인 문제가 발생했습니다.

📚 **상세 설명**
현재 DeepSeek AI 서비스와의 통신에 지연이 발생하고 있습니다. 이는 다음과 같은 이유로 발생할 수 있습니다:
- 서버 부하가 높음
- 네트워크 지연 문제
- API 요청 제한 도달

💻 **대안**
- 잠시 후 다시 시도해 보세요
- 질문을 더 짧고 구체적으로 작성해 보세요
- 브라우저를 새로고침 후 다시 시도해 보세요

🔑 **핵심 포인트**
문제가 지속될 경우 관리자에게 문의해 주세요.

💡 **추천 질문**
- 다른 주제에 대해 질문해 볼까요?
- 특정 기술에 대한 정보가 필요하신가요?
- 도움이 필요한 다른 영역이 있나요?`;
}

export async function POST(request: Request) {
  let chatLog = null;
  
  try {
    const { message } = await request.json();

    // API 응답 로깅 추가
    console.log('요청 메시지:', message);
    
    // 최적화: 더 짧은 컨텍스트와 응답 제한
    const optimizedPrompt = message.length > 500 
      ? message.substring(0, 500) + "..." 
      : message;

    try {
      // DeepSeek API를 통한 응답 생성 - 최적화된 버전
      const apiKey = process.env.DEEPSEEK_API_KEY;
      if (!apiKey) {
        throw new Error('DeepSeek API key is not configured');
      }

      // Race 패턴으로 최대 8초만 기다림 (Vercel의 기본 제한 안에서 작동하도록)
      const responsePromise = fetchWithTimeout(
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
                content: SYSTEM_PROMPT
              },
              {
                role: "user",
                content: optimizedPrompt
              }
            ],
            temperature: 0.7,
            max_tokens: 800, // 응답 길이 제한 축소
            timeout: 5 // DeepSeek API에 타임아웃 명시
          })
        },
        8000 // 8초 타임아웃 (Vercel의 기본 제한인 10초보다 짧게)
      );

      // 타임아웃 Promise로 경쟁
      const response = await Promise.race([
        responsePromise,
        new Promise<null>((resolve) => setTimeout(() => resolve(null), 7500))
      ]);

      // 타임아웃이 발생한 경우
      if (!response) {
        throw new Error('DeepSeek API timeout');
      }

      // API 응답 확인
      if (!response.ok) {
        const errorText = await response.text();
        console.error('API 오류:', errorText);
        throw new Error(`DeepSeek API 응답 오류: ${response.status}`);
      }

      const data = await response.json();
      const aiResponse = data.choices?.[0]?.message?.content;

      if (!aiResponse) {
        throw new Error('API 응답 형식이 올바르지 않습니다');
      }

      // 비동기적으로 데이터베이스 저장 - 결과를 기다리지 않음
      Promise.resolve().then(async () => {
        try {
          await prisma.chatLog.create({
            data: {
              sessionId: 'general',
              message,
              response: aiResponse,
              category: 'success',
              timestamp: new Date()
            }
          });
        } catch (dbError) {
          console.error('Database Error:', dbError);
          // 데이터베이스 오류는 무시하고 계속 진행 (사용자 경험 우선)
        }
      });

      // 추천 질문 추출 - 더 안정적인 방식으로 변경
      let recommendedQuestions = [
        "🔍 이 주제에 대해 더 자세히 알고 싶습니다.",
        "💻 실제 구현 사례를 보여주실 수 있나요?",
        "🔐 보안 관점에서 주의할 점은 무엇인가요?"
      ];
      
      // 추천 질문 섹션이 있는 경우에만 추출 시도
      if (aiResponse.includes('💡 **추천 질문**')) {
        try {
          const questionsSection = aiResponse.split('💡 **추천 질문**')[1];
          const extractedQuestions = questionsSection
            ?.split('\n')
            .filter((line: string) => line.trim().startsWith('-'))
            .map((line: string) => line.trim().replace('- ', ''));
            
          if (extractedQuestions && extractedQuestions.length > 0) {
            recommendedQuestions = extractedQuestions;
          }
        } catch (error) {
          console.warn('추천 질문 추출 실패:', error);
          // 추출 실패 시 기본 질문 유지
        }
      }

      // 응답 전송
      return NextResponse.json({
        success: true,
        response: aiResponse,
        relatedQuestions: recommendedQuestions,
        source: "deepseek",
        logId: null // 비동기 저장이므로 ID를 알 수 없음
      });
      
    } catch (error: any) {
      console.error('채팅 API 오류:', error);
      
      // 오류 발생 시 대체 응답 생성
      const fallbackResponse = generateFallbackResponse(message);
      
      // 대체 응답 전송
      return NextResponse.json({
        success: true,
        response: fallbackResponse,
        relatedQuestions: [
          "🔄 잠시 후 다시 시도해 보시겠어요?",
          "🛠 다른 주제에 대해 질문하고 싶으신가요?",
          "📝 더 짧은 질문으로 시도해 보시겠어요?"
        ],
        source: "fallback",
        logId: null,
        fallback: true
      });
    }

  } catch (error: any) {
    console.error('채팅 API 요청 파싱 오류:', error);
    return NextResponse.json(
      { 
        error: '요청 처리 중 오류가 발생했습니다',
        success: false,
        response: generateFallbackResponse("오류 발생"),
        relatedQuestions: [
          "🔄 잠시 후 다시 시도해 보시겠어요?",
          "🛠 다른 주제에 대해 질문하고 싶으신가요?",
          "📝 더 짧은 질문으로 시도해 보시겠어요?"
        ],
        fallback: true
      },
      { status: 500 }
    );
  }
}