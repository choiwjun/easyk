"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface Job {
    id: string;
    position: string;
    company_name: string;
    location: string;
    employment_type: string;
    status: string;
    deadline: string;
    created_at: string;
}

interface Support {
    id: string;
    title: string;
    category: string;
    status: string;
    department: string;
    created_at: string;
}

export default function AgencyDashboard() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<"jobs" | "supports">("jobs");
    const [jobs, setJobs] = useState<Job[]>([]);
    const [supports, setSupports] = useState<Support[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    useEffect(() => {
        checkAuth();
    }, []);

    useEffect(() => {
        if (activeTab === "jobs") {
            fetchJobs();
        } else {
            fetchSupports();
        }
    }, [activeTab]);

    const checkAuth = async () => {
        const token = localStorage.getItem("access_token");
        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const response = await fetch("/api/users/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.role !== "agency" && data.role !== "admin") {
                    router.push("/");
                }
            } else {
                router.push("/login");
            }
        } catch (error) {
            router.push("/login");
        }
    };

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("/api/jobs", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setJobs(data || []);
            }
        } catch (error) {
            setError("일자리 목록을 불러올 수 없습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const fetchSupports = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("/api/supports", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (response.ok) {
                const data = await response.json();
                setSupports(data.supports || []);
            }
        } catch (error) {
            setError("지원 프로그램 목록을 불러올 수 없습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem("access_token");
        router.push("/login");
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date);
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, string> = {
            active: "모집중",
            closed: "마감",
            expired: "만료",
            draft: "임시저장",
        };
        return labels[status] || status;
    };

    const getStatusVariant = (status: string): "success" | "warning" | "error" | "default" => {
        const variants: Record<string, "success" | "warning" | "error" | "default"> = {
            active: "success",
            closed: "warning",
            expired: "error",
            draft: "default",
        };
        return variants[status] || "default";
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, string> = {
            subsidy: "장려금",
            education: "교육",
            training: "훈련",
            visa: "비자/체류",
            housing: "주거",
        };
        return labels[category] || category;
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* 네비게이션 */}
            <nav className="bg-white shadow-sm border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-8">
                            <span className="text-2xl font-bold text-[#1E5BA0]">easyK</span>
                            <span className="text-gray-600 font-medium">지원 기관 대시보드</span>
                        </div>
                        <Button variant="secondary" onClick={handleLogout}>
                            로그아웃
                        </Button>
                    </div>
                </div>
            </nav>

            <div className="py-8 px-4">
                <div className="max-w-7xl mx-auto">
                    {/* 헤더 */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {language === "ko" ? "지원 기관 대시보드" : "Agency Dashboard"}
                        </h1>
                        <p className="text-gray-600">
                            {language === "ko"
                                ? "일자리 공고와 정부 지원 프로그램을 관리하세요."
                                : "Manage job postings and government support programs."}
                        </p>
                    </div>

                    {/* 탭 */}
                    <div className="bg-white rounded-lg shadow-sm p-2 mb-6 inline-flex gap-2">
                        <button
                            onClick={() => setActiveTab("jobs")}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === "jobs"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            💼 일자리 공고 관리
                        </button>
                        <button
                            onClick={() => setActiveTab("supports")}
                            className={`px-6 py-3 rounded-lg font-medium transition-colors ${activeTab === "supports"
                                    ? "bg-blue-600 text-white"
                                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                }`}
                        >
                            🏛️ 정부 지원 프로그램 관리
                        </button>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600">{error}</p>
                        </div>
                    )}

                    {/* 일자리 공고 탭 */}
                    {activeTab === "jobs" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">
                                    일자리 공고 목록 ({jobs.length}건)
                                </h2>
                                <Link href="/admin/jobs">
                                    <Button variant="primary">+ 새 공고 등록</Button>
                                </Link>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">{t("common.loading")}</p>
                                </div>
                            ) : jobs.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                    <p className="text-gray-600 mb-4">등록된 공고가 없습니다.</p>
                                    <Link href="/admin/jobs">
                                        <Button variant="primary">첫 공고 등록하기</Button>
                                    </Link>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
                                    {jobs.map((job) => (
                                        <div key={job.id} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">{job.position}</h3>
                                                    <p className="text-sm text-gray-600">{job.company_name}</p>
                                                </div>
                                                <Badge variant={getStatusVariant(job.status)}>
                                                    {getStatusLabel(job.status)}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>📍 {job.location}</span>
                                                <span>📅 마감: {formatDate(job.deadline)}</span>
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                <Link href={`/jobs/${job.id}`}>
                                                    <Button variant="outline" size="sm">상세보기</Button>
                                                </Link>
                                                <Link href="/admin/jobs">
                                                    <Button variant="outline" size="sm">수정</Button>
                                                </Link>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}

                    {/* 정부 지원 프로그램 탭 */}
                    {activeTab === "supports" && (
                        <div className="space-y-6">
                            <div className="flex justify-between items-center">
                                <h2 className="text-xl font-bold text-gray-900">
                                    정부 지원 프로그램 목록 ({supports.length}건)
                                </h2>
                                <Button variant="primary">+ 새 프로그램 등록</Button>
                            </div>

                            {isLoading ? (
                                <div className="text-center py-12">
                                    <p className="text-gray-600">{t("common.loading")}</p>
                                </div>
                            ) : supports.length === 0 ? (
                                <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                    <p className="text-gray-600 mb-4">등록된 지원 프로그램이 없습니다.</p>
                                    <Button variant="primary">첫 프로그램 등록하기</Button>
                                </div>
                            ) : (
                                <div className="bg-white rounded-lg shadow-sm divide-y divide-gray-200">
                                    {supports.map((support) => (
                                        <div key={support.id} className="p-6 hover:bg-gray-50 transition-colors">
                                            <div className="flex justify-between items-start mb-2">
                                                <div>
                                                    <h3 className="text-lg font-semibold text-gray-900">{support.title}</h3>
                                                    <p className="text-sm text-gray-600">{support.department}</p>
                                                </div>
                                                <Badge variant="info">{getCategoryLabel(support.category)}</Badge>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>📅 등록일: {formatDate(support.created_at)}</span>
                                            </div>
                                            <div className="mt-4 flex gap-2">
                                                <Link href={`/supports/${support.id}`}>
                                                    <Button variant="outline" size="sm">상세보기</Button>
                                                </Link>
                                                <Button variant="outline" size="sm">수정</Button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
