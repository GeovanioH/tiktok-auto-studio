import { useState } from "react";
import { RotateCw, AlertTriangle, Video, Image as ImageIcon, Sparkles, AlertCircle } from "lucide-react";
import { StatusBadge } from "./StatusBadge";
import type { PostDto } from "../../lib/api";

interface PostTableProps {
  posts: PostDto[];
  isLoading: boolean;
  isError: boolean;
  errorMessage?: string;
  onRetryPost: (postId: string) => void;
  onRefetch: () => void;
  onNewPost: () => void;
  retryingPostId?: string | null;
}

export function PostTable({
  posts,
  isLoading,
  isError,
  errorMessage,
  onRetryPost,
  onRefetch,
  onNewPost,
  retryingPostId,
}: PostTableProps) {
  const [activeTab, setActiveTab] = useState<"ALL" | "SCHEDULED" | "PUBLISHED" | "FAILED">("ALL");

  const filteredPosts = posts.filter((p) => {
    if (activeTab === "ALL") return true;
    if (activeTab === "SCHEDULED") return p.status === "SCHEDULED";
    if (activeTab === "PUBLISHED") return p.status === "PUBLISHED";
    if (activeTab === "FAILED") return p.status === "FAILED" || p.status === "MISSED";
    return true;
  });

  // 1. ÉTAT LOADING (Squelettes shimmer aux dimensions exactes)
  if (isLoading) {
    return (
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-6 shadow-xl space-y-4 animate-pulse">
        <div className="h-6 bg-surface-container rounded w-1/4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-surface-container/60 rounded-xl flex items-center px-4 justify-between">
              <div className="flex items-center gap-3 w-1/3">
                <div className="w-10 h-10 bg-surface-container-highest rounded-lg"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-surface-container-highest rounded w-3/4"></div>
                  <div className="h-2.5 bg-surface-container-highest/60 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-6 bg-surface-container-highest rounded-full w-24"></div>
              <div className="h-8 bg-surface-container-highest rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. ÉTAT ERROR
  if (isError) {
    return (
      <div className="bg-surface-container-low border border-error/40 rounded-2xl p-8 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-error-container/30 border border-error/50 flex items-center justify-center mx-auto text-primary">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-on-surface font-headline">Impossible de charger les publications</h3>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto">
          {errorMessage || "Une erreur est survenue lors de la communication avec l'API Fastify."}
        </p>
        <button
          type="button"
          onClick={onRefetch}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition border border-surface-container-highest"
        >
          <RotateCw className="w-3.5 h-3.5" />
          <span>Réessayer le chargement</span>
        </button>
      </div>
    );
  }

  // 3. ÉTAT EMPTY
  if (posts.length === 0) {
    return (
      <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-12 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-surface-container border border-surface-container-highest flex items-center justify-center mx-auto text-secondary">
          <Sparkles className="w-7 h-7 text-secondary-fixed" />
        </div>
        <h3 className="text-lg font-bold text-on-surface font-headline">Aucune publication pour le moment</h3>
        <p className="text-xs text-on-surface-variant max-w-md mx-auto">
          Créez votre première vidéo ou carrousel photo en 3 clics avec notre moteur d'intelligence artificielle Gemini.
        </p>
        <button
          type="button"
          onClick={onNewPost}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-on-primary-container bg-primary-container hover:bg-primary transition shadow-lg shadow-primary-container/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ouvrir le Studio IA</span>
        </button>
      </div>
    );
  }

  // 4. ÉTAT SUCCESS
  return (
    <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-6 shadow-xl space-y-6">
      {/* Barre d'onglets de filtrage */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-surface-container-highest pb-4">
        <div className="flex items-center gap-2 flex-wrap">
          {[
            { id: "ALL", label: `Tous (${posts.length})` },
            { id: "SCHEDULED", label: `Programmés (${posts.filter((p) => p.status === "SCHEDULED").length})` },
            { id: "PUBLISHED", label: `Publiés (${posts.filter((p) => p.status === "PUBLISHED").length})` },
            { id: "FAILED", label: `Échecs (${posts.filter((p) => p.status === "FAILED" || p.status === "MISSED").length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                activeTab === tab.id
                  ? "bg-surface-container-highest text-on-surface border border-surface-container-highest font-bold"
                  : "text-on-surface-variant hover:text-on-surface"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onRefetch}
          className="p-1.5 rounded-lg text-on-surface-variant hover:text-on-surface hover:bg-surface-container transition"
          aria-label="Actualiser"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Liste des Posts */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-surface-container-highest text-on-surface-variant font-semibold uppercase tracking-wider font-mono text-[11px]">
              <th className="pb-3 pl-2">Média</th>
              <th className="pb-3">Légende & Contenu</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Statut</th>
              <th className="pb-3">Date programmée</th>
              <th className="pb-3 text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-container-highest/60">
            {filteredPosts.map((post) => {
              const isRetrying = retryingPostId === post.id;
              const canRetry = post.status === "FAILED" || post.status === "MISSED";

              return (
                <tr key={post.id} className="hover:bg-surface-container/40 transition">
                  {/* Vignette */}
                  <td className="py-3 pl-2">
                    <div className="w-12 h-16 rounded-lg bg-surface-container overflow-hidden border border-surface-container-highest flex items-center justify-center flex-shrink-0">
                      {post.mediaUrls && post.mediaUrls[0] ? (
                        <img
                          src={post.mediaUrls[0]}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : post.mediaType === "VIDEO" ? (
                        <Video className="w-5 h-5 text-on-surface-variant" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-on-surface-variant" />
                      )}
                    </div>
                  </td>

                  {/* Légende */}
                  <td className="py-3 pr-4 max-w-xs">
                    <p className="font-semibold text-on-surface line-clamp-2">
                      {post.caption || "Sans légende"}
                    </p>
                    {post.failureReason && (
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-primary">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{post.failureReason}</span>
                      </div>
                    )}
                  </td>

                  {/* Type */}
                  <td className="py-3">
                    <span className="text-on-surface-variant font-mono text-[11px]">
                      {post.mediaType === "VIDEO" ? "Vidéo 9:16" : "Carrousel"}
                    </span>
                  </td>

                  {/* Statut */}
                  <td className="py-3">
                    <StatusBadge status={post.status} />
                  </td>

                  {/* Date */}
                  <td className="py-3 text-on-surface-variant font-mono text-[11px]">
                    {post.scheduledFor
                      ? new Date(post.scheduledFor).toLocaleString("fr-FR", {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                      : "—"}
                  </td>

                  {/* Actions (Relance 1-clic) */}
                  <td className="py-3 text-right pr-2">
                    {canRetry ? (
                      <button
                        type="button"
                        onClick={() => onRetryPost(post.id)}
                        disabled={isRetrying}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-primary-container/20 hover:bg-primary-container/30 border border-primary-container/50 text-primary font-semibold text-xs transition disabled:opacity-50"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
                        <span>{isRetrying ? "Relance..." : "Réessayer"}</span>
                      </button>
                    ) : (
                      <span className="text-on-surface-variant/40 text-xs">—</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
