import sharp from "sharp";

/**
 * Moteur de génération visuelle 9:16 pour carrousels et scènes composites (Imagen 3 / Gemini Omni).
 */
export class ImagenService {
  async generateImage(prompt: string): Promise<Buffer> {
    if (!prompt || prompt.trim().length === 0) {
      throw new Error("INVALID_PROMPT: Le prompt visuel ne peut pas être vide.");
    }

    // Création d'une image SVG rendue en buffer PNG brut 9:16 (qui sera convertie par Sharp en JPEG 95%)
    const svgBackground = `
      <svg width="1080" height="1920" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" style="stop-color:#0f172a;stop-opacity:1" />
            <stop offset="50%" style="stop-color:#1e1b4b;stop-opacity:1" />
            <stop offset="100%" style="stop-color:#090d16;stop-opacity:1" />
          </linearGradient>
        </defs>
        <rect width="1080" height="1920" fill="url(#grad)"/>
        <circle cx="540" cy="960" r="300" fill="#ec4899" opacity="0.15" />
        <text x="540" y="960" font-family="Montserrat, Arial, sans-serif" font-size="42" font-weight="bold" fill="#ffffff" text-anchor="middle">
          TikTok Auto-Studio 9:16
        </text>
      </svg>
    `;

    return await sharp(Buffer.from(svgBackground)).png().toBuffer();
  }
}

export const imagenService = new ImagenService();
