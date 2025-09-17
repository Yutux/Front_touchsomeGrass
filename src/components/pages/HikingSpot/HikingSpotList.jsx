/*
import { useEffect, useState } from "react";
const API_URL = "http://localhost:8088/AUTH-SERVICE/api/v1/hikingspot/all";

export default function HikingSpotList() {
    const [hikingSpots, setHikingSpots] = useState([]);
  
    useEffect(() => {
      fetch(API_URL)
        .then((res) => res.json())
        .then((data) => setHikingSpots(data.HikingSpots))
        .catch((error) => console.error("Erreur", error));
    }, []);
  
    return (
      <div>
        <h2>Liste des HikingSpots</h2>
        <ul>
          {hikingSpots.map((spot) => (
            <li key={spot.id}>
              <a href={`/hikingspots/${spot.id}`}>{spot.name}</a>
            </li>
          ))}
        </ul>
      </div>
    );
  }*/
/*
import { useEffect, useState } from "react";
const API_URL = "http://localhost:8088/AUTH-SERVICE/api/v1/hikingspot/all";

export default function HikingSpotList() {
    const [hikingSpots, setHikingSpots] = useState([]);
  
    useEffect(() => {
      fetch(API_URL)
        .then((res) => res.json())
        .then((data) => {
          console.log("API Response:", data);
          setHikingSpots(data.hikingSpots || []); // Correction : extraction correcte des données
        })
        .catch((error) => console.error("Erreur", error));
    }, []);
  
    return (
      <div>
        <h2>Liste des HikingSpots</h2>
        <ul>
          {hikingSpots.length > 0 ? (
            hikingSpots.map((spot) => (
              <li key={spot.id}>
                <a href={`/hikingspots/${spot.id}`}>{spot.name}</a>
              </li>
            ))
          ) : (
            <p>Aucun spot de randonnée disponible.</p>
          )}
        </ul>
      </div>
    );
}
*/

// import React from 'react';
// import {
//   MDBContainer,
//   MDBCard,
//   MDBCardImage,
//   MDBCardBody,
//   MDBCardTitle,
//   MDBCardText,
//   MDBBtn,
// } from 'mdb-react-ui-kit';

// function HikingSpotList() {
//   const hikingSpots = [
//     { id: 1, name: 'Sentier des crêtes', image: 'https://mdbootstrap.com/img/new/standard/nature/182.jpg', description: 'Une vue imprenable sur les montagnes.', details: '/hiking-spot/1' },
//     { id: 2, name: 'Cascade de la forêt', image: 'https://mdbootstrap.com/img/new/standard/nature/183.jpg', description: 'Une randonnée rafraîchissante près d\'une cascade.', details: '/hiking-spot/2' },
//     { id: 3, name: 'Lac des étoiles', image: 'https://mdbootstrap.com/img/new/standard/nature/184.jpg', description: 'Un lieu magique pour observer les étoiles.', details: '/hiking-spot/3' },
//     { id: 4, name: 'Vallée enchantée', image: 'https://mdbootstrap.com/img/new/standard/nature/185.jpg', description: 'Un sentier mystique dans la nature.', details: '/hiking-spot/4' },
//     { id: 5, name: 'Mont du Dragon', image: 'https://mdbootstrap.com/img/new/standard/nature/186.jpg', description: 'Une ascension avec une vue époustouflante.', details: '/hiking-spot/5' },
//     { id: 6, name: 'Grottes Mystiques', image: 'https://mdbootstrap.com/img/new/standard/nature/187.jpg', description: 'Un parcours souterrain fascinant.', details: '/hiking-spot/6' },
//     { id: 7, name: 'Colline du Vent', image: 'https://mdbootstrap.com/img/new/standard/nature/188.jpg', description: 'Un endroit venteux avec une vue dégagée.', details: '/hiking-spot/7' },
//     { id: 8, name: 'Forêt Magique', image: 'https://mdbootstrap.com/img/new/standard/nature/189.jpg', description: 'Un chemin entouré d’arbres centenaires.', details: '/hiking-spot/8' },
//     { id: 9, name: 'Plage Secrète', image: 'https://mdbootstrap.com/img/new/standard/nature/190.jpg', description: 'Une plage cachée accessible à pied.', details: '/hiking-spot/9' },
//     { id: 10, name: 'Pont Suspendu', image: 'https://mdbootstrap.com/img/new/standard/nature/191.jpg', description: 'Traversez un pont suspendu au-dessus d’un canyon.', details: '/hiking-spot/10' },
//     { id: 11, name: 'Désert Doré', image: 'https://mdbootstrap.com/img/new/standard/nature/192.jpg', description: 'Un sentier à travers les dunes de sable.', details: '/hiking-spot/11' },
//     { id: 12, name: 'Canyon Profond', image: 'https://mdbootstrap.com/img/new/standard/nature/193.jpg', description: 'Une randonnée au cœur d’un canyon impressionnant.', details: '/hiking-spot/12' },
//     { id: 13, name: 'Rivière Enchantée', image: 'https://mdbootstrap.com/img/new/standard/nature/194.jpg', description: 'Une balade le long d’une rivière cristalline.', details: '/hiking-spot/13' },
//   ];

//   return (
//     <MDBContainer
//       fluid
//       className="d-flex align-items-center justify-content-center"
//       style={{
//         width: '98vw',
//         height: '100vh',
//         backgroundColor: '#f0f2f5',
//         padding: '20px',
//       }}
//     >
//       <div
//         style={{
//           display: 'flex',
//           flexWrap: 'wrap',
//           gap: '20px',
//           justifyContent: 'center',
//           maxWidth: '90%',
//         }}
//       >
//         {hikingSpots.map((spot) => (
//           <MDBCard
//             key={spot.id}
//             style={{
//               width: '30%',
//               minWidth: '300px',
//               maxWidth: '400px',
//               borderRadius: '15px',
//               border: '2px solid #ddd',
//               boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
//               overflow: 'hidden',
//               transition: 'transform 0.2s, box-shadow 0.2s',
//             }}
//             className="hover-card"
//           >
//             <MDBCardImage
//               src={spot.image}
//               alt={spot.name}
//               position="top"
//               style={{
//                 width: '100%',
//                 height: '200px',
//                 objectFit: 'cover',
//                 borderTopLeftRadius: '15px',
//                 borderTopRightRadius: '15px',
//               }}
//             />
//             <MDBCardBody>
//               <MDBCardTitle>{spot.name}</MDBCardTitle>
//               <MDBCardText>{spot.description}</MDBCardText>
//               <MDBBtn href={spot.details}>Voir les détails</MDBBtn>
//             </MDBCardBody>
//           </MDBCard>
//         ))}
//       </div>

//       <style>
//         {`
//           .hover-card:hover {
//             transform: scale(1.05);
//             box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
//             border-color: #aaa;
//           }
//         `}
//       </style>
//     </MDBContainer>
//   );
// }

// export default HikingSpotList;
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

const HikingSpotList = () => {
  const [hikingSpots, setHikingSpots] = useState([]);

  useEffect(() => {
    request("http://localhost:8088/AUTH-SERVICE/api/v1/hikingspot/all", "GET", false)
      .then((response) => {
        console.log("Réponse complète:", response.data);
        if (response.data && response.data.hikingSpots) {
          setHikingSpots(response.data.hikingSpots);
        } else {
          setHikingSpots([]);
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
        {hikingSpots.length > 0 ? (
          hikingSpots.map((spot) => (
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
                <Link to={`/HikingSpot/${spot.id}`}>
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

export default HikingSpotList;


/*
import React from 'react';
import {
  MDBContainer,
  MDBRow,
  MDBCol,
  MDBCard,
  MDBCardImage,
  MDBCardBody,
  MDBCardTitle,
  MDBCardText,
  MDBBtn,
  MDBCarousel,
  MDBCarouselItem,
} from 'mdb-react-ui-kit';

function HikingSpotList() {
  const hikingSpots = [
    {
      id: 1,
      name: 'Sentier des crêtes',
      images: [
        'https://mdbootstrap.com/img/new/standard/nature/182.jpg',
        'https://mdbootstrap.com/img/new/standard/nature/181.jpg'
      ],
      description: 'Une vue imprenable sur les montagnes.',
      details: '/hiking-spot/1',
    },
    {
      id: 2,
      name: 'Cascade de la forêt',
      images: ['https://mdbootstrap.com/img/new/standard/nature/183.jpg'],
      description: 'Une randonnée rafraîchissante près d\'une cascade.',
      details: '/hiking-spot/2',
    },
    {
      id: 3,
      name: 'Lac des étoiles',
      images: [
        'https://mdbootstrap.com/img/new/standard/nature/184.jpg',
        'https://mdbootstrap.com/img/new/standard/nature/185.jpg'
      ],
      description: 'Un lieu magique pour observer les étoiles.',
      details: '/hiking-spot/3',
    },
    // Ajout de 10 nouvelles cartes
    ...Array.from({ length: 10 }, (_, index) => ({
      id: index + 4,
      name: `Lieu de randonnée ${index + 4}`,
      images: [`https://mdbootstrap.com/img/new/standard/nature/18${index + 6}.jpg`],
      description: `Description du lieu ${index + 4}`,
      details: `/hiking-spot/${index + 4}`,
    })),
  ];

  return (
    <MDBContainer fluid className="d-flex flex-wrap justify-content-center p-4" style={{ minHeight: '100vh' }}>
      {hikingSpots.map((spot) => (
        <MDBCard key={spot.id} style={{ width: '30%', minWidth: '300px', margin: '10px', border: '2px solid #ccc', borderRadius: '10px' }}>
          {spot.images.length > 1 ? (
            <MDBCarousel showControls showIndicators>
              {spot.images.map((image, index) => (
                <MDBCarouselItem key={index} itemId={index + 1}>
                  <MDBCardImage src={image} alt={spot.name} position="top" style={{ height: '200px', objectFit: 'cover' }} />
                </MDBCarouselItem>
              ))}
            </MDBCarousel>
          ) : (
            <MDBCardImage src={spot.images[0]} alt={spot.name} position="top" style={{ height: '200px', objectFit: 'cover' }} />
          )}
          <MDBCardBody>
            <MDBCardTitle>{spot.name}</MDBCardTitle>
            <MDBCardText>{spot.description}</MDBCardText>
            <MDBBtn href={spot.details}>Voir les détails</MDBBtn>
          </MDBCardBody>
        </MDBCard>
      ))}
    </MDBContainer>
  );
}

export default HikingSpotList;
*/