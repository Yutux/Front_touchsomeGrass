import { useState } from "react";

export default function CreateSpot() {
  const [spot, setSpot] = useState({
    name: "",
    description: "",
  });

  const handleChange = (e) => {
    if (e.target.name === "imageFile") {
      setSpot({ ...spot, imageFile: e.target.files[0] });
    } else {
      setSpot({ ...spot, [e.target.name]: e.target.value });
    }
  };
  

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
  
    
    const formData = new FormData();
    formData.append("spot", new Blob([JSON.stringify({
      name: spot.name,
      description: spot.description
    })], { type: "application/json" }));
    formData.append("file", spot.imageFile);
  
    try {
      const response = await fetch("http://localhost:8088/AUTH-SERVICE/api/v1/spots/create", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });
  
      if (response.ok) {
        alert("Spot créé avec succès !");
        setSpot({ name: "", description: "", imageFile: null });
      }
    } catch (error) {
      console.error("Erreur lors de la création du spot", error);
    }
  };
  

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <input type="text" name="name" placeholder="Nom du spot" value={spot.name} onChange={handleChange} required />
      <textarea name="description" placeholder="Description" value={spot.description} onChange={handleChange} required />
      <input type="file" name="imageFile" onChange={handleChange} required />
      <button type="submit">Créer le Spot</button>
    </form>
  );
}
