import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      );
    }

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

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.detail || data.message || '일자리 목록 조회 실패' },
        { status: response.status }
      );
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

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
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



