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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in">
      <div className="relative w-full max-w-md bg-surface-container border border-surface-container-highest rounded-2xl p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 text-on-surface-variant hover:text-on-surface transition"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-secondary-fixed/10 border border-secondary-fixed/20 text-secondary-fixed flex items-center justify-center">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-on-surface">Programmer la publication</h3>
            <p className="text-xs text-on-surface-variant">Diffusion automatisée sur l'API officielle TikTok v2</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-on-surface mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-on-surface-variant" />
              <span>Date et heure locale (minimum +5 min)</span>
            </label>
            <input
              type="datetime-local"
              value={dateTimeValue}
              onChange={(e) => {
                setDateTimeValue(e.target.value);
                setErrorMessage(null);
              }}
              className="w-full bg-surface-container-low border border-surface-container-highest rounded-lg px-3.5 py-2.5 text-sm text-on-surface focus:outline-none focus:border-secondary-fixed focus:ring-1 focus:ring-secondary-fixed transition"
              required
            />
          </div>

          <div className="bg-surface-container-low/70 border border-surface-container-highest rounded-lg p-3 text-xs text-on-surface-variant space-y-1">
            <p>
              • <strong className="text-on-surface">Règle de sécurité TikTok :</strong> La date doit être supérieure d'au moins 5 minutes à l'instant présent.
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
              className="px-4 py-2 rounded-lg text-sm text-on-surface-variant hover:text-on-surface hover:bg-surface-container-high transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-900 bg-gradient-to-r from-secondary-fixed to-cyan-400 hover:brightness-110 disabled:opacity-50 transition shadow-lg shadow-secondary-fixed/20"
            >
              {isSubmitting ? "Enregistrement..." : "Confirmer la programmation"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
