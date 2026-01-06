"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Input, Button } from "@/components/ui";
import { useLanguage } from "@/contexts/LanguageContext";
import DesignHeader from "@/components/ui/DesignHeader";
import DesignFooter from "@/components/ui/DesignFooter";

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
    const token = localStorage.getItem('access_token');
    if (!token) {
      router.push('/login');
      return;
    }
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const token = localStorage.getItem('access_token');
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

    const token = localStorage.getItem('access_token');
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

      <main className="flex-1 flex flex-col items-center py-8 px-4 md:px-10">
        <div className="w-full max-w-[800px] flex flex-col gap-6">
          {/* Breadcrumbs */}
          <div className="flex flex-wrap gap-2 text-sm">
            <Link href="/" className="text-text-sub dark:text-gray-400 font-medium hover:text-primary">
              {language === 'ko' ? '홈' : 'Home'}
            </Link>
            <span className="text-text-sub dark:text-gray-500">/</span>
            <span className="text-text-main dark:text-gray-200 font-bold">
              {language === 'ko' ? '마이페이지' : 'My Page'}
            </span>
          </div>

          {/* Page Heading */}
          <div className="flex flex-col gap-2">
            <h1 className="text-text-main dark:text-white text-3xl md:text-4xl font-extrabold tracking-tight">
              {t('profile.title')}
            </h1>
            <p className="text-text-sub dark:text-gray-400 text-base">
              {language === 'ko' ? '개인 정보를 확인하고 수정할 수 있습니다.' : 'View and edit your personal information.'}
            </p>
          </div>

          {/* Quick Links */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Link
              href="/consultations/my"
              className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition-all"
            >
              <span className="material-symbols-outlined text-primary text-2xl">gavel</span>
              <span className="text-sm font-medium text-text-main dark:text-white">
                {language === 'ko' ? '상담 내역' : 'Consultations'}
              </span>
            </Link>
            <Link
              href="/applications"
              className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition-all"
            >
              <span className="material-symbols-outlined text-primary text-2xl">work</span>
              <span className="text-sm font-medium text-text-main dark:text-white">
                {language === 'ko' ? '지원 현황' : 'Applications'}
              </span>
            </Link>
            <Link
              href="/saved-jobs"
              className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition-all"
            >
              <span className="material-symbols-outlined text-primary text-2xl">bookmark</span>
              <span className="text-sm font-medium text-text-main dark:text-white">
                {language === 'ko' ? '관심 공고' : 'Saved Jobs'}
              </span>
            </Link>
            <Link
              href="/supports"
              className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 hover:border-primary hover:shadow-md transition-all"
            >
              <span className="material-symbols-outlined text-primary text-2xl">volunteer_activism</span>
              <span className="text-sm font-medium text-text-main dark:text-white">
                {language === 'ko' ? '정부지원' : 'Support'}
              </span>
            </Link>
          </div>

          {/* Profile Card */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
            {/* Profile Header */}
            <div className="p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
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

          {/* Logout Button */}
          <div className="flex justify-center">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 px-6 py-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl font-medium transition-colors"
            >
              <span className="material-symbols-outlined text-[20px]">logout</span>
              {language === 'ko' ? '로그아웃' : 'Logout'}
            </button>
          </div>
        </div>
      </main>

      <DesignFooter />
    </div>
  );
}
