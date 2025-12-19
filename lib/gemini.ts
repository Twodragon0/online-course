/**
 * Google Gemini API 클라이언트
 * 비용 최적화를 위해 적절한 모델 선택 및 캐싱 적용
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import { getCached } from './security';

// Gemini API 인스턴스
let geminiClient: GoogleGenerativeAI | null = null;

/**
 * Gemini API 클라이언트 초기화
 */
function getGeminiClient(): GoogleGenerativeAI {
  if (geminiClient) {
    return geminiClient;
  }

  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  
  if (!apiKey || apiKey.trim().length === 0) {
    throw new Error('Google Gemini API key is not configured. Set GOOGLE_GEMINI_API_KEY or GEMINI_API_KEY environment variable.');
  }

  geminiClient = new GoogleGenerativeAI(apiKey);
  return geminiClient;
}

/**
 * 비용 최적화를 위한 모델 선택
 * - gemini-pro: 일반적인 텍스트 생성 (가장 저렴)
 * - gemini-pro-vision: 이미지 분석 포함 (필요시)
 */
export type GeminiModel = 'gemini-pro' | 'gemini-pro-vision';

/**
 * 기본 모델 (비용 최적화)
 */
const DEFAULT_MODEL: GeminiModel = 'gemini-pro';

/**
 * Gemini API를 사용한 텍스트 생성
 * @param prompt 프롬프트
 * @param model 사용할 모델 (기본값: gemini-pro)
 * @param options 추가 옵션
 */
export async function generateText(
  prompt: string,
  model: GeminiModel = DEFAULT_MODEL,
  options?: {
    temperature?: number;
    maxTokens?: number;
    cache?: boolean;
    cacheKey?: string;
  }
): Promise<string> {
  try {
    const client = getGeminiClient();
    const geminiModel = client.getGenerativeModel({ 
      model,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 2048,
      },
    });

    // 캐싱이 활성화된 경우
    if (options?.cache !== false) {
      const cacheKey = options?.cacheKey || `gemini:${model}:${prompt.substring(0, 100)}`;
      
      return await getCached(
        cacheKey,
        async () => {
          const result = await geminiModel.generateContent(prompt);
          const response = await result.response;
          return response.text();
        },
        3600 // 1시간 캐시 (비용 절감)
      );
    }

    // 캐싱 없이 직접 호출
    const result = await geminiModel.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini API error:', error);
    throw new Error(
      error instanceof Error 
        ? `Gemini API 오류: ${error.message}` 
        : 'Gemini API 호출 중 알 수 없는 오류가 발생했습니다.'
    );
  }
}

/**
 * 채팅 대화 생성 (컨텍스트 유지)
 * @param messages 대화 메시지 배열
 * @param model 사용할 모델
 * @param options 추가 옵션
 */
export async function generateChat(
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>,
  model: GeminiModel = DEFAULT_MODEL,
  options?: {
    temperature?: number;
    maxTokens?: number;
  }
): Promise<string> {
  try {
    const client = getGeminiClient();
    const geminiModel = client.getGenerativeModel({ 
      model,
      generationConfig: {
        temperature: options?.temperature ?? 0.7,
        maxOutputTokens: options?.maxTokens ?? 2048,
      },
    });

    // Gemini는 system 메시지를 지원하지 않으므로 첫 번째 system 메시지를 프롬프트에 포함
    let systemPrompt = '';
    const chatMessages = messages.filter((msg) => {
      if (msg.role === 'system') {
        systemPrompt = msg.content;
        return false;
      }
      return true;
    });

    // 채팅 히스토리 구성
    const chat = geminiModel.startChat({
      history: chatMessages
        .slice(0, -1) // 마지막 메시지 제외
        .map((msg) => ({
          role: msg.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: msg.content }],
        })),
    });

    // 시스템 프롬프트가 있으면 마지막 사용자 메시지에 포함
    const lastMessage = chatMessages[chatMessages.length - 1];
    const finalPrompt = systemPrompt 
      ? `${systemPrompt}\n\n${lastMessage.content}`
      : lastMessage.content;

    const result = await chat.sendMessage(finalPrompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error('Gemini Chat API error:', error);
    throw new Error(
      error instanceof Error 
        ? `Gemini Chat API 오류: ${error.message}` 
        : 'Gemini Chat API 호출 중 알 수 없는 오류가 발생했습니다.'
    );
  }
}

/**
 * Google Drive 파일 내용 분석 (텍스트 파일)
 * @param fileId Google Drive 파일 ID
 * @param prompt 분석 프롬프트
 */
export async function analyzeDriveFile(
  fileId: string,
  prompt: string
): Promise<string> {
  // Google Drive API를 사용하여 파일 내용 가져오기
  // 이 부분은 google-drive.ts와 연동 필요
  // 현재는 기본 구현만 제공
  
  const analysisPrompt = `
다음 Google Drive 파일을 분석해주세요.
파일 ID: ${fileId}

${prompt}

파일 내용을 요약하고 주요 내용을 설명해주세요.
`;

  return await generateText(analysisPrompt, DEFAULT_MODEL, {
    temperature: 0.5, // 분석은 더 낮은 temperature 사용
    maxTokens: 1500,
    cache: true,
    cacheKey: `gemini:drive:${fileId}:${prompt.substring(0, 50)}`,
  });
}

/**
 * 비용 최적화를 위한 모델 선택 헬퍼
 */
export function selectOptimalModel(
  requiresVision: boolean = false,
  complexity: 'low' | 'medium' | 'high' = 'medium'
): GeminiModel {
  if (requiresVision) {
    return 'gemini-pro-vision';
  }
  
  // 복잡도에 따라 모델 선택 (현재는 gemini-pro만 사용)
  return 'gemini-pro';
}

/**
 * API 키 검증
 */
export function isGeminiConfigured(): boolean {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY || process.env.GEMINI_API_KEY;
  return !!(apiKey && apiKey.trim().length > 0);
}

