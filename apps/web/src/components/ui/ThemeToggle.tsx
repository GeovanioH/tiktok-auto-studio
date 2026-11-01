import { useEffect, useState } from "react";
import { Sun, Moon } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showLabels?: boolean;
}

export function ThemeToggle({ className = "", showLabels = false }: ThemeToggleProps) {
  const [isDark, setIsDark] = useState<boolean>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
    }
    return true; // Mode sombre par défaut
  });

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.setAttribute("data-theme", "dark");
      root.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
      root.classList.add("light");
      localStorage.setItem("theme", "light");
    }
  }, [isDark]);

  const handleToggle = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <div className={`flex items-center gap-2 select-none ${className}`.trim()}>
      {showLabels && (
        <span className="text-[11px] font-medium text-zinc-400 flex items-center gap-1">
          {isDark ? (
            <>
              <Moon className="w-3 h-3 text-cyan-400" />
              <span>Nuit</span>
            </>
          ) : (
            <>
              <Sun className="w-3 h-3 text-amber-500" />
              <span>Blanc</span>
            </>
          )}
        </span>
      )}

      <label
        className="theme-switch"
        title={isDark ? "Basculer en Mode Fond Blanc (Studio Clair)" : "Basculer en Mode Sombre (Studio Nuit)"}
      >
        <input
          type="checkbox"
          checked={isDark}
          onChange={handleToggle}
          aria-label="Basculer le thème fond blanc / sombre"
        />
        <span className="slider" />
      </label>
    </div>
  );
}

export default ThemeToggle;
