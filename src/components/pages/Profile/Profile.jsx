// src/pages/Profile.jsx
import React, { useState } from "react";
import { Helmet } from "react-helmet";
import ProfileUser from "../../containers/ProfileUser/ProfileUser";
import Updatable from "../../containers/Updating/Updating";

// OPTION A (recommandée): image dans /public/images/profile-bg.jpg
const PUBLIC_BG = "/images/profile-bg.jpg";

// OPTION B (alternative): importer une image depuis src
// import bg from "../../assets/background.jpg"; // puis utiliser bg dans style

export default function Profile(props) {
  const [wantUpdate, setWantUpdate] = useState(false);

  const handleUpdate = (e) => {
    e?.preventDefault?.();
    setWantUpdate((v) => !v);
  };

  return (
  <div
    
  >
    
  </div>
);
}