"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input, Button } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import DesignHeader from "@/components/ui/DesignHeader";
import DesignFooter from "@/components/ui/DesignFooter";
import authStorage from "@/utils/authStorage";

export default function ProfilePage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<any>(null);
  const [errors, setErrors] = useState<{
    nationality?: string;
    visa_type?: string;
    preferred_language?: string;
    residential_area?: string;
    general?: string;
  }>({});

  // Form state
  const [nationality, setNationality] = useState("");
  const [visaType, setVisaType] = useState("");
  const [preferredLanguage, setPreferredLanguage] = useState("");
  const [residentialArea, setResidentialArea] = useState("");

  // Check authentication
  useEffect(() => {
    const token = authStorage.getToken();
    if (!token) {
      router.push('/login');
      return;
    }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const token = authStorage.getToken();
    setLoading(true);
    try {
      const response = await fetch("/api/users/me", {
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to load profile");
      }

      const data = await response.json();
      setProfile(data);
      setNationality(data.nationality || "");
      setVisaType(data.visa_type || "");
      setPreferredLanguage(data.preferred_language || "ko");
      setResidentialArea(data.residential_area || "");
      setErrors({});
    } catch (error) {
      setErrors({ general: t('errors.networkError') });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setErrors({});
    setLoading(true);

    const token = authStorage.getToken();
    try {
      const response = await fetch("/api/users/me", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          nationality,
          visa_type: visaType,
          preferred_language: preferredLanguage,
          residential_area: residentialArea,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      setProfile(data);
      setIsEditing(false);
    } catch (error) {
      setErrors({ general: t('profile.updateFailed') });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (profile) {
      setNationality(profile.nationality || "");
      setVisaType(profile.visa_type || "");
      setPreferredLanguage(profile.preferred_language || "ko");
      setResidentialArea(profile.residential_area || "");
    }
    setErrors({});
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user');
    router.push('/login');
  };

  // Get current date for welcome header
  const getCurrentDate = () => {
    const now = new Date();
    if (language === 'ko') {
      return now.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' });
    }
    return now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  if (!profile && !errors.general) {
    return (
      <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
        <DesignHeader />
        <div className="flex-1 flex items-center justify-center">
          <div className="flex items-center gap-3">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
            <span className="text-text-sub dark:text-gray-400">
              {language === 'ko' ? '로딩 중...' : 'Loading...'}
            </span>
          </div>
        </div>
        <DesignFooter />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-light dark:bg-background-dark flex flex-col">
      <DesignHeader />

      <main className="flex-1 w-full max-w-[1080px] mx-auto px-5 py-8 flex flex-col gap-8">
        {/* Welcome Header - design.html 기반 */}
        <section className="w-full">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-primary to-[#164a85] rounded-2xl p-6 md:p-8 text-white shadow-lg">
            <div className="flex flex-col gap-2">
              <p className="text-white/70 text-sm font-medium">{getCurrentDate()}</p>
              <h1 className="text-2xl md:text-3xl font-extrabold">
                {language === 'ko'
                  ? `${profile?.first_name || '회원'}님, 안녕하세요!`
                  : `Hello, ${profile?.first_name || 'User'}!`}
              </h1>
              <p className="text-white/80 text-base">
                {language === 'ko' ? '오늘도 좋은 하루 되세요.' : 'Have a great day today.'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <div className="size-16 md:size-20 rounded-full bg-white/20 flex items-center justify-center backdrop-blur-sm">
                <span className="material-symbols-outlined text-white text-4xl md:text-5xl">person</span>
              </div>
            </div>
          </div>
        </section>

        {/* Stats Overview - design.html 기반 */}
        <section className="w-full">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* 진행 중인 상담 */}
            <Link
              href="/consultations/my"
              className="group bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 hover:border-primary/30"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-primary text-xl">gavel</span>
                </div>
              </div>
              <p className="text-2xl font-extrabold text-text-main dark:text-white mb-1">2</p>
              <p className="text-sm text-text-sub dark:text-gray-400 font-medium">
                {language === 'ko' ? '진행 중인 상담' : 'Ongoing Consultations'}
              </p>
            </Link>

            {/* 지원한 일자리 */}
            <Link
              href="/applications"
              className="group bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 hover:border-primary/30"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-xl">work</span>
                </div>
              </div>
              <p className="text-2xl font-extrabold text-text-main dark:text-white mb-1">5</p>
              <p className="text-sm text-text-sub dark:text-gray-400 font-medium">
                {language === 'ko' ? '지원한 일자리' : 'Applied Jobs'}
              </p>
            </Link>

            {/* 확인 가능한 지원금 */}
            <Link
              href="/supports"
              className="group bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm hover:shadow-md transition-all border border-gray-100 dark:border-gray-700 hover:border-primary/30"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                  <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-xl">payments</span>
                </div>
              </div>
              <p className="text-2xl font-extrabold text-text-main dark:text-white mb-1">3</p>
              <p className="text-sm text-text-sub dark:text-gray-400 font-medium">
                {language === 'ko' ? '확인 가능한 지원금' : 'Available Supports'}
              </p>
            </Link>

            {/* 비자 만료일 */}
            <div className="group bg-white dark:bg-gray-800 p-5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-orange-50 dark:bg-orange-900/30 flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-600 dark:text-orange-400 text-xl">calendar_month</span>
                </div>
              </div>
              <p className="text-2xl font-extrabold text-text-main dark:text-white mb-1">D-89</p>
              <p className="text-sm text-text-sub dark:text-gray-400 font-medium">
                {language === 'ko' ? '비자 만료일' : 'Visa Expiry'}
              </p>
            </div>
          </div>
        </section>

        {/* Main Services - design.html 기반 */}
        <section className="w-full">
          <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">
            {language === 'ko' ? '빠른 서비스' : 'Quick Services'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 법률 상담 */}
            <Link
              href="/consultations"
              className="group flex items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 hover:border-primary/30 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-primary text-3xl">balance</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-text-main dark:text-white mb-1">
                  {language === 'ko' ? '법률 상담' : 'Legal Consultation'}
                </h3>
                <p className="text-sm text-text-sub dark:text-gray-400">
                  {language === 'ko' ? '전문 변호사 매칭' : 'Expert lawyer matching'}
                </p>
              </div>
              <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors">
                chevron_right
              </span>
            </Link>

            {/* 일자리 찾기 */}
            <Link
              href="/jobs"
              className="group flex items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 hover:border-primary/30 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-3xl">work_outline</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-text-main dark:text-white mb-1">
                  {language === 'ko' ? '일자리 찾기' : 'Find Jobs'}
                </h3>
                <p className="text-sm text-text-sub dark:text-gray-400">
                  {language === 'ko' ? '지자체 채용 공고' : 'Local government jobs'}
                </p>
              </div>
              <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors">
                chevron_right
              </span>
            </Link>

            {/* 정부 지원 */}
            <Link
              href="/supports"
              className="group flex items-center gap-4 p-5 bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md border border-gray-100 dark:border-gray-700 hover:border-primary/30 transition-all"
            >
              <div className="w-14 h-14 rounded-2xl bg-green-50 dark:bg-green-900/30 flex items-center justify-center group-hover:scale-110 transition-transform">
                <span className="material-symbols-outlined text-green-600 dark:text-green-400 text-3xl">assured_workload</span>
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-text-main dark:text-white mb-1">
                  {language === 'ko' ? '정부 지원' : 'Government Support'}
                </h3>
                <p className="text-sm text-text-sub dark:text-gray-400">
                  {language === 'ko' ? '장려금, 교육, 훈련' : 'Subsidies, education, training'}
                </p>
              </div>
              <span className="material-symbols-outlined text-gray-300 dark:text-gray-600 group-hover:text-primary transition-colors">
                chevron_right
              </span>
            </Link>
          </div>
        </section>

        {/* 나의 신청 현황 - design.html 기반 */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-text-main dark:text-white">
              {language === 'ko' ? '나의 신청 현황' : 'My Applications'}
            </h2>
            <Link href="/consultations/my" className="text-primary text-sm font-bold hover:underline flex items-center gap-1">
              {language === 'ko' ? '전체 보기' : 'View All'}
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </Link>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            {/* 신청 항목 1 */}
            <Link href="/consultations/my" className="flex items-center gap-4 p-5 border-b border-gray-100 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-primary text-2xl">gavel</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-text-main dark:text-white truncate">
                    {language === 'ko' ? '임금 체불 법률 상담' : 'Unpaid Wages Consultation'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 whitespace-nowrap">
                    {language === 'ko' ? '매칭 완료' : 'Matched'}
                  </span>
                </div>
                <p className="text-sm text-text-sub dark:text-gray-400">
                  {language === 'ko' ? '담당 변호사: ' : 'Lawyer: '}
                  <span className="text-primary font-medium">김철수</span>
                </p>
              </div>
              <span className="material-symbols-outlined text-gray-300 dark:text-gray-600">chevron_right</span>
            </Link>

            {/* 신청 항목 2 */}
            <Link href="/applications" className="flex items-center gap-4 p-5 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-900/30 flex items-center justify-center">
                <span className="material-symbols-outlined text-purple-600 dark:text-purple-400 text-2xl">work</span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="text-base font-bold text-text-main dark:text-white truncate">
                    {language === 'ko' ? '제조업 현장직 지원' : 'Manufacturing Position'}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 whitespace-nowrap">
                    {language === 'ko' ? '검토 중' : 'Under Review'}
                  </span>
                </div>
                <p className="text-sm text-text-sub dark:text-gray-400">
                  {language === 'ko' ? '지원 기업: ' : 'Company: '}(주)대한정밀
                </p>
              </div>
              <span className="material-symbols-outlined text-gray-300 dark:text-gray-600">chevron_right</span>
            </Link>
          </div>
        </section>

        {/* 프로필 관리 섹션 */}
        <section className="w-full">
          <h2 className="text-xl font-bold text-text-main dark:text-white mb-4">
            {language === 'ko' ? '프로필 관리' : 'Profile Management'}
          </h2>

          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Profile Header */}
            <div className="p-6 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="size-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="material-symbols-outlined text-primary text-3xl">person</span>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-main dark:text-white">
                    {profile?.first_name} {profile?.last_name}
                  </h2>
                  <p className="text-sm text-text-sub dark:text-gray-400">{profile?.email}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-primary dark:text-blue-300">
                {profile?.role === "foreign" && (language === 'ko' ? "외국인 회원" : "Foreign Member")}
                {profile?.role === "consultant" && (language === 'ko' ? "전문가" : "Consultant")}
                {profile?.role === "admin" && (language === 'ko' ? "관리자" : "Admin")}
                {profile?.role === "agency" && (language === 'ko' ? "지자체" : "Agency")}
              </span>
            </div>

            {/* General Error */}
            {errors.general && (
              <div className="mx-6 mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {errors.general}
                </p>
              </div>
            )}

            {/* Profile Content */}
            <div className="p-6">
              {isEditing ? (
                <div className="space-y-6">
                  {/* Nationality */}
                  <div>
                    <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                      {t('profile.nationality')}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder={language === 'ko' ? '예: 베트남' : 'e.g., Vietnam'}
                      value={nationality}
                      onChange={(e) => setNationality(e.target.value)}
                    />
                  </div>

                  {/* Visa Type */}
                  <div>
                    <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                      {t('profile.visaType')}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder={language === 'ko' ? '예: E-9, H-2, F-4' : 'e.g., E-9, H-2, F-4'}
                      value={visaType}
                      onChange={(e) => setVisaType(e.target.value)}
                    />
                  </div>

                  {/* Preferred Language */}
                  <div>
                    <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                      {t('profile.language')}
                    </label>
                    <select
                      value={preferredLanguage}
                      onChange={(e) => setPreferredLanguage(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                    >
                      <option value="ko">한국어</option>
                      <option value="en">English</option>
                      <option value="zh">中文</option>
                      <option value="ja">日本語</option>
                      <option value="vi">Tiếng Việt</option>
                    </select>
                  </div>

                  {/* Residential Area */}
                  <div>
                    <label className="block text-sm font-bold text-text-main dark:text-white mb-2">
                      {t('profile.address')}
                    </label>
                    <input
                      type="text"
                      className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 rounded-xl bg-white dark:bg-gray-900 text-text-main dark:text-white focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all"
                      placeholder={language === 'ko' ? '예: 서울시 강남구' : 'e.g., Gangnam-gu, Seoul'}
                      value={residentialArea}
                      onChange={(e) => setResidentialArea(e.target.value)}
                    />
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={handleCancel}
                      className="flex-1 h-12 border border-gray-200 dark:border-gray-600 text-text-main dark:text-white font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                    >
                      {t('common.cancel')}
                    </button>
                    <button
                      type="button"
                      onClick={handleSave}
                      disabled={loading}
                      className="flex-1 h-12 bg-primary hover:bg-[#164a85] text-white font-bold rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {loading ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{language === 'ko' ? '저장 중...' : 'Saving...'}</span>
                        </>
                      ) : (
                        t('common.save')
                      )}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Display Mode */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <p className="text-xs font-medium text-text-sub dark:text-gray-400 mb-1">
                        {t('profile.nationality')}
                      </p>
                      <p className="text-sm font-bold text-text-main dark:text-white">
                        {nationality || (language === 'ko' ? '미입력' : 'Not set')}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <p className="text-xs font-medium text-text-sub dark:text-gray-400 mb-1">
                        {t('profile.visaType')}
                      </p>
                      <p className="text-sm font-bold text-text-main dark:text-white">
                        {visaType || (language === 'ko' ? '미입력' : 'Not set')}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <p className="text-xs font-medium text-text-sub dark:text-gray-400 mb-1">
                        {t('profile.language')}
                      </p>
                      <p className="text-sm font-bold text-text-main dark:text-white">
                        {preferredLanguage === "ko" && "한국어"}
                        {preferredLanguage === "en" && "English"}
                        {preferredLanguage === "zh" && "中文"}
                        {preferredLanguage === "ja" && "日本語"}
                        {preferredLanguage === "vi" && "Tiếng Việt"}
                        {!preferredLanguage && (language === 'ko' ? '미입력' : 'Not set')}
                      </p>
                    </div>
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-xl">
                      <p className="text-xs font-medium text-text-sub dark:text-gray-400 mb-1">
                        {t('profile.address')}
                      </p>
                      <p className="text-sm font-bold text-text-main dark:text-white">
                        {residentialArea || (language === 'ko' ? '미입력' : 'Not set')}
                      </p>
                    </div>
                  </div>

                  {/* Edit Button */}
                  <div className="pt-4">
                    <button
                      type="button"
                      onClick={() => setIsEditing(true)}
                      className="w-full h-12 bg-primary hover:bg-[#164a85] text-white font-bold rounded-xl transition-colors flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-[20px]">edit</span>
                      {t('common.edit')}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Logout Button */}
        <div className="flex justify-center pb-4">
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 px-6 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">logout</span>
            {language === 'ko' ? '로그아웃' : 'Logout'}
          </button>
        </div>
      </main>

      <DesignFooter />
    </div>
  );
}
