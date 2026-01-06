import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');

    if (!token) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/supports/eligibility-check`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': token,
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.detail || data.message || '자격 확인에 실패했습니다' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('Eligibility check error:', error);
    return NextResponse.json(
      { message: '네트워크 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
