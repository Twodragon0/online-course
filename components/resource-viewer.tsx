import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface ResourceViewerProps {
  resource: {
    url: string;
    title: string;
  };
  type: 'video' | 'document';
}

export function ResourceViewer({ resource, type }: ResourceViewerProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleAccess = async () => {
    setIsLoading(true);
    try {
      // Google Drive 파일 ID 추출
      const fileId = resource.url.split('id=')[1];
      
      // Google Drive 공유 링크 생성
      const shareableLink = `https://drive.google.com/file/d/${fileId}/view?usp=sharing`;
      
      // 새 탭에서 열기
      window.open(shareableLink, '_blank');
    } catch (error) {
      toast.error('파일 접근에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      onClick={handleAccess}
      disabled={isLoading}
      variant="outline"
      className="w-full"
    >
      {type === 'video' ? '🎥' : '📄'} {resource.title} 보기
    </Button>
  );
} 