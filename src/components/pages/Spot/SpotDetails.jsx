import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function SpotDetails() {
  const { id } = useParams();
  const [spot, setSpot] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8088/AUTH-SERVICE/api/v1/spots/get/${id}`)
      .then((res) => res.json())
      .then((data) => setSpot(data.newSpot))
      .catch((error) => console.error("Erreur", error));
  }, [id]);

  if (!spot) return <p>Chargement...</p>;

  return (
    <div>
      <h2>{spot.name}</h2>
      <p>{spot.description}</p>
      <p>Latitude: {spot.latitude}, Longitude: {spot.longitude}</p>
      {spot.imagePath && <img
                    src={`http://localhost:8088/AUTH-SERVICE/api/v1/uploads/${spot.imagePath}`} // 🔥 Chemin compatible avec Eureka
                    alt={spot.name}
                    className="card-img-top"
                    style={{ height: "200px", objectFit: "cover" }}
                    onError={(e) => { e.target.src = "https://via.placeholder.com/300"; }} // 🔥 Remplace par une image par défaut si erreur
                  />}
    </div>
  );
}