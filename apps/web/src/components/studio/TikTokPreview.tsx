import { useState } from "react";
import { Heart, MessageCircle, Bookmark, Share2, Music, CheckCircle2, ChevronLeft, ChevronRight } from "lucide-react";

export interface TikTokPreviewProps {
  mediaType: "VIDEO" | "PHOTO";
  mediaUrls: string[];
  caption: string;
  accountHandle?: string;
  isAigc?: boolean;
}

export function TikTokPreview({
  mediaType,
  mediaUrls,
  caption,
  accountHandle = "@mon_compte",
  isAigc = true,
}: TikTokPreviewProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev > 0 ? prev - 1 : mediaUrls.length - 1));
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev < mediaUrls.length - 1 ? prev + 1 : 0));
  };

  return (
    <div
      data-testid="tiktok-preview"
      className="relative mx-auto w-[320px] h-[568px] sm:w-[360px] sm:h-[640px] bg-black rounded-[44px] border-[8px] border-zinc-800 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)] overflow-hidden select-none transition-all duration-300 hover:border-zinc-700"
    >
      {/* Dynamic Island / Capteur Caméra */}
      <div className="absolute top-3 left-1/2 -translate-x-1/2 w-24 h-4 bg-zinc-950 rounded-full z-30 border border-zinc-800/60 pointer-events-none flex items-center justify-end pr-2.5">
        <span className="w-2 h-2 rounded-full bg-zinc-900 border border-zinc-700/80"></span>
      </div>

      {/* Reflet de Verre Diagonal (Glass Glare Awwwards) */}
      <div className="pointer-events-none absolute inset-0 z-20 glass-glare opacity-80" />
      {/* Contenu Média Principal */}
      <div className="absolute inset-0 w-full h-full">
        {mediaType === "VIDEO" ? (
          mediaUrls[0] ? (
            <video
              src={mediaUrls[0]}
              className="w-full h-full object-cover"
              controls={false}
              autoPlay
              loop
              muted
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
                <div className="absolute top-4 right-4 bg-black/60 px-2.5 py-1 rounded-full text-xs text-white font-medium">
                  {currentSlide + 1}/{mediaUrls.length}
                </div>
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1.5 transition"
                  aria-label="Diapositive précédente"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/40 hover:bg-black/70 text-white rounded-full p-1.5 transition"
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
          className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/10"
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
          <span className="text-[11px] text-white/90 font-medium">Généré par IA</span>
        </div>
      )}

      {/* Barre d'Action Latérale Droite (Safe Area TikTok) */}
      <div
        data-testid="tiktok-actions-bar"
        className="absolute right-3 bottom-20 flex flex-col items-center gap-4 text-white z-20"
      >
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-zinc-800/80 backdrop-blur-sm flex items-center justify-center hover:scale-105 transition">
            <Heart className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-semibold drop-shadow">12.4K</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-zinc-800/80 backdrop-blur-sm flex items-center justify-center hover:scale-105 transition">
            <MessageCircle className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-semibold drop-shadow">348</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-zinc-800/80 backdrop-blur-sm flex items-center justify-center hover:scale-105 transition">
            <Bookmark className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-semibold drop-shadow">1.2K</span>
        </div>
        <div className="flex flex-col items-center gap-1">
          <div className="w-10 h-10 rounded-full bg-zinc-800/80 backdrop-blur-sm flex items-center justify-center hover:scale-105 transition">
            <Share2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-[10px] font-semibold drop-shadow">410</span>
        </div>
        {/* Disque Vinyle Rotatif */}
        <div className="w-9 h-9 rounded-full bg-zinc-900 border-2 border-white/20 flex items-center justify-center animate-spin">
          <Music className="w-4 h-4 text-white" />
        </div>
      </div>

      {/* Sous-titres Karaoké Dynamiques TikTok (Centre de l'écran) */}
      <div className="absolute inset-x-4 top-[54%] -translate-y-1/2 flex items-center justify-center z-20 pointer-events-none">
        <div className="bg-black/70 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/10 shadow-2xl text-center transform hover:scale-105 transition">
          <p className="text-sm font-black tracking-wide text-white uppercase drop-shadow-[0_2px_4px_rgba(0,0,0,0.9)]">
            <span className="text-yellow-400 animate-pulse font-extrabold mr-1.5">⚡ ATTENTION :</span>
            <span>{caption ? caption.split(" ").slice(0, 4).join(" ") : "LE SECRET VIRAL"}</span>
          </p>
        </div>
      </div>

      {/* Overlay Bas : Compte & Légende */}
      <div
        data-testid="tiktok-bottom-overlay"
        className="absolute left-3 right-16 bottom-4 text-white z-20 pointer-events-none"
      >
        <p className="font-bold text-sm drop-shadow">{accountHandle}</p>
        <p className="text-xs text-white/90 line-clamp-2 mt-1 drop-shadow">
          {caption || "Légende du post TikTok générée automatiquement..."}
        </p>
        <div className="flex items-center gap-1.5 mt-2 text-[11px] text-white/80">
          <Music className="w-3 h-3" />
          <span className="truncate">Son original — {accountHandle}</span>
        </div>
      </div>
    </div>
  );
}
