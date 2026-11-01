export interface SubtitleCue {
  startSec: number;
  endSec: number;
  text: string;
}

export interface WordTiming {
  word: string;
  startSec: number;
  endSec: number;
}

/**
 * Formate les secondes au format standard ASS (h:mm:ss.cs).
 */
export function formatAssTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}

/**
 * Génère un script de sous-titres .ass avec style dynamique centré TikTok.
 */
export function generateAssSubtitles(cues: SubtitleCue[]): string {
  if (!cues || cues.length === 0) {
    throw new Error("INVALID_CUES: La liste des sous-titres ne peut pas être vide.");
  }

  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: TikTokStyle,Montserrat,68,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,6,3,2,60,60,420,1
Style: TikTokKaraoke,Montserrat,74,&H0000FFFF,&H000000FF,&H00000000,&H90000000,-1,0,0,0,105,105,0,0,1,8,4,2,60,60,420,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events = cues
    .map((cue) => {
      const start = formatAssTime(cue.startSec);
      const end = formatAssTime(cue.endSec);
      return `Dialogue: 0,${start},${end},TikTokStyle,,0,0,0,,${cue.text.toUpperCase()}`;
    })
    .join("\n");

  return header + events;
}

/**
 * Génère un script de sous-titres .ass avec surbrillance Karaoké TikTok mot-à-mot.
 * Rétro-ingénierie REA inspirée des leaders Submagic & Opus Clip.
 */
export function generateKaraokeAssSubtitles(
  segments: Array<{ text: string; words: WordTiming[] }>
): string {
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: TikTokKaraoke,Montserrat,72,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,7,3,2,60,60,420,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;

  const events: string[] = [];

  for (const seg of segments) {
    for (let i = 0; i < seg.words.length; i++) {
      const activeWord = seg.words[i];
      const start = formatAssTime(activeWord.startSec);
      const end = formatAssTime(activeWord.endSec);

      // Met en surbrillance jaune fluo (&H0000FFFF&) le mot actuellement prononcé
      const formattedLine = seg.words
        .map((w, idx) => {
          if (idx === i) {
            return `{\\c&H0000FFFF&\\fscx110\\fscy110}${w.word.toUpperCase()}{\\r}`;
          }
          return `{\\c&H00FFFFFF&}${w.word.toUpperCase()}`;
        })
        .join(" ");

      events.push(`Dialogue: 0,${start},${end},TikTokKaraoke,,0,0,0,,${formattedLine}`);
    }
  }

  return header + events.join("\n");
}
