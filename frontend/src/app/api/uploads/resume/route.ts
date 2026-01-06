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

    // FormData 가져오기
    const formData = await request.formData();

    // 백엔드로 FormData 전송
    const response = await fetch(`${BACKEND_URL}/api/uploads/resume`, {
      method: 'POST',
      headers: {
        'Authorization': token,
      },
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.detail || data.message || '파일 업로드에 실패했습니다' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('File upload error:', error);
    return NextResponse.json(
      { message: '네트워크 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
