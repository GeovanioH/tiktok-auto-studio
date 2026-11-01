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

  // Fuseau horaire détecté
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;

  // Calcul des 7 jours de la semaine
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
    <div className="bg-surface-container-low border border-surface-container-highest rounded-2xl p-5 shadow-lg space-y-5">
      {/* Entête du Calendrier */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-on-surface flex items-center gap-2 font-headline">
            <Clock className="w-5 h-5 text-secondary" />
            <span>Grille Temporelle de Programmation</span>
          </h2>
          <p className="text-xs text-on-surface-variant mt-1">
            Fuseau local détecté : <span className="text-secondary-fixed font-mono">{timeZone}</span> (Règle stricte des +5 min)
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentWeekOffset((p) => p - 1)}
            className="p-2 rounded-lg bg-surface-container border border-surface-container-highest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition"
            aria-label="Semaine précédente"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={() => setCurrentWeekOffset(0)}
            className="px-3 py-1.5 rounded-lg bg-surface-container border border-surface-container-highest text-xs font-semibold text-on-surface hover:bg-surface-container-high transition font-mono"
          >
            Aujourd'hui
          </button>
          <button
            type="button"
            onClick={() => setCurrentWeekOffset((p) => p + 1)}
            className="p-2 rounded-lg bg-surface-container border border-surface-container-highest text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition"
            aria-label="Semaine suivante"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grille des 7 jours */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7 gap-3">
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
              className={`rounded-xl border p-3 min-h-[240px] flex flex-col justify-between transition-all ${
                isToday
                  ? "bg-surface-container border-secondary-fixed/50 shadow-md ring-1 ring-secondary-fixed/20"
                  : "bg-surface-container border-surface-container-highest"
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[11px] font-bold uppercase text-on-surface-variant font-mono">
                    {dayDate.toLocaleDateString("fr-FR", { weekday: "short" })}
                  </span>
                  <span
                    className={`text-xs font-extrabold px-1.5 py-0.5 rounded font-mono ${
                      isToday ? "bg-secondary-fixed text-black" : "text-on-surface"
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
                      className="bg-surface-container-low border border-surface-container-highest rounded-lg p-2.5 text-[11px] space-y-1.5 shadow-sm"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-secondary font-mono text-[10px] font-semibold">
                          {post.scheduledFor ? new Date(post.scheduledFor).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }) : ""}
                        </span>
                        <StatusBadge status={post.status} />
                      </div>
                      <p className="text-on-surface line-clamp-2 leading-tight font-medium">
                        {post.caption || post.title}
                      </p>
                    </div>
                  ))}

                  {dayPosts.length === 0 && (
                    <div className="text-[11px] text-on-surface-variant italic py-6 text-center opacity-60">
                      Créneau disponible
                    </div>
                  )}
                </div>
              </div>

              {/* Créneau d'audience optimale */}
              <div className="mt-3 pt-2 border-t border-surface-container-highest flex items-center justify-between text-[10px] text-on-surface-variant font-mono">
                <span className="text-tertiary">Pic: 18h-20h</span>
                <button
                  type="button"
                  onClick={() => {
                    const slot = new Date(dayDate);
                    slot.setHours(18, 0, 0, 0);
                    onSelectSlot?.(slot.toISOString());
                  }}
                  className="hover:text-secondary-fixed text-on-surface-variant transition p-1"
                  title="Planifier sur ce jour à 18h"
                >
                  <PlusCircle className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
