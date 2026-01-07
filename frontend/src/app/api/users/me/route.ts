import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://easyk-production.up.railway.app';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      // 에러 메시지 개선
      const errorMessages: Record<string, string> = {
        'Unauthorized': '인증이 필요합니다',
        'User not found': '사용자를 찾을 수 없습니다',
      };

      const message = errorMessages[data.detail] || data.message || '프로필 조회 실패';
      return NextResponse.json({ message }, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Profile GET error:', error);
    return NextResponse.json(
      { message: '프로필 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  // MEDIUM FIX: 프로덕션에서는 상세 로깅 제거 (보안)
  const isDevelopment = process.env.NODE_ENV === 'development';

  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/users/me`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.message || '프로필 업데이트 실패' }, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    // 개발 환경에서만 상세 에러 로그
    if (isDevelopment) {
      console.error('[API Route] Profile PUT error:', error);
    }
    return NextResponse.json(
      { message: '프로필 업데이트 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
