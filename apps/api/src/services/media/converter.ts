import sharp from "sharp";

/**
 * Convertit et normalise un buffer d'image en JPEG haute qualité conforme TikTok (1080x1920, 95% qualité).
 * TikTok rejette catégoriquement le format PNG pour les carrousels photos.
 */
export async function convertToTikTokCompliantJpeg(inputBuffer: Buffer): Promise<Buffer> {
  if (!inputBuffer || inputBuffer.length === 0) {
    throw new TypeError("INVALID_INPUT: Le buffer d'image source ne peut pas être vide.");
  }

  return await sharp(inputBuffer)
    .resize(1080, 1920, {
      fit: "cover",
      position: "center"
    })
    .jpeg({
      quality: 95,
      progressive: true,
      mozjpeg: true
    })
    .toBuffer();
}

/**
 * Inspecte les dimensions et métadonnées d'une image.
 */
export async function getImageMetadata(buffer: Buffer): Promise<{ width?: number; height?: number; format?: string }> {
  const metadata = await sharp(buffer).metadata();
  return {
    width: metadata.width,
    height: metadata.height,
    format: metadata.format
  };
}
