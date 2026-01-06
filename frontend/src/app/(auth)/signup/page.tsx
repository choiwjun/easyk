"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LanguageSelector from "@/components/ui/LanguageSelector";
import { useLanguage } from "@/contexts/LanguageContext";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const { t, language } = useLanguage();
  const [userType, setUserType] = useState<"foreign" | "consultant" | "agency">("foreign");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [emailAvailable, setEmailAvailable] = useState<boolean | null>(null);
  const [emailChecking, setEmailChecking] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [errors, setErrors] = useState<{
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    terms?: string;
    general?: string;
  }>({});
  const [loading, setLoading] = useState(false);

  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validatePassword = (password: string): boolean => {
    return (
      password.length >= 8 &&
      /[a-zA-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  };

  useEffect(() => {
    const checkEmailAvailability = async () => {
      if (!validateEmail(email) || emailChecking) {
        setEmailAvailable(null);
        return;
      }

      setEmailChecking(true);
      try {
        const response = await fetch(`/api/auth/check-email?email=${encodeURIComponent(email)}`);

        if (response.ok) {
          const data = await response.json();
          setEmailAvailable(data.available);
        } else {
          setEmailAvailable(null);
        }
      } catch (error) {
        setEmailAvailable(null);
      } finally {
        setEmailChecking(false);
      }
    };

    const debounceTimer = setTimeout(checkEmailAvailability, 500);
    return () => clearTimeout(debounceTimer);
  }, [email]);

  const getEmailStatusMessage = () => {
    if (emailChecking) {
      return t('common.loading');
    }
    if (emailAvailable === false) {
      return language === 'ko' ? '이미 사용 중인 이메일입니다.' : 'Email already in use.';
    }
    if (emailAvailable === true) {
      return language === 'ko' ? '사용 가능한 이메일입니다.' : 'Email available.';
    }
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    const newErrors: typeof errors = {};

    if (!firstName.trim()) {
      newErrors.firstName = t('auth.required');
    }

    if (!lastName.trim()) {
      newErrors.lastName = t('auth.required');
    }

    if (!validateEmail(email)) {
      newErrors.email = t('auth.emailInvalid');
    } else if (emailAvailable === false) {
      newErrors.email = language === 'ko' ? '이미 사용 중인 이메일입니다.' : 'Email already in use.';
    }

    if (!validatePassword(password)) {
      newErrors.password = t('auth.passwordTooShort');
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = t('auth.passwordNotMatch');
    }

    if (!agreed) {
      newErrors.terms = t('auth.required');
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          password,
          first_name: firstName,
          last_name: lastName,
          role: userType,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || t('errors.networkError') });
        return;
      }

      router.push("/login");
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
          <Link className="flex items-center gap-2 group" href="/">
            <div className="w-8 h-8 rounded-lg bg-primary text-white flex items-center justify-center">
              <span className="material-symbols-outlined text-[20px]">flight_takeoff</span>
            </div>
            <span className="text-xl font-extrabold tracking-tight text-text-primary dark:text-white group-hover:text-primary transition-colors">
              easyK
            </span>
          </Link>

          <div className="flex items-center gap-3">
            <LanguageSelector />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-5">
        <div className="w-full max-w-lg">
          {/* Signup Card */}
          <div className="bg-surface-light dark:bg-surface-dark rounded-3xl shadow-soft p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <span className="material-symbols-outlined text-[36px] text-primary">person_add</span>
              </div>
              <h1 className="text-[28px] font-extrabold text-text-primary dark:text-white mb-2">
                {language === 'ko' ? '회원가입' : 'Sign Up'}
              </h1>
              <p className="text-[15px] text-text-muted dark:text-gray-400">
                {language === 'ko'
                  ? 'easyK 서비스를 이용하려면 계정을 생성하세요.'
                  : 'Create an account to start using easyK services.'}
              </p>
            </div>

            {/* User Type Selection */}
            <div className="mb-6">
              <label className="block text-sm font-bold text-text-primary dark:text-white mb-3">
                {language === 'ko' ? '회원 유형 선택' : 'Select User Type'}
              </label>
              <div className="grid grid-cols-1 gap-3">
                {/* 외국인 회원 */}
                <button
                  type="button"
                  onClick={() => setUserType("foreign")}
                  className={`
                    p-4 rounded-xl font-bold text-[14px] transition-all flex items-center gap-4 text-left
                    ${
                      userType === "foreign"
                        ? "bg-primary text-white shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-2"
                        : "bg-[#f2f4f6] dark:bg-gray-800 text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    userType === "foreign" ? "bg-white/20" : "bg-blue-100 dark:bg-blue-900/30"
                  }`}>
                    <span className={`material-symbols-outlined text-[28px] ${
                      userType === "foreign" ? "text-white" : "text-blue-600 dark:text-blue-400"
                    }`}>public</span>
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-[15px] mb-0.5 ${
                      userType === "foreign" ? "text-white" : "text-text-primary dark:text-white"
                    }`}>
                      {language === 'ko' ? '외국인 회원' : 'Foreign Member'}
                    </p>
                    <p className={`text-xs ${
                      userType === "foreign" ? "text-white/80" : "text-text-muted dark:text-gray-400"
                    }`}>
                      {language === 'ko' ? '법률 상담, 일자리 검색, 정부 지원 조회' : 'Legal consultation, job search, government support'}
                    </p>
                  </div>
                  {userType === "foreign" && (
                    <span className="material-symbols-outlined text-white text-[24px]">check_circle</span>
                  )}
                </button>

                {/* 변호사/전문가 */}
                <button
                  type="button"
                  onClick={() => setUserType("consultant")}
                  className={`
                    p-4 rounded-xl font-bold text-[14px] transition-all flex items-center gap-4 text-left
                    ${
                      userType === "consultant"
                        ? "bg-primary text-white shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-2"
                        : "bg-[#f2f4f6] dark:bg-gray-800 text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    userType === "consultant" ? "bg-white/20" : "bg-purple-100 dark:bg-purple-900/30"
                  }`}>
                    <span className={`material-symbols-outlined text-[28px] ${
                      userType === "consultant" ? "text-white" : "text-purple-600 dark:text-purple-400"
                    }`}>gavel</span>
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-[15px] mb-0.5 ${
                      userType === "consultant" ? "text-white" : "text-text-primary dark:text-white"
                    }`}>
                      {language === 'ko' ? '변호사/전문가' : 'Lawyer/Expert'}
                    </p>
                    <p className={`text-xs ${
                      userType === "consultant" ? "text-white/80" : "text-text-muted dark:text-gray-400"
                    }`}>
                      {language === 'ko' ? '법률 상담 제공, 상담 요청 수락/관리' : 'Provide legal consultation, manage requests'}
                    </p>
                  </div>
                  {userType === "consultant" && (
                    <span className="material-symbols-outlined text-white text-[24px]">check_circle</span>
                  )}
                </button>

                {/* 기관 담당자 */}
                <button
                  type="button"
                  onClick={() => setUserType("agency")}
                  className={`
                    p-4 rounded-xl font-bold text-[14px] transition-all flex items-center gap-4 text-left
                    ${
                      userType === "agency"
                        ? "bg-primary text-white shadow-lg shadow-primary/30 ring-2 ring-primary ring-offset-2"
                        : "bg-[#f2f4f6] dark:bg-gray-800 text-text-secondary hover:bg-gray-200 dark:hover:bg-gray-700"
                    }
                  `}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${
                    userType === "agency" ? "bg-white/20" : "bg-green-100 dark:bg-green-900/30"
                  }`}>
                    <span className={`material-symbols-outlined text-[28px] ${
                      userType === "agency" ? "text-white" : "text-green-600 dark:text-green-400"
                    }`}>apartment</span>
                  </div>
                  <div className="flex-1">
                    <p className={`font-bold text-[15px] mb-0.5 ${
                      userType === "agency" ? "text-white" : "text-text-primary dark:text-white"
                    }`}>
                      {language === 'ko' ? '기관 담당자' : 'Agency Staff'}
                    </p>
                    <p className={`text-xs ${
                      userType === "agency" ? "text-white/80" : "text-text-muted dark:text-gray-400"
                    }`}>
                      {language === 'ko' ? '일자리 공고 등록/관리, 지원자 관리' : 'Post jobs, manage applicants'}
                    </p>
                  </div>
                  {userType === "agency" && (
                    <span className="material-symbols-outlined text-white text-[24px]">check_circle</span>
                  )}
                </button>
              </div>
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

              {/* Name Inputs */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-text-primary dark:text-white mb-2">
                    {language === 'ko' ? '이름' : 'First Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'ko' ? '길동' : 'John'}
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.firstName
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-primary focus:ring-primary'
                    } focus:ring-2 focus:outline-none transition-all text-[15px] dark:bg-background-dark dark:border-gray-700 dark:text-white`}
                  />
                  {errors.firstName && (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.firstName}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-bold text-text-primary dark:text-white mb-2">
                    {language === 'ko' ? '성' : 'Last Name'}
                  </label>
                  <input
                    type="text"
                    placeholder={language === 'ko' ? '김' : 'Doe'}
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`w-full px-4 py-3 rounded-xl border ${
                      errors.lastName
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-primary focus:ring-primary'
                    } focus:ring-2 focus:outline-none transition-all text-[15px] dark:bg-background-dark dark:border-gray-700 dark:text-white`}
                  />
                  {errors.lastName && (
                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.lastName}</p>
                  )}
                </div>
              </div>

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
                        : emailAvailable === false
                        ? 'border-red-500 focus:ring-red-500'
                        : emailAvailable === true
                        ? 'border-green-500 focus:ring-green-500'
                        : 'border-gray-300 focus:border-primary focus:ring-primary'
                    } focus:ring-2 focus:outline-none transition-all text-[15px] dark:bg-background-dark dark:border-gray-700 dark:text-white`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.email}</p>
                )}
                {email && getEmailStatusMessage() && !errors.email && (
                  <p className={`mt-1.5 text-xs ${
                    emailAvailable === false ? 'text-red-600 dark:text-red-400' : 'text-green-600 dark:text-green-400'
                  }`}>
                    {getEmailStatusMessage()}
                  </p>
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
                    placeholder={language === 'ko' ? '8자 이상, 영문/숫자/특수문자 포함' : '8+ chars, letters/numbers/symbols'}
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

              {/* Confirm Password Input */}
              <div>
                <label className="block text-sm font-bold text-text-primary dark:text-white mb-2">
                  {t('auth.confirmPassword')}
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-text-muted">
                    lock
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    placeholder="•••••••••"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className={`w-full pl-11 pr-11 py-3 rounded-xl border ${
                      errors.confirmPassword
                        ? 'border-red-500 focus:ring-red-500'
                        : 'border-gray-300 focus:border-primary focus:ring-primary'
                    } focus:ring-2 focus:outline-none transition-all text-[15px] dark:bg-background-dark dark:border-gray-700 dark:text-white`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 material-symbols-outlined text-[20px] text-text-muted hover:text-primary transition-colors"
                  >
                    {showConfirmPassword ? 'visibility_off' : 'visibility'}
                  </button>
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{errors.confirmPassword}</p>
                )}
              </div>

              {/* Terms Agreement */}
              <div className="flex items-start gap-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
                <input
                  type="checkbox"
                  id="terms"
                  checked={agreed}
                  onChange={(e) => setAgreed(e.target.checked)}
                  className="mt-1 w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary cursor-pointer"
                />
                <label htmlFor="terms" className="text-sm text-text-secondary dark:text-gray-300 cursor-pointer">
                  {language === 'ko' ? (
                    <>
                      <a href="#" className="text-primary font-bold hover:text-primary-dark transition-colors">
                        이용약관
                      </a>
                      {" "}및{" "}
                      <a href="#" className="text-primary font-bold hover:text-primary-dark transition-colors">
                        개인정보처리방침
                      </a>
                      에 동의합니다.
                    </>
                  ) : (
                    <>
                      I agree to the{" "}
                      <a href="#" className="text-primary font-bold hover:text-primary-dark transition-colors">
                        Terms of Service
                      </a>
                      {" "}and{" "}
                      <a href="#" className="text-primary font-bold hover:text-primary-dark transition-colors">
                        Privacy Policy
                      </a>
                      .
                    </>
                  )}
                </label>
              </div>
              {errors.terms && (
                <p className="text-xs text-red-600 dark:text-red-400" role="alert">{errors.terms}</p>
              )}

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
                    {language === 'ko' ? '회원가입' : 'Sign Up'}
                    <span className="material-symbols-outlined text-[18px] ml-1">arrow_forward</span>
                  </>
                )}
              </Button>
            </form>

            {/* Login Link */}
            <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-800">
              <p className="text-sm text-text-muted dark:text-gray-400">
                {language === 'ko' ? '이미 계정이 있으신가요?' : 'Already have an account?'}{" "}
                <Link
                  href="/login"
                  className="text-primary font-bold hover:text-primary-dark transition-colors"
                >
                  {language === 'ko' ? '로그인' : 'Login'}
                </Link>
              </p>
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
