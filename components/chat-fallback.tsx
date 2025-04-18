import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

interface ChatFallbackProps {
  onRetry: () => void;
  message?: string;
}

export function ChatFallback({ onRetry, message }: ChatFallbackProps) {
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertCircle className="h-4 w-4" />
      <AlertTitle>AI 응답 오류</AlertTitle>
      <AlertDescription className="space-y-4">
        <p>
          {message || '채팅 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해 주세요.'}
        </p>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onRetry}
          className="flex items-center gap-2"
        >
          <RefreshCw className="h-4 w-4" />
          다시 시도
        </Button>
      </AlertDescription>
    </Alert>
  );
} 