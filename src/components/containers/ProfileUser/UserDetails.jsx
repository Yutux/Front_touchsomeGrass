import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardTitle, MDBCardText, MDBCardBody, MDBCardImage, MDBBtn } from "mdb-react-ui-kit";

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8088/AUTH-SERVICE/api/v1/auth/user/get/${id}`)
      .then(response => response.json())
      .then(data => {
        //console.log("Réponse reçue:", data); // 🔍 Vérifie la structure de la réponse
        setUser(data.userApp); // Extrait l'utilisateur
      })
      .catch(error => console.error("Erreur:", error));
  }, [id]);

  if (!user) return <p>Chargement des informations...</p>;

  return (
    <div className="vh-100" style={{ backgroundColor: "#9de2ff" }}>
      <MDBContainer>
        <MDBRow className="justify-content-center">
          <MDBCol md="9" lg="7" xl="5" className="mt-5">
            <MDBCard style={{ borderRadius: "15px" }}>
              <MDBCardBody className="p-4">
                <div className="d-flex text-black">
                  <div className="flex-shrink-0">
                    <MDBCardImage
                      style={{ width: "180px", borderRadius: "10px" }}
                      src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp"
                      alt="Avatar"
                      fluid
                    />
                  </div>
                  <div className="flex-grow-1 ms-3">
                    <MDBCardTitle>{user.lastname} {user.firstname}</MDBCardTitle>
                    <MDBCardText>{user.email}</MDBCardText>
                    <div className="d-flex pt-1 justify-content-around">
                      <MDBBtn outline className="me-1 flex-grow-1">Envoyer un message</MDBBtn>
                      <MDBBtn className="flex-grow-1">Ajouter en ami</MDBBtn>
                    </div>
                  </div>
                </div>
              </MDBCardBody>
            </MDBCard>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
};

export default UserDetails;
