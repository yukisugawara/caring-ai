"use client";

export function LesserKun({ speaking = false, size = 64 }: { speaking?: boolean; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 200 200"
      className={speaking ? "animate-bounce" : ""}
      style={{ animationDuration: "0.6s" }}
    >
      {/* === Ears === */}
      {/* Left ear */}
      <ellipse cx="62" cy="38" rx="18" ry="22" fill="#5C3A1E" />
      <ellipse cx="62" cy="38" rx="12" ry="16" fill="#F5F0EB" />
      {/* Right ear */}
      <ellipse cx="138" cy="38" rx="18" ry="22" fill="#5C3A1E" />
      <ellipse cx="138" cy="38" rx="12" ry="16" fill="#F5F0EB" />

      {/* === Body === */}
      <ellipse cx="100" cy="155" rx="42" ry="35" fill="#4A2A12" />

      {/* === Arms === */}
      <ellipse cx="62" cy="145" rx="16" ry="22" fill="#4A2A12" transform="rotate(-10 62 145)" />
      <ellipse cx="138" cy="145" rx="16" ry="22" fill="#4A2A12" transform="rotate(10 138 145)" />

      {/* === Feet === */}
      <ellipse cx="80" cy="182" rx="16" ry="10" fill="#4A2A12" />
      <ellipse cx="120" cy="182" rx="16" ry="10" fill="#4A2A12" />

      {/* === Head (big round) === */}
      <circle cx="100" cy="82" r="48" fill="#E88A3A" />

      {/* === White face patches === */}
      {/* Forehead white stripe */}
      <ellipse cx="100" cy="65" rx="8" ry="12" fill="#FFF8F0" />
      {/* Left cheek white */}
      <ellipse cx="78" cy="85" rx="18" ry="16" fill="#FFF8F0" />
      {/* Right cheek white */}
      <ellipse cx="122" cy="85" rx="18" ry="16" fill="#FFF8F0" />
      {/* Muzzle white */}
      <ellipse cx="100" cy="92" rx="16" ry="13" fill="#FFF8F0" />

      {/* === Eye markings (darker orange around eyes) === */}
      <ellipse cx="82" cy="78" rx="12" ry="10" fill="#C96B20" />
      <ellipse cx="118" cy="78" rx="12" ry="10" fill="#C96B20" />

      {/* === Eyes (big shiny) === */}
      <circle cx="82" cy="78" r="8" fill="#1a1a1a" />
      <circle cx="118" cy="78" r="8" fill="#1a1a1a" />
      {/* Eye shine (big) */}
      <circle cx="85" cy="75" r="3.5" fill="white" />
      <circle cx="121" cy="75" r="3.5" fill="white" />
      {/* Eye shine (small) */}
      <circle cx="80" cy="80" r="1.5" fill="white" opacity="0.7" />
      <circle cx="116" cy="80" r="1.5" fill="white" opacity="0.7" />

      {/* === Nose === */}
      <ellipse cx="100" cy="88" rx="5" ry="3.5" fill="#2a2a2a" />
      {/* Nose highlight */}
      <ellipse cx="99" cy="87" rx="2" ry="1.2" fill="#4a4a4a" />

      {/* === Mouth === */}
      {speaking ? (
        <>
          <ellipse cx="100" cy="96" rx="6" ry="5" fill="#D4635A" />
          <ellipse cx="100" cy="94" rx="5" ry="2" fill="#1a1a1a" opacity="0.15" />
        </>
      ) : (
        <>
          <path d="M 94 92 Q 100 98 106 92" stroke="#5C3A1E" strokeWidth="1.8" fill="none" strokeLinecap="round" />
        </>
      )}

      {/* === Cheek blush === */}
      <circle cx="70" cy="90" r="7" fill="#FF9999" opacity="0.3" />
      <circle cx="130" cy="90" r="7" fill="#FF9999" opacity="0.3" />

      {/* === Green leaf pendant === */}
      <line x1="100" y1="108" x2="100" y2="130" stroke="#6B8E23" strokeWidth="1.5" />
      <path d="M 88 138 Q 100 120 112 138 Q 100 145 88 138" fill="#8DB600" />
      <line x1="100" y1="128" x2="100" y2="140" stroke="#6B8E23" strokeWidth="1" opacity="0.5" />
      <line x1="94" y1="135" x2="106" y2="131" stroke="#6B8E23" strokeWidth="0.8" opacity="0.4" />

      {/* === Belly (lighter) === */}
      <ellipse cx="100" cy="155" rx="25" ry="20" fill="#5C3A1E" />
    </svg>
  );
}
