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
    const rateLimit = checkRateLimit(`chat:${clientIp}`, 20, 60000); // 1분에 20회
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
      console.error('DeepSeek API key is not configured');
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
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
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
            ...contextMessages,
            {
              role: "user",
              content: message
            }
          ],
          temperature: 0.7,
          max_tokens: 1000
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text().catch(() => 'Unknown error');
        console.error('DeepSeek API error:', response.status, errorText);
        return NextResponse.json(
          { error: 'AI 응답 생성에 실패했습니다.' },
          { status: 502 }
        );
      }

      const data = await response.json();
      const aiResponse = data.choices[0]?.message?.content;

      if (!aiResponse || typeof aiResponse !== 'string') {
        return NextResponse.json(
          { error: 'AI 응답을 받을 수 없습니다.' },
          { status: 502 }
        );
      }

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
        return NextResponse.json(
          { error: '요청 시간이 초과되었습니다.' },
          { status: 504 }
        );
      }

      console.error('Chat API Error:', fetchError instanceof Error ? fetchError.message : 'Unknown error');
      return NextResponse.json(
        { error: '채팅 메시지 처리에 실패했습니다.' },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('Chat API Error:', error instanceof Error ? error.message : 'Unknown error');
    return NextResponse.json(
      { error: '채팅 메시지 처리에 실패했습니다.' },
      { status: 500 }
    );
  }
} 