import { NextRequest, NextResponse } from 'next/server';

// 서버 사이드에서는 BACKEND_URL, 클라이언트에서는 NEXT_PUBLIC_BACKEND_URL 사용
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    console.log('[API Route] Consultations Incoming - Environment check:');
    console.log('  BACKEND_URL:', process.env.BACKEND_URL ? 'SET' : 'NOT SET');
    console.log('  NEXT_PUBLIC_BACKEND_URL:', process.env.NEXT_PUBLIC_BACKEND_URL ? 'SET' : 'NOT SET');
    console.log('  Resolved URL:', BACKEND_URL);

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
        'Content-Type': 'application/json',
      },
      cache: 'no-store',
    });

    console.log('[API Route] Response status:', response.status);

    // 응답 본문을 텍스트로 먼저 읽기 (JSON 파싱 에러 방지)
    const responseText = await response.text();
    console.log('[API Route] Response body (first 500 chars):', responseText.substring(0, 500));

    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[API Route] JSON parse error:', parseError);
      return NextResponse.json(
        { message: '백엔드 응답 파싱 실패', rawResponse: responseText.substring(0, 200) },
        { status: 502 }
      );
    }

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
    console.error('[API Route] Error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack?.substring(0, 500),
    });
    return NextResponse.json(
      {
        message: '상담 요청 목록 조회 중 오류가 발생했습니다',
        error: String(error),
        backendUrl: BACKEND_URL,
        envCheck: {
          BACKEND_URL: process.env.BACKEND_URL ? 'SET' : 'NOT SET',
          NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL ? 'SET' : 'NOT SET',
        }
      },
      { status: 500 }
    );
  }
}
