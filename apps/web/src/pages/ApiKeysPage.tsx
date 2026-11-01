import { useState } from "react";
import { 
  Key, 
  ExternalLink, 
  Copy, 
  Check, 
  ShieldCheck, 
  Cpu, 
  Volume2, 
  Cloud, 
  Database, 
  Lock, 
  Sparkles,
  CheckCircle2,
  AlertTriangle
} from "lucide-react";
import { SpotlightCard } from "../components/ui/SpotlightCard";
import { ShinyText } from "../components/ui/ShinyText";
import { CryptoVaultMonitor } from "../components/security/CryptoVaultMonitor";

interface ApiProvider {
  id: string;
  name: string;
  role: string;
  envVar: string;
  category: "ai" | "tiktok" | "storage" | "crypto" | "db";
  status: "configured" | "warning";
  statusLabel: string;
  portalUrl?: string;
  portalName?: string;
  tier: string;
  description: string;
  steps: string[];
  exampleValue: string;
}

export function ApiKeysPage() {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(id);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  const providers: ApiProvider[] = [
    {
      id: "gemini",
      name: "Google AI Studio (Gemini 1.5 & Imagen 3)",
      role: "Génération de scripts, hooks viraux, analyse de rétention & visuels 9:16",
      envVar: "GEMINI_API_KEY",
      category: "ai",
      status: "configured",
      statusLabel: "Prêt (Free Tier)",
      portalUrl: "https://aistudio.google.com/app/apikey",
      portalName: "aistudio.google.com",
      tier: "Gratuit — 15 requêtes/min (1M context tokens)",
      description: "Propulse le moteur créatif multimodal. Aucun abonnement payant n'est requis pour démarrer.",
      steps: [
        "Connectez-vous sur Google AI Studio avec votre compte Google.",
        "Cliquez sur « Get API key » dans la barre latérale gauche.",
        "Sélectionnez « Create API key in new project » et copiez la clé commençant par AIzaSy...",
        "Collez-la dans votre fichier .env sous GEMINI_API_KEY."
      ],
      exampleValue: 'GEMINI_API_KEY="AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"'
    },
    {
      id: "elevenlabs",
      name: "ElevenLabs Voice AI",
      role: "Synthèse vocale ultra-réaliste pour la voix-off des vidéos",
      envVar: "ELEVENLABS_API_KEY",
      category: "ai",
      status: "configured",
      statusLabel: "Prêt (10k car./mois)",
      portalUrl: "https://elevenlabs.io/app/settings/api-keys",
      portalName: "elevenlabs.io",
      tier: "Gratuit — 10 000 caractères offerts/mois",
      description: "Génère des voix expressives avec détection automatique du rythme pour l'audio ducking FFmpeg.",
      steps: [
        "Inscrivez-vous gratuitement sur ElevenLabs.io.",
        "Cliquez sur votre profil en bas à gauche → « Profile + API key ».",
        "Créez une nouvelle clé API et copiez la valeur (sk_...).",
        "En cas d'absence de clé, le studio utilise automatiquement le fallback TTS local."
      ],
      exampleValue: 'ELEVENLABS_API_KEY="sk_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"'
    },
    {
      id: "tiktok",
      name: "TikTok for Developers (Login Kit & Content Posting)",
      role: "Connexion OAuth2 sécurisée et publication directe de vidéos/photos",
      envVar: "TIKTOK_CLIENT_KEY & TIKTOK_CLIENT_SECRET",
      category: "tiktok",
      status: "configured",
      statusLabel: "Sandbox v2 Actif",
      portalUrl: "https://developers.tiktok.com/",
      portalName: "developers.tiktok.com",
      tier: "Gratuit (API Officielle ByteDance)",
      description: "Obligatoire pour publier sur TikTok sans scraping. Mode Sandbox actif avec visibilité SELF_ONLY.",
      steps: [
        "Connectez-vous sur TikTok for Developers et cliquez sur « Manage Apps ».",
        "Créez une application (« TikTok Auto Studio ») de type Productivity.",
        "Activez les produits « Login Kit » (OAuth) et « Content Posting API » (video.publish).",
        "Configurez l'URI de redirection : http://localhost:4000/api/auth/tiktok/callback",
        "Copiez Client Key et Client Secret dans votre .env."
      ],
      exampleValue: 'TIKTOK_CLIENT_KEY="awXXXXXXXXXXXX"\nTIKTOK_CLIENT_SECRET="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"'
    },
    {
      id: "cloudflare-r2",
      name: "Cloudflare R2 (Stockage S3 sur Domaine Vérifié)",
      role: "Hébergement public des vidéos 9:16 et carrousels exigé par TikTok",
      envVar: "S3_ACCESS_KEY_ID & S3_SECRET_ACCESS_KEY",
      category: "storage",
      status: "configured",
      statusLabel: "0$ Bande Passante",
      portalUrl: "https://dash.cloudflare.com/",
      portalName: "dash.cloudflare.com",
      tier: "Gratuit — 10 Go/mois & 0$ frais de sortie",
      description: "L'API TikTok exige que les médias soient servis via une URL HTTPS sur un domaine validé.",
      steps: [
        "Allez dans « R2 Object Storage » sur Cloudflare et créez le bucket « tiktok-studio-media ».",
        "Cliquez sur « Manage R2 API Tokens » et créez un token en lecture/écriture.",
        "Dans « Settings » du bucket, associez votre domaine public (ex: assets.mondomaine.com).",
        "Enregistrez ce même sous-domaine dans la console développeur TikTok (Verified Domains)."
      ],
      exampleValue: 'S3_ENDPOINT="https://<ACCOUNT_ID>.r2.cloudflarestorage.com"\nS3_ACCESS_KEY_ID="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"\nS3_SECRET_ACCESS_KEY="XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX"\nS3_BUCKET_NAME="tiktok-studio-media"\nS3_PUBLIC_VERIFIED_DOMAIN="https://assets.mondomaine.com"'
    },
    {
      id: "crypto",
      name: "Chiffrement Militaire AES-256-GCM & Session JWT",
      role: "Protection inviolable des tokens TikTok au repos en base de données",
      envVar: "ENCRYPTION_MASTER_KEY & JWT_SECRET",
      category: "crypto",
      status: "configured",
      statusLabel: "Généré Localement",
      tier: "100% Local (Sécurité bancaire)",
      description: "Ces clés ne dépendent d'aucun service tiers. Vous les générez directement sur votre machine.",
      steps: [
        "Exécutez la commande Node.js ci-dessous dans votre terminal pour générer 64 caractères hex.",
        "Collez les deux valeurs générées dans votre fichier .env.",
        "Attention : ne changez jamais cette clé en production sous peine d'invalider les tokens existants."
      ],
      exampleValue: 'ENCRYPTION_MASTER_KEY="a1b2c3d4e5f60718293a4b5c6d7e8f90a1b2c3d4e5f60718293a4b5c6d7e8f90"\nJWT_SECRET="super_secret_jwt_key_pour_sessions_http_only_32_caracteres"'
    },
    {
      id: "database",
      name: "PostgreSQL 16 & Redis 7 (BullMQ)",
      role: "Persistance relationnelle Prisma et moteur de planification asynchrone",
      envVar: "DATABASE_URL & REDIS_URL",
      category: "db",
      status: "configured",
      statusLabel: "Docker / Cloud",
      portalUrl: "https://neon.tech/",
      portalName: "neon.tech / upstash.com",
      tier: "Gratuit (Docker en local ou Neon + Upstash en Cloud)",
      description: "Gère les comptes connectés, l'historique des publications et les relances BullMQ.",
      steps: [
        "Pour tester en local : lancez simplement « docker compose up -d ».",
        "Pour le cloud : créez une base PostgreSQL gratuite sur Neon.tech et Redis sur Upstash.com.",
        "Renseignez les URLs de connexion correspondantes dans votre fichier .env."
      ],
      exampleValue: 'DATABASE_URL="postgresql://postgres:postgres_password@localhost:5432/tiktok_studio?schema=public"\nREDIS_URL="redis://localhost:6379"'
    }
  ];

  const cryptoCommand = `node -e "console.log('ENCRYPTION_MASTER_KEY=' + require('crypto').randomBytes(32).toString('hex')); console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"`;

  return (
    <div className="space-y-8 max-w-7xl mx-auto pb-12">
      {/* Header Awwwards */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-xl bg-pink-500/10 text-pink-400 border border-pink-500/20">
              <Key className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <ShinyText text="Centre de Configuration des Clés API" speed={3.5} />
            </h1>
          </div>
          <p className="text-sm text-zinc-400 mt-1">
            Guide pas à pas pour connecter l'IA générative, TikTok Developer Portal, le stockage S3 et le chiffrement militaire.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/60 border border-emerald-800 text-emerald-400 text-xs font-mono">
            <ShieldCheck className="w-4 h-4" />
            <span>Audit ByteDance Conforme</span>
          </div>
        </div>
      </div>

      {/* Bento Grid : Générateur Crypto Rapide en 1 Clic */}
      <SpotlightCard
        spotlightColor="rgba(37, 244, 238, 0.15)"
        className="p-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-cyan-500/30"
      >
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Générateur Express de Clés Cryptographiques Locales
              </h3>
            </div>
            <p className="text-xs text-zinc-400">
              Générez instantanément vos clés AES-256-GCM et JWT de 64 caractères hexadécimaux sans quitter votre terminal.
            </p>
          </div>

          <button
            onClick={() => handleCopy(cryptoCommand, "crypto-cmd")}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-zinc-950 font-bold text-xs transition duration-200 shadow-lg shadow-cyan-500/20"
          >
            {copiedKey === "crypto-cmd" ? (
              <>
                <Check className="w-4 h-4" />
                <span>Copié dans le presse-papier !</span>
              </>
            ) : (
              <>
                <Copy className="w-4 h-4" />
                <span>Copier la commande Node.js</span>
              </>
            )}
          </button>
        </div>

        <div className="mt-4 p-3 rounded-lg bg-black/60 border border-zinc-800 font-mono text-xs text-cyan-300 break-all select-all">
          {cryptoCommand}
        </div>
      </SpotlightCard>

      {/* Moniteur de Chiffrement Militaire AES-256-GCM avec Pluie Matrix Utile */}
      <CryptoVaultMonitor />

      {/* Grille des Fournisseurs d'API */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {providers.map((provider) => (
          <SpotlightCard
            key={provider.id}
            spotlightColor={
              provider.category === "ai"
                ? "rgba(37, 244, 238, 0.15)"
                : provider.category === "tiktok"
                ? "rgba(254, 44, 85, 0.15)"
                : "rgba(168, 85, 247, 0.15)"
            }
            className="p-6 flex flex-col justify-between space-y-4"
          >
            <div className="space-y-4">
              {/* Carte Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {provider.category === "ai" && <Cpu className="w-4 h-4 text-cyan-400" />}
                    {provider.category === "tiktok" && <Volume2 className="w-4 h-4 text-pink-400" />}
                    {provider.category === "storage" && <Cloud className="w-4 h-4 text-purple-400" />}
                    {provider.category === "crypto" && <Lock className="w-4 h-4 text-emerald-400" />}
                    {provider.category === "db" && <Database className="w-4 h-4 text-amber-400" />}
                    <h3 className="text-base font-bold text-white">{provider.name}</h3>
                  </div>
                  <p className="text-xs text-zinc-400">{provider.role}</p>
                </div>

                <span className="text-[10px] font-mono px-2.5 py-1 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 whitespace-nowrap">
                  {provider.statusLabel}
                </span>
              </div>

              {/* Badges Info */}
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-mono bg-zinc-900 text-emerald-400 px-2 py-0.5 rounded border border-emerald-950">
                  {provider.tier}
                </span>
                <span className="text-[10px] font-mono bg-zinc-900 text-zinc-400 px-2 py-0.5 rounded border border-zinc-800">
                  {provider.envVar}
                </span>
              </div>

              <p className="text-xs text-zinc-300 leading-relaxed">
                {provider.description}
              </p>

              {/* Étapes pas à pas */}
              <div className="p-3.5 rounded-xl bg-zinc-950/80 border border-zinc-900 space-y-2">
                <p className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                  Étapes de configuration :
                </p>
                <ol className="text-xs text-zinc-400 space-y-1.5 list-decimal list-inside pl-1">
                  {provider.steps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* Actions & Bouton Portail */}
            <div className="pt-3 border-t border-zinc-900 flex items-center justify-between gap-3">
              {provider.portalUrl ? (
                <a
                  href={provider.portalUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1.5 text-xs text-cyan-400 hover:text-cyan-300 font-semibold transition group"
                >
                  <span>Ouvrir {provider.portalName}</span>
                  <ExternalLink className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition" />
                </a>
              ) : (
                <span className="text-xs text-zinc-500 font-mono">Génération interne</span>
              )}

              <button
                onClick={() => handleCopy(provider.exampleValue, provider.id)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 transition"
                title="Copier le format .env"
              >
                {copiedKey === provider.id ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copié</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier modèle</span>
                  </>
                )}
              </button>
            </div>
          </SpotlightCard>
        ))}
      </div>

      {/* Guide Audit TikTok ByteDance Banner */}
      <SpotlightCard
        spotlightColor="rgba(254, 44, 85, 0.15)"
        className="p-6 bg-gradient-to-r from-zinc-950 via-zinc-900 to-zinc-950 border-pink-500/30 flex flex-col md:flex-row items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-pink-400 shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">
              Prêt pour la soumission d'audit commercial ByteDance ?
            </h4>
            <p className="text-xs text-zinc-400 mt-0.5">
              Suivez le protocole de screencast vidéo de 3 minutes 30 pour débloquer la visibilité publique sur TikTok.
            </p>
          </div>
        </div>

        <a
          href="/docs/AUDIT_SCREENCAST_GUIDE.md"
          target="_blank"
          className="px-4 py-2 rounded-xl bg-pink-500 hover:bg-pink-400 text-white font-bold text-xs transition duration-200 shrink-0"
        >
          Consulter le guide Screencast
        </a>
      </SpotlightCard>
    </div>
  );
}
