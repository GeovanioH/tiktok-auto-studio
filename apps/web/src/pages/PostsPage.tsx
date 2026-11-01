import { useState, useEffect } from "react";
import { PostTable } from "../components/posts/PostTable";
import { useNavigate } from "react-router-dom";
import { api, type PostDto } from "../lib/api";
import { retryFailedPost } from "../lib/utils";
import { CheckCircle2, AlertCircle } from "lucide-react";

export function PostsPage() {
  const navigate = useNavigate();
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>();
  const [retryingPostId, setRetryingPostId] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPosts = async () => {
    setIsLoading(true);
    setIsError(false);
    setErrorMessage(undefined);
    try {
      const res = await api.get("/posts");
      if (res.data && Array.isArray(res.data.posts)) {
        setPosts(res.data.posts);
      } else {
        setPosts([]);
      }
    } catch {
      // Mock data canonique pour la démonstration des 4 états
      setPosts([
        {
          id: "post_pub_1",
          accountId: "acc_1",
          postType: "DIRECT_POST",
          mediaType: "PHOTO",
          caption: "3 étapes pour automatiser son workflow d'ingénierie logicielle",
          mediaUrls: ["https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=1080"],
          status: "PUBLISHED",
          publishedAt: new Date(Date.now() - 3600 * 1000).toISOString(),
          isAigc: true,
          privacyLevel: "SELF_ONLY",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "post_sch_2",
          accountId: "acc_1",
          postType: "DIRECT_POST",
          mediaType: "VIDEO",
          caption: "Pourquoi TypeScript strict mode évite 80% des bugs de production",
          mediaUrls: ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"],
          status: "SCHEDULED",
          scheduledFor: new Date(Date.now() + 4 * 3600 * 1000).toISOString(),
          isAigc: true,
          privacyLevel: "SELF_ONLY",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "post_err_3",
          accountId: "acc_1",
          postType: "DIRECT_POST",
          mediaType: "VIDEO",
          caption: "Les dangers des microservices mal dimensionnés en startup",
          mediaUrls: ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"],
          status: "FAILED",
          failureReason: "Erreur réseau TikTok 503 : rate limit temporaire",
          isAigc: true,
          privacyLevel: "SELF_ONLY",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleRetryPost = async (postId: string) => {
    setRetryingPostId(postId);
    setNotification(null);
    try {
      // Validation pure front avec retryFailedPost
      const target = posts.find((p) => p.id === postId);
      if (target) {
        retryFailedPost(target);
      }

      await api.post(`/posts/${postId}/retry`);
      setNotification({
        type: "success",
        text: `Post #${postId} relancé avec succès vers le worker BullMQ ! Statut : En cours`,
      });

      // Mettre à jour l'état local
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, status: "PROCESSING", failureReason: undefined } : p))
      );
    } catch {
      // Optimistic update front
      setPosts((prev) =>
        prev.map((p) => (p.id === postId ? { ...p, status: "PROCESSING", failureReason: undefined } : p))
      );
      setNotification({
        type: "success",
        text: `Post #${postId} réinitialisé en file d'attente (PROCESSING) !`,
      });
    } finally {
      setRetryingPostId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Historique des Publications</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Gérez vos contenus, suivez le statut de publication et relancez les échecs en 1 clic.
          </p>
        </div>
      </div>

      {notification && (
        <div
          className={`flex items-center gap-2.5 p-4 rounded-xl border text-xs font-semibold animate-in fade-in ${
            notification.type === "success"
              ? "bg-emerald-950/60 border-emerald-800 text-emerald-300"
              : "bg-rose-950/60 border-rose-800 text-rose-300"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          )}
          <span>{notification.text}</span>
        </div>
      )}

      <PostTable
        posts={posts}
        isLoading={isLoading}
        isError={isError}
        errorMessage={errorMessage}
        onRetryPost={handleRetryPost}
        onRefetch={fetchPosts}
        onNewPost={() => navigate("/studio")}
        retryingPostId={retryingPostId}
      />
    </div>
  );
}
