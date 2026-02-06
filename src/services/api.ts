import request from "../components/utils/request";
import { PlaceData } from "../types/place";
/**
 * Crée un nouveau spot dans le backend.
 * @param spotData Données du lieu (nom, latitude, etc.)
 * @param files Images uploadées
 */
export async function createSpot(spotData: PlaceData, files: File[]) {
  const formData = new FormData();

  // On ajoute l'objet JSON du spot
  formData.append("spot", new Blob([JSON.stringify(spotData)], { type: "application/json" }));

  // On ajoute les fichiers (images uploadées)
  files.forEach((file) => formData.append("files", file));

  // ⚠️ Ici, on ne peut pas utiliser `request()` directement car tu envoies du FormData
  // On fait une requête manuelle avec `fetch` mais on garde ta logique d’auth
  const token = localStorage.getItem("token");
  const headers: Record<string, string> = {};

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch("http://localhost:8088/api/v1/spots/create", {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

/**
 * Exemple d’utilisation de ta fonction request() pour les endpoints JSON
 */
export async function getAllSpots() {
  return await request("http://localhost:8088/api/v1/spots/get/all", "GET", null, true);
}
