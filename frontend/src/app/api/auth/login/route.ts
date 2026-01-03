import { NextRequest, NextResponse } from 'next/server';

const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

// Vercel deployment fix - force rebuild
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const response = await fetch(`${BACKEND_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });

    const data = await response.json();

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
    console.error('Login API error:', error);
    return NextResponse.json(
      { message: '로그인 중 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
