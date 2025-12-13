import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  isValidMessage,
  isValidCategory,
  isValidSessionId,
  sanitizeInput,
  checkRateLimit,
  getClientIp,
} from '@/lib/security';

interface ChatLog {
  id: string;
  sessionId: string;
  response: string | null;
  message: string;
  category: string;
  timestamp: Date;
}

async function findRelevantResponses(message: string): Promise<ChatLog[]> {
  if (!prisma) {
    return [];
  }
  
  // SQL Injection 방지를 위해 Prisma의 파라미터화된 쿼리 사용
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

export async function POST(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`chat:${clientIp}`, 20, 60000); // 1분에 20회
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

    const body = await request.json();
    const { message: rawMessage, category: rawCategory, sessionId: rawSessionId } = body;

    // 입력 검증
    if (!rawMessage) {
      return NextResponse.json(
        { error: '메시지가 필요합니다.' },
        { status: 400 }
      );
    }

    // 메시지 검증
    const messageValidation = isValidMessage(rawMessage, 5000);
    if (!messageValidation.valid) {
      return NextResponse.json(
        { error: messageValidation.error },
        { status: 400 }
      );
    }

    // 메시지 sanitization (XSS 방지)
    const message = sanitizeInput(rawMessage);

    // 카테고리 검증
    const category = rawCategory && isValidCategory(rawCategory) 
      ? rawCategory.toLowerCase() 
      : 'general';

    // 세션 ID 검증 및 sanitization
    const sessionId = rawSessionId && isValidSessionId(rawSessionId)
      ? sanitizeInput(rawSessionId)
      : 'general';

    // 관련 이전 대화 검색
    const relevantResponses = await findRelevantResponses(message);
    const contextMessages = relevantResponses.map((log: ChatLog) => ({
      role: "assistant" as const,
      content: log.response
    }));

    // DeepSeek API 호출
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey || apiKey.trim().length === 0) {
      console.error('[Chat API] DeepSeek API key is not configured');
      return NextResponse.json(
        { error: '서비스가 일시적으로 사용할 수 없습니다.' },
        { status: 503 }
      );
    }

    const systemPrompt = `당신은 DevSecOps & 클라우드 보안 온라인 코스의 AI 어시스턴트입니다.

답변 작성 규칙:
1. 전문적이고 친절한 톤으로 답변해주세요.
2. 한국어로 답변하되, 전문 용어는 영문도 함께 표기해주세요.
3. 중요한 키워드나 핵심 내용은 **볼드 처리**를 해주세요.
4. 답변은 단락별로 구분하고, 각 단락 시작에 적절한 이모지를 넣어주세요.
5. 긴 답변의 경우 다음과 같은 구조로 작성해주세요:
   - 🎯 **핵심 요약** (2-3줄)
   - 📚 **상세 설명** (필요한 만큼)
   - 💡 **실무 적용 팁** (가능한 경우)
6. 코드나 기술적인 내용은 다음과 같이 마크다운으로 포맷팅해주세요:
   \`\`\`language
   코드 내용
   \`\`\`
7. 목록은 번호나 불릿으로 구분하고, 각 항목에 이모지를 추가해주세요.
8. 답변 마지막에는 관련된 추가 질문이나 학습 방향을 제안해주세요.

이전 대화 맥락을 고려하여 답변하되, 각 답변은 독립적으로도 이해할 수 있도록 작성해주세요.`;

    // API 호출 타임아웃 설정 (30초)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      const requestBody = {
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content: systemPrompt
          },
          ...contextMessages,
          {
            role: "user",
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 2000,
        stream: false
      };

      console.log('[Chat API] Calling DeepSeek API with message length:', message.length);

      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorText = 'Unknown error';
        try {
          errorText = await response.text();
          const errorJson = JSON.parse(errorText);
          console.error('[Chat API] DeepSeek API error:', {
            status: response.status,
            statusText: response.statusText,
            error: errorJson
          });
        } catch (parseError) {
          console.error('[Chat API] DeepSeek API error (non-JSON):', {
            status: response.status,
            statusText: response.statusText,
            errorText
          });
        }
        
        // 더 구체적인 에러 메시지 제공
        if (response.status === 401) {
          return NextResponse.json(
            { error: 'API 인증에 실패했습니다. 관리자에게 문의해주세요.' },
            { status: 502 }
          );
        } else if (response.status === 429) {
          return NextResponse.json(
            { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
            { status: 429 }
          );
        } else if (response.status >= 500) {
          return NextResponse.json(
            { error: 'AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.' },
            { status: 502 }
          );
        }
        
        return NextResponse.json(
          { error: 'AI 응답 생성에 실패했습니다.' },
          { status: 502 }
        );
      }

      let data;
      try {
        const responseText = await response.text();
        data = JSON.parse(responseText);
      } catch (parseError) {
        console.error('[Chat API] Failed to parse DeepSeek API response:', parseError);
        return NextResponse.json(
          { error: 'AI 응답을 처리하는 중 오류가 발생했습니다.' },
          { status: 502 }
        );
      }

      // 응답 구조 검증
      if (!data || typeof data !== 'object') {
        console.error('[Chat API] Invalid response structure:', data);
        return NextResponse.json(
          { error: 'AI 응답 형식이 올바르지 않습니다.' },
          { status: 502 }
        );
      }

      if (!data.choices || !Array.isArray(data.choices) || data.choices.length === 0) {
        console.error('[Chat API] No choices in response:', data);
        return NextResponse.json(
          { error: 'AI 응답을 받을 수 없습니다.' },
          { status: 502 }
        );
      }

      const firstChoice = data.choices[0];
      if (!firstChoice || !firstChoice.message || !firstChoice.message.content) {
        console.error('[Chat API] Invalid choice structure:', firstChoice);
        return NextResponse.json(
          { error: 'AI 응답을 받을 수 없습니다.' },
          { status: 502 }
        );
      }

      const aiResponse = firstChoice.message.content;

      if (!aiResponse || typeof aiResponse !== 'string' || aiResponse.trim().length === 0) {
        console.error('[Chat API] Empty or invalid response content');
        return NextResponse.json(
          { error: 'AI 응답이 비어있습니다.' },
          { status: 502 }
        );
      }

      console.log('[Chat API] Successfully received response, length:', aiResponse.length);

      // AI 응답도 sanitization (XSS 방지)
      const sanitizedResponse = sanitizeInput(aiResponse);

      // 응답 저장
      if (!prisma) {
        return NextResponse.json({
          response: sanitizedResponse,
          logId: null
        }, {
          headers: {
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          },
        });
      }
      
      try {
        const chatLog = await prisma.chatLog.create({
          data: {
            sessionId,
            message,
            response: sanitizedResponse,
            category,
          }
        });

        return NextResponse.json({
          response: sanitizedResponse,
          logId: chatLog.id
        }, {
          headers: {
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          },
        });
      } catch (dbError) {
        // 데이터베이스 오류는 로깅만 하고 응답은 반환
        console.error('Database error:', dbError instanceof Error ? dbError.message : 'Unknown error');
        return NextResponse.json({
          response: sanitizedResponse,
          logId: null
        }, {
          headers: {
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          },
        });
      }
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        console.error('[Chat API] Request timeout');
        return NextResponse.json(
          { error: '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.' },
          { status: 504 }
        );
      }

      // 네트워크 오류 처리
      if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
        console.error('[Chat API] Network error:', fetchError.message);
        return NextResponse.json(
          { error: '네트워크 연결에 문제가 발생했습니다. 인터넷 연결을 확인해주세요.' },
          { status: 503 }
        );
      }

      console.error('[Chat API] Fetch error:', {
        name: fetchError instanceof Error ? fetchError.name : 'Unknown',
        message: fetchError instanceof Error ? fetchError.message : 'Unknown error',
        stack: fetchError instanceof Error ? fetchError.stack : undefined
      });
      
      return NextResponse.json(
        { error: '채팅 메시지 처리에 실패했습니다. 잠시 후 다시 시도해주세요.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[Chat API] Unexpected error:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' },
      { status: 500 }
    );
  }
} 