interface BrandLogoProps {
  className?: string;
  size?: number;
  withGlow?: boolean;
}

export function BrandLogo({ className = "w-9 h-9", size = 36, withGlow = true }: BrandLogoProps) {
  return (
    <div className={`relative flex items-center justify-center flex-shrink-0 select-none ${className}`}>
      {withGlow && (
        <div className="absolute inset-0 bg-[#FE2C55]/20 rounded-xl blur-md pointer-events-none" />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain relative z-10"
      >
        <defs>
          <linearGradient id="tkGradComp" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FE2C55" />
            <stop offset="100%" stopColor="#25F4EE" />
          </linearGradient>
          <filter id="neonGlowComp" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        <rect width="100" height="100" rx="24" fill="#0E1015" />
        <rect width="98" height="98" x="1" y="1" rx="23" stroke="url(#tkGradComp)" strokeWidth="1.5" strokeOpacity="0.4" />
        {/* Glitch / TikTok inspired modern AI Studio icon */}
        <g transform="translate(18, 16)" filter="url(#neonGlowComp)">
          {/* Cyan offset note/play shape */}
          <path
            d="M38 12 C38 18 42 22 48 24 L48 30 C40 28 35 24 33 20 L33 46 C33 55 26 62 17 62 C8 62 1 55 1 46 C1 37 8 30 17 30 C20 30 23 31 25 32 L25 12 Z"
            fill="#25F4EE"
            opacity="0.85"
            transform="translate(-2, -2)"
          />
          {/* Red/Pink primary note/play shape */}
          <path
            d="M38 12 C38 18 42 22 48 24 L48 30 C40 28 35 24 33 20 L33 46 C33 55 26 62 17 62 C8 62 1 55 1 46 C1 37 8 30 17 30 C20 30 23 31 25 32 L25 12 Z"
            fill="#FE2C55"
            opacity="0.9"
            transform="translate(2, 2)"
          />
          {/* White sharp overlay */}
          <path
            d="M38 12 C38 18 42 22 48 24 L48 30 C40 28 35 24 33 20 L33 46 C33 55 26 62 17 62 C8 62 1 55 1 46 C1 37 8 30 17 30 C20 30 23 31 25 32 L25 12 Z"
            fill="#FFFFFF"
          />
          {/* AI Sparkle star */}
          <polygon points="52,42 54,48 60,50 54,52 52,58 50,52 44,50 50,48" fill="#25F4EE" />
          <polygon points="20,12 21,15 24,16 21,17 20,20 19,17 16,16 19,15" fill="#FE2C55" />
        </g>
      </svg>
    </div>
  );
}
