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

    // Extract query parameters
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const keyword = searchParams.get('keyword');
    const limit = searchParams.get('limit') || '20';
    const offset = searchParams.get('offset') || '0';

    // Build backend URL with query parameters
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (keyword) params.append('keyword', keyword);
    params.append('limit', limit);
    params.append('offset', offset);

    const url = `${BACKEND_URL}/api/supports?${params.toString()}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.detail || data.message || '지원 목록 조회 실패' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Supports GET error:', error);
    return NextResponse.json(
      { message: '지원 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
