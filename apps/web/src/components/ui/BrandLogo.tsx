interface BrandLogoProps {
  className?: string;
  size?: number;
  withGlow?: boolean;
}

/**
 * BrandLogo — Identité visuelle 100% propriétaire d'Auto Studio IA
 * 
 * Symbolique :
 * 1. Double boucle cinétique (Cyan -> Bleu et Crimson -> Violet) : Automatisation & flux continu 9:16 (Monogramme 'AS' / Infini).
 * 2. Prisme Quantum Play 3D (Centre) : Déclenchement vidéo & lecture haute performance.
 * 3. Étoile étincelle IA (Apex) : Génération de hooks viraux et synthèse multimodale.
 */
export function BrandLogo({ className = "w-9 h-9", size = 36, withGlow = true }: BrandLogoProps) {
  return (
    <div className={`relative flex items-center justify-center flex-shrink-0 select-none ${className}`}>
      {withGlow && (
        <div className="absolute inset-0 bg-gradient-to-tr from-[#00F5D4]/20 to-[#FF007A]/20 rounded-xl blur-md pointer-events-none" />
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
          <linearGradient id="comp-brand-bg" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1E293B" />
            <stop offset="100%" stopColor="#0F172A" />
          </linearGradient>

          <linearGradient id="comp-brand-rim" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#00F5D4" stopOpacity="0.8" />
            <stop offset="50%" stopColor="#7928CA" stopOpacity="0.3" />
            <stop offset="100%" stopColor="#FF007A" stopOpacity="0.8" />
          </linearGradient>

          <linearGradient id="comp-arc-cyan" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00F5D4" />
            <stop offset="50%" stopColor="#00BBF9" />
            <stop offset="100%" stopColor="#3A86FF" />
          </linearGradient>

          <linearGradient id="comp-arc-magenta" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF1361" />
            <stop offset="60%" stopColor="#C70039" />
            <stop offset="100%" stopColor="#7209B7" />
          </linearGradient>

          <linearGradient id="comp-facet-top" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="60%" stopColor="#A5F3FC" />
            <stop offset="100%" stopColor="#00F5D4" />
          </linearGradient>

          <linearGradient id="comp-facet-bottom" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FF007A" />
            <stop offset="100%" stopColor="#7928CA" />
          </linearGradient>

          <filter id="comp-glow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        {/* Chassis Plate */}
        <rect x="4" y="4" width="92" height="92" rx="24" fill="url(#comp-brand-bg)" stroke="#334155" strokeWidth="1.5" />
        <rect x="4" y="4" width="92" height="92" rx="24" fill="none" stroke="url(#comp-brand-rim)" strokeWidth="1.2" />

        <g filter="url(#comp-glow)">
          {/* Boucle ascendante (Cyan -> Azure) */}
          <path 
            d="M 28 66 C 18 52 20 32 36 22 C 48 14 62 16 70 24 L 62 31 C 56 25 46 24 38 29 C 27 36 26 50 34 60 C 40 68 50 70 60 67 L 62 76 C 50 80 37 77 28 66 Z" 
            fill="url(#comp-arc-cyan)" 
          />

          {/* Boucle descendante (Crimson -> Purple) */}
          <path 
            d="M 72 34 C 82 48 80 68 64 78 C 52 86 38 84 30 76 L 38 69 C 44 75 54 76 62 71 C 73 64 74 50 66 40 C 60 32 50 30 40 33 L 38 24 C 50 20 63 23 72 34 Z" 
            fill="url(#comp-arc-magenta)" 
          />

          {/* Prisme Play 3D central */}
          <polygon points="43,35 65,50 43,50" fill="url(#comp-facet-top)" />
          <polygon points="43,50 65,50 43,65" fill="url(#comp-facet-bottom)" />
          <line x1="43" y1="35" x2="43" y2="65" stroke="#FFFFFF" strokeOpacity="0.4" strokeWidth="0.8" />

          {/* Étincelle d'Intelligence Artificielle */}
          <path d="M 70 24 Q 70 30 76 30 Q 70 30 70 36 Q 70 30 64 30 Q 70 30 70 24 Z" fill="#00F5D4" />
          <circle cx="70" cy="30" r="1.2" fill="#FFFFFF" />

          {/* Ancre étincelle secondaire */}
          <path d="M 28 68 Q 28 72 32 72 Q 28 72 28 76 Q 28 72 24 72 Q 28 72 28 68 Z" fill="#FF5D8F" opacity="0.8" />
        </g>
      </svg>
    </div>
  );
}
