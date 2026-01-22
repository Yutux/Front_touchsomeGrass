import React from "react";
import { TextField, Card, CardContent } from "@mui/material";
import { StandaloneSearchBox } from "@react-google-maps/api";

interface Props {
  onLoad: (ref: google.maps.places.SearchBox) => void;
  onPlacesChanged: () => void;
}

export default function SearchBar({ onLoad, onPlacesChanged }: Props) {
  return (
    <Card
      sx={{
        position: "absolute",
        top: 20,
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 10,
        width: 400,
        borderRadius: 3,
        boxShadow: 6,
      }}
    >
      <CardContent>
        <StandaloneSearchBox onLoad={onLoad} onPlacesChanged={onPlacesChanged}>
          <TextField fullWidth label="Rechercher un lieu" variant="outlined" size="small" placeholder="Ex: Tour Eiffel, Paris" />
        </StandaloneSearchBox>
      </CardContent>
    </Card>
  );
}
