import React, { useRef, useState } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  StandaloneSearchBox,
  InfoWindow,
} from "@react-google-maps/api";

interface PlaceData {
  name: string;
  address: string;
  rating?: number;
  photos?: string[];
}

const containerStyle = {
  width: "100%",
  height: "500px",
};

const center = {
  lat: 48.8566,
  lng: 2.3522, // Paris
};

const GOOGLE_MAP_LIBRARIES = ["places"];

export default function GoogleMapSearch({ onPlaceSelected }: { onPlaceSelected: (place: PlaceData) => void }) {
  const [selectedPlace, setSelectedPlace] = useState<PlaceData | null>(null);
  const [markerPosition, setMarkerPosition] = useState<{ lat: number; lng: number } | null>(null);
  const [infoOpen, setInfoOpen] = useState(false);
  const [placesMarkers, setPlacesMarkers] = useState<any[]>([]);
  const searchBoxRef = useRef<google.maps.places.SearchBox | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);

  const fetchPlaceDetails = (placeId: string) => {
    if (!mapRef.current) return;

    const service = new window.google.maps.places.PlacesService(mapRef.current);
    service.getDetails(
      {
        placeId,
        fields: ["name", "formatted_address", "geometry", "rating", "photos"],
      },
      (details, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && details) {
          const placeData: PlaceData = {
            name: details.name || "",
            address: details.formatted_address || "",
            rating: details.rating,
            photos: details.photos?.map((p: any) => p.getUrl()),
          };
          setSelectedPlace(placeData);
          setMarkerPosition({
            lat: details.geometry?.location?.lat() || center.lat,
            lng: details.geometry?.location?.lng() || center.lng,
          });
          setInfoOpen(true);
          onPlaceSelected(placeData);
        } else {
          setSelectedPlace({
            name: "Lieu inconnu",
            address: "",
          });
          setInfoOpen(true);
        }
      }
    );
  };

  const handlePlacesChanged = () => {
    if (!searchBoxRef.current) return;
    const places = searchBoxRef.current.getPlaces();
    if (places && places.length > 0 && places[0].place_id) {
      fetchPlaceDetails(places[0].place_id);
    }
  };

  // Recherche et affichage des lieux sur la carte au chargement
  const handleMapLoad = (map: google.maps.Map) => {
    mapRef.current = map;
    const service = new window.google.maps.places.PlacesService(map);
    const types = ["restaurant", "museum", "park", "hotel"];
    let allResults: google.maps.places.PlaceResult[] = [];
    let completedRequests = 0;

    types.forEach((type) => {
      const request = {
        location: center,
        radius: 2000,
        type: type,
      };
      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results) {
          allResults = allResults.concat(results);
        }
        completedRequests++;
        if (completedRequests === types.length) {
          setPlacesMarkers(allResults);
        }
      });
    });
  };

  // Clic sur une icône de lieu
  const handlePlaceMarkerClick = (place: google.maps.places.PlaceResult) => {
    if (place.place_id) {
      fetchPlaceDetails(place.place_id);
    }
  };

  const handleMapClick = (e: google.maps.MapMouseEvent) => {
    const lat = e.latLng?.lat();
    const lng = e.latLng?.lng();
    if (lat && lng && mapRef.current) {
      setMarkerPosition({ lat, lng });
      setInfoOpen(false);

      const service = new window.google.maps.places.PlacesService(mapRef.current);
      const request = {
        location: { lat, lng },
        rankBy: window.google.maps.places.RankBy.DISTANCE,
        //type: ["restaurant", "museum", "park", "hotel"],
        keyword: "point of interest", // Ajoute ce paramètre pour ne pas filtrer par type
        
      };
      service.nearbySearch(request, (results, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && results && results.length > 0) {
          const place = results[0];
          if (place.place_id) {
            service.getDetails({ placeId: place.place_id }, (details, detailsStatus) => {
              if (detailsStatus === window.google.maps.places.PlacesServiceStatus.OK && details) {
                const placeData: PlaceData = {
                  name: details.name || "",
                  address: details.formatted_address || "",
                  rating: details.rating,
                  photos: details.photos?.map((p) => p.getUrl()),
                };
                setSelectedPlace(placeData);
                setInfoOpen(true);
                onPlaceSelected(placeData);
              } else {
                setSelectedPlace({
                  name: "Lieu inconnu",
                  address: "",
                });
                setInfoOpen(true);
              }
            });
          } else {
            setSelectedPlace({
              name: "Lieu inconnu",
              address: "",
            });
            setInfoOpen(true);
          }
        } else {
          setSelectedPlace({
            name: "Lieu inconnu",
            address: "",
          });
          setInfoOpen(true);
        }
      });
    }
  };

  const handleMarkerClick = () => {
    setInfoOpen(true);
  };

  return (
    <LoadScript googleMapsApiKey="AIzaSyBHiBCqOdyA356J87JgT3ZWnKR2zr7_Rvs" libraries={["places"]}>
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={markerPosition || center}
        zoom={12}
        onClick={handleMapClick} // Uniquement ce handler
        onLoad={handleMapLoad}
      >
        <StandaloneSearchBox
          onLoad={(ref) => (searchBoxRef.current = ref)}
          onPlacesChanged={handlePlacesChanged}
        >
          <input
            type="text"
            placeholder="Rechercher un endroit à Paris"
            style={{
              boxSizing: "border-box",
              border: "1px solid transparent",
              width: "240px",
              height: "40px",
              padding: "0 12px",
              position: "absolute",
              top: "10px",
              left: "50%",
              marginLeft: "-120px",
              borderRadius: "4px",
              fontSize: "14px",
              outline: "none",
              textOverflow: "ellipses",
            }}
          />
        </StandaloneSearchBox>

        {/* Marker pour le lieu sélectionné */}
        {markerPosition && selectedPlace && (
          <Marker
            position={markerPosition}
            onClick={handleMarkerClick}
          >
            {infoOpen && (
              <InfoWindow
                position={markerPosition}
                onCloseClick={() => setInfoOpen(false)}
              >
                <div>
                  <h3>{selectedPlace.name}</h3>
                  <p>{selectedPlace.address}</p>
                  {selectedPlace.rating && <p>⭐ {selectedPlace.rating}</p>}
                  {selectedPlace.photos?.[0] && (
                    <img
                      src={selectedPlace.photos[0]}
                      alt={selectedPlace.name}
                      style={{ width: "100px" }}
                    />
                  )}
                </div>
              </InfoWindow>
            )}
          </Marker>
        )}
      </GoogleMap>
    </LoadScript>
  );
}
