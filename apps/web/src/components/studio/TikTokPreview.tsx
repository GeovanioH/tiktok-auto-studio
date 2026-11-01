import { useState, useEffect, useRef } from "react";
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Music, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Volume2, 
  VolumeX, 
  Grid3X3,
  Sparkles
} from "lucide-react";

export type SubtitleStyle = "HORMOZI" | "SUBMAGIC" | "CYBER" | "MINIMAL";

export interface TikTokPreviewProps {
  mediaType: "VIDEO" | "PHOTO";
  mediaUrls: string[];
  caption: string;
  accountHandle?: string;
  isAigc?: boolean;
  subtitleStyle?: SubtitleStyle;
  onSubtitleStyleChange?: (style: SubtitleStyle) => void;
}

export function TikTokPreview({
  mediaType,
  mediaUrls,
  caption,
  accountHandle = "@studio_ia_pro",
  isAigc = true,
  subtitleStyle: externalSubtitleStyle,
  onSubtitleStyleChange,
}: TikTokPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showSafeArea, setShowSafeArea] = useState(false);
  const [progress, setProgress] = useState(24);
  const [localSubtitleStyle, setLocalSubtitleStyle] = useState<SubtitleStyle>("HORMOZI");
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeSubtitleStyle = externalSubtitleStyle || localSubtitleStyle;

  const handleStyleChange = (style: SubtitleStyle) => {
    setLocalSubtitleStyle(style);
    if (onSubtitleStyleChange) {
      onSubtitleStyleChange(style);
    }
  };

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 2));
    }, 250);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
    }
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : mediaUrls.length - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev < mediaUrls.length - 1 ? prev + 1 : 0));
  };

  const words = caption
    ? caption.replace(/[#@][\w]+/g, "").trim().split(" ").filter(Boolean).slice(0, 5)
    : ["NE", "COMMENCEZ", "JAMAIS", "VOTRE", "VIDÉO"];

  return (
    <div className="flex flex-col items-center space-y-4 w-full">
      {/* Top Station Header & Subtitle Engine Switch Bar (Stitch Spec) */}
      <div className="w-full max-w-[390px] flex items-center justify-between gap-2 px-1">
        {/* Toggle Safe Area Button */}
        <button
          type="button"
          onClick={() => setShowSafeArea(!showSafeArea)}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all ${
            showSafeArea
              ? "bg-primary-container text-on-primary-container border-primary-container shadow-md"
              : "bg-surface-container text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high border-surface-container-highest"
          }`}
          title="Afficher le contour Safe-Area officiel TikTok"
        >
          <Grid3X3 className="w-3.5 h-3.5" />
          <span>Safe Area</span>
          <span className={`w-1.5 h-1.5 rounded-full ${showSafeArea ? "bg-white" : "bg-tertiary"}`} />
        </button>

        {/* 4 Engine Switcher Pills */}
        <div className="flex items-center gap-1 bg-surface-container p-1 rounded-lg border border-surface-container-highest">
          {[
            { id: "HORMOZI", label: "⚡ Fluo", color: "text-tertiary" },
            { id: "SUBMAGIC", label: "🟢 Glow", color: "text-secondary" },
            { id: "CYBER", label: "🟣 Cyber", color: "text-primary-container" },
            { id: "MINIMAL", label: "⚪ Sans", color: "text-on-surface" },
          ].map((engine) => (
            <button
              key={engine.id}
              type="button"
              onClick={() => handleStyleChange(engine.id as SubtitleStyle)}
              className={`px-2 py-0.5 rounded text-[11px] font-bold font-mono transition-all ${
                activeSubtitleStyle === engine.id
                  ? "bg-surface-container-highest text-on-surface shadow-xs ring-1 ring-secondary-fixed/30"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <span className={engine.color}>{engine.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Titanium Physical Phone Chassis (iPhone 15 Pro Stitch Design) */}
      <div
        data-testid="tiktok-preview"
        onClick={togglePlay}
        className="relative mx-auto w-[330px] h-[660px] sm:w-[370px] sm:h-[740px] bg-[#1a191d] rounded-[52px] p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_40px_rgba(255,81,104,0.12)] ring-1 ring-white/10 transition-all duration-500 ease-out select-none cursor-pointer group"
      >
        {/* Brushed Natural Titanium Bezel Layer */}
        <div className="w-full h-full bg-[#0d0d0f] rounded-[44px] p-[6px] relative overflow-hidden flex flex-col justify-between">
          {/* OLED Screen Area */}
          <div className="relative w-full h-full bg-surface-container-lowest rounded-[38px] overflow-hidden flex flex-col justify-between select-none">
            
            {/* Dynamic Island with IA Live */}
            <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 w-28 h-7 bg-black rounded-full flex items-center justify-between px-3 shadow-md pointer-events-none">
              <div className="w-2.5 h-2.5 rounded-full bg-[#1b263b] flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-[#415a77]"></div>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-pulse"></span>
                <span className="font-mono text-[9px] text-white font-bold tracking-tight">IA Live</span>
              </div>
            </div>

            {/* Subtle Play Overlay when paused */}
            <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
              {!isPlaying && (
                <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl animate-in zoom-in-75 duration-200">
                  <Play className="w-8 h-8 ml-1 text-white fill-white" />
                </div>
              )}
            </div>

            {/* Media Canvas Stack */}
            <div className="absolute inset-0 w-full h-full overflow-hidden bg-surface-container-lowest">
              {mediaType === "VIDEO" ? (
                mediaUrls[0] ? (
                  <video
                    ref={videoRef}
                    src={mediaUrls[0]}
                    className="w-full h-full object-cover"
                    controls={false}
                    autoPlay
                    loop
                    muted={isMuted}
                    playsInline
                  />
                ) : (
                  <div className="w-full h-full bg-surface-container-low flex flex-col items-center justify-center text-on-surface-variant gap-2">
                    <span className="material-symbols-outlined text-[48px] text-primary-container">videocam</span>
                    <p className="text-xs font-mono">Vidéo 9:16 Ultra-HD</p>
                  </div>
                )
              ) : (
                <div className="relative w-full h-full">
                  {mediaUrls[currentSlide] ? (
                    <img
                      src={mediaUrls[currentSlide]}
                      alt={`Slide ${currentSlide + 1}`}
                      className="w-full h-full object-cover transition-opacity duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-surface-container-low flex flex-col items-center justify-center text-on-surface-variant gap-2">
                      <span className="material-symbols-outlined text-[48px] text-secondary">view_carousel</span>
                      <p className="text-xs font-mono">Carrousel 9:16 Photo</p>
                    </div>
                  )}

                  {mediaUrls.length > 1 && (
                    <>
                      <div className="absolute top-12 right-4 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] text-white font-mono font-bold border border-white/10 z-25">
                        {currentSlide + 1}/{mediaUrls.length}
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          prevSlide();
                        }}
                        className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition z-25 backdrop-blur-sm"
                        aria-label="Diapositive précédente"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          nextSlide();
                        }}
                        className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition z-25 backdrop-blur-sm"
                        aria-label="Diapositive suivante"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                    </>
                  )}
                </div>
              )}

              {/* Gradient Scrim to ensure readable overlays */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none" />
            </div>

            {/* AIGC Official Badge */}
            {isAigc && (
              <div
                data-testid="aigc-badge"
                className="absolute top-12 left-4 flex items-center gap-1.5 bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 z-25 pointer-events-none"
              >
                <Sparkles className="w-3 h-3 text-secondary-fixed" />
                <span className="text-[10px] text-white font-semibold">Généré par IA</span>
              </div>
            )}

            {/* Mute Control */}
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMuted(!isMuted);
              }}
              className="absolute top-12 right-4 z-25 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white hover:bg-black/80 transition"
              aria-label={isMuted ? "Activer le son" : "Couper le son"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-primary" /> : <Volume2 className="w-4 h-4 text-secondary-fixed" />}
            </button>

            {/* SAFE AREA TIKTOK OVERLAY (Exact Stitch Reproduction) */}
            {showSafeArea && (
              <div className="absolute inset-0 z-35 pointer-events-none flex flex-col justify-between border-2 border-dashed border-secondary/60 animate-in fade-in">
                {/* Zone Haute: Header Danger Area */}
                <div className="w-full pt-10 pb-3 px-4 bg-error-container/25 backdrop-blur-[2px] flex flex-col items-center border-b border-error/40">
                  <div className="flex items-center justify-between w-full text-white/90 text-xs">
                    <span className="material-symbols-outlined text-[18px]">live_tv</span>
                    <div className="flex gap-3 font-headline text-[12px] font-bold">
                      <span className="text-white/60">Suivis</span>
                      <span className="text-white border-b-2 border-white pb-0.5">Pour toi</span>
                    </div>
                    <span className="material-symbols-outlined text-[18px]">search</span>
                  </div>
                  <span className="mt-1 font-mono text-[9px] text-error bg-black/80 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">
                    ⚠️ Zone Danger Header (Tabs / Search)
                  </span>
                </div>

                {/* Zone Centrale: Safe Area Retenue */}
                <div className="relative flex-1 flex items-center justify-center p-3">
                  <div className="w-full h-full border-2 border-dashed border-secondary-fixed/50 rounded-2xl flex flex-col items-center justify-center bg-secondary-fixed/5 p-2 text-center">
                    <span className="px-2 py-0.5 rounded bg-secondary-fixed/20 text-secondary-fixed font-mono text-[10px] font-bold uppercase tracking-wider">
                      ✓ Safe Zone Utile (100% Visible)
                    </span>
                    <span className="text-[10px] text-white/80 font-body mt-1 max-w-[190px]">
                      Placez visuels clés et kinetic typography ici.
                    </span>
                  </div>
                </div>

                {/* Zone Basse: Caption Danger Area */}
                <div className="w-full pb-8 pt-2.5 px-4 bg-error-container/25 backdrop-blur-[2px] border-t border-error/40 flex flex-col gap-1">
                  <span className="font-mono text-[9px] text-error bg-black/80 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider self-start">
                    ⚠️ Zone Danger Caption & Nav
                  </span>
                </div>
              </div>
            )}

            {/* SUBTITLES KARAOKE LAYER (Centered dynamically) */}
            <div className="absolute left-5 right-5 top-[58%] -translate-y-1/2 z-30 pointer-events-none transition-all duration-200">
              {activeSubtitleStyle === "HORMOZI" && (
                <div className="text-center font-headline tracking-tight uppercase leading-tight font-extrabold text-tertiary-fixed drop-shadow-[0_4px_12px_rgba(0,0,0,0.95)]">
                  <span className="bg-black/85 px-2.5 py-1 rounded text-white mr-1 shadow-sm text-sm">
                    {words[0] || "NE COMMENCEZ"}
                  </span>
                  <span className="bg-tertiary text-black px-2.5 py-1 rounded mr-1 font-black shadow-lg text-sm">
                    {words[1] || "JAMAIS"}
                  </span>
                  <span className="bg-black/85 px-2.5 py-1 rounded text-white text-sm">
                    {words.slice(2).join(" ") || "VOTRE VIDÉO !"}
                  </span>
                </div>
              )}

              {activeSubtitleStyle === "SUBMAGIC" && (
                <div className="bg-emerald-950/85 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-secondary-fixed/50 shadow-2xl text-center">
                  <p className="text-xs font-black tracking-wider uppercase text-secondary drop-shadow-[0_0_12px_rgba(53,251,245,0.8)]">
                    <span className="text-white underline decoration-secondary-fixed decoration-2 mr-1">
                      {words[0] || "DÉCOUVREZ"}
                    </span>
                    <span className="text-secondary-fixed font-extrabold">
                      {words.slice(1).join(" ") || "L'ASTUCE VIRALE"}
                    </span>
                  </p>
                </div>
              )}

              {activeSubtitleStyle === "CYBER" && (
                <div className="bg-black/90 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-primary-container/60 shadow-2xl text-center">
                  <p className="text-xs font-black tracking-wide uppercase">
                    <span className="text-primary-container drop-shadow-[0_0_8px_rgba(255,81,104,0.8)] mr-1">
                      {words.slice(0, 2).join(" ") || "FOCUS IA"}
                    </span>
                    <span className="text-secondary-fixed drop-shadow-[0_0_8px_rgba(53,251,245,0.8)]">
                      {words.slice(2).join(" ") || "3-CLIC SYNTH"}
                    </span>
                  </p>
                </div>
              )}

              {activeSubtitleStyle === "MINIMAL" && (
                <div className="bg-surface-container-lowest/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-center">
                  <p className="text-xs font-medium text-white/95">
                    {caption ? caption.slice(0, 50) + "..." : "Sous-titrage haute-fidélité en cours..."}
                  </p>
                </div>
              )}
            </div>

            {/* Right Engagement Actions Bar */}
            <div
              data-testid="tiktok-actions-bar"
              className="absolute right-2.5 bottom-16 flex flex-col items-center gap-3 text-white z-25 pointer-events-none"
            >
              <div className="relative mb-1">
                <div className="w-10 h-10 rounded-full border-2 border-white bg-primary-container flex items-center justify-center text-on-primary-container font-mono text-xs font-bold shadow-md">
                  TT
                </div>
                <span className="w-4 h-4 rounded-full bg-primary-container text-white flex items-center justify-center text-[10px] -mt-2 font-bold shadow">
                  +
                </span>
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <div className="w-9 h-9 rounded-full bg-surface-container-lowest/70 backdrop-blur-sm flex items-center justify-center">
                  <Heart className="w-5 h-5 text-white fill-white/10" />
                </div>
                <span className="font-mono text-[10px] text-white font-bold">148.2K</span>
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <div className="w-9 h-9 rounded-full bg-surface-container-lowest/70 backdrop-blur-sm flex items-center justify-center">
                  <MessageCircle className="w-5 h-5 text-white" />
                </div>
                <span className="font-mono text-[10px] text-white font-bold">1,892</span>
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <div className="w-9 h-9 rounded-full bg-surface-container-lowest/70 backdrop-blur-sm flex items-center justify-center">
                  <Bookmark className="w-5 h-5 text-white" />
                </div>
                <span className="font-mono text-[10px] text-white font-bold">34.6K</span>
              </div>

              <div className="flex flex-col items-center gap-0.5">
                <div className="w-9 h-9 rounded-full bg-surface-container-lowest/70 backdrop-blur-sm flex items-center justify-center">
                  <Share2 className="w-5 h-5 text-white" />
                </div>
                <span className="font-mono text-[10px] text-white font-bold">12.1K</span>
              </div>

              {/* Spinning Sound Disc */}
              <div className="w-8 h-8 rounded-full bg-surface-container-highest animate-spin flex items-center justify-center ring-2 ring-white/50" style={{ animationDuration: '4s' }}>
                <Music className="w-3.5 h-3.5 text-secondary-fixed" />
              </div>
            </div>

            {/* Bottom Caption & Handle Overlay */}
            <div
              data-testid="tiktok-bottom-overlay"
              className="absolute left-3 right-16 bottom-4 text-white z-25 pointer-events-none space-y-1"
            >
              <div className="flex items-center gap-1.5 font-headline text-xs font-bold drop-shadow">
                <span>{accountHandle}</span>
                <span className="w-3.5 h-3.5 rounded-full bg-secondary-fixed text-black flex items-center justify-center text-[8px] font-black">
                  ✓
                </span>
              </div>
              <p className="text-[11px] text-white/90 line-clamp-2 drop-shadow leading-snug font-body">
                {caption || "Légende générée par TikTok Auto Studio..."}
              </p>
              <div className="flex items-center gap-1.5 text-[10px] text-white/80 pt-0.5 font-mono">
                <span className="material-symbols-outlined text-[12px] text-secondary-fixed">graphic_eq</span>
                <span className="truncate">Son original - IA Growth Masterclass</span>
              </div>
            </div>

            {/* Scrubber Progress Bar */}
            <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-30">
              <div
                className="h-full bg-white transition-all duration-200"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Cyber Player Remote beneath the iPhone (Stitch Spec) */}
      <div className="w-full max-w-[370px] bg-surface-container-low p-3 rounded-xl border border-surface-container-highest shadow-md flex flex-col gap-1.5">
        <div className="flex items-center justify-between font-mono text-[11px] text-on-surface-variant">
          <span className="text-secondary-fixed font-bold">00:02.45</span>
          <span className="text-on-surface">Durée totale : 00:28.10</span>
        </div>
        <div className="relative w-full h-2 bg-surface-container-highest rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-primary-container via-secondary-container to-secondary-fixed rounded-full transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
