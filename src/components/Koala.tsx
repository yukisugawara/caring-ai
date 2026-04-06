"use client";

export function Koala({ speaking = false, size = 64 }: { speaking?: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={speaking ? "animate-bounce" : ""}
      style={{ animationDuration: "0.6s" }}
    >
      {/* Big fluffy ears */}
      <circle cx="30" cy="35" r="20" fill="#8B8B8B" />
      <circle cx="30" cy="35" r="14" fill="#F5F0EB" />
      <circle cx="90" cy="35" r="20" fill="#8B8B8B" />
      <circle cx="90" cy="35" r="14" fill="#F5F0EB" />

      {/* Body */}
      <ellipse cx="60" cy="85" rx="30" ry="25" fill="#9E9E9E" />
      <ellipse cx="60" cy="88" rx="22" ry="18" fill="#E8E3DE" />

      {/* Head */}
      <ellipse cx="60" cy="55" rx="30" ry="28" fill="#9E9E9E" />

      {/* White face */}
      <ellipse cx="60" cy="58" rx="24" ry="22" fill="#F5F0EB" />

      {/* Eye patches (dark) */}
      <ellipse cx="45" cy="52" rx="10" ry="9" fill="#5C5C5C" />
      <ellipse cx="75" cy="52" rx="10" ry="9" fill="#5C5C5C" />

      {/* Eyes */}
      <circle cx="45" cy="51" r="5" fill="#1a1a1a" />
      <circle cx="75" cy="51" r="5" fill="#1a1a1a" />

      {/* Eye highlights */}
      <circle cx="47" cy="49" r="2" fill="white" />
      <circle cx="77" cy="49" r="2" fill="white" />

      {/* Big nose */}
      <ellipse cx="60" cy="62" rx="7" ry="5" fill="#3a3a3a" />
      <ellipse cx="58" cy="60.5" rx="2" ry="1.5" fill="#5a5a5a" />

      {/* Mouth */}
      {speaking ? (
        <ellipse cx="60" cy="70" rx="5" ry="4" fill="#D4837A" />
      ) : (
        <path d="M 55 67 Q 60 72 65 67" stroke="#6a6a6a" strokeWidth="1.5" fill="none" />
      )}

      {/* Cheek blush */}
      <circle cx="38" cy="62" r="5" fill="#FFB6C1" opacity="0.35" />
      <circle cx="82" cy="62" r="5" fill="#FFB6C1" opacity="0.35" />

      {/* Arms */}
      <ellipse cx="35" cy="82" rx="8" ry="12" fill="#8B8B8B" transform="rotate(-15 35 82)" />
      <ellipse cx="85" cy="82" rx="8" ry="12" fill="#8B8B8B" transform="rotate(15 85 82)" />
    </svg>
  );
}
