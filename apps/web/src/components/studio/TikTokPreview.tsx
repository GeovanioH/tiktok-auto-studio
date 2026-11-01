import { useState, useEffect, useRef } from "react";
import { 
  Heart, 
  MessageCircle, 
  Bookmark, 
  Share2, 
  Music, 
  CheckCircle2, 
  ChevronLeft, 
  ChevronRight, 
  Play, 
  Volume2, 
  VolumeX, 
  ShieldAlert
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
  accountHandle = "@mon_compte",
  isAigc = true,
  subtitleStyle: externalSubtitleStyle,
  onSubtitleStyleChange,
}: TikTokPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [showSafeArea, setShowSafeArea] = useState(false);
  const [progress, setProgress] = useState(30);
  const [localSubtitleStyle, setLocalSubtitleStyle] = useState<SubtitleStyle>("HORMOZI");
  const videoRef = useRef<HTMLVideoElement>(null);

  const activeSubtitleStyle = externalSubtitleStyle || localSubtitleStyle;

  const handleStyleChange = (style: SubtitleStyle) => {
    setLocalSubtitleStyle(style);
    if (onSubtitleStyleChange) {
      onSubtitleStyleChange(style);
    }
  };

  // Simulation de progression temporelle
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

  // Mots du hook pour le sous-titrage karaoké
  const words = caption ? caption.split(" ").slice(0, 5) : ["3", "ERREURS", "DE", "PRODUCTIVITÉ", "FATALES"];

  return (
    <div className="flex flex-col items-center space-y-3 w-full">
      {/* Barre d'outils Pro au-dessus du Mockup */}
      <div className="w-full max-w-[360px] flex items-center justify-between px-1 text-xs">
        {/* Toggle Safe Area TikTok */}
        <button
          type="button"
          onClick={() => setShowSafeArea(!showSafeArea)}
          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition ${
            showSafeArea
              ? "bg-cyan-950/80 border-cyan-400 text-cyan-300 shadow-sm shadow-cyan-950/50"
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
          title="Vérifier que les éléments textuels ne sont pas masqués par l'interface TikTok"
        >
          <ShieldAlert className={`w-3.5 h-3.5 ${showSafeArea ? "text-cyan-400" : "text-zinc-400"}`} />
          <span>{showSafeArea ? "Safe Area Active" : "Afficher Safe Area"}</span>
        </button>

        {/* Sélecteur de style de sous-titre */}
        <div className="flex items-center gap-1 bg-zinc-900/90 border border-zinc-800/80 p-0.5 rounded-lg">
          {(["HORMOZI", "SUBMAGIC", "CYBER", "MINIMAL"] as SubtitleStyle[]).map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => handleStyleChange(s)}
              className={`px-2 py-0.5 rounded-md text-[10px] font-bold transition ${
                activeSubtitleStyle === s
                  ? "bg-zinc-800 text-white shadow-xs"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {s === "HORMOZI" ? "⚡ Fluo" : s === "SUBMAGIC" ? "🟢 Glow" : s === "CYBER" ? "🟣 Neon" : "⚪ Clean"}
            </button>
          ))}
        </div>
      </div>

      {/* Le Smartphone iPhone 15 Pro */}
      <div
        data-testid="tiktok-preview"
        onClick={togglePlay}
        className="relative mx-auto w-[320px] h-[568px] sm:w-[360px] sm:h-[640px] bg-black rounded-[44px] border-[8px] border-zinc-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden select-none transition-all duration-300 hover:border-zinc-700 cursor-pointer group"
      >
        {/* Dynamic Island / Capteur Caméra */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-950 rounded-full z-40 border border-zinc-800/60 pointer-events-none flex items-center justify-end pr-2.5">
          <span className="w-2 h-2 rounded-full bg-zinc-900 border border-zinc-700/80"></span>
        </div>

        {/* Bouton de Play/Pause discret au survol */}
        <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
          {!isPlaying && (
            <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl animate-in zoom-in-75 duration-200">
              <Play className="w-8 h-8 ml-1 text-white fill-white" />
            </div>
          )}
        </div>

        {/* Reflet de Verre Diagonal (Glass Glare Awwwards) */}
        <div className="pointer-events-none absolute inset-0 z-20 glass-glare opacity-70" />

        {/* Safe Area TikTok Visual Overlay (si activé) */}
        {showSafeArea && (
          <div className="absolute inset-0 z-35 pointer-events-none border-2 border-dashed border-cyan-400/60 animate-in fade-in">
            {/* Top exclusion (Recherche / FYP / Suivis) */}
            <div className="absolute top-0 inset-x-0 h-14 bg-rose-500/15 border-b border-rose-500/40 flex items-center justify-center">
              <span className="text-[9px] font-mono font-bold text-rose-300 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded">
                Zone Masquée (Header TikTok)
              </span>
            </div>

            {/* Right exclusion (Engagement Buttons) */}
            <div className="absolute top-14 bottom-24 right-0 w-16 bg-rose-500/15 border-l border-rose-500/40 flex items-center justify-center">
              <span className="text-[8px] font-mono font-bold text-rose-300 uppercase tracking-widest bg-black/60 px-1 py-1 rounded -rotate-90 whitespace-nowrap">
                Boutons Likes/Comms
              </span>
            </div>

            {/* Bottom exclusion (Caption / Sound) */}
            <div className="absolute bottom-0 inset-x-0 h-24 bg-rose-500/15 border-t border-rose-500/40 flex items-center justify-center">
              <span className="text-[9px] font-mono font-bold text-rose-300 uppercase tracking-widest bg-black/60 px-2 py-0.5 rounded">
                Zone Masquée (Légende & Son)
              </span>
            </div>

            {/* Zone de sécurité centrale (100% visible) */}
            <div className="absolute top-16 bottom-28 left-4 right-18 border border-emerald-400/80 rounded-lg flex items-start justify-center pt-2">
              <span className="text-[9px] font-bold text-emerald-300 bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                ✓ Safe Area Optimale (Hook & Karaoké)
              </span>
            </div>
          </div>
        )}

        {/* Contenu Média Principal */}
        <div className="absolute inset-0 w-full h-full">
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
              <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-600">
                <span className="text-4xl mb-2">🎬</span>
                <p className="text-xs">Aperçu Vidéo 9:16</p>
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
                <div className="w-full h-full bg-zinc-900 flex flex-col items-center justify-center text-zinc-600">
                  <span className="text-4xl mb-2">📸</span>
                  <p className="text-xs">Aperçu Carrousel Photo</p>
                </div>
              )}

              {mediaUrls.length > 1 && (
                <>
                  <div className="absolute top-4 right-4 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full text-xs text-white font-mono font-bold border border-white/10 z-25">
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
        </div>

        {/* Tag Légal AIGC (Transparence IA ByteDance) */}
        {isAigc && (
          <div
            data-testid="aigc-badge"
            className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 z-25"
          >
            <CheckCircle2 className="w-3 h-3 text-cyan-400" />
            <span className="text-[10px] text-white font-semibold">Généré par IA</span>
          </div>
        )}

        {/* Contrôle Mute / Unmute */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsMuted(!isMuted);
          }}
          className="absolute top-4 right-4 z-25 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white hover:bg-black/80 transition"
          aria-label={isMuted ? "Activer le son" : "Couper le son"}
        >
          {isMuted ? <VolumeX className="w-4 h-4 text-rose-400" /> : <Volume2 className="w-4 h-4 text-cyan-400" />}
        </button>

        {/* Barre d'Action Latérale Droite (Safe Area TikTok) */}
        <div
          data-testid="tiktok-actions-bar"
          className="absolute right-3 bottom-20 flex flex-col items-center gap-3.5 text-white z-25 pointer-events-none"
        >
          {/* Avatar créateur avec badge follow */}
          <div className="relative mb-1">
            <div className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-tr from-pink-500 to-cyan-400 flex items-center justify-center text-white text-xs font-black shadow-lg">
              TT
            </div>
            <span className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-pink-500 text-white flex items-center justify-center text-[10px] font-bold shadow">
              +
            </span>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <div className="w-9 h-9 rounded-full bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center">
              <Heart className="w-5 h-5 text-white fill-white/10" />
            </div>
            <span className="text-[10px] font-semibold drop-shadow">18.2K</span>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <div className="w-9 h-9 rounded-full bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center">
              <MessageCircle className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-semibold drop-shadow">489</span>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <div className="w-9 h-9 rounded-full bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center">
              <Bookmark className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-semibold drop-shadow">2.1K</span>
          </div>

          <div className="flex flex-col items-center gap-0.5">
            <div className="w-9 h-9 rounded-full bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center">
              <Share2 className="w-5 h-5 text-white" />
            </div>
            <span className="text-[10px] font-semibold drop-shadow">630</span>
          </div>

          {/* Disque Vinyle Rotatif TikTok */}
          <div className="w-9 h-9 rounded-full bg-zinc-950 border-2 border-zinc-700/80 flex items-center justify-center animate-spin" style={{ animationDuration: '4s' }}>
            <Music className="w-3.5 h-3.5 text-cyan-400" />
          </div>
        </div>

        {/* Sous-titres Karaoké Dynamiques (Styles Modulables) */}
        <div className="absolute inset-x-4 top-[50%] -translate-y-1/2 flex items-center justify-center z-25 pointer-events-none">
          {activeSubtitleStyle === "HORMOZI" && (
            <div className="bg-black/85 backdrop-blur-md px-4 py-2 rounded-2xl border border-yellow-400/40 shadow-2xl text-center transform scale-105">
              <p className="text-sm font-black tracking-wider uppercase drop-shadow-[0_2px_8px_rgba(0,0,0,1)]">
                <span className="bg-yellow-400 text-black px-2 py-0.5 rounded-md font-black mr-1.5 shadow">
                  ⚡ {words[0] || "ATTENTION"}
                </span>
                <span className="text-white drop-shadow">
                  {words.slice(1).join(" ") || "LE SECRET VIRAL"}
                </span>
              </p>
            </div>
          )}

          {activeSubtitleStyle === "SUBMAGIC" && (
            <div className="bg-emerald-950/80 backdrop-blur-md px-4 py-2 rounded-2xl border border-emerald-400/50 shadow-2xl text-center">
              <p className="text-sm font-black tracking-wider uppercase text-emerald-300 drop-shadow-[0_0_12px_rgba(16,185,129,0.8)]">
                <span className="text-white underline decoration-emerald-400 decoration-2 mr-1">
                  {words[0] || "DÉCOUVREZ"}
                </span>
                <span className="text-emerald-300 font-extrabold">
                  {words.slice(1).join(" ") || "L'ASTUCE SECRÈTE"}
                </span>
              </p>
            </div>
          )}

          {activeSubtitleStyle === "CYBER" && (
            <div className="bg-black/90 backdrop-blur-md px-4 py-2 rounded-2xl border border-pink-500/50 shadow-2xl text-center">
              <p className="text-sm font-black tracking-wide uppercase">
                <span className="text-pink-400 drop-shadow-[0_0_8px_rgba(254,44,85,0.8)] mr-1">
                  {words.slice(0, 2).join(" ") || "FOCUS IA"}
                </span>
                <span className="text-cyan-400 drop-shadow-[0_0_8px_rgba(37,244,238,0.8)]">
                  {words.slice(2).join(" ") || "EN 3 CLICS"}
                </span>
              </p>
            </div>
          )}

          {activeSubtitleStyle === "MINIMAL" && (
            <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 text-center">
              <p className="text-xs font-semibold text-white/95">
                {caption ? caption.slice(0, 45) + "..." : "Sous-titres automatiques en cours..."}
              </p>
            </div>
          )}
        </div>

        {/* Overlay Bas : Compte & Légende */}
        <div
          data-testid="tiktok-bottom-overlay"
          className="absolute left-3 right-16 bottom-5 text-white z-25 pointer-events-none space-y-1"
        >
          <p className="font-bold text-sm drop-shadow flex items-center gap-1.5">
            <span>{accountHandle}</span>
            <span className="w-3 h-3 rounded-full bg-cyan-400 text-black flex items-center justify-center text-[8px] font-black">✓</span>
          </p>
          <p className="text-xs text-white/95 line-clamp-2 drop-shadow leading-relaxed">
            {caption || "Légende du post TikTok générée automatiquement..."}
          </p>
          <div className="flex items-center gap-1.5 text-[10px] text-white/80 pt-0.5">
            <Music className="w-3 h-3 text-cyan-400 animate-pulse" />
            <span className="truncate">Son original • Audio Ducking -14dB</span>
          </div>
        </div>

        {/* Timeline Vidéo TikTok Officielle (Scrub bar blanche ultra-fine en bas) */}
        <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-30">
          <div
            className="h-full bg-white transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Miniatures horizontales de carrousel (pour switcher directement de slide) */}
      {mediaType === "PHOTO" && mediaUrls.length > 1 && (
        <div className="flex items-center gap-1.5 pt-1">
          {mediaUrls.map((url, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => setCurrentSlide(idx)}
              className={`w-9 h-12 rounded-lg overflow-hidden border-2 transition ${
                currentSlide === idx
                  ? "border-cyan-400 scale-105 shadow-md shadow-cyan-950"
                  : "border-zinc-800 opacity-60 hover:opacity-100"
              }`}
            >
              <img src={url} alt={`Slide thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}