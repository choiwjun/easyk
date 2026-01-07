import { NextRequest, NextResponse } from 'next/server';

// Force redeployment - v2
const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_BACKEND_URL || 'https://easyk-production.up.railway.app';

// 샘플 문서 템플릿 데이터
const SAMPLE_DOCUMENT_TEMPLATES = [
  {
    id: '00000000-0000-0000-0000-000000000101',
    name: '정부지원 신청서',
    name_en: 'Government Support Application',
    category: 'support_application',
    description: '정부지원 프로그램 신청을 위한 기본 신청서입니다.',
    description_en: 'Basic application form for government support programs.',
    file_url: '/templates/support_application.pdf',
    language: 'ko',
  },
  {
    id: '00000000-0000-0000-0000-000000000102',
    name: '외국인 등록 신청서',
    name_en: 'Foreigner Registration Form',
    category: 'registration',
    description: '외국인 등록을 위한 신청서 양식입니다.',
    description_en: 'Application form for foreigner registration.',
    file_url: '/templates/registration.pdf',
    language: 'ko',
  },
  {
    id: '00000000-0000-0000-0000-000000000103',
    name: '비자 연장 신청서',
    name_en: 'Visa Extension Application',
    category: 'visa',
    description: '비자 연장 신청을 위한 양식입니다.',
    description_en: 'Application form for visa extension.',
    file_url: '/templates/visa_extension.pdf',
    language: 'ko',
  },
];

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization');

    // URL 파라미터 추출
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const language = searchParams.get('language') || 'ko';

    // 토큰이 있을 때만 백엔드 호출 시도
    if (token) {
      // 쿼리 파라미터 구성
      const queryParams = new URLSearchParams({ language });
      if (category) queryParams.append('category', category);

      const url = `${BACKEND_URL}/api/document-templates?${queryParams}`;

      try {
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Authorization': token,
          },
        });

        const data = await response.json();

        if (response.ok && Array.isArray(data) && data.length > 0) {
          return NextResponse.json(data, { status: response.status });
        }

        // 백엔드 응답이 비어있거나 실패한 경우 샘플 데이터 반환
        console.info('[API Route] Backend returned empty/failed, using sample document templates');
      } catch (fetchError) {
        console.info('[API Route] Backend fetch failed, using sample document templates:', fetchError);
      }
    } else {
      console.info('[API Route] No auth token, using sample document templates');
    }

    // 샘플 데이터 필터링
    let filteredTemplates = SAMPLE_DOCUMENT_TEMPLATES;
    if (category) {
      filteredTemplates = filteredTemplates.filter(t => t.category === category);
    }

    return NextResponse.json(filteredTemplates, { status: 200 });
  } catch (error) {
    console.error('Document templates fetch error:', error);
    return NextResponse.json(
      { message: '네트워크 오류가 발생했습니다' },
      { status: 500 }
    );
  }
}
