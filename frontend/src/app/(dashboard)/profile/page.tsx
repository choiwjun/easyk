"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Input, Button } from "@/components/ui";

export default function ProfilePage() {
  const router = useRouter();
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
      setErrors({ general: "프로필을 불러오는 데 실패했습니다" });
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
      setErrors({ general: "프로필 업데이트 중 오류가 발생했습니다" });
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

  if (!profile && !errors.general) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <p className="text-gray-600">프로필을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-lg p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            프로필 관리
          </h1>
          <p className="text-sm text-gray-500">
            개인 정보를 관리하고 업데이트하세요
          </p>
        </div>

        {/* General Error */}
        {errors.general && (
          <div className="p-4 bg-red-50 border border-red-200 rounded-lg mb-6">
            <p className="text-sm text-red-600" role="alert">{errors.general}</p>
          </div>
        )}

        {/* Profile Display */}
        <div className="space-y-6">
          {/* Email (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이메일
            </label>
            <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">
              {profile?.email}
            </p>
          </div>

          {/* Name (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              이름
            </label>
            <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">
              {profile?.first_name} {profile?.last_name}
            </p>
          </div>

          {/* Role (readonly) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              역할
            </label>
            <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">
              {profile?.role === "foreign" && "외국인 회원"}
              {profile?.role === "consultant" && "전문가"}
              {profile?.role === "admin" && "관리자"}
            </p>
          </div>

          {/* Editable Fields */}
          {isEditing ? (
            <div className="space-y-6 pt-6 border-t">
              {/* Nationality */}
              <Input
                type="text"
                label="국적"
                placeholder="국적을 입력하세요"
                value={nationality}
                onChange={(e) => setNationality(e.target.value)}
                error={errors.nationality}
              />

              {/* Visa Type */}
              <Input
                type="text"
                label="비자 종류"
                placeholder="예: E-1, D-2, F-2"
                value={visaType}
                onChange={(e) => setVisaType(e.target.value)}
                error={errors.visa_type}
              />

              {/* Preferred Language */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  선호 언어
                </label>
                <select
                  value={preferredLanguage}
                  onChange={(e) => setPreferredLanguage(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="ko">한국어</option>
                  <option value="en">English</option>
                  <option value="zh">中文</option>
                  <option value="ja">日本語</option>
                  <option value="vi">Tiếng Việt</option>
                </select>
              </div>

              {/* Residential Area */}
              <Input
                type="text"
                label="거주 지역"
                placeholder="예: 고양시 덕양구"
                value={residentialArea}
                onChange={(e) => setResidentialArea(e.target.value)}
                error={errors.residential_area}
              />

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  onClick={handleCancel}
                  variant="secondary"
                  size="lg"
                  fullWidth
                >
                  취소
                </Button>
                <Button
                  type="button"
                  onClick={handleSave}
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  disabled={loading}
                >
                  저장
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4 pt-6 border-t">
              {/* Display Mode */}
              {nationality && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    국적
                  </label>
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">
                    {nationality}
                  </p>
                </div>
              )}

              {visaType && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    비자 종류
                  </label>
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">
                    {visaType}
                  </p>
                </div>
              )}

              {preferredLanguage && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    선호 언어
                  </label>
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">
                    {preferredLanguage === "ko" && "한국어"}
                    {preferredLanguage === "en" && "English"}
                    {preferredLanguage === "zh" && "中文"}
                    {preferredLanguage === "ja" && "日本語"}
                    {preferredLanguage === "vi" && "Tiếng Việt"}
                  </p>
                </div>
              )}

              {residentialArea && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    거주 지역
                  </label>
                  <p className="text-gray-900 px-4 py-3 bg-gray-50 rounded-lg">
                    {residentialArea}
                  </p>
                </div>
              )}

              {/* Edit Button */}
              <div className="pt-4">
                <Button
                  type="button"
                  onClick={() => setIsEditing(true)}
                  variant="primary"
                  size="lg"
                  fullWidth
                >
                  수정
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">© 2024 easyK. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}

