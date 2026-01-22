import React, { useState } from "react";
import GoogleMapSearch from "../../containers/searchMaps/GoogleMapSearch.tsx";
import TestForm from "../../containers/searchMaps/testForm.tsx";
import IconTest from "./Navbar.jsx";
import DoubleNavbar from "./Navbar.jsx";
import Navbar from "./Navbar.jsx";
import TrajetMap from "../../containers/searchMaps/TrajetMap.tsx";
//import TrajetMap from "../../Map/TrajetMap.tsx";


export default function Test() {
  const [selectedPlace, setSelectedPlace] = useState(null);

  const handlePlaceSelected = (place) => {
    setSelectedPlace(place);
  };

  return (
    <>
      <h1>Test de la carte</h1>
      {/* <TestForm place={selectedPlace} /> */}
      {/*<GoogleMapSearch onPlaceSelected={handlePlaceSelected} />*/}
      <TrajetMap/>
    </>
  );
}