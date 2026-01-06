import { NextRequest, NextResponse } from 'next/server';

// 서버 사이드에서는 BACKEND_URL, 클라이언트에서는 NEXT_PUBLIC_BACKEND_URL 사용
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    console.log('[API Route] Consultations Incoming - BACKEND_URL:', BACKEND_URL);

    if (!authHeader) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    // Get status query parameter if present
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const queryString = status ? `?status=${status}` : '';

    const targetUrl = `${BACKEND_URL}/api/consultations/incoming${queryString}`;
    console.log('[API Route] Fetching:', targetUrl);

    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    console.log('[API Route] Response status:', response.status);

    const data = await response.json();

    if (!response.ok) {
      console.log('[API Route] Error response:', data);
      const errorMessages: Record<string, string> = {
        'Unauthorized': '인증이 필요합니다',
        'Forbidden': '접근 권한이 없습니다. 전문가 계정으로 로그인해주세요.',
        'Not found': '요청한 리소스를 찾을 수 없습니다',
      };

      const message = errorMessages[data.detail] || data.message || data.detail || '상담 요청 목록 조회 실패';
      return NextResponse.json({ message }, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Consultations Incoming GET error:', error);
    return NextResponse.json(
      { message: '상담 요청 목록 조회 중 오류가 발생했습니다', error: String(error) },
      { status: 500 }
    );
  }
}
