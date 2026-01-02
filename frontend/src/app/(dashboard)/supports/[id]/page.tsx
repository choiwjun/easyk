"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Button from "@/components/ui/Button";

interface Support {
  id: string;
  title: string;
  category: string;
  description: string;
  eligibility: string | null;
  eligible_visa_types: string[];
  support_content: string | null;
  department: string;
  department_phone: string | null;
  department_website: string | null;
  application_period_start: string | null;
  application_period_end: string | null;
  official_link: string | null;
  status: string;
  created_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  subsidy: "장려금",
  education: "교육",
  training: "훈련",
  visa: "비자/체류",
  housing: "주거",
};

const CATEGORY_ICONS: Record<string, string> = {
  subsidy: "💰",
  education: "📚",
  training: "🎓",
  visa: "🪪",
  housing: "🏠",
};

const STATUS_LABELS: Record<string, string> = {
  active: "모집중",
  inactive: "비활성",
  ended: "마감",
};

export default function SupportsDetailPage() {
  const router = useRouter();
  const params = useParams();
  const supportId = params.id as string;
  const [support, setSupport] = useState<Support | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchSupportDetail();
  }, [supportId]);

  const fetchSupportDetail = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch(`/api/supports/${supportId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setSupport(data);
      } else if (response.status === 403) {
        router.push("/login");
      } else {
        setError("지원 상세 정보를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  if (error && !support) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">정부 지원 정보</h1>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-6 text-center">
            <p className="text-gray-600 mb-4">{error}</p>
            <Button variant="outline" onClick={() => router.push("/supports")}>
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!support) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900">정부 지원 정보</h1>
          </div>
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">
              지원 정보를 불러오는데 실패했습니다.
            </p>
            <Button variant="outline" onClick={() => router.push("/supports")}>
              목록으로 돌아가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900">정부 지원 정보</h1>
        </div>

        {/* 뒤로가기 버튼 */}
        <button
          onClick={() => router.push("/supports")}
          className="text-blue-600 hover:text-blue-700 flex items-center gap-2 mb-6"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          목록으로 돌아가기
        </button>

        {/* 상태 배지 */}
        <div className="mb-4">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
              support.status === "active"
                ? "bg-green-100 text-green-800"
                : support.status === "ended"
                ? "bg-gray-100 text-gray-800"
                : "bg-yellow-100 text-yellow-800"
            }`}
          >
            {STATUS_LABELS[support.status] || support.status}
          </span>
        </div>

        {/* 제목 및 카테고리 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-start gap-4 mb-4">
            <span className="text-4xl">
              {CATEGORY_ICONS[support.category] || "📋"}
            </span>
            <div className="flex-1">
              <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded text-sm mb-2">
                {CATEGORY_LABELS[support.category] || support.category}
              </span>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {support.title}
              </h2>
            </div>
          </div>

          <p className="text-gray-700 leading-relaxed">{support.description}</p>
        </div>

        {/* 상세 정보 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">상세 정보</h3>

          {/* 자격 조건 */}
          {support.eligibility && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">자격 조건</h4>
              <p className="text-gray-700">{support.eligibility}</p>
            </div>
          )}

          {/* 지원 가능 비자 */}
          {support.eligible_visa_types && support.eligible_visa_types.length > 0 && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">
                지원 가능 비자 유형
              </h4>
              <div className="flex flex-wrap gap-2">
                {support.eligible_visa_types.map((visa) => (
                  <span
                    key={visa}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-md text-sm font-medium bg-blue-50 text-blue-700"
                  >
                    {visa}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* 지원 내용 */}
          {support.support_content && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">지원 내용</h4>
              <p className="text-gray-700">{support.support_content}</p>
            </div>
          )}

          {/* 신청 기간 */}
          {support.application_period_start && support.application_period_end && (
            <div className="mb-6">
              <h4 className="text-sm font-medium text-gray-500 mb-2">신청 기간</h4>
              <p className="text-gray-700">
                {formatDate(support.application_period_start)} ~{" "}
                {formatDate(support.application_period_end)}
              </p>
            </div>
          )}

          {/* 담당 기관 */}
          <div className="mb-6">
            <h4 className="text-sm font-medium text-gray-500 mb-2">담당 기관</h4>
            <p className="text-gray-900 font-medium mb-1">{support.department}</p>
            {support.department_phone && (
              <p className="text-gray-700 text-sm mb-1">
                📞 {support.department_phone}
              </p>
            )}
            {support.department_website && (
              <a
                href={support.department_website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 text-sm"
              >
                웹사이트 방문
              </a>
            )}
          </div>
        </div>

        {/* 공식 링크 및 버튼 */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          {support.official_link && (
            <div className="flex flex-col sm:flex-row gap-3">
              <a
                href={support.official_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                공식 사이트에서 신청하기
                <svg
                  className="ml-2 -mr-1 w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                  />
                </svg>
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

