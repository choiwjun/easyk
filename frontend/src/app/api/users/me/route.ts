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

    const response = await fetch(`${BACKEND_URL}/api/users/me`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json({ message: data.message || '프로필 조회 실패' }, { status: response.status });
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
  console.log('[API Route] PUT /api/users/me called - START');
  
  try {
    const authHeader = request.headers.get('authorization');
    console.log('[API Route] Auth header:', authHeader ? 'Present' : 'Missing');
    
    if (!authHeader) {
      console.log('[API Route] No authorization header');
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const body = await request.json();
    console.log('[API Route] Request body:', body);
    console.log('[API Route] Backend URL:', BACKEND_URL);

    const response = await fetch(`${BACKEND_URL}/api/users/me`, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('[API Route] Backend response status:', response.status);

    const data = await response.json();
    console.log('[API Route] Backend response data:', data);

    if (!response.ok) {
      return NextResponse.json({ message: data.message || '프로필 업데이트 실패' }, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Profile PUT error:', error);
    return NextResponse.json(
      { message: '프로필 업데이트 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
