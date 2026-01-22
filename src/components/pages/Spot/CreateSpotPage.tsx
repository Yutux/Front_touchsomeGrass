import React from "react";
import GoogleMapSearch from "../../Map/GoogleMapSearch";
import { PlaceData } from "../../../types/place";

/**
 * 📍 Page : Créer un nouveau spot
 * Permet de rechercher un lieu sur la carte (via Google Places API)
 * puis de l’enregistrer avec description et images.
 */
export default function CreateSpotPage() {
  const handlePlaceSelected = (place: PlaceData) => {
    console.log("Lieu sélectionné :", place);
    // Ici tu pourrais stocker le lieu dans un state global, Redux, ou navigation vers une page de détail
  };

  return <GoogleMapSearch onPlaceSelected={handlePlaceSelected} />;
}
