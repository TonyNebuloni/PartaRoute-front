import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Button, CircularProgress, Alert, Stack, Snackbar, Slide, Avatar } from "@mui/material";
import axios from "axios";
import.meta.env.VITE_API_URL;

export default function TripDetails() {
  const { id } = useParams();
  const [trip, setTrip] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reservationStatus, setReservationStatus] = useState(null);
  const [resLoading, setResLoading] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [userReservation, setUserReservation] = useState(null);
  const navigate = useNavigate();
  const userId = localStorage.getItem("userId");
  const BACKEND_URL = import.meta.env.VITE_API_URL;
  const DEFAULT_PHOTO = `${BACKEND_URL}/uploads/profile_photos/default.png`;
  let conducteurPhoto = trip?.conducteur?.photo_profil;
  if (conducteurPhoto) {
    if (conducteurPhoto.startsWith('/uploads/')) {
      conducteurPhoto = BACKEND_URL + conducteurPhoto;
    }
  } else {
    conducteurPhoto = DEFAULT_PHOTO;
  }

  useEffect(() => {
    setLoading(true);
    axios.get(`${BACKEND_URL}/api/trips/${id}`)
      .then(res => {
        if (!res.data || !res.data.data) throw new Error("Trajet introuvable");
        setTrip(res.data.data);
        setError("");
      })
      .catch(() => setError("Impossible de charger le trajet."))
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    // Vérifie si l'utilisateur a déjà réservé ce trajet
    const token = localStorage.getItem("accessToken");
    if (!token) return;
    axios.get(`${BACKEND_URL}/api/reservations`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        const reservations = res.data.data || res.data;
        const found = reservations.find(r => String(r.trajet_id) === String(id) && !["annulee", "refusee"].includes(r.statut));
        if (found) setUserReservation(found);
        else setUserReservation(null);
      })
      .catch(() => setUserReservation(null));
  }, [id]);

  const handleReservation = async () => {
    setResLoading(true);
    setReservationStatus(null);
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setNotifOpen(true);
      setResLoading(false);
      setTimeout(() => {
        setNotifOpen(false);
        localStorage.setItem('redirectAfterLogin', window.location.pathname);
        navigate('/login');
      }, 2000);
      return;
    }
    try {
      await axios.post(
        `${BACKEND_URL}/api/reservations`,
        { trajet_id: trip.id || trip._id || trip.id_trajet },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setReservationStatus({ type: "success", msg: "Réservation effectuée avec succès !" });
    } catch (err) {
      setReservationStatus({ type: "error", msg: err.response?.data?.message || "Erreur lors de la réservation." });
    } finally {
      setResLoading(false);
    }
  };

  const handleDeleteTrip = async () => {
    const token = localStorage.getItem("accessToken");
    if (!trip?.id_trajet) return;
    try {
      await axios.delete(`${BACKEND_URL}/api/trips/${trip.id_trajet}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate("/");
    } catch (err) {
      alert("Erreur lors de la suppression du trajet.");
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;
  if (!trip) return null;

  const placesRestantes = (typeof trip?.places_disponibles === 'number' ? trip.places_disponibles : Number(trip.places_disponibles)) - (trip.reservations?.length || 0);

  return (
    <Box minHeight="100vh" bgcolor="grey.100" display="flex" justifyContent="center" alignItems="center" px={1}>
      <Snackbar
        open={notifOpen}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        TransitionComponent={Slide}
        message={<span style={{ color: 'black', fontWeight: 600 }}>Connecte-toi pour réserver !</span>}
        ContentProps={{ sx: { bgcolor: '#7ed957', color: 'black', fontWeight: 600 } }}
      />
      <Paper sx={{ maxWidth: 500, width: '100%', p: 4, borderRadius: 4 }}>
        <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
          <Avatar
            src={conducteurPhoto}
            alt={trip.conducteur?.nom || 'Conducteur'}
            sx={{ width: 72, height: 72, mb: 1, border: '2px solid #ccc' }}
          />
        </Box>
        <Typography variant="h4" align="center" sx={{ fontFamily: 'Pacifico, cursive', mb: 2 }}>
          {trip.ville_depart} → {trip.ville_arrivee}
        </Typography>
        <Stack spacing={1} mb={2}>
          <Typography><b>Date et heure :</b> {new Date(trip.date_heure_depart).toLocaleString()}</Typography>
          <Typography><b>Prix :</b> {trip.prix !== undefined && trip.prix !== null && !isNaN(Number(trip.prix)) ? Number(trip.prix).toFixed(2) : trip.prix} €</Typography>
          <Typography><b>Conducteur :</b> {trip.conducteur?.nom || 'N/A'}</Typography>
          <Typography><b>Places restantes :</b> {placesRestantes > 0 ? placesRestantes : 0}</Typography>
        </Stack>
        {userReservation ? (
          <Alert severity="info" sx={{ mb: 2 }}>Vous avez déjà une demande de réservation en cours pour ce trajet.</Alert>
        ) : reservationStatus && (
          <Alert severity={reservationStatus.type} sx={{ mb: 2 }}>{reservationStatus.msg}</Alert>
        )}
        {String(trip.conducteur?.id_utilisateur) === String(userId) ? (
          <Stack spacing={1}>
            <Button
              variant="contained"
              color="info"
              fullWidth
              onClick={() => navigate('/mes-trajets-conducteur')}
            >
              Gérer mon trajet
            </Button>
            <Button
              variant="outlined"
              color="error"
              fullWidth
              onClick={handleDeleteTrip}
            >
              Supprimer mon trajet
            </Button>
          </Stack>
        ) : (
          userReservation ? (
            <Button
              variant="contained"
              color="info"
              fullWidth
              onClick={() => navigate('/my-trips')}
            >
              Voir le statut de ma réservation
            </Button>
          ) : reservationStatus && reservationStatus.type === "success" ? (
            <Button
              variant="contained"
              color="success"
              fullWidth
              onClick={() => navigate('/my-trips')}
            >
              Voir mes trajets
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              fullWidth
              onClick={handleReservation}
              disabled={resLoading}
            >
              {resLoading ? "Réservation..." : "Réserver ce trajet"}
            </Button>
          )
        )}
      </Paper>
    </Box>
  );
} 