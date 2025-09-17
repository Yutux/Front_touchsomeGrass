// import React, { useEffect, useState } from "react";
// import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardImage, MDBCardBody, MDBCardTitle, MDBCardText, MDBBtn } from "mdb-react-ui-kit";
// import request from "../../utils/request";

// const AllSpots = () => {
//   const [spots, setSpots] = useState([]);

//   useEffect(() => {
//     request("http://localhost:8088/AUTH-SERVICE/api/v1/spots/get/all", "GET", false)
//     .then((response) => {
//       console.log("Réponse complète:", response.data);
//       if (response.data && response.data.spots) {
//         setSpots(response.data.spots);
//       } else {
//         setSpots([]); // Si pas de spots, on met un tableau vide
//       }
//     })
//     .catch((error) => console.error("Erreur lors du chargement des spots:", error));
// }, []);

// return (
//   <MDBContainer className="py-5">
//     <h2 className="text-center mb-4">Catalogue des Spots</h2>
//     <MDBRow>
//       {spots.length > 0 ? (
//         spots.map((spot) => (
//           <MDBCol md="4" lg="3" className="mb-4" key={spot.id}>
//             <MDBCard>
//               <MDBCardImage 
//                 src={spot.imagePath && spot.imagePath.trim() !== "" ? spot.imagePath : "https://via.placeholder.com/300"} 
//                 alt={spot.name} 
//                 position="top"
//                 style={{ height: "200px", objectFit: "cover" }} 
//               />
//               <MDBCardBody>
//                 <MDBCardTitle>{spot.name}</MDBCardTitle>
//                 <MDBCardText>{spot.description}</MDBCardText>
//                 <MDBBtn href={`/spot/${spot.id}`} color="primary">
//                   Voir plus
//                 </MDBBtn>
//               </MDBCardBody>
//             </MDBCard>
//           </MDBCol>
//         ))
//       ) : (
//         <p className="text-center">Aucun spot disponible.</p>
//       )}
//     </MDBRow>
//   </MDBContainer>
// );
// };

// export default AllSpots;

import React, { useEffect, useState } from "react";
import request from "../../utils/request";
import {
  MDBContainer,
  MDBCard,
  MDBCardImage,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBBtn,
} from "mdb-react-ui-kit";
import { Link } from "react-router-dom";

const AllSpots = () => {
  const [spots, setSpots] = useState([]);

  useEffect(() => {
    request("http://localhost:8088/AUTH-SERVICE/api/v1/spots/get/all", "GET", false)
      .then((response) => {
        console.log("Réponse complète:", response.data);
        if (Array.isArray(response.data)) {
          setSpots(response.data);
        } else if (response.data && response.data.spots) {
          setSpots(response.data.spots);
        } else {
          setSpots([]);
        }
      })
      .catch((error) => console.error("Erreur lors du chargement des spots:", error));
  }, []);

  return (
    <MDBContainer
      fluid
      className="d-flex align-items-center justify-content-center"
      style={{
        width: "98vw",
        height: "90vh",
        backgroundColor: "#f0f2f5",
        padding: "20px",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
          justifyContent: "center",
          maxWidth: "90%",
        }}
      >
        {spots.length > 0 ? (
          spots.map((spot) => (
            <MDBCard
              key={spot.id}
              style={{
                width: "30%",
                minWidth: "300px",
                maxWidth: "400px",
                borderRadius: "15px",
                border: "2px solid #ddd",
                boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
                overflow: "hidden",
                transition: "transform 0.2s, box-shadow 0.2s",
              }}
              className="hover-card"
            >
              <MDBCardImage
                src={`http://localhost:8088/AUTH-SERVICE/api/v1/uploads/${spot.imagePath}`}
                alt={spot.name}
                position="top"
                style={{
                  width: "100%",
                  height: "200px",
                  objectFit: "cover",
                  borderTopLeftRadius: "15px",
                  borderTopRightRadius: "15px",
                }}
                onError={(e) => {
                  e.target.src = "https://via.placeholder.com/300";
                }}
              />
              <MDBCardBody>
                <MDBCardTitle>{spot.name}</MDBCardTitle>
                <MDBCardText>{spot.description}</MDBCardText>
                <Link to={`/spot/${spot.id}`}>
                  <MDBBtn>Voir plus</MDBBtn>
                </Link>
              </MDBCardBody>
            </MDBCard>
          ))
        ) : (
          <p className="text-center">Aucun spot disponible.</p>
        )}
      </div>

      <style>
        {`
          .hover-card:hover {
            transform: scale(1.05);
            box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
            border-color: #aaa;
          }
        `}
      </style>
    </MDBContainer>
  );
};

export default AllSpots;
