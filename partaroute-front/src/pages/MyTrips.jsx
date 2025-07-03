import { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Alert, Stack, Button } from "@mui/material";
import axios from "axios";
import PaginationMUI from '../components/PaginationMUI';

export default function MyTrips() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const BACKEND_URL = import.meta.env.VITE_API_URL;

  const fetchReservations = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Connecte-toi pour voir tes trajets.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${BACKEND_URL}/api/reservations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setReservations(res.data.data || res.data);
    } catch (err) {
      setError("Erreur lors de la récupération des réservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
    // eslint-disable-next-line
  }, []);

  const handleCancel = async (id) => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.patch(`${BACKEND_URL}/api/reservations/${id}/annuler`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReservations();
    } catch (err) {
      alert("Erreur lors de l'annulation.");
    }
  };

  const handleStatut = async (id, statut) => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.post(`${BACKEND_URL}/api/reservations/${id}/statut`, { statut }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReservations();
    } catch (err) {
      alert("Erreur lors du changement de statut.");
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box minHeight="100vh" bgcolor="grey.100" display="flex" justifyContent="center" alignItems="center" px={1}>
      <Paper sx={{ maxWidth: 600, width: '100%', p: 4, borderRadius: 4 }}>
        <Typography variant="h4" align="center" sx={{ fontFamily: 'Pacifico, cursive', mb: 2 }}>
          Mes trajets réservés
        </Typography>
        {reservations.length === 0 ? (
          <Typography align="center">Aucune réservation trouvée.</Typography>
        ) : (
          <>
            <Stack spacing={2}>
              {reservations.map((res, idx) => (
                <Paper key={res.id_reservation || res.id || res._id || idx} sx={{ p: 2 }}>
                  <Typography><b>Trajet :</b> {res.trajet?.ville_depart} → {res.trajet?.ville_arrivee}</Typography>
                  {res.trajet?.prix !== undefined && (
                    <Typography><b>Prix :</b> {res.trajet.prix !== undefined && res.trajet.prix !== null && !isNaN(Number(res.trajet.prix)) ? Number(res.trajet.prix).toFixed(2) : res.trajet.prix} €</Typography>
                  )}
                  <Typography><b>Date :</b> {res.trajet ? new Date(res.trajet.date_heure_depart).toLocaleString() : 'N/A'}</Typography>
                  <Typography><b>Statut :</b> {
                    res.statut === "en_attente" ? "En attente" :
                    res.statut === "acceptee" ? "Acceptée" :
                    res.statut === "refusee" ? "Refusée" :
                    res.statut === "annulee" ? "Annulée" :
                    res.statut || 'En attente'
                  }</Typography>
                  <Stack direction="row" spacing={1} mt={1}>
                    {/* Bouton Annuler pour le passager */}
                    {String(res.passager_id) === String(userId) && !["annulee", "refusee"].includes(res.statut) && (
                      <Button variant="outlined" color="error" size="small" onClick={() => handleCancel(res.id_reservation)}>
                        Annuler
                      </Button>
                    )}
                    {/* Boutons Accepter/Refuser pour le conducteur */}
                    {String(res.trajet?.conducteur_id) === String(userId) && res.statut === "en_attente" && (
                      <>
                        <Button variant="contained" color="success" size="small" onClick={() => handleStatut(res.id_reservation, "acceptee")}>Accepter</Button>
                        <Button variant="contained" color="error" size="small" onClick={() => handleStatut(res.id_reservation, "refusee")}>Refuser</Button>
                      </>
                    )}
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </>
        )}
      </Paper>
    </Box>
  );
} 