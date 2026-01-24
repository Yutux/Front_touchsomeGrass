import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Box,
  Grid,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  Button,
  CircularProgress,
  Container,
} from "@mui/material";

const AllUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("http://localhost:8088/AUTH-SERVICE/api/v1/auth/users", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        // Authorization: `Bearer ${localStorage.getItem("token")}`
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.userList && Array.isArray(data.userList)) {
          setUsers(data.userList);
        } else {
          console.error("Les données reçues ne contiennent pas userList :", data);
          setUsers([]);
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error("Erreur lors du chargement des utilisateurs :", error);
        setLoading(false);
      });
  }, []);

  if (loading)
    return (
      <Box
        sx={{
          height: "80vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 2,
        }}
      >
        <CircularProgress color="primary" />
        <Typography variant="h6">Chargement des utilisateurs...</Typography>
      </Box>
    );

  return (
    <Container sx={{ py: 6 }}>
      <Typography
        variant="h4"
        align="center"
        fontWeight="bold"
        color="primary"
        gutterBottom
      >
        Liste des Utilisateurs
      </Typography>

      {users.length > 0 ? (
        <Grid container spacing={3} justifyContent="center">
          {users.map((user) => (
            <Grid item key={user.id} xs={12} sm={6} md={4}>
              <Card
                sx={{
                  textAlign: "center",
                  p: 3,
                  borderRadius: 3,
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  "&:hover": {
                    transform: "scale(1.03)",
                    boxShadow: 4,
                  },
                }}
              >
                <Avatar
                  src="https://cdn-icons-png.flaticon.com/512/149/149071.png"
                  alt="User Avatar"
                  sx={{ width: 100, height: 100, mx: "auto", mb: 2 }}
                />
                <CardContent>
                  <Typography variant="h6" fontWeight="bold">
                    {user.lastname} {user.firstname}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mb={2}>
                    {user.email}
                  </Typography>
                </CardContent>
                <CardActions sx={{ justifyContent: "center" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    component={Link}
                    to={`/user/${user.id}`}
                    sx={{ borderRadius: 2 }}
                  >
                    Voir Profil
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      ) : (
        <Box textAlign="center" mt={4}>
          <Typography variant="h6">Aucun utilisateur trouvé.</Typography>
        </Box>
      )}
    </Container>
  );
};

export default AllUsers;
