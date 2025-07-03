import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, Stack, Button, TextField, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ProfilePhotoUploader from "../components/ProfilePhotoUploader";

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editData, setEditData] = useState({ nom: "", email: "", mot_de_passe: "" });
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [redirecting, setRedirecting] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const id = localStorage.getItem("userId");
    if (!token || !id) {
      navigate("/login");
      return;
    }
    axios.get(`${BACKEND_URL}/api/user/${id}`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setUser(res.data.data);
        setEditData({ nom: res.data.data.nom, email: res.data.data.email, mot_de_passe: "" });
        setLoading(false);
      })
      .catch((err) => {
        setError("Impossible de charger les informations utilisateur.");
        setLoading(false);
        handleApiError(err);
      });
  }, [navigate]);

  const handleChange = e => {
    setEditData({ ...editData, [e.target.name]: e.target.value });
  };

  const handleSave = e => {
    e.preventDefault();
    setSaving(true);
    const token = localStorage.getItem("accessToken");
    axios.put(`${BACKEND_URL}/api/user/edit`, editData, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => {
        setUser(res.data.data);
        setEditData({ ...editData, mot_de_passe: "" });
        setSaving(false);
        setSuccessMsg("Profil mis à jour avec succès !");
        setRedirecting(true);
        setTimeout(() => {
          navigate("/");
        }, 1500);
      })
      .catch((err) => {
        setError("Erreur lors de la mise à jour.");
        setSaving(false);
        handleApiError(err);
      });
  };

  const handleDelete = () => {
    setDeleteLoading(true);
    const token = localStorage.getItem("accessToken");
    axios.delete(`${BACKEND_URL}/api/user/delete`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(() => {
        setDeleteLoading(false);
        setSuccessMsg("Compte supprimé avec succès.");
        setTimeout(() => {
          localStorage.clear();
          navigate("/login");
        }, 1500);
      })
      .catch((err) => {
        setError("Erreur lors de la suppression du compte.");
        setDeleteLoading(false);
        handleApiError(err);
      });
  };

  const handleApiError = (err) => {
    if (err?.response?.status === 401 || err?.response?.status === 500) {
      localStorage.clear();
      navigate("/login");
    }
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  if (error) return <Typography color="error" align="center">{error}</Typography>;

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="grey.100">
      {redirecting && (
        <Box position="fixed" top={0} left={0} width="100vw" height="100vh" zIndex={2000} bgcolor="rgba(255,255,255,0.7)" display="flex" alignItems="center" justifyContent="center">
          <CircularProgress size={60} />
        </Box>
      )}
      <Paper elevation={3} sx={{ p: 4, minWidth: 320, maxWidth: 400, filter: redirecting ? 'blur(2px)' : 'none', pointerEvents: redirecting ? 'none' : 'auto', opacity: redirecting ? 0.5 : 1 }}>
        <Typography variant="h5" align="center" gutterBottom>Mon Profil</Typography>
        <ProfilePhotoUploader />
        <form onSubmit={handleSave}>
          <Stack spacing={2}>
            <TextField label="Nom" name="nom" value={editData.nom} onChange={handleChange} fullWidth required />
            <TextField label="Email" name="email" value={editData.email} onChange={handleChange} fullWidth required type="email" />
            <TextField label="Nouveau mot de passe" name="mot_de_passe" value={editData.mot_de_passe} onChange={handleChange} fullWidth type="password" autoComplete="new-password" />
            <Button type="submit" variant="contained" color="primary" disabled={saving}>{saving ? "Enregistrement..." : "Enregistrer"}</Button>
          </Stack>
        </form>
        <Button color="error" variant="outlined" sx={{ mt: 3 }} onClick={() => setDeleteDialog(true)}>Supprimer mon compte</Button>
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography>Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)} disabled={deleteLoading}>Annuler</Button>
            <Button onClick={handleDelete} color="error" disabled={deleteLoading}>{deleteLoading ? "Suppression..." : "Supprimer"}</Button>
          </DialogActions>
        </Dialog>
        <Snackbar open={!!successMsg} autoHideDuration={2000} onClose={() => setSuccessMsg("")}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={() => setSuccessMsg("")} severity="success" sx={{ width: '100%' }}>
            {successMsg}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
} 