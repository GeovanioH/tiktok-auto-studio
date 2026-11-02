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
      setPosts([]);
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
    <div className="max-w-[1720px] mx-auto space-y-6 pb-12">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-on-surface tracking-tight font-headline">Historique des Publications</h1>
          <p className="text-xs text-on-surface-variant mt-1">
            Gérez vos contenus, suivez le statut de publication et relancez les échecs en 1 clic.
          </p>
        </div>
      </div>

      {notification && (
        <div
          className={`flex items-center gap-2.5 p-4 rounded-xl border text-xs font-semibold animate-in fade-in ${
            notification.type === "success"
              ? "bg-surface-container-low border-secondary-fixed/50 text-secondary"
              : "bg-surface-container-low border-primary/50 text-primary"
          }`}
        >
          {notification.type === "success" ? (
            <CheckCircle2 className="w-4 h-4 text-secondary-fixed flex-shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-primary flex-shrink-0" />
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
