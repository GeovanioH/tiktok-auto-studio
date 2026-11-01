# ==============================================================================
# MASTER PROMPT D'INGÉNIERIE — SPRINT 04 : PIPELINE IA OMNIMODAL (GEMINI OMNI) & FFMPEG
# ==============================================================================

> **Destinataire du Prompt :** Agent Autonome d'Ingénierie Logicielle (AI & Media Pipeline Specialist)  
> **Niveau de Contexte Initial :** Zéro Connaissance Préalable (Self-Contained Master Prompt)  
> **Projet :** TikTok Auto-Studio  
> **Objectif du Sprint :** Orchestration complète de la génération par IA omnimodale via **Google Gemini Omni** (couvrant aussi bien la génération d'images 9:16 haute fidélité que la génération directe de vidéos natives et la structuration JSON de scripts), enrichi par Google Imagen 3 pour les carrousels, ElevenLabs / Gemini Speech pour la voix-off, conversion d'images obligatoire PNG $\rightarrow$ JPEG 95% via Sharp pour conformité TikTok, hébergement Cloudflare R2 sur sous-domaine vérifié, et moteur de montage composite FFmpeg (Ken Burns, sous-titres animés `.ass`).

---

## 1. RÔLE, POSTURE ET RÈGLES D'ENGAGEMENT DE L'AGENT

Tu agis en tant que **Principal AI Engineer & Audio/Video Pipeline Architect**.
Tu vas construire le cœur génératif du Studio TikTok en 3 clics, alimenté par l'architecture omnimodale de Google Gemini Omni.

### Règles d'or absolues :
1. **Couverture Totale Images & Vidéos via Gemini Omni :** Le système doit exploiter Gemini Omni à la fois pour :
   - La génération de scripts et d'accroches virales typées Zod.
   - La génération d'images percutantes 9:16 (format carrousel ou scènes).
   - La **génération vidéo native omnimodale 9:16** avec continuité de mouvement et cinématique fluide.
2. **Double Mode Vidéo Supporté :**
   - Mode `OMNI_NATIVE_VIDEO` : Génération vidéo directe par Gemini Omni.
   - Mode `COMPOSITE_STUDIO_VIDEO` : Assemblage modulaire (visuels Gemini Omni/Imagen 3 + TTS + animation Ken Burns + sous-titres dynamiques `.ass` via FFmpeg).
3. **Rejet Formel des PNG par TikTok :** L'API TikTok rejette systématiquement les fichiers PNG pour les carrousels photos. Ton pipeline de traitement d'images doit convertir tout visuel généré ou uploadé en **JPEG (qualité 95%) ou WEBP** via la librairie **Sharp**.
4. **Contrainte du Domaine Vérifié :** Les URLs publiques des médias doivent impérativement pointer vers le sous-domaine validé auprès de TikTok : `https://assets.mondomaine-verifie.com/...`. Aucune URL brute temporaire (ex: S3 ou Replicate) n'est autorisée.
5. **Structuration JSON Zod Infaillible :** Le modèle doit répondre sous la forme d'un objet JSON strict conforme à un schéma Zod validé au runtime. Zéro markdown wrapper (` ```json `), zéro texte parasite.
6. **Ratio Vertical Strict 9:16 :** Tous les visuels et vidéos doivent être au format $1080 \times 1920$ pixels (30 fps pour la vidéo).
7. **Transparence AIGC :** Tout post généré par ce pipeline doit porter l'attribut `is_aigc: true` en base et dans les métadonnées de sortie.

---

## 2. CONTEXTE GLOBAL DU PROJET : "TIKTOK AUTO-STUDIO"

### 2.1 Qu'est-ce que TikTok Auto-Studio ?
**TikTok Auto-Studio** permet à un utilisateur de saisir une simple idée textuelle (ex: *"3 astuces méconnues pour négocier son salaire"*) et d'obtenir en 60 secondes un contenu prêt à publier sur TikTok sous trois formats :
- **Carrousel Photo TikTok :** Série ordonnée de 3 à 5 diapositives 9:16 percutantes avec texte incrusté et légende optimisée SEO (générées par Gemini Omni / Imagen 3 et converties en JPEG).
- **Vidéo Native Omni (Gemini Omni) :** Clip vidéo vertical 9:16 cinématographique généré directement par le moteur omnimodal de Gemini avec motion naturel.
- **Vidéo Composite Studio (FFmpeg) :** Enchaînement des scènes visuelles avec animation zoom dynamique (*Ken Burns*), voix-off synchronisée et sous-titres animés au centre (style TikTok / Alex Hormozi).

### 2.2 Comment fonctionne l'orchestration avec Gemini Omni ?
1. **Gemini Omni (Texte, Idéation & Mise en Scène) :** Reçoit l'idée et génère le titre, le hook, le script découpé en scènes avec prompts visuels 9:16 ou prompts vidéo temporels, la légende et les hashtags SEO.
2. **Gemini Omni Video Engine (Mode Vidéo Native) :** Génère directement le rendu vidéo MP4 9:16 fluide à partir du scénario.
3. **Gemini Omni / Imagen 3 (Mode Images & Composite) :** Produit les visuels 9:16 haute fidélité.
4. **Sharp (Conversion) :** Convertit les images en JPEG optimisé 1080x1920 et les pousse sur Cloudflare R2.
5. **TTS (Synthèse Vocale) :** Génère la voix-off MP3 avec extraction des timestamps mot-à-mot.
6. **Worker FFmpeg (Montage Composite) :** Pour le mode composite, assemble les JPEG avec animation Ken Burns, mixe la piste voix-off et incruste les sous-titres dynamiques via un fichier `.ass`.

---

## 3. ÉTAT DU PROJET AVANT CE SPRINT (POINT DE DÉPART)

Avant d'entamer ce sprint :
- L'infrastructure locale est active (`docker-compose.yml` avec PostgreSQL et Redis).
- Le schéma Prisma contient les modèles `Post`, `MediaAsset`, et `AiQuota`.
- Le module environnemental `src/lib/config/env.ts` fournit `GEMINI_API_KEY`, `ELEVENLABS_API_KEY`, `S3_ENDPOINT`, `S3_ACCESS_KEY_ID`, `S3_SECRET_ACCESS_KEY`, `S3_BUCKET_NAME`, `S3_PUBLIC_VERIFIED_DOMAIN`.

---

## 4. MISSION PRÉCISE DU SPRINT 04

Tu dois implémenter le pipeline de génération complet en réalisant les 6 actions suivantes :
1. **Client Stockage Cloudflare R2 (`src/lib/storage/r2.ts`) :** Téléversement binaire vers R2 avec génération immédiate de l'URL publique absolue pointant vers `env.S3_PUBLIC_VERIFIED_DOMAIN`.
2. **Convertisseur d'Images Sharp (`src/lib/media/converter.ts`) :** Conversion de buffers PNG/RAW en JPEG 95% avec redimensionnement forcé $1080 \times 1920$ (object-fit: cover).
3. **Orchestrateur Omnimodal Gemini Omni (`src/lib/ai/gemini.ts`) :** Appel à l'API Google Gemini Omni avec typage strict Zod pour l'analyse d'intention, la rédaction de scripts, et la génération de visuels.
4. **Générateur Vidéo Native Gemini Omni (`src/lib/ai/omniVideo.ts`) :** Génération directe de clips vidéo verticaux 9:16 pour le mode `OMNI_NATIVE_VIDEO`.
5. **Générateur Visuel Imagen 3 & Gemini Omni (`src/lib/ai/imagen.ts`) :** Inférence des scènes et diapositives 9:16 avec gestion des retries et envoi vers le convertisseur Sharp.
6. **Générateur de Sous-titres `.ass` & Worker FFmpeg (`src/lib/ffmpeg/composer.ts`) :** Création du fichier de sous-titres stylisés (police blanche avec contour noir, centrage bas-milieu) et commande FFmpeg pour le mode `COMPOSITE_STUDIO_VIDEO`.
7. **Route API du Studio (`src/app/api/ai/generate/route.ts`) :** Endpoint recevant l'idée de l'utilisateur et le mode souhaité (`PHOTO_CAROUSEL`, `OMNI_NATIVE_VIDEO`, `COMPOSITE_STUDIO_VIDEO`), vérifiant les quotas journaliers, orchestrant le pipeline et enregistrant le post en base.

---

## 5. SPÉCIFICATIONS TECHNIQUES DÉTAILLÉES & CONTRATS DE CODE

### 5.1 Schéma Zod du Studio Omnimodal (`src/lib/ai/types.ts`)

```typescript
import { z } from "zod";

export const StudioGenerationModeSchema = z.enum([
  "PHOTO_CAROUSEL",        // Carrousel de photos 9:16 (Gemini Omni / Imagen 3 + Sharp)
  "OMNI_NATIVE_VIDEO",     // Vidéo directe générée nativement par Gemini Omni
  "COMPOSITE_STUDIO_VIDEO" // Vidéo montée via FFmpeg (images + voix TTS + Ken Burns + .ass)
]);

export type StudioGenerationMode = z.infer<typeof StudioGenerationModeSchema>;

export const SceneSchema = z.object({
  sceneNumber: z.number().int().min(1).max(5),
  spokenText: z.string().min(5).max(300), // Texte prononcé par la voix-off
  imagePrompt: z.string().min(10).max(500), // Prompt visuel détaillé pour Imagen 3 / Gemini Omni
  videoPrompt: z.string().min(10).max(500).optional(), // Directives de motion pour Gemini Omni Video
  textOverlay: z.string().max(60).optional() // Titre court optionnel incrusté
});

export const GeminiScriptOutputSchema = z.object({
  title: z.string().min(5).max(100),
  hook: z.string().min(5).max(150),
  mode: StudioGenerationModeSchema.default("COMPOSITE_STUDIO_VIDEO"),
  scenes: z.array(SceneSchema).min(3).max(5),
  caption: z.string().min(10).max(2200),
  hashtags: z.array(z.string().regex(/^#[a-zA-Z0-9_]+$/)).min(3).max(10)
});

export type GeminiScriptOutput = z.infer<typeof GeminiScriptOutputSchema>;
```

### 5.2 Convertisseur Sharp & Règle JPEG TikTok (`src/lib/media/converter.ts`)

```typescript
import sharp from "sharp";

export async function convertToTikTokCompliantJpeg(inputBuffer: Buffer): Promise<Buffer> {
  // TikTok exige JPEG ou WEBP (PNG strictement rejeté en carrousel)
  // Résolution cible : 1080x1920 (9:16 vertical)
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
```

### 5.3 Générateur de Sous-Titres `.ass` (`src/lib/ffmpeg/subtitles.ts`)
Pour obtenir le rendu moderne TikTok (mots lisibles au centre sans empiéter sur la description basse) :

```typescript
export function generateAssSubtitles(
  cues: Array<{ startSec: number; endSec: number; text: string }>
): string {
  const header = `[Script Info]
ScriptType: v4.00+
PlayResX: 1080
PlayResY: 1920
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: TikTokStyle,Montserrat,68,&H00FFFFFF,&H000000FF,&H00000000,&H80000000,-1,0,0,0,100,100,0,0,1,6,3,2,60,60,420,1

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

function formatAssTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const cs = Math.floor((seconds % 1) * 100);
  return `${h}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}.${String(cs).padStart(2, "0")}`;
}
```

### 5.4 Commande de Montage FFmpeg (`src/lib/ffmpeg/composer.ts`)
Le script de composition orchestre l'animation Ken Burns pour chaque image avec concaténation fluide et incrustation audio :

```typescript
import { exec } from "child_process";
import { promisify } from "util";
const execAsync = promisify(exec);

export async function composeVideoWithKenBurns(options: {
  imagePaths: string[];
  sceneDurations: number[];
  audioPath: string;
  assSubtitlePath: string;
  outputPath: string;
}): Promise<void> {
  const { imagePaths, sceneDurations, audioPath, assSubtitlePath, outputPath } = options;

  let inputs = "";
  let filterComplex = "";
  let concatInputs = "";

  imagePaths.forEach((imgPath, index) => {
    const duration = sceneDurations[index];
    const frames = Math.round(duration * 30);
    inputs += `-loop 1 -t ${duration} -i "${imgPath}" `;

    // Alternance entre zoom avant et zoom arrière pour dynamiser la vidéo
    const zoomExpr =
      index % 2 === 0
        ? "min(zoom+0.0015,1.25)"
        : "min(max(zoom,1.25)-0.0015,1.0)";

    filterComplex += `[${index}:v]scale=8000x-1,zoompan=z='${zoomExpr}':d=${frames}:x='iw/2-(iw/zoom/2)':y='ih/2-(ih/zoom/2)':s=1080x1920:fps=30[v${index}]; `;
    concatInputs += `[v${index}]`;
  });

  const totalScenes = imagePaths.length;
  filterComplex += `${concatInputs}concat=n=${totalScenes}:v=1:a=0[v_concat]; `;
  filterComplex += `[v_concat]subtitles='${assSubtitlePath}'[v_out]`;

  const cmd = `ffmpeg -y ${inputs} -i "${audioPath}" -filter_complex "${filterComplex}" -map "[v_out]" -map ${totalScenes}:a -c:v libx264 -preset fast -crf 22 -pix_fmt yuv420p -c:a aac -b:a 192k -ar 44100 -shortest "${outputPath}"`;

  await execAsync(cmd);
}
```

### 5.5 Endpoint Studio `POST /api/ai/generate` (`src/app/api/ai/generate/route.ts`)

#### Algorithme du contrôleur :
1. Extraction et validation du body via `AIGenerateRequestSchema` (prompt, format: `PHOTO_CAROUSEL`, `OMNI_NATIVE_VIDEO`, ou `COMPOSITE_STUDIO_VIDEO`).
2. Récupération de l'utilisateur en session.
3. Transaction Prisma :
   - Vérification du quota dans `AiQuota` : si `dailyConsumed >= dailyLimit`, renvoyer HTTP 403 avec code `QUOTA_EXCEEDED`.
   - Incrémentation atomique de `dailyConsumed += 1`.
4. Appel à `generateScriptWithGeminiOmni(prompt)` $\rightarrow$ Obtention de l'objet JSON typé.
5. Branchement selon le mode :
   - **Branche A : `OMNI_NATIVE_VIDEO` (Vidéo Directe Gemini Omni)**
     - Appel au moteur vidéo natif `generateNativeVideoWithGeminiOmni(script)`
     - Upload direct du MP4 9:16 produit sur Cloudflare R2 (`https://assets.mondomaine-verifie.com/...`)
   - **Branche B : `PHOTO_CAROUSEL` (Carrousel Photos)**
     - Inférence des visuels 9:16 via Gemini Omni & Imagen 3
     - Conversion de chaque image en JPEG 95% via `convertToTikTokCompliantJpeg()` (Sharp)
     - Upload des images JPEG vers Cloudflare R2
   - **Branche C : `COMPOSITE_STUDIO_VIDEO` (Montage Hybride FFmpeg)**
     - Inférence des images 9:16 via Gemini Omni / Imagen 3 + Conversion Sharp
     - Génération de la voix-off via TTS $\rightarrow$ Sauvegarde du MP3
     - Génération du fichier `.ass`
     - Exécution du montage FFmpeg (Ken Burns + Sous-titres) $\rightarrow$ Upload du MP4 final vers R2
6. Création de l'enregistrement `Post` au statut `DRAFT` avec ses relations `MediaAsset` ordonnées (`sequenceOrder`).
7. Retour de la réponse JSON avec l'aperçu complet pour l'utilisateur.

---

## 6. INVENTAIRE DES FICHIERS À PRODUIRE DANS CE SPRINT

```text
src/
└── lib/
    ├── storage/
    │   └── r2.ts
    ├── media/
    │   └── converter.ts
    ├── ai/
    │   ├── types.ts
    │   ├── gemini.ts        # Orchestrateur Gemini Omni (Text, Vision, Prompts)
    │   ├── omniVideo.ts     # Moteur de génération vidéo native Gemini Omni
    │   ├── imagen.ts        # Génération visuelle Imagen 3 / Gemini Omni
    │   └── tts.ts           # Synthèse vocale & Timestamps
    └── ffmpeg/
        ├── subtitles.ts     # Génération de sous-titres .ass
        └── composer.ts      # Montage FFmpeg (mode composite)
src/
└── app/
    └── api/
        ├── ai/
        │   └── generate/
        │       └── route.ts
        └── media/
            └── upload/
                └── route.ts
tests/
└── integration/
    ├── imageConversion.test.ts
    └── aiPipeline.test.ts
```

---

## 7. SUITE DE TESTS D'INTÉGRATION (`tests/integration/`)

1. **Test de conversion Sharp (`imageConversion.test.ts`) :**
   - Transmet une image PNG 500x500 transparente.
   - Vérifie que la sortie est un buffer JPEG valide (`image/jpeg`).
   - Vérifie que les dimensions résultantes sont exactement $1080 \times 1920$.
2. **Test de validation du format d'URL vérifiée :**
   - Vérifie que toute URL de média générée commence strictement par `https://assets.mondomaine-verifie.com/`.
3. **Test d'épuisement de quota :**
   - Simule un utilisateur ayant `dailyConsumed = 3` et `dailyLimit = 3`.
   - Tente d'appeler l'endpoint de génération et vérifie la réception du code HTTP 403 `QUOTA_EXCEEDED`.

---

## 8. PROTOCOLE D'EXÉCUTION ET DE VALIDATION

1. **Compilation des modules :**
   ```bash
   pnpm typecheck
   ```
2. **Exécution des tests d'intégration multimédia :**
   ```bash
   pnpm test tests/integration/imageConversion.test.ts
   ```

---

## 9. FORMAT DE RESTITUTION DU RAPPORT DE FIN DE SPRINT

```markdown
### ✅ RAPPORT DE CLÔTURE — SPRINT 04 : PIPELINE IA MULTIMODAL & FFMPEG

1. **Statut :** TERMINE AVEC SUCCÈS
2. **Fichiers créés :**
   - `src/lib/storage/r2.ts`
   - `src/lib/media/converter.ts`
   - `src/lib/ai/gemini.ts`, `imagen.ts`, `tts.ts`, `types.ts`
   - `src/lib/ffmpeg/subtitles.ts`, `composer.ts`
   - `src/app/api/ai/generate/route.ts` & `src/app/api/media/upload/route.ts`
   - `tests/integration/imageConversion.test.ts`
3. **Preuves de Validation :**
   - Conversion PNG $\rightarrow$ JPEG 1080x1920 validée
   - URLs pointant sur le domaine vérifié Cloudflare R2
   - Découpage et syntaxe FFmpeg vérifiés
4. **Prêt pour le Sprint 05 :** Moteur Asynchrone de Planification BullMQ & Résilience.
```
