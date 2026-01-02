"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Badge from "@/components/ui/Badge";

interface SupportKeyword {
  id: string;
  keyword: string;
  category: string;
  description: string | null;
  is_active: boolean;
  search_count: number;
  created_at: string;
  created_by: string;
  updated_at: string;
}

const CATEGORY_LABELS: Record<string, string> = {
  visa: "비자/체류",
  labor: "노동/고용",
  contract: "계약/법률",
  business: "사업/창업",
  other: "기타",
};

export default function SupportKeywordsPage() {
  const router = useRouter();
  const [keywords, setKeywords] = useState<SupportKeyword[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // 검색 및 필터 상태
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("");

  // 폼 상태
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newKeyword, setNewKeyword] = useState("");
  const [newCategory, setNewCategory] = useState("other");
  const [newDescription, setNewDescription] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetchKeywords();
  }, [search, category]);

  const fetchKeywords = async () => {
    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      // Query parameters 구성
      const params = new URLSearchParams();
      if (search.trim()) params.append("search", search.trim());
      if (category) params.append("category", category);
      params.append("limit", "100");

      const queryString = params.toString();
      const url = `/api/support-keywords${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setKeywords(data.keywords);
      } else if (response.status === 403) {
        router.push("/login");
      } else {
        setError("지원 키워드 목록을 불러오는데 실패했습니다.");
      }
    } catch (error) {
      setError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    fetchKeywords();
  };

  const handleCreateKeyword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/support-keywords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          keyword: newKeyword,
          category: newCategory,
          description: newDescription.trim() || undefined,
        }),
      });

      if (response.ok) {
        setShowCreateModal(false);
        setNewKeyword("");
        setNewCategory("other");
        setNewDescription("");
        await fetchKeywords(); // 목록 새로고침
      } else {
        const data = await response.json();
        setSubmitError(data.message || data.detail || "키워드 생성에 실패했습니다.");
      }
    } catch (error) {
      setSubmitError("네트워크 오류가 발생했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("ko-KR", {
      year: "numeric",
      month: "long",
      day: "numeric",
    hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-gray-600">로딩 중...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* 헤더 */}
        <div className="mb-6 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">지원 키워드 관리</h1>
          <Button
            variant="primary"
            onClick={() => setShowCreateModal(true)}
          >
            + 새 키워드
          </Button>
        </div>

        {/* 검색 및 필터 */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <Input
                type="text"
                placeholder="키워드 검색..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
              <select
                value={category}
                onChange={(e) => {
                  setCategory(e.target.value);
                  setIsLoading(true);
                  setError("");
                  fetchKeywords();
                }}
                className="px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">전체</option>
                <option value="visa">비자/체류</option>
                <option value="labor">노동/고용</option>
                <option value="contract">계약/법률</option>
                <option value="business">사업/창업</option>
                <option value="other">기타</option>
              </select>
            <Button type="submit" variant="primary" disabled={isLoading}>
              검색
            </Button>
          </form>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}

        {/* 키워드 목록 */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="text-gray-600">로딩 중...</div>
          </div>
        ) : keywords.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <p className="text-gray-600 mb-4">
              {search || category
                ? "검색 조건에 맞는 키워드가 없습니다."
                : "등록된 키워드가 없습니다."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {keywords.map((keyword) => (
              <div
                key={keyword.id}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-lg font-semibold text-gray-900">
                        {keyword.keyword}
                      </span>
                      <Badge
                        variant={keyword.is_active ? "success" : "default"}
                      >
                        {keyword.is_active ? "활성" : "비활성"}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500">
                      {CATEGORY_LABELS[keyword.category]}
                    </p>
                  </div>
                  <div className="text-sm text-gray-600">
                    검색 {keyword.search_count}회
                  </div>
                </div>

                {keyword.description && (
                  <div className="mb-4">
                    <h3 className="text-sm font-medium text-gray-900 mb-2">설명</h3>
                    <p className="text-gray-900 whitespace-pre-wrap">
                      {keyword.description}
                    </p>
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-gray-200 text-sm">
                  <div className="text-gray-600">
                    생성일: {formatDate(keyword.created_at)}
                  </div>
                  <div className="text-gray-600">
                    생성자: {keyword.created_by}
                  </div>
                  <div className="text-gray-600">
                    업데이트일: {formatDate(keyword.updated_at)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* 새 키워드 생성 모달 */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-bold text-gray-900">새 키워드 등록</h2>
                  <button
                    onClick={() => {
                      setShowCreateModal(false);
                      setNewKeyword("");
                      setNewCategory("other");
                      setNewDescription("");
                      setSubmitError("");
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <span className="text-2xl">×</span>
                  </button>
                </div>

                <form onSubmit={handleCreateKeyword} className="space-y-4">
                  {submitError && (
                    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm text-red-600">{submitError}</p>
                    </div>
                  )}

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      키워드 *
                    </label>
                    <Input
                      type="text"
                      value={newKeyword}
                      onChange={(e) => setNewKeyword(e.target.value)}
                      placeholder="예: WorkNet, 법률사이트 검색"
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      카테고리 *
                    </label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="visa">비자/체류</option>
                      <option value="labor">노동/고용</option>
                      <option value="contract">계약/법률</option>
                      <option value="business">사업/창업</option>
                      <option value="other" selected>기타</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      설명 (선택사항)
                    </label>
                    <textarea
                      value={newDescription}
                      onChange={(e) => setNewDescription(e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      placeholder="키워드에 대한 설명..."
                    />
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setShowCreateModal(false);
                        setNewKeyword("");
                        setNewCategory("other");
                        setNewDescription("");
                        setSubmitError("");
                      }}
                      fullWidth
                      disabled={isSubmitting}
                    >
                      취소
                    </Button>
                    <Button
                      type="submit"
                      variant="primary"
                      loading={isSubmitting}
                      fullWidth
                    >
                      등록하기
                    </Button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

