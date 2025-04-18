import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

export async function POST(request: Request) {
  let chatLog = null;
  
  try {
    const { message } = await request.json();

    // API 응답 로깅 추가
    console.log('요청 메시지:', message);

    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.DEEPSEEK_API_KEY}`,
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
            content: message
          }
        ],
        temperature: 0.7,
        max_tokens: 2000
      })
    });

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

    // 데이터베이스 연결이 성공한 경우에만 로그 저장
    try {
      chatLog = await prisma.chatLog.create({
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
      // 데이터베이스 오류가 발생해도 API 응답은 계속 진행
    }

    // 추천 질문 추출
    const recommendedQuestions = aiResponse
      .split('💡 **추천 질문**')[1]
      ?.split('\n')
      .filter((line: string) => line.trim().startsWith('-'))
      .map((line: string) => line.trim().replace('- ', ''))
      || [
        "🔍 이 주제에 대해 더 자세히 알고 싶습니다.",
        "💻 실제 구현 사례를 보여주실 수 있나요?",
        "🔐 보안 관점에서 주의할 점은 무엇인가요?"
      ];

    return NextResponse.json({
      success: true,
      response: aiResponse,
      relatedQuestions: recommendedQuestions,
      logId: chatLog?.id
    });

  } catch (error) {
    console.error('채팅 API 오류:', error);
    return NextResponse.json(
      { error: '답변 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}