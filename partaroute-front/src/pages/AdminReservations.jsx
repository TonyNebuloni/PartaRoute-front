import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Chip, Card, CardContent, Stack, Avatar, CircularProgress } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import PersonIcon from '@mui/icons-material/Person';

const BACKEND_URL = import.meta.env.VITE_API_URL;

const statusLabels = {
  en_attente: { label: "En attente", color: "#ff9800", bgColor: "#fff3e0" },
  confirmee: { label: "Confirmée", color: "#4caf50", bgColor: "#e8f5e8" },
  acceptee: { label: "Acceptée", color: "#4caf50", bgColor: "#e8f5e8" },
  annulee: { label: "Annulée", color: "#f44336", bgColor: "#ffebee" },
  refusee: { label: "Refusée", color: "#9e9e9e", bgColor: "#f5f5f5" },
};

function getStatusInfo(status) {
  return statusLabels[status] || { label: status, color: "#9e9e9e", bgColor: "#f5f5f5" };
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

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress sx={{ color: '#D6FFB7' }} size={60} />
      </Box>
    );
  }

  return (
    <Box sx={{ pb: { xs: 4, sm: 6, md: 8 } }}>
      {/* Titre et barre de recherche */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="6vw">
        <Typography 
          variant="h4" 
          sx={{ 
            fontFamily: 'Gluten, cursive', 
            fontSize: 'clamp(1.5rem, 7vw, 2.2rem)',
            color: '#232323',
            fontWeight: 700
          }}
        >
          📅 Gestion des réservations
        </Typography>
      </Box>

      {/* Barre de recherche */}
      <Box mb="4vw">
        <TextField
          label="Rechercher par ville ou passager"
          value={search}
          onChange={e => setSearch(e.target.value)}
          variant="outlined"
          fullWidth
          sx={{
            '& .MuiOutlinedInput-root': {
              borderRadius: '15px',
              fontFamily: 'Gluten, cursive',
              '& fieldset': {
                borderColor: '#e0e0e0',
              },
              '&:hover fieldset': {
                borderColor: '#D6FFB7',
              },
              '&.Mui-focused fieldset': {
                borderColor: '#D6FFB7',
              },
            },
            '& .MuiInputLabel-root': {
              fontFamily: 'Gluten, cursive',
              '&.Mui-focused': {
                color: '#D6FFB7',
              },
            },
          }}
          InputProps={{
            startAdornment: <SearchIcon sx={{ color: '#666', mr: 1 }} />
          }}
        />
      </Box>

      {/* Messages */}
      {successMsg && (
        <Alert 
          severity="success" 
          sx={{ 
            mb: '4vw',
            borderRadius: '12px',
            '& .MuiAlert-message': {
              fontFamily: 'Gluten, cursive',
            }
          }}
        >
          {successMsg}
        </Alert>
      )}
      {error && (
        <Alert 
          severity="error" 
          sx={{ 
            mb: '4vw',
            borderRadius: '12px',
            '& .MuiAlert-message': {
              fontFamily: 'Gluten, cursive',
            }
          }}
        >
          {error}
        </Alert>
      )}

      {/* Liste des réservations */}
      {reservations.length === 0 ? (
        <Box 
          sx={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            minHeight: '40vh',
            textAlign: 'center'
          }}
        >
          <Typography 
            sx={{ 
              fontFamily: 'Gluten, cursive',
              fontSize: 'clamp(1.1rem, 4vw, 1.4rem)',
              color: '#666',
              mb: '2vw'
            }}
          >
            📅 Aucune réservation trouvée
          </Typography>
          <Typography 
            sx={{ 
              fontFamily: 'Gluten, cursive',
              fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
              color: '#999'
            }}
          >
            {search ? 'Essayez de modifier votre recherche' : 'Aucune réservation n\'a été effectuée pour le moment'}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {reservations.map(reservation => {
            const statusInfo = getStatusInfo(reservation.statut);
            return (
              <Card 
                key={reservation.id_reservation}
                elevation={2}
                sx={{ 
                  borderRadius: '20px',
                  border: '2px solid #f0f0f0',
                  '&:hover': {
                    border: '2px solid #D6FFB7',
                    transform: 'translateY(-2px)',
                    transition: 'all 0.3s ease'
                  }
                }}
              >
                <CardContent sx={{ p: '4vw' }}>
                  <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                    <Box flex={1}>
                      {/* Header de la réservation */}
                      <Box display="flex" justifyContent="space-between" alignItems="center" mb="3vw">
                        <Typography 
                          sx={{ 
                            fontFamily: 'Gluten, cursive',
                            fontSize: 'clamp(1.2rem, 5vw, 1.6rem)',
                            color: '#232323',
                            fontWeight: 600
                          }}
                        >
                          {reservation.trajet?.ville_depart || 'N/A'} → {reservation.trajet?.ville_arrivee || 'N/A'}
                        </Typography>
                        <Chip
                          label={statusInfo.label}
                          sx={{
                            bgcolor: statusInfo.bgColor,
                            color: statusInfo.color,
                            fontFamily: 'Gluten, cursive',
                            fontWeight: 600,
                            fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)',
                            borderRadius: '12px'
                          }}
                        />
                      </Box>

                      {/* Informations du trajet */}
                      <Box sx={{ 
                        bgcolor: '#f8f9fa', 
                        borderRadius: '12px', 
                        p: '3vw',
                        border: '1px solid #e9ecef',
                        mb: '3vw'
                      }}>
                        <Typography sx={{ 
                          fontFamily: 'Gluten, cursive',
                          fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                          color: '#666',
                          mb: '1vw'
                        }}>
                          📅 Date et heure du trajet
                        </Typography>
                        <Typography sx={{ 
                          fontFamily: 'Gluten, cursive',
                          fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                          color: '#232323',
                          fontWeight: 600
                        }}>
                          {reservation.trajet?.date_heure_depart ? 
                            new Date(reservation.trajet.date_heure_depart).toLocaleString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            }) : 'N/A'
                          }
                        </Typography>
                      </Box>

                      {/* Informations du passager */}
                      <Box display="flex" alignItems="center" gap={2} mb="3vw">
                        <Avatar
                          src={reservation.passager?.photo_profil ? 
                            (reservation.passager.photo_profil.startsWith('/uploads/') ? 
                              BACKEND_URL + reservation.passager.photo_profil : 
                              reservation.passager.photo_profil) : 
                            `${BACKEND_URL}/uploads/profile_photos/default.png`}
                          alt={reservation.passager?.nom || 'Passager'}
                          sx={{ 
                            width: 'clamp(40px, 10vw, 50px)', 
                            height: 'clamp(40px, 10vw, 50px)',
                            border: '2px solid #D6FFB7'
                          }}
                        />
                        <Box>
                          <Typography sx={{ 
                            fontFamily: 'Gluten, cursive',
                            fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                            color: '#666'
                          }}>
                            Passager
                          </Typography>
                          <Typography sx={{ 
                            fontFamily: 'Gluten, cursive',
                            fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                            color: '#232323',
                            fontWeight: 600
                          }}>
                            {reservation.passager?.nom || 'N/A'}
                          </Typography>
                        </Box>
                      </Box>

                      {/* Date de réservation */}
                      <Box sx={{ 
                        bgcolor: '#e3f2fd', 
                        borderRadius: '12px', 
                        p: '3vw',
                        border: '1px solid #2196f3',
                        display: 'inline-block'
                      }}>
                        <Typography sx={{ 
                          fontFamily: 'Gluten, cursive',
                          fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                          color: '#2196f3',
                          fontWeight: 600,
                          mb: '0.5vw'
                        }}>
                          📋 Réservation effectuée
                        </Typography>
                        <Typography sx={{ 
                          fontFamily: 'Gluten, cursive',
                          fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                          color: '#2196f3',
                          fontWeight: 600
                        }}>
                          {reservation.date_reservation ? 
                            new Date(reservation.date_reservation).toLocaleDateString('fr-FR', {
                              weekday: 'short',
                              year: 'numeric',
                              month: 'short',
                              day: 'numeric'
                            }) : 'N/A'
                          }
                        </Typography>
                      </Box>
                    </Box>

                    {/* Actions */}
                    <Box ml={2}>
                      <IconButton 
                        onClick={() => setDeleteDialog({ open: true, reservation })}
                        sx={{
                          bgcolor: '#ff4444',
                          color: 'white',
                          '&:hover': {
                            bgcolor: '#e63939',
                            transform: 'scale(1.05)',
                          },
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Stack>
      )}

      {/* Dialog de suppression */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, reservation: null })}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            fontFamily: 'Gluten, cursive'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Gluten, cursive', fontWeight: 600, color: '#232323' }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent>
          <Typography sx={{ fontFamily: 'Gluten, cursive', color: '#666' }}>
            Êtes-vous sûr de vouloir supprimer cette réservation de <strong>{deleteDialog.reservation?.passager?.nom}</strong> pour le trajet <strong>{deleteDialog.reservation?.trajet?.ville_depart} → {deleteDialog.reservation?.trajet?.ville_arrivee}</strong> ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, flexDirection: 'column' }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, reservation: null })}
            sx={{
              color: '#666',
              fontFamily: 'Gluten, cursive',
              textTransform: 'none',
              borderRadius: '999px',
              px: 2,
              py: 1,
              width: '100%'
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDelete}
            variant="contained"
            sx={{
              bgcolor: '#ff4444',
              color: 'white',
              fontFamily: 'Gluten, cursive',
              textTransform: 'none',
              borderRadius: '999px',
              px: 2,
              py: 1,
              width: '100%',
              '&:hover': {
                bgcolor: '#e63939',
              },
            }}
          >
            Oui, supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 