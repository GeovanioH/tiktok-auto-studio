import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Grid3X3, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Layers,
  ChevronLeft,
  ChevronRight,
  Send
} from "lucide-react";
import { BrandLogo } from "../components/ui/BrandLogo";

export type SubtitleStyle = "HORMOZI" | "SUBMAGIC" | "CYBER" | "MINIMAL";

export function SimulatorPage() {
  const [activeEngine, setActiveEngine] = useState<SubtitleStyle>("HORMOZI");
  const [showSafeArea, setShowSafeArea] = useState(true);
  const [is3DMode, setIs3DMode] = useState(false);
  const [mode, setMode] = useState<"VIDEO" | "CAROUSEL">("VIDEO");
  const [caption, setCaption] = useState(
    "NE COMMENCEZ JAMAIS VOTRE VIDÉO PAR UN BONJOUR ! REGARDEZ CETTE MÉTHODE SECRÈTE POUR 500K VUES."
  );
  const [subtitlePosY, setSubtitlePosY] = useState(62);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<1 | 1.5 | 2>(1);
  const [progress, setProgress] = useState(14);
  const [isAigcDeclared, setIsAigcDeclared] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  const carouselSlides = [
    { label: "01", category: "Hook", subtitle: "Rétention 3 secondes", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080&auto=format&fit=crop&q=80" },
    { label: "02", category: "Pain", subtitle: "Problème identifié", url: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?w=1080&auto=format&fit=crop&q=80" },
    { label: "03", category: "Pivot", subtitle: "Rupture de pattern", url: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=1080&auto=format&fit=crop&q=80" },
    { label: "04", category: "Proof", subtitle: "Démonstration concrète", url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1080&auto=format&fit=crop&q=80" },
    { label: "05", category: "CTA", subtitle: "Appel à l'action viral", url: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=1080&auto=format&fit=crop&q=80" },
  ];

  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setProgress((p) => (p >= 100 ? 0 : p + 2 * playbackSpeed));
    }, 250);
    return () => clearInterval(interval);
  }, [isPlaying, playbackSpeed]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
    if (videoRef.current) {
      if (isPlaying) videoRef.current.pause();
      else videoRef.current.play();
    }
  };

  const words = caption
    ? caption.replace(/[#@][\w]+/g, "").trim().split(" ").filter(Boolean).slice(0, 5)
    : ["NE", "COMMENCEZ", "JAMAIS", "VOTRE", "VIDÉO"];

  return (
    <div className="max-w-[1720px] mx-auto space-y-6 pb-12">
      {/* Top Station Header & Subtitle Engine Switch Bar (Stitch Spec) */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-low p-4 lg:p-5 rounded-2xl border border-surface-container-highest shadow-xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed animate-ping" />
            <span className="font-mono text-xs uppercase tracking-wider text-secondary">
              Neural HUD Simulation Engine
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-mono">
              v4.8 Ultra-Fidelity
            </span>
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-headline text-lg lg:text-xl font-bold text-on-surface">
              iPhone 15 Pro • Inspecteur 9:16
            </h1>
            <span className="px-2 py-0.5 rounded bg-surface-container-highest text-secondary-fixed font-mono text-[11px] hidden sm:inline-block">
              Titanium Natural 120Hz Super Retina XDR
            </span>
          </div>
        </div>

        {/* Quick Action Glass Switches */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowSafeArea(!showSafeArea)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
              showSafeArea
                ? "bg-primary-container text-on-primary-container border-primary-container shadow-md"
                : "bg-surface-container hover:bg-surface-container-high text-on-surface border-surface-container-highest"
            }`}
          >
            <Grid3X3 className="w-4 h-4 text-tertiary" />
            <span>Afficher Safe Area</span>
            <span className={`w-2 h-2 rounded-full ${showSafeArea ? "bg-white" : "bg-tertiary"}`} />
          </button>

          <button
            type="button"
            onClick={() => setIs3DMode(!is3DMode)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition border ${
              is3DMode
                ? "bg-secondary-fixed text-black border-secondary-fixed font-bold shadow-md"
                : "bg-surface-container hover:bg-surface-container-high text-on-surface border-surface-container-highest"
            }`}
          >
            <Layers className="w-4 h-4 text-secondary" />
            <span>{is3DMode ? "Vue Normale" : "Mode Inspecteur 3D"}</span>
          </button>

          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-surface-container-highest">
            <button
              type="button"
              onClick={() => setMode("VIDEO")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                mode === "VIDEO"
                  ? "bg-primary-container text-on-primary-container shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Vidéo 9:16
            </button>
            <button
              type="button"
              onClick={() => setMode("CAROUSEL")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                mode === "CAROUSEL"
                  ? "bg-secondary-fixed text-black shadow-xs font-bold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Carrousel Multi-Slide (5)
            </button>
          </div>
        </div>
      </div>

      {/* Main Workspace Grid (12-column Bento: Left 4, Center 5, Right 3) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Subtitle Karaoke Lab & Controls (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          {/* Subtitle Engines Tile */}
          <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container-highest shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-[22px]">subtitles</span>
                <span className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider">
                  Moteurs Sous-Titres Karaoké
                </span>
              </div>
              <span className="font-mono text-[10px] text-tertiary bg-surface-container px-2 py-0.5 rounded border border-surface-container-highest">
                Sync 60fps
              </span>
            </div>
            <p className="text-xs text-on-surface-variant leading-relaxed">
              Testez en temps réel l'impact d'accroche visuelle de vos scripts avec génération synchrone mot à mot.
            </p>

            {/* 4 Karaoke Engines Switcher Buttons */}
            <div className="flex flex-col gap-2">
              {[
                { id: "HORMOZI", emoji: "⚡", title: "Fluo Hormozi", desc: "Yellow highlight + Deep heavy stroke", color: "text-tertiary-fixed", checkColor: "text-tertiary" },
                { id: "SUBMAGIC", emoji: "🟢", title: "Emerald Submagic", desc: "Vibrant mint pulse + soft outer neon glow", color: "text-secondary", checkColor: "text-secondary-fixed" },
                { id: "CYBER", emoji: "🟣", title: "Cyber Neon Dual", desc: "Electric vermillion & cyan chroma drift", color: "text-primary-container", checkColor: "text-primary" },
                { id: "MINIMAL", emoji: "⚪", title: "Clean Minimalist", desc: "Frosted dark capsule + pristine sans text", color: "text-on-surface", checkColor: "text-on-surface" },
              ].map((engine) => (
                <button
                  key={engine.id}
                  type="button"
                  onClick={() => setActiveEngine(engine.id as SubtitleStyle)}
                  className={`w-full p-3 rounded-xl transition-all text-left flex items-center justify-between border ${
                    activeEngine === engine.id
                      ? "bg-surface-container-highest border-secondary-fixed/50 shadow-md ring-1 ring-secondary-fixed/30"
                      : "bg-surface-container border-transparent hover:bg-surface-container-high"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-lg bg-surface-container-highest flex items-center justify-center font-bold text-base shadow-sm">
                      {engine.emoji}
                    </span>
                    <div className="flex flex-col">
                      <span className="text-xs font-bold text-on-surface font-headline">{engine.title}</span>
                      <span className="font-mono text-[10px] text-on-surface-variant">{engine.desc}</span>
                    </div>
                  </div>
                  {activeEngine === engine.id ? (
                    <CheckCircle2 className={`w-5 h-5 ${engine.checkColor}`} />
                  ) : (
                    <span className="w-5 h-5 rounded-full border border-surface-container-highest opacity-40" />
                  )}
                </button>
              ))}
            </div>

            {/* Caption Script Customizer */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-surface-container-highest">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
                  Script Actif (Accroche T0-T3s)
                </span>
                <span className="font-mono text-[10px] text-secondary-fixed">Edit Direct</span>
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                className="w-full bg-surface-container-lowest p-3 rounded-xl text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary-fixed border border-surface-container-highest transition resize-none font-mono"
              />
            </div>

            {/* Subtitle Positioning Y Slider */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">Hauteur d'ancrage vertical</span>
                <span className="font-mono text-secondary-fixed font-bold">{subtitlePosY}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="85"
                value={subtitlePosY}
                onChange={(e) => setSubtitlePosY(Number(e.target.value))}
                className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary-container"
              />
            </div>
          </div>

          {/* Carrousel Slide Navigator */}
          {mode === "CAROUSEL" && (
            <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container-highest shadow-lg space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-secondary" />
                  <span className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface">
                    Inspecteur Slides (Carrousel)
                  </span>
                </div>
                <span className="font-mono text-[10px] text-secondary bg-surface-container px-2 py-0.5 rounded">
                  1080x1920
                </span>
              </div>
              <div className="grid grid-cols-5 gap-2 pt-1">
                {carouselSlides.map((slide, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentSlide(idx)}
                    className={`p-2 rounded-xl text-center flex flex-col items-center gap-0.5 border transition ${
                      currentSlide === idx
                        ? "bg-surface-container-highest border-primary-container text-on-surface ring-1 ring-primary-container"
                        : "bg-surface-container border-transparent text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    <span className="font-mono text-xs font-bold">{slide.label}</span>
                    <span className="text-[9px] uppercase font-mono text-secondary">{slide.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Fast Preset Specs HUD Mini-Card */}
          <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container-highest flex items-center justify-between shadow-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center">
                <span className="material-symbols-outlined text-secondary-fixed">aspect_ratio</span>
              </div>
              <div className="flex flex-col">
                <span className="text-xs font-bold text-on-surface font-headline">Format Ratio TikTok</span>
                <span className="font-mono text-[10px] text-on-surface-variant">9:16 (1080 x 1920 px) • SDR DCI-P3</span>
              </div>
            </div>
            <span className="material-symbols-outlined text-secondary-fixed text-[20px]">verified</span>
          </div>
        </div>

        {/* CENTER COLUMN: Ultra-Realistic iPhone 15 Pro Titanium Frame (5 cols) */}
        <div className="xl:col-span-5 flex flex-col items-center justify-center">
          <div
            style={{
              transform: is3DMode ? "perspective(1200px) rotateY(-18deg) rotateX(10deg) scale(0.96)" : "none",
              transition: "transform 0.5s cubic-bezier(0.2, 0, 0, 1)",
            }}
            className="relative"
          >
            {/* Titanium Chassis */}
            <div
              data-testid="tiktok-preview"
              onClick={togglePlay}
              className="relative w-[340px] sm:w-[380px] h-[680px] sm:h-[760px] bg-[#1a191d] rounded-[52px] p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(255,81,104,0.15)] ring-1 ring-white/10 select-none cursor-pointer group"
            >
              {/* Natural Brushed Bezel Layer */}
              <div className="w-full h-full bg-[#0d0d0f] rounded-[44px] p-[6px] relative overflow-hidden flex flex-col justify-between">
                {/* OLED Screen Area */}
                <div className="relative w-full h-full bg-surface-container-lowest rounded-[38px] overflow-hidden flex flex-col justify-between select-none">
                  {/* Dynamic Island */}
                  <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-50 w-28 h-7 bg-black rounded-full flex items-center justify-between px-3 shadow-md pointer-events-none">
                    <div className="w-2.5 h-2.5 rounded-full bg-[#1b263b] flex items-center justify-center">
                      <div className="w-1 h-1 rounded-full bg-[#415a77]" />
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed animate-pulse" />
                      <span className="font-mono text-[9px] text-white font-bold">IA Live</span>
                    </div>
                  </div>

                  {/* Play/Pause Overlay */}
                  <div className="absolute inset-0 z-30 flex items-center justify-center pointer-events-none">
                    {!isPlaying && (
                      <div className="w-16 h-16 rounded-full bg-black/60 backdrop-blur-md border border-white/20 flex items-center justify-center text-white shadow-2xl animate-in zoom-in-75 duration-200">
                        <Play className="w-8 h-8 ml-1 text-white fill-white" />
                      </div>
                    )}
                  </div>

                  {/* Media Content */}
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
                          src={carouselSlides[currentSlide].url}
                          alt="Slide"
                          className="w-full h-full object-cover transition-opacity duration-300"
                        />
                        <div className="absolute top-12 right-4 bg-black/70 backdrop-blur-sm px-2.5 py-1 rounded-full text-[10px] text-white font-mono font-bold border border-white/10 z-25">
                          {currentSlide + 1}/{carouselSlides.length}
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentSlide((p) => (p > 0 ? p - 1 : carouselSlides.length - 1));
                          }}
                          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition z-25"
                        >
                          <ChevronLeft className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentSlide((p) => (p < carouselSlides.length - 1 ? p + 1 : 0));
                          }}
                          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/80 text-white rounded-full p-2 transition z-25"
                        >
                          <ChevronRight className="w-4 h-4" />
                        </button>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/85 pointer-events-none" />
                  </div>

                  {/* AIGC Badge */}
                  {isAigcDeclared && (
                    <div
                      data-testid="aigc-badge"
                      className="absolute top-12 left-4 flex items-center gap-1.5 bg-black/65 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/15 z-25 pointer-events-none"
                    >
                      <Sparkles className="w-3 h-3 text-secondary-fixed" />
                      <span className="text-[10px] text-white font-semibold">Généré par IA</span>
                    </div>
                  )}

                  {/* Mute Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsMuted(!isMuted);
                    }}
                    className="absolute top-12 right-4 z-25 w-8 h-8 rounded-full bg-black/60 backdrop-blur-sm border border-white/15 flex items-center justify-center text-white hover:bg-black/80 transition"
                  >
                    {isMuted ? <VolumeX className="w-4 h-4 text-primary" /> : <Volume2 className="w-4 h-4 text-secondary-fixed" />}
                  </button>

                  {/* Dynamic Subtitles Layer Positioned via Slider */}
                  <div
                    style={{ top: `${subtitlePosY}%` }}
                    className="absolute left-5 right-5 -translate-y-1/2 z-30 pointer-events-none transition-all duration-200"
                  >
                    {activeEngine === "HORMOZI" && (
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

                    {activeEngine === "SUBMAGIC" && (
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

                    {activeEngine === "CYBER" && (
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

                    {activeEngine === "MINIMAL" && (
                      <div className="bg-surface-container-lowest/80 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/10 text-center">
                        <p className="text-xs font-medium text-white/95">
                          {caption ? caption.slice(0, 50) + "..." : "Sous-titrage haute-fidélité en cours..."}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Safe Area TikTok Visual Overlay */}
                  {showSafeArea && (
                    <div className="absolute inset-0 z-35 pointer-events-none flex flex-col justify-between border-2 border-dashed border-secondary/60 animate-in fade-in">
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

                      <div className="relative flex-1 flex items-center justify-center p-3">
                        <div className="w-full h-full border-2 border-dashed border-secondary-fixed/50 rounded-2xl flex flex-col items-center justify-center bg-secondary-fixed/5 p-2 text-center">
                          <span className="px-2 py-0.5 rounded bg-secondary-fixed/20 text-secondary-fixed font-mono text-[10px] font-bold uppercase tracking-wider">
                            ✓ Safe Zone Utile (100% Visible)
                          </span>
                        </div>
                      </div>

                      <div className="w-full pb-8 pt-2.5 px-4 bg-error-container/25 backdrop-blur-[2px] border-t border-error/40 flex flex-col gap-1">
                        <span className="font-mono text-[9px] text-error bg-black/80 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider self-start">
                          ⚠️ Zone Danger Caption & Nav
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Right Actions Bar */}
                  <div
                    data-testid="tiktok-actions-bar"
                    className="absolute right-2.5 bottom-16 flex flex-col items-center gap-3 text-white z-25 pointer-events-none"
                  >
                    <div className="relative mb-1">
                      <div className="w-10 h-10 rounded-full border-2 border-white bg-surface-container-highest flex items-center justify-center shadow-md overflow-hidden">
                        <BrandLogo size={36} className="w-full h-full" withGlow={false} />
                      </div>
                      <span className="w-4 h-4 rounded-full bg-primary-container text-white flex items-center justify-center text-[10px] -mt-2 font-bold shadow">
                        +
                      </span>
                    </div>

                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-9 h-9 rounded-full bg-surface-container-lowest/70 backdrop-blur-sm flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px] text-white">favorite</span>
                      </div>
                      <span className="font-mono text-[10px] text-white font-bold">148.2K</span>
                    </div>

                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-9 h-9 rounded-full bg-surface-container-lowest/70 backdrop-blur-sm flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px] text-white">comment</span>
                      </div>
                      <span className="font-mono text-[10px] text-white font-bold">1,892</span>
                    </div>

                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-9 h-9 rounded-full bg-surface-container-lowest/70 backdrop-blur-sm flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px] text-white">bookmark</span>
                      </div>
                      <span className="font-mono text-[10px] text-white font-bold">34.6K</span>
                    </div>

                    <div className="flex flex-col items-center gap-0.5">
                      <div className="w-9 h-9 rounded-full bg-surface-container-lowest/70 backdrop-blur-sm flex items-center justify-center">
                        <span className="material-symbols-outlined text-[20px] text-white">share</span>
                      </div>
                      <span className="font-mono text-[10px] text-white font-bold">12.1K</span>
                    </div>

                    <div className="w-8 h-8 rounded-full bg-surface-container-highest animate-spin flex items-center justify-center ring-2 ring-white/50">
                      <span className="material-symbols-outlined text-[16px] text-secondary-fixed">music_note</span>
                    </div>
                  </div>

                  {/* Bottom Caption Overlay */}
                  <div
                    data-testid="tiktok-bottom-overlay"
                    className="absolute left-3 right-16 bottom-4 text-white z-25 pointer-events-none space-y-1"
                  >
                    <div className="flex items-center gap-1.5 font-headline text-xs font-bold drop-shadow">
                      <span>@aistudio.pro</span>
                      <span className="w-3.5 h-3.5 rounded-full bg-secondary-fixed text-black flex items-center justify-center text-[8px] font-black">
                        ✓
                      </span>
                    </div>
                    <p className="text-[11px] text-white/90 line-clamp-2 drop-shadow leading-snug font-body">
                      {caption}
                    </p>
                    <div className="flex items-center gap-1.5 text-[10px] text-white/80 pt-0.5 font-mono">
                      <span className="material-symbols-outlined text-[12px] text-secondary-fixed">graphic_eq</span>
                      <span className="truncate">Son original - IA Growth Masterclass 2026</span>
                    </div>
                  </div>

                  {/* Scrubber Bar */}
                  <div className="absolute bottom-0 inset-x-0 h-1 bg-white/20 z-30">
                    <div className="h-full bg-white transition-all duration-200" style={{ width: `${progress}%` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Integrated Cyber Player Remote (Stitch Spec) */}
          <div className="w-[340px] sm:w-[380px] mt-4 bg-surface-container-low p-4 rounded-2xl border border-surface-container-highest shadow-xl flex flex-col gap-3">
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between font-mono text-xs text-on-surface-variant">
                <span className="text-secondary-fixed font-bold">00:02.45</span>
                <span className="text-on-surface">Durée : 00:28.10</span>
              </div>
              <div
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const p = Math.max(0, Math.min(100, ((e.clientX - rect.left) / rect.width) * 100));
                  setProgress(p);
                }}
                className="relative w-full h-3 bg-surface-container-highest rounded-full cursor-pointer flex items-center overflow-hidden"
              >
                <div
                  className="h-full bg-gradient-to-r from-primary-container via-secondary-container to-secondary-fixed rounded-full transition-all duration-200"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-xl bg-primary-container text-on-primary-container hover:bg-primary flex items-center justify-center transition shadow-md"
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                </button>
                <button
                  type="button"
                  onClick={() => setProgress(0)}
                  className="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition border border-surface-container-highest"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsMuted(!isMuted)}
                  className="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition border border-surface-container-highest"
                >
                  {isMuted ? <VolumeX className="w-4 h-4 text-primary" /> : <Volume2 className="w-4 h-4 text-secondary-fixed" />}
                </button>
              </div>

              {/* Speed Switcher */}
              <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-surface-container-highest font-mono text-xs">
                {([1, 1.5, 2] as const).map((spd) => (
                  <button
                    key={spd}
                    type="button"
                    onClick={() => setPlaybackSpeed(spd)}
                    className={`px-2 py-0.5 rounded-lg transition ${
                      playbackSpeed === spd
                        ? "bg-surface-container-highest text-secondary-fixed font-bold"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {spd}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AIGC Compliance & Virality Telemetry Radar (3 cols) */}
        <div className="xl:col-span-3 flex flex-col gap-5">
          {/* TikTok AIGC Compliance Card */}
          <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container-highest shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-secondary-fixed text-[20px]">verified_user</span>
                <span className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface">
                  Conformité TikTok AIGC
                </span>
              </div>
              <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed animate-pulse" />
            </div>

            <div className="bg-surface-container-lowest p-3 rounded-xl font-mono text-xs text-secondary-fixed flex flex-col gap-1.5 border border-surface-container-highest">
              <div className="flex justify-between">
                <span className="text-on-surface-variant">is_aigc:</span>
                <span className="text-secondary font-bold">true</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">c2pa_metadata:</span>
                <span className="text-on-surface">INJECTED_SHA256</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">watermark:</span>
                <span className="text-tertiary">SAFE_PASSED</span>
              </div>
              <div className="flex justify-between">
                <span className="text-on-surface-variant">audio_rights:</span>
                <span className="text-secondary">TIKTOK_LIBRARY_OK</span>
              </div>
            </div>

            <p className="text-xs text-on-surface-variant leading-relaxed">
              Le tag légal « Contenu généré par IA » sera automatiquement apposé par l'API TikTok sans pénalité d'algorithme.
            </p>

            <div className="flex items-center justify-between bg-surface-container p-3 rounded-xl border border-surface-container-highest">
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-on-surface">Déclaration Auto</span>
                <span className="font-mono text-[10px] text-on-surface-variant">Évite les shadowbans v2</span>
              </div>
              <button
                type="button"
                onClick={() => setIsAigcDeclared(!isAigcDeclared)}
                className={`w-11 h-6 rounded-full transition-colors relative flex items-center p-0.5 ${
                  isAigcDeclared ? "bg-primary-container" : "bg-surface-container-highest"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full bg-white transition-transform ${
                    isAigcDeclared ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Instant Virality Audit Scorecard */}
          <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container-highest shadow-lg flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface">
                Audit Viral Prédictif
              </span>
              <span className="px-2 py-0.5 rounded bg-tertiary-container/30 text-tertiary-fixed font-mono text-xs font-bold border border-tertiary/40">
                Score 94 / 100
              </span>
            </div>

            {/* Retention Curve Visualizer */}
            <div className="bg-surface-container p-3 rounded-xl border border-surface-container-highest flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-on-surface font-semibold">Courbe Rétention (30s)</span>
                <span className="text-secondary-fixed font-mono text-[10px]">Hormozi Pattern</span>
              </div>
              <div className="w-full h-16 pt-1">
                <svg className="w-full h-full text-secondary-fixed overflow-visible" fill="none" stroke="currentColor" viewBox="0 0 200 50">
                  <path d="M 0 5 Q 30 12, 60 14 T 120 18 T 160 22 T 200 24" stroke="currentColor" strokeLinecap="round" strokeWidth="2.5" />
                  <path d="M 0 5 Q 30 12, 60 14 T 120 18 T 160 22 T 200 24 L 200 50 L 0 50 Z" fill="currentColor" fillOpacity="0.08" />
                  <circle cx="30" cy="12" fill="#ff5168" r="3" />
                  <circle cx="120" cy="18" fill="#dec800" r="3" />
                  <circle cx="180" cy="23" fill="#35fbf5" r="3" />
                </svg>
              </div>
              <div className="flex justify-between font-mono text-[10px] text-on-surface-variant">
                <span>0s (Hook)</span>
                <span>15s (Pivot)</span>
                <span>28s (CTA)</span>
              </div>
            </div>

            {/* Checklist Items */}
            <div className="flex flex-col gap-2 text-xs">
              <div className="flex items-center gap-2 text-on-surface">
                <CheckCircle2 className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                <span>Zéro collision avec les boutons TikTok</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface">
                <CheckCircle2 className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                <span>Accroche textuelle lue en &lt;1.2s</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface">
                <CheckCircle2 className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                <span>Contraste karaoké validé WCAG AAA</span>
              </div>
              <div className="flex items-center gap-2 text-on-surface-variant">
                <AlertTriangle className="w-4 h-4 text-tertiary flex-shrink-0" />
                <span>Bouton CTA proche du bord bas (-8px)</span>
              </div>
            </div>

            <Link
              to="/calendar"
              className="w-full py-3 rounded-xl bg-primary-container hover:bg-primary text-on-primary-container font-headline text-xs font-bold transition shadow-lg shadow-primary-container/20 flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Valider & Planifier ce Rendu</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
