"use client";

import React, { forwardRef, SelectHTMLAttributes, useId } from "react";

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: SelectOption[];
  fullWidth?: boolean;
  placeholder?: string;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, fullWidth = true, placeholder, className = "", id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const selectId = providedId || generatedId;

    return (
      <div className={`flex flex-col gap-2 ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label htmlFor={selectId} className="text-sm font-medium text-gray-900">
            {label}
          </label>
        )}

        <select
          id={selectId}
          ref={ref}
          className={`
            w-full h-12 px-4
            text-base text-gray-900
            bg-white
            border border-gray-300 rounded-lg
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            ${error ? "border-red-500 focus:ring-red-500" : ""}
            ${className}
          `}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        {error && (
          <p className="text-sm text-red-500" role="alert">{error}</p>
        )}
      </div>
    );
  }
);

Select.displayName = "Select";

export default Select;
