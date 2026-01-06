"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    if (!email) return false;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: typeof errors = {};

    if (!email) {
      newErrors.email = t('auth.required');
    } else if (!validateEmail(email)) {
      newErrors.email = t('auth.emailInvalid');
    }

    if (!password) {
      newErrors.password = t('auth.required');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // API call
    setLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || t('errors.networkError') });
        return;
      }

      // Store token and user info in localStorage
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Role-based redirect according to UserFlow
      const userRole = data.user?.role;
      let redirectUrl = "/";

      if (userRole === "consultant") {
        // 전문가(변호사) → 전문가 대시보드
        redirectUrl = "/consultant/dashboard";
      } else if (userRole === "agency") {
        // 기관 담당자 → 기관 대시보드
        redirectUrl = "/agency";
      } else if (userRole === "admin") {
        // 관리자 → 관리자 대시보드
        redirectUrl = "/admin/stats";
      }
      // foreign(외국인) → 메인 페이지 (기본값 "/")

      // Force a page reload to update auth state
      window.location.href = redirectUrl;
    } catch (error) {
      setErrors({ general: t('errors.networkError') });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background-light flex flex-col">
      {/* Design Header */}
      <header className="sticky top-0 z-50 w-full bg-white/80 dark:bg-background-dark/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-800">
        <div className="max-w-[1080px] mx-auto px-5 h-16 flex items-center justify-between">
          {/* 로고 */}
          <Link className="flex items-center gap-2 group" href="/">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-text-primary dark:text-white group-hover:text-primary transition-colors">
              easyK
            </span>
          </Link>

          {/* 우측 버튼 */}
          <div className="flex items-center gap-3">
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-5">
        <div className="w-full max-w-md">
          {/* Login Card */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-soft p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[36px] text-primary">login</span>
              </div>
              <h1 className="text-[28px] font-extrabold text-text-primary dark:text-white mb-2">
                {language === 'ko' ? '환영합니다!' : 'Welcome!'}
              </h1>
              <p className="text-[15px] text-text-muted dark:text-gray-400">
                {language === 'ko'
                  ? '계정에 로그인하여 서비스를 이용하세요.'
                  : 'Sign in to your account to access our services.'}
              </p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* General Error */}
              {errors.general && (
                <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
                  <p className="text-sm text-red-600 dark:text-red-400" role="alert">
                    <span className="material-symbols-outlined text-[18px] align-middle mr-1">error</span>
                    {errors.general}
                  </p>
                </div>
              )}

              {/* Email Input */}
              <div>
                <label className="block text-sm font-bold text-text-primary dark:text-white mb-2">
                  {t('auth.email')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-text-muted">
                    email
                  </span>
                  <input
                    type="email"
                    placeholder="example@email.com"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className={`w-full pl-11 pr-4 py-3 rounded-xl border ${
                      errors.email
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-primary focus:ring-primary'
                    } focus:ring-2 focus:outline-none transition-all text-[15px] dark:bg-background-dark dark:border-gray-700 dark:text-white`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
                )}
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-sm font-bold text-text-primary dark:text-white mb-2">
                  {t('auth.password')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-text-muted">
                    lock
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className={`w-full pl-11 pr-11 py-3 rounded-xl border ${
                      errors.password
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-primary focus:ring-primary'
                    } focus:ring-2 focus:outline-none transition-all text-[15px] dark:bg-background-dark dark:border-gray-700 dark:text-white`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-text-muted hover:text-primary transition-colors"
                  >
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </button>
                </div>
                {errors.password && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.password}</p>
                )}
              </div>

              {/* Forgot Password Link */}
              <div className="text-right">
                <a
                  href="#"
                  className="text-sm font-bold text-primary hover:text-primary-dark transition-colors"
                >
                  {language === 'ko' ? '비밀번호 찾기' : 'Forgot Password?'}
                </a>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                fullWidth
                loading={loading}
                disabled={loading}
                className="h-12 rounded-xl bg-primary hover:bg-primary-dark text-white font-bold text-[15px] shadow-lg shadow-primary/30 transition-all hover:-translate-y-0.5 active:scale-95"
              >
                {loading ? (
                  <span className="material-symbols-outlined text-[20px] animate-spin">refresh</span>
                ) : (
                  <>
                    {language === 'ko' ? '로그인' : 'Login'}
                    <span className="material-symbols-outlined text-[18px] ml-1">arrow_forward</span>
                  </>
                )}
              </Button>
            </form>

            {/* Signup Link */}
            <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-text-muted dark:text-gray-400">
                {language === 'ko' ? '아직 계정이 없으신가요?' : "Don't have an account?"}{" "}
                <Link
                  href="/signup"
                  className="text-primary font-bold hover:text-primary-dark transition-colors"
                >
                  {language === 'ko' ? '회원가입' : 'Sign Up'}
                </Link>
              </p>
            </div>
          </div>

          {/* Footer Links */}
          <div className="mt-6 text-center">
            <p className="text-xs text-text-muted dark:text-gray-500">
              {language === 'ko'
                ? '로그인하면 다음을 동의하는 것으로 간주합니다:'
                : 'By logging in, you agree to our:'}
            </p>
            <div className="flex justify-center gap-3 text-xs">
              <a href="#" className="text-text-muted hover:text-primary transition-colors">
                {language === 'ko' ? '이용약관' : 'Terms of Service'}
              </a>
              <span className="text-text-muted">•</span>
              <a href="#" className="text-text-muted hover:text-primary transition-colors">
                {language === 'ko' ? '개인정보처리방침' : 'Privacy Policy'}
              </a>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-6 text-center">
            <p className="text-xs text-text-muted dark:text-gray-500">
              {language === 'ko'
                ? '© 2024 easyK Inc. 모든 권리 보유.'
                : '© 2024 easyK Inc. All rights reserved.'}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
