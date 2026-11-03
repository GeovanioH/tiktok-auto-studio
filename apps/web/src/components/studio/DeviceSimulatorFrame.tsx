import { type ReactNode } from "react";
import { DeviceFrameset } from "react-device-frameset";
import "react-device-frameset/styles/marvel-devices.min.css";
import { type DeviceSpec } from "./DeviceDefinitions";

interface DeviceSimulatorFrameProps {
  device: DeviceSpec;
  scale?: number;
  is3DMode?: boolean;
  onClick?: () => void;
  children: ReactNode;
}

export function DeviceSimulatorFrame({
  device,
  scale = 0.85,
  is3DMode = false,
  onClick,
  children,
}: DeviceSimulatorFrameProps) {
  // 1. Branchement sur le composant npm officiel react-device-frameset si appareil Marvel
  if (device.brand === "frameset" && device.framesetDevice) {
    return (
      <div
        className="flex items-center justify-center transition-all duration-300"
        style={{
          transform: is3DMode
            ? `perspective(1200px) rotateY(-18deg) rotateX(10deg) scale(${scale})`
            : `scale(${scale})`,
          transformOrigin: "top center",
        }}
        onClick={onClick}
      >
        <DeviceFrameset
          device={device.framesetDevice}
          color={(device.chassisColor as any) || "black"}
        >
          <div className="w-full h-full overflow-hidden">
            {children}
          </div>
        </DeviceFrameset>
      </div>
    );
  }

  // 2. Châssis haute fidélité avec dimensions réelles en pixels CSS
  const screenW = device.width;
  const screenH = device.height;
  const bezel = 12; // Bordure physique réaliste
  const chassisW = screenW + bezel * 2;
  const chassisH = screenH + bezel * 2 + (device.notchType === "classic-bezel" ? 110 : 0);

  // Pour iPhone SE : hauteur avec bordure supérieure (haut-parleur) et inférieure (Touch ID)
  const isClassicBezel = device.notchType === "classic-bezel";

  return (
    <div
      className="relative flex items-center justify-center transition-all duration-500 ease-out select-none"
      style={{
        width: `${chassisW * scale}px`,
        height: `${chassisH * scale}px`,
      }}
    >
      <div
        onClick={onClick}
        style={{
          width: `${chassisW}px`,
          height: `${chassisH}px`,
          transform: is3DMode
            ? `perspective(1200px) rotateY(-18deg) rotateX(10deg) scale(${scale})`
            : `scale(${scale})`,
          transformOrigin: "top center",
          borderRadius: `${device.chassisRadius}px`,
          backgroundColor: device.chassisColor,
        }}
        className="relative shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9),0_0_50px_rgba(53,251,245,0.12)] ring-1 ring-white/15 cursor-pointer group transition-transform duration-300 flex flex-col items-center justify-between overflow-hidden"
      >
        {/* Antenne latérale et reflets titane brossé */}
        <div className="absolute inset-0 rounded-[inherit] pointer-events-none bg-gradient-to-tr from-white/10 via-transparent to-white/5 opacity-50" />

        {/* Boutons physiques sur les tranches */}
        {/* Bouton Power droit */}
        <div className="absolute -right-1 top-28 w-1 h-14 bg-white/20 rounded-r-sm pointer-events-none" />
        {/* Boutons Volume gauche */}
        <div className="absolute -left-1 top-24 w-1 h-9 bg-white/20 rounded-l-sm pointer-events-none" />
        <div className="absolute -left-1 top-36 w-1 h-9 bg-white/20 rounded-l-sm pointer-events-none" />
        {/* Bouton Action gauche */}
        <div className="absolute -left-1 top-14 w-1 h-5 bg-white/20 rounded-l-sm pointer-events-none" />

        {/* Bordure Haut classique (iPhone SE) */}
        {isClassicBezel && (
          <div className="w-full h-14 flex items-center justify-center relative bg-black/90 shrink-0">
            {/* Caméra FaceTime */}
            <div className="w-2.5 h-2.5 rounded-full bg-[#1b263b] absolute left-24" />
            {/* Grille Haut-parleur */}
            <div className="w-14 h-1.5 rounded-full bg-white/20" />
          </div>
        )}

        {/* Écran OLED réel */}
        <div
          style={{
            width: `${screenW}px`,
            height: `${screenH}px`,
            borderRadius: `${device.screenRadius}px`,
          }}
          className="relative bg-surface-container-lowest overflow-hidden flex-1 shadow-inner border border-white/5"
        >
          {children}
        </div>

        {/* Bordure Bas classique avec Bouton Touch ID (iPhone SE) */}
        {isClassicBezel && (
          <div className="w-full h-16 flex items-center justify-center bg-black/90 shrink-0">
            <div className="w-12 h-12 rounded-full border-2 border-white/30 flex items-center justify-center shadow-inner">
              <div className="w-10 h-10 rounded-full bg-black/80" />
            </div>
          </div>
        )}

        {/* Barre Home Indicateur iOS bas (sauf si Touch ID physique) */}
        {!isClassicBezel && device.brand === "apple" && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-32 h-1 bg-white/40 rounded-full pointer-events-none z-40" />
        )}
      </div>
    </div>
  );
}
