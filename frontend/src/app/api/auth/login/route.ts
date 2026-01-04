import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

// Vercel deployment fix - force rebuild
export async function POST(request: NextRequest) {
  console.log('[Login API] BACKEND_URL:', BACKEND_URL);

  try {
    const body = await request.json();
    console.log('[Login API] Request body received for email:', body.email);

    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    console.log('[Login API] Backend response status:', response.status);

    // 응답 텍스트 먼저 가져오기
    const responseText = await response.text();
    console.log('[Login API] Backend response text:', responseText.substring(0, 200));

    // JSON 파싱 시도
    let data;
    try {
      data = JSON.parse(responseText);
    } catch (parseError) {
      console.error('[Login API] JSON parse error:', parseError);
      return NextResponse.json(
        { message: '서버 응답을 처리할 수 없습니다. 잠시 후 다시 시도해주세요.' },
        { status: 502 }
      );
    }

    if (!response.ok) {
      // 에러 메시지 다국어 지원 개선
      const errorMessages: Record<string, string> = {
        'Incorrect email or password': '이메일 또는 비밀번호가 올바르지 않습니다',
        'User not found': '사용자를 찾을 수 없습니다',
        'Invalid credentials': '인증 정보가 유효하지 않습니다',
      };

      const message = errorMessages[data.detail] || data.message || '로그인 중 오류가 발생했습니다';
      return NextResponse.json({ message }, { status: response.status });
    }

    return NextResponse.json(data, { status: response.status });
  } catch (error) {
    console.error('[Login API] Error:', error);

    // 더 구체적인 에러 메시지
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 오류';
    return NextResponse.json(
      { message: `로그인 중 오류가 발생했습니다: ${errorMessage}` },
      { status: 500 }
    );
  }
}

