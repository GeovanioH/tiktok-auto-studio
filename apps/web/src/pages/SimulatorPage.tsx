import { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Volume2, 
  VolumeX, 
  Grid3X3, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Send,
  Smartphone,
  Maximize2,
  ZoomIn,
  Sliders,
  Check
} from "lucide-react";
import { DEVICE_SPECS, checkSubtitleCollision, type DeviceSpec } from "../components/studio/DeviceDefinitions";
import { DeviceSimulatorFrame } from "../components/studio/DeviceSimulatorFrame";
import { TikTokScreenContent, type SubtitleStyle } from "../components/studio/TikTokScreenContent";

export function SimulatorPage() {
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>("iphone-15-pro");
  const [viewMode, setViewMode] = useState<"SOLO" | "MULTI">("SOLO");
  const [scalePreset, setScalePreset] = useState<number>(0.85); // 1.0 (100% réel), 0.85 (standard), 0.70 (compact)
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

  const selectedDevice = DEVICE_SPECS.find((d) => d.id === selectedDeviceId) || DEVICE_SPECS[0];
  const collisionResult = checkSubtitleCollision(subtitlePosY, selectedDevice);

  // Appareils étalons pour le comparateur multi-vues côte à côte
  const multiDevices: DeviceSpec[] = [
    DEVICE_SPECS.find((d) => d.id === "iphone-15-pro")!,
    DEVICE_SPECS.find((d) => d.id === "samsung-s24-ultra")!,
    DEVICE_SPECS.find((d) => d.id === "iphone-se-16-9")!,
  ];

  return (
    <div className="max-w-[1720px] mx-auto space-y-6 pb-12">
      {/* 1. TOP STATION HUD & CONTRÔLES MULTI-APPAREILS */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-surface-container-low p-4 lg:p-5 rounded-2xl border border-surface-container-highest shadow-xl">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-secondary-fixed animate-ping" />
            <span className="font-mono text-xs uppercase tracking-wider text-secondary">
              Simulateur Multi-Tailles Réelles
            </span>
            <span className="px-2 py-0.5 rounded-full bg-surface-container text-on-surface text-[10px] font-mono">
              Composant Réutilisable & Dimensions Réelles 1:1
            </span>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="font-headline text-lg lg:text-xl font-bold text-on-surface">
              {viewMode === "SOLO" ? selectedDevice.name : "Comparateur 3 Tailles Réelles en Simultané"}
            </h1>
            <span className="px-2.5 py-0.5 rounded bg-surface-container-highest text-secondary-fixed font-mono text-[11px]">
              {viewMode === "SOLO"
                ? `${selectedDevice.width} × ${selectedDevice.height} px (${selectedDevice.aspectRatio}) • Échelle ${Math.round(scalePreset * 100)}%`
                : "iPhone 15 Pro • Galaxy S24 Ultra • iPhone SE 16:9"}
            </span>
          </div>
        </div>

        {/* Quick Action Glass Switches */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Bascule Mode Solo / Mode Multi-Vues */}
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-surface-container-highest">
            <button
              type="button"
              onClick={() => setViewMode("SOLO")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                viewMode === "SOLO"
                  ? "bg-primary-container text-white shadow-xs font-bold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Smartphone className="w-3.5 h-3.5" />
              <span>Vue Solo</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("MULTI")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
                viewMode === "MULTI"
                  ? "bg-secondary-fixed text-black shadow-xs font-bold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span>3 Vues Simultanées (Multi-Tailles)</span>
            </button>
          </div>

          {/* Zoom / Échelle Réelle */}
          {viewMode === "SOLO" && (
            <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-surface-container-highest font-mono text-xs">
              <ZoomIn className="w-3.5 h-3.5 text-on-surface-variant ml-1.5 mr-0.5" />
              {[
                { label: "100% Réel (1:1)", value: 1.0 },
                { label: "85%", value: 0.85 },
                { label: "70%", value: 0.70 },
              ].map((p) => (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setScalePreset(p.value)}
                  className={`px-2 py-1 rounded-lg transition ${
                    scalePreset === p.value
                      ? "bg-surface-container-highest text-secondary-fixed font-bold shadow-xs"
                      : "text-on-surface-variant hover:text-on-surface"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          {/* Safe Area Toggle */}
          <button
            type="button"
            onClick={() => setShowSafeArea(!showSafeArea)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
              showSafeArea
                ? "bg-primary-container text-white border-primary-container shadow-md"
                : "bg-surface-container hover:bg-surface-container-high text-on-surface border-surface-container-highest"
            }`}
          >
            <Grid3X3 className="w-4 h-4 text-tertiary" />
            <span>Safe Area</span>
          </button>

          {/* Mode 3D Tilt */}
          {viewMode === "SOLO" && (
            <button
              type="button"
              onClick={() => setIs3DMode(!is3DMode)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition border ${
                is3DMode
                  ? "bg-secondary-fixed text-black border-secondary-fixed font-bold shadow-md"
                  : "bg-surface-container hover:bg-surface-container-high text-on-surface border-surface-container-highest"
              }`}
            >
              <Layers className="w-4 h-4 text-secondary" />
              <span>{is3DMode ? "Vue Normale" : "3D Tilt"}</span>
            </button>
          )}

          {/* Format Vidéo / Carrousel */}
          <div className="flex items-center gap-1 bg-surface-container p-1 rounded-xl border border-surface-container-highest">
            <button
              type="button"
              onClick={() => setMode("VIDEO")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                mode === "VIDEO"
                  ? "bg-primary-container text-white shadow-xs"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Vidéo 9:16
            </button>
            <button
              type="button"
              onClick={() => setMode("CAROUSEL")}
              className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                mode === "CAROUSEL"
                  ? "bg-secondary-fixed text-black shadow-xs font-bold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              Carrousel
            </button>
          </div>
        </div>
      </div>

      {/* 2. SÉLECTEUR D'APPAREILS RÉELS AVEC TAILLES NATIVES EN PIXELS */}
      {viewMode === "SOLO" && (
        <div className="bg-surface-container-low p-3.5 rounded-2xl border border-surface-container-highest shadow-md overflow-x-auto">
          <div className="flex items-center gap-2 min-w-max">
            <span className="text-[11px] font-mono text-on-surface-variant font-bold uppercase tracking-wider px-2 flex items-center gap-1.5">
              <Sliders className="w-3.5 h-3.5 text-secondary-fixed" />
              Appareil :
            </span>

            {DEVICE_SPECS.map((dev) => {
              const isSelected = selectedDeviceId === dev.id;
              return (
                <button
                  key={dev.id}
                  type="button"
                  onClick={() => setSelectedDeviceId(dev.id)}
                  className={`px-3 py-2 rounded-xl text-xs transition flex items-center gap-2 border ${
                    isSelected
                      ? "bg-surface-container-highest border-secondary-fixed text-on-surface shadow-md ring-1 ring-secondary-fixed/50 font-bold"
                      : "bg-surface-container border-transparent text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high"
                  }`}
                >
                  <div className="flex flex-col text-left">
                    <span className="leading-tight flex items-center gap-1.5">
                      <span>{dev.name}</span>
                      {isSelected && <Check className="w-3.5 h-3.5 text-secondary-fixed" />}
                    </span>
                    <span className="font-mono text-[10px] text-on-surface-variant/80">
                      {dev.width}×{dev.height} px • {dev.aspectRatio}
                    </span>
                  </div>
                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.5 rounded-full ${
                      isSelected
                        ? "bg-secondary-fixed/20 text-secondary-fixed"
                        : "bg-surface-container-lowest text-on-surface-variant"
                    }`}
                  >
                    {dev.badge}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. WORKSPACE PRINCIPAL */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* COLONNE GAUCHE: Karaoké, Script & Diagnostic Collision (4 cols) */}
        <div className="xl:col-span-4 flex flex-col gap-5">
          {/* Diagnostic Collision en Direct */}
          <div
            className={`p-4 rounded-2xl border shadow-lg space-y-2.5 transition-all ${
              collisionResult.hasCollision
                ? "bg-error-container/20 border-error/50"
                : "bg-surface-container-low border-secondary-fixed/40"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {collisionResult.hasCollision ? (
                  <AlertTriangle className="w-4 h-4 text-error animate-bounce" />
                ) : (
                  <CheckCircle2 className="w-4 h-4 text-secondary-fixed" />
                )}
                <span className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface">
                  Diagnostic de Collision ({selectedDevice.name})
                </span>
              </div>
              <span
                className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded ${
                  collisionResult.hasCollision
                    ? "bg-error text-white"
                    : "bg-secondary-fixed/20 text-secondary-fixed"
                }`}
              >
                Safe Zone {collisionResult.safeZonePercent}%
              </span>
            </div>

            <p className="text-xs text-on-surface leading-relaxed">
              {collisionResult.message}
            </p>

            <div className="w-full bg-surface-container-highest h-1.5 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-300 ${
                  collisionResult.hasCollision ? "bg-error" : "bg-secondary-fixed"
                }`}
                style={{ width: `${collisionResult.safeZonePercent}%` }}
              />
            </div>
          </div>

          {/* Moteurs Sous-Titres Karaoké */}
          <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container-highest shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <span className="font-headline text-sm font-bold text-on-surface uppercase tracking-wider">
                Moteurs Karaoké 60 FPS
              </span>
              <span className="font-mono text-[10px] text-tertiary bg-surface-container px-2 py-0.5 rounded border border-surface-container-highest">
                Sync Mot à Mot
              </span>
            </div>

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

            {/* Script Actif */}
            <div className="flex flex-col gap-1.5 pt-2 border-t border-surface-container-highest">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono uppercase tracking-wider text-on-surface-variant font-bold">
                  Script d'Accroche (T0-T3s)
                </span>
                <span className="font-mono text-[10px] text-secondary-fixed">Édition Directe</span>
              </div>
              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                rows={3}
                className="w-full bg-surface-container-lowest p-3 rounded-xl text-on-surface text-xs focus:outline-none focus:ring-1 focus:ring-secondary-fixed border border-surface-container-highest transition resize-none font-mono"
              />
            </div>

            {/* Curseur Hauteur Y du sous-titre */}
            <div className="flex flex-col gap-1.5 pt-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-on-surface-variant">Hauteur d'ancrage vertical</span>
                <span className="font-mono text-secondary-fixed font-bold">{subtitlePosY}%</span>
              </div>
              <input
                type="range"
                min="25"
                max="85"
                value={subtitlePosY}
                onChange={(e) => setSubtitlePosY(Number(e.target.value))}
                className="w-full h-1.5 bg-surface-container-highest rounded-lg appearance-none cursor-pointer accent-primary-container"
              />
              <div className="flex justify-between font-mono text-[9px] text-on-surface-variant pt-0.5">
                <span>Haut (Danger Header)</span>
                <span>Idéal (55-65%)</span>
                <span>Bas (Danger Caption)</span>
              </div>
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
        </div>

        {/* COLONNE CENTRALE: LE SIMULATEUR TÉLÉPHONE (5 cols ou 8 cols si Multi) */}
        <div className={viewMode === "MULTI" ? "xl:col-span-8 flex flex-col gap-6" : "xl:col-span-5 flex flex-col items-center justify-center"}>
          {viewMode === "SOLO" ? (
            /* VUE SOLO : APPAREIL SÉLECTIONNÉ AVEC TAILLE RÉELLE */
            <div className="flex flex-col items-center">
              <DeviceSimulatorFrame
                device={selectedDevice}
                scale={scalePreset}
                is3DMode={is3DMode}
                onClick={togglePlay}
              >
                <TikTokScreenContent
                  device={selectedDevice}
                  mode={mode}
                  isPlaying={isPlaying}
                  isMuted={isMuted}
                  onToggleMute={() => setIsMuted(!isMuted)}
                  progress={progress}
                  currentSlide={currentSlide}
                  onPrevSlide={() => setCurrentSlide((p) => (p > 0 ? p - 1 : carouselSlides.length - 1))}
                  onNextSlide={() => setCurrentSlide((p) => (p < carouselSlides.length - 1 ? p + 1 : 0))}
                  carouselSlides={carouselSlides}
                  videoRef={videoRef}
                  caption={caption}
                  subtitlePosY={subtitlePosY}
                  activeEngine={activeEngine}
                  showSafeArea={showSafeArea}
                  isAigcDeclared={isAigcDeclared}
                />
              </DeviceSimulatorFrame>

              {/* Télécommande Player Cyber */}
              <div className="w-full max-w-[420px] mt-4 bg-surface-container-low p-4 rounded-2xl border border-surface-container-highest shadow-xl flex flex-col gap-3">
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
                      className="w-10 h-10 rounded-xl bg-primary-container text-white hover:bg-primary flex items-center justify-center transition shadow-md"
                      title={isPlaying ? "Pause" : "Lecture"}
                    >
                      {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 ml-0.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => setProgress(0)}
                      className="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition border border-surface-container-highest"
                      title="Recommencer"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsMuted(!isMuted)}
                      className="w-9 h-9 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface flex items-center justify-center transition border border-surface-container-highest"
                      title={isMuted ? "Activer le son" : "Couper le son"}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 text-primary" /> : <Volume2 className="w-4 h-4 text-secondary-fixed" />}
                    </button>
                  </div>

                  {/* Vitesse */}
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
          ) : (
            /* VUE MULTI-APPAREILS : 3 TÉLÉPHONES CÔTE À CÔTE EN SIMULTANÉ */
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-start">
                {multiDevices.map((dev) => {
                  const coll = checkSubtitleCollision(subtitlePosY, dev);
                  return (
                    <div
                      key={dev.id}
                      className="bg-surface-container-low p-4 rounded-2xl border border-surface-container-highest shadow-xl flex flex-col items-center gap-3"
                    >
                      {/* En-tête de l'appareil */}
                      <div className="w-full flex items-center justify-between pb-2 border-b border-surface-container-highest text-xs">
                        <div>
                          <p className="font-headline font-bold text-on-surface">{dev.name}</p>
                          <p className="font-mono text-[10px] text-on-surface-variant">
                            {dev.width}×{dev.height} px ({dev.aspectRatio})
                          </p>
                        </div>
                        <span
                          className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded flex items-center gap-1 ${
                            coll.hasCollision
                              ? "bg-error/20 text-error border border-error/30"
                              : "bg-secondary-fixed/20 text-secondary-fixed border border-secondary-fixed/30"
                          }`}
                        >
                          {coll.hasCollision ? "⚠️ Collision" : "✓ 100% OK"}
                        </span>
                      </div>

                      {/* Téléphone rendu à échelle 0.58 */}
                      <div className="overflow-hidden flex items-center justify-center p-1">
                        <DeviceSimulatorFrame
                          device={dev}
                          scale={0.58}
                          is3DMode={false}
                          onClick={togglePlay}
                        >
                          <TikTokScreenContent
                            device={dev}
                            mode={mode}
                            isPlaying={isPlaying}
                            isMuted={isMuted}
                            progress={progress}
                            currentSlide={currentSlide}
                            carouselSlides={carouselSlides}
                            caption={caption}
                            subtitlePosY={subtitlePosY}
                            activeEngine={activeEngine}
                            showSafeArea={showSafeArea}
                            isAigcDeclared={isAigcDeclared}
                            compactUi
                          />
                        </DeviceSimulatorFrame>
                      </div>

                      {/* Verdict Safe Area Spécifique */}
                      <div className="w-full bg-surface-container p-2.5 rounded-xl border border-surface-container-highest text-[11px] text-on-surface-variant">
                        <p className="font-semibold text-on-surface line-clamp-1">{dev.badge}</p>
                        <p className="text-[10px] font-mono text-secondary-fixed mt-0.5">
                          Safe Zone utile : {coll.safeZonePercent}% de l'écran
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Télécommande Globale Synchronisée pour le mode Multi-Vues */}
              <div className="bg-surface-container-low p-4 rounded-2xl border border-surface-container-highest shadow-xl flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="w-10 h-10 rounded-xl bg-primary-container text-white hover:bg-primary flex items-center justify-center transition shadow-md"
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
                  <span className="font-mono text-xs text-on-surface-variant">
                    Lecture synchronisée sur les 3 appareils
                  </span>
                </div>

                <div className="flex items-center gap-3">
                  <Link
                    to="/studio"
                    className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface border border-surface-container-highest text-xs font-semibold transition"
                  >
                    Modifier dans le Studio
                  </Link>
                  <Link
                    to="/calendar"
                    className="px-4 py-2 rounded-xl bg-primary-container hover:bg-primary text-white text-xs font-bold transition shadow-md flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Planifier ce Rendu</span>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* COLONNE DROITE: Conformité AIGC & Checklist Virale (3 cols, masqué ou compacté si Multi) */}
        {viewMode === "SOLO" && (
          <div className="xl:col-span-3 flex flex-col gap-5">
            {/* Conformité TikTok AIGC */}
            <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container-highest shadow-lg flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface">
                  Conformité TikTok AIGC
                </span>
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

            {/* Audit Viral & Checklist */}
            <div className="bg-surface-container-low p-5 rounded-2xl border border-surface-container-highest shadow-lg flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <span className="font-headline text-xs font-bold uppercase tracking-wider text-on-surface">
                  Audit Viral Prédictif
                </span>
                <span className="px-2 py-0.5 rounded bg-tertiary-container/30 text-tertiary-fixed font-mono text-xs font-bold border border-tertiary/40">
                  Score 94 / 100
                </span>
              </div>

              {/* Checklist Validations Multi-Écrans */}
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center gap-2 text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                  <span>Validation 19.5:9 (iPhone 15 Pro, S24)</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                  <span>Accroche textuelle lue en &lt;1.2s</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface">
                  <CheckCircle2 className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                  <span>Contraste karaoké validé WCAG AAA</span>
                </div>
                <div className="flex items-center gap-2 text-on-surface">
                  {collisionResult.hasCollision ? (
                    <AlertTriangle className="w-4 h-4 text-error flex-shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
                  )}
                  <span className={collisionResult.hasCollision ? "text-error font-semibold" : ""}>
                    {collisionResult.hasCollision ? "Alerte zone de danger active" : "Zéro collision avec boutons TikTok"}
                  </span>
                </div>
              </div>

              <Link
                to="/calendar"
                className="w-full py-3 rounded-xl bg-primary-container hover:bg-primary text-white font-headline text-xs font-bold transition shadow-lg shadow-primary-container/20 flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4" />
                <span>Valider & Planifier ce Rendu</span>
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
