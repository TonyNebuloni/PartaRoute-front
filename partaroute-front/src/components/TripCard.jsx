import { Card, CardContent, Typography, Box } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function TripCard({ trajet }) {
  const navigate = useNavigate();
  const villeDepart = trajet?.ville_depart || 'N/A';
  const villeArrivee = trajet?.ville_arrivee || 'N/A';
  const prix = trajet?.prix ?? 'N/A';
  const conducteur = trajet?.conducteur?.nom || 'N/A';
  const places = typeof trajet?.places_disponibles === 'number' || typeof trajet?.places_disponibles === 'string' ? trajet.places_disponibles : 'N/A';
  let dateHeure = 'N/A';
  if (trajet?.date_heure_depart) {
    const d = new Date(trajet.date_heure_depart);
    dateHeure = isNaN(d.getTime()) ? 'N/A' : d.toLocaleString();
  }
  return (
    <Card
      sx={{ mb: 2, borderRadius: 3, boxShadow: 2, cursor: 'pointer', transition: 'box-shadow 0.2s', '&:hover': { boxShadow: 6 } }}
      onClick={() => navigate(`/trajet/${trajet.id_trajet}`)}
    >
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6" fontWeight={600}>
            {villeDepart} → {villeArrivee}
          </Typography>
          <Typography variant="subtitle1" color="primary" fontWeight={700}>
            {prix !== undefined && prix !== null && !isNaN(Number(prix)) ? Number(prix).toFixed(2) : prix} €
          </Typography>
        </Box>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Départ : {dateHeure}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Conducteur : {conducteur}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Places dispo : {places}
        </Typography>
      </CardContent>
    </Card>
  );
} 