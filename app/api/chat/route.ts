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
import { generateChat, isGeminiConfigured } from '@/lib/gemini';

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

    // 요청 본문 파싱
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error('[Chat API] Failed to parse request body:', parseError);
      return NextResponse.json(
        { error: '요청 형식이 올바르지 않습니다.' },
        { status: 400 }
      );
    }
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

    // 관련 이전 대화 검색 (Prisma 사용 가능한 경우만)
    let contextMessages: Array<{ role: "assistant" | "user" | "system"; content: string }> = [];
    try {
      const dbUrl = process.env.DATABASE_URL;
      if (dbUrl && (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql+pooler://'))) {
        const relevantResponses = await findRelevantResponses(message);
        contextMessages = relevantResponses
          .filter((log: ChatLog) => log.response !== null)
          .map((log: ChatLog) => ({
            role: "assistant" as const,
            content: log.response as string
          }));
      }
    } catch (dbError) {
      console.warn('[Chat API] Failed to fetch context messages:', dbError instanceof Error ? dbError.message : 'Unknown error');
      // 데이터베이스 에러는 무시하고 계속 진행 (컨텍스트 없이 응답)
    }

    // AI 서비스 선택 (비용 최적화: DeepSeek 우선, 없으면 Gemini)
    const useDeepSeek = process.env.DEEPSEEK_API_KEY && process.env.DEEPSEEK_API_KEY.startsWith('sk-');
    const useGemini = isGeminiConfigured();
    
    if (!useDeepSeek && !useGemini) {
      console.error('[Chat API] No AI service configured (DeepSeek or Gemini)');
      return NextResponse.json(
        { error: '서비스가 일시적으로 사용할 수 없습니다. 관리자에게 문의해주세요.' },
        { status: 503 }
      );
    }

    const systemPrompt = `당신은 DevSecOps & 클라우드 보안 온라인 코스의 전문 AI 어시스턴트입니다.

답변 작성 규칙:
1. **전문성과 친절함**: 전문적이면서도 이해하기 쉬운 톤으로 답변해주세요.
2. **언어 사용**: 한국어로 답변하되, 전문 용어는 영문도 함께 표기해주세요 (예: 컨테이너 보안(Container Security)).
3. **구조화된 답변**: 
   - 🎯 **핵심 요약** (2-3줄로 간결하게)
   - 📚 **상세 설명** (단계별, 구체적으로)
   - 💡 **실무 적용 팁** (실제 사용 사례 포함)
   - 🔗 **관련 학습 방향** (추가 질문 제안)
4. **포맷팅**:
   - 중요한 키워드는 **볼드 처리**
   - 코드는 마크다운 코드 블록 사용: \`\`\`language\n코드\n\`\`\`
   - 목록은 번호나 불릿으로 구분, 각 항목에 이모지 추가
5. **정확성**: 
   - 최신 보안 모범 사례(Best Practices) 반영
   - 구체적인 도구명, 명령어, 설정 예시 제공
   - 추측보다는 확실한 정보만 제공
6. **실무 중심**: 
   - 이론보다는 실무 적용 가능한 내용 우선
   - 실제 프로젝트에서 사용할 수 있는 예시 제공
   - 트러블슈팅 팁 포함

이전 대화 맥락을 고려하되, 각 답변은 독립적으로도 완전히 이해할 수 있도록 작성해주세요.`;

    // DeepSeek 사용 시 (우선 - 비용 최적화)
    if (useDeepSeek) {
      try {
        const apiKey = process.env.DEEPSEEK_API_KEY;
        if (!apiKey || !apiKey.startsWith('sk-')) {
          throw new Error('DeepSeek API key is invalid');
        }

        console.log('[Chat API] Using DeepSeek API (primary)');

        // API 호출 타임아웃 설정 (45초로 증가 - 더 긴 답변을 위해)
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 45000);

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
        max_tokens: 2500, // 더 긴 답변을 위해 증가
        stream: false // 현재는 비스트리밍 모드 사용 (향후 스트리밍 지원 예정)
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
          console.error('[Chat API] DeepSeek API authentication failed - check API key');
          return NextResponse.json(
            { error: 'API 인증에 실패했습니다. 관리자에게 문의해주세요.' },
            { status: 502 }
          );
        } else if (response.status === 429) {
          // Rate limit 오류는 재시도 가능하도록 안내
          const retryAfter = response.headers.get('Retry-After') || '60';
          return NextResponse.json(
            { 
              error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.',
              retryAfter: parseInt(retryAfter)
            },
            { 
              status: 429,
              headers: {
                'Retry-After': retryAfter
              }
            }
          );
        } else if (response.status >= 500) {
          // 서버 오류는 재시도 가능
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

      // 스트리밍이 아닌 경우에만 JSON 파싱
      let data;
      try {
        const responseText = await response.text();
        if (!responseText || responseText.trim().length === 0) {
          throw new Error('Empty response from DeepSeek API');
        }
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

      // 응답 저장 (Prisma 사용 가능한 경우만)
      let logId: string | null = null;
      try {
        const dbUrl = process.env.DATABASE_URL;
        if (dbUrl && (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql+pooler://'))) {
          try {
            const chatLog = await prisma.chatLog.create({
              data: {
                sessionId,
                message,
                response: sanitizedResponse,
                category,
              }
            });
            logId = chatLog.id;
          } catch (dbError) {
            // 데이터베이스 오류는 로깅만 하고 응답은 반환
            console.warn('[Chat API] Failed to save chat log:', dbError instanceof Error ? dbError.message : 'Unknown error');
          }
        }
      } catch (prismaError) {
        // Prisma 초기화 에러는 무시
        console.warn('[Chat API] Prisma not available for logging');
      }

      return NextResponse.json({
        response: sanitizedResponse,
        logId,
        provider: 'deepseek'
      }, {
        headers: {
          'X-RateLimit-Limit': '20',
          'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        },
      });
        } catch (fetchError) {
          clearTimeout(timeoutId);
          
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            console.error('[Chat API] Request timeout');
            throw new Error('Request timeout');
          }

          // 네트워크 오류 처리
          if (fetchError instanceof TypeError && fetchError.message.includes('fetch')) {
            console.error('[Chat API] Network error:', fetchError.message);
            throw new Error('Network error');
          }

          console.error('[Chat API] Fetch error:', {
            name: fetchError instanceof Error ? fetchError.name : 'Unknown',
            message: fetchError instanceof Error ? fetchError.message : 'Unknown error',
          });
          
          throw fetchError;
        }
      } catch (deepseekError) {
        console.error('[Chat API] DeepSeek API error:', deepseekError);
        // DeepSeek 실패 시 Gemini로 fallback
        if (useGemini) {
          console.log('[Chat API] Falling back to Gemini API');
          // Gemini fallback 로직으로 계속 진행
        } else {
          // Gemini도 없으면 에러 반환
          return NextResponse.json(
            { error: 'AI 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' },
            { status: 502 }
          );
        }
      }
    }

    // Gemini 사용 (DeepSeek이 없거나 실패한 경우)
    if (useGemini) {
      try {
        const messages = [
          {
            role: 'system' as const,
            content: systemPrompt
          },
          ...contextMessages,
          {
            role: 'user' as const,
            content: message
          }
        ];

        console.log('[Chat API] Using Gemini API (fallback)');
        const aiResponse = await generateChat(messages, 'gemini-pro', {
          temperature: 0.7,
          maxTokens: 2500,
        });

        if (!aiResponse || typeof aiResponse !== 'string' || aiResponse.trim().length === 0) {
          throw new Error('Empty response from Gemini API');
        }

        console.log('[Chat API] Successfully received response from Gemini, length:', aiResponse.length);
        const sanitizedResponse = sanitizeInput(aiResponse);

        // 응답 저장 (Prisma 사용 가능한 경우만)
        let logId: string | null = null;
        try {
          const dbUrl = process.env.DATABASE_URL;
          if (dbUrl && (dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql+pooler://'))) {
            try {
              const chatLog = await prisma.chatLog.create({
                data: {
                  sessionId,
                  message,
                  response: sanitizedResponse,
                  category,
                }
              });
              logId = chatLog.id;
            } catch (dbError) {
              // 데이터베이스 오류는 로깅만 하고 응답은 반환
              console.warn('[Chat API] Failed to save chat log:', dbError instanceof Error ? dbError.message : 'Unknown error');
            }
          }
        } catch (prismaError) {
          // Prisma 초기화 에러는 무시
          console.warn('[Chat API] Prisma not available for logging');
        }

        return NextResponse.json({
          response: sanitizedResponse,
          logId,
          provider: 'gemini'
        }, {
          headers: {
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
          },
        });
      } catch (geminiError) {
        console.error('[Chat API] Gemini API error:', geminiError);
        return NextResponse.json(
          { error: 'AI 응답 생성에 실패했습니다. 잠시 후 다시 시도해주세요.' },
          { status: 502 }
        );
      }
    }
  } catch (error) {
    // 에러 타입별 처리
    const errorName = error instanceof Error ? error.name : 'Unknown';
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error('[Chat API] Unexpected error:', {
      name: errorName,
      message: errorMessage,
      stack: errorStack
    });

    // 구체적인 에러 메시지 제공
    let userMessage = '예상치 못한 오류가 발생했습니다. 잠시 후 다시 시도해주세요.';
    let statusCode = 500;

    // 네트워크 에러
    if (errorName === 'TypeError' && errorMessage.includes('fetch')) {
      userMessage = '네트워크 연결에 문제가 발생했습니다. 인터넷 연결을 확인해주세요.';
      statusCode = 503;
    }
    // 타임아웃 에러
    else if (errorName === 'AbortError' || errorMessage.includes('timeout')) {
      userMessage = '요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요.';
      statusCode = 504;
    }
    // Prisma 에러
    else if (errorName.includes('Prisma') || errorMessage.includes('DATABASE_URL')) {
      userMessage = '데이터베이스 연결에 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
      statusCode = 503;
    }
    // JSON 파싱 에러
    else if (errorName === 'SyntaxError' && errorMessage.includes('JSON')) {
      userMessage = '응답을 처리하는 중 오류가 발생했습니다. 다시 시도해주세요.';
      statusCode = 502;
    }

    return NextResponse.json(
      { 
        error: userMessage,
        // 개발 환경에서만 상세 에러 정보 제공
        ...(process.env.NODE_ENV === 'development' && {
          details: errorMessage,
          errorType: errorName
        })
      },
      { status: statusCode }
    );
  }
} 