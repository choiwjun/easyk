import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://easyk-production.up.railway.app';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    // Query parameters
    const searchParams = request.nextUrl.searchParams;
    const location = searchParams.get('location');
    const employment_type = searchParams.get('employment_type');
    const keyword = searchParams.get('keyword');
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';

    // Build query string
    const queryParams = new URLSearchParams();
    if (location) queryParams.append('location', location);
    if (employment_type) queryParams.append('employment_type', employment_type);
    if (keyword) queryParams.append('keyword', keyword);
    queryParams.append('limit', limit);
    queryParams.append('offset', offset);

    const queryString = queryParams.toString();
    const url = `${BACKEND_URL}/api/jobs${queryString ? `?${queryString}` : ''}`;

    // 인증 헤더는 선택적으로 전달 (비로그인도 접근 가능)
    const headers: HeadersInit = {};
    if (authHeader) {
      headers['Authorization'] = authHeader;
    }

    const response = await fetch(url, {
      method: 'GET',
      headers,
    });

    const data = await response.json();

    if (!response.ok) {
      // 에러 메시지 개선
      const errorMessages: Record<string, string> = {
        'Unauthorized': '인증이 필요합니다',
        'Job not found': '일자리 공고를 찾을 수 없습니다',
      };

      const message = errorMessages[data.detail] || data.message || '일자리 목록 조회 실패';
      return NextResponse.json({ message }, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Jobs GET error:', error);
    return NextResponse.json(
      { message: '일자리 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const url = `${BACKEND_URL}/api/jobs`;

    console.log('[API Route] Jobs POST - Request body:', JSON.stringify(body, null, 2));
    console.log('[API Route] Jobs POST - Backend URL:', url);

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const responseText = await response.text();
    console.log('[API Route] Jobs POST - Response status:', response.status);
    console.log('[API Route] Jobs POST - Response body:', responseText);

    let data;
    try {
      data = JSON.parse(responseText);
    } catch {
      return NextResponse.json(
        { message: `Backend error: ${responseText}` },
        { status: response.status }
      );
    }

    if (!response.ok) {
      // Handle Pydantic validation errors
      if (data.detail && Array.isArray(data.detail)) {
        const errorMessages = data.detail.map((err: { loc?: string[]; msg?: string }) =>
          `${err.loc?.join('.')}: ${err.msg}`
        ).join(', ');
        return NextResponse.json(
          { message: errorMessages || '일자리 생성 실패' },
          { status: response.status }
        );
      }
      return NextResponse.json(
        { message: data.detail || data.message || '일자리 생성 실패' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Jobs POST error:', error);
    return NextResponse.json(
      { message: '일자리 생성 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}




