import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

// 폴더 내 개별 파일 정보 추가
const sampleData = [
  // OT 주차 자료 - 개별 파일
  {
    id: 'ot-file-1',
    title: '[OT] 강의 소개 및 환경 설정',
    description: 'DevSecOps 강의 소개 및 환경 설정 가이드',
    driveFileId: '1bTL-gG_Yqr1e2RjKMgH_r4FT33NZKU8f', // 예시 파일 ID
    courseId: 'ot-course',
    position: 1,
    course: {
      id: 'ot-course',
      title: 'OT 주차'
    },
    isFolder: false,
    type: 'video'
  },
  {
    id: 'ot-file-2',
    title: '[OT] 수업 계획 및 평가 방식',
    description: '학기 전체 커리큘럼 및 평가 기준 안내',
    driveFileId: '1pxGBHYJlKw8sYcPgMpOLZhElJVzKvt0e', // 예시 파일 ID
    courseId: 'ot-course',
    position: 2,
    course: {
      id: 'ot-course',
      title: 'OT 주차'
    },
    isFolder: false,
    type: 'video'
  },
  
  // 1주차 자료 - 개별 파일
  {
    id: 'week1-file-1',
    title: '[1주차] DevSecOps 개요',
    description: 'DevSecOps 개념과 등장 배경',
    driveFileId: '1Yyq5cHBD4mUx8fAl5vBeU3-iHGzT8TEx', // 예시 파일 ID
    courseId: 'week1-course',
    position: 1,
    course: {
      id: 'week1-course',
      title: '1주차 - DevSecOps 기초'
    },
    isFolder: false,
    type: 'video'
  },
  {
    id: 'week1-file-2',
    title: '[1주차] 보안 기본 개념',
    description: '사이버 보안 기초 및 핵심 용어',
    driveFileId: '1MUa7ckTVoJJlpZ4Tng_Cw-GhWrXN1IKw', // 예시 파일 ID
    courseId: 'week1-course',
    position: 2,
    course: {
      id: 'week1-course',
      title: '1주차 - DevSecOps 기초'
    },
    isFolder: false,
    type: 'video'
  },
  
  // 추가된 1주차 자료 - 회사규모_보안전략, devsecops_1, devsecops_2
  {
    id: 'week1-company-security',
    title: '[1주차] 회사규모별 보안전략',
    description: '기업 규모에 따른 보안 전략 수립 방법론',
    driveFileId: '1qI00ZzzLkZNGKYOzIDxjd25ErUaqypMu',
    courseId: 'week1-course',
    position: 3,
    course: {
      id: 'week1-course',
      title: '1주차 - DevSecOps 기초'
    },
    isFolder: false,
    type: 'video'
  },
  {
    id: 'week1-devsecops-1',
    title: '[1주차] DevSecOps 기초 (Part 1)',
    description: 'DevSecOps 패러다임의 기본 개념과 도입 이유',
    driveFileId: '1MfVxXIcSuKy7JeHjCJSqKtEYnAgAke90',
    courseId: 'week1-course',
    position: 4,
    course: {
      id: 'week1-course',
      title: '1주차 - DevSecOps 기초'
    },
    isFolder: false,
    type: 'video'
  },
  {
    id: 'week1-devsecops-2',
    title: '[1주차] DevSecOps 기초 (Part 2)',
    description: 'DevSecOps 구현 방법론과 실제 적용 사례',
    driveFileId: '1s1A7vY2PxAkgYLEHBSrYBsy_gYtiq5br',
    courseId: 'week1-course',
    position: 5,
    course: {
      id: 'week1-course',
      title: '1주차 - DevSecOps 기초'
    },
    isFolder: false,
    type: 'video'
  },
  
  // 폴더 정보 (참조용)
  {
    id: 'ot-folder',
    title: 'OT 주차 - 전체 강의 자료',
    description: 'DevSecOps 강의 소개 및 수업 안내',
    driveFileId: '1OT2F2yJseYCJaGltvk0JMDAYX44lGhMa',
    courseId: 'ot-course',
    position: 0,
    course: {
      id: 'ot-course',
      title: 'OT 주차'
    },
    isFolder: true,
    folderUrl: 'https://drive.google.com/drive/folders/1OT2F2yJseYCJaGltvk0JMDAYX44lGhMa?usp=share_link',
    type: 'folder'
  },
  {
    id: 'week1-folder',
    title: '1주차 - 전체 강의 자료',
    description: 'DevSecOps 개념과 중요성',
    driveFileId: '1eodgSMFMNdUMweJ6sHs7zcPQ1doaahk9',
    courseId: 'week1-course',
    position: 0,
    course: {
      id: 'week1-course',
      title: '1주차 - DevSecOps 기초'
    },
    isFolder: true,
    folderUrl: 'https://drive.google.com/drive/folders/1eodgSMFMNdUMweJ6sHs7zcPQ1doaahk9?usp=share_link',
    type: 'folder'
  },
  
  // 클라우드 보안 가이드 PDF 파일
  {
    id: 'cloud-security-pdf-folder',
    title: '클라우드 보안 가이드 - 자료 모음',
    description: '클라우드 환경 보안 설정 및 가이드라인 문서',
    driveFileId: '1nzmx_GBd8NJ2hSd5smamlWPKIBwEcjuH',
    courseId: 'cloud-security-course',
    position: 0,
    course: {
      id: 'cloud-security-course',
      title: '클라우드 보안 가이드'
    },
    isFolder: true,
    folderUrl: 'https://drive.google.com/drive/folders/1nzmx_GBd8NJ2hSd5smamlWPKIBwEcjuH?usp=share_link',
    type: 'folder'
  },
  
  // 2024 클라우드 보안 가이드 PDF 파일
  {
    id: 'cloud-security-aws-2024',
    title: '2024 AWS 클라우드 보안 가이드',
    description: '최신 AWS 클라우드 환경의 보안 설정 및 모범 사례 가이드 (2024년판)',
    driveFileId: '1MGASgPre1UMyw4J3RunWPMMppPGKcvsf',
    courseId: 'cloud-security-course',
    position: 1,
    course: {
      id: 'cloud-security-course',
      title: '클라우드 보안 가이드'
    },
    isFolder: false,
    type: 'pdf'
  },
  {
    id: 'cloud-security-azure-2024',
    title: '2024 Azure 클라우드 보안 가이드',
    description: '최신 Microsoft Azure 환경의 보안 설정 및 모범 사례 가이드 (2024년판)',
    driveFileId: '1BIi7cn9nQSWLm2t7knbTTUJ47Hthc_M2',
    courseId: 'cloud-security-course',
    position: 2,
    course: {
      id: 'cloud-security-course',
      title: '클라우드 보안 가이드'
    },
    isFolder: false,
    type: 'pdf'
  },
  {
    id: 'cloud-security-gcp-2024',
    title: '2024 GCP 클라우드 보안 가이드',
    description: '최신 Google Cloud Platform 환경의 보안 설정 및 모범 사례 가이드 (2024년판)',
    driveFileId: '13A038S4KnN7Kux7oOatvG3sm27AQuFkO',
    courseId: 'cloud-security-course',
    position: 3,
    course: {
      id: 'cloud-security-course',
      title: '클라우드 보안 가이드'
    },
    isFolder: false,
    type: 'pdf'
  },
  {
    id: 'cloud-security-supplementary',
    title: '클라우드 보안 보충 자료',
    description: '클라우드 환경 보안 관련 보충 자료 및 추가 학습 리소스',
    driveFileId: '1kC8HPScaJCPy7qoZgXr_k8mfLuLKQqq5',
    courseId: 'cloud-security-course',
    position: 4,
    course: {
      id: 'cloud-security-course',
      title: '클라우드 보안 가이드'
    },
    isFolder: false,
    type: 'pdf'
  },
  
  // 2023 클라우드 보안 가이드 PDF 파일
  {
    id: 'cloud-security-aws-2023',
    title: '2023 AWS 클라우드 보안 가이드',
    description: 'AWS 클라우드 환경의 보안 설정 및 모범 사례 가이드 (2023년판)',
    driveFileId: '1DPzH5KWT3AhYwGfKXMvfVBGPQSq9-ZxR',
    courseId: 'cloud-security-course',
    position: 4,
    course: {
      id: 'cloud-security-course',
      title: '클라우드 보안 가이드'
    },
    isFolder: false,
    type: 'pdf'
  },
  {
    id: 'cloud-security-azure-2023',
    title: '2023 Azure 클라우드 보안 가이드',
    description: 'Microsoft Azure 환경의 보안 설정 및 모범 사례 가이드 (2023년판)',
    driveFileId: '1oHVzTxn7KEgxSj8Vd_B_7WQJxTDuqPJb',
    courseId: 'cloud-security-course',
    position: 5,
    course: {
      id: 'cloud-security-course',
      title: '클라우드 보안 가이드'
    },
    isFolder: false,
    type: 'pdf'
  },
  {
    id: 'cloud-security-gcp-2023',
    title: '2023 GCP 클라우드 보안 가이드',
    description: 'Google Cloud Platform 환경의 보안 설정 및 모범 사례 가이드 (2023년판)',
    driveFileId: '1wE9pV8FrKTLe5n3JiJhpJFV9sJiN2x5Y',
    courseId: 'cloud-security-course',
    position: 6,
    course: {
      id: 'cloud-security-course',
      title: '클라우드 보안 가이드'
    },
    isFolder: false,
    type: 'pdf'
  },
  
  // 추가 클라우드 보안 관련 PDF 파일
  {
    id: 'cloud-security-vulnerability',
    title: '클라우드 취약점 점검 가이드 (2024)',
    description: '클라우드 환경의 보안 취약점 점검 방법 및 대응 방안',
    driveFileId: '1K9pJqT4nW3XvZGz67bmRS5cYuLkDwf2v',
    courseId: 'cloud-security-course',
    position: 7,
    course: {
      id: 'cloud-security-course',
      title: '클라우드 보안 가이드'
    },
    isFolder: false,
    type: 'pdf'
  },
  {
    id: 'cloud-security-practices-guide',
    title: '클라우드 보안 실무 가이드',
    description: '조직에서 활용 가능한 클라우드 보안 실무 모범 사례 및 체크리스트',
    driveFileId: '1LMlR5JhUZ7BxeQC2W9fkTnGv1OYsi4dR',
    courseId: 'cloud-security-course',
    position: 8,
    course: {
      id: 'cloud-security-course',
      title: '클라우드 보안 가이드'
    },
    isFolder: false,
    type: 'pdf'
  },
  {
    id: 'cloud-security-isms',
    title: '정보보호 및 개인정보보호관리체계(ISMS-P) 운영 가이드',
    description: '클라우드 환경에서의 ISMS-P 인증 준비 및 운영 가이드',
    driveFileId: '1pBWb3X5zKRj6DEV9J2oMTH2f4tYxPNyZ',
    courseId: 'cloud-security-course',
    position: 9,
    course: {
      id: 'cloud-security-course',
      title: '클라우드 보안 가이드'
    },
    isFolder: false,
    type: 'pdf'
  },
  {
    id: 'cloud-security-aws-log',
    title: 'AWS 로그 수집 가이드',
    description: 'AWS 클라우드 환경에서의 보안 로그 수집 및 분석 방법',
    driveFileId: '1YtGseJR2Qv6nhkFUe7NLwPU9JmkZvrMO',
    courseId: 'cloud-security-course',
    position: 10,
    course: {
      id: 'cloud-security-course',
      title: '클라우드 보안 가이드'
    },
    isFolder: false,
    type: 'pdf'
  },
  {
    id: 'cloud-security-containers',
    title: '컨테이너 보안 가이드',
    description: 'Docker 및 Kubernetes 환경의 보안 설정 및 취약점 대응 방안',
    driveFileId: '1TwJF8pEL3X2QdK7NmvZ5lR9DchG4nSpX',
    courseId: 'cloud-security-course',
    position: 11,
    course: {
      id: 'cloud-security-course',
      title: '클라우드 보안 가이드'
    },
    isFolder: false,
    type: 'pdf'
  },
  {
    id: 'cloud-security-devsecops',
    title: 'DevSecOps 실무 가이드',
    description: 'DevSecOps 도입 및 운영을 위한 실무 가이드',
    driveFileId: '1fPj5qR1nHvGk8tMSNz3e7vKJyXLw2ZQo',
    courseId: 'cloud-security-course',
    position: 12,
    course: {
      id: 'cloud-security-course',
      title: '클라우드 보안 가이드'
    },
    isFolder: false,
    type: 'pdf'
  },
  {
    id: 'cloud-security-behind-clouds',
    title: 'Behind the Clouds',
    description: '클라우드 인프라 기술 이면의 보안 아키텍처 및 컴플라이언스 가이드',
    driveFileId: '1ka-7PAyjJa7_JfAci4tMkdB0BGyLIjXX',
    courseId: 'cloud-security-course',
    position: 13,
    course: {
      id: 'cloud-security-course',
      title: '클라우드 보안 가이드'
    },
    isFolder: false,
    type: 'pdf'
  },
  
  // 추가 과정 비디오 (페이지 구분을 위한 다양한 컨텐츠)
  {
    id: 'devsecops-intro',
    title: '🛡️ DevSecOps 과정 - intro',
    description: '클라우드 보안과 DevSecOps 기초 학습',
    driveFileId: '1er3p4BdWsYmeLUuhMshS10EImWYvWWcU',
    courseId: 'devsecops-course',
    position: 1,
    course: {
      id: 'devsecops-course',
      title: '🛡️ DevSecOps 과정'
    },
    isFolder: false,
    type: 'video'
  },
  {
    id: 'aws-security',
    title: '☁️ AWS 보안 실습',
    description: 'AWS 클라우드 환경의 보안 설정 실습',
    driveFileId: '1VzQH9OhfL0KCEr9c8R7MZ1Jv-JDjxKiV',
    courseId: 'cloud-course',
    position: 1,
    course: {
      id: 'cloud-course',
      title: '클라우드 보안'
    },
    isFolder: false,
    type: 'video'
  },
  {
    id: 'docker-security',
    title: '🐳 Docker 실습',
    description: 'Docker를 활용한 컨테이너 보안 실습',
    driveFileId: '1wKzYH3J-fSNFwcyNg0E3XeDhIsO1mpLQ',
    courseId: 'container-course',
    position: 1,
    course: {
      id: 'container-course',
      title: '컨테이너 보안'
    },
    isFolder: false,
    type: 'video'
  }
];

export async function GET() {
  const session = await getServerSession();

  if (!session) {
    return NextResponse.json(
      { error: "인증이 필요합니다" },
      { status: 401 }
    );
  }

  try {
    // 임시로 샘플 데이터 반환
    return NextResponse.json(sampleData);
  } catch (error) {
    console.error('비디오 가져오기 실패:', error);
    return NextResponse.json(
      { error: "비디오를 가져오는데 실패했습니다" },
      { status: 500 }
    );
  }
}