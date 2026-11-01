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
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-4 animate-pulse">
        <div className="h-6 bg-zinc-800 rounded w-1/4"></div>
        <div className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-16 bg-zinc-800/60 rounded-xl flex items-center px-4 justify-between">
              <div className="flex items-center gap-3 w-1/3">
                <div className="w-10 h-10 bg-zinc-700/60 rounded-lg"></div>
                <div className="space-y-1.5 flex-1">
                  <div className="h-3 bg-zinc-700/60 rounded w-3/4"></div>
                  <div className="h-2.5 bg-zinc-700/40 rounded w-1/2"></div>
                </div>
              </div>
              <div className="h-6 bg-zinc-700/60 rounded-full w-24"></div>
              <div className="h-8 bg-zinc-700/60 rounded w-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // 2. ÉTAT ERROR
  if (isError) {
    return (
      <div className="bg-zinc-900 border border-rose-900/40 rounded-2xl p-8 text-center space-y-4 shadow-xl">
        <div className="w-12 h-12 rounded-full bg-rose-950 border border-rose-800 flex items-center justify-center mx-auto text-rose-400">
          <AlertTriangle className="w-6 h-6" />
        </div>
        <h3 className="text-base font-bold text-white">Impossible de charger les publications</h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          {errorMessage || "Une erreur est survenue lors de la communication avec l'API Fastify."}
        </p>
        <button
          type="button"
          onClick={onRefetch}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold transition"
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
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-12 text-center space-y-4 shadow-xl">
        <div className="w-14 h-14 rounded-2xl bg-zinc-800/80 border border-zinc-700 flex items-center justify-center mx-auto text-cyan-400">
          <Sparkles className="w-7 h-7" />
        </div>
        <h3 className="text-lg font-bold text-white">Aucune publication pour le moment</h3>
        <p className="text-xs text-zinc-400 max-w-md mx-auto">
          Créez votre première vidéo ou carrousel photo en 3 clics avec notre moteur d'intelligence artificielle Gemini.
        </p>
        <button
          type="button"
          onClick={onNewPost}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-xs text-white bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 transition shadow-lg shadow-pink-500/20"
        >
          <Sparkles className="w-4 h-4" />
          <span>Ouvrir le Studio IA</span>
        </button>
      </div>
    );
  }

  // 4. ÉTAT SUCCESS
  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Barre d'onglets de filtrage */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-800 pb-4">
        <div className="flex items-center gap-2">
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
                  ? "bg-zinc-800 text-white border border-zinc-700"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <button
          type="button"
          onClick={onRefetch}
          className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
          aria-label="Actualiser"
        >
          <RotateCw className="w-4 h-4" />
        </button>
      </div>

      {/* Liste des Posts */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-zinc-800 text-zinc-400 font-semibold uppercase tracking-wider">
              <th className="pb-3 pl-2">Média</th>
              <th className="pb-3">Légende & Contenu</th>
              <th className="pb-3">Type</th>
              <th className="pb-3">Statut</th>
              <th className="pb-3">Date programmée</th>
              <th className="pb-3 text-right pr-2">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800/60">
            {filteredPosts.map((post) => {
              const isRetrying = retryingPostId === post.id;
              const canRetry = post.status === "FAILED" || post.status === "MISSED";

              return (
                <tr key={post.id} className="hover:bg-zinc-950/40 transition">
                  {/* Vignette */}
                  <td className="py-3 pl-2">
                    <div className="w-12 h-16 rounded-lg bg-zinc-800 overflow-hidden border border-zinc-700/60 flex items-center justify-center flex-shrink-0">
                      {post.mediaUrls && post.mediaUrls[0] ? (
                        <img
                          src={post.mediaUrls[0]}
                          alt="Thumbnail"
                          className="w-full h-full object-cover"
                        />
                      ) : post.mediaType === "VIDEO" ? (
                        <Video className="w-5 h-5 text-zinc-500" />
                      ) : (
                        <ImageIcon className="w-5 h-5 text-zinc-500" />
                      )}
                    </div>
                  </td>

                  {/* Légende */}
                  <td className="py-3 pr-4 max-w-xs">
                    <p className="font-semibold text-white line-clamp-2">
                      {post.caption || "Sans légende"}
                    </p>
                    {post.failureReason && (
                      <div className="flex items-center gap-1.5 mt-1 text-[11px] text-rose-400">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        <span className="truncate">{post.failureReason}</span>
                      </div>
                    )}
                  </td>

                  {/* Type */}
                  <td className="py-3">
                    <span className="text-zinc-400 font-mono text-[11px]">
                      {post.mediaType === "VIDEO" ? "Vidéo 9:16" : "Carrousel"}
                    </span>
                  </td>

                  {/* Statut */}
                  <td className="py-3">
                    <StatusBadge status={post.status} />
                  </td>

                  {/* Date */}
                  <td className="py-3 text-zinc-400 font-mono text-[11px]">
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
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/50 text-rose-300 font-semibold text-xs transition disabled:opacity-50"
                      >
                        <RotateCw className={`w-3.5 h-3.5 ${isRetrying ? "animate-spin" : ""}`} />
                        <span>{isRetrying ? "Relance..." : "Réessayer"}</span>
                      </button>
                    ) : (
                      <span className="text-zinc-600 text-xs">—</span>
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
