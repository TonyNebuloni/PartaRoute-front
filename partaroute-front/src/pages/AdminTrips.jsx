import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function AdminTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, trip: null });

  const fetchTrips = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${BACKEND_URL}/api/admin/trips`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let data = res.data.data || res.data;
      if (search) {
        data = data.filter(t =>
          t.ville_depart.toLowerCase().includes(search.toLowerCase()) ||
          t.ville_arrivee.toLowerCase().includes(search.toLowerCase()) ||
          t.conducteur?.nom?.toLowerCase().includes(search.toLowerCase())
        );
      }
      setTrips(data);
      setError("");
    } catch {
      setError("Erreur lors du chargement des trajets.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchTrips(); }, [search]);

  const handleDelete = async () => {
    if (!deleteDialog.trip) return;
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${BACKEND_URL}/api/admin/trips/${deleteDialog.trip.id_trajet}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg("Trajet supprimé !");
      setDeleteDialog({ open: false, trip: null });
      fetchTrips();
    } catch {
      setError("Erreur lors de la suppression.");
    }
  };

  return (
    <Box minHeight="100vh" bgcolor="grey.100" display="flex" flexDirection="column" alignItems="center" py={4}>
      <Paper sx={{ width: '100%', maxWidth: 1100, p: 3, borderRadius: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>Gestion des trajets</Typography>
        <Box display="flex" alignItems="center" mb={2}>
          <TextField
            label="Filtrer par ville ou conducteur"
            size="small"
            value={search}
            onChange={e => setSearch(e.target.value)}
            sx={{ mr: 2 }}
          />
        </Box>
        {successMsg && <Box mb={2}><Alert severity="success">{successMsg}</Alert></Box>}
        {error && <Box mb={2}><Alert severity="error">{error}</Alert></Box>}
        <Box overflow="auto">
          <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
            <thead>
              <tr style={{ background: '#f5f5f5' }}>
                <th style={{ padding: 8 }}>Départ</th>
                <th style={{ padding: 8 }}>Arrivée</th>
                <th style={{ padding: 8 }}>Date</th>
                <th style={{ padding: 8 }}>Conducteur</th>
                <th style={{ padding: 8 }}>Places</th>
                <th style={{ padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {trips.map(trip => (
                <tr key={trip.id_trajet} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 8 }}>{trip.ville_depart}</td>
                  <td style={{ padding: 8 }}>{trip.ville_arrivee}</td>
                  <td style={{ padding: 8 }}>{new Date(trip.date_heure_depart).toLocaleString()}</td>
                  <td style={{ padding: 8 }}>{trip.conducteur?.nom || 'N/A'}</td>
                  <td style={{ padding: 8 }}>{trip.places_disponibles}</td>
                  <td style={{ padding: 8 }}>
                    <IconButton color="error" onClick={() => setDeleteDialog({ open: true, trip })}>
                      <DeleteIcon />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, trip: null })}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>Supprimer ce trajet ? Cette action est irréversible.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, trip: null })}>Annuler</Button>
            <Button onClick={handleDelete} color="error">Supprimer</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
} 