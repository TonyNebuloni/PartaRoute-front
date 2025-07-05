import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, Stack, Button, TextField, CircularProgress, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Alert } from "@mui/material";
import { useNavigate } from "react-router-dom";
import ProfilePhotoUploader from "../components/ProfilePhotoUploader";
import logoIcon from '../assets/logo_icon.png';

// Ajout de la police Google Fonts via une balise <link>
if (!document.getElementById('google-font-gluten')) {
  const preconnect1 = document.createElement('link');
  preconnect1.rel = 'preconnect';
  preconnect1.href = 'https://fonts.googleapis.com';
  document.head.appendChild(preconnect1);
  
  const preconnect2 = document.createElement('link');
  preconnect2.rel = 'preconnect';
  preconnect2.href = 'https://fonts.gstatic.com';
  preconnect2.crossOrigin = 'anonymous';
  document.head.appendChild(preconnect2);
  
  const link = document.createElement('link');
  link.id = 'google-font-gluten';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Gluten:wght@100..900&display=swap';
  document.head.appendChild(link);
}

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function MyProfile() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editData, setEditData] = useState({ nom: "", email: "", mot_de_passe: "" });
  const [saving, setSaving] = useState(false);
  const [deleteDialog, setDeleteDialog] = useState(false);
  const [logoutDialog, setLogoutDialog] = useState(false);
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

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    setSuccessMsg("Déconnexion réussie !");
    setRedirecting(true);
    setTimeout(() => {
      navigate("/login", { replace: true });
    }, 1000);
  };

  const confirmLogout = () => {
    setLogoutDialog(false);
    handleLogout();
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

  if (loading) return (
    <Box minHeight="100vh" bgcolor="#222" display="flex" alignItems="center" justifyContent="center">
      <CircularProgress sx={{ color: '#D6FFB7' }} />
    </Box>
  );

  if (error) return (
    <Box minHeight="100vh" bgcolor="#222" display="flex" alignItems="center" justifyContent="center">
      <Typography color="#D6FFB7" align="center" sx={{ fontFamily: 'Gluten, cursive', fontSize: 'clamp(1rem, 4vw, 1.2rem)' }}>
        {error}
      </Typography>
    </Box>
  );

  return (
    <Box minHeight="150vh" bgcolor="#222" display="flex" flexDirection="column" alignItems="center" justifyContent="flex-start" fontFamily="'Gluten', cursive">
      {redirecting && (
        <Box position="fixed" top={0} left={0} width="100vw" height="100vh" zIndex={2000} bgcolor="rgba(0,0,0,0.7)" display="flex" alignItems="center" justifyContent="center">
          <CircularProgress size={60} sx={{ color: '#D6FFB7' }} />
        </Box>
      )}
      
      {/* Header noir avec logo */}
      <Box width="100%" maxWidth="500px" bgcolor="#222" pt="8vw" pb="4vw" borderTopLeftRadius={0} borderTopRightRadius={0} display="flex" flexDirection="column" alignItems="center">
        <Box mb="2vw" width="40vw" maxWidth="250px">
          <img src={logoIcon} alt="Logo PartaRoute" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </Box>
      </Box>

      {/* Formulaire blanc arrondi */}
      <Paper elevation={3} sx={{
        width: '100%',
        minHeight: '130vh',
        borderTopLeftRadius: '10vw',
        borderTopRightRadius: 0,
        borderBottomLeftRadius: 0,
        borderBottomRightRadius: 0,
        mt: 0,
        p: '6vw',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Gluten, cursive',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
        filter: redirecting ? 'blur(2px)' : 'none',
        pointerEvents: redirecting ? 'none' : 'auto',
        opacity: redirecting ? 0.5 : 1
      }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontFamily: 'Gluten, cursive', fontSize: 'clamp(1.2rem, 7vw, 2.2rem)', mb: '6vw', mt: '2vw' }}
        >
          Mon Profil
        </Typography>
        <Typography variant="body2" align="center" sx={{ color: 'grey.600', mb: '4vw', fontFamily: 'Gluten, cursive', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
          Gérez vos informations personnelles
        </Typography>

        {/* Photo de profil */}
        <Box sx={{ mb: '4vw' }}>
          <ProfilePhotoUploader />
        </Box>

        {error && (
          <Typography color="error" align="center" variant="body2" sx={{ mb: '4vw', fontFamily: 'Gluten, cursive' }}>
            {error}
          </Typography>
        )}

        <Box component="form" onSubmit={handleSave} width="100%" noValidate>
          <Stack spacing={3}>
            <TextField
              label="Nom"
              name="nom"
              value={editData.nom}
              onChange={handleChange}
              fullWidth
              required
              variant="standard"
              InputProps={{ 
                sx: { 
                  fontFamily: 'Gluten, cursive', 
                  fontSize: 'clamp(1rem, 4vw, 1.2rem)',
                  paddingLeft: '16px',
                  paddingRight: '8px',
                  paddingY: '4px',
                  '&:before': {
                    borderBottomColor: '#000',
                    borderBottomWidth: '2px',
                  },
                  '&:after': {
                    borderBottomColor: '#D6FFB7',
                    borderBottomWidth: '2px',
                    borderImage: 'linear-gradient(to right, #D6FFB7, #D6FFB7) 1',
                  },
                  '&:hover:not(.Mui-disabled):before': {
                    borderBottomColor: '#000',
                  },
                  '&.Mui-focused:after': {
                    borderBottomColor: '#D6FFB7',
                  },
                } 
              }}
              InputLabelProps={{ 
                sx: { 
                  fontFamily: 'Gluten, cursive', 
                  fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                  color: '#000',
                  paddingLeft: '16px',
                  '&.Mui-focused': {
                    color: '#000',
                  },
                } 
              }}
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={editData.email}
              onChange={handleChange}
              fullWidth
              required
              variant="standard"
              InputProps={{ 
                sx: { 
                  fontFamily: 'Gluten, cursive', 
                  fontSize: 'clamp(1rem, 4vw, 1.2rem)',
                  paddingLeft: '16px',
                  paddingRight: '8px',
                  paddingY: '4px',
                  '&:before': {
                    borderBottomColor: '#000',
                    borderBottomWidth: '2px',
                  },
                  '&:after': {
                    borderBottomColor: '#D6FFB7',
                    borderBottomWidth: '2px',
                    borderImage: 'linear-gradient(to right, #D6FFB7, #D6FFB7) 1',
                  },
                  '&:hover:not(.Mui-disabled):before': {
                    borderBottomColor: '#000',
                  },
                  '&.Mui-focused:after': {
                    borderBottomColor: '#D6FFB7',
                  },
                } 
              }}
              InputLabelProps={{ 
                sx: { 
                  fontFamily: 'Gluten, cursive', 
                  fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                  color: '#000',
                  paddingLeft: '16px',
                  '&.Mui-focused': {
                    color: '#000',
                  },
                } 
              }}
            />
            <TextField
              label="Nouveau mot de passe"
              name="mot_de_passe"
              type="password"
              value={editData.mot_de_passe}
              onChange={handleChange}
              fullWidth
              autoComplete="new-password"
              variant="standard"
              InputProps={{ 
                sx: { 
                  fontFamily: 'Gluten, cursive', 
                  fontSize: 'clamp(1rem, 4vw, 1.2rem)',
                  paddingLeft: '16px',
                  paddingRight: '8px',
                  paddingY: '4px',
                  '&:before': {
                    borderBottomColor: '#000',
                    borderBottomWidth: '2px',
                  },
                  '&:after': {
                    borderBottomColor: '#D6FFB7',
                    borderBottomWidth: '2px',
                    borderImage: 'linear-gradient(to right, #D6FFB7, #D6FFB7) 1',
                  },
                  '&:hover:not(.Mui-disabled):before': {
                    borderBottomColor: '#000',
                  },
                  '&.Mui-focused:after': {
                    borderBottomColor: '#D6FFB7',
                  },
                } 
              }}
              InputLabelProps={{ 
                sx: { 
                  fontFamily: 'Gluten, cursive', 
                  fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                  color: '#000',
                  paddingLeft: '16px',
                  '&.Mui-focused': {
                    color: '#000',
                  },
                } 
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              disabled={saving}
              sx={{
                mt: '2vw',
                bgcolor: '#222',
                color: 'white',
                borderRadius: '999px',
                fontWeight: 'bold',
                py: '3.5vw',
                fontSize: 'clamp(1rem, 4vw, 1.2rem)',
                letterSpacing: 1,
                boxShadow: 2,
                fontFamily: 'Gluten, cursive',
                '&:active': { transform: 'scale(0.97)' },
                '&:hover': { bgcolor: '#111' },
                '&:disabled': { bgcolor: '#666' },
              }}
            >
              {saving ? "ENREGISTREMENT..." : "ENREGISTRER"}
            </Button>
          </Stack>
        </Box>

        {/* Boutons d'action */}
        <Stack spacing={2} sx={{ mt: '4vw', width: '100%' }}>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setLogoutDialog(true)}
            sx={{
              borderColor: '#D6FFB7',
              color: '#222',
              borderRadius: '999px',
              fontWeight: 'bold',
              py: '3vw',
              fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
              letterSpacing: 1,
              fontFamily: 'Gluten, cursive',
              '&:hover': { 
                borderColor: '#D6FFB7',
                bgcolor: '#D6FFB7',
                color: '#222'
              },
            }}
          >
            SE DÉCONNECTER
          </Button>
          <Button
            variant="outlined"
            fullWidth
            onClick={() => setDeleteDialog(true)}
            sx={{
              borderColor: '#ff4444',
              color: '#ff4444',
              borderRadius: '999px',
              fontWeight: 'bold',
              py: '3vw',
              fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
              letterSpacing: 1,
              fontFamily: 'Gluten, cursive',
              '&:hover': { 
                borderColor: '#ff4444',
                bgcolor: '#ff4444',
                color: 'white'
              },
            }}
          >
            SUPPRIMER MON COMPTE
          </Button>
        </Stack>
        
        {/* Dialogs */}
        <Dialog open={deleteDialog} onClose={() => setDeleteDialog(false)}>
          <DialogTitle sx={{ fontFamily: 'Gluten, cursive' }}>Confirmer la suppression</DialogTitle>
          <DialogContent>
            <Typography sx={{ fontFamily: 'Gluten, cursive' }}>
              Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteDialog(false)} disabled={deleteLoading} sx={{ fontFamily: 'Gluten, cursive' }}>
              Annuler
            </Button>
            <Button onClick={handleDelete} color="error" disabled={deleteLoading} sx={{ fontFamily: 'Gluten, cursive' }}>
              {deleteLoading ? "Suppression..." : "Supprimer"}
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={logoutDialog} onClose={() => setLogoutDialog(false)}>
          <DialogTitle sx={{ fontFamily: 'Gluten, cursive' }}>Confirmer la déconnexion</DialogTitle>
          <DialogContent>
            <Typography sx={{ fontFamily: 'Gluten, cursive' }}>
              Êtes-vous sûr de vouloir vous déconnecter ?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setLogoutDialog(false)} sx={{ fontFamily: 'Gluten, cursive' }}>
              Annuler
            </Button>
            <Button onClick={confirmLogout} color="error" sx={{ fontFamily: 'Gluten, cursive' }}>
              Se déconnecter
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar open={!!successMsg} autoHideDuration={2000} onClose={() => setSuccessMsg("")}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <Alert onClose={() => setSuccessMsg("")} severity="success" sx={{ width: '100%', fontFamily: 'Gluten, cursive' }}>
            {successMsg}
          </Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
} 