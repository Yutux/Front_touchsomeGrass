import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
const API_URL = "http://localhost:8088/AUTH-SERVICE/api/v1/hikingspot/get";



export default function HikingSpotDetail() {
    const { id } = useParams();
    const [hikingSpot, setHikingSpot] = useState(null);
  
    useEffect(() => {
      fetch(`${API_URL}/${id}`)
        .then((res) => res.json())
        .then((data) => setHikingSpot(data.newHikingSpot))
        .catch((error) => console.error("Erreur", error));
    }, [id]);
  
    if (!hikingSpot) return <p>Chargement...</p>;
  
    return (
      <div>
        <h2>{hikingSpot.name}</h2>
        <p>{hikingSpot.description}</p>
      </div>
    );
  }
  