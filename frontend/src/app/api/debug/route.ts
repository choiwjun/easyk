import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'http://127.0.0.1:8000';

export async function GET() {
  try {
    // 백엔드 health check
    const healthResponse = await fetch(`${BACKEND_URL}/health`, {
      cache: 'no-store',
    });
    const healthText = await healthResponse.text();

    return NextResponse.json({
      envCheck: {
        BACKEND_URL: process.env.BACKEND_URL || 'NOT SET',
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'NOT SET',
        resolvedUrl: BACKEND_URL,
      },
      backendHealth: {
        status: healthResponse.status,
        response: healthText.substring(0, 500),
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    return NextResponse.json({
      envCheck: {
        BACKEND_URL: process.env.BACKEND_URL || 'NOT SET',
        NEXT_PUBLIC_BACKEND_URL: process.env.NEXT_PUBLIC_BACKEND_URL || 'NOT SET',
        resolvedUrl: BACKEND_URL,
      },
      backendHealth: {
        error: String(error),
      },
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}
