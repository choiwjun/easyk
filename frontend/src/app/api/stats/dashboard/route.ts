import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://easyk-production.up.railway.app';

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');

    if (!token) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/stats/dashboard`, {
      method: 'GET',
      headers: {
        'Authorization': token,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.detail || data.message || '통계 조회에 실패했습니다' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Stats fetch error:', error);
    return NextResponse.json(
      { message: '네트워크 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
