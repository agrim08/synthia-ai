import React from "react";

interface LogoProps {
  className?: string;
  width?: number | string;
  height?: number | string;
}

export const Logo: React.FC<LogoProps> = ({ className, width = 160, height = 190 }) => {
  return (
    <svg 
      viewBox="0 0 160 190" 
      xmlns="http://www.w3.org/2000/svg" 
      width={width} 
      height={height}
      className={className}
    >
      <defs>
        <linearGradient id="tileGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#818cf8"/>
          <stop offset="100%" stopColor="#4f46e5"/>
        </linearGradient>

        <linearGradient id="iconStroke" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#ffffff" stopOpacity="1"/>
          <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.9"/>
        </linearGradient>

        <filter id="tileShadow" x="-25%" y="-25%" width="150%" height="150%">
          <feDropShadow dx="0" dy="10" stdDeviation="18" floodColor="#4f46e5" floodOpacity="0.4"/>
        </filter>
      </defs>

      {/* Rounded square tile */}
      <rect x="16" y="8" width="128" height="128" rx="30" fill="url(#tileGrad)" filter="url(#tileShadow)"/>

      {/* Subtle border highlight */}
      <rect x="16" y="8" width="128" height="128" rx="30"
        fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth="1.5"/>

      {/* Top inner glow sheen */}
      <ellipse cx="80" cy="22" rx="46" ry="14" fill="white" opacity="0.08"/>

      {/* Connection arc */}
      <path
        d="M 96 52 C 86 68, 74 60, 64 76"
        fill="none"
        stroke="white"
        strokeWidth="6"
        strokeLinecap="round"
        opacity="0.85"
      />

      {/* Top-right node: Repo */}
      <circle cx="96" cy="48" r="14" fill="none" stroke="white" strokeWidth="5.5" opacity="0.95"/>
      {/* Inner fill dot */}
      <circle cx="96" cy="48" r="5" fill="white"/>

      {/* Bottom-left node: AI */}
      <circle cx="64" cy="80" r="14" fill="none" stroke="white" strokeWidth="5.5" opacity="0.95"/>
      <circle cx="64" cy="80" r="5" fill="white"/>

      {/* Third mini node (collab user) — floating top-left */}
      <circle cx="48" cy="50" r="7" fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth="3.5"/>
      <circle cx="48" cy="50" r="2.5" fill="rgba(255,255,255,0.6)"/>

      {/* Thin connector from mini node to main bottom node */}
      <line x1="53" y1="55" x2="59" y2="75"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeDasharray="3 3"/>

      {/* App name */}
      <text
        x="80"
        y="165"
        fontFamily="'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
        fontSize="15"
        fontWeight="700"
        fill="#4f46e5"
        textAnchor="middle"
        letterSpacing="3.5"
      >OWNYOURCODE</text>

      {/* Tiny "ai" suffix in lighter weight */}
      <text
        x="80"
        y="181"
        fontFamily="'SF Pro Display', 'Helvetica Neue', Arial, sans-serif"
        fontSize="10"
        fontWeight="400"
        fill="#818cf8"
        textAnchor="middle"
        letterSpacing="2"
      >AI ASSISTANT</text>
    </svg>
  );
};
