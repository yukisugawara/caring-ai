"use client";

export function RedPanda({ speaking = false, size = 64 }: { speaking?: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={speaking ? "animate-bounce" : ""}
      style={{ animationDuration: "0.6s" }}
    >
      {/* Body */}
      <ellipse cx="60" cy="75" rx="35" ry="30" fill="#D2691E" />

      {/* Face */}
      <circle cx="60" cy="55" r="32" fill="#E8833A" />

      {/* Ears */}
      <ellipse cx="35" cy="28" rx="12" ry="14" fill="#8B4513" />
      <ellipse cx="35" cy="28" rx="8" ry="10" fill="#E8833A" />
      <ellipse cx="85" cy="28" rx="12" ry="14" fill="#8B4513" />
      <ellipse cx="85" cy="28" rx="8" ry="10" fill="#E8833A" />

      {/* White face patches */}
      <ellipse cx="45" cy="52" rx="14" ry="12" fill="#FFF5E6" />
      <ellipse cx="75" cy="52" rx="14" ry="12" fill="#FFF5E6" />

      {/* Eye markings (dark patches) */}
      <ellipse cx="45" cy="50" rx="8" ry="7" fill="#5C3317" />
      <ellipse cx="75" cy="50" rx="8" ry="7" fill="#5C3317" />

      {/* Eyes */}
      <circle cx="45" cy="49" r="4.5" fill="#1a1a1a" />
      <circle cx="75" cy="49" r="4.5" fill="#1a1a1a" />

      {/* Eye highlights */}
      <circle cx="47" cy="47" r="1.8" fill="white" />
      <circle cx="77" cy="47" r="1.8" fill="white" />

      {/* Nose */}
      <ellipse cx="60" cy="60" rx="4" ry="3" fill="#1a1a1a" />

      {/* Mouth */}
      {speaking ? (
        <ellipse cx="60" cy="66" rx="6" ry="4" fill="#c0392b" />
      ) : (
        <>
          <path d="M 55 64 Q 60 70 65 64" stroke="#1a1a1a" strokeWidth="1.5" fill="none" />
        </>
      )}

      {/* Cheek blush */}
      <circle cx="38" cy="60" r="5" fill="#FF9999" opacity="0.4" />
      <circle cx="82" cy="60" r="5" fill="#FF9999" opacity="0.4" />

      {/* Whisker marks */}
      <path d="M 42 56 L 48 55" stroke="#FFF5E6" strokeWidth="1.5" />
      <path d="M 42 59 L 48 58" stroke="#FFF5E6" strokeWidth="1.5" />
      <path d="M 78 56 L 72 55" stroke="#FFF5E6" strokeWidth="1.5" />
      <path d="M 78 59 L 72 58" stroke="#FFF5E6" strokeWidth="1.5" />

      {/* Tail (behind body) */}
      <path
        d="M 90 80 Q 105 65 100 50 Q 95 40 105 35"
        stroke="#D2691E"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
      <path
        d="M 100 50 Q 95 40 105 35"
        stroke="#8B4513"
        strokeWidth="8"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}
