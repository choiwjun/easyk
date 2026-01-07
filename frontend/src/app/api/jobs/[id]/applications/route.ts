import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://easyk-production.up.railway.app';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const { id: jobId } = await params;
    const searchParams = request.nextUrl.searchParams;
    const status = searchParams.get('status');

    // Build query string
    const queryParams = new URLSearchParams();
    if (status) queryParams.append('status', status);
    const queryString = queryParams.toString();

    const url = `${BACKEND_URL}/api/jobs/${jobId}/applications${queryString ? `?${queryString}` : ''}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.detail || data.message || '지원자 목록 조회 실패' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Job Applications GET error:', error);
    return NextResponse.json(
      { message: '지원자 목록 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
