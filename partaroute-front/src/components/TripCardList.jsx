import { Stack, Typography } from "@mui/material";
import TripCard from "./TripCard";

export default function TripCardList({ trips }) {
  if (!trips || trips.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
        Aucun trajet disponible pour le moment.
      </Typography>
    );
  }
  return (
    <Stack spacing={2}>
      {trips.map((trajet, idx) => (
        <TripCard key={trajet.id_trajet || idx} trajet={trajet} />
      ))}
    </Stack>
  );
} 