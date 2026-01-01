"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Input, Button } from "@/components/ui";

export default function LoginPage() {
  const router = useRouter();
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
      newErrors.email = "이메일 주소를 입력해주세요";
    } else if (!validateEmail(email)) {
      newErrors.email = "올바른 이메일 주소를 입력해주세요";
    }

    if (!password) {
      newErrors.password = "비밀번호를 입력해주세요";
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
        setErrors({ general: data.message || "로그인 중 오류가 발생했습니다" });
        return;
      }

      // Store token in localStorage
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
      }

      // Redirect to dashboard on success
      router.push("/");
    } catch (error) {
      setErrors({ general: "로그인 중 오류가 발생했습니다" });
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
            easyK 로그인
          </h1>
          <p className="text-sm text-gray-500">
            외국인 정착 지원 서비스에 오신 것을 환영합니다.
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
            placeholder="비밀번호를 입력하세요"
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

          {/* Submit Button */}
          <Button type="submit" fullWidth size="lg" loading={loading} disabled={loading}>
            로그인
          </Button>
        </form>

        {/* Signup Link */}
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            계정이 없으신가요?{" "}
            <a href="/signup" className="text-blue-600 hover:underline font-medium">
              회원가입
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
