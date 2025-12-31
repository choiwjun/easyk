"use client";

import React, { forwardRef, InputHTMLAttributes, ReactNode } from "react";

export interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: ReactNode;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, icon, fullWidth = true, className = "", ...props }, ref) => {
    return (
      <div className={`flex flex-col gap-2 ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label className="text-sm font-medium text-gray-900">
            {label}
          </label>
        )}

        <div className="relative">
          <input
            ref={ref}
            className={`
              w-full h-12 px-4
              text-base text-gray-900
              bg-white
              border border-gray-300 rounded-lg
              placeholder:text-gray-400
              focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
              disabled:bg-gray-100 disabled:cursor-not-allowed
              ${error ? "border-red-500 focus:ring-red-500" : ""}
              ${icon ? "pr-12" : ""}
              ${className}
            `}
            {...props}
          />

          {icon && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
        </div>

        {error && (
          <p className="text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);

Input.displayName = "Input";

export default Input;
