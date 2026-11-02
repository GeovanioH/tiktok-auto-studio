import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck, Lock, Eye, RefreshCw, Trash2 } from "lucide-react";

export function PrivacyPage() {
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
          <span className="text-xs px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20">
            Conformité TikTok API v2
          </span>
        </div>

        <div className="bg-surface-container rounded-2xl border border-outline-variant p-8 md:p-12 shadow-2xl">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-primary to-secondary flex items-center justify-center text-slate-900 font-bold shadow-lg shadow-primary/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight">
                Politique de Confidentialité
              </h1>
              <p className="text-sm text-on-surface-variant">
                Auto Studio AI — Dernière mise à jour : Novembre 2026
              </p>
            </div>
          </div>

          <div className="space-y-8 text-sm leading-relaxed text-on-surface-variant">
            <section className="space-y-3">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Lock className="w-4 h-4 text-primary" />
                1. Responsable du Traitement & Cadre
              </h2>
              <p>
                L'application <strong>Auto Studio AI</strong> (accessible via son portail officiel) est une solution
                conçue pour la création, la programmation et la publication automatisée de vidéos courtes 9:16 et de carrousels photos sur TikTok.
                Nous respectons rigoureusement les normes de confidentialité de ByteDance et les réglementations internationales (RGPD).
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Eye className="w-4 h-4 text-secondary" />
                2. Données Collectées & Finalités
              </h2>
              <p>
                Nous limitons la collecte aux informations strictement indispensables au fonctionnement des fonctionnalités autorisées par l'utilisateur :
              </p>
              <div className="overflow-x-auto rounded-lg border border-outline-variant">
                <table className="w-full text-left text-xs">
                  <thead className="bg-surface-container-high text-on-surface font-semibold border-b border-outline-variant">
                    <tr>
                      <th className="p-3">Donnée</th>
                      <th className="p-3">Finalité</th>
                      <th className="p-3">Conservation</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-outline-variant">
                    <tr>
                      <td className="p-3 font-mono font-medium text-on-surface">open_id / union_id</td>
                      <td className="p-3">Identification unique du compte créateur TikTok connecté</td>
                      <td className="p-3">Durée de l'association du compte</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-on-surface">Tokens OAuth (Access & Refresh)</td>
                      <td className="p-3">Authentification sécurisée auprès de l'API TikTok pour publier</td>
                      <td className="p-3">Stockés chiffrés (AES-256-GCM), renouvelés ou révoqués</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-on-surface">Nom & Avatar public</td>
                      <td className="p-3">Affichage dans le Studio et confirmation du profil connecté</td>
                      <td className="p-3">Durée de connexion du compte</td>
                    </tr>
                    <tr>
                      <td className="p-3 font-mono font-medium text-on-surface">Médias & Légendes générés</td>
                      <td className="p-3">Publication planifiée selon vos instructions</td>
                      <td className="p-3">Suppression post-publication ou rétention locale contrôlée</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                3. Sécurité & Chiffrement (AES-256-GCM)
              </h2>
              <p>
                Toutes les clés d'accès et jetons d'authentification TikTok sont chiffrés au repos à l'aide de l'algorithme militaire
                <strong> AES-256-GCM</strong> avec vecteur d'initialisation unique (IV) et tag d'authentification garantissant l'intégrité absolue.
                Aucun jeton d'accès n'est jamais stocké en clair. Les communications réseau s'effectuent exclusivement via TLS 1.3 / HTTPS.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-cyan-400" />
                4. Absence Totale de Vente ou de Partage
              </h2>
              <p>
                Nous <strong>ne vendons, ne louons, ni ne partageons</strong> aucune de vos données personnelles ou analytiques
                à des courtiers de données, annonceurs tiers ou partenaires commerciaux. Vos données ne sont transmises qu'aux
                serveurs officiels de TikTok via leurs points de terminaison d'API documentés.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="text-lg font-bold text-on-surface flex items-center gap-2">
                <Trash2 className="w-4 h-4 text-rose-400" />
                5. Révocation des Accès & Droit à l'Oubli
              </h2>
              <p>
                Vous pouvez à tout instant :
              </p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Déconnecter et supprimer votre compte TikTok depuis l'onglet <em>Comptes & Quotas</em> du Studio en 1 clic.</li>
                <li>Révoquer les autorisations accordées à l'application directement depuis votre application mobile TikTok (<em>Paramètres &gt; Sécurité &gt; Applications et autorisations</em>).</li>
                <li>Demander la purge totale immédiate de votre base de données locale ou distante.</li>
              </ul>
            </section>
          </div>

          <div className="mt-10 pt-6 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-on-surface-variant">
            <span>© 2026 Auto Studio AI — Tous droits réservés.</span>
            <div className="flex gap-4">
              <Link to="/terms" className="hover:text-primary transition-colors">Conditions Générales (CGU)</Link>
              <a href="https://developers.tiktok.com/" target="_blank" rel="noreferrer" className="hover:text-primary transition-colors">TikTok for Developers</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
