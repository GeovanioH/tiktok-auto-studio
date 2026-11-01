import { ShieldCheck, Bell, ExternalLink } from "lucide-react";

interface NavbarProps {
  title?: string;
}

export function Navbar({ title = "TikTok Auto-Studio" }: NavbarProps) {
  return (
    <header className="h-16 border-b border-zinc-800 bg-zinc-950/70 backdrop-blur px-6 flex items-center justify-between flex-shrink-0">
      <div className="flex items-center gap-3">
        <h2 className="text-sm font-bold text-white tracking-tight">{title}</h2>
        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-950/60 border border-emerald-800/80 px-2 py-0.5 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3 h-3" />
          <span>API v2 Validée</span>
        </span>
      </div>

      <div className="flex items-center gap-4">
        <a
          href="https://developers.tiktok.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 transition"
        >
          <span>Doc TikTok v2</span>
          <ExternalLink className="w-3 h-3" />
        </a>

        <button
          type="button"
          className="relative p-2 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-900 transition"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-cyan-400" />
        </button>
      </div>
    </header>
  );
}
