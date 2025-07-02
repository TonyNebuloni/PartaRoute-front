import { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Alert, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar } from "@mui/material";
import axios from "axios";
import PaginationMUI from '../components/PaginationMUI';
import EditTripModal from '../components/EditTripModal';

export default function MesTrajetsConducteur() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);
  const [editOpen, setEditOpen] = useState(false);
  const [editTrip, setEditTrip] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });

  const fetchTrips = async (pageArg = page, limitArg = limit) => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Connecte-toi pour voir tes trajets proposés.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`http://localhost:3000/api/trips/conducteur/trajets?page=${pageArg}&limit=${limitArg}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(res.data.data || res.data);
      setTotal(res.data.total || 0);
      setPage(res.data.page || 1);
      setLimit(res.data.limit || 10);
    } catch (err) {
      setError("Erreur lors de la récupération des trajets proposés.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrips();
  }, []);

  useEffect(() => {
    const handleCreated = () => fetchTrips(page, limit);
    window.addEventListener('trajetCreated', handleCreated);
    return () => window.removeEventListener('trajetCreated', handleCreated);
  }, [page, limit]);

  const handleStatut = async (id, statut) => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.post(`http://localhost:3000/api/reservations/${id}/statut`, { statut }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchTrips();
    } catch (err) {
      alert("Erreur lors du changement de statut.");
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const token = localStorage.getItem('accessToken');
    try {
      await axios.delete(`http://localhost:3000/api/trips/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Trajet supprimé avec succès.' });
      setDeleteOpen(false);
      setDeleteId(null);
      fetchTrips(page, limit);
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression du trajet.' });
      setDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchTrips(newPage, limit);
  };
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    fetchTrips(1, newLimit);
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box minHeight="100vh" bgcolor="grey.100" display="flex" justifyContent="center" alignItems="flex-start" px={1}>
      <Paper sx={{ maxWidth: 800, width: '100%', p: 4, borderRadius: 4 }}>
        <Typography variant="h4" align="center" sx={{ fontFamily: 'Pacifico, cursive', mb: 2 }}>
          Mes trajets proposés
        </Typography>
        {trips.length === 0 ? (
          <Typography align="center">Aucun trajet proposé ou aucune réservation reçue.</Typography>
        ) : (
          <>
            <Stack spacing={4}>
              {trips.map((trajet, idx) => (
                <Paper key={trajet.id_trajet || idx} sx={{ p: 2, bgcolor: '#f5f5f5' }}>
                  <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                      <Typography variant="h6" sx={{ mb: 1 }}>{trajet.ville_depart} → {trajet.ville_arrivee} ({new Date(trajet.date_heure_depart).toLocaleString()})</Typography>
                      {trajet.prix !== undefined && (
                        <Typography sx={{ mb: 1 }}><b>Prix :</b> {trajet.prix !== undefined && trajet.prix !== null && !isNaN(Number(trajet.prix)) ? Number(trajet.prix).toFixed(2) : trajet.prix} €</Typography>
                      )}
                      <Typography sx={{ mb: 1 }}>Places dispo : {trajet.places_disponibles}</Typography>
                      <Stack spacing={1}>
                        {(trajet.reservations || []).length === 0 ? (
                          <Typography>Aucune réservation pour ce trajet.</Typography>
                        ) : (
                          trajet.reservations.map((res, i) => (
                            <Paper key={res.id_reservation || i} sx={{ p: 1, bgcolor: '#fff' }}>
                              <Typography><b>Passager :</b> {res.passager?.nom || res.passager_id}</Typography>
                              <Typography><b>Statut :</b> {res.statut}</Typography>
                              {res.statut === "en_attente" && (
                                <Stack direction="row" spacing={1} mt={1}>
                                  <Button variant="contained" color="success" size="small" onClick={() => handleStatut(res.id_reservation, "acceptee")}>Accepter</Button>
                                  <Button variant="contained" color="error" size="small" onClick={() => handleStatut(res.id_reservation, "refusee")}>Refuser</Button>
                                </Stack>
                              )}
                            </Paper>
                          ))
                        )}
                      </Stack>
                    </Box>
                    <Button variant="outlined" color="primary" size="small" sx={{ ml: 2, mt: 1 }} onClick={() => { setEditTrip(trajet); setEditOpen(true); }}>
                      Modifier
                    </Button>
                    <Button variant="outlined" color="error" size="small" sx={{ ml: 1, mt: 1 }} onClick={() => { setDeleteId(trajet.id_trajet); setDeleteOpen(true); }}>
                      Supprimer
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
            <PaginationMUI
              page={page}
              count={Math.ceil(total / limit) || 1}
              onChange={handlePageChange}
              limit={limit}
              onLimitChange={handleLimitChange}
            />
            <EditTripModal
              open={editOpen}
              onClose={() => setEditOpen(false)}
              trip={editTrip}
              onSuccess={() => fetchTrips(page, limit)}
            />
            <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
              <DialogTitle>Confirmer la suppression</DialogTitle>
              <DialogContent>
                Es-tu sûr de vouloir supprimer ce trajet ? Cette action est irréversible.
              </DialogContent>
              <DialogActions>
                <Button onClick={() => setDeleteOpen(false)}>Annuler</Button>
                <Button onClick={handleDelete} color="error" variant="contained">Supprimer</Button>
              </DialogActions>
            </Dialog>
            <Snackbar
              open={snackbar.open}
              autoHideDuration={3000}
              onClose={() => setSnackbar({ open: false, message: '' })}
              message={snackbar.message}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            />
          </>
        )}
      </Paper>
    </Box>
  );
} 