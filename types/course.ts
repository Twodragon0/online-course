export interface CourseVideo {
  url: string;
  title: string;
  summary: string;
}

export interface CourseVideos {
  devsecops: CourseVideo[];
  aiSns: CourseVideo[];
}

export type CourseType = 'devsecops' | 'aiSns'; 