import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Validateur de créneau temporel pour le calendrier (+5 min strict, max 30 jours)
 */
export function validateScheduledTime(
  targetDateIso: string,
  currentDate: Date = new Date()
): { isValid: boolean; errorMessage?: string } {
  if (!targetDateIso) {
    return { isValid: false, errorMessage: "La date et l'heure de programmation sont obligatoires." };
  }

  const targetDate = new Date(targetDateIso);
  if (isNaN(targetDate.getTime())) {
    return { isValid: false, errorMessage: "Format de date invalide." };
  }

  const diffMs = targetDate.getTime() - currentDate.getTime();
  const diffMinutes = diffMs / (1000 * 60);

  if (diffMinutes < 5) {
    return {
      isValid: false,
      errorMessage: `Le créneau doit être supérieur d'au moins 5 minutes à l'heure actuelle (différence: ${Math.round(diffMinutes)} min).`
    };
  }

  const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
  if (diffMs > thirtyDaysMs) {
    return {
      isValid: false,
      errorMessage: "La programmation ne peut pas dépasser 30 jours dans le futur."
    };
  }

  return { isValid: true };
}

export interface PostState {
  id: string;
  status: "DRAFT" | "SCHEDULED" | "PROCESSING" | "PUBLISHED" | "FAILED" | "MISSED";
  failureReason?: string | null;
}

export function retryFailedPost(post: PostState): PostState {
  if (post.status !== "FAILED" && post.status !== "MISSED") {
    throw new Error(`ACTION_NOT_ALLOWED: Seul un post FAILED ou MISSED peut être relancé (statut actuel: ${post.status}).`);
  }
  return {
    ...post,
    status: "PROCESSING",
    failureReason: null
  };
}
