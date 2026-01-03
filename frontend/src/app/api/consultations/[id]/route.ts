import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authHeader = request.headers.get('authorization');

    if (!authHeader) {
      return NextResponse.json(
        { message: '인증이 필요합니다' },
        { status: 401 }
      );
    }

    const consultationId = params.id;

    const response = await fetch(`${BACKEND_URL}/api/consultations/${consultationId}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
      },
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessages: Record<string, string> = {
        'Unauthorized': '인증이 필요합니다',
        'Forbidden': '접근 권한이 없습니다',
        'Consultation not found': '상담을 찾을 수 없습니다',
      };

      const message = errorMessages[data.detail] || data.message || '상담 조회 실패';
      return NextResponse.json({ message }, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Consultation GET error:', error);
    return NextResponse.json(
      { message: '상담 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
