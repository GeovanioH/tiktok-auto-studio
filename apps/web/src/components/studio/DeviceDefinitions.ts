export interface DeviceSpec {
  id: string;
  name: string;
  brand: "apple" | "samsung" | "google" | "android" | "frameset";
  category: "Flagship" | "Max" | "Compact 16:9" | "Android" | "Library";
  // Viewport réel en pixels CSS
  width: number;
  height: number;
  aspectRatio: string;
  screenRadius: number;
  chassisRadius: number;
  notchType: "dynamic-island" | "punch-hole" | "classic-bezel" | "teardrop" | "frameset";
  topDangerHeight: number; // Hauteur danger du haut en px (notch / tabs)
  bottomDangerHeight: number; // Hauteur danger du bas en px (caption, sound, tab bar)
  rightDangerWidth: number; // Largeur danger de droite en px (action buttons)
  badge: string;
  chassisColor: string;
  accentColor: string;
  description: string;
  framesetDevice?: "iPhone X" | "iPhone 8" | "Samsung Galaxy S5" | "Galaxy Note 8";
}

export const DEVICE_SPECS: DeviceSpec[] = [
  {
    id: "iphone-15-pro",
    name: "iPhone 15 Pro",
    brand: "apple",
    category: "Flagship",
    width: 393,
    height: 852,
    aspectRatio: "19.5:9",
    screenRadius: 44,
    chassisRadius: 54,
    notchType: "dynamic-island",
    topDangerHeight: 90,
    bottomDangerHeight: 180,
    rightDangerWidth: 70,
    badge: "Référence Standard 2026",
    chassisColor: "#28272d",
    accentColor: "#35fbf5",
    description: "393 × 852 px • 19.5:9 • Titane Naturel • Dynamic Island",
  },
  {
    id: "iphone-15-pro-max",
    name: "iPhone 15 Pro Max",
    brand: "apple",
    category: "Max",
    width: 430,
    height: 932,
    aspectRatio: "19.5:9",
    screenRadius: 46,
    chassisRadius: 58,
    notchType: "dynamic-island",
    topDangerHeight: 95,
    bottomDangerHeight: 195,
    rightDangerWidth: 75,
    badge: "Grand Écran iOS",
    chassisColor: "#1d1d21",
    accentColor: "#35fbf5",
    description: "430 × 932 px • 19.5:9 • Titane Noir • Écran 6.7 pouces",
  },
  {
    id: "samsung-s24-ultra",
    name: "Galaxy S24 Ultra",
    brand: "samsung",
    category: "Android",
    width: 412,
    height: 915,
    aspectRatio: "19.5:9",
    screenRadius: 18, // Angles vifs distinctifs de la gamme Ultra
    chassisRadius: 26,
    notchType: "punch-hole",
    topDangerHeight: 80,
    bottomDangerHeight: 185,
    rightDangerWidth: 72,
    badge: "Flagship Android",
    chassisColor: "#22252a",
    accentColor: "#fe2c55",
    description: "412 × 915 px • 19.5:9 • Châssis Angulaire Titane • Poinçon",
  },
  {
    id: "google-pixel-8-pro",
    name: "Pixel 8 Pro",
    brand: "google",
    category: "Android",
    width: 412,
    height: 892,
    aspectRatio: "20:9",
    screenRadius: 38,
    chassisRadius: 48,
    notchType: "punch-hole",
    topDangerHeight: 82,
    bottomDangerHeight: 182,
    rightDangerWidth: 72,
    badge: "Google Pure",
    chassisColor: "#1b1d22",
    accentColor: "#35fbf5",
    description: "412 × 892 px • 20:9 • Poinçon centré • Design Galbé",
  },
  {
    id: "iphone-se-16-9",
    name: "iPhone SE / 8 (16:9)",
    brand: "apple",
    category: "Compact 16:9",
    width: 375,
    height: 667,
    aspectRatio: "16:9",
    screenRadius: 0,
    chassisRadius: 42,
    notchType: "classic-bezel",
    topDangerHeight: 65,
    bottomDangerHeight: 200, // Sur 16:9, caption + nav occupent 30% du bas
    rightDangerWidth: 68,
    badge: "16:9 Haute Collision",
    chassisColor: "#121316",
    accentColor: "#fe2c55",
    description: "375 × 667 px • 16:9 • Bordures haut/bas & Bouton Home",
  },
  {
    id: "android-compact-360",
    name: "Android Compact (360px)",
    brand: "android",
    category: "Android",
    width: 360,
    height: 800,
    aspectRatio: "20:9",
    screenRadius: 28,
    chassisRadius: 36,
    notchType: "teardrop",
    topDangerHeight: 75,
    bottomDangerHeight: 175,
    rightDangerWidth: 65,
    badge: "Entrée de Gamme",
    chassisColor: "#1a1f2c",
    accentColor: "#fe2c55",
    description: "360 × 800 px • 20:9 • Écran étroit (largeur restreinte)",
  },
  {
    id: "frameset-iphone-x",
    name: "DeviceFrameset (iPhone X)",
    brand: "frameset",
    category: "Library",
    width: 375,
    height: 812,
    aspectRatio: "19.5:9",
    screenRadius: 40,
    chassisRadius: 50,
    notchType: "frameset",
    topDangerHeight: 90,
    bottomDangerHeight: 180,
    rightDangerWidth: 68,
    badge: "Composant NPM",
    chassisColor: "#000000",
    accentColor: "#35fbf5",
    description: "375 × 812 px • Rendu via react-device-frameset",
    framesetDevice: "iPhone X",
  },
  {
    id: "frameset-galaxy-s5",
    name: "DeviceFrameset (Samsung S5)",
    brand: "frameset",
    category: "Library",
    width: 360,
    height: 640,
    aspectRatio: "16:9",
    screenRadius: 0,
    chassisRadius: 36,
    notchType: "frameset",
    topDangerHeight: 60,
    bottomDangerHeight: 190,
    rightDangerWidth: 65,
    badge: "Composant NPM",
    chassisColor: "#000000",
    accentColor: "#fe2c55",
    description: "360 × 640 px • Rendu via react-device-frameset",
    framesetDevice: "Samsung Galaxy S5",
  },
];

/**
 * Calcule l'état de collision du sous-titre selon la position Y (en %) et le modèle d'appareil
 */
export function checkSubtitleCollision(
  subtitlePosYPercent: number,
  device: DeviceSpec
): {
  hasCollision: boolean;
  zone: "none" | "header" | "footer" | "safe";
  message: string;
  safeZonePercent: number;
} {
  const subtitlePixelY = (subtitlePosYPercent / 100) * device.height;
  const topDangerY = device.topDangerHeight;
  const bottomDangerY = device.height - device.bottomDangerHeight;

  // Calcul du % de zone utile
  const safeHeight = Math.max(0, bottomDangerY - topDangerY);
  const safeZonePercent = Math.round((safeHeight / device.height) * 100);

  if (subtitlePixelY <= topDangerY + 25) {
    return {
      hasCollision: true,
      zone: "header",
      message: `Collision avec les onglets/recherche TikTok sur ${device.name} (-${Math.round(topDangerY + 25 - subtitlePixelY)}px)`,
      safeZonePercent,
    };
  }

  if (subtitlePixelY >= bottomDangerY - 25) {
    return {
      hasCollision: true,
      zone: "footer",
      message: `Collision avec le texte de légende et les boutons TikTok sur ${device.name} (+${Math.round(subtitlePixelY - (bottomDangerY - 25))}px)`,
      safeZonePercent,
    };
  }

  return {
    hasCollision: false,
    zone: "safe",
    message: `100% Validé : Position parfaitement centrée dans la Safe Zone de ${device.name}`,
    safeZonePercent,
  };
}
