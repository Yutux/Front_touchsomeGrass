import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { MDBContainer, MDBRow, MDBCol, MDBCard, MDBCardBody, MDBCardTitle, MDBCardText, MDBCardImage, MDBBtn } from "mdb-react-ui-kit";

const AllUsers = () => {
  const [users, setUsers] = useState([]); // Toujours un tableau vide au départ
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8088/AUTH-SERVICE/api/v1/auth/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        //Authorization: `Bearer ${localStorage.getItem("token")}`
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.userList && Array.isArray(data.userList)) {
          setUsers(data.userList); // ⚠️ On extrait bien "userList"
        } else {
          console.error("Les données reçues ne contiennent pas userList :", data);
          setUsers([]); // Évite l'erreur si la réponse est mal formée
        }
        setLoading(false);
      })
      .catch(error => {
        console.error("Erreur lors du chargement des utilisateurs :", error);
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Chargement...</p>;

  return (
    <MDBContainer>
      <h2 className="my-4 text-center">Liste des Utilisateurs</h2>
      <MDBRow className="justify-content-center">
        {users.length > 0 ? (
          users.map(user => (
            <MDBCol key={user.id} md="4" className="mb-4">
              <MDBCard>
                <MDBCardBody>
                  <MDBCardImage
                    src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp"
                    alt="User Avatar"
                    style={{ width: "100px", borderRadius: "50%" }}
                    className="mb-3"
                  />
                  <MDBCardTitle>{user.lastname} {user.firstname}</MDBCardTitle>
                  <MDBCardText>{user.email}</MDBCardText>
                  <Link to={`/user/${user.id}`}>
                    <MDBBtn>Voir Profil</MDBBtn>
                  </Link>
                </MDBCardBody>
              </MDBCard>
            </MDBCol>
          ))
        ) : (
          <p>Aucun utilisateur trouvé.</p>
        )}
      </MDBRow>
    </MDBContainer>
  );
};

export default AllUsers;
