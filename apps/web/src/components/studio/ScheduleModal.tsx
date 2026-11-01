import { useState } from "react";
import { Calendar, Clock, AlertCircle, X } from "lucide-react";
import { validateScheduledTime } from "../../lib/utils";

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (scheduledIsoDate: string) => void;
  isSubmitting?: boolean;
}

export function ScheduleModal({
  isOpen,
  onClose,
  onConfirm,
  isSubmitting = false,
}: ScheduleModalProps) {
  // Déterminer la date minimale recommandée : maintenant + 10 minutes (au format YYYY-MM-DDTHH:mm)
  const defaultMinDate = new Date(Date.now() + 10 * 60 * 1000);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const defaultString = `${defaultMinDate.getFullYear()}-${pad(defaultMinDate.getMonth() + 1)}-${pad(
    defaultMinDate.getDate()
  )}T${pad(defaultMinDate.getHours())}:${pad(defaultMinDate.getMinutes())}`;

  const [dateTimeValue, setDateTimeValue] = useState(defaultString);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const validation = validateScheduledTime(dateTimeValue);
    if (!validation.isValid) {
      setErrorMessage(validation.errorMessage || "Date et heure non valides.");
      return;
    }

    const isoDate = new Date(dateTimeValue).toISOString();
    onConfirm(isoDate);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Programmer la publication</h3>
            <p className="text-xs text-zinc-400">Diffusion automatisée sur l'API officielle TikTok v2</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              <span>Date et heure locale (minimum +5 min)</span>
            </label>
            <input
              type="datetime-local"
              value={dateTimeValue}
              onChange={(e) => {
                setDateTimeValue(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-lg px-3.5 py-2.5 text-sm text-white focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition"
              required
            />
          </div>

          <div className="bg-zinc-950/60 border border-zinc-800/80 rounded-lg p-3 text-xs text-zinc-400 space-y-1">
            <p>
              • <strong className="text-zinc-300">Règle de sécurité TikTok :</strong> La date doit être supérieure d'au moins 5 minutes à l'instant présent.
            </p>
            <p>• Conversion automatique en UTC par le serveur.</p>
          </div>

          {errorMessage && (
            <div className="flex items-start gap-2 bg-rose-950/40 border border-rose-800/80 rounded-lg p-3 text-xs text-rose-300">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5 text-rose-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm text-zinc-400 hover:text-white hover:bg-zinc-800 transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-white bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 disabled:opacity-50 transition shadow-lg shadow-cyan-500/20"
            >
              {isSubmitting ? "Enregistrement..." : "Confirmer la programmation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
