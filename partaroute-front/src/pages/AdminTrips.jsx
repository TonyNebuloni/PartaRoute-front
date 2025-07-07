import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, Card, CardContent, Stack, Avatar, Chip, CircularProgress } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import SearchIcon from '@mui/icons-material/Search';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';

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
          🚗 Gestion des trajets
        </Typography>
      </Box>

      {/* Barre de recherche */}
      <Box mb="4vw">
        <TextField
          label="Rechercher par ville ou conducteur"
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

      {/* Liste des trajets */}
      {trips.length === 0 ? (
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
            🚗 Aucun trajet trouvé
          </Typography>
          <Typography 
            sx={{ 
              fontFamily: 'Gluten, cursive',
              fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
              color: '#999'
            }}
          >
            {search ? 'Essayez de modifier votre recherche' : 'Aucun trajet n\'a été créé pour le moment'}
          </Typography>
        </Box>
      ) : (
        <Stack spacing={3}>
          {trips.map(trip => (
            <Card 
              key={trip.id_trajet}
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
                    {/* Header du trajet */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb="3vw">
                      <Typography 
                        sx={{ 
                          fontFamily: 'Gluten, cursive',
                          fontSize: 'clamp(1.2rem, 5vw, 1.6rem)',
                          color: '#232323',
                          fontWeight: 600
                        }}
                      >
                        {trip.ville_depart} → {trip.ville_arrivee}
                      </Typography>
                      <Chip
                        icon={<DirectionsCarIcon />}
                        label={`${trip.places_disponibles} places`}
                        sx={{
                          bgcolor: trip.places_disponibles > 0 ? '#e8f5e8' : '#ffebee',
                          color: trip.places_disponibles > 0 ? '#4caf50' : '#f44336',
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
                        📅 Date et heure de départ
                      </Typography>
                      <Typography sx={{ 
                        fontFamily: 'Gluten, cursive',
                        fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                        color: '#232323',
                        fontWeight: 600
                      }}>
                        {new Date(trip.date_heure_depart).toLocaleString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>

                    {/* Informations du conducteur */}
                    <Box display="flex" alignItems="center" gap={2} mb="3vw">
                      <Avatar
                        src={trip.conducteur?.photo_profil ? 
                          (trip.conducteur.photo_profil.startsWith('/uploads/') ? 
                            BACKEND_URL + trip.conducteur.photo_profil : 
                            trip.conducteur.photo_profil) : 
                          `${BACKEND_URL}/uploads/profile_photos/default.png`}
                        alt={trip.conducteur?.nom || 'Conducteur'}
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
                          Conducteur
                        </Typography>
                        <Typography sx={{ 
                          fontFamily: 'Gluten, cursive',
                          fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                          color: '#232323',
                          fontWeight: 600
                        }}>
                          {trip.conducteur?.nom || 'N/A'}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Prix */}
                    <Box sx={{ 
                      bgcolor: '#fff3e0', 
                      borderRadius: '12px', 
                      p: '3vw',
                      border: '1px solid #ff9800',
                      display: 'inline-block'
                    }}>
                      <Typography sx={{ 
                        fontFamily: 'Gluten, cursive',
                        fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                        color: '#ff9800',
                        fontWeight: 600,
                        mb: '0.5vw'
                      }}>
                        💰 Prix
                      </Typography>
                      <Typography sx={{ 
                        fontFamily: 'Gluten, cursive',
                        fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                        color: '#ff9800',
                        fontWeight: 700
                      }}>
                        {trip.prix ? `${Number(trip.prix).toFixed(2)} €` : 'N/A'}
                      </Typography>
                    </Box>
                  </Box>

                  {/* Actions */}
                  <Box ml={2}>
                    <IconButton 
                      onClick={() => setDeleteDialog({ open: true, trip })}
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
          ))}
        </Stack>
      )}

      {/* Dialog de suppression */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, trip: null })}
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
            Êtes-vous sûr de vouloir supprimer ce trajet de <strong>{deleteDialog.trip?.ville_depart}</strong> vers <strong>{deleteDialog.trip?.ville_arrivee}</strong> ? Cette action est irréversible et supprimera également toutes les réservations associées.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, flexDirection: 'column' }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, trip: null })}
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