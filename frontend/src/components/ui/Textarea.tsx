"use client";

import React, { forwardRef, TextareaHTMLAttributes, useId } from "react";

export interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  fullWidth?: boolean;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ label, error, fullWidth = true, className = "", id: providedId, ...props }, ref) => {
    const generatedId = useId();
    const textareaId = providedId || generatedId;

    return (
      <div className={`flex flex-col gap-2 ${fullWidth ? "w-full" : ""}`}>
        {label && (
          <label htmlFor={textareaId} className="text-sm font-medium text-gray-900">
            {label}
          </label>
        )}

        <textarea
          id={textareaId}
          ref={ref}
          className={`
            w-full px-4 py-3
            text-base text-gray-900
            bg-white
            border border-gray-300 rounded-lg
            placeholder:text-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent
            disabled:bg-gray-100 disabled:cursor-not-allowed
            resize-vertical
            ${error ? "border-red-500 focus:ring-red-500" : ""}
            ${className}
          `}
          {...props}
        />

        {error && (
          <p className="text-sm text-red-500" role="alert">{error}</p>
        )}
      </div>
    );
  }
);

Textarea.displayName = "Textarea";

export default Textarea;
