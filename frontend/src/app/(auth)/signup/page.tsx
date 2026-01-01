"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button } from "@/components/ui";

export default function SignupPage() {
  const router = useRouter();
  const [userType, setUserType] = useState<"foreign" | "organization">("foreign");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
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
    // At least 8 characters, contains letter, number, and special character
    return (
      password.length >= 8 &&
      /[a-zA-Z]/.test(password) &&
      /[0-9]/.test(password) &&
      /[!@#$%^&*(),.?":{}|<>]/.test(password)
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});

    // Validation
    const newErrors: typeof errors = {};

    if (!firstName.trim()) {
      newErrors.firstName = "이름을 입력해주세요";
    }

    if (!lastName.trim()) {
      newErrors.lastName = "성을 입력해주세요";
    }

    if (!validateEmail(email)) {
      newErrors.email = "올바른 이메일 주소를 입력해주세요";
    }

    if (!validatePassword(password)) {
      newErrors.password = "8자 이상, 영문/숫자/특수문자를 포함해주세요";
    }

    if (password !== confirmPassword) {
      newErrors.confirmPassword = "비밀번호가 일치하지 않습니다";
    }

    if (!agreed) {
      newErrors.terms = "이용약관에 동의해주세요";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // API call
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
          role: userType === "foreign" ? "foreign" : "consultant",
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setErrors({ general: data.message || "회원가입 중 오류가 발생했습니다" });
        return;
      }

      // Redirect to login on success
      router.push("/login");
    } catch (error) {
      setErrors({ general: "회원가입 중 오류가 발생했습니다" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-12">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            easyK 회원가입
          </h1>
          <p className="text-sm text-gray-500">
            신뢰할 수 있는 정착 지원 서비스를 만나보세요.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6" noValidate>
          {/* General Error */}
          {errors.general && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600" role="alert">{errors.general}</p>
            </div>
          )}

          {/* User Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-900 mb-2">
              사용자 유형
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setUserType("foreign")}
                className={`
                  flex-1 h-12 rounded-lg font-medium transition-all
                  ${
                    userType === "foreign"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                외국인 회원
              </button>
              <button
                type="button"
                onClick={() => setUserType("organization")}
                className={`
                  flex-1 h-12 rounded-lg font-medium transition-all
                  ${
                    userType === "organization"
                      ? "bg-blue-600 text-white"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }
                `}
              >
                지원 기관
              </button>
            </div>
          </div>

          {/* First Name Input */}
          <Input
            type="text"
            label="이름"
            placeholder="홍길동"
            required
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            error={errors.firstName}
          />

          {/* Last Name Input */}
          <Input
            type="text"
            label="성"
            placeholder="Kim"
            required
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            error={errors.lastName}
          />

          {/* Email Input */}
          <Input
            type="email"
            label="이메일 주소"
            placeholder="example@email.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error={errors.email}
            icon={
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            }
          />

          {/* Password Input */}
          <Input
            type={showPassword ? "text" : "password"}
            label="비밀번호"
            placeholder="8자 이상, 영문/숫자/특수문자 포함"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error={errors.password}
            icon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {showPassword ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  )}
                </svg>
              </button>
            }
          />

          {/* Confirm Password Input */}
          <Input
            type={showConfirmPassword ? "text" : "password"}
            label="비밀번호 확인"
            placeholder="비밀번호를 한번 더 입력해주세요"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={errors.confirmPassword}
            icon={
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="hover:text-gray-600"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  {showConfirmPassword ? (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  ) : (
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  )}
                </svg>
              </button>
            }
          />

          {/* Terms Agreement */}
          <div className="flex flex-col gap-2">
            <div className="flex items-start gap-3">
              <input
                type="checkbox"
                id="terms"
                checked={agreed}
                onChange={(e) => setAgreed(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-600">
                이용약관 및 개인정보 처리방침에{" "}
                <a href="#" className="text-blue-600 hover:underline">
                  동의합니다
                </a>
                .
              </label>
            </div>
            {errors.terms && (
              <p className="text-sm text-red-500" role="alert">{errors.terms}</p>
            )}
          </div>

          {/* Submit Button */}
          <Button type="submit" fullWidth size="lg" loading={loading} disabled={loading}>
            회원가입 →
          </Button>
        </form>

        {/* Login Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            이미 계정이 있으신가요?{" "}
            <a href="/login" className="text-blue-600 hover:underline font-medium">
              로그인
            </a>
          </p>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-xs text-gray-400">© 2024 easyK. All rights reserved.</p>
        </div>
      </div>
    </div>
  );
}
