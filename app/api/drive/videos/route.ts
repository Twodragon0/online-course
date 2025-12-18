import { NextResponse } from 'next/server';
import { getWeekVideos, getAllWeekVideos, getVideosInFolder, extractFileIdFromUrl, getDriveFileLink } from '@/lib/google-drive';
import { checkRateLimit, getClientIp } from '@/lib/security';

/**
 * GET /api/drive/videos
 * Google Drive에서 동영상 강의 조회
 * 
 * Query Parameters:
 * - batch: 기수 (예: "3기")
 * - week: 주차 (예: 3)
 * - folderId: 직접 폴더 ID 지정
 * - all: 모든 기수 조회 (true/false)
 */
export async function GET(request: Request) {
  try {
    // Rate limiting
    const clientIp = getClientIp(request);
    const rateLimit = await checkRateLimit(`drive-videos:${clientIp}`, 20, 60000); // 1분에 20회
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: '요청이 너무 많습니다. 잠시 후 다시 시도해주세요.' },
        {
          status: 429,
          headers: {
            'Retry-After': '60',
            'X-RateLimit-Limit': '20',
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': rateLimit.resetTime.toString(),
          },
        }
      );
    }

    const { searchParams } = new URL(request.url);
    const batch = searchParams.get('batch');
    const weekParam = searchParams.get('week');
    const folderId = searchParams.get('folderId');
    const all = searchParams.get('all') === 'true';

    // 폴더 ID로 직접 조회
    if (folderId) {
      const videos = await getVideosInFolder(folderId);
      return NextResponse.json({
        folderId,
        videos: videos.map((video) => ({
          id: video.id,
          name: video.name,
          mimeType: video.mimeType,
          link: getDriveFileLink(video.id, 'preview'),
          viewLink: getDriveFileLink(video.id, 'view'),
          thumbnailLink: video.thumbnailLink,
        })),
      });
    }

    // 주차가 없으면 에러
    if (!weekParam) {
      return NextResponse.json(
        { error: '주차(week) 또는 폴더 ID(folderId)가 필요합니다.' },
        { status: 400 }
      );
    }

    const week = parseInt(weekParam, 10);
    if (isNaN(week) || week < 1) {
      return NextResponse.json(
        { error: '유효한 주차 번호를 입력해주세요.' },
        { status: 400 }
      );
    }

    // 모든 기수 조회
    if (all) {
      const results = await getAllWeekVideos(week);
      return NextResponse.json({
        week,
        batches: results.map((result) => ({
          batch: result.batch,
          videos: result.videos.map((video) => ({
            id: video.id,
            name: video.name,
            mimeType: video.mimeType,
            link: getDriveFileLink(video.id, 'preview'),
            viewLink: getDriveFileLink(video.id, 'view'),
            thumbnailLink: video.thumbnailLink,
          })),
        })),
      });
    }

    // 특정 기수 조회
    if (!batch) {
      return NextResponse.json(
        { error: '기수(batch)가 필요합니다. 또는 all=true로 모든 기수를 조회할 수 있습니다.' },
        { status: 400 }
      );
    }

    const videos = await getWeekVideos(batch, week);
    
    return NextResponse.json({
      batch,
      week,
      videos: videos.map((video) => ({
        id: video.id,
        name: video.name,
        mimeType: video.mimeType,
        link: getDriveFileLink(video.id, 'preview'),
        viewLink: getDriveFileLink(video.id, 'view'),
        thumbnailLink: video.thumbnailLink,
      })),
    }, {
      headers: {
        'X-RateLimit-Limit': '20',
        'X-RateLimit-Remaining': rateLimit.remaining.toString(),
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });
  } catch (error) {
    console.error('Failed to fetch videos from Google Drive:', error);
    return NextResponse.json(
      { 
        error: 'Google Drive에서 동영상을 가져오는데 실패했습니다.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

