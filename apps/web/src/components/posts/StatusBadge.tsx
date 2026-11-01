export type PostStatusType = "DRAFT" | "SCHEDULED" | "PROCESSING" | "PUBLISHED" | "FAILED" | "MISSED";

interface StatusBadgeProps {
  status: PostStatusType;
  className?: string;
}

export function StatusBadge({ status, className = "" }: StatusBadgeProps) {
  const configs: Record<PostStatusType, { label: string; bg: string; text: string; dot: string }> = {
    DRAFT: {
      label: "Brouillon",
      bg: "bg-zinc-800/80 border-zinc-700",
      text: "text-zinc-300",
      dot: "bg-zinc-400",
    },
    SCHEDULED: {
      label: "Programmé",
      bg: "bg-blue-950/60 border-blue-800/80",
      text: "text-blue-300",
      dot: "bg-blue-400",
    },
    PROCESSING: {
      label: "En cours",
      bg: "bg-amber-950/60 border-amber-800/80",
      text: "text-amber-300",
      dot: "bg-amber-400 animate-pulse",
    },
    PUBLISHED: {
      label: "Publié",
      bg: "bg-emerald-950/60 border-emerald-800/80",
      text: "text-emerald-300",
      dot: "bg-emerald-400",
    },
    FAILED: {
      label: "Échec",
      bg: "bg-rose-950/60 border-rose-800/80",
      text: "text-rose-300",
      dot: "bg-rose-400",
    },
    MISSED: {
      label: "Manqué (>15m)",
      bg: "bg-orange-950/60 border-orange-800/80",
      text: "text-orange-300",
      dot: "bg-orange-400",
    },
  };

  const config = configs[status] || configs.DRAFT;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.bg} ${config.text} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      <span>{config.label}</span>
    </span>
  );
}
