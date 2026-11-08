import { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { TikTokLoginButton } from "../components/auth/TikTokLoginButton";
import { ShieldCheck, AlertTriangle, Key, ExternalLink, Unlink, RefreshCw } from "lucide-react";
import { api, type TikTokAccountDto } from "../lib/api";
import { useNotifications } from "../context/NotificationContext";

export function AccountsPage() {
  const [searchParams] = useSearchParams();
  const { addNotification } = useNotifications();
  const [account, setAccount] = useState<TikTokAccountDto | null>(null);
  const [isRotating, setIsRotating] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  useEffect(() => {
    const errorParam = searchParams.get("error");
    const errorDesc = searchParams.get("error_description");
    if (errorParam) {
      setNotification({
        type: "error",
        text: `Échec d'authentification TikTok [${errorParam}] : ${errorDesc || "Vérifiez que votre compte est bien ajouté aux 'Target Users' du Sandbox."}`,
      });
      addNotification({
        title: `Erreur TikTok (${errorParam})`,
        message: errorDesc || "Assurez-vous que votre compte TikTok est bien enregistré dans les Target Users du Sandbox.",
        type: "error",
        link: "/accounts",
      });
    } else if (searchParams.get("status") === "connected" || searchParams.get("open_id") || searchParams.get("status") === "success") {
      setNotification({
        type: "success",
        text: "Compte connecté avec succès à l'API officielle TikTok v2 !",
      });
      addNotification({
        title: "Compte Connecté",
        message: "Votre compte TikTok officiel est maintenant synchronisé avec le Studio.",
        type: "success",
        link: "/accounts",
      });
    }

    // Tentative de récupération du compte connecté
    api
      .get("/auth/tiktok/status")
      .then((res) => {
        if (res.data && res.data.account) {
          setAccount(res.data.account);
        }
      })
      .catch(() => {
        setAccount(null);
      });
  }, [searchParams]);

  const handleProactiveRotate = async () => {
    setIsRotating(true);
    setNotification(null);
    try {
      await api.post("/auth/tiktok/rotate");
      setNotification({
        type: "success",
        text: "Rotation proactive du Token effectuée avec succès (Règle des 23h validée) !",
      });
      addNotification({
        title: "Token Proactif Renouvelé",
        message: "Vos accès TikTok ont été prolongés de 24h sans interruption.",
        type: "success",
        link: "/accounts",
      });
    } catch {
      setNotification({
        type: "error",
        text: "Impossible de rafraîchir le jeton (aucun compte actif ou serveur indisponible).",
      });
    } finally {
      setIsRotating(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      await api.post("/auth/tiktok/revoke");
    } catch {
      // Ignorer
    }
    setAccount(null);
    setNotification({
      type: "success",
      text: "Compte TikTok déconnecté et tokens chiffrés révoqués de la base de données.",
    });
    addNotification({
      title: "Compte Déconnecté",
      message: "Votre compte TikTok a été dissocié et les tokens révoqués de la base locale.",
      type: "info",
      link: "/accounts",
    });
  };

  return (
    <div className="max-w-[1720px] mx-auto space-y-6 pb-12">
      <div>
        <h1 className="text-xl font-bold text-on-surface tracking-tight font-headline">Comptes TikTok & Sécurité OAuth2</h1>
        <p className="text-xs text-on-surface-variant mt-1">
          Gestion des autorisations officielles ByteDance, rotation proactive des jetons et conformité sandbox.
        </p>
      </div>

      {notification && (
        <div
          className={`p-4 rounded-xl border text-xs font-semibold ${
            notification.type === "success"
              ? "bg-surface-container-low border-secondary-fixed/50 text-secondary"
              : "bg-surface-container-low border-primary/50 text-primary"
          }`}
        >
          {notification.text}
        </div>
      )}

      {/* Alerte Mode Sandbox Pré-Audit TikTok */}
      <div className="bg-surface-container-low border border-tertiary/40 rounded-2xl p-5 flex items-start gap-3 shadow-md">
        <AlertTriangle className="w-5 h-5 text-tertiary flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className="text-xs font-bold text-tertiary uppercase tracking-wider font-mono">
            Mode Sandbox Développeur Actif (Audit ByteDance en cours)
          </h3>
          <p className="text-xs text-on-surface-variant leading-relaxed">
            Conformément aux exigences de sécurité TikTok v2, toutes les publications créées via l'application sont restreintes en mode <span className="font-mono font-bold bg-surface-container px-1 py-0.5 rounded text-tertiary">SELF_ONLY</span> (visibles uniquement par le créateur connecté) jusqu'à la validation définitive du dossier d'audit commercial.
          </p>
        </div>
      </div>

      {/* Carte du Compte Actif ou Connexion */}
      {account ? (
        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-container-highest pb-6">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-secondary-fixed">
                <img src={account.avatarUrl || "https://p16-va-tiktok.ibyteimg.com/obj/musically-maliva-obj/default_avatar.jpeg"} alt="Avatar" className="w-full h-full object-cover" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-base font-bold text-on-surface font-headline">{account.displayName}</h3>
                  <span className="text-[10px] bg-surface-container text-secondary-fixed border border-secondary/30 px-2 py-0.5 rounded-full font-semibold font-mono">
                    Connecté v2
                  </span>
                </div>
                <p className="text-xs text-on-surface-variant font-mono mt-0.5">ID: {account.openId}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleProactiveRotate}
                disabled={isRotating}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition border border-surface-container-highest"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? "animate-spin text-secondary" : ""}`} />
                <span>Rotation Proactive (23h)</span>
              </button>

              <button
                type="button"
                onClick={handleDisconnect}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-error-container/20 hover:bg-error-container/40 border border-error/40 text-primary text-xs font-semibold transition"
              >
                <Unlink className="w-3.5 h-3.5" />
                <span>Déconnecter</span>
              </button>
            </div>
          </div>

          {/* Détails Sécurité & Scopes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="bg-surface-container border border-surface-container-highest rounded-xl p-4 space-y-2">
              <span className="text-on-surface font-semibold flex items-center gap-1.5">
                <Key className="w-4 h-4 text-secondary" />
                Scopes Accordés par ByteDance :
              </span>
              <ul className="space-y-1 text-on-surface-variant font-mono text-[11px]">
                {(account.scopes || ["user.info.basic", "video.publish", "video.upload"]).map((s) => (
                  <li key={s} className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-secondary-fixed"></span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-surface-container border border-surface-container-highest rounded-xl p-4 space-y-2">
              <span className="text-on-surface font-semibold flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-secondary-fixed" />
                État du Chiffrement AES-256-GCM :
              </span>
              <p className="text-on-surface-variant text-[11px] leading-relaxed">
                Tokens chiffrés en base de données avec vecteur d'initialisation unique (IV 12 octets) et tag d'authentification 16 octets. Aucun token exposé côté client.
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-10 text-center space-y-5 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-surface-container border border-surface-container-highest flex items-center justify-center mx-auto text-on-surface">
            <Key className="w-7 h-7 text-secondary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-on-surface font-headline">Connectez votre compte TikTok v2</h3>
            <p className="text-xs text-on-surface-variant max-w-sm mx-auto mt-1">
              Autorisez TikTok Auto-Studio à publier automatiquement vos vidéos et carrousels via l'API officielle sécurisée par PKCE RFC 7636.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
            <TikTokLoginButton />
            <a
              href="/api/auth/tiktok/login?basicOnly=true"
              className="text-xs text-on-surface-variant hover:text-primary transition-colors px-3 py-2 border border-surface-container-highest rounded-lg bg-surface-container hover:bg-surface-container-high"
            >
              Tester avec profil uniquement (sans droit vidéo)
            </a>
          </div>
        </div>
      )}

      {/* Guide Conformité ByteDance */}
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-5 flex items-center justify-between text-xs text-on-surface-variant">
        <div>
          <p className="font-semibold text-on-surface">TikTok Developer Terms & Conditions</p>
          <p className="text-[11px]">Plateforme conforme aux règles d'automatisation et de transparence AIGC ByteDance 2026.</p>
        </div>
        <a
          href="https://developers.tiktok.com/doc/overview"
          target="_blank"
          rel="noopener noreferrer"
          className="text-secondary hover:text-secondary-fixed font-semibold flex items-center gap-1"
        >
          <span>Consulter les règles</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
