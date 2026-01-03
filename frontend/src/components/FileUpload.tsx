"use client";

import { useState } from "react";
import { useLanguage } from "@/contexts/LanguageContext";

interface FileUploadProps {
  onUpload: (file: File) => void;
  fileTypes?: string[];
  maxSize?: number;  // MB
  accept?: string;
  multiple?: boolean;
  disabled?: boolean;
  className?: string;
}

export default function FileUpload({
  onUpload,
  fileTypes = ["application/pdf", "image/jpeg", "image/png"],
  maxSize = 10,
  accept,
  multiple = false,
  disabled = false,
  className = "",
}: FileUploadProps) {
  const { t } = useLanguage();
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState("");

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const M = 1024 * k;
    const G = 1024 * M;
    if (bytes < G) return `${(bytes / k).toFixed(2)} KB`;
    if (bytes < M) return `${(bytes / M).toFixed(2)} MB`;
    return `${(bytes / G).toFixed(2)} GB`;
  };

  const validateFile = (file: File) => {
    // 파일 크기 검증
    const maxSizeInBytes = maxSize * 1024 * 1024;
    if (file.size > maxSizeInBytes) {
      setUploadError(`파일 크기는 ${maxSize}MB 이하여야 합니다.`);
      return false;
    }

    // 파일 형식 검증
    if (fileTypes && !fileTypes.includes(file.type)) {
      setUploadError(`허용되지 않는 파일 형식입니다: ${file.type}`);
      return false;
    }

    setUploadError("");
    return true;
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const files = Array.from(e.dataTransfer.files);
    if (files.length === 0) return;

    const file = files[0] as File;
    if (validateFile(file)) {
      onUpload(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const file = files[0] as File;
    if (validateFile(file)) {
      onUpload(file);
    }

    // Reset input
    e.target.value = "";
  };

  return (
    <div className={`relative ${className}`}>
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-all
          ${isDragging ? "border-blue-500 bg-blue-50" : "border-gray-300 bg-gray-50"}
          ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}
          hover:border-gray-400
        `}
      >
        <input
          type="file"
          onChange={handleFileChange}
          accept={accept || fileTypes.join(",")}
          multiple={multiple}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <div className="space-y-2">
          <svg
            className="w-12 h-12 mx-auto text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16a4 4 0 00-4 4v8a4 4 0 008 4H6a4 4 0 00-4-4V16zM16 16v6a2 2 0 012-2h5.586l5.414 5.414a1 1 0 01.707.293 1.707H20a1 1 0 01.707.293-.293-.707l-2.586-2.586a1 1 0 00-1.414-1.414 1.414V5a1 1 0 01-.293.707-.707.707H4a1 1 0 01-.293-.707-.707V5a2 2 0 012 2h7a2 2 0 002 2v8a2 2 0 01-2 2H6a2 2 0 01-2-2V9a2 2 0 012-2z"
            />
          </svg>

          <p className="text-sm text-gray-600">
            {disabled ? t('common.disabled') : isDragging ? "파일을 여기에 놓으세요" : "파일을 선택하거나 드래그하세요"}
          </p>

          <p className="text-xs text-gray-500">
            최대 크기: {maxSize}MB
          </p>
        </div>

        {uploadError && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-sm text-red-600">{uploadError}</p>
          </div>
        )}
      </div>
    </div>
  );
}


