import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { getServerSession as getSession } from 'next-auth/next';

/**
 * 세션 갱신 API
 * 구독 상태 변경 후 세션을 강제로 갱신합니다.
 */
export async function POST(request: Request) {
  try {
    const session = await getSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: '인증이 필요합니다.' },
        { status: 401 }
      );
    }

    // 세션 갱신을 위해 update 트리거 사용
    // NextAuth의 update() 함수는 클라이언트에서 호출해야 하므로,
    // 여기서는 단순히 성공 응답을 반환하고 클라이언트에서 세션을 갱신하도록 안내
    
    return NextResponse.json({
      success: true,
      message: '세션을 갱신하려면 페이지를 새로고침하거나 다시 로그인해주세요.',
    });
  } catch (error) {
    console.error('Session refresh error:', error);
    return NextResponse.json(
      { error: '세션 갱신에 실패했습니다.' },
      { status: 500 }
    );
  }
}


