import { NextRequest, NextResponse } from 'next/server';
import { SAMPLE_SUPPORTS } from '@/lib/sampleData';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

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

    const { id: supportId } = await params;

    const url = `${BACKEND_URL}/api/supports/${supportId}`;

    try {
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': authHeader,
        },
      });

      const data = await response.json();

      if (response.ok && data) {
        return NextResponse.json(data, { status: response.status });
      }

      // 백엔드 실패 시 샘플 데이터에서 조회
      console.info('[API Route] Backend failed, checking sample data for support:', supportId);
    } catch (fetchError) {
      console.info('[API Route] Backend fetch failed, using sample data:', fetchError);
    }

    // 샘플 데이터에서 해당 ID 찾기
    const sampleSupport = SAMPLE_SUPPORTS.find(s => s.id === supportId);

    if (sampleSupport) {
      return NextResponse.json(sampleSupport, { status: 200 });
    }

    return NextResponse.json(
      { message: '지원 정보를 찾을 수 없습니다' },
      { status: 404 }
    );
  } catch (error) {
    console.error('[API Route] Support Detail GET error:', error);
    return NextResponse.json(
      { message: '지원 상세 조회 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}







