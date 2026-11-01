import { useState } from "react";
import { ChevronLeft, ChevronRight, Clock, PlusCircle } from "lucide-react";
import { StatusBadge } from "../posts/StatusBadge";
import type { PostDto } from "../../lib/api";

interface CalendarGridProps {
  posts: PostDto[];
  onSelectSlot?: (dateIso: string) => void;
}

export function CalendarGrid({ posts, onSelectSlot }: CalendarGridProps) {
  const [currentWeekOffset, setCurrentWeekOffset] = useState(0);

  // Fuseau horaire de l'utilisateur détecté
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Calcul des 7 jours de la semaine courante
  const now = new Date();
  const startOfWeek = new Date(now);
  const day = startOfWeek.getDay();
  const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1) + currentWeekOffset * 7;
  startOfWeek.setDate(diff);
  startOfWeek.setHours(0, 0, 0, 0);

  const daysOfWeek = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(startOfWeek);
    d.setDate(startOfWeek.getDate() + i);
    return d;
  });


  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Entête du Calendrier */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-cyan-400" />
            <span>Grille Temporelle de Programmation</span>
          </h2>
          <p className="text-xs text-zinc-400 mt-1">
            Fuseau local détecté : <span className="text-cyan-400 font-mono">{timeZone}</span> (Règle stricte des +5 min)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentWeekOffset((p) => p - 1)}
            className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
            aria-label="Semaine précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentWeekOffset(0)}
            className="px-3 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition"
          >
            Aujourd'hui
          </button>
          <button
            type="button"
            onClick={() => setCurrentWeekOffset((p) => p + 1)}
            className="p-2 rounded-lg bg-zinc-950 border border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700 transition"
            aria-label="Semaine suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grille des 7 jours */}
      <div className="grid grid-cols-1 sm:grid-cols-7 gap-3">
        {daysOfWeek.map((dayDate, idx) => {
          const isToday =
            dayDate.getDate() === now.getDate() &&
            dayDate.getMonth() === now.getMonth() &&
            dayDate.getFullYear() === now.getFullYear();

          const dayPosts = posts.filter((p) => {
            if (!p.scheduledFor) return false;
            const postDate = new Date(p.scheduledFor);
            return (
              postDate.getDate() === dayDate.getDate() &&
              postDate.getMonth() === dayDate.getMonth() &&
              postDate.getFullYear() === dayDate.getFullYear()
            );
          });

          return (
            <div
              key={idx}
              className={`rounded-xl border p-3 min-h-[220px] flex flex-col justify-between ${
                isToday
                  ? "bg-cyan-950/20 border-cyan-500/50"
                  : "bg-zinc-950/70 border-zinc-800/80"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase text-zinc-400">
                    {dayDate.toLocaleDateString("fr-FR", { weekday: "short" })}
                  </span>
                  <span
                    className={`text-xs font-extrabold px-1.5 py-0.5 rounded ${
                      isToday ? "bg-cyan-400 text-black" : "text-zinc-300"
                    }`}
                  >
                    {dayDate.getDate()}
                  </span>
                </div>

                {/* Posts du jour */}
                <div className="space-y-2 mt-2">
                  {dayPosts.map((post) => (
                    <div
                      key={post.id}
                      className="bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-[11px] space-y-1.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-zinc-400 font-mono text-[10px]">
                          {post.scheduledFor ? new Date(post.scheduledFor).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                        <StatusBadge status={post.status} />
                      </div>
                      <p className="text-zinc-200 line-clamp-2 leading-tight">
                        {post.caption || post.title}
                      </p>
                    </div>
                  ))}

                  {dayPosts.length === 0 && (
                    <div className="text-[11px] text-zinc-600 italic py-4 text-center">
                      Aucun post planifié
                    </div>
                  )}
                </div>
              </div>

              {/* Créneau d'audience optimale */}
              <div className="mt-3 pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[10px] text-zinc-500">
                <span>Pic TikTok: 18h-20h</span>
                <button
                  type="button"
                  onClick={() => {
                    const slot = new Date(dayDate);
                    slot.setHours(18, 0, 0, 0);
                    onSelectSlot?.(slot.toISOString());
                  }}
                  className="hover:text-cyan-400 transition"
                  title="Planifier sur ce jour à 18h"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
