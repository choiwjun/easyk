"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useLanguage } from "@/contexts/LanguageContext";
import DesignHeader from "@/components/ui/DesignHeader";
import DesignFooter from "@/components/ui/DesignFooter";

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

const EMPLOYMENT_TYPES: Record<string, { ko: string; en: string }> = {
    "full-time": { ko: "정규직", en: "Full-time" },
    "part-time": { ko: "파트타임", en: "Part-time" },
    "contract": { ko: "계약직", en: "Contract" },
    "temporary": { ko: "임시직", en: "Temporary" },
};

export default function AgencyDashboard() {
    const router = useRouter();
    const { language } = useLanguage();
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
            setError(language === "ko" ? "일자리 목록을 불러올 수 없습니다." : "Failed to load jobs.");
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
            setError(language === "ko" ? "지원 프로그램 목록을 불러올 수 없습니다." : "Failed to load support programs.");
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
                setError(errorData.detail || (language === "ko" ? "공고 등록에 실패했습니다." : "Failed to create job posting."));
            }
        } catch {
            setError(language === "ko" ? "네트워크 오류가 발생했습니다." : "Network error occurred.");
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
                setError(errorData.detail || (language === "ko" ? "공고 수정에 실패했습니다." : "Failed to update job posting."));
            }
        } catch {
            setError(language === "ko" ? "네트워크 오류가 발생했습니다." : "Network error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteJob = async (jobId: string) => {
        if (!confirm(language === "ko" ? "정말 이 공고를 삭제하시겠습니까?" : "Are you sure you want to delete this job posting?")) return;

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
                setError(errorData.detail || (language === "ko" ? "공고 삭제에 실패했습니다." : "Failed to delete job posting."));
            }
        } catch {
            setError(language === "ko" ? "네트워크 오류가 발생했습니다." : "Network error occurred.");
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

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "en-US", {
            year: "numeric",
            month: "short",
            day: "numeric",
        }).format(date);
    };

    const getStatusLabel = (status: string) => {
        const labels: Record<string, { ko: string; en: string }> = {
            active: { ko: "모집중", en: "Active" },
            closed: { ko: "마감", en: "Closed" },
            expired: { ko: "만료", en: "Expired" },
            draft: { ko: "임시저장", en: "Draft" },
        };
        const lang = language as 'ko' | 'en';
        return labels[status]?.[lang] || status;
    };

    const getStatusBadgeStyle = (status: string) => {
        switch (status) {
            case "active":
                return "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400";
            case "closed":
                return "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400";
            case "expired":
                return "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400";
            default:
                return "bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-300";
        }
    };

    const getCategoryLabel = (category: string) => {
        const labels: Record<string, { ko: string; en: string }> = {
            subsidy: { ko: "장려금", en: "Subsidy" },
            education: { ko: "교육", en: "Education" },
            training: { ko: "훈련", en: "Training" },
            visa: { ko: "비자/체류", en: "Visa/Stay" },
            housing: { ko: "주거", en: "Housing" },
        };
        const lang = language as 'ko' | 'en';
        return labels[category]?.[lang] || category;
    };

    // 통계 계산
    const stats = {
        totalJobs: jobs.length,
        activeJobs: jobs.filter(j => j.status === "active").length,
        totalSupports: supports.length,
    };

    const today = new Date().toLocaleDateString(language === "ko" ? "ko-KR" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        weekday: "long",
    });

    return (
        <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
            <DesignHeader />

            <main className="flex-grow w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                {/* Welcome Header */}
                <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                    <div>
                        <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                            {language === "ko" ? `오늘은 ${today}입니다.` : `Today is ${today}.`}
                        </p>
                        <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
                            {language === "ko" ? (
                                <>기관 <span className="text-primary">대시보드</span> 🏛️</>
                            ) : (
                                <>Agency <span className="text-primary">Dashboard</span> 🏛️</>
                            )}
                        </h2>
                        <p className="text-gray-600 dark:text-gray-300 mt-2 text-lg">
                            {language === "ko"
                                ? "일자리 공고와 정부 지원 프로그램을 관리하세요."
                                : "Manage job postings and government support programs."}
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <button
                            onClick={() => router.push("/profile")}
                            className="flex items-center gap-2 px-4 py-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-lg shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <span className="material-symbols-outlined text-[20px]">person</span>
                            {language === "ko" ? "프로필 관리" : "Profile"}
                        </button>
                    </div>
                </section>

                {/* Stats Overview */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {/* 전체 공고 */}
                    <div
                        onClick={() => setActiveTab("jobs")}
                        className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-card-border dark:border-slate-700 shadow-sm flex items-center justify-between group hover:border-primary/50 transition-colors cursor-pointer"
                    >
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                                {language === "ko" ? "전체 공고" : "Total Jobs"}
                            </p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {stats.totalJobs}
                                <span className="text-lg font-normal text-gray-400 ml-1">
                                    {language === "ko" ? "건" : ""}
                                </span>
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 text-primary rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">work</span>
                        </div>
                    </div>

                    {/* 모집중 */}
                    <div className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-card-border dark:border-slate-700 shadow-sm flex items-center justify-between group hover:border-green-500/50 transition-colors cursor-pointer">
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                                {language === "ko" ? "모집 중" : "Active Jobs"}
                            </p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {stats.activeJobs}
                                <span className="text-lg font-normal text-gray-400 ml-1">
                                    {language === "ko" ? "건" : ""}
                                </span>
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-green-50 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">task_alt</span>
                        </div>
                    </div>

                    {/* 지원 프로그램 */}
                    <div
                        onClick={() => setActiveTab("supports")}
                        className="bg-white dark:bg-slate-800 rounded-xl p-5 border border-card-border dark:border-slate-700 shadow-sm flex items-center justify-between group hover:border-orange-500/50 transition-colors cursor-pointer"
                    >
                        <div>
                            <p className="text-gray-500 dark:text-gray-400 text-sm font-medium mb-1">
                                {language === "ko" ? "지원 프로그램" : "Support Programs"}
                            </p>
                            <p className="text-3xl font-bold text-gray-900 dark:text-white">
                                {stats.totalSupports}
                                <span className="text-lg font-normal text-gray-400 ml-1">
                                    {language === "ko" ? "개" : ""}
                                </span>
                            </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-50 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                            <span className="material-symbols-outlined">volunteer_activism</span>
                        </div>
                    </div>

                    {/* 새 공고 등록 */}
                    <div
                        onClick={() => {
                            setActiveTab("jobs");
                            setShowJobForm(true);
                        }}
                        className="bg-primary text-white rounded-xl p-5 border border-primary shadow-sm flex flex-col justify-between relative overflow-hidden cursor-pointer hover:bg-primary-dark transition-colors"
                    >
                        <div className="relative z-10">
                            <p className="text-blue-100 text-sm font-medium mb-1">
                                {language === "ko" ? "새 공고 등록" : "New Job Posting"}
                            </p>
                            <p className="text-lg font-bold">
                                {language === "ko" ? "공고 작성하기" : "Create Posting"}
                            </p>
                            <p className="text-sm mt-2 font-medium bg-white/20 w-fit px-2 py-0.5 rounded text-white flex items-center gap-1">
                                <span className="material-symbols-outlined text-base">add</span>
                                {language === "ko" ? "클릭하여 시작" : "Click to start"}
                            </p>
                        </div>
                        <div className="absolute -right-4 -bottom-4 text-white/10">
                            <span className="material-symbols-outlined text-[100px]">edit_note</span>
                        </div>
                    </div>
                </section>

                {/* Tab Navigation */}
                <section className="bg-white dark:bg-slate-800 rounded-xl border border-card-border dark:border-slate-700 p-2 shadow-sm inline-flex gap-2">
                    <button
                        onClick={() => setActiveTab("jobs")}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                            activeTab === "jobs"
                                ? "bg-primary text-white"
                                : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                        }`}
                    >
                        <span className="material-symbols-outlined text-xl">work</span>
                        {language === "ko" ? "일자리 공고 관리" : "Job Postings"}
                    </button>
                    <button
                        onClick={() => setActiveTab("supports")}
                        className={`px-6 py-3 rounded-lg font-medium transition-colors flex items-center gap-2 ${
                            activeTab === "supports"
                                ? "bg-primary text-white"
                                : "bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600"
                        }`}
                    >
                        <span className="material-symbols-outlined text-xl">account_balance</span>
                        {language === "ko" ? "정부 지원 프로그램" : "Support Programs"}
                    </button>
                </section>

                {error && (
                    <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                        <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                    </div>
                )}

                {/* Jobs Tab Content */}
                {activeTab === "jobs" && (
                    <div className="space-y-6">
                        {showJobForm ? (
                            /* Job Form */
                            <section className="bg-white dark:bg-slate-800 rounded-xl border border-card-border dark:border-slate-700 shadow-sm">
                                <div className="p-6 border-b border-gray-100 dark:border-slate-700 flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {editingJob
                                            ? (language === "ko" ? "공고 수정" : "Edit Job Posting")
                                            : (language === "ko" ? "새 공고 등록" : "Create Job Posting")}
                                    </h3>
                                    <button
                                        onClick={() => {
                                            setShowJobForm(false);
                                            setEditingJob(null);
                                            resetJobForm();
                                        }}
                                        className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
                                    >
                                        <span className="material-symbols-outlined">close</span>
                                    </button>
                                </div>

                                <form onSubmit={editingJob ? handleUpdateJob : handleCreateJob} className="p-6 space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {language === "ko" ? "직종" : "Position"} *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={jobForm.position}
                                                onChange={(e) => setJobForm({ ...jobForm, position: e.target.value })}
                                                placeholder={language === "ko" ? "예: 외국인 고용 담당자" : "e.g., Foreign Employment Officer"}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {language === "ko" ? "회사/기관명" : "Company/Agency"} *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={jobForm.company_name}
                                                onChange={(e) => setJobForm({ ...jobForm, company_name: e.target.value })}
                                                placeholder={language === "ko" ? "예: 고양시청" : "e.g., Goyang City Hall"}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {language === "ko" ? "근무 지역" : "Location"} *
                                            </label>
                                            <input
                                                type="text"
                                                required
                                                value={jobForm.location}
                                                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                                                placeholder={language === "ko" ? "예: 경기도 고양시" : "e.g., Goyang, Gyeonggi"}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {language === "ko" ? "고용 형태" : "Employment Type"} *
                                            </label>
                                            <select
                                                required
                                                value={jobForm.employment_type}
                                                onChange={(e) => setJobForm({ ...jobForm, employment_type: e.target.value })}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                            >
                                                {Object.entries(EMPLOYMENT_TYPES).map(([value, label]) => (
                                                    <option key={value} value={value}>{label[language]}</option>
                                                ))}
                                            </select>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {language === "ko" ? "급여 범위" : "Salary Range"}
                                        </label>
                                        <input
                                            type="text"
                                            value={jobForm.salary_range}
                                            onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })}
                                            placeholder={language === "ko" ? "예: 연봉 3,500만원~4,000만원" : "e.g., $35,000~$40,000/year"}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {language === "ko" ? "업무 설명" : "Job Description"} *
                                        </label>
                                        <textarea
                                            required
                                            value={jobForm.description}
                                            onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                                            rows={4}
                                            placeholder={language === "ko" ? "담당 업무에 대해 상세히 작성해주세요." : "Describe the job responsibilities in detail."}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                            {language === "ko" ? "자격 요건" : "Requirements"}
                                        </label>
                                        <textarea
                                            value={jobForm.requirements}
                                            onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                                            rows={3}
                                            placeholder={language === "ko" ? "필수 자격 요건을 작성해주세요." : "List the required qualifications."}
                                            className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                                        />
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {language === "ko" ? "우대 사항" : "Preferred Qualifications"}
                                            </label>
                                            <textarea
                                                value={jobForm.preferred_qualifications}
                                                onChange={(e) => setJobForm({ ...jobForm, preferred_qualifications: e.target.value })}
                                                rows={2}
                                                placeholder={language === "ko" ? "우대 사항을 작성해주세요." : "List preferred qualifications."}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                {language === "ko" ? "복지 혜택" : "Benefits"}
                                            </label>
                                            <textarea
                                                value={jobForm.benefits}
                                                onChange={(e) => setJobForm({ ...jobForm, benefits: e.target.value })}
                                                rows={2}
                                                placeholder={language === "ko" ? "복지 혜택을 작성해주세요." : "List the benefits."}
                                                className="w-full px-4 py-3 rounded-lg border border-gray-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex gap-4 pt-4 border-t border-gray-100 dark:border-slate-700">
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setShowJobForm(false);
                                                setEditingJob(null);
                                                resetJobForm();
                                            }}
                                            className="flex-1 px-6 py-3 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
                                        >
                                            {language === "ko" ? "취소" : "Cancel"}
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={isSubmitting}
                                            className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                        >
                                            {isSubmitting ? (
                                                <>
                                                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                                                    {language === "ko" ? "처리 중..." : "Processing..."}
                                                </>
                                            ) : (
                                                editingJob
                                                    ? (language === "ko" ? "저장" : "Save")
                                                    : (language === "ko" ? "공고 등록" : "Create Posting")
                                            )}
                                        </button>
                                    </div>
                                </form>
                            </section>
                        ) : (
                            /* Jobs List */
                            <>
                                <div className="flex justify-between items-center">
                                    <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                        {language === "ko" ? `일자리 공고 목록 (${jobs.length}건)` : `Job Postings (${jobs.length})`}
                                    </h3>
                                    <button
                                        onClick={() => setShowJobForm(true)}
                                        className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center gap-2"
                                    >
                                        <span className="material-symbols-outlined">add</span>
                                        {language === "ko" ? "새 공고 등록" : "New Posting"}
                                    </button>
                                </div>

                                {isLoading ? (
                                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-card-border dark:border-slate-700 p-12 text-center">
                                        <span className="material-symbols-outlined text-4xl text-gray-400 animate-spin">progress_activity</span>
                                        <p className="text-gray-600 dark:text-gray-400 mt-4">{language === "ko" ? "로딩 중..." : "Loading..."}</p>
                                    </div>
                                ) : jobs.length === 0 ? (
                                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-card-border dark:border-slate-700 p-12 text-center">
                                        <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                            <span className="material-symbols-outlined text-3xl text-gray-400">work_off</span>
                                        </div>
                                        <p className="text-gray-600 dark:text-gray-400 mb-4">
                                            {language === "ko" ? "등록된 공고가 없습니다." : "No job postings yet."}
                                        </p>
                                        <button
                                            onClick={() => setShowJobForm(true)}
                                            className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors"
                                        >
                                            {language === "ko" ? "첫 공고 등록하기" : "Create First Posting"}
                                        </button>
                                    </div>
                                ) : (
                                    <div className="bg-white dark:bg-slate-800 rounded-xl border border-card-border dark:border-slate-700 shadow-sm divide-y divide-gray-100 dark:divide-slate-700">
                                        {jobs.map((job) => (
                                            <div key={job.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-start gap-3 mb-3">
                                                            <div className="w-10 h-10 bg-primary/10 dark:bg-primary/20 rounded-lg flex items-center justify-center shrink-0">
                                                                <span className="material-symbols-outlined text-primary">work</span>
                                                            </div>
                                                            <div className="flex-1">
                                                                <div className="flex items-center gap-2 flex-wrap">
                                                                    <h4 className="font-bold text-gray-900 dark:text-white">{job.position}</h4>
                                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-bold ${getStatusBadgeStyle(job.status)}`}>
                                                                        {getStatusLabel(job.status)}
                                                                    </span>
                                                                </div>
                                                                <p className="text-sm text-gray-600 dark:text-gray-400">{job.company_name}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex flex-wrap items-center gap-3 text-sm text-gray-500 dark:text-gray-400 mb-3">
                                                            <span className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-base">location_on</span>
                                                                {job.location}
                                                            </span>
                                                            <span className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-base">badge</span>
                                                                {EMPLOYMENT_TYPES[job.employment_type]?.[language] || job.employment_type}
                                                            </span>
                                                            {job.salary_range && (
                                                                <span className="flex items-center gap-1">
                                                                    <span className="material-symbols-outlined text-base">payments</span>
                                                                    {job.salary_range}
                                                                </span>
                                                            )}
                                                            <span className="flex items-center gap-1">
                                                                <span className="material-symbols-outlined text-base">event</span>
                                                                {language === "ko" ? "마감:" : "Deadline:"} {formatDate(job.deadline)}
                                                            </span>
                                                        </div>

                                                        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{job.description}</p>
                                                    </div>

                                                    <div className="flex gap-2 shrink-0">
                                                        <button
                                                            onClick={() => handleEditJob(job)}
                                                            className="px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1"
                                                        >
                                                            <span className="material-symbols-outlined text-base">edit</span>
                                                            {language === "ko" ? "수정" : "Edit"}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDeleteJob(job.id)}
                                                            className="px-3 py-2 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-1"
                                                        >
                                                            <span className="material-symbols-outlined text-base">delete</span>
                                                            {language === "ko" ? "삭제" : "Delete"}
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                )}

                {/* Supports Tab Content */}
                {activeTab === "supports" && (
                    <div className="space-y-6">
                        <div className="flex justify-between items-center">
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                {language === "ko" ? `정부 지원 프로그램 목록 (${supports.length}건)` : `Support Programs (${supports.length})`}
                            </h3>
                            <button className="px-4 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors flex items-center gap-2">
                                <span className="material-symbols-outlined">add</span>
                                {language === "ko" ? "새 프로그램 등록" : "New Program"}
                            </button>
                        </div>

                        {isLoading ? (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-card-border dark:border-slate-700 p-12 text-center">
                                <span className="material-symbols-outlined text-4xl text-gray-400 animate-spin">progress_activity</span>
                                <p className="text-gray-600 dark:text-gray-400 mt-4">{language === "ko" ? "로딩 중..." : "Loading..."}</p>
                            </div>
                        ) : supports.length === 0 ? (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-card-border dark:border-slate-700 p-12 text-center">
                                <div className="w-16 h-16 bg-gray-100 dark:bg-slate-700 rounded-full flex items-center justify-center mx-auto mb-4">
                                    <span className="material-symbols-outlined text-3xl text-gray-400">folder_off</span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {language === "ko" ? "등록된 지원 프로그램이 없습니다." : "No support programs yet."}
                                </p>
                                <button className="px-6 py-2 bg-primary text-white rounded-lg font-medium hover:bg-primary-dark transition-colors">
                                    {language === "ko" ? "첫 프로그램 등록하기" : "Create First Program"}
                                </button>
                            </div>
                        ) : (
                            <div className="bg-white dark:bg-slate-800 rounded-xl border border-card-border dark:border-slate-700 shadow-sm divide-y divide-gray-100 dark:divide-slate-700">
                                {supports.map((support) => (
                                    <div key={support.id} className="p-6 hover:bg-gray-50 dark:hover:bg-slate-700/50 transition-colors">
                                        <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                                            <div className="flex-1">
                                                <div className="flex items-start gap-3 mb-3">
                                                    <div className="w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center shrink-0">
                                                        <span className="material-symbols-outlined text-orange-600 dark:text-orange-400">volunteer_activism</span>
                                                    </div>
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 flex-wrap">
                                                            <h4 className="font-bold text-gray-900 dark:text-white">{support.title}</h4>
                                                            <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400">
                                                                {getCategoryLabel(support.category)}
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-gray-600 dark:text-gray-400">{support.department}</p>
                                                    </div>
                                                </div>

                                                <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                                                    <span className="flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-base">calendar_today</span>
                                                        {language === "ko" ? "등록일:" : "Created:"} {formatDate(support.created_at)}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="flex gap-2 shrink-0">
                                                <Link href={`/supports/${support.id}`}>
                                                    <button className="px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1">
                                                        <span className="material-symbols-outlined text-base">visibility</span>
                                                        {language === "ko" ? "상세보기" : "View"}
                                                    </button>
                                                </Link>
                                                <button className="px-3 py-2 bg-gray-100 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors flex items-center gap-1">
                                                    <span className="material-symbols-outlined text-base">edit</span>
                                                    {language === "ko" ? "수정" : "Edit"}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </main>

            <DesignFooter />
        </div>
    );
}
