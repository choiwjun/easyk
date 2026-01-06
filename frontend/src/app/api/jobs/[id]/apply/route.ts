import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export async function POST(
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

    // FormData 처리
    const contentType = request.headers.get('content-type') || '';
    let applicationData: { cover_letter?: string; resume_url?: string } = {};

    if (contentType.includes('multipart/form-data')) {
      // FormData로 받은 경우
      const formData = await request.formData();
      const coverLetter = formData.get('cover_letter') as string || '';
      const resumeFile = formData.get('resume') as File | null;

      // 파일이 있으면 파일명을 resume_url로 사용 (실제 업로드는 별도 구현 필요)
      // 현재는 데모용으로 파일명만 저장
      applicationData = {
        cover_letter: coverLetter,
        resume_url: resumeFile ? `uploads/${resumeFile.name}` : undefined,
      };
    } else {
      // JSON으로 받은 경우
      applicationData = await request.json();
    }

    const url = `${BACKEND_URL}/api/jobs/${jobId}/apply`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(applicationData),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { message: data.detail || data.message || '일자리 지원 실패' },
        { status: response.status }
      );
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[API Route] Job Apply POST error:', error);
    return NextResponse.json(
      { message: '일자리 지원 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}

