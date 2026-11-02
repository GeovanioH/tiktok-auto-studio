import { Link } from "react-router-dom";
import { ArrowLeft, FileText, CheckCircle2, AlertTriangle, ShieldAlert, Scale } from "lucide-react";

export function TermsPage() {
  return (
    <div className="min-h-screen bg-surface text-on-surface py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary-hover transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour à l'application
          </Link>
          <span className="text-xs px-3 py-1 rounded-full bg-secondary/10 text-secondary border border-secondary/20">
            Conditions Générales d'Utilisation
          </span>
        </div>

        <div className="bg-surface-container rounded-2xl border border-outline-variant p-8 md:p-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-secondary to-primary flex items-center justify-center text-slate-900 font-bold shadow-lg shadow-secondary/20">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Conditions Générales d'Utilisation
              </h1>
              <p className="text-sm text-on-surface-variant">
                Auto Studio AI — Dernière mise à jour : Novembre 2026
              </p>
            </div>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-on-surface-variant">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary" />
                1. Acceptation des Conditions
              </h2>
              <p>
                En utilisant le portail ou l'application <strong>Auto Studio AI</strong> et en associant votre compte TikTok,
                vous acceptez sans réserve les présentes Conditions Générales d'Utilisation ainsi que les
                <a href="https://www.tiktok.com/legal/terms-of-service" target="_blank" rel="noreferrer" className="text-primary hover:underline ml-1">
                  Conditions de Service TikTok
                </a> et les
                <a href="https://www.tiktok.com/community-guidelines" target="_blank" rel="noreferrer" className="text-primary hover:underline ml-1">
                  Règles Communautaires de TikTok
                </a>.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Scale className="w-4 h-4 text-cyan-400" />
                2. Nature du Service
              </h2>
              <p>
                Auto Studio AI fournit une suite d'outils automatisés pour la préparation, la mise en forme au ratio 9:16 vertical,
                l'enrichissement visuel assisté par intelligence artificielle et la programmation temporelle de posts TikTok via les API
                officielles <em>Login Kit</em> et <em>Content Posting API</em> (TikTok API v2).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-400" />
                3. Règles de Publication & Responsabilité Utilisateur
              </h2>
              <p>
                L'utilisateur assume l'entière responsabilité des contenus vidéo, visuels et textuels publiés par l'intermédiaire du Studio.
                Il s'engage formellement à :
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li>
                  <strong>Droits de Propriété Intellectuelle</strong> : Détenir l'intégralité des droits d'auteur ou licences d'exploitation
                  pour l'ensemble des éléments multimédias téléversés (musiques, images, clips vidéo).
                </li>
                <li>
                  <strong>Déclaration de Contenu IA (AIGC)</strong> : Signaler systématiquement le marqueur <code>is_aigc: true</code>
                  pour tout contenu synthétisé par des algorithmes d'IA conformément aux règles de transparence TikTok.
                </li>
                <li>
                  <strong>Respect des Quotas Officiels</strong> : Ne pas tenter de contourner la limite quotidienne imposée par TikTok
                  (quota de 20 publications par tranche de 24 heures).
                </li>
                <li>
                  <strong>Règle des 5 Minutes</strong> : Tout créneau de programmation doit être positionné au minimum 5 minutes dans le futur.
                </li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-rose-400" />
                4. Exclusion de Garantie & Limitation de Responsabilité
              </h2>
              <p>
                Le service est fourni « tel quel » (« as-is »). Bien que le logiciel mette en œuvre des mécanismes de résilience
                (BullMQ, auto-retry, surveillance d'expiration de token), nous ne pouvons garantir que la diffusion ne sera pas affectée
                par des indisponibilités de réseau externes, des maintenances de l'API TikTok ou des restrictions de compte appliquées par la plateforme tierce.
              </p>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
            <span>© 2026 Auto Studio AI — Tous droits réservés.</span>
            <div className="flex gap-4">
              <Link to="/privacy" className="hover:text-primary transition-colors">Politique de Confidentialité</Link>
              <a href="https://developers.tiktok.com/" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">TikTok for Developers</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
