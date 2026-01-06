import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const authHeader = request.headers.get('authorization');
    const { id: jobId } = await params;
    const url = `${BACKEND_URL}/api/jobs/${jobId}`;

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
      return NextResponse.json(
        { message: data.detail || data.message || '일자리 상세 조회 실패' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Job Detail GET error:', error);
    return NextResponse.json(
      { message: '일자리 상세 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function PUT(
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
    const body = await request.json();
    const url = `${BACKEND_URL}/api/jobs/${jobId}`;

    const response = await fetch(url, {
      method: 'PUT',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.detail || data.message || '일자리 수정 실패' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Job PUT error:', error);
    return NextResponse.json(
      { message: '일자리 수정 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

export async function DELETE(
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
    const url = `${BACKEND_URL}/api/jobs/${jobId}`;

    const response = await fetch(url, {
      method: 'DELETE',
      headers: {
        'Authorization': authHeader,
      },
    });

    if (!response.ok) {
      const data = await response.json();
      return NextResponse.json(
        { message: data.detail || data.message || '일자리 삭제 실패' },
        { status: response.status }
      );
    }

    return NextResponse.json({ message: '일자리가 삭제되었습니다' }, { status: 200 });
  } catch (error) {
    console.error('[API Route] Job DELETE error:', error);
    return NextResponse.json(
      { message: '일자리 삭제 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

