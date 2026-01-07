"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
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
  applicant_count?: number;
}

interface Applicant {
  id: string;
  job_id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  visa_type: string;
  nationality: string;
  applied_at: string;
  status: "pending" | "reviewing" | "hired" | "rejected";
  resume_url?: string;
  cover_letter?: string;
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
  contract: { ko: "계약직", en: "Contract" },
  temporary: { ko: "임시직", en: "Temporary" },
};

// Sample applicants data
const SAMPLE_APPLICANTS: Applicant[] = [
  {
    id: "app-1",
    job_id: "job-1",
    user_id: "user-1",
    first_name: "Van A",
    last_name: "Nguyen",
    email: "nguyen.vana@email.com",
    visa_type: "E-9",
    nationality: "베트남",
    applied_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    status: "pending",
  },
  {
    id: "app-2",
    job_id: "job-1",
    user_id: "user-2",
    first_name: "Petrova",
    last_name: "Elena",
    email: "elena.p@email.com",
    visa_type: "F-6",
    nationality: "러시아",
    applied_at: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    status: "reviewing",
  },
  {
    id: "app-3",
    job_id: "job-2",
    user_id: "user-3",
    first_name: "Wei",
    last_name: "Zhang",
    email: "zhang.wei@email.com",
    visa_type: "D-2",
    nationality: "중국",
    applied_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: "pending",
  },
  {
    id: "app-4",
    job_id: "job-2",
    user_id: "user-4",
    first_name: "Singh",
    last_name: "Michael",
    email: "michael.singh@email.com",
    visa_type: "E-7",
    nationality: "인도",
    applied_at: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    status: "hired",
  },
];

// Sample jobs with applicant counts
const SAMPLE_JOBS: Job[] = [
  {
    id: "job-1",
    position: "외국인 상담 통역사 모집",
    company_name: "서울글로벌센터",
    location: "서울 종로구",
    employment_type: "full-time",
    salary_range: "연봉 3,500만원~4,000만원",
    description: "외국인 민원 상담 및 통역 업무",
    requirements: "영어/중국어/베트남어 중 1개 이상 가능자",
    preferred_qualifications: "관련 경력 2년 이상",
    benefits: "4대보험, 연차, 식비지원",
    status: "active",
    deadline: "2024-11-30",
    created_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    applicant_count: 12,
  },
  {
    id: "job-2",
    position: "제조업 현장 생산직 (비자지원)",
    company_name: "(주)미래테크",
    location: "경기 화성시",
    employment_type: "full-time",
    salary_range: "월 280만원~320만원",
    description: "반도체 부품 생산 및 품질관리",
    requirements: "E-9 비자 소지자",
    preferred_qualifications: "제조업 경력자 우대",
    benefits: "기숙사 제공, 비자 연장 지원",
    status: "active",
    deadline: "2024-12-15",
    created_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    applicant_count: 28,
  },
  {
    id: "job-3",
    position: "물류센터 관리 보조",
    company_name: "CJ대한통운",
    location: "인천 중구",
    employment_type: "contract",
    salary_range: "시급 12,000원",
    description: "물류센터 입출고 관리 및 재고 정리",
    requirements: "한국어 기본 소통 가능자",
    preferred_qualifications: "물류 경험자",
    benefits: "식비, 교통비 지원",
    status: "closed",
    deadline: "2024-11-20",
    created_at: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    applicant_count: 45,
  },
];

type ActiveMenu = "dashboard" | "jobs" | "applicants" | "stats" | "members" | "settings";

export default function AgencyDashboard() {
  const router = useRouter();
  const { language } = useLanguage();
  const [activeMenu, setActiveMenu] = useState<ActiveMenu>("dashboard");
  const [jobs, setJobs] = useState<Job[]>(SAMPLE_JOBS);
  const [applicants, setApplicants] = useState<Applicant[]>(SAMPLE_APPLICANTS);
  const [supports, setSupports] = useState<Support[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState<Job | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null);
  const [showApplicantModal, setShowApplicantModal] = useState(false);
  const [userName, setUserName] = useState("김지자 관리자");
  const [userDept, setUserDept] = useState("서울시 외국인지원팀");

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
    deadline: "",
  });

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    if (activeMenu === "jobs") {
      fetchJobs();
    } else if (activeMenu === "applicants") {
      // Use sample data
    }
  }, [activeMenu]);

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
        setUserName(data.first_name ? `${data.first_name} 관리자` : "관리자");
        setUserDept(data.department || "외국인지원팀");
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
        if (data && data.length > 0) {
          setJobs(data);
        }
      }
    } catch {
      // Keep sample data on error
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
          deadline: jobForm.deadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
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
        setJobs(jobs.filter((j) => j.id !== jobId));
      } else {
        const errorData = await response.json();
        setError(errorData.detail || (language === "ko" ? "공고 삭제에 실패했습니다." : "Failed to delete job posting."));
      }
    } catch {
      setError(language === "ko" ? "네트워크 오류가 발생했습니다." : "Network error occurred.");
    }
  };

  const handleCloseJob = (jobId: string) => {
    setJobs(jobs.map((j) => (j.id === jobId ? { ...j, status: "closed" } : j)));
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
      deadline: job.deadline ? job.deadline.split("T")[0] : "",
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
      deadline: "",
    });
  };

  const handleApplicantAction = (applicantId: string, action: "hired" | "rejected") => {
    setApplicants(applicants.map((a) => (a.id === applicantId ? { ...a, status: action } : a)));
    setShowApplicantModal(false);
    setSelectedApplicant(null);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return language === "ko" ? `${days}일 전` : `${days}d ago`;
    }
    return language === "ko" ? `${hours}시간 전` : `${hours}h ago`;
  };

  const getStatusLabel = (status: string) => {
    const labels: Record<string, { ko: string; en: string }> = {
      active: { ko: "모집중", en: "Active" },
      closed: { ko: "마감", en: "Closed" },
      expired: { ko: "만료", en: "Expired" },
      draft: { ko: "임시저장", en: "Draft" },
      pending: { ko: "검토중", en: "Pending" },
      reviewing: { ko: "검토중", en: "Reviewing" },
      hired: { ko: "채용", en: "Hired" },
      rejected: { ko: "거절", en: "Rejected" },
    };
    const lang = language as "ko" | "en";
    return labels[status]?.[lang] || status;
  };

  const getStatusBadgeStyle = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "closed":
        return "bg-gray-100 text-gray-800";
      case "expired":
        return "bg-red-100 text-red-800";
      case "pending":
      case "reviewing":
        return "bg-yellow-100 text-yellow-800";
      case "hired":
        return "bg-green-100 text-green-800";
      case "rejected":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // 통계 계산
  const stats = {
    activeJobs: jobs.filter((j) => j.status === "active").length,
    weeklyApplicants: applicants.length,
    matchRate: 78.5,
    settledCount: 892,
    totalMembers: 12402,
    foreigners: 11204,
    consultants: 356,
    companies: 842,
    reports: 12,
  };

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("user");
    router.push("/login");
  };

  // Sidebar menu items
  const menuItems = [
    { id: "dashboard", icon: "dashboard", label: { ko: "대시보드", en: "Dashboard" } },
    { id: "jobs", icon: "work_outline", label: { ko: "일자리 관리", en: "Job Management" } },
    { id: "applicants", icon: "people_outline", label: { ko: "지원자 목록", en: "Applicants" } },
    { id: "stats", icon: "bar_chart", label: { ko: "통계 대시보드", en: "Statistics" } },
    { id: "members", icon: "manage_accounts", label: { ko: "회원 관리", en: "Members" } },
  ];

  return (
    <div className="min-h-screen bg-[#f7f6f8] dark:bg-[#191220] text-slate-900 dark:text-white flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-white dark:bg-[#201a2d] border-r border-slate-200 dark:border-slate-800 flex flex-col h-screen fixed left-0 top-0 z-20">
        {/* Logo */}
        <div className="p-6 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-blue-500/20">
              eK
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">easyK</span>
          </Link>
        </div>

        {/* User Profile Card */}
        <div className="px-4 pb-4">
          <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-xl flex items-center gap-3 border border-slate-100 dark:border-slate-700">
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
              {userName.charAt(0)}
            </div>
            <div className="flex flex-col overflow-hidden">
              <span className="text-sm font-bold text-slate-900 dark:text-white truncate">{userName}</span>
              <span className="text-xs text-slate-500 dark:text-slate-400 truncate">{userDept}</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-4 space-y-1">
          <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-2">
            {language === "ko" ? "메인" : "Main"}
          </p>
          {menuItems.slice(0, 1).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id as ActiveMenu)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors ${
                activeMenu === item.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary"
              }`}
            >
              <span className="material-symbols-outlined">{item.icon}</span>
              <span>{item.label[language as "ko" | "en"]}</span>
            </button>
          ))}

          <p className="px-4 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider mt-4">
            {language === "ko" ? "관리" : "Management"}
          </p>
          {menuItems.slice(1).map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveMenu(item.id as ActiveMenu)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors group ${
                activeMenu === item.id
                  ? "bg-primary/10 text-primary font-medium"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 hover:text-primary"
              }`}
            >
              <span className={`material-symbols-outlined ${activeMenu !== item.id ? "group-hover:text-primary" : ""} transition-colors`}>
                {item.icon}
              </span>
              <span>{item.label[language as "ko" | "en"]}</span>
            </button>
          ))}
        </nav>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveMenu("settings")}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined">settings</span>
            <span>{language === "ko" ? "설정" : "Settings"}</span>
          </button>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <span className="material-symbols-outlined">logout</span>
            <span>{language === "ko" ? "로그아웃" : "Logout"}</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-64 flex flex-col h-screen overflow-hidden">
        {/* Top Header */}
        <header className="h-16 bg-white dark:bg-[#201a2d] border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-8 sticky top-0 z-10 shrink-0">
          {/* Breadcrumbs */}
          <nav className="flex items-center text-sm font-medium text-slate-500">
            <Link href="/" className="hover:text-primary transition-colors">
              {language === "ko" ? "홈" : "Home"}
            </Link>
            <span className="mx-2 text-slate-300">/</span>
            <span className="text-slate-900 dark:text-white">
              {menuItems.find((m) => m.id === activeMenu)?.label[language as "ko" | "en"] || (language === "ko" ? "대시보드" : "Dashboard")}
            </span>
          </nav>

          {/* Right Actions */}
          <div className="flex items-center gap-4">
            <button className="relative p-2 text-slate-500 hover:text-primary transition-colors rounded-full hover:bg-slate-50 dark:hover:bg-slate-800">
              <span className="material-symbols-outlined">notifications</span>
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white dark:border-[#201a2d]"></span>
            </button>
            <button
              onClick={() => {
                setActiveMenu("jobs");
                setShowJobForm(true);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors shadow-sm shadow-blue-500/30 text-sm font-medium"
            >
              <span className="material-symbols-outlined text-[20px]">add</span>
              <span>{language === "ko" ? "새 공고 등록" : "New Job"}</span>
            </button>
          </div>
        </header>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto p-8">
          <div className="max-w-[1280px] mx-auto flex flex-col gap-8">
            {/* Dashboard View */}
            {activeMenu === "dashboard" && (
              <>
                {/* Welcome Section */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
                  <div>
                    <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
                      {language === "ko" ? `안녕하세요, ${userName}님 👋` : `Hello, ${userName} 👋`}
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                      {language === "ko" ? "오늘의 외국인 정착 지원 현황을 확인하세요." : "Check today's foreign settlement support status."}
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button className="px-4 py-2 bg-white dark:bg-[#251e33] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      {language === "ko" ? "보고서 다운로드" : "Download Report"}
                    </button>
                    <button className="px-4 py-2 bg-white dark:bg-[#251e33] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors flex items-center gap-2">
                      <span className="material-symbols-outlined text-[18px]">calendar_month</span>
                      {language === "ko" ? "기간 설정" : "Set Period"}
                    </button>
                  </div>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="bg-white dark:bg-[#201a2d] p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-primary">
                        <span className="material-symbols-outlined">campaign</span>
                      </div>
                      <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">+12%</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">{language === "ko" ? "진행 중인 공고" : "Active Jobs"}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {stats.activeJobs}
                      {language === "ko" ? "건" : ""}
                    </h3>
                  </div>

                  <div className="bg-white dark:bg-[#201a2d] p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-purple-50 dark:bg-purple-900/20 p-3 rounded-lg text-purple-600">
                        <span className="material-symbols-outlined">group_add</span>
                      </div>
                      <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">+8%</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">{language === "ko" ? "이번 주 신규 지원자" : "Weekly Applicants"}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {stats.weeklyApplicants}
                      {language === "ko" ? "명" : ""}
                    </h3>
                  </div>

                  <div className="bg-white dark:bg-[#201a2d] p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-orange-50 dark:bg-orange-900/20 p-3 rounded-lg text-orange-600">
                        <span className="material-symbols-outlined">handshake</span>
                      </div>
                      <span className="text-xs font-semibold bg-slate-100 text-slate-600 px-2 py-1 rounded-full">0%</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">{language === "ko" ? "매칭 성공률" : "Match Rate"}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.matchRate}%</h3>
                  </div>

                  <div className="bg-white dark:bg-[#201a2d] p-6 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between items-start mb-4">
                      <div className="bg-teal-50 dark:bg-teal-900/20 p-3 rounded-lg text-teal-600">
                        <span className="material-symbols-outlined">verified</span>
                      </div>
                      <span className="text-xs font-semibold bg-green-100 text-green-700 px-2 py-1 rounded-full">+4%</span>
                    </div>
                    <p className="text-slate-500 text-sm font-medium">{language === "ko" ? "정착 성공" : "Settled"}</p>
                    <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                      {stats.settledCount}
                      {language === "ko" ? "명" : ""}
                    </h3>
                  </div>
                </div>

                {/* Main Dashboard Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column */}
                  <div className="lg:col-span-2 flex flex-col gap-8">
                    {/* Statistics Chart */}
                    <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                      <div className="flex items-center justify-between mb-6">
                        <div>
                          <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                            {language === "ko" ? "월별 지원 및 채용 추이" : "Monthly Applications & Hires"}
                          </h2>
                          <p className="text-sm text-slate-500 dark:text-slate-400">
                            {language === "ko" ? "최근 6개월간의 일자리 매칭 현황입니다." : "Job matching status for the last 6 months."}
                          </p>
                        </div>
                        <button className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                          <span className="material-symbols-outlined">more_vert</span>
                        </button>
                      </div>

                      {/* Chart Placeholder */}
                      <div className="w-full h-64 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-end justify-between px-6 pb-4 pt-10 gap-4 relative overflow-hidden">
                        <div className="absolute inset-0 pointer-events-none border-b border-slate-200 dark:border-slate-700" style={{ top: "25%" }}></div>
                        <div className="absolute inset-0 pointer-events-none border-b border-slate-200 dark:border-slate-700" style={{ top: "50%" }}></div>
                        <div className="absolute inset-0 pointer-events-none border-b border-slate-200 dark:border-slate-700" style={{ top: "75%" }}></div>

                        <div className="w-full flex items-end justify-between h-full z-10">
                          {[
                            { month: language === "ko" ? "1월" : "Jan", total: 40, hired: 60 },
                            { month: language === "ko" ? "2월" : "Feb", total: 55, hired: 50 },
                            { month: language === "ko" ? "3월" : "Mar", total: 45, hired: 70 },
                            { month: language === "ko" ? "4월" : "Apr", total: 70, hired: 55 },
                            { month: language === "ko" ? "5월" : "May", total: 60, hired: 65 },
                            { month: language === "ko" ? "6월" : "Jun", total: 85, hired: 75 },
                          ].map((data, i) => (
                            <div key={i} className="w-8 bg-blue-200 dark:bg-blue-900/40 rounded-t-sm relative group" style={{ height: `${data.total}%` }}>
                              <div className="absolute bottom-0 w-full bg-primary rounded-t-sm" style={{ height: `${data.hired}%` }}></div>
                              <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded transition-opacity whitespace-nowrap">
                                {data.month}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="flex items-center justify-center gap-6 mt-4 text-sm">
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-blue-200 dark:bg-blue-900/40"></span>
                          <span className="text-slate-600 dark:text-slate-400">{language === "ko" ? "전체 지원자" : "Total Applicants"}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-primary"></span>
                          <span className="text-slate-600 dark:text-slate-400">{language === "ko" ? "채용 완료" : "Hired"}</span>
                        </div>
                      </div>
                    </div>

                    {/* Recent Jobs Table */}
                    <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                      <div className="flex items-center justify-between mb-6">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                          {language === "ko" ? "최근 등록 일자리" : "Recent Jobs"}
                        </h2>
                        <button
                          onClick={() => setActiveMenu("jobs")}
                          className="text-sm font-medium text-primary hover:text-blue-700 flex items-center gap-1"
                        >
                          {language === "ko" ? "전체보기" : "View All"} <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                        </button>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-500 text-xs uppercase tracking-wider">
                              <th className="pb-3 font-medium pl-2">{language === "ko" ? "공고명" : "Position"}</th>
                              <th className="pb-3 font-medium">{language === "ko" ? "기업명" : "Company"}</th>
                              <th className="pb-3 font-medium">{language === "ko" ? "지역" : "Location"}</th>
                              <th className="pb-3 font-medium">{language === "ko" ? "마감일" : "Deadline"}</th>
                              <th className="pb-3 font-medium text-center">{language === "ko" ? "상태" : "Status"}</th>
                              <th className="pb-3 font-medium text-center">{language === "ko" ? "액션" : "Actions"}</th>
                            </tr>
                          </thead>
                          <tbody className="text-sm">
                            {jobs.slice(0, 3).map((job) => (
                              <tr
                                key={job.id}
                                className="group hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border-b border-slate-50 dark:border-slate-800/50"
                              >
                                <td className="py-4 pl-2 font-medium text-slate-900 dark:text-white">{job.position}</td>
                                <td className="py-4 text-slate-600 dark:text-slate-300">{job.company_name}</td>
                                <td className="py-4 text-slate-500">{job.location}</td>
                                <td className="py-4 text-slate-500">{formatDate(job.deadline)}</td>
                                <td className="py-4 text-center">
                                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyle(job.status)}`}>
                                    {getStatusLabel(job.status)}
                                  </span>
                                </td>
                                <td className="py-4 text-center">
                                  <div className="flex items-center justify-center gap-1">
                                    <button
                                      onClick={() => handleEditJob(job)}
                                      className="p-1 text-slate-400 hover:text-primary transition-colors"
                                      title={language === "ko" ? "수정" : "Edit"}
                                    >
                                      <span className="material-symbols-outlined text-[18px]">edit</span>
                                    </button>
                                    {job.status === "active" && (
                                      <button
                                        onClick={() => handleCloseJob(job.id)}
                                        className="p-1 text-slate-400 hover:text-orange-500 transition-colors"
                                        title={language === "ko" ? "마감" : "Close"}
                                      >
                                        <span className="material-symbols-outlined text-[18px]">block</span>
                                      </button>
                                    )}
                                    <button
                                      onClick={() => handleDeleteJob(job.id)}
                                      className="p-1 text-slate-400 hover:text-red-500 transition-colors"
                                      title={language === "ko" ? "삭제" : "Delete"}
                                    >
                                      <span className="material-symbols-outlined text-[18px]">delete</span>
                                    </button>
                                  </div>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>

                  {/* Right Column */}
                  <div className="flex flex-col gap-8">
                    {/* Transparency Widget */}
                    <div className="bg-primary text-white rounded-xl shadow-lg p-6 relative overflow-hidden">
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl"></div>
                      <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-black/10 rounded-full blur-xl"></div>

                      <h2 className="text-lg font-bold relative z-10">{language === "ko" ? "데이터 투명성 리포트" : "Transparency Report"}</h2>
                      <p className="text-white/80 text-sm mt-1 mb-6 relative z-10">
                        {language === "ko" ? "신원 인증 및 비자 검증 현황" : "Identity & visa verification status"}
                      </p>

                      <div className="flex items-center justify-center relative z-10 my-4">
                        <div className="relative w-32 h-32">
                          <svg className="w-full h-full transform -rotate-90">
                            <circle className="text-white/20" cx="64" cy="64" fill="transparent" r="56" stroke="currentColor" strokeWidth="12"></circle>
                            <circle
                              className="text-white"
                              cx="64"
                              cy="64"
                              fill="transparent"
                              r="56"
                              stroke="currentColor"
                              strokeDasharray="351.86"
                              strokeDashoffset="35"
                              strokeWidth="12"
                            ></circle>
                          </svg>
                          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                            <span className="text-3xl font-bold">92%</span>
                            <span className="text-xs text-white/80">{language === "ko" ? "검증 완료" : "Verified"}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3 relative z-10 mt-4">
                        <div className="flex justify-between text-sm">
                          <span className="text-white/80">{language === "ko" ? "신원 인증" : "Identity Verified"}</span>
                          <span className="font-bold">1,240{language === "ko" ? "명" : ""}</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-1.5">
                          <div className="bg-white h-1.5 rounded-full" style={{ width: "95%" }}></div>
                        </div>
                        <div className="flex justify-between text-sm mt-2">
                          <span className="text-white/80">{language === "ko" ? "비자 만료 임박" : "Visa Expiring"}</span>
                          <span className="font-bold">45{language === "ko" ? "명" : ""}</span>
                        </div>
                        <div className="w-full bg-black/20 rounded-full h-1.5">
                          <div className="bg-yellow-400 h-1.5 rounded-full" style={{ width: "25%" }}></div>
                        </div>
                      </div>
                    </div>

                    {/* Recent Applicants */}
                    <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6 flex-1">
                      <div className="flex items-center justify-between mb-4">
                        <h2 className="text-lg font-bold text-slate-900 dark:text-white">{language === "ko" ? "최근 지원자" : "Recent Applicants"}</h2>
                        <button onClick={fetchJobs} className="text-slate-400 hover:text-primary transition-colors">
                          <span className="material-symbols-outlined">refresh</span>
                        </button>
                      </div>

                      <div className="space-y-4">
                        {applicants.slice(0, 4).map((applicant) => (
                          <div
                            key={applicant.id}
                            onClick={() => {
                              setSelectedApplicant(applicant);
                              setShowApplicantModal(true);
                            }}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors border border-transparent hover:border-slate-100 dark:hover:border-slate-700 cursor-pointer group"
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                {applicant.first_name.charAt(0)}
                              </div>
                              <div>
                                <h4 className="text-sm font-bold text-slate-900 dark:text-white group-hover:text-primary transition-colors">
                                  {applicant.last_name} {applicant.first_name}
                                </h4>
                                <p className="text-xs text-slate-500">
                                  {applicant.visa_type} ({applicant.nationality})
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <span className="block text-xs font-semibold text-slate-900 dark:text-white">{formatRelativeTime(applicant.applied_at)}</span>
                              <span className={`text-[10px] px-1.5 py-0.5 rounded ${getStatusBadgeStyle(applicant.status)}`}>
                                {getStatusLabel(applicant.status)}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>

                      <button
                        onClick={() => setActiveMenu("applicants")}
                        className="w-full mt-4 py-2 text-sm text-slate-500 hover:text-primary hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors border border-dashed border-slate-300 dark:border-slate-700"
                      >
                        {language === "ko" ? "더 보기" : "View More"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Member Summary */}
                <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                      <h2 className="text-lg font-bold text-slate-900 dark:text-white">{language === "ko" ? "회원 현황 요약" : "Member Summary"}</h2>
                      <span className="px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-xs font-medium text-slate-600 dark:text-slate-400">
                        Total: {stats.totalMembers.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex gap-2">
                      <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">filter_list</span>
                      </button>
                      <button className="p-2 text-slate-400 hover:text-primary transition-colors">
                        <span className="material-symbols-outlined">download</span>
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="p-4 rounded-lg bg-[#f7f6f8] dark:bg-[#191220] border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <span className="material-symbols-outlined">public</span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{language === "ko" ? "외국인 주민" : "Foreign Residents"}</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.foreigners.toLocaleString()}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-[#f7f6f8] dark:bg-[#191220] border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
                        <span className="material-symbols-outlined">support_agent</span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{language === "ko" ? "정착 전문가" : "Consultants"}</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.consultants}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-[#f7f6f8] dark:bg-[#191220] border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600 dark:text-purple-400">
                        <span className="material-symbols-outlined">business</span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{language === "ko" ? "협력 기업" : "Partner Companies"}</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.companies}</p>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-[#f7f6f8] dark:bg-[#191220] border border-slate-200 dark:border-slate-800 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-red-600 dark:text-red-400">
                        <span className="material-symbols-outlined">warning</span>
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">{language === "ko" ? "신고 접수" : "Reports"}</p>
                        <p className="text-xl font-bold text-slate-900 dark:text-white">{stats.reports}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Jobs Management View */}
            {activeMenu === "jobs" && (
              <div className="space-y-6">
                {showJobForm ? (
                  /* Job Form */
                  <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                        {editingJob ? (language === "ko" ? "공고 수정" : "Edit Job Posting") : language === "ko" ? "새 공고 등록" : "Create Job Posting"}
                      </h3>
                      <button
                        onClick={() => {
                          setShowJobForm(false);
                          setEditingJob(null);
                          resetJobForm();
                        }}
                        className="p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>

                    <form onSubmit={editingJob ? handleUpdateJob : handleCreateJob} className="p-6 space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {language === "ko" ? "직종" : "Position"} *
                          </label>
                          <input
                            type="text"
                            required
                            value={jobForm.position}
                            onChange={(e) => setJobForm({ ...jobForm, position: e.target.value })}
                            placeholder={language === "ko" ? "예: 외국인 고용 담당자" : "e.g., Foreign Employment Officer"}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {language === "ko" ? "회사/기관명" : "Company/Agency"} *
                          </label>
                          <input
                            type="text"
                            required
                            value={jobForm.company_name}
                            onChange={(e) => setJobForm({ ...jobForm, company_name: e.target.value })}
                            placeholder={language === "ko" ? "예: 서울글로벌센터" : "e.g., Seoul Global Center"}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {language === "ko" ? "근무 지역" : "Location"} *
                          </label>
                          <input
                            type="text"
                            required
                            value={jobForm.location}
                            onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                            placeholder={language === "ko" ? "예: 서울 종로구" : "e.g., Jongno-gu, Seoul"}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {language === "ko" ? "고용 형태" : "Employment Type"} *
                          </label>
                          <select
                            required
                            value={jobForm.employment_type}
                            onChange={(e) => setJobForm({ ...jobForm, employment_type: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                          >
                            {Object.entries(EMPLOYMENT_TYPES).map(([value, label]) => (
                              <option key={value} value={value}>
                                {label[language as "ko" | "en"]}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {language === "ko" ? "마감일" : "Deadline"}
                          </label>
                          <input
                            type="date"
                            value={jobForm.deadline}
                            onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {language === "ko" ? "급여 범위" : "Salary Range"}
                        </label>
                        <input
                          type="text"
                          value={jobForm.salary_range}
                          onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })}
                          placeholder={language === "ko" ? "예: 연봉 3,500만원~4,000만원" : "e.g., $35,000~$40,000/year"}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                          {language === "ko" ? "업무 설명" : "Job Description"} *
                        </label>
                        <textarea
                          required
                          value={jobForm.description}
                          onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                          rows={4}
                          placeholder={language === "ko" ? "담당 업무에 대해 상세히 작성해주세요." : "Describe the job responsibilities in detail."}
                          className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                        />
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {language === "ko" ? "자격 요건" : "Requirements"}
                          </label>
                          <textarea
                            value={jobForm.requirements}
                            onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                            rows={3}
                            placeholder={language === "ko" ? "필수 자격 요건을 작성해주세요." : "List the required qualifications."}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                            {language === "ko" ? "복지 혜택" : "Benefits"}
                          </label>
                          <textarea
                            value={jobForm.benefits}
                            onChange={(e) => setJobForm({ ...jobForm, benefits: e.target.value })}
                            rows={3}
                            placeholder={language === "ko" ? "복지 혜택을 작성해주세요." : "List the benefits."}
                            className="w-full px-4 py-3 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent transition-colors resize-none"
                          />
                        </div>
                      </div>

                      {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                      )}

                      <div className="flex gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => {
                            setShowJobForm(false);
                            setEditingJob(null);
                            resetJobForm();
                          }}
                          className="flex-1 px-6 py-3 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-lg font-medium hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
                        >
                          {language === "ko" ? "취소" : "Cancel"}
                        </button>
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="flex-1 px-6 py-3 bg-primary text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                          {isSubmitting ? (
                            <>
                              <span className="material-symbols-outlined animate-spin">progress_activity</span>
                              {language === "ko" ? "처리 중..." : "Processing..."}
                            </>
                          ) : editingJob ? (
                            language === "ko" ? "저장" : "Save"
                          ) : language === "ko" ? (
                            "공고 등록"
                          ) : (
                            "Create Posting"
                          )}
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  /* Jobs List */
                  <>
                    <div className="flex justify-between items-center">
                      <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                        {language === "ko" ? `일자리 공고 목록 (${jobs.length}건)` : `Job Postings (${jobs.length})`}
                      </h2>
                      <button
                        onClick={() => setShowJobForm(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                      >
                        <span className="material-symbols-outlined text-[20px]">add</span>
                        {language === "ko" ? "새 공고 등록" : "New Posting"}
                      </button>
                    </div>

                    <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                      <table className="w-full text-left">
                        <thead className="bg-slate-50 dark:bg-slate-800">
                          <tr className="text-slate-500 text-xs uppercase tracking-wider">
                            <th className="px-6 py-4 font-medium">{language === "ko" ? "공고명" : "Position"}</th>
                            <th className="px-6 py-4 font-medium">{language === "ko" ? "기업명" : "Company"}</th>
                            <th className="px-6 py-4 font-medium">{language === "ko" ? "지역" : "Location"}</th>
                            <th className="px-6 py-4 font-medium">{language === "ko" ? "마감일" : "Deadline"}</th>
                            <th className="px-6 py-4 font-medium text-center">{language === "ko" ? "상태" : "Status"}</th>
                            <th className="px-6 py-4 font-medium text-center">{language === "ko" ? "지원자" : "Applicants"}</th>
                            <th className="px-6 py-4 font-medium text-center">{language === "ko" ? "액션" : "Actions"}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                          {jobs.map((job) => (
                            <tr key={job.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                              <td className="px-6 py-4 font-medium text-slate-900 dark:text-white">{job.position}</td>
                              <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{job.company_name}</td>
                              <td className="px-6 py-4 text-slate-500">{job.location}</td>
                              <td className="px-6 py-4 text-slate-500">{formatDate(job.deadline)}</td>
                              <td className="px-6 py-4 text-center">
                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyle(job.status)}`}>
                                  {getStatusLabel(job.status)}
                                </span>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => setActiveMenu("applicants")}
                                  className="text-primary hover:text-blue-700 font-medium"
                                >
                                  {job.applicant_count || 0}
                                  {language === "ko" ? "명" : ""}
                                </button>
                              </td>
                              <td className="px-6 py-4 text-center">
                                <div className="flex items-center justify-center gap-1">
                                  <button
                                    onClick={() => handleEditJob(job)}
                                    className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                                    title={language === "ko" ? "수정" : "Edit"}
                                  >
                                    <span className="material-symbols-outlined text-[18px]">edit</span>
                                  </button>
                                  {job.status === "active" && (
                                    <button
                                      onClick={() => handleCloseJob(job.id)}
                                      className="p-1.5 text-slate-400 hover:text-orange-500 hover:bg-orange-50 dark:hover:bg-orange-900/20 rounded transition-colors"
                                      title={language === "ko" ? "마감" : "Close"}
                                    >
                                      <span className="material-symbols-outlined text-[18px]">block</span>
                                    </button>
                                  )}
                                  <button
                                    onClick={() => handleDeleteJob(job.id)}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title={language === "ko" ? "삭제" : "Delete"}
                                  >
                                    <span className="material-symbols-outlined text-[18px]">delete</span>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Applicants View */}
            {activeMenu === "applicants" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                    {language === "ko" ? `지원자 목록 (${applicants.length}명)` : `Applicants (${applicants.length})`}
                  </h2>
                  <div className="flex gap-2">
                    <select className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm">
                      <option value="">{language === "ko" ? "전체 상태" : "All Status"}</option>
                      <option value="pending">{language === "ko" ? "검토중" : "Pending"}</option>
                      <option value="hired">{language === "ko" ? "채용" : "Hired"}</option>
                      <option value="rejected">{language === "ko" ? "거절" : "Rejected"}</option>
                    </select>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr className="text-slate-500 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-medium">{language === "ko" ? "지원자" : "Applicant"}</th>
                        <th className="px-6 py-4 font-medium">{language === "ko" ? "비자" : "Visa"}</th>
                        <th className="px-6 py-4 font-medium">{language === "ko" ? "국적" : "Nationality"}</th>
                        <th className="px-6 py-4 font-medium">{language === "ko" ? "지원일" : "Applied"}</th>
                        <th className="px-6 py-4 font-medium text-center">{language === "ko" ? "상태" : "Status"}</th>
                        <th className="px-6 py-4 font-medium text-center">{language === "ko" ? "액션" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {applicants.map((applicant) => (
                        <tr key={applicant.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold">
                                {applicant.first_name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">
                                  {applicant.last_name} {applicant.first_name}
                                </p>
                                <p className="text-xs text-slate-500">{applicant.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">{applicant.visa_type}</td>
                          <td className="px-6 py-4 text-slate-500">{applicant.nationality}</td>
                          <td className="px-6 py-4 text-slate-500">{formatRelativeTime(applicant.applied_at)}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyle(applicant.status)}`}>
                              {getStatusLabel(applicant.status)}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button
                                onClick={() => {
                                  setSelectedApplicant(applicant);
                                  setShowApplicantModal(true);
                                }}
                                className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                                title={language === "ko" ? "상세보기" : "View Details"}
                              >
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                              </button>
                              {applicant.status === "pending" && (
                                <>
                                  <button
                                    onClick={() => handleApplicantAction(applicant.id, "hired")}
                                    className="p-1.5 text-slate-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors"
                                    title={language === "ko" ? "채용" : "Hire"}
                                  >
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                  </button>
                                  <button
                                    onClick={() => handleApplicantAction(applicant.id, "rejected")}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
                                    title={language === "ko" ? "거절" : "Reject"}
                                  >
                                    <span className="material-symbols-outlined text-[18px]">cancel</span>
                                  </button>
                                </>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Stats View */}
            {activeMenu === "stats" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{language === "ko" ? "통계 대시보드" : "Statistics Dashboard"}</h2>
                <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">bar_chart</span>
                  <p className="text-slate-500">{language === "ko" ? "상세 통계 기능이 준비 중입니다." : "Detailed statistics feature coming soon."}</p>
                </div>
              </div>
            )}

            {/* Members View */}
            {activeMenu === "members" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{language === "ko" ? "회원 관리" : "Member Management"}</h2>
                <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">manage_accounts</span>
                  <p className="text-slate-500">{language === "ko" ? "회원 관리 기능이 준비 중입니다." : "Member management feature coming soon."}</p>
                </div>
              </div>
            )}

            {/* Settings View */}
            {activeMenu === "settings" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{language === "ko" ? "설정" : "Settings"}</h2>
                <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-12 text-center">
                  <span className="material-symbols-outlined text-5xl text-slate-300 mb-4">settings</span>
                  <p className="text-slate-500">{language === "ko" ? "설정 기능이 준비 중입니다." : "Settings feature coming soon."}</p>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-12 text-center text-xs text-slate-400 pb-4">
            <p>
              © 2024 easyK Platform. All rights reserved. |{" "}
              <Link href="/privacy" className="hover:text-slate-600 dark:hover:text-slate-200">
                {language === "ko" ? "개인정보처리방침" : "Privacy Policy"}
              </Link>{" "}
              |{" "}
              <Link href="/terms" className="hover:text-slate-600 dark:hover:text-slate-200">
                {language === "ko" ? "이용약관" : "Terms of Service"}
              </Link>
            </p>
          </footer>
        </div>
      </main>

      {/* Applicant Detail Modal */}
      {showApplicantModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-[#201a2d] rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{language === "ko" ? "지원자 상세 정보" : "Applicant Details"}</h3>
              <button
                onClick={() => {
                  setShowApplicantModal(false);
                  setSelectedApplicant(null);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Profile Header */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center text-primary text-2xl font-bold">
                  {selectedApplicant.first_name.charAt(0)}
                </div>
                <div>
                  <h4 className="text-xl font-bold text-slate-900 dark:text-white">
                    {selectedApplicant.last_name} {selectedApplicant.first_name}
                  </h4>
                  <p className="text-slate-500">{selectedApplicant.email}</p>
                </div>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">{language === "ko" ? "비자 종류" : "Visa Type"}</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedApplicant.visa_type}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">{language === "ko" ? "국적" : "Nationality"}</p>
                  <p className="font-medium text-slate-900 dark:text-white">{selectedApplicant.nationality}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">{language === "ko" ? "지원일" : "Applied Date"}</p>
                  <p className="font-medium text-slate-900 dark:text-white">{formatDate(selectedApplicant.applied_at)}</p>
                </div>
                <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <p className="text-xs text-slate-500 mb-1">{language === "ko" ? "상태" : "Status"}</p>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeStyle(selectedApplicant.status)}`}>
                    {getStatusLabel(selectedApplicant.status)}
                  </span>
                </div>
              </div>

              {/* Actions */}
              {selectedApplicant.status === "pending" && (
                <div className="flex gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
                  <button
                    onClick={() => handleApplicantAction(selectedApplicant.id, "hired")}
                    className="flex-1 px-4 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">check_circle</span>
                    {language === "ko" ? "채용 확정" : "Hire"}
                  </button>
                  <button
                    onClick={() => handleApplicantAction(selectedApplicant.id, "rejected")}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined">cancel</span>
                    {language === "ko" ? "거절" : "Reject"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
