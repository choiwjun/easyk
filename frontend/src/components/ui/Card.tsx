"use client";

import React, { ReactNode } from "react";

export interface CardProps {
    children: ReactNode;
    className?: string;
    padding?: "none" | "sm" | "md" | "lg";
    shadow?: boolean;
    border?: boolean;
    hover?: boolean;
    onClick?: () => void;
}

const Card: React.FC<CardProps> = ({
    children,
    className = "",
    padding = "md",
    shadow = true,
    border = false,
    hover = false,
    onClick,
}) => {
    const paddingStyles = {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
    };

    const baseStyles = "bg-white rounded-lg";
    const shadowStyle = shadow ? "shadow-sm" : "";
    const borderStyle = border ? "border border-gray-200" : "";
    const hoverStyle = hover ? "hover:shadow-md transition-shadow cursor-pointer" : "";
    const clickableStyle = onClick ? "cursor-pointer" : "";

    return (
        <div
            className={`
        ${baseStyles}
        ${paddingStyles[padding]}
        ${shadowStyle}
        ${borderStyle}
        ${hoverStyle}
        ${clickableStyle}
        ${className}
      `}
            onClick={onClick}
            role={onClick ? "button" : undefined}
            tabIndex={onClick ? 0 : undefined}
            onKeyDown={onClick ? (e) => e.key === "Enter" && onClick() : undefined}
        >
            {children}
        </div>
    );
};

export default Card;
