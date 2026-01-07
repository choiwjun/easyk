import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://easyk-production.up.railway.app';

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
      // 백엔드에서 이미 한국어 메시지를 반환하면 그대로 사용
      // 영문 메시지인 경우 한국어로 변환
      const errorMessages: Record<string, string> = {
        'Incorrect email or password': '이메일 또는 비밀번호가 올바르지 않습니다',
        'User not found': '등록되지 않은 이메일입니다',
        'Invalid credentials': '인증 정보가 유효하지 않습니다',
        'Email not verified': '이메일 인증이 필요합니다',
        'Account is disabled': '비활성화된 계정입니다',
      };

      // 백엔드 메시지 그대로 사용하거나 영문→한국어 변환
      const backendMessage = data.detail || data.message;
      const message = errorMessages[backendMessage] || backendMessage || '이메일 또는 비밀번호를 확인해주세요';
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

