"use client";

import { FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface DocumentViewerProps {
  documentUrl: string;
}

export function DocumentViewer({ documentUrl }: DocumentViewerProps) {
  const embedUrl = documentUrl.replace('/edit?usp=share_link', '/preview');

  return (
    <div className="w-full rounded-lg overflow-hidden border">
      <div className="bg-secondary p-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          <span className="font-medium">Document Viewer</span>
        </div>
        <Button
          variant="outline"
          onClick={() => window.open(documentUrl, '_blank')}
        >
          Open in Google Docs
        </Button>
      </div>
      <iframe
        src={embedUrl}
        className="w-full h-[600px]"
        frameBorder="0"
      />
    </div>
  );
} 