import { type RefObject } from "react";
import { 
  Play, 
  Sparkles, 
  Volume2, 
  VolumeX, 
  ChevronLeft, 
  ChevronRight,
  Heart,
  MessageCircle,
  Bookmark,
  Share2,
  Music,
  Radio,
  Search
} from "lucide-react";
import { BrandLogo } from "../ui/BrandLogo";
import { type DeviceSpec } from "./DeviceDefinitions";

export type SubtitleStyle = "HORMOZI" | "SUBMAGIC" | "CYBER" | "MINIMAL";

interface TikTokScreenContentProps {
  device: DeviceSpec;
  mode: "VIDEO" | "CAROUSEL";
  isPlaying: boolean;
  isMuted: boolean;
  onToggleMute?: () => void;
  progress: number;
  currentSlide: number;
  onPrevSlide?: () => void;
  onNextSlide?: () => void;
  carouselSlides: Array<{ label: string; category: string; subtitle: string; url: string }>;
  videoRef?: RefObject<HTMLVideoElement>;
  caption: string;
  subtitlePosY: number;
  activeEngine: SubtitleStyle;
  showSafeArea: boolean;
  isAigcDeclared: boolean;
  compactUi?: boolean;
}

export function TikTokScreenContent({
  device,
  mode,
  isPlaying,
  isMuted,
  onToggleMute,
  progress,
  currentSlide,
  onPrevSlide,
  onNextSlide,
  carouselSlides,
  videoRef,
  caption,
  subtitlePosY,
  activeEngine,
  showSafeArea,
  isAigcDeclared,
  compactUi = false,
}: TikTokScreenContentProps) {
  const words = caption
    ? caption.replace(/[#@][\w]+/g, "").trim().split(" ").filter(Boolean).slice(0, 5)
    : ["NE", "COMMENCEZ", "JAMAIS", "VOTRE", "VIDÉO"];

  return (
    <div
      data-testid="tiktok-preview"
      className="relative w-full h-full bg-surface-container-lowest overflow-hidden flex flex-col justify-between select-none"
      style={{
        borderRadius: compactUi ? 24 : device.screenRadius,
      }}
    >
      {/* 1. NOTCH / PERFORATION HARDWARE SELON L'APPAREIL */}
      {device.notchType === "dynamic-island" && (
        <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 w-28 h-7 bg-black rounded-full flex items-center justify-between px-3 shadow-md pointer-events-none ring-1 ring-white/10">
          <div className="w-2.5 h-2.5 rounded-full bg-[#1b263b] flex items-center justify-center">
            <div className="w-1 h-1 rounded-full bg-[#415a77]" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-pulse" />
            <span className="font-mono text-[9px] text-white font-bold">TikTok Studio</span>
          </div>
        </div>
      )}

      {device.notchType === "punch-hole" && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-50 w-3.5 h-3.5 bg-black rounded-full flex items-center justify-center shadow-inner pointer-events-none ring-1 ring-white/20">
          <div className="w-1.5 h-1.5 rounded-full bg-[#10141e]" />
        </div>
      )}

      {device.notchType === "teardrop" && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 z-50 w-6 h-3 bg-black rounded-b-full flex items-center justify-center pointer-events-none">
          <div className="w-2 h-2 rounded-full bg-[#1b263b]" />
        </div>
      )}

      {/* 2. MEDIA LAYER (VIDEO OU CARROUSEL) */}
      <div className="absolute inset-0 w-full h-full overflow-hidden bg-surface-container-lowest">
        {mode === "VIDEO" ? (
          <video
            ref={videoRef}
            src="https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"
            className="w-full h-full object-cover"
            controls={false}
            autoPlay
            loop
            muted={isMuted}
            playsInline
          />
        ) : (
          <div className="relative w-full h-full">
            <img
              src={carouselSlides[currentSlide]?.url || carouselSlides[0].url}
              alt="Slide"
              className="w-full h-full object-cover transition-opacity duration-300"
            />
            <div className="absolute top-12 right-4 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] text-white font-mono font-bold border border-white/10 z-25">
              {currentSlide + 1}/{carouselSlides.length}
            </div>
            {onPrevSlide && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onPrevSlide();
                }}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition z-25"
                aria-label="Slide précédente"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            )}
            {onNextSlide && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onNextSlide();
                }}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition z-25"
                aria-label="Slide suivante"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none" />
      </div>

      {/* 3. PLAY/PAUSE OVERLAY */}
      <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
        {!isPlaying && (
          <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl animate-in zoom-in-75 duration-200">
            <Play className="w-8 h-8 ml-1 text-white fill-white" />
          </div>
        )}
      </div>

      {/* 4. AIGC BADGE OFFICIEL BROWSER/API */}
      {isAigcDeclared && (
        <div
          data-testid="aigc-badge"
          className="absolute top-12 left-3 sm:left-4 flex items-center gap-1.5 bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 z-25 pointer-events-none"
        >
          <Sparkles className="w-3 h-3 text-secondary-fixed" />
          <span className="text-[10px] text-white font-semibold">Généré par IA</span>
        </div>
      )}

      {/* 5. BOUTON MUTE */}
      {onToggleMute && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onToggleMute();
          }}
          className="absolute top-12 right-3 sm:right-4 z-25 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white hover:bg-black/80 transition"
          aria-label={isMuted ? "Activer le son" : "Couper le son"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-primary" /> : <Volume2 className="w-4 h-4 text-secondary-fixed" />}
        </button>
      )}

      {/* 6. COUCHE SOUS-TITRES DYNAMIQUE KARAOKÉ POSITIONNABLE */}
      <div
        style={{ top: `${subtitlePosY}%` }}
        className="absolute left-4 right-4 -translate-y-1/2 z-30 pointer-events-none transition-all duration-200"
      >
        {activeEngine === "HORMOZI" && (
          <div className="text-center font-headline tracking-tight uppercase leading-tight font-extrabold text-tertiary-fixed drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
            <span className="bg-black/85 px-2.5 py-1 rounded text-white mr-1 shadow-sm text-xs sm:text-sm">
              {words[0] || "NE COMMENCEZ"}
            </span>
            <span className="bg-tertiary text-black px-2.5 py-1 rounded mr-1 font-black shadow-lg text-xs sm:text-sm">
              {words[1] || "JAMAIS"}
            </span>
            <span className="bg-black/85 px-2.5 py-1 rounded text-white text-xs sm:text-sm">
              {words.slice(2).join(" ") || "VOTRE VIDÉO !"}
            </span>
          </div>
        )}

        {activeEngine === "SUBMAGIC" && (
          <div className="bg-emerald-950/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-secondary-fixed/50 shadow-2xl text-center">
            <p className="text-[11px] sm:text-xs font-black tracking-wider uppercase text-secondary drop-shadow-[0_0_12px_rgba(53,251,245,0.8)]">
              <span className="text-white underline decoration-secondary-fixed decoration-2 mr-1">
                {words[0] || "DÉCOUVREZ"}
              </span>
              <span className="text-secondary-fixed font-extrabold">
                {words.slice(1).join(" ") || "L'ASTUCE VIRALE"}
              </span>
            </p>
          </div>
        )}

        {activeEngine === "CYBER" && (
          <div className="bg-black/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-primary-container/60 shadow-2xl text-center">
            <p className="text-[11px] sm:text-xs font-black tracking-wide uppercase">
              <span className="text-primary-container drop-shadow-[0_0_8px_rgba(255,81,104,0.8)] mr-1">
                {words.slice(0, 2).join(" ") || "FOCUS IA"}
              </span>
              <span className="text-secondary-fixed drop-shadow-[0_0_8px_rgba(53,251,245,0.8)]">
                {words.slice(2).join(" ") || "3-CLIC SYNTH"}
              </span>
            </p>
          </div>
        )}

        {activeEngine === "MINIMAL" && (
          <div className="bg-surface-container-lowest/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10 text-center">
            <p className="text-[11px] sm:text-xs font-medium text-white/95 truncate">
              {caption ? caption.slice(0, 50) + "..." : "Sous-titrage haute-fidélité en cours..."}
            </p>
          </div>
        )}
      </div>

      {/* 7. SAFE AREA RADAR TIKTOK SPÉCIFIQUE À LA TAILLE DE L'APPAREIL */}
      {showSafeArea && (
        <div className="absolute inset-0 z-35 pointer-events-none flex flex-col justify-between border-2 border-dashed border-secondary/60 animate-in fade-in">
          {/* Danger Top */}
          <div
            style={{ height: `${device.topDangerHeight}px` }}
            className="w-full pt-10 px-3 bg-error-container/25 backdrop-blur-[2px] flex flex-col items-center justify-between border-b border-error/40"
          >
            <div className="flex items-center justify-between w-full text-white/90 text-xs">
              <Radio className="w-4 h-4 text-white/80" />
              <div className="flex gap-3 font-headline text-[11px] sm:text-[12px] font-bold">
                <span className="text-white/60">Suivis</span>
                <span className="text-white border-b-2 border-white pb-0.5">Pour toi</span>
              </div>
              <Search className="w-4 h-4 text-white/80" />
            </div>
            <span className="font-mono text-[8px] sm:text-[9px] text-error bg-black/80 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider mb-1">
              ⚠️ Danger Header ({device.name})
            </span>
          </div>

          {/* Safe Center */}
          <div className="relative flex-1 flex items-center justify-center p-2.5">
            <div className="w-full h-full border-2 border-dashed border-secondary-fixed/50 rounded-2xl flex flex-col items-center justify-center bg-secondary-fixed/5 p-2 text-center">
              <span className="px-2 py-0.5 rounded bg-secondary-fixed/20 text-secondary-fixed font-mono text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">
                ✓ Safe Zone 100% Visible
              </span>
            </div>
          </div>

          {/* Danger Bottom */}
          <div
            style={{ height: `${device.bottomDangerHeight}px` }}
            className="w-full pt-2 px-3 bg-error-container/25 backdrop-blur-[2px] border-t border-error/40 flex flex-col justify-start"
          >
            <span className="font-mono text-[8px] sm:text-[9px] text-error bg-black/80 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider self-start">
              ⚠️ Danger Caption & Nav ({Math.round((device.bottomDangerHeight / device.height) * 100)}% de l'écran)
            </span>
          </div>
        </div>
      )}

      {/* 8. ACTIONS LATÉRALES TIKTOK OFFICIELLES (LIKE, COMMENT, SHARE, DISC) */}
      <div
        data-testid="tiktok-actions-bar"
        className="absolute right-2.5 bottom-16 flex flex-col items-center gap-2.5 sm:gap-3 text-white z-25 pointer-events-none"
      >
        <div className="relative mb-0.5">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-surface-container-highest flex items-center justify-center shadow-md overflow-hidden">
            <BrandLogo size={36} className="w-full h-full" withGlow={false} />
          </div>
          <span className="w-4 h-4 rounded-full bg-primary-container text-white flex items-center justify-center text-[10px] -mt-2 font-bold shadow mx-auto">
            +
          </span>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-container-lowest/70 backdrop-blur-sm flex items-center justify-center">
            <Heart className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-white/20" />
          </div>
          <span className="font-mono text-[9px] sm:text-[10px] text-white font-bold">148.2K</span>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-container-lowest/70 backdrop-blur-sm flex items-center justify-center">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="font-mono text-[9px] sm:text-[10px] text-white font-bold">1,892</span>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-container-lowest/70 backdrop-blur-sm flex items-center justify-center">
            <Bookmark className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="font-mono text-[9px] sm:text-[10px] text-white font-bold">34.6K</span>
        </div>

        <div className="flex flex-col items-center gap-0.5">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-surface-container-lowest/70 backdrop-blur-sm flex items-center justify-center">
            <Share2 className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          </div>
          <span className="font-mono text-[9px] sm:text-[10px] text-white font-bold">12.1K</span>
        </div>

        <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-surface-container-highest animate-spin flex items-center justify-center ring-2 ring-white/50">
          <Music className="w-3.5 h-3.5 text-secondary-fixed" />
        </div>
      </div>

      {/* 9. LÉGENDE INFÉRIEURE ET BANDE SON */}
      <div
        data-testid="tiktok-bottom-overlay"
        className="absolute left-3 right-14 sm:right-16 bottom-4 text-white z-25 pointer-events-none space-y-1"
      >
        <div className="flex items-center gap-1.5 font-headline text-xs font-bold drop-shadow">
          <span>@aistudio.pro</span>
          <span className="w-3.5 h-3.5 rounded-full bg-secondary-fixed text-black flex items-center justify-center text-[8px] font-black">
            ✓
          </span>
        </div>
        <p className="text-[10px] sm:text-[11px] text-white/90 line-clamp-2 drop-shadow leading-snug font-body">
          {caption}
        </p>
        <div className="flex items-center gap-1.5 text-[9px] sm:text-[10px] text-white/80 pt-0.5 font-mono">
          <Music className="w-3 h-3 text-secondary-fixed flex-shrink-0" />
          <span className="truncate">Son original - IA Growth Masterclass 2026</span>
        </div>
      </div>

      {/* 10. TIMELINE SCRUBBER */}
      <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-30">
        <div className="h-full bg-white transition-all duration-200" style={{ width: `${progress}%` }} />
      </div>
    </div>
  );
}
