interface BrandLogoProps {
  className?: string;
  size?: number;
  withGlow?: boolean;
}

export function BrandLogo({ className = "w-9 h-9", size = 36, withGlow = true }: BrandLogoProps) {
  return (
    <div className={`relative flex items-center justify-center flex-shrink-0 select-none ${className}`}>
      {withGlow && (
        <div className="absolute inset-0 bg-primary-container/20 rounded-xl blur-md pointer-events-none" />
      )}
      <svg
        width={size}
        height={size}
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full object-contain relative z-10"
      >
        <defs>
          <linearGradient id="logo-bg-grad" x1="0" y1="0" x2="48" y2="48" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e1f25" />
            <stop offset="100%" stopColor="#0c0e13" />
          </linearGradient>
        </defs>

        {/* Chassis Carré Arrondi */}
        <rect
          width="48"
          height="48"
          rx="12"
          fill="url(#logo-bg-grad)"
          stroke="#33353a"
          strokeWidth="1.5"
        />

        {/* Halo ambiant Cyan */}
        <circle cx="16" cy="18" r="8" fill="#35fbf5" fillOpacity="0.25" />
        {/* Halo ambiant Vermillion */}
        <circle cx="32" cy="30" r="10" fill="#ff5168" fillOpacity="0.25" />

        {/* TikTok Chromatic Note : Calque Cyan Décalé */}
        <path
          d="M26.5 12C28.2 15.8 31.8 18.2 35.8 18.2V22.2C32.8 22.2 30 21 27.8 19V30.5C27.8 35.2 24 39 19.3 39C14.6 39 10.8 35.2 10.8 30.5C10.8 25.8 14.6 22 19.3 22C20.3 22 21.3 22.2 22.1 22.6V27C21.3 26.5 20.3 26.2 19.3 26.2C16.9 26.2 15 28.1 15 30.5C15 32.9 16.9 34.8 19.3 34.8C21.7 34.8 23.6 32.9 23.6 30.5V12H26.5Z"
          fill="#35fbf5"
          opacity="0.9"
        />

        {/* TikTok Chromatic Note : Calque Vermillion Décalé */}
        <path
          d="M29.5 14C31.2 17.8 34.8 20.2 38.8 20.2V24.2C35.8 24.2 33 23 30.8 21V32.5C30.8 37.2 27 41 22.3 41C17.6 41 13.8 37.2 13.8 32.5C13.8 27.8 17.6 24 22.3 24C23.3 24 24.3 24.2 25.1 24.6V29C24.3 28.5 23.3 28.2 22.3 28.2C19.9 28.2 18 30.1 18 32.5C18 34.9 19.9 36.8 22.3 36.8C24.7 36.8 26.6 34.9 26.6 32.5V14H29.5Z"
          fill="#ff5168"
          opacity="0.9"
        />

        {/* TikTok Chromatic Note : Noyau Blanc */}
        <path
          d="M28 13C29.7 16.8 33.3 19.2 37.3 19.2V23.2C34.3 23.2 31.5 22 29.3 20V31.5C29.3 36.2 25.5 40 20.8 40C16.1 40 12.3 36.2 12.3 31.5C12.3 26.8 16.1 23 20.8 23C21.8 23 22.8 23.2 23.6 23.6V28C22.8 27.5 21.8 27.2 20.8 27.2C18.4 27.2 16.5 29.1 16.5 31.5C16.5 33.9 18.4 35.8 20.8 35.8C23.2 35.8 25.1 33.9 25.1 31.5V13H28Z"
          fill="#ffffff"
        />

        {/* Étincelle IA ✦ Supérieure */}
        <path
          d="M37 6L38.2 9.8L42 11L38.2 12.2L37 16L35.8 12.2L32 11L35.8 9.8L37 6Z"
          fill="#35fbf5"
        />
        <circle cx="37" cy="11" r="1.2" fill="#ffffff" />
      </svg>
    </div>
  );
}
