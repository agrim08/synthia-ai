import React from "react";

interface LogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const Logo: React.FC<LogoProps> = ({ className, width = 36, height = 36 }) => {
  return (
    <svg
      viewBox="0 0 36 36"
      xmlns="http://www.w3.org/2000/svg"
      width={width}
      height={height}
      className={className}
      fill="none"
      aria-label="OwnYourCode"
      role="img"
    >
      {/* Left chevron < */}
      <polyline
        points="20,8 8,18 20,28"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Right chevron > — slightly inset to overlap */}
      <polyline
        points="14,12 26,18 14,24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Coral ownership dot — right terminal */}
      <circle cx="26" cy="18" r="3" fill="#c45c32" />

      {/* Coral center dot — ownership point */}
      <circle cx="17.5" cy="18" r="2" fill="#c45c32" opacity="0.85" />

      {/* Ink left terminal dot */}
      <circle cx="8" cy="18" r="2.2" fill="currentColor" />
    </svg>
  );
};