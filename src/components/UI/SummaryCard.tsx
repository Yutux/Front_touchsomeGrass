
import { Box, Typography } from "@mui/material";

interface Props {
  placeName: string;
  googlePhotos: number;
  userPhotos: number;
}

export default function SummaryCard({ placeName, googlePhotos, userPhotos }: Props) {
  return (
    <Box sx={{ mt: 2, p: 2, backgroundColor: "#e3f2fd", borderRadius: 2, border: "1px solid #2196f3" }}>
      <Typography variant="subtitle2" fontWeight="bold" gutterBottom color="primary">
        📋 Récapitulatif
      </Typography>
      <Typography variant="body2">📍 Lieu : {placeName}</Typography>
      <Typography variant="body2">🖼️ Photos Google : {googlePhotos}</Typography>
      <Typography variant="body2">📁 Vos photos : {userPhotos}</Typography>
      <Typography variant="body2" fontWeight="bold" color="primary.main">
        📊 Total : {googlePhotos + userPhotos} image(s)
      </Typography>
    </Box>
  );
}
