import React, { useState } from "react";
import GoogleMapSearch from "../../containers/searchMaps/GoogleMapSearch.tsx";
import TestForm from "../../containers/searchMaps/testForm.tsx";
import TrajetMap from "../../containers/searchMaps/TrajetMap.tsx";

export default function Test() {
  const [selectedPlace, setSelectedPlace] = useState(null);

  const handlePlaceSelected = (place) => {
    setSelectedPlace(place);
  };

  return (
    <div>
      <h1>Test de la carte</h1>
      {/* <TestForm place={selectedPlace} /> */}
      <TrajetMap />
    </div>
  );
}