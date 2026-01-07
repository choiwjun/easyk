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
  phone?: string;
  visa_type: string;
  nationality: string;
  applied_at: string;
  status: "pending" | "reviewing" | "hired" | "rejected";
  resume_url?: string;
  cover_letter?: string;
  topik_level?: number;
  job_title?: string;
  company_name?: string;
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
  const [isUpdatingApplicant, setIsUpdatingApplicant] = useState(false);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [publishedJob, setPublishedJob] = useState<{ position: string; id: string; createdAt: string } | null>(null);
  const [userName, setUserName] = useState("김지자 관리자");
  const [userDept, setUserDept] = useState("서울시 외국인지원팀");

  const [jobForm, setJobForm] = useState({
    position: "",
    company_name: "",
    location: "",
    employment_type: "full-time",
    job_type: "", // 직종
    salary_range: "",
    work_hours: "", // 근무 시간
    description: "",
    requirements: "",
    preferred_qualifications: "",
    benefits: "",
    deadline: "",
    status: "active", // 공고 상태
  });

  // 직종 목록
  const JOB_TYPES: Record<string, { ko: string; en: string }> = {
    manufacturing: { ko: "제조/생산", en: "Manufacturing" },
    service: { ko: "서비스/식음료", en: "Service/F&B" },
    construction: { ko: "건설/건축", en: "Construction" },
    it: { ko: "IT/정보통신", en: "IT/Tech" },
    office: { ko: "사무/경영지원", en: "Office/Admin" },
    marketing: { ko: "마케팅/영업", en: "Marketing/Sales" },
    logistics: { ko: "물류/운송", en: "Logistics" },
    other: { ko: "기타", en: "Other" },
  };

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
        const data = await response.json();
        setShowJobForm(false);
        // Show success modal
        setPublishedJob({
          position: jobForm.position,
          id: data.id || `JK-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
          createdAt: new Date().toISOString(),
        });
        setShowSuccessModal(true);
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

  const handleCloseJob = async (jobId: string) => {
    if (!confirm(language === "ko" ? "이 공고를 마감하시겠습니까?" : "Are you sure you want to close this job posting?")) return;

    try {
      const token = localStorage.getItem("access_token");
      const job = jobs.find((j) => j.id === jobId);
      if (!job) return;

      const response = await fetch(`/api/jobs/${jobId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ ...job, status: "closed" }),
      });

      if (response.ok) {
        setJobs(jobs.map((j) => (j.id === jobId ? { ...j, status: "closed" } : j)));
      } else {
        const errorData = await response.json();
        setError(errorData.detail || (language === "ko" ? "공고 마감에 실패했습니다." : "Failed to close job posting."));
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
      job_type: (job as Job & { job_type?: string }).job_type || "",
      salary_range: job.salary_range || "",
      work_hours: (job as Job & { work_hours?: string }).work_hours || "",
      description: job.description,
      requirements: job.requirements || "",
      preferred_qualifications: job.preferred_qualifications || "",
      benefits: job.benefits || "",
      deadline: job.deadline ? job.deadline.split("T")[0] : "",
      status: job.status || "active",
    });
    setShowJobForm(true);
  };

  const resetJobForm = () => {
    setJobForm({
      position: "",
      company_name: "",
      location: "",
      employment_type: "full-time",
      job_type: "",
      salary_range: "",
      work_hours: "",
      description: "",
      requirements: "",
      preferred_qualifications: "",
      benefits: "",
      deadline: "",
      status: "active",
    });
  };

  const handleApplicantAction = async (applicantId: string, action: "hired" | "rejected") => {
    setIsUpdatingApplicant(true);
    try {
      const token = localStorage.getItem("access_token");
      // Map frontend status to backend status
      const backendStatus = action === "hired" ? "accepted" : "rejected";

      const response = await fetch(`/api/jobs/applications/${applicantId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: backendStatus }),
      });

      if (response.ok) {
        setApplicants(applicants.map((a) => (a.id === applicantId ? { ...a, status: action } : a)));
        setShowApplicantModal(false);
        setSelectedApplicant(null);
      } else {
        const errorData = await response.json();
        setError(errorData.detail || (language === "ko" ? "지원자 상태 변경에 실패했습니다." : "Failed to update applicant status."));
      }
    } catch {
      setError(language === "ko" ? "네트워크 오류가 발생했습니다." : "Network error occurred.");
    } finally {
      setIsUpdatingApplicant(false);
    }
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
                  /* Enhanced Job Form - design.html style */
                  <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                    {/* Decorative Header */}
                    <div className="h-24 w-full bg-gradient-to-r from-primary/10 to-blue-50 dark:from-primary/20 dark:to-slate-800 relative overflow-hidden">
                      <div className="absolute inset-0 opacity-30" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"40\" height=\"40\" viewBox=\"0 0 40 40\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"%239C92AC\" fill-opacity=\"0.1\" fill-rule=\"evenodd\"%3E%3Cpath d=\"M0 40L40 0H20L0 20M40 40V20L20 40\"/%3E%3C/g%3E%3C/svg%3E')" }}></div>
                      <div className="absolute bottom-4 left-6 flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">edit_document</span>
                        <span className="text-primary font-bold text-sm uppercase tracking-wider">
                          {editingJob ? (language === "ko" ? "공고 수정" : "Edit Posting") : (language === "ko" ? "채용 공고 작성" : "Create Job Posting")}
                        </span>
                      </div>
                      <button
                        onClick={() => {
                          setShowJobForm(false);
                          setEditingJob(null);
                          resetJobForm();
                        }}
                        className="absolute top-4 right-4 p-2 text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 rounded-lg hover:bg-white/50 dark:hover:bg-slate-700 transition-colors"
                      >
                        <span className="material-symbols-outlined">close</span>
                      </button>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); if (editingJob) { handleUpdateJob(e); } else { setShowPreviewModal(true); } }} className="p-6 md:p-8 flex flex-col gap-8">
                      {/* Section 1: Basic Info */}
                      <section className="flex flex-col gap-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                          <span className="material-symbols-outlined text-primary text-xl">domain</span>
                          {language === "ko" ? "기본 정보" : "Basic Information"}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Job Title */}
                          <div className="md:col-span-2">
                            <label className="block text-slate-900 dark:text-white text-sm font-bold mb-2">
                              {language === "ko" ? "공고 제목" : "Job Title"} <span className="text-red-500">*</span>
                            </label>
                            <input
                              type="text"
                              required
                              value={jobForm.position}
                              onChange={(e) => setJobForm({ ...jobForm, position: e.target.value })}
                              placeholder={language === "ko" ? "예: [서울] 해외 마케팅 담당자 모집 (신입/경력)" : "e.g., [Seoul] Marketing Manager Recruitment"}
                              className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 px-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-sm"
                            />
                          </div>
                          {/* Company Name */}
                          <div>
                            <label className="block text-slate-900 dark:text-white text-sm font-bold mb-2">
                              {language === "ko" ? "회사명" : "Company"} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={jobForm.company_name}
                                onChange={(e) => setJobForm({ ...jobForm, company_name: e.target.value })}
                                placeholder={language === "ko" ? "회사 이름을 입력하세요" : "Enter company name"}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 pl-10 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-sm"
                              />
                              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-lg">business</span>
                            </div>
                          </div>
                          {/* Employment Type */}
                          <div>
                            <label className="block text-slate-900 dark:text-white text-sm font-bold mb-2">
                              {language === "ko" ? "고용형태" : "Employment Type"} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <select
                                required
                                value={jobForm.employment_type}
                                onChange={(e) => setJobForm({ ...jobForm, employment_type: e.target.value })}
                                className="w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 pl-10 pr-10 py-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-sm cursor-pointer"
                              >
                                {Object.entries(EMPLOYMENT_TYPES).map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {label[language as "ko" | "en"]}
                                  </option>
                                ))}
                              </select>
                              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-lg">badge</span>
                              <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 text-lg pointer-events-none">expand_more</span>
                            </div>
                          </div>
                          {/* Job Status Toggle - Only show when editing */}
                          {editingJob && (
                            <div>
                              <label className="block text-slate-900 dark:text-white text-sm font-bold mb-2">
                                {language === "ko" ? "공고 상태" : "Posting Status"}
                              </label>
                              <div className="flex items-center h-12">
                                <label className="inline-flex items-center cursor-pointer">
                                  <input
                                    type="checkbox"
                                    checked={jobForm.status === "active"}
                                    onChange={(e) => setJobForm({ ...jobForm, status: e.target.checked ? "active" : "closed" })}
                                    className="sr-only peer"
                                  />
                                  <div className="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                                  <span className="ms-3 text-sm font-medium text-slate-900 dark:text-slate-300">
                                    {jobForm.status === "active"
                                      ? (language === "ko" ? "모집중" : "Active")
                                      : (language === "ko" ? "마감" : "Closed")}
                                  </span>
                                </label>
                              </div>
                            </div>
                          )}
                        </div>
                      </section>

                      {/* Section 2: Detailed Conditions */}
                      <section className="flex flex-col gap-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                          <span className="material-symbols-outlined text-primary text-xl">fact_check</span>
                          {language === "ko" ? "상세 조건" : "Detailed Conditions"}
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          {/* Job Type */}
                          <div>
                            <label className="block text-slate-900 dark:text-white text-sm font-bold mb-2">
                              {language === "ko" ? "직종" : "Job Category"} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <select
                                required
                                value={jobForm.job_type}
                                onChange={(e) => setJobForm({ ...jobForm, job_type: e.target.value })}
                                className="w-full appearance-none rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 pl-10 pr-10 py-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-sm cursor-pointer"
                              >
                                <option value="" disabled>{language === "ko" ? "직종을 선택해주세요" : "Select job category"}</option>
                                {Object.entries(JOB_TYPES).map(([value, label]) => (
                                  <option key={value} value={value}>
                                    {label[language as "ko" | "en"]}
                                  </option>
                                ))}
                              </select>
                              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-lg">category</span>
                              <span className="material-symbols-outlined absolute right-3 top-3 text-slate-400 text-lg pointer-events-none">expand_more</span>
                            </div>
                          </div>
                          {/* Deadline */}
                          <div>
                            <label className="block text-slate-900 dark:text-white text-sm font-bold mb-2">
                              {language === "ko" ? "모집 마감일" : "Application Deadline"} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="date"
                                required
                                value={jobForm.deadline}
                                onChange={(e) => setJobForm({ ...jobForm, deadline: e.target.value })}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 pl-10 pr-4 py-3 text-slate-900 dark:text-white focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-sm"
                              />
                              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-lg">calendar_month</span>
                            </div>
                          </div>
                          {/* Work Location */}
                          <div>
                            <label className="block text-slate-900 dark:text-white text-sm font-bold mb-2">
                              {language === "ko" ? "근무지" : "Work Location"} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={jobForm.location}
                                onChange={(e) => setJobForm({ ...jobForm, location: e.target.value })}
                                placeholder={language === "ko" ? "예: 서울시 강남구 테헤란로 123" : "e.g., 123 Teheran-ro, Gangnam-gu, Seoul"}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 pl-10 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-sm"
                              />
                              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-lg">location_on</span>
                            </div>
                          </div>
                          {/* Salary */}
                          <div>
                            <label className="block text-slate-900 dark:text-white text-sm font-bold mb-2">
                              {language === "ko" ? "급여" : "Salary"} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={jobForm.salary_range}
                                onChange={(e) => setJobForm({ ...jobForm, salary_range: e.target.value })}
                                placeholder={language === "ko" ? "예: 월 250만원 (면접 후 협의 가능)" : "e.g., $2,500/month (negotiable)"}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 pl-10 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-sm"
                              />
                              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-lg">attach_money</span>
                            </div>
                          </div>
                          {/* Work Hours */}
                          <div>
                            <label className="block text-slate-900 dark:text-white text-sm font-bold mb-2">
                              {language === "ko" ? "근무 시간" : "Work Hours"}
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                value={jobForm.work_hours}
                                onChange={(e) => setJobForm({ ...jobForm, work_hours: e.target.value })}
                                placeholder={language === "ko" ? "예: 09:00 - 18:00 (주 5일)" : "e.g., 09:00 - 18:00 (Mon-Fri)"}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 pl-10 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-sm"
                              />
                              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-lg">schedule</span>
                            </div>
                          </div>
                          {/* Qualifications */}
                          <div className="md:col-span-2">
                            <label className="block text-slate-900 dark:text-white text-sm font-bold mb-2">
                              {language === "ko" ? "자격 요건" : "Qualifications"} <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                              <input
                                type="text"
                                required
                                value={jobForm.requirements}
                                onChange={(e) => setJobForm({ ...jobForm, requirements: e.target.value })}
                                placeholder={language === "ko" ? "예: TOPIK 3급 이상, 관련 경력 1년 이상 우대" : "e.g., TOPIK Level 3+, 1+ years experience preferred"}
                                className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 pl-10 pr-4 py-3 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-sm"
                              />
                              <span className="material-symbols-outlined absolute left-3 top-3 text-slate-400 text-lg">school</span>
                            </div>
                          </div>
                        </div>
                      </section>

                      {/* Section 3: Job Description */}
                      <section className="flex flex-col gap-6">
                        <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-700">
                          <span className="material-symbols-outlined text-primary text-xl">description</span>
                          {language === "ko" ? "상세 내용" : "Job Details"}
                        </h3>
                        <div>
                          <label className="block text-slate-900 dark:text-white text-sm font-bold mb-2">
                            {language === "ko" ? "상세 업무 내용" : "Detailed Job Description"} <span className="text-red-500">*</span>
                          </label>
                          <textarea
                            required
                            value={jobForm.description}
                            onChange={(e) => setJobForm({ ...jobForm, description: e.target.value })}
                            rows={8}
                            placeholder={language === "ko"
                              ? `주요 업무, 근무 조건, 복리후생 등 상세한 채용 정보를 입력해주세요.

예시:
- 담당 업무: 해외 고객 응대 및 문서 번역
- 우대 사항: 영어 가능자 우대
- 복리후생: 4대 보험, 중식 제공`
                              : `Enter detailed job information including responsibilities, conditions, benefits.

Example:
- Responsibilities: Customer support and document translation
- Preferred: English proficiency
- Benefits: Insurance, lunch provided`}
                            className="w-full min-h-[200px] rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-sm resize-y leading-relaxed"
                          />
                          <p className="text-right text-xs text-slate-500 mt-2">
                            {language === "ko" ? "최소 50자 이상 입력해주세요." : "Minimum 50 characters required."}
                          </p>
                        </div>

                        {/* Benefits (optional) */}
                        <div>
                          <label className="block text-slate-900 dark:text-white text-sm font-bold mb-2">
                            {language === "ko" ? "복리후생 (선택)" : "Benefits (Optional)"}
                          </label>
                          <textarea
                            value={jobForm.benefits}
                            onChange={(e) => setJobForm({ ...jobForm, benefits: e.target.value })}
                            rows={3}
                            placeholder={language === "ko" ? "예: 4대보험, 연차, 식비지원, 기숙사 제공" : "e.g., Insurance, vacation, meal allowance, housing"}
                            className="w-full rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 p-4 text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-primary focus:ring-1 focus:ring-primary transition-all shadow-sm text-sm resize-y"
                          />
                        </div>
                      </section>

                      {error && (
                        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                          <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                        </div>
                      )}

                      {/* Actions */}
                      <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
                        <button
                          type="button"
                          onClick={() => {
                            setShowJobForm(false);
                            setEditingJob(null);
                            resetJobForm();
                          }}
                          className="w-full sm:w-auto h-12 px-8 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-base font-bold transition-all"
                        >
                          {language === "ko" ? "취소" : "Cancel"}
                        </button>
                        {!editingJob && (
                          <button
                            type="button"
                            onClick={() => alert(language === "ko" ? "임시 저장되었습니다." : "Draft saved.")}
                            className="w-full sm:w-auto h-12 px-8 rounded-lg border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 bg-white dark:bg-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 text-base font-bold transition-all"
                          >
                            {language === "ko" ? "임시 저장" : "Save Draft"}
                          </button>
                        )}
                        <button
                          type="submit"
                          disabled={isSubmitting}
                          className="w-full sm:w-auto h-12 px-8 rounded-lg bg-primary hover:bg-blue-700 text-white text-base font-bold transition-all shadow-md shadow-blue-500/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {editingJob ? (
                            <>
                              <span className="material-symbols-outlined text-xl">save</span>
                              {language === "ko" ? "변경사항 저장" : "Save Changes"}
                            </>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-xl">visibility</span>
                              {language === "ko" ? "미리보기" : "Preview"}
                            </>
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
                                    disabled={isUpdatingApplicant}
                                    className="p-1.5 text-slate-400 hover:text-green-500 hover:bg-green-50 dark:hover:bg-green-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    title={language === "ko" ? "채용" : "Hire"}
                                  >
                                    <span className="material-symbols-outlined text-[18px]">check_circle</span>
                                  </button>
                                  <button
                                    onClick={() => handleApplicantAction(applicant.id, "rejected")}
                                    disabled={isUpdatingApplicant}
                                    className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
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
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{language === "ko" ? "통계 대시보드" : "Statistics Dashboard"}</h2>
                  <div className="flex gap-2">
                    <select className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm">
                      <option value="month">{language === "ko" ? "이번 달" : "This Month"}</option>
                      <option value="quarter">{language === "ko" ? "이번 분기" : "This Quarter"}</option>
                      <option value="year">{language === "ko" ? "올해" : "This Year"}</option>
                    </select>
                    <button className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm flex items-center gap-2 hover:bg-slate-50 dark:hover:bg-slate-600">
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      {language === "ko" ? "리포트 내보내기" : "Export Report"}
                    </button>
                  </div>
                </div>

                {/* Stats Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-[#201a2d] p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                        <span className="material-symbols-outlined">campaign</span>
                      </div>
                      <span className="text-sm text-slate-500">{language === "ko" ? "총 공고 수" : "Total Jobs"}</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{jobs.length}</p>
                    <p className="text-xs text-green-600 mt-1">+12% {language === "ko" ? "전월 대비" : "vs last month"}</p>
                  </div>

                  <div className="bg-white dark:bg-[#201a2d] p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                        <span className="material-symbols-outlined">group</span>
                      </div>
                      <span className="text-sm text-slate-500">{language === "ko" ? "총 지원자 수" : "Total Applicants"}</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{applicants.length}</p>
                    <p className="text-xs text-green-600 mt-1">+8% {language === "ko" ? "전월 대비" : "vs last month"}</p>
                  </div>

                  <div className="bg-white dark:bg-[#201a2d] p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                        <span className="material-symbols-outlined">check_circle</span>
                      </div>
                      <span className="text-sm text-slate-500">{language === "ko" ? "채용 완료" : "Hired"}</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">{applicants.filter(a => a.status === "hired").length}</p>
                    <p className="text-xs text-green-600 mt-1">+15% {language === "ko" ? "전월 대비" : "vs last month"}</p>
                  </div>

                  <div className="bg-white dark:bg-[#201a2d] p-5 rounded-xl border border-slate-200 dark:border-slate-700">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-10 h-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center text-orange-600">
                        <span className="material-symbols-outlined">percent</span>
                      </div>
                      <span className="text-sm text-slate-500">{language === "ko" ? "채용률" : "Hire Rate"}</span>
                    </div>
                    <p className="text-2xl font-bold text-slate-900 dark:text-white">
                      {applicants.length > 0 ? Math.round((applicants.filter(a => a.status === "hired").length / applicants.length) * 100) : 0}%
                    </p>
                    <p className="text-xs text-green-600 mt-1">+5% {language === "ko" ? "전월 대비" : "vs last month"}</p>
                  </div>
                </div>

                {/* Charts Section */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Monthly Trend Chart */}
                  <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{language === "ko" ? "월별 지원자 추이" : "Monthly Applicant Trend"}</h3>
                    <div className="h-64 flex items-end justify-between gap-2 px-4">
                      {[65, 45, 78, 52, 89, 67, 94, 71, 83, 56, 92, 78].map((value, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <div
                            className="w-full bg-primary/80 rounded-t transition-all hover:bg-primary"
                            style={{ height: `${value}%` }}
                          ></div>
                          <span className="text-[10px] text-slate-400">{i + 1}{language === "ko" ? "월" : ""}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Visa Type Distribution */}
                  <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{language === "ko" ? "비자 유형별 분포" : "Visa Type Distribution"}</h3>
                    <div className="flex items-center justify-center h-48">
                      <div className="relative w-40 h-40">
                        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#e2e8f0" strokeWidth="20" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#3b82f6" strokeWidth="20" strokeDasharray="100 151" strokeDashoffset="0" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#8b5cf6" strokeWidth="20" strokeDasharray="60 191" strokeDashoffset="-100" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#22c55e" strokeWidth="20" strokeDasharray="50 201" strokeDashoffset="-160" />
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#f59e0b" strokeWidth="20" strokeDasharray="41 210" strokeDashoffset="-210" />
                        </svg>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-4">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">E-9 (40%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-purple-500"></span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">F-6 (24%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-green-500"></span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">D-2 (20%)</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-amber-500"></span>
                        <span className="text-sm text-slate-600 dark:text-slate-300">E-7 (16%)</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nationality Distribution */}
                <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{language === "ko" ? "국적별 지원자 현황" : "Applicants by Nationality"}</h3>
                  <div className="space-y-4">
                    {[
                      { country: language === "ko" ? "베트남" : "Vietnam", count: 145, percent: 35, flag: "🇻🇳" },
                      { country: language === "ko" ? "중국" : "China", count: 98, percent: 24, flag: "🇨🇳" },
                      { country: language === "ko" ? "인도네시아" : "Indonesia", count: 67, percent: 16, flag: "🇮🇩" },
                      { country: language === "ko" ? "필리핀" : "Philippines", count: 52, percent: 13, flag: "🇵🇭" },
                      { country: language === "ko" ? "기타" : "Others", count: 50, percent: 12, flag: "🌍" },
                    ].map((item, i) => (
                      <div key={i} className="flex items-center gap-4">
                        <span className="text-2xl">{item.flag}</span>
                        <div className="flex-1">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{item.country}</span>
                            <span className="text-sm text-slate-500">{item.count}{language === "ko" ? "명" : ""} ({item.percent}%)</span>
                          </div>
                          <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2">
                            <div className="bg-primary h-2 rounded-full" style={{ width: `${item.percent}%` }}></div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Job Performance Table */}
                <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4">{language === "ko" ? "공고별 성과" : "Job Performance"}</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-slate-100 dark:border-slate-700 text-slate-500 text-xs uppercase">
                          <th className="pb-3 font-medium">{language === "ko" ? "공고명" : "Job Title"}</th>
                          <th className="pb-3 font-medium text-center">{language === "ko" ? "조회수" : "Views"}</th>
                          <th className="pb-3 font-medium text-center">{language === "ko" ? "지원자" : "Applicants"}</th>
                          <th className="pb-3 font-medium text-center">{language === "ko" ? "채용" : "Hired"}</th>
                          <th className="pb-3 font-medium text-center">{language === "ko" ? "전환율" : "Conversion"}</th>
                        </tr>
                      </thead>
                      <tbody className="text-sm">
                        {jobs.slice(0, 5).map((job, i) => (
                          <tr key={job.id} className="border-b border-slate-50 dark:border-slate-800">
                            <td className="py-3 font-medium text-slate-900 dark:text-white">{job.position}</td>
                            <td className="py-3 text-center text-slate-600 dark:text-slate-300">{Math.floor(Math.random() * 500) + 100}</td>
                            <td className="py-3 text-center text-slate-600 dark:text-slate-300">{job.applicant_count || Math.floor(Math.random() * 50) + 5}</td>
                            <td className="py-3 text-center text-green-600">{Math.floor(Math.random() * 10) + 1}</td>
                            <td className="py-3 text-center">
                              <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                {Math.floor(Math.random() * 30) + 10}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* Members View */}
            {activeMenu === "members" && (
              <div className="space-y-6">
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white">{language === "ko" ? "회원 관리" : "Member Management"}</h2>
                  <div className="flex gap-2">
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                      <input
                        type="text"
                        placeholder={language === "ko" ? "회원 검색..." : "Search members..."}
                        className="pl-10 pr-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm w-64"
                      />
                    </div>
                    <select className="px-4 py-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-sm">
                      <option value="">{language === "ko" ? "전체 유형" : "All Types"}</option>
                      <option value="foreign">{language === "ko" ? "외국인" : "Foreign"}</option>
                      <option value="consultant">{language === "ko" ? "전문가" : "Consultant"}</option>
                      <option value="company">{language === "ko" ? "기업" : "Company"}</option>
                    </select>
                    <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm flex items-center gap-2 hover:bg-blue-700">
                      <span className="material-symbols-outlined text-[18px]">download</span>
                      {language === "ko" ? "내보내기" : "Export"}
                    </button>
                  </div>
                </div>

                {/* Member Stats Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-[#201a2d] p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600">
                      <span className="material-symbols-outlined">public</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{language === "ko" ? "외국인 주민" : "Foreign Residents"}</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">11,204</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#201a2d] p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center text-teal-600">
                      <span className="material-symbols-outlined">support_agent</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{language === "ko" ? "전문가" : "Consultants"}</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">356</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#201a2d] p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center text-purple-600">
                      <span className="material-symbols-outlined">business</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{language === "ko" ? "협력 기업" : "Partner Companies"}</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">842</p>
                    </div>
                  </div>
                  <div className="bg-white dark:bg-[#201a2d] p-4 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600">
                      <span className="material-symbols-outlined">trending_up</span>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">{language === "ko" ? "이번 달 신규" : "New This Month"}</p>
                      <p className="text-xl font-bold text-slate-900 dark:text-white">+127</p>
                    </div>
                  </div>
                </div>

                {/* Members Table */}
                <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
                  <table className="w-full text-left">
                    <thead className="bg-slate-50 dark:bg-slate-800">
                      <tr className="text-slate-500 text-xs uppercase tracking-wider">
                        <th className="px-6 py-4 font-medium">{language === "ko" ? "회원" : "Member"}</th>
                        <th className="px-6 py-4 font-medium">{language === "ko" ? "유형" : "Type"}</th>
                        <th className="px-6 py-4 font-medium">{language === "ko" ? "국적/비자" : "Nationality/Visa"}</th>
                        <th className="px-6 py-4 font-medium">{language === "ko" ? "가입일" : "Joined"}</th>
                        <th className="px-6 py-4 font-medium text-center">{language === "ko" ? "상태" : "Status"}</th>
                        <th className="px-6 py-4 font-medium text-center">{language === "ko" ? "액션" : "Actions"}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                      {[
                        { id: 1, name: "Nguyen Van A", email: "nguyen.a@email.com", type: "foreign", nationality: "베트남", visa: "E-9", joined: "2024-10-15", status: "active" },
                        { id: 2, name: "김변호사", email: "lawyer.kim@email.com", type: "consultant", nationality: "한국", visa: "-", joined: "2024-09-20", status: "active" },
                        { id: 3, name: "Zhang Wei", email: "zhang.wei@email.com", type: "foreign", nationality: "중국", visa: "D-2", joined: "2024-11-01", status: "pending" },
                        { id: 4, name: "(주)미래테크", email: "hr@miraetech.com", type: "company", nationality: "-", visa: "-", joined: "2024-08-10", status: "active" },
                        { id: 5, name: "Elena Petrova", email: "elena.p@email.com", type: "foreign", nationality: "러시아", visa: "F-6", joined: "2024-10-28", status: "active" },
                        { id: 6, name: "박전문가", email: "expert.park@email.com", type: "consultant", nationality: "한국", visa: "-", joined: "2024-07-15", status: "inactive" },
                        { id: 7, name: "Michael Singh", email: "michael.s@email.com", type: "foreign", nationality: "인도", visa: "E-7", joined: "2024-11-10", status: "active" },
                        { id: 8, name: "CJ대한통운", email: "recruit@cjlogistics.com", type: "company", nationality: "-", visa: "-", joined: "2024-06-01", status: "active" },
                      ].map((member) => (
                        <tr key={member.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                                member.type === "foreign" ? "bg-blue-100 text-blue-600" :
                                member.type === "consultant" ? "bg-teal-100 text-teal-600" :
                                "bg-purple-100 text-purple-600"
                              }`}>
                                {member.name.charAt(0)}
                              </div>
                              <div>
                                <p className="font-medium text-slate-900 dark:text-white">{member.name}</p>
                                <p className="text-xs text-slate-500">{member.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              member.type === "foreign" ? "bg-blue-100 text-blue-700" :
                              member.type === "consultant" ? "bg-teal-100 text-teal-700" :
                              "bg-purple-100 text-purple-700"
                            }`}>
                              {member.type === "foreign" ? (language === "ko" ? "외국인" : "Foreign") :
                               member.type === "consultant" ? (language === "ko" ? "전문가" : "Consultant") :
                               (language === "ko" ? "기업" : "Company")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-slate-600 dark:text-slate-300">
                            {member.nationality}{member.visa !== "-" && ` / ${member.visa}`}
                          </td>
                          <td className="px-6 py-4 text-slate-500">{member.joined}</td>
                          <td className="px-6 py-4 text-center">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                              member.status === "active" ? "bg-green-100 text-green-700" :
                              member.status === "pending" ? "bg-yellow-100 text-yellow-700" :
                              "bg-gray-100 text-gray-700"
                            }`}>
                              {member.status === "active" ? (language === "ko" ? "활성" : "Active") :
                               member.status === "pending" ? (language === "ko" ? "대기" : "Pending") :
                               (language === "ko" ? "비활성" : "Inactive")}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-1">
                              <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" title={language === "ko" ? "상세보기" : "View"}>
                                <span className="material-symbols-outlined text-[18px]">visibility</span>
                              </button>
                              <button className="p-1.5 text-slate-400 hover:text-primary hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors" title={language === "ko" ? "수정" : "Edit"}>
                                <span className="material-symbols-outlined text-[18px]">edit</span>
                              </button>
                              <button className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors" title={language === "ko" ? "비활성화" : "Deactivate"}>
                                <span className="material-symbols-outlined text-[18px]">block</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>

                  {/* Pagination */}
                  <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-700 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                      {language === "ko" ? "총 12,402명 중 1-8" : "Showing 1-8 of 12,402"}
                    </p>
                    <div className="flex gap-1">
                      <button className="px-3 py-1 rounded border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm">
                        {language === "ko" ? "이전" : "Prev"}
                      </button>
                      <button className="px-3 py-1 rounded bg-primary text-white text-sm">1</button>
                      <button className="px-3 py-1 rounded border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm">2</button>
                      <button className="px-3 py-1 rounded border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm">3</button>
                      <span className="px-3 py-1 text-slate-400">...</span>
                      <button className="px-3 py-1 rounded border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm">1551</button>
                      <button className="px-3 py-1 rounded border border-slate-200 dark:border-slate-600 text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-700 text-sm">
                        {language === "ko" ? "다음" : "Next"}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Settings View */}
            {activeMenu === "settings" && (
              <div className="space-y-6">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{language === "ko" ? "설정" : "Settings"}</h2>

                {/* Profile Settings */}
                <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">person</span>
                    {language === "ko" ? "프로필 설정" : "Profile Settings"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {language === "ko" ? "담당자명" : "Manager Name"}
                      </label>
                      <input
                        type="text"
                        defaultValue={userName}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {language === "ko" ? "부서명" : "Department"}
                      </label>
                      <input
                        type="text"
                        defaultValue={userDept}
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {language === "ko" ? "이메일" : "Email"}
                      </label>
                      <input
                        type="email"
                        defaultValue="admin@seoul.go.kr"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {language === "ko" ? "연락처" : "Phone"}
                      </label>
                      <input
                        type="tel"
                        defaultValue="02-1234-5678"
                        className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Notification Settings */}
                <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">notifications</span>
                    {language === "ko" ? "알림 설정" : "Notification Settings"}
                  </h3>
                  <div className="space-y-4">
                    {[
                      { id: "new_applicant", label: language === "ko" ? "새 지원자 알림" : "New Applicant Notifications", desc: language === "ko" ? "새로운 지원자가 있을 때 알림을 받습니다." : "Get notified when new applicants apply.", default: true },
                      { id: "job_expired", label: language === "ko" ? "공고 마감 알림" : "Job Expiry Notifications", desc: language === "ko" ? "공고 마감 3일 전에 알림을 받습니다." : "Get notified 3 days before job posting expires.", default: true },
                      { id: "weekly_report", label: language === "ko" ? "주간 리포트" : "Weekly Reports", desc: language === "ko" ? "매주 월요일에 주간 통계 리포트를 받습니다." : "Receive weekly statistics report every Monday.", default: false },
                      { id: "email_digest", label: language === "ko" ? "이메일 다이제스트" : "Email Digest", desc: language === "ko" ? "일일 활동 요약을 이메일로 받습니다." : "Receive daily activity summary via email.", default: true },
                    ].map((item) => (
                      <div key={item.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                        <div>
                          <p className="font-medium text-slate-900 dark:text-white">{item.label}</p>
                          <p className="text-sm text-slate-500">{item.desc}</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input type="checkbox" defaultChecked={item.default} className="sr-only peer" />
                          <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-primary"></div>
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Display Settings */}
                <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">palette</span>
                    {language === "ko" ? "화면 설정" : "Display Settings"}
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {language === "ko" ? "언어" : "Language"}
                      </label>
                      <select className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                        <option value="ko">한국어</option>
                        <option value="en">English</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {language === "ko" ? "테마" : "Theme"}
                      </label>
                      <select className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                        <option value="light">{language === "ko" ? "라이트 모드" : "Light Mode"}</option>
                        <option value="dark">{language === "ko" ? "다크 모드" : "Dark Mode"}</option>
                        <option value="system">{language === "ko" ? "시스템 설정" : "System Default"}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {language === "ko" ? "대시보드 기본 탭" : "Default Dashboard Tab"}
                      </label>
                      <select className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                        <option value="dashboard">{language === "ko" ? "대시보드" : "Dashboard"}</option>
                        <option value="jobs">{language === "ko" ? "일자리 관리" : "Job Management"}</option>
                        <option value="applicants">{language === "ko" ? "지원자 목록" : "Applicants"}</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
                        {language === "ko" ? "목록당 항목 수" : "Items per Page"}
                      </label>
                      <select className="w-full px-4 py-2 rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white">
                        <option value="10">10</option>
                        <option value="25">25</option>
                        <option value="50">50</option>
                        <option value="100">100</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Security Settings */}
                <div className="bg-white dark:bg-[#201a2d] rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm p-6">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                    <span className="material-symbols-outlined text-primary">security</span>
                    {language === "ko" ? "보안 설정" : "Security Settings"}
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{language === "ko" ? "비밀번호 변경" : "Change Password"}</p>
                        <p className="text-sm text-slate-500">{language === "ko" ? "마지막 변경: 30일 전" : "Last changed: 30 days ago"}</p>
                      </div>
                      <button className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
                        {language === "ko" ? "변경" : "Change"}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{language === "ko" ? "2단계 인증" : "Two-Factor Authentication"}</p>
                        <p className="text-sm text-slate-500">{language === "ko" ? "계정 보안을 강화합니다." : "Enhance your account security."}</p>
                      </div>
                      <button className="px-4 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                        {language === "ko" ? "활성화" : "Enable"}
                      </button>
                    </div>
                    <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">{language === "ko" ? "로그인 기록" : "Login History"}</p>
                        <p className="text-sm text-slate-500">{language === "ko" ? "최근 로그인 활동을 확인합니다." : "View recent login activity."}</p>
                      </div>
                      <button className="px-4 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
                        {language === "ko" ? "보기" : "View"}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Save Button */}
                <div className="flex justify-end gap-3">
                  <button className="px-6 py-2 border border-slate-200 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-700">
                    {language === "ko" ? "취소" : "Cancel"}
                  </button>
                  <button className="px-6 py-2 bg-primary text-white rounded-lg text-sm font-medium hover:bg-blue-700">
                    {language === "ko" ? "변경사항 저장" : "Save Changes"}
                  </button>
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

      {/* Job Preview Modal - design.html style */}
      {showPreviewModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-[#f6f7f8] dark:bg-[#121920] rounded-xl max-w-[960px] w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header with Breadcrumb */}
            <div className="p-6 bg-white dark:bg-[#1a222c] border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
              <div className="flex justify-between items-start mb-4">
                {/* Breadcrumbs */}
                <div className="flex flex-wrap gap-2 items-center text-sm">
                  <span className="text-slate-500">{language === "ko" ? "홈" : "Home"}</span>
                  <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
                  <span className="text-slate-500">{language === "ko" ? "채용 공고 관리" : "Job Management"}</span>
                  <span className="material-symbols-outlined text-slate-400 text-sm">chevron_right</span>
                  <span className="text-primary font-bold">{language === "ko" ? "공고 미리보기" : "Preview"}</span>
                </div>
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white mb-1">
                {language === "ko" ? "공고 미리보기" : "Job Posting Preview"}
              </h1>
              <p className="text-slate-500 text-sm">
                {language === "ko"
                  ? "게시 전 공고 내용을 마지막으로 확인해주세요. 실제 구직자에게 보여지는 화면입니다."
                  : "Please review the posting before publishing. This is how job seekers will see it."}
              </p>
            </div>

            {/* Preview Card */}
            <div className="p-6">
              <div className="bg-white dark:bg-[#1a222c] rounded-xl shadow-md border border-slate-200 dark:border-slate-700 overflow-hidden">
                {/* Card Header / Title Section */}
                <div className="p-8 sm:p-10 border-b border-slate-100 dark:border-slate-700">
                  {/* Tags */}
                  <div className="flex flex-wrap gap-3 mb-4">
                    {jobForm.deadline && (
                      <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-xs font-bold">
                        D-{Math.max(0, Math.ceil((new Date(jobForm.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))}
                      </span>
                    )}
                    {jobForm.job_type && (
                      <span className="bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-3 py-1 rounded-full text-xs font-bold">
                        {JOB_TYPES[jobForm.job_type]?.[language as "ko" | "en"] || jobForm.job_type}
                      </span>
                    )}
                    <span className="bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold">
                      {EMPLOYMENT_TYPES[jobForm.employment_type]?.[language as "ko" | "en"] || jobForm.employment_type}
                    </span>
                  </div>
                  {/* Title */}
                  <h2 className="text-slate-900 dark:text-white text-2xl sm:text-[32px] font-bold leading-tight mb-3">
                    {jobForm.position || (language === "ko" ? "(제목 없음)" : "(No title)")}
                  </h2>
                  {/* Company */}
                  <div className="flex items-center gap-2 text-slate-500">
                    <span className="material-symbols-outlined text-xl">apartment</span>
                    <span className="text-lg font-medium">
                      {jobForm.company_name || (language === "ko" ? "(회사명 없음)" : "(No company)")}
                    </span>
                  </div>
                </div>

                {/* Key Information Grid */}
                <div className="p-8 sm:p-10 bg-white dark:bg-[#1a222c]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-8 gap-x-12 mb-8">
                    {/* Salary */}
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 text-primary">
                        <span className="material-symbols-outlined">payments</span>
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">{language === "ko" ? "급여" : "Salary"}</p>
                        <p className="text-slate-900 dark:text-white text-lg font-bold">
                          {jobForm.salary_range || (language === "ko" ? "협의 후 결정" : "Negotiable")}
                        </p>
                      </div>
                    </div>
                    {/* Location */}
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 text-primary">
                        <span className="material-symbols-outlined">location_on</span>
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">{language === "ko" ? "근무지" : "Location"}</p>
                        <p className="text-slate-900 dark:text-white text-lg font-bold">
                          {jobForm.location || (language === "ko" ? "(위치 미정)" : "(TBD)")}
                        </p>
                      </div>
                    </div>
                    {/* Employment Type */}
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 text-primary">
                        <span className="material-symbols-outlined">badge</span>
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">{language === "ko" ? "고용형태" : "Employment Type"}</p>
                        <p className="text-slate-900 dark:text-white text-lg font-bold">
                          {EMPLOYMENT_TYPES[jobForm.employment_type]?.[language as "ko" | "en"] || jobForm.employment_type}
                        </p>
                      </div>
                    </div>
                    {/* Qualifications */}
                    <div className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center shrink-0 text-primary">
                        <span className="material-symbols-outlined">school</span>
                      </div>
                      <div>
                        <p className="text-slate-500 text-sm font-medium mb-1">{language === "ko" ? "지원자격" : "Qualifications"}</p>
                        <p className="text-slate-900 dark:text-white text-lg font-bold">
                          {jobForm.requirements || (language === "ko" ? "자격 요건 없음" : "No requirements")}
                        </p>
                      </div>
                    </div>
                  </div>

                  <hr className="border-slate-100 dark:border-slate-700 my-8" />

                  {/* Detailed Description */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2">
                      {language === "ko" ? "상세 업무 내용" : "Job Description"}
                    </h3>
                    <div className="text-slate-600 dark:text-slate-300 text-base leading-relaxed whitespace-pre-wrap">
                      {jobForm.description || (language === "ko" ? "(상세 내용 없음)" : "(No description)")}
                    </div>
                  </div>

                  {/* Benefits */}
                  {jobForm.benefits && (
                    <>
                      <hr className="border-slate-100 dark:border-slate-700 my-8" />
                      <div className="flex flex-col gap-4">
                        <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2 flex items-center gap-2">
                          <span className="material-symbols-outlined text-green-500">redeem</span>
                          {language === "ko" ? "복리후생" : "Benefits"}
                        </h3>
                        <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                          <p className="text-green-700 dark:text-green-300 whitespace-pre-wrap">
                            {jobForm.benefits}
                          </p>
                        </div>
                      </div>
                    </>
                  )}

                  <hr className="border-slate-100 dark:border-slate-700 my-8" />

                  {/* Location Map Placeholder */}
                  <div className="flex flex-col gap-4">
                    <h3 className="text-slate-900 dark:text-white text-xl font-bold mb-2">
                      {language === "ko" ? "근무지 위치" : "Work Location"}
                    </h3>
                    <div className="relative w-full h-48 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-white dark:bg-slate-700 px-4 py-2 rounded-lg shadow-lg flex items-center gap-2">
                          <span className="material-symbols-outlined text-red-500">location_on</span>
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {jobForm.location || (language === "ko" ? "위치 미정" : "Location TBD")}
                          </span>
                        </div>
                      </div>
                      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/50 to-slate-200/50 dark:from-slate-700/50 dark:to-slate-800/50"></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Notice */}
              <div className="mt-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg flex items-start gap-3">
                <span className="material-symbols-outlined text-blue-500">info</span>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  {language === "ko"
                    ? "위 내용으로 공고가 등록됩니다. 등록 후에도 수정이 가능합니다."
                    : "This is how your job posting will appear. You can edit it after publishing."}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row justify-end items-center gap-4 mt-8">
                <button
                  onClick={() => setShowPreviewModal(false)}
                  className="w-full sm:w-auto px-8 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white text-base font-bold hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-sm">edit</span>
                  {language === "ko" ? "수정하기" : "Edit"}
                </button>
                <button
                  onClick={(e) => {
                    setShowPreviewModal(false);
                    if (editingJob) {
                      handleUpdateJob(e as unknown as React.FormEvent);
                    } else {
                      handleCreateJob(e as unknown as React.FormEvent);
                    }
                  }}
                  disabled={isSubmitting}
                  className="w-full sm:w-auto px-10 py-3 rounded-lg bg-primary text-white text-base font-bold shadow-md hover:bg-[#16457b] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="material-symbols-outlined animate-spin">progress_activity</span>
                  ) : (
                    <span className="material-symbols-outlined text-sm">publish</span>
                  )}
                  {editingJob
                    ? (language === "ko" ? "수정 완료" : "Update")
                    : (language === "ko" ? "공고 발행" : "Publish")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Job Published Success Modal - design.html style */}
      {showSuccessModal && publishedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="w-full max-w-[600px] bg-white dark:bg-[#1a222c] rounded-2xl shadow-lg overflow-hidden border border-slate-100 dark:border-slate-700">
            {/* Decorative Top Gradient Line */}
            <div className="h-2 w-full bg-gradient-to-r from-primary to-blue-400"></div>

            <div className="p-8 sm:p-12 flex flex-col items-center text-center">
              {/* Success Icon */}
              <div className="mb-6 rounded-full bg-green-50 dark:bg-green-900/20 p-4 ring-8 ring-green-50/50 dark:ring-green-900/10">
                <span className="material-symbols-outlined text-6xl text-green-500 dark:text-green-400">check_circle</span>
              </div>

              {/* Headline */}
              <h1 className="text-slate-900 dark:text-white tracking-tight text-3xl font-bold leading-tight mb-3">
                {language === "ko" ? "공고 발행 완료" : "Job Posted Successfully"}
              </h1>

              {/* Body Text */}
              <p className="text-slate-500 dark:text-slate-400 text-base font-normal leading-relaxed max-w-sm mx-auto mb-10">
                {language === "ko"
                  ? "선생님이 작성하신 일자리 공고가 플랫폼에 성공적으로 등록되었습니다. 지원자 현황은 대시보드에서 확인하실 수 있습니다."
                  : "Your job posting has been successfully published. You can track applicants from the dashboard."}
              </p>

              {/* Job Summary Card */}
              <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-6 mb-8 border border-slate-100 dark:border-slate-700">
                <div className="flex flex-col gap-4">
                  {/* Job Title */}
                  <div className="flex justify-between items-start gap-x-6 pb-4 border-b border-slate-200 dark:border-slate-700 border-dashed">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined text-lg">work</span>
                      <p className="text-sm font-medium">{language === "ko" ? "공고 제목" : "Job Title"}</p>
                    </div>
                    <p className="text-slate-900 dark:text-white text-sm font-bold leading-normal text-right flex-1 break-keep">
                      {publishedJob.position}
                    </p>
                  </div>
                  {/* Registration Time */}
                  <div className="flex justify-between items-center gap-x-6">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined text-lg">schedule</span>
                      <p className="text-sm font-medium">{language === "ko" ? "등록 일시" : "Posted At"}</p>
                    </div>
                    <p className="text-slate-900 dark:text-white text-sm font-medium leading-normal text-right">
                      {new Date(publishedJob.createdAt).toLocaleString(language === "ko" ? "ko-KR" : "en-US", {
                        year: "numeric",
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  </div>
                  {/* Job ID */}
                  <div className="flex justify-between items-center gap-x-6">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span className="material-symbols-outlined text-lg">fingerprint</span>
                      <p className="text-sm font-medium">{language === "ko" ? "공고 ID" : "Job ID"}</p>
                    </div>
                    <p className="text-slate-900 dark:text-white text-sm font-medium leading-normal text-right font-mono">
                      #{publishedJob.id}
                    </p>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row w-full gap-3">
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setPublishedJob(null);
                  }}
                  className="flex-1 bg-primary hover:bg-[#164275] text-white h-12 px-6 rounded-lg font-bold text-base transition-colors flex items-center justify-center gap-2 shadow-sm hover:shadow-md"
                >
                  <span className="material-symbols-outlined text-xl">list_alt</span>
                  {language === "ko" ? "전체 공고 목록" : "View All Jobs"}
                </button>
                <button
                  onClick={() => {
                    setShowSuccessModal(false);
                    setPublishedJob(null);
                    setShowJobForm(true);
                  }}
                  className="flex-1 bg-white dark:bg-transparent border border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 text-slate-900 dark:text-white h-12 px-6 rounded-lg font-bold text-base transition-colors flex items-center justify-center gap-2"
                >
                  <span className="material-symbols-outlined text-xl">add</span>
                  {language === "ko" ? "새 공고 등록" : "Create New Job"}
                </button>
              </div>

              {/* Dashboard Link */}
              <button
                onClick={() => {
                  setShowSuccessModal(false);
                  setPublishedJob(null);
                  setActiveMenu("dashboard");
                }}
                className="mt-6 text-sm text-slate-400 hover:text-primary flex items-center gap-1 transition-colors"
              >
                <span>{language === "ko" ? "대시보드로 돌아가기" : "Back to Dashboard"}</span>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Applicant Detail Modal - Full Screen with 2-Column Layout */}
      {showApplicantModal && selectedApplicant && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-50 dark:bg-background-dark rounded-xl max-w-7xl w-full max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="bg-white dark:bg-[#201a2d] px-6 py-4 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-10">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-slate-900 dark:text-white tracking-tight">
                    {language === "ko" ? "지원자 상세 조회" : "Applicant Details"}
                  </h3>
                  <p className="text-slate-500 text-sm">
                    {language === "ko" ? "지원자 ID" : "Applicant ID"}: #{selectedApplicant.id.slice(0, 8)} | {language === "ko" ? "신청일" : "Applied"}: {formatDate(selectedApplicant.applied_at)}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowApplicantModal(false);
                    setSelectedApplicant(null);
                  }}
                  className="flex items-center justify-center gap-2 h-10 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 rounded-lg text-sm font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors shadow-sm w-fit"
                >
                  <span className="material-symbols-outlined text-[18px]">arrow_back</span>
                  {language === "ko" ? "목록으로 돌아가기" : "Back to List"}
                </button>
              </div>
            </div>

            {/* Content - 2 Column Layout */}
            <div className="p-4 md:p-6">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Sidebar - Profile & Basic Info */}
                <div className="lg:col-span-4 flex flex-col gap-6">
                  {/* Profile Card */}
                  <div className="bg-white dark:bg-[#201a2d] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="h-24 bg-gradient-to-r from-primary/10 to-primary/30 relative"></div>
                    <div className="px-6 pb-6 relative">
                      <div className="flex justify-between items-end -mt-10 mb-4">
                        <div className="w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center text-primary text-3xl font-bold border-4 border-white dark:border-[#201a2d] shadow-md">
                          {selectedApplicant.first_name.charAt(0)}
                        </div>
                        <span className={`px-3 py-1 text-xs font-bold rounded-full border uppercase tracking-wide ${getStatusBadgeStyle(selectedApplicant.status)}`}>
                          {getStatusLabel(selectedApplicant.status)}
                        </span>
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">
                        {selectedApplicant.last_name} {selectedApplicant.first_name}
                      </h3>
                      <div className="flex items-center gap-2 text-slate-500 text-sm mb-4">
                        <span className="material-symbols-outlined text-[18px]">public</span>
                        <span>{selectedApplicant.nationality}</span>
                        <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                        <span>{selectedApplicant.visa_type}</span>
                      </div>
                      {/* Action Buttons */}
                      {selectedApplicant.status === "pending" && (
                        <div className="grid grid-cols-2 gap-2 mt-4">
                          <button
                            onClick={() => handleApplicantAction(selectedApplicant.id, "hired")}
                            disabled={isUpdatingApplicant}
                            className="flex flex-1 items-center justify-center gap-2 h-10 bg-primary hover:bg-primary/90 text-white rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdatingApplicant ? (
                              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                            ) : (
                              <span className="material-symbols-outlined text-[18px]">check</span>
                            )}
                            {language === "ko" ? "채용" : "Hire"}
                          </button>
                          <button
                            onClick={() => handleApplicantAction(selectedApplicant.id, "rejected")}
                            disabled={isUpdatingApplicant}
                            className="flex flex-1 items-center justify-center gap-2 h-10 bg-white dark:bg-transparent border border-red-200 text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-sm font-bold transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isUpdatingApplicant ? (
                              <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
                            ) : (
                              <span className="material-symbols-outlined text-[18px]">close</span>
                            )}
                            {language === "ko" ? "거절" : "Reject"}
                          </button>
                          <button className="col-span-2 flex items-center justify-center gap-2 h-10 bg-white dark:bg-transparent border border-slate-200 dark:border-slate-600 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg text-sm font-bold transition-colors shadow-sm">
                            <span className="material-symbols-outlined text-[18px]">mail</span>
                            {language === "ko" ? "메시지 발송" : "Send Message"}
                          </button>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Basic Info Card */}
                  <div className="bg-white dark:bg-[#201a2d] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">person</span>
                      {language === "ko" ? "지원자 기본 정보" : "Basic Information"}
                    </h4>
                    <div className="space-y-4">
                      <div className="flex flex-col border-b border-slate-100 dark:border-slate-700 pb-3">
                        <span className="text-xs text-slate-500 font-medium mb-1">{language === "ko" ? "이메일" : "Email"}</span>
                        <span className="text-sm text-slate-900 dark:text-white font-medium">{selectedApplicant.email}</span>
                      </div>
                      <div className="flex flex-col border-b border-slate-100 dark:border-slate-700 pb-3">
                        <span className="text-xs text-slate-500 font-medium mb-1">{language === "ko" ? "연락처" : "Phone"}</span>
                        <span className="text-sm text-slate-900 dark:text-white font-medium">{selectedApplicant.phone || "010-****-****"}</span>
                      </div>
                      <div className="flex flex-col border-b border-slate-100 dark:border-slate-700 pb-3">
                        <span className="text-xs text-slate-500 font-medium mb-1">{language === "ko" ? "비자 종류" : "Visa Type"}</span>
                        <span className="text-sm text-slate-900 dark:text-white font-medium">{selectedApplicant.visa_type}</span>
                      </div>
                      <div className="flex flex-col border-b border-slate-100 dark:border-slate-700 pb-3">
                        <span className="text-xs text-slate-500 font-medium mb-1">{language === "ko" ? "국적" : "Nationality"}</span>
                        <span className="text-sm text-slate-900 dark:text-white font-medium">{selectedApplicant.nationality}</span>
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs text-slate-500 font-medium mb-1">{language === "ko" ? "한국어 능력" : "Korean Level"}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-slate-900 dark:text-white font-medium">TOPIK {selectedApplicant.topik_level || 4}{language === "ko" ? "급" : ""}</span>
                          <span className="material-symbols-outlined text-green-500 text-[16px]" title="인증됨">verified</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Applied Job Card */}
                  <div className="bg-white dark:bg-[#201a2d] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h4 className="text-base font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
                      <span className="material-symbols-outlined text-primary">work</span>
                      {language === "ko" ? "지원한 공고 정보" : "Applied Job Info"}
                    </h4>
                    <div className="flex flex-col gap-3">
                      <div className="p-3 bg-slate-50 dark:bg-slate-800 rounded-lg border border-slate-100 dark:border-slate-700">
                        <p className="text-xs text-slate-500 mb-1">{language === "ko" ? "공고명" : "Job Title"}</p>
                        <p className="text-sm font-bold text-slate-900 dark:text-white mb-2 leading-snug">
                          {selectedApplicant.job_title || (language === "ko" ? "외국인 주민 지원 센터 행정 보조" : "Administrative Assistant")}
                        </p>
                        <div className="flex items-center gap-2">
                          <div className="bg-white dark:bg-slate-700 p-1 rounded border border-slate-200 dark:border-slate-600">
                            <span className="material-symbols-outlined text-slate-400 text-[16px]">domain</span>
                          </div>
                          <div>
                            <p className="text-xs font-medium text-slate-900 dark:text-white">
                              {selectedApplicant.company_name || (language === "ko" ? "회사명" : "Company Name")}
                            </p>
                          </div>
                        </div>
                      </div>
                      <button className="text-primary text-xs font-bold hover:underline flex items-center justify-end gap-1">
                        {language === "ko" ? "공고 원문 보기" : "View Original Posting"}
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* Right Content - Documents */}
                <div className="lg:col-span-8 flex flex-col gap-6">
                  {/* Resume Section */}
                  <div className="bg-white dark:bg-[#201a2d] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex flex-wrap justify-between items-center gap-4">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">description</span>
                        {language === "ko" ? "이력서 (Resume)" : "Resume"}
                      </h4>
                      <div className="flex gap-2">
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-500 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-lg border border-slate-200 dark:border-slate-600 transition-colors">
                          <span className="material-symbols-outlined text-[18px]">visibility</span>
                          {language === "ko" ? "미리보기" : "Preview"}
                        </button>
                        <button className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-primary bg-primary/10 hover:bg-primary/20 rounded-lg border border-transparent transition-colors">
                          <span className="material-symbols-outlined text-[18px]">download</span>
                          {language === "ko" ? "다운로드" : "Download"}
                        </button>
                      </div>
                    </div>
                    <div className="p-6 bg-slate-50/50 dark:bg-slate-900/50">
                      {/* Resume Layout Simulation */}
                      <div className="max-w-3xl mx-auto bg-white dark:bg-[#201a2d] shadow-sm border border-slate-200 dark:border-slate-700 p-8 min-h-[400px] rounded">
                        <div className="flex justify-between border-b border-slate-100 dark:border-slate-700 pb-6 mb-6">
                          <div>
                            <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-1">
                              {selectedApplicant.last_name} {selectedApplicant.first_name}
                            </h2>
                            <p className="text-slate-500 text-sm">{selectedApplicant.nationality} | {selectedApplicant.visa_type}</p>
                          </div>
                          <div className="text-right text-sm text-slate-500">
                            <p>{selectedApplicant.phone || "010-****-****"}</p>
                            <p>{selectedApplicant.email}</p>
                          </div>
                        </div>
                        <div className="mb-6">
                          <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-3 border-b border-slate-100 dark:border-slate-700 pb-1">Education</h3>
                          <div className="mb-3">
                            <div className="flex justify-between mb-1">
                              <p className="font-bold text-sm text-slate-900 dark:text-white">{language === "ko" ? "서울대학교" : "Seoul National University"}</p>
                              <p className="text-xs text-slate-500">2015.03 - 2019.02</p>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400">{language === "ko" ? "경영학 학사" : "Bachelor of Business Administration"}</p>
                          </div>
                        </div>
                        <div className="mb-6">
                          <h3 className="text-primary font-bold text-sm uppercase tracking-wider mb-3 border-b border-slate-100 dark:border-slate-700 pb-1">Experience</h3>
                          <div className="mb-4">
                            <div className="flex justify-between mb-1">
                              <p className="font-bold text-sm text-slate-900 dark:text-white">ABC Global Trading</p>
                              <p className="text-xs text-slate-500">2019.05 - 2022.08</p>
                            </div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{language === "ko" ? "해외 영업 매니저" : "Overseas Sales Manager"}</p>
                            <ul className="list-disc list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1 ml-1">
                              <li>{language === "ko" ? "베트남 및 동남아 시장 신규 바이어 발굴" : "Developed new buyers in Vietnam and Southeast Asia markets"}</li>
                              <li>{language === "ko" ? "연간 매출 목표 120% 달성" : "Achieved 120% of annual sales target"}</li>
                            </ul>
                          </div>
                        </div>
                        <div className="flex justify-center mt-8">
                          <span className="text-xs text-slate-400 bg-slate-50 dark:bg-slate-800 px-3 py-1 rounded">{language === "ko" ? "2페이지 중 1페이지" : "Page 1 of 2"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Cover Letter Section */}
                  <div className="bg-white dark:bg-[#201a2d] rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
                    <div className="p-6 border-b border-slate-100 dark:border-slate-700">
                      <h4 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
                        <span className="material-symbols-outlined text-primary">edit_note</span>
                        {language === "ko" ? "자기소개서 (Cover Letter)" : "Cover Letter"}
                      </h4>
                    </div>
                    <div className="p-6 md:p-8">
                      <div className="prose prose-sm max-w-none">
                        <h5 className="font-bold text-base mb-2 text-slate-900 dark:text-white">{language === "ko" ? "지원 동기" : "Motivation"}</h5>
                        <p className="leading-relaxed mb-6 text-slate-600 dark:text-slate-400">
                          {language === "ko"
                            ? `안녕하세요. 저는 한국에서 거주하며 한국 사회의 일원으로 살아가고 있는 ${selectedApplicant.last_name}${selectedApplicant.first_name}입니다.
                               이번 직무에 지원하게 된 것은 제가 한국에 정착하면서 겪었던 다양한 경험들을 바탕으로
                               실질적인 도움을 주고 싶기 때문입니다. 특히 초기 정착 과정에서 겪는 언어 장벽과
                               행정 절차의 어려움을 누구보다 잘 이해하고 있습니다.`
                            : `Hello. I am ${selectedApplicant.first_name} ${selectedApplicant.last_name}, currently residing in Korea as an active member of the community.
                               I am applying for this position because I want to provide practical help based on various experiences
                               I have had while settling in Korea. I understand the language barriers and administrative difficulties
                               that come with the initial settlement process better than anyone.`
                          }
                        </p>
                        <h5 className="font-bold text-base mb-2 text-slate-900 dark:text-white">{language === "ko" ? "직무 수행 계획" : "Work Plan"}</h5>
                        <p className="leading-relaxed text-slate-600 dark:text-slate-400">
                          {language === "ko"
                            ? `저의 모국어와 유창한 한국어, 그리고 비즈니스 영어 능력을 활용하여
                               정확하고 친절한 서비스를 제공하겠습니다. 또한 꼼꼼한 성격과 문서 작성 능력을
                               바탕으로 업무를 효율적으로 처리하여 회사의 원활한 운영에 기여하겠습니다. 감사합니다.`
                            : `I will provide accurate and friendly service using my native language,
                               fluent Korean, and business English skills. Additionally, with my meticulous
                               personality and documentation skills, I will contribute to the smooth operation
                               of the company. Thank you.`
                          }
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
