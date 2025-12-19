'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Upload, X, Check, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface FileUploadProps {
  folder?: string; // 'courses', 'users', 'pdfs' 등
  onUploadComplete?: (url: string, pathname: string) => void;
  onUploadError?: (error: string) => void;
  accept?: string; // 파일 타입 (예: 'application/pdf,image/*')
  maxSize?: number; // 최대 크기 (bytes)
  disabled?: boolean;
}

export function FileUpload({
  folder,
  onUploadComplete,
  onUploadError,
  accept = 'application/pdf,image/*',
  maxSize = 10 * 1024 * 1024, // 기본 10MB
  disabled = false,
}: FileUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ url: string; pathname: string } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // 파일 크기 검증
    if (file.size > maxSize) {
      const maxSizeMB = (maxSize / 1024 / 1024).toFixed(1);
      toast.error(`파일 크기는 최대 ${maxSizeMB}MB까지 허용됩니다.`);
      onUploadError?.(`파일 크기는 최대 ${maxSizeMB}MB까지 허용됩니다.`);
      return;
    }

    // 파일 타입 검증
    if (accept && !accept.split(',').some(type => {
      const trimmed = type.trim();
      if (trimmed.endsWith('/*')) {
        return file.type.startsWith(trimmed.slice(0, -2));
      }
      return file.type === trimmed;
    })) {
      toast.error('허용되지 않은 파일 형식입니다.');
      onUploadError?.('허용되지 않은 파일 형식입니다.');
      return;
    }

    await uploadFile(file);
  };

  const uploadFile = async (file: File) => {
    setUploading(true);
    setUploadedFile(null);

    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folder) {
        formData.append('folder', folder);
      }

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || '파일 업로드에 실패했습니다.');
      }

      const data = await response.json();
      setUploadedFile({ url: data.url, pathname: data.pathname });
      toast.success('파일이 업로드되었습니다.');
      onUploadComplete?.(data.url, data.pathname);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '파일 업로드에 실패했습니다.';
      toast.error(errorMessage);
      onUploadError?.(errorMessage);
    } finally {
      setUploading(false);
      // 파일 입력 초기화
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleRemove = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleFileSelect}
          disabled={disabled || uploading}
          className="hidden"
          id="file-upload-input"
        />
        <label htmlFor="file-upload-input">
          <Button
            type="button"
            variant="outline"
            disabled={disabled || uploading}
            className="cursor-pointer"
            asChild
          >
            <span>
              {uploading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  업로드 중...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  파일 선택
                </>
              )}
            </span>
          </Button>
        </label>

        {uploadedFile && (
          <div className="flex items-center gap-2 flex-1">
            <Check className="h-4 w-4 text-green-500" />
            <span className="text-sm text-muted-foreground truncate flex-1">
              업로드 완료
            </span>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleRemove}
              className="h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {uploadedFile && (
        <div className="p-3 bg-muted rounded-md">
          <p className="text-xs text-muted-foreground mb-1">업로드된 파일:</p>
          <a
            href={uploadedFile.url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-primary hover:underline break-all"
          >
            {uploadedFile.pathname}
          </a>
        </div>
      )}

      <p className="text-xs text-muted-foreground">
        최대 크기: {(maxSize / 1024 / 1024).toFixed(1)}MB
      </p>
    </div>
  );
}





