import { Grid, Typography } from "@mui/material";
import TripCard from "./TripCard";

export default function TripCardList({ trips, showPlacesRestantes = false, showSimple = false }) {
  if (!trips || trips.length === 0) {
    return (
      <Typography variant="body1" color="text.secondary" align="center" sx={{ mt: 4 }}>
        Aucun trajet disponible pour le moment.
      </Typography>
    );
  }
  return (
    <Grid container spacing={2}>
      {trips.map((trajet, idx) => (
        <Grid item xs={12} sm={6} md={6} lg={3} key={trajet.id_trajet || idx} sx={{ display: 'flex' }}>
          <TripCard trajet={trajet} showPlacesRestantes={showPlacesRestantes} showSimple={showSimple} />
        </Grid>
      ))}
    </Grid>
  );
} 