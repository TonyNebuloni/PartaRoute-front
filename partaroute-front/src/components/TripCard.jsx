import { Card, CardContent, Typography, Box, Avatar, Button, Stack } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function TripCard({ trajet, showPlacesRestantes = false, showSimple = false }) {
  const navigate = useNavigate();
  const villeDepart = trajet?.ville_depart || 'N/A';
  const villeArrivee = trajet?.ville_arrivee || 'N/A';
  const prix = trajet?.prix ?? 'N/A';
  const conducteur = trajet?.conducteur;
  const places = typeof trajet?.places_disponibles === 'number' || typeof trajet?.places_disponibles === 'string' ? trajet.places_disponibles : 'N/A';
  const placesRestantes = (typeof trajet?.places_disponibles === 'number' ? trajet.places_disponibles : Number(trajet.places_disponibles)) - (trajet.reservations?.length || 0);
  let dateHeure = 'N/A';
  if (trajet?.date_heure_depart) {
    const d = new Date(trajet.date_heure_depart);
    dateHeure = isNaN(d.getTime()) ? 'N/A' : d.toLocaleString();
  }
  const BACKEND_URL = import.meta.env.VITE_API_URL;
  const DEFAULT_PHOTO = `${BACKEND_URL}/uploads/profile_photos/default.png`;
  let conducteurPhoto = conducteur?.photo_profil;
  if (conducteurPhoto) {
    if (conducteurPhoto.startsWith('/uploads/')) {
      conducteurPhoto = BACKEND_URL + conducteurPhoto;
    }
  } else {
    conducteurPhoto = DEFAULT_PHOTO;
  }
  return (
    <Card
      sx={{
        height: '100%',
        minHeight: 320,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        borderRadius: 3,
        boxShadow: 2,
        p: 0,
        aspectRatio: '1',
        position: 'relative',
      }}
    >
      <CardContent sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', p: 2 }}>
        <Avatar
          src={conducteurPhoto}
          alt={conducteur?.nom || 'Conducteur'}
          sx={{ width: 56, height: 56, mb: 1 }}
        />
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontWeight: 500 }}>
          {conducteur?.nom || 'Conducteur inconnu'}
        </Typography>
        <Typography variant="h6" fontWeight={700} align="center" sx={{ mb: 1 }}>
          {villeDepart} → {villeArrivee}
        </Typography>
        <Typography variant="h5" color="primary" fontWeight={700} align="center" sx={{ mb: 2 }}>
          {prix !== undefined && prix !== null && !isNaN(Number(prix)) ? Number(prix).toFixed(2) : prix} €
        </Typography>
        <Box flex={1} />
        <Stack sx={{ width: '100%' }}>
          <Button
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2, borderRadius: 2, fontWeight: 600 }}
            onClick={() => navigate(`/trajet/${trajet.id_trajet}`)}
          >
            Voir plus de détails
          </Button>
        </Stack>
      </CardContent>
    </Card>
  );
} 