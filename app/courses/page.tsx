'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Pagination } from '@/components/pagination';
import { VideoCard } from '@/components/video-card';
import { PdfCard } from '@/components/pdf-card';
import { useSession } from "next-auth/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ExternalLink, FileText } from "lucide-react";
import Link from "next/link";

const ITEMS_PER_PAGE = 6; // Increased items per page for more content visibility

interface ContentItem {
  id: string;
  title: string;
  description: string | null;
  driveFileId: string | null;
  courseId: string;
  position: number;
  course: {
    id: string;
    title: string;
  };
  isFolder?: boolean;
  folderUrl?: string | null;
  type?: 'video' | 'pdf' | 'folder';
}

interface Section {
  id: string;
  title: string;
  description: string;
  items: ContentItem[];
  folderUrl?: string | null;
}

export default function CoursesPage() {
  const { data: session, status } = useSession();
  const searchParams = useSearchParams();
  const [items, setItems] = useState<ContentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [folderUrls, setFolderUrls] = useState<Record<string, string | null>>({});

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const response = await fetch('/api/videos');
        const data = await response.json();
        
        // Extract content items (not folders)
        const contentItems = Array.isArray(data) 
          ? data.filter(item => !item.isFolder)
          : [];
          
        // Extract folder URLs
        const folderUrlMap: Record<string, string | null> = {};
        if (Array.isArray(data)) {
          data.filter(item => item.isFolder).forEach(folder => {
            folderUrlMap[folder.courseId] = folder.folderUrl;
          });
        }
        
        setItems(contentItems);
        setFolderUrls(folderUrlMap);
      } catch (error) {
        console.error('Failed to fetch content:', error);
        setItems([]);
      } finally {
        setLoading(false);
      }
    };

    if (session) {
      fetchContent();
    } else if (status !== 'loading') {
      setLoading(false);
    }
  }, [session, status]);

  // Pagination logic
  const currentPage = Number(searchParams?.get('page') ?? '1');
  const totalPages = Math.ceil((items?.length || 0) / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = items?.slice?.(startIndex, startIndex + ITEMS_PER_PAGE) || [];

  // Group items by course
  const groupedItems: Record<string, ContentItem[]> = {};
  
  paginatedItems.forEach(item => {
    const courseId = item.course.id;
    if (!groupedItems[courseId]) {
      groupedItems[courseId] = [];
    }
    groupedItems[courseId].push(item);
  });

  // Create sections based on grouped items
  const sections: Section[] = Object.entries(groupedItems).map(([courseId, courseItems]) => {
    // Use the first item's course title as the section title
    const courseTitle = courseItems[0].course.title;
    
    return {
      id: courseId,
      title: courseTitle,
      description: `${courseTitle} 관련 자료`,
      items: courseItems,
      folderUrl: folderUrls[courseId] || null
    };
  });

  if (loading) {
    return (
      <div className="container mx-auto py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="space-y-8 mt-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="border rounded-lg p-6">
                  <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // If not logged in, show login prompt
  if (!session && status !== 'loading') {
    return (
      <div className="container mx-auto py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <Alert>
            <AlertTitle>로그인이 필요합니다</AlertTitle>
            <AlertDescription>
              강의 콘텐츠를 보려면 먼저 로그인을 해주세요.
            </AlertDescription>
            <div className="mt-4">
              <Button asChild>
                <Link href="/auth/signin">로그인 하기</Link>
              </Button>
            </div>
          </Alert>
        </div>
      </div>
    );
  }

  // Render appropriate component based on item type
  const renderContentItem = (item: ContentItem) => {
    if (item.type === 'pdf') {
      return (
        <PdfCard
          key={item.id}
          id={item.id}
          title={item.title}
          description={item.description}
          driveFileId={item.driveFileId}
        />
      );
    } else {
      return (
        <VideoCard
          key={item.id}
          id={item.id}
          title={item.title}
          description={item.description}
          driveFileId={item.driveFileId}
        />
      );
    }
  };

  return (
    <div className="container mx-auto py-24 px-4">
      <div className="max-w-5xl mx-auto space-y-12">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">강의 자료</h1>
          <p className="text-muted-foreground">모든 강의 자료를 확인하세요.</p>
        </div>

        {sections.length === 0 ? (
          <Alert>
            <AlertTitle>표시할 자료가 없습니다</AlertTitle>
            <AlertDescription>
              현재 페이지에 표시할 자료가 없습니다. 다른 페이지를 확인하거나 나중에 다시 시도해주세요.
            </AlertDescription>
          </Alert>
        ) : (
          sections.map((section) => (
            <section key={section.id} className="space-y-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold">{section.title}</h2>
                  {section.folderUrl && (
                    <Button variant="outline" size="sm" asChild>
                      <a 
                        href={section.folderUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="flex items-center gap-2"
                      >
                        <ExternalLink className="h-4 w-4" />
                        폴더 열기
                      </a>
                    </Button>
                  )}
                </div>
                <p className="text-muted-foreground">{section.description}</p>
              </div>

              <div className="grid md:grid-cols-1 lg:grid-cols-2 gap-6">
                {section.items.map((item) => renderContentItem(item))}
              </div>
            </section>
          ))
        )}

        {items.length > ITEMS_PER_PAGE && (
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
          />
        )}
      </div>
    </div>
  );
}