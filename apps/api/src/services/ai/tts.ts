export interface SubtitleCue {
  startSec: number;
  endSec: number;
  text: string;
}

export interface TTSResult {
  audioBuffer: Buffer;
  durationSeconds: number;
  cues: SubtitleCue[];
}

export class TTSService {
  async generateSpeechWithTimestamps(text: string): Promise<TTSResult> {
    if (!text || text.trim().length === 0) {
      throw new Error("INVALID_TEXT: Le texte pour la synthèse vocale ne peut pas être vide.");
    }

    const words = text.trim().split(/\s+/);
    const durationPerWord = 0.35; // ~170 mots / min standard TikTok
    let currentTime = 0;

    const cues: SubtitleCue[] = [];
    // Regroupement par blocs de 3 à 4 mots pour l'affichage dynamique
    for (let i = 0; i < words.length; i += 3) {
      const chunk = words.slice(i, i + 3).join(" ");
      const chunkDuration = (words.slice(i, i + 3).length) * durationPerWord;
      cues.push({
        startSec: Number(currentTime.toFixed(2)),
        endSec: Number((currentTime + chunkDuration).toFixed(2)),
        text: chunk
      });
      currentTime += chunkDuration;
    }

    // Mock buffer audio MP3
    const mockMp3Buffer = Buffer.from("ID3_MOCK_MP3_AUDIO_STREAM_TIKTOK_VOICEOVER");

    return {
      audioBuffer: mockMp3Buffer,
      durationSeconds: Math.ceil(currentTime),
      cues
    };
  }
}

export const ttsService = new TTSService();
