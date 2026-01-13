'use client';

import { useState, useEffect, useCallback } from 'react';
import { MessageSquare, Loader2, X, Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ChatMessage, MessageCategory } from '@/types/chat';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { Resizable } from 're-resizable';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatBotProps {
  videoId?: string;
  isEmbedded?: boolean;
}

export function ChatBot({ videoId, isEmbedded = false }: ChatBotProps) {
  const DEFAULT_SIZE = {
    width: typeof window !== 'undefined' ? 
      window.innerWidth < 640 ? '95vw' : '450px' : '450px',
    height: typeof window !== 'undefined' ? 
      window.innerWidth < 640 ? '90vh' : '600px' : '600px'
  };

  const [isOpen, setIsOpen] = useState(isEmbedded);
  const [showIcon, setShowIcon] = useState(false);
  const [hasShaken, setHasShaken] = useState(false);
  const [size, setSize] = useState(DEFAULT_SIZE);

  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      content: '해당 DevSecOps & 클라우드 보안 온라인 코스에 대해 궁금하신 점이 있으신가요?',
      role: 'assistant',
      category: 'general',
      timestamp: new Date(),
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [thinkingMessage, setThinkingMessage] = useState('');

  const [recommendedQuestions, setRecommendedQuestions] = useState<string[]>([
    "🔐 클라우드 보안 과정의 선수 지식이 궁금합니다",
    "💼 과정 수료 후 진로 방향이 궁금합니다"
  ]);

  const thinkingStates = [
    "질문을 분석하고 있습니다...",
    "관련 정보를 검색하고 있습니다...",
    "답변을 생성하고 있습니다..."
  ];

  useEffect(() => {
    let currentIndex = 0;
    let interval: NodeJS.Timeout;

    if (isLoading) {
      interval = setInterval(() => {
        setThinkingMessage(thinkingStates[currentIndex]);
        currentIndex = (currentIndex + 1) % thinkingStates.length;
      }, 2000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isLoading]);

  useEffect(() => {
    if (!isEmbedded) {
      // 아이콘을 즉시 표시하되, 애니메이션은 5초 후에
      setShowIcon(true);
      const timer = setTimeout(() => {
        setHasShaken(true);
        setTimeout(() => setHasShaken(false), 1000);
      }, 5000);
      return () => clearTimeout(timer);
    } else {
      setShowIcon(true);
    }
  }, [isEmbedded]);

  const categorizeMessage = (content: string): MessageCategory => {
    // 간단한 키워드 기반 분류
    const keywords = {
      technical: ['code', 'error', 'bug', 'debug', 'implementation'],
      security: ['security', 'authentication', 'authorization', 'vulnerability'],
      devops: ['deploy', 'pipeline', 'ci/cd', 'infrastructure'],
      programming: ['function', 'class', 'variable', 'algorithm'],
    };

    for (const [category, words] of Object.entries(keywords)) {
      if (words.some(word => content.toLowerCase().includes(word))) {
        return category as MessageCategory;
      }
    }
    return 'general';
  };

  const handleSendMessage = async () => {
    const messageToSend = input.trim();
    if (!messageToSend || isLoading) return;

    const category = categorizeMessage(messageToSend);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: messageToSend,
      role: 'user',
      category,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setThinkingMessage(thinkingStates[0]);

    try {
      // 세션 ID 저장
      const sessionId = localStorage.getItem('chatSessionId') || Date.now().toString();
      if (!localStorage.getItem('chatSessionId')) {
        localStorage.setItem('chatSessionId', sessionId);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60초 타임아웃

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          category,
          sessionId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: '알 수 없는 오류가 발생했습니다.' };
        }
        
        // Rate limit 오류 처리
        if (response.status === 429) {
          const retryAfter = errorData.retryAfter || 60;
          throw new Error(`요청이 너무 많습니다. ${retryAfter}초 후 다시 시도해주세요.`);
        }
        
        // 서비스 사용 불가 오류
        if (response.status === 503) {
          throw new Error(errorData.error || '서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.');
        }
        
        throw new Error(errorData.error || `서버 오류 (${response.status})`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.response || typeof data.response !== 'string') {
        throw new Error('응답 형식이 올바르지 않습니다.');
      }

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        content: data.response,
        role: 'assistant',
        category,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorMessage = "죄송합니다. 답변을 생성하는 중에 문제가 발생했습니다. 다시 시도해 주세요.";
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = '요청 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.';
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          errorMessage = '네트워크 연결에 문제가 발생했습니다. 인터넷 연결을 확인해주세요.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: `❌ ${errorMessage}`,
        role: 'assistant',
        category: 'error',
        timestamp: new Date(),
      }]);
      
      // 사용자에게 토스트 알림 표시
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setThinkingMessage('');
    }
  };

  // 복사 기능
  const handleCopyMessage = async (content: string, messageId: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setMessages(messages.map(msg => 
        msg.id === messageId ? { ...msg, isCopied: true } : msg
      ));
      toast.success('텍스트가 복사되었습니다');
      setTimeout(() => {
        setMessages(messages.map(msg => 
          msg.id === messageId ? { ...msg, isCopied: false } : msg
        ));
      }, 2000);
    } catch (err) {
      toast.error('복사에 실패했습니다');
    }
  };

  // 메시지 포맷팅 (XSS 방지를 위해 안전한 방법 사용)
  const formatMessage = (content: string, isAssistant: boolean) => {
    if (!isAssistant) {
      // 사용자 메시지는 그대로 표시 (이미 sanitized)
      return <div className="whitespace-pre-wrap">{content}</div>;
    }
    
    // 서버에서 이미 sanitizeInput으로 처리되었지만, 추가 보안을 위해
    // HTML 태그를 이스케이프하고 마크다운만 파싱
    const escapeHtml = (text: string) => {
      // 서버 사이드 렌더링 호환을 위한 간단한 이스케이프
      if (typeof window === 'undefined') {
        return text
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#x27;');
      }
      const div = document.createElement('div');
      div.textContent = text;
      return div.innerHTML;
    };

    // 볼드 텍스트 패턴 매칭을 위한 정규식
    const boldPattern = /\*\*(.*?)\*\*/g;
    // 코드 블록 패턴 매칭을 위한 정규식
    const codeBlockPattern = /```(?:(\w+)\n)?([\s\S]*?)```/g;
    const urlPattern = /\[([^\]]+)\]\(([^)]+)\)/g;
    
    // URL 검증 함수 (안전한 URL만 허용)
    const isValidUrl = (url: string): boolean => {
      try {
        const parsed = new URL(url);
        return parsed.protocol === 'http:' || parsed.protocol === 'https:';
      } catch {
        return false;
      }
    };
    
    // 볼드 텍스트, 코드 블록, URL을 안전하게 변환
    let formattedContent = escapeHtml(content)
      .replace(boldPattern, '<strong class="font-bold">$1</strong>')
      .replace(codeBlockPattern, (match, language, code) => {
        const escapedCode = escapeHtml(code.trim());
        const langClass = language ? ` language-${escapeHtml(language)}` : '';
        const langLabel = language ? 
          `<div class="absolute top-2 right-2 text-xs text-muted-foreground bg-background/90 px-2 py-1 rounded-md">${escapeHtml(language)}</div>` : '';
        return `
          <pre class="relative rounded-lg bg-muted/50 p-4 my-3">
            ${langLabel}
            <code class="block text-sm font-mono${langClass}">${escapedCode}</code>
          </pre>
        `;
      })
      .replace(urlPattern, (match, text, url) => {
        // URL 검증 후 안전한 링크만 생성
        if (isValidUrl(url)) {
          const escapedText = escapeHtml(text);
          const escapedUrl = escapeHtml(url);
          return `<a href="${escapedUrl}" target="_blank" rel="noopener noreferrer" class="text-blue-500 dark:text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 underline decoration-dotted underline-offset-4 transition-colors">${escapedText}</a>`;
        }
        // 유효하지 않은 URL은 텍스트로만 표시
        return escapeHtml(text);
      });

    return (
      <div 
        className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
        dangerouslySetInnerHTML={{ __html: formattedContent }}
      />
    );
  };

  const handleQuestionClick = async (question: string) => {
    if (isLoading) return; // 이미 로딩 중이면 중복 실행 방지

    const category = categorizeMessage(question);
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: question,
      role: 'user',
      category,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);
    setThinkingMessage(thinkingStates[0]);

    try {
      // 세션 ID 저장
      const sessionId = localStorage.getItem('chatSessionId') || Date.now().toString();
      if (!localStorage.getItem('chatSessionId')) {
        localStorage.setItem('chatSessionId', sessionId);
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60초 타임아웃

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: question,
          category,
          sessionId,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        let errorData;
        try {
          errorData = await response.json();
        } catch {
          errorData = { error: '알 수 없는 오류가 발생했습니다.' };
        }
        
        // Rate limit 오류 처리
        if (response.status === 429) {
          const retryAfter = errorData.retryAfter || 60;
          throw new Error(`요청이 너무 많습니다. ${retryAfter}초 후 다시 시도해주세요.`);
        }
        
        // 서비스 사용 불가 오류
        if (response.status === 503) {
          throw new Error(errorData.error || '서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요.');
        }
        
        throw new Error(errorData.error || `서버 오류 (${response.status})`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      if (!data.response || typeof data.response !== 'string') {
        throw new Error('응답 형식이 올바르지 않습니다.');
      }

      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        content: data.response,
        role: 'assistant',
        category,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      
      let errorMessage = "죄송합니다. 답변을 생성하는 중에 문제가 발생했습니다. 다시 시도해 주세요.";
      
      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          errorMessage = '요청 시간이 초과되었습니다. 네트워크 연결을 확인하고 다시 시도해주세요.';
        } else if (error.message.includes('fetch') || error.message.includes('network')) {
          errorMessage = '네트워크 연결에 문제가 발생했습니다. 인터넷 연결을 확인해주세요.';
        } else {
          errorMessage = error.message;
        }
      }
      
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        content: `❌ ${errorMessage}`,
        role: 'assistant',
        category: 'error',
        timestamp: new Date(),
      }]);
      
      // 사용자에게 토스트 알림 표시
      toast.error(errorMessage);
    } finally {
      setIsLoading(false);
      setThinkingMessage('');
    }
  };

  // 추천 질문 컴포넌트
  const RecommendedQuestions = ({ questions, onQuestionClick }: {
    questions: string[];
    onQuestionClick: (question: string) => void;
  }) => (
    <div className="flex justify-start w-full mt-2">
      <div className="bg-accent/10 dark:bg-accent/20 p-4 rounded-2xl rounded-tl-none mr-12 w-[85%]">
        <p className="text-sm font-medium mb-3 text-primary">💡 추천 질문</p>
        <div className="space-y-2">
          {questions.map((question, index) => (
            <Button
              key={index}
              variant="ghost"
              className={cn(
                "w-full justify-start text-sm h-auto py-3 px-4",
                "hover:bg-accent/20 dark:hover:bg-accent/30",
                "transition-colors rounded-lg",
                "whitespace-normal text-left break-words",
                "flex items-start gap-2",
                isLoading && "opacity-50 cursor-not-allowed" // 로딩 중일 때 비활성화 스타일
              )}
              onClick={() => handleQuestionClick(question)}
              disabled={isLoading} // 로딩 중일 때 클릭 방지
            >
              <span className="text-primary flex-shrink-0">🔹</span>
              <span className="text-foreground/90">{question}</span>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );

  // 추천 질문 생성 함수 수정
  const generateRecommendedQuestions = useCallback(async (content: string) => {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10초 타임아웃

      const response = await fetch('/api/related-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ response: content }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) throw new Error('Failed to fetch questions');
      const data = await response.json();
      
      if (data.questions && Array.isArray(data.questions) && data.questions.length > 0) {
        setRecommendedQuestions(data.questions);
      } else {
        throw new Error('Invalid questions format');
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      // 기본 추천 질문 설정
      if (content.toLowerCase().includes('devsecops') || content.toLowerCase().includes('보안')) {
        setRecommendedQuestions([
          "🔄 파이프라인에 어떤 보안 테스트들을 추가하면 좋을까요?",
          "🔍 취약점 스캔 결과는 어떻게 관리하고 대응하나요?",
          "💼 수강 후 이 코스 이수증이 취업이나 자격 인증에 어떻게 활용될 수 있는지 구체적인 사례를 알려주실 수 있나요?"
        ]);
      } else if (content.toLowerCase().includes('ai')) {
        setRecommendedQuestions([
          "🎯 AI 기반 콘텐츠 제작의 실제 워크플로우가 궁금합니다.",
          "📊 성과 분석을 위한 AI 도구 활용 방법을 알려주세요."
        ]);
      } else {
        setRecommendedQuestions([
          "🔐 클라우드 보안 과정의 선수 지식이 궁금합니다",
          "💼 과정 수료 후 진로 방향이 궁금합니다"
        ]);
      }
    }
  }, []);

  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1];
      if (lastMessage.role === 'assistant') {
        generateRecommendedQuestions(lastMessage.content);
      }
    }
  }, [messages, generateRecommendedQuestions]);

  useEffect(() => {
    if (isOpen) {
      setSize(DEFAULT_SIZE);
    }
  }, [isOpen]);

  // 채팅 아이콘 버튼 (항상 오른쪽 하단에 고정)
  const chatIconButton = !isEmbedded && showIcon ? (
    <motion.div
      animate={hasShaken ? {
        x: [0, -5, 5, -5, 5, 0],
      } : {}}
      transition={hasShaken ? {
        duration: 0.5,
        ease: "easeInOut",
      } : {}}
      className="fixed bottom-4 right-4 z-50"
      style={{ 
        display: isOpen ? 'none' : 'block'
      }}
    >
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "rounded-full w-14 h-14 p-0",
          "shadow-lg hover:shadow-xl",
          "transition-all duration-200",
          "bg-primary hover:bg-primary/90",
          "text-primary-foreground"
        )}
        aria-label="AI 채팅 열기"
      >
        <MessageSquare className="h-6 w-6" />
      </Button>
    </motion.div>
  ) : null;

  const chatContent = (
    <Card className={cn(
      "flex flex-col shadow-lg",
      isEmbedded ? "w-full h-full" : "w-full h-full"
    )}>
      {!isEmbedded && (
        <div className="p-4 border-b flex items-center justify-between cursor-move">
          <div className="flex items-center gap-2">
            <MessageSquare className="h-5 w-5" />
            <h3 className="font-semibold">AI Assistant</h3>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] text-muted-foreground">
              AI Assistant • Powered by DeepSeek v3
            </span>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}

      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((message) => (
            <div key={message.id}>
              <div
                className={cn(
                  "relative group",
                  message.role === 'user' ? "flex justify-end" : "flex justify-start"
                )}
              >
                <div
                  className={cn(
                    "p-4 max-w-[85%] shadow-sm break-words",
                    "sm:max-w-[75%] md:max-w-[65%]",
                    message.role === 'user'
                      ? "bg-primary text-primary-foreground rounded-2xl rounded-tr-none ml-12"
                      : cn(
                          "bg-muted rounded-2xl rounded-tl-none mr-12",
                          "hover:bg-muted/90 dark:hover:bg-muted/70",
                          "transition-colors duration-200"
                        )
                  )}
                >
                  <div className="text-sm leading-relaxed whitespace-pre-wrap">
                    {formatMessage(message.content, message.role === 'assistant')}
                  </div>

                  <div className={cn(
                    "flex items-center gap-2 mt-2 text-xs",
                    message.role === 'user' ? "justify-end" : "justify-between"
                  )}>
                    <span className="opacity-70">
                      {message.category} • {new Date(message.timestamp).toLocaleTimeString()}
                    </span>
                    {message.role === 'assistant' && (
                      <Button
                        variant="ghost"
                        size="icon"
                        className="opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleCopyMessage(message.content, message.id)}
                      >
                        {message.isCopied ? (
                          <Check className="h-3 w-3" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              {message.role === 'assistant' && (
                <RecommendedQuestions
                  questions={recommendedQuestions}
                  onQuestionClick={handleQuestionClick}
                />
              )}
            </div>
          ))}
          
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted p-4 rounded-2xl rounded-tl-none mr-12 flex flex-col items-center gap-2">
                <Loader2 className="h-5 w-5 animate-spin" />
                <p className="text-sm text-muted-foreground animate-pulse">
                  {thinkingMessage}
                </p>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      <div className="p-4 border-t flex flex-col gap-2">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex gap-2"
        >
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="질문을 입력하세요..."
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading}>
            전송
          </Button>
        </form>
        <p className="text-[10px] text-muted-foreground text-center">
          대화 내용은 서비스 개선을 위해 개인정보보호법에 따라 안전하게 저장됩니다
        </p>
      </div>
    </Card>
  );

  if (isEmbedded) {
    return chatContent;
  }

  return (
    <>
      {chatIconButton}
      {isOpen && (
        <Resizable
          size={size}
          minHeight={400}
          minWidth={300}
          maxHeight="90vh"
          maxWidth="95vw"
          onResizeStop={(e, direction, ref, d) => {
            setSize({
              width: size.width + d.width,
              height: size.height + d.height,
            });
          }}
          enable={{
            top: true,
            right: true,
            bottom: true,
            left: true,
            topRight: true,
            bottomRight: true,
            bottomLeft: true,
            topLeft: true,
          }}
          className="fixed bottom-4 right-4 z-50"
          style={{ position: 'fixed' }}
        >
          {chatContent}
        </Resizable>
      )}
    </>
  );
} 