import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Chip } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';

const BACKEND_URL = import.meta.env.VITE_API_URL;

const statusLabels = {
  en_attente: { label: "En attente", color: "warning" },
  confirmee: { label: "Confirmée", color: "success" },
  acceptee: { label: "Acceptée", color: "success" },
  annulee: { label: "Annulée", color: "error" },
  refusee: { label: "Refusée", color: "default" },
};

function getStatusLabel(status) {
  return statusLabels[status] || { label: status, color: "default" };
}

export default function AdminReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");
  const [deleteDialog, setDeleteDialog] = useState({ open: false, reservation: null });

  const fetchReservations = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${BACKEND_URL}/api/admin/reservations`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let data = res.data.data || res.data;
      if (search) {
        data = data.filter(r =>
          r.trajet?.ville_depart?.toLowerCase().includes(search.toLowerCase()) ||
          r.trajet?.ville_arrivee?.toLowerCase().includes(search.toLowerCase()) ||
          r.passager?.nom?.toLowerCase().includes(search.toLowerCase())
        );
      }
      setReservations(data);
      setError("");
    } catch {
      setError("Erreur lors du chargement des réservations.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchReservations(); }, [search]);

  const handleDelete = async () => {
    if (!deleteDialog.reservation) return;
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${BACKEND_URL}/api/admin/reservations/${deleteDialog.reservation.id_reservation}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg("Réservation supprimée !");
      setDeleteDialog({ open: false, reservation: null });
      fetchReservations();
    } catch {
      setError("Erreur lors de la suppression.");
    }
  };

  return (
    <Box minHeight="100vh" bgcolor="grey.100" display="flex" flexDirection="column" alignItems="center" py={4}>
      <Paper sx={{ width: '100%', maxWidth: 1100, p: 3, borderRadius: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>Gestion des réservations</Typography>
        <Box display="flex" alignItems="center" mb={2}>
          <TextField
            label="Filtrer par ville ou passager"
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
                <th style={{ padding: 8 }}>Passager</th>
                <th style={{ padding: 8 }}>Statut</th>
                <th style={{ padding: 8 }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reservations.map(res => (
                <tr key={res.id_reservation} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={{ padding: 8 }}>{res.trajet?.ville_depart || 'N/A'}</td>
                  <td style={{ padding: 8 }}>{res.trajet?.ville_arrivee || 'N/A'}</td>
                  <td style={{ padding: 8 }}>{new Date(res.trajet?.date_heure_depart).toLocaleString()}</td>
                  <td style={{ padding: 8 }}>{res.passager?.nom || 'N/A'}</td>
                  <td style={{ padding: 8 }}>
                    <Chip label={getStatusLabel(res.statut).label} color={getStatusLabel(res.statut).color} size="small" />
                  </td>
                  <td style={{ padding: 8 }}>
                    <IconButton color="error" onClick={() => setDeleteDialog({ open: true, reservation: res })}>
                      <DeleteIcon />
                    </IconButton>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
        <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, reservation: null })}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>Supprimer cette réservation ? Cette action est irréversible.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog({ open: false, reservation: null })}>Annuler</Button>
            <Button onClick={handleDelete} color="error">Supprimer</Button>
          </DialogActions>
        </Dialog>
      </Paper>
    </Box>
  );
} 