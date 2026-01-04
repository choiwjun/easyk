"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Textarea from "@/components/ui/Textarea";
import Select from "@/components/ui/Select";
import Badge from "@/components/ui/Badge";
import { useLanguage } from "@/contexts/LanguageContext";

interface Job {
    id: string;
    position: string;
    company_name: string;
    location: string;
    employment_type: string;
    salary_range: string;
    description: string;
    requirements: string;
    preferred_qualifications: string;
    benefits: string;
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

const EMPLOYMENT_TYPES = [
    { value: "full-time", label: "정규직" },
    { value: "part-time", label: "파트타임" },
    { value: "contract", label: "계약직" },
    { value: "temporary", label: "임시직" },
];

export default function AgencyDashboard() {
    const router = useRouter();
    const { t, language } = useLanguage();
    const [activeTab, setActiveTab] = useState<"jobs" | "supports">("jobs");
    const [jobs, setJobs] = useState<Job[]>([]);
    const [supports, setSupports] = useState<Support[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [showJobForm, setShowJobForm] = useState(false);
    const [editingJob, setEditingJob] = useState<Job | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [jobForm, setJobForm] = useState({
        position: "",
        company_name: "",
        location: "",
        employment_type: "full-time",
        salary_range: "",
        description: "",
        requirements: "",
        preferred_qualifications: "",
        benefits: "",
    });

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
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                if (data.role !== "agency" && data.role !== "admin") {
                    router.push("/");
                }
            } else {
                router.push("/login");
            }
        } catch {
            router.push("/login");
        }
    };

    const fetchJobs = async () => {
        setIsLoading(true);
        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("/api/jobs", {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setJobs(data || []);
            }
        } catch {
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
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                const data = await response.json();
                setSupports(data.supports || []);
            }
        } catch {
            setError("지원 프로그램 목록을 불러올 수 없습니다.");
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch("/api/jobs", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    ...jobForm,
                    deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
                }),
            });

            if (response.ok) {
                setShowJobForm(false);
                resetJobForm();
                fetchJobs();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || "공고 등록에 실패했습니다.");
            }
        } catch {
            setError("네트워크 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleUpdateJob = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingJob) return;

        setIsSubmitting(true);
        setError("");

        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`/api/jobs/${editingJob.id}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(jobForm),
            });

            if (response.ok) {
                setShowJobForm(false);
                setEditingJob(null);
                resetJobForm();
                fetchJobs();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || "공고 수정에 실패했습니다.");
            }
        } catch {
            setError("네트워크 오류가 발생했습니다.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteJob = async (jobId: string) => {
        if (!confirm("정말 이 공고를 삭제하시겠습니까?")) return;

        try {
            const token = localStorage.getItem("access_token");
            const response = await fetch(`/api/jobs/${jobId}`, {
                method: "DELETE",
                headers: { Authorization: `Bearer ${token}` },
            });

            if (response.ok) {
                fetchJobs();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || "공고 삭제에 실패했습니다.");
            }
        } catch {
            setError("네트워크 오류가 발생했습니다.");
        }
    };

    const handleEditJob = (job: Job) => {
        setEditingJob(job);
        setJobForm({
            position: job.position,
            company_name: job.company_name,
            location: job.location,
            employment_type: job.employment_type,
            salary_range: job.salary_range || "",
            description: job.description,
            requirements: job.requirements || "",
            preferred_qualifications: job.preferred_qualifications || "",
            benefits: job.benefits || "",
        });
        setShowJobForm(true);
    };

    const resetJobForm = () => {
        setJobForm({
            position: "",
            company_name: "",
            location: "",
            employment_type: "full-time",
            salary_range: "",
            description: "",
            requirements: "",
            preferred_qualifications: "",
            benefits: "",
        });
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

                    {activeTab === "jobs" && (
                        <div className="space-y-6">
                            {showJobForm ? (
                                <div className="bg-white rounded-lg shadow-sm p-8">
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-gray-900">
                                            {editingJob ? "공고 수정" : "새 공고 등록"}
                                        </h2>
                                        <Button
                                            variant="outline"
                                            onClick={() => {
                                                setShowJobForm(false);
                                                setEditingJob(null);
                                                resetJobForm();
                                            }}
                                        >
                                            닫기
                                        </Button>
                                    </div>

                                    <form onSubmit={editingJob ? handleUpdateJob : handleCreateJob} className="space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="직종"
                                                required
                                                value={jobForm.position}
                                                onChange={(e) => setJobForm({ ...jobForm, position: e.target.value })}
                                                placeholder="예: 외국인 고용 담당자"
                                            />
                                            <Input
                                                label="회사/기관명"
                                                required
                                                value={jobForm.company_name}
                                                onChange={(e) => setJobForm({ ...jobForm, company_name: e.target.value })}
                                                placeholder="예: 고양시청"
                                            />
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <Input
                                                label="근무 지역"
                                                required
                                                value={jobForm.location}
                                                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                                                placeholder="예: 경기도 고양시"
                                            />
                                            <Select
                                                label="고용 형태"
                                                options={EMPLOYMENT_TYPES}
                                                value={jobForm.employment_type}
                                                onChange={(e) => setJobForm({ ...jobForm, employment_type: e.target.value })}
                                                required
                                            />
                                        </div>

                                        <Input
                                            label="급여 범위"
                                            value={jobForm.salary_range}
                                            onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })}
                                            placeholder="예: 연봉 3,500만원~4,000만원"
                                        />

                                        <Textarea
                                            label="업무 설명"
                                            required
                                            value={jobForm.description}
                                            onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                                            rows={4}
                                            placeholder="담당 업무에 대해 상세히 작성해주세요."
                                        />

                                        <Textarea
                                            label="자격 요건"
                                            value={jobForm.requirements}
                                            onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                                            rows={3}
                                            placeholder="필수 자격 요건을 작성해주세요."
                                        />

                                        <Textarea
                                            label="우대 사항"
                                            value={jobForm.preferred_qualifications}
                                            onChange={(e) => setJobForm({ ...jobForm, preferred_qualifications: e.target.value })}
                                            rows={2}
                                            placeholder="우대 사항을 작성해주세요."
                                        />

                                        <Textarea
                                            label="복지 혜택"
                                            value={jobForm.benefits}
                                            onChange={(e) => setJobForm({ ...jobForm, benefits: e.target.value })}
                                            rows={2}
                                            placeholder="복지 혜택을 작성해주세요."
                                        />

                                        <div className="flex gap-4 pt-4">
                                            <Button
                                                type="button"
                                                variant="outline"
                                                onClick={() => {
                                                    setShowJobForm(false);
                                                    setEditingJob(null);
                                                    resetJobForm();
                                                }}
                                            >
                                                취소
                                            </Button>
                                            <Button type="submit" variant="primary" loading={isSubmitting}>
                                                {editingJob ? "저장" : "공고 등록"}
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            ) : (
                                <>
                                    <div className="flex justify-between items-center">
                                        <h2 className="text-xl font-bold text-gray-900">
                                            일자리 공고 목록 ({jobs.length}건)
                                        </h2>
                                        <Button variant="primary" onClick={() => setShowJobForm(true)}>
                                            + 새 공고 등록
                                        </Button>
                                    </div>

                                    {isLoading ? (
                                        <div className="text-center py-12">
                                            <p className="text-gray-600">{t("common.loading")}</p>
                                        </div>
                                    ) : jobs.length === 0 ? (
                                        <div className="bg-white rounded-lg shadow-sm p-12 text-center">
                                            <p className="text-gray-600 mb-4">등록된 공고가 없습니다.</p>
                                            <Button variant="primary" onClick={() => setShowJobForm(true)}>
                                                첫 공고 등록하기
                                            </Button>
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
                                                    <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                                        <span>📍 {job.location}</span>
                                                        <span>💼 {EMPLOYMENT_TYPES.find(type => type.value === job.employment_type)?.label || job.employment_type}</span>
                                                        {job.salary_range && <span>💰 {job.salary_range}</span>}
                                                        <span>📅 마감: {formatDate(job.deadline)}</span>
                                                    </div>
                                                    <p className="text-gray-600 text-sm line-clamp-2 mb-4">{job.description}</p>
                                                    <div className="flex gap-2">
                                                        <Button variant="outline" size="sm" onClick={() => handleEditJob(job)}>
                                                            수정
                                                        </Button>
                                                        <Button variant="danger" size="sm" onClick={() => handleDeleteJob(job.id)}>
                                                            삭제
                                                        </Button>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>
                    )}

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
