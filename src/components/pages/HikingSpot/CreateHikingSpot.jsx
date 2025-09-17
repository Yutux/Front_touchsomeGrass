/*
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";

const API_URL = "http://localhost:8088/AUTH-SERVICE/api/v1/hikingspot";


export default function CreateHikingSpot() {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const response = await fetch(`${API_URL}/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({ name, description }),
    });

    if (response.ok) {
      navigate("/profile");
    } else {
      alert("Erreur lors de la création");
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Créer un HikingSpot</h2>
      <input
        type="text"
        placeholder="Nom"
        value={name}
        onChange={(e) => setName(e.target.value)}
        required
      />
      <textarea
        placeholder="Description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        required
      />
      <button type="submit">Créer</button>
    </form>
  );
}*/

import { useState } from "react";
import { useNavigate } from "react-router-dom";

const API_URL = "http://localhost:8088/AUTH-SERVICE/api/v1/hikingspot/create";

export default function CreateHikingSpot() {
  const [hikingSpot, setHikingSpot] = useState({
    name: "",
    description: "",
    imageFile: null,
  });
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setHikingSpot((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("token");

    const formData = new FormData();
    formData.append(
      "hikingSpot",
      new Blob(
        [
          JSON.stringify({
            name: hikingSpot.name,
            description: hikingSpot.description,
          }),
        ],
        { type: "application/json" }
      )
    );
    if (hikingSpot.imageFile) {
      formData.append("file", hikingSpot.imageFile);
    }

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (response.ok) {
        alert("HikingSpot créé avec succès !");
        setHikingSpot({ name: "", description: "", imageFile: null });
        navigate("/profile");
      } else {
        alert("Erreur lors de la création du HikingSpot");
      }
    } catch (error) {
      console.error("Erreur lors de la création du HikingSpot", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} encType="multipart/form-data">
      <input
        type="text"
        name="name"
        placeholder="Nom du HikingSpot"
        value={hikingSpot.name}
        onChange={handleChange}
        required
      />
      <textarea
        name="description"
        placeholder="Description"
        value={hikingSpot.description}
        onChange={handleChange}
        required
      />
      <input type="file" name="imageFile" onChange={handleChange} required />
      <button type="submit">Créer le HikingSpot</button>
    </form>
  );
}
