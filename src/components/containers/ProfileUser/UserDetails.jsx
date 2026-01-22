import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  Card,
  CardContent,
  CardActions,
  Avatar,
  Typography,
  Button,
  CircularProgress,
  Stack,
} from "@mui/material";

const UserDetails = () => {
  const { id } = useParams();
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch(`http://localhost:8088/AUTH-SERVICE/api/v1/auth/user/get/${id}`)
      .then((response) => response.json())
      .then((data) => {
        setUser(data.userApp);
      })
      .catch((error) => console.error("Erreur:", error));
  }, [id]);

  if (!user)
    return (
      <Box
        sx={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 2,
        }}
      >
        <CircularProgress color="error" />
        <Typography variant="h6">Chargement des informations...</Typography>
      </Box>
    );

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f8f9fa",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        p: 2,
      }}
    >
      <Card
        sx={{
          width: 400,
          p: 3,
          borderRadius: 3,
          boxShadow: 3,
          border: "1px solid #eee",
          backgroundColor: "#fff",
        }}
      >
        <Stack spacing={2} alignItems="center">
          <Avatar
            src="https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp"
            alt="Avatar"
            sx={{ width: 120, height: 120 }}
          />

          <CardContent sx={{ textAlign: "center" }}>
            <Typography variant="h5" color="error.main" fontWeight="bold">
              {user.lastname} {user.firstname}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </CardContent>

          <CardActions sx={{ width: "100%", justifyContent: "space-around" }}>
            <Button variant="outlined" color="error">
              Envoyer un message
            </Button>
            <Button variant="contained" color="error">
              Ajouter en ami
            </Button>
          </CardActions>
        </Stack>
      </Card>
    </Box>
  );
};

export default UserDetails;
