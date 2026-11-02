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
      root.classList.add("dark");
      root.classList.remove("light");
      localStorage.setItem("theme", "dark");
    } else {
      root.setAttribute("data-theme", "light");
      root.classList.add("light");
      root.classList.remove("dark");
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
              <Moon className="w-3 h-3 text-secondary-fixed" />
              <span>Nuit</span>
            </>
          ) : (
            <>
              <Sun className="w-3 h-3 text-amber-500" />
              <span>Clair</span>
            </>
          )}
        </span>
      )}

      <label
        className="theme-switch"
        title={isDark ? "Basculer en Mode Studio Clair (Platine)" : "Basculer en Mode Studio Nuit (Ardoise)"}
      >
        <input
          type="checkbox"
          checked={isDark}
          onChange={handleToggle}
          aria-label="Basculer le thème clair / nuit"
        />
        <span className="slider" />
      </label>
    </div>
  );
}

export default ThemeToggle;
