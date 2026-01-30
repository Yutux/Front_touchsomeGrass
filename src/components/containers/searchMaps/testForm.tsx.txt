// import React, { useState } from "react";
// import GoogleMapSearch from "./GoogleMapSearch";

// interface PlaceData {
//   name: string;
//   address: string;
//   rating?: number;
//   photos?: string[];
// }

// export default function TestForm({ place }: { place: PlaceData }) {
//   const [formData, setFormData] = useState<PlaceData>({
//     name: "",
//     address: "",
//     rating: undefined,
//     photos: [],
//   });

//   // Callback pour recevoir les données du lieu sélectionné
//   const handlePlaceSelected = (place: PlaceData) => {
//     setFormData({
//       name: place.name,
//       address: place.address,
//       rating: place.rating,
//       photos: place.photos,
//     });
//   };

//   return (
//     <div>
      
//       <form style={{ marginTop: 20 }}>
//         <div>
//           <label>Nom du lieu :</label>
//           <input type="text" value={formData.name} readOnly />
//         </div>
//         <div>
//           <label>Adresse :</label>
//           <input type="text" value={formData.address} readOnly />
//         </div>
//         <div>
//           <label>Note :</label>
//           <input type="text" value={formData.rating ?? ""} readOnly />
//         </div>
//         {formData.photos && formData.photos.length > 0 && (
//           <div>
//             <label>Photo :</label>
//             <img src={formData.photos[0]} alt={formData.name} style={{ width: "100px" }} />
//           </div>
//         )}
//       </form>
//     </div>
//   );
// }