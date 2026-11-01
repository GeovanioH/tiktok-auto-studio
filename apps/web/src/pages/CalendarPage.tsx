import { useState, useEffect } from "react";
import { CalendarGrid } from "../components/calendar/CalendarGrid";
import { ScheduleModal } from "../components/studio/ScheduleModal";
import { api, type PostDto } from "../lib/api";
import { Sparkles, CheckCircle2, AlertCircle } from "lucide-react";

export function CalendarPage() {
  const [posts, setPosts] = useState<PostDto[]>([]);
  const [isScheduleOpen, setIsScheduleOpen] = useState(false);
  const [notification, setNotification] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const fetchPosts = async () => {
    try {
      const res = await api.get("/posts");
      if (res.data && Array.isArray(res.data.posts)) {
        setPosts(res.data.posts);
      }
    } catch {
      // Mock data par défaut pour prévisualiser le calendrier
      const mockNow = new Date();
      setPosts([
        {
          id: "post_cal_1",
          accountId: "acc_1",
          postType: "DIRECT_POST",
          mediaType: "PHOTO",
          caption: "Les 3 leviers secrets de la viralité TikTok en 2026",
          mediaUrls: ["https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1080"],
          status: "SCHEDULED",
          scheduledFor: new Date(mockNow.getTime() + 2 * 3600 * 1000).toISOString(),
          isAigc: true,
          privacyLevel: "SELF_ONLY",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        {
          id: "post_cal_2",
          accountId: "acc_1",
          postType: "DIRECT_POST",
          mediaType: "VIDEO",
          caption: "Routine matinale d'un solopreneur tech à succès",
          mediaUrls: ["https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4"],
          status: "PUBLISHED",
          scheduledFor: new Date(mockNow.getTime() - 24 * 3600 * 1000).toISOString(),
          publishedAt: new Date(mockNow.getTime() - 24 * 3600 * 1000).toISOString(),
          isAigc: true,
          privacyLevel: "SELF_ONLY",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      ]);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleConfirmSchedule = (isoDate: string) => {
    setNotification({
      type: "success",
      text: `Créneau réservé pour le ${new Date(isoDate).toLocaleString("fr-FR")}. Rendez-vous dans le Studio pour finaliser !`,
    });
    setIsScheduleOpen(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Calendrier Éditorial</h1>
          <p className="text-xs text-zinc-400 mt-1">
            Visualisez vos publications passées et planifiées au fuseau horaire local.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsScheduleOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-pink-500 to-cyan-500 hover:from-pink-400 hover:to-cyan-400 shadow-lg shadow-pink-500/20 transition"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Programmer un post</span>
        </button>
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

      <CalendarGrid
        posts={posts}
        onSelectSlot={() => setIsScheduleOpen(true)}
      />

      <ScheduleModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onConfirm={handleConfirmSchedule}
      />
    </div>
  );
}
