import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

export async function POST(request: Request) {
  try {
    const { message, category, sessionId } = await request.json();

    // 관련 이전 대화 검색
    const relevantResponses = await findRelevantResponses(message);
    const contextMessages = relevantResponses.map((log: ChatLog) => ({
      role: "assistant" as const,
      content: log.response
    }));

    // DeepSeek API 호출
    const apiKey = process.env.DEEPSEEK_API_KEY;
    if (!apiKey) {
      throw new Error('DeepSeek API key is not configured');
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
      })
    });

    if (!response.ok) {
      throw new Error('DeepSeek API error');
    }

    const data = await response.json();
    const aiResponse = data.choices[0]?.message?.content;

    if (!aiResponse) {
      throw new Error('No response from DeepSeek API');
    }

    // 응답 저장
    const chatLog = await prisma.chatLog.create({
      data: {
        sessionId: sessionId || 'general',
        message,
        response: aiResponse,
        category,
      }
    });

    return NextResponse.json({
      response: aiResponse,
      logId: chatLog.id
    });

  } catch (error) {
    console.error('Chat API Error:', error);
    return NextResponse.json(
      { error: 'Failed to process chat message' },
      { status: 500 }
    );
  }
} 