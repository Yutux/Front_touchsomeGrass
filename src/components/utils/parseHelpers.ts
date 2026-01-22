/**
 * 🧮 parseHelpers.ts
 * Fonctions utilitaires pour formater ou parser la distance et la durée.
 */

/* ──────────────── FORMATTERS ──────────────── */

/**
 * Formate une distance en mètres vers une chaîne lisible (ex: "12.4 km")
 * @param meters - Distance en mètres
 */
export function formatDistance(meters: number): string {
  if (isNaN(meters) || meters <= 0) return "0 km";
  return `${(meters / 1000).toFixed(1)} km`;
}

/**
 * Formate une durée en secondes vers une chaîne lisible (ex: "1 h 23 min")
 * @param seconds - Durée en secondes
 */
export function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds <= 0) return "0 min";
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.round((seconds % 3600) / 60);

  if (hours > 0) {
    return `${hours} h ${minutes.toString().padStart(2, "0")} min`;
  }
  return `${minutes} min`;
}

/* ──────────────── PARSERS ──────────────── */

/**
 * Convertit une chaîne de distance ("12.4 km") en nombre (kilomètres)
 * @param val - Chaîne texte avec unité
 */
export function parseDistance(val: string | null): number {
  if (!val) return 0;
  const match = val.match(/([\d.,]+)/);
  return match ? parseFloat(match[1].replace(",", ".")) : 0;
}

/**
 * Convertit une chaîne de durée ("1 h 20 min" ou "45 min") en minutes
 * @param val - Chaîne texte avec unité
 */
export function parseDuration(val: string | null): number {
  if (!val) return 0;

  let totalMinutes = 0;

  // Exemple : "2 h 15 min" ou "45 min"
  const hoursMatch = val.match(/(\d+)\s*h/);
  const minutesMatch = val.match(/(\d+)\s*min/);

  if (hoursMatch) totalMinutes += parseInt(hoursMatch[1], 10) * 60;
  if (minutesMatch) totalMinutes += parseInt(minutesMatch[1], 10);

  return totalMinutes;
}
