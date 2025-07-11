import { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Alert, Stack, Button, Dialog, DialogTitle, DialogContent, DialogActions, Snackbar, Avatar, Chip, DialogContentText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import EditTripModal from '../components/EditTripModal';
import TripForm from '../components/TripForm';
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

export default function MyDriverTrips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editOpen, setEditOpen] = useState(false);
  const [editTrip, setEditTrip] = useState(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '' });
  const navigate = useNavigate();

  const fetchTrips = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("accessToken");
    if (!token) {
      setError("Connecte-toi pour voir tes trajets proposés.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${BACKEND_URL}/api/trips/conducteur/trajets`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setTrips(res.data.data || res.data);
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
    const handleCreated = () => fetchTrips();
    window.addEventListener('trajetCreated', handleCreated);
    return () => window.removeEventListener('trajetCreated', handleCreated);
  }, []);

  const handleStatut = async (id, statut) => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.post(`${BACKEND_URL}/api/reservations/${id}/statut`, { statut }, {
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
      await axios.delete(`${BACKEND_URL}/api/trips/${deleteId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSnackbar({ open: true, message: 'Trajet supprimé avec succès.' });
      setDeleteOpen(false);
      setDeleteId(null);
      fetchTrips();
    } catch (err) {
      setSnackbar({ open: true, message: 'Erreur lors de la suppression du trajet.' });
      setDeleteOpen(false);
      setDeleteId(null);
    }
  };

  const getStatusInfo = (statut) => {
    switch (statut) {
      case "en_attente":
        return { label: "En attente", color: "#ff9800", bgColor: "#fff3e0" };
      case "acceptee":
        return { label: "Acceptée", color: "#4caf50", bgColor: "#e8f5e8" };
      case "refusee":
        return { label: "Refusée", color: "#f44336", bgColor: "#ffebee" };
      case "annulee":
        return { label: "Annulée", color: "#9e9e9e", bgColor: "#f5f5f5" };
      default:
        return { label: "En attente", color: "#ff9800", bgColor: "#fff3e0" };
    }
  };

  if (loading) return (
    <Box minHeight="100vh" bgcolor="#232323" display="flex" alignItems="center" justifyContent="center">
      <CircularProgress sx={{ color: '#D6FFB7' }} />
    </Box>
  );
  
  if (error) return (
    <Box minHeight="100vh" bgcolor="#232323" display="flex" alignItems="center" justifyContent="center" p="6vw">
      <Typography color="#D6FFB7" align="center" sx={{ fontFamily: 'Gluten, cursive', fontSize: 'clamp(1rem, 4vw, 1.2rem)' }}>
        {error}
      </Typography>
    </Box>
  );

  return (
    <>
      {/* VERSION MOBILE (inchangée) */}
      <Box 
        minHeight="100vh" 
        bgcolor="#232323" 
        display={{ xs: "flex", md: "none" }} 
        flexDirection="column" 
        alignItems="center" 
        justifyContent="flex-start" 
        fontFamily="'Gluten', cursive"
        sx={{ 
          width: '100%',
          maxWidth: '100vw',
          overflowX: 'hidden',
          boxSizing: 'border-box'
        }}
      >
        {/* Header avec bouton retour */}
        <Box width="100%" maxWidth="100vw" bgcolor="#232323" pt="8vw" pb="4vw" display="flex" alignItems="center" justifyContent="space-between" px="6vw" sx={{ boxSizing: 'border-box' }}>
          <Button
            onClick={() => navigate(-1)}
            sx={{
              color: '#D6FFB7',
              fontFamily: 'Gluten, cursive',
              fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
              textTransform: 'none',
              minWidth: 'auto',
              '&:hover': {
                bgcolor: 'rgba(214, 255, 183, 0.1)',
              }
            }}
            startIcon={<ArrowBackIcon />}
          >
            Retour
          </Button>
          <Typography 
            variant="h5" 
            sx={{ 
              fontFamily: 'Gluten, cursive',
              fontSize: 'clamp(1.2rem, 5vw, 1.8rem)',
              color: '#D6FFB7',
              fontWeight: 600,
              textAlign: 'center',
              flex: 1,
              mx: 2,
              whiteSpace: 'nowrap'
            }}
          >
            Mes trajets proposés
          </Typography>
          <Box width="clamp(60px, 15vw, 80px)" /> {/* Spacer pour centrer le titre */}
        </Box>

        {/* Contenu principal blanc */}
        <Paper elevation={3} sx={{
          width: '100%',
          maxWidth: '100vw',
          minHeight: '100vh',
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
          overflow: 'hidden'
        }}>
          {/* Titre et bouton créer */}
          <Box display="flex" justifyContent="space-between" alignItems="center" width="100%" mb="6vw" mt="2vw">
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: 'Gluten, cursive', 
                fontSize: 'clamp(1.5rem, 7vw, 2.2rem)',
                color: '#232323',
                fontWeight: 700,
                flex: 1
              }}
            >
              Mes trajets
            </Typography>
            <Button
              variant="contained"
              onClick={() => setCreateOpen(true)}
              startIcon={<AddIcon />}
              sx={{
                bgcolor: '#D6FFB7',
                color: '#232323',
                borderRadius: '999px',
                fontWeight: 'bold',
                py: '2vw',
                px: '4vw',
                fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                fontFamily: 'Gluten, cursive',
                textTransform: 'none',
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: '#c5e8a6',
                },
              }}
            >
              Créer un trajet
            </Button>
          </Box>

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
                  mb: '4vw'
                }}
              >
                🚗 Aucun trajet proposé
              </Typography>
              <Typography 
                sx={{ 
                  fontFamily: 'Gluten, cursive',
                  fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                  color: '#999',
                  mb: '6vw'
                }}
              >
                Créez votre premier trajet pour commencer à recevoir des réservations !
              </Typography>
              <Button
                variant="contained"
                onClick={() => setCreateOpen(true)}
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: '#D6FFB7',
                  color: '#232323',
                  borderRadius: '999px',
                  fontWeight: 'bold',
                  py: '3vw',
                  px: '6vw',
                  fontSize: 'clamp(1rem, 4vw, 1.2rem)',
                  fontFamily: 'Gluten, cursive',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#c5e8a6',
                  },
                }}
              >
                Créer mon premier trajet
              </Button>
            </Box>
          ) : (
            <Stack spacing={4} width="100%">
              {trips.map((trajet, idx) => (
                <Paper 
                  key={trajet.id_trajet || idx} 
                  elevation={2}
                  sx={{ 
                    p: '5vw', 
                    borderRadius: '20px',
                    border: '2px solid #f0f0f0',
                    '&:hover': {
                      border: '2px solid #D6FFB7',
                      transform: 'translateY(-2px)',
                      transition: 'all 0.3s ease'
                    }
                  }}
                >
                  {/* Header du trajet */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb="4vw">
                    <Typography 
                      sx={{ 
                        fontFamily: 'Gluten, cursive',
                        fontSize: 'clamp(1.2rem, 5vw, 1.6rem)',
                        color: '#232323',
                        fontWeight: 600
                      }}
                    >
                      {trajet.ville_depart} → {trajet.ville_arrivee}
                    </Typography>
                    <Typography 
                      sx={{ 
                        fontFamily: 'Gluten, cursive',
                        fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                        color: '#666'
                      }}
                    >
                      {new Date(trajet.date_heure_depart).toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </Typography>
                  </Box>

                  {/* Détails du trajet */}
                  <Stack spacing={2} mb="4vw">
                    <Box sx={{ 
                      bgcolor: '#f8f9fa', 
                      borderRadius: '12px', 
                      p: '3vw',
                      border: '1px solid #e9ecef'
                    }}>
                      <Typography sx={{ 
                        fontFamily: 'Gluten, cursive',
                        fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                        color: '#666',
                        mb: '1vw'
                      }}>
                        📅 Date et heure complète
                      </Typography>
                      <Typography sx={{ 
                        fontFamily: 'Gluten, cursive',
                        fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                        color: '#232323',
                        fontWeight: 600
                      }}>
                        {new Date(trajet.date_heure_depart).toLocaleString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>

                    <Box display="flex" gap={2}>
                      <Box sx={{ 
                        bgcolor: '#f8f9fa', 
                        borderRadius: '12px', 
                        p: '3vw',
                        border: '1px solid #e9ecef',
                        flex: 1
                      }}>
                        <Typography sx={{ 
                          fontFamily: 'Gluten, cursive',
                          fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                          color: '#666',
                          mb: '1vw'
                        }}>
                          💰 Prix
                        </Typography>
                        <Typography sx={{ 
                          fontFamily: 'Gluten, cursive',
                          fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                          color: '#232323',
                          fontWeight: 700
                        }}>
                          {trajet.prix !== undefined && trajet.prix !== null && !isNaN(Number(trajet.prix)) ? Number(trajet.prix).toFixed(2) : trajet.prix} €
                        </Typography>
                      </Box>

                      <Box sx={{ 
                        bgcolor: '#f8f9fa', 
                        borderRadius: '12px', 
                        p: '3vw',
                        border: '1px solid #e9ecef',
                        flex: 1
                      }}>
                        <Typography sx={{ 
                          fontFamily: 'Gluten, cursive',
                          fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                          color: '#666',
                          mb: '1vw'
                        }}>
                          🚗 Places
                        </Typography>
                        <Typography sx={{ 
                          fontFamily: 'Gluten, cursive',
                          fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                          color: trajet.places_disponibles > 0 ? '#28a745' : '#dc3545',
                          fontWeight: 700
                        }}>
                          {trajet.places_disponibles} dispo
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>

                  {/* Réservations */}
                  <Box mb="4vw">
                    <Typography sx={{ 
                      fontFamily: 'Gluten, cursive',
                      fontSize: 'clamp(1rem, 4vw, 1.2rem)',
                      color: '#232323',
                      fontWeight: 600,
                      mb: '2vw'
                    }}>
                      Réservations ({(trajet.reservations || []).length})
                    </Typography>
                    
                    {(trajet.reservations || []).length === 0 ? (
                      <Typography sx={{ 
                        fontFamily: 'Gluten, cursive',
                        fontSize: 'clamp(0.9rem, 3vw, 1rem)',
                        color: '#999',
                        fontStyle: 'italic'
                      }}>
                        Aucune réservation pour ce trajet.
                      </Typography>
                    ) : (
                      <Stack spacing={2}>
                        {trajet.reservations.map((res, i) => {
                          const statusInfo = getStatusInfo(res.statut);
                          const DEFAULT_PHOTO = `${BACKEND_URL}/uploads/profile_photos/default.png`;
                          let passagerPhoto = res.passager?.photo_profil;
                          if (passagerPhoto && passagerPhoto.startsWith('/uploads/')) {
                            passagerPhoto = BACKEND_URL + passagerPhoto;
                          } else if (!passagerPhoto) {
                            passagerPhoto = DEFAULT_PHOTO;
                          }

                          return (
                            <Paper key={res.id_reservation || i} sx={{ 
                              p: '3vw', 
                              bgcolor: '#fff',
                              border: '1px solid #e9ecef',
                              borderRadius: '12px'
                            }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb="2vw">
                                <Box display="flex" alignItems="center" gap={2}>
                                  <Avatar
                                    src={passagerPhoto}
                                    alt={res.passager?.nom || 'Passager'}
                                    sx={{ 
                                      width: 'clamp(30px, 8vw, 40px)', 
                                      height: 'clamp(30px, 8vw, 40px)',
                                      border: '2px solid #D6FFB7'
                                    }}
                                  />
                                  <Typography sx={{ 
                                    fontFamily: 'Gluten, cursive',
                                    fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                                    color: '#232323',
                                    fontWeight: 600
                                  }}>
                                    {res.passager?.nom || `Passager ${res.passager_id}`}
                                  </Typography>
                                </Box>
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
                              
                              {res.statut === "en_attente" && (
                                <Stack direction="row" spacing={2} mt="2vw">
                                  <Button 
                                    variant="contained" 
                                    onClick={() => handleStatut(res.id_reservation, "acceptee")}
                                    sx={{
                                      bgcolor: '#4caf50',
                                      color: 'white',
                                      borderRadius: '999px',
                                      fontWeight: 'bold',
                                      py: '1.5vw',
                                      px: '3vw',
                                      fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                                      fontFamily: 'Gluten, cursive',
                                      textTransform: 'none',
                                      flex: 1,
                                      '&:hover': {
                                        bgcolor: '#45a049',
                                      },
                                    }}
                                  >
                                    Accepter
                                  </Button>
                                  <Button 
                                    variant="outlined" 
                                    onClick={() => handleStatut(res.id_reservation, "refusee")}
                                    sx={{
                                      borderColor: '#ff4444',
                                      color: '#ff4444',
                                      borderRadius: '999px',
                                      fontWeight: 'bold',
                                      py: '1.5vw',
                                      px: '3vw',
                                      fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                                      fontFamily: 'Gluten, cursive',
                                      textTransform: 'none',
                                      flex: 1,
                                      '&:hover': {
                                        borderColor: '#ff4444',
                                        bgcolor: '#ff4444',
                                        color: 'white'
                                      },
                                    }}
                                  >
                                    Refuser
                                  </Button>
                                </Stack>
                              )}
                            </Paper>
                          );
                        })}
                      </Stack>
                    )}
                  </Box>

                  {/* Boutons d'action du trajet */}
                  <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
                    <Button 
                      variant="outlined" 
                      onClick={() => { setEditTrip(trajet); setEditOpen(true); }}
                      sx={{
                        borderColor: '#D6FFB7',
                        color: '#232323',
                        borderRadius: '999px',
                        fontWeight: 'bold',
                        py: '2vw',
                        px: '4vw',
                        fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                        fontFamily: 'Gluten, cursive',
                        textTransform: 'none',
                        flex: 1,
                        minWidth: '120px',
                        '&:hover': {
                          borderColor: '#D6FFB7',
                          bgcolor: '#D6FFB7',
                          color: '#232323'
                        },
                      }}
                    >
                      Modifier
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => { setDeleteId(trajet.id_trajet); setDeleteOpen(true); }}
                      sx={{
                        borderColor: '#ff4444',
                        color: '#ff4444',
                        borderRadius: '999px',
                        fontWeight: 'bold',
                        py: '2vw',
                        px: '4vw',
                        fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                        fontFamily: 'Gluten, cursive',
                        textTransform: 'none',
                        flex: 1,
                        minWidth: '120px',
                        '&:hover': {
                          borderColor: '#ff4444',
                          bgcolor: '#ff4444',
                          color: 'white'
                        },
                      }}
                    >
                      Supprimer
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Paper>
      </Box>

      {/* VERSION DESKTOP (complètement nouvelle) */}
      <Box 
        minHeight="100vh" 
        bgcolor="#f5f5f5" 
        display={{ xs: "none", md: "flex" }} 
        fontFamily="'Gluten', cursive"
        position="relative"
      >
        {/* Sidebar gauche avec logo et navigation */}
        <Box 
          width="300px" 
          bgcolor="#232323" 
          display="flex" 
          flexDirection="column" 
          alignItems="center" 
          py={4}
          px={3}
        >
          <Box mb={4} width="120px">
            <img src={logoIcon} alt="Logo PartaRoute" style={{ width: '100%', height: 'auto', display: 'block' }} />
          </Box>
          
          <Typography 
            variant="h4" 
            color="white" 
            align="center" 
            sx={{ 
              fontFamily: 'Gluten, cursive', 
              fontSize: '1.8rem', 
              mb: 2 
            }}
          >
            Mes Trajets
          </Typography>
          
          <Typography 
            variant="body1" 
            color="#D6FFB7" 
            align="center" 
            sx={{ 
              fontFamily: 'Gluten, cursive', 
              fontSize: '1rem',
              mb: 4,
              opacity: 0.9
            }}
          >
            Gérez vos trajets proposés
          </Typography>

          {/* Statistiques dans la sidebar */}
          <Box sx={{ width: '100%', mb: 4 }}>
            <Paper sx={{ p: 2, bgcolor: '#333', borderRadius: '12px', mb: 2 }}>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: '#D6FFB7', fontSize: '0.9rem', mb: 1 }}>
                Total trajets
              </Typography>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {trips.length}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, bgcolor: '#333', borderRadius: '12px', mb: 2 }}>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: '#D6FFB7', fontSize: '0.9rem', mb: 1 }}>
                Réservations
              </Typography>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: '#4caf50', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {trips.reduce((total, trip) => total + (trip.reservations?.length || 0), 0)}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, bgcolor: '#333', borderRadius: '12px' }}>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: '#D6FFB7', fontSize: '0.9rem', mb: 1 }}>
                Places disponibles
              </Typography>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: '#ff9800', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {trips.reduce((total, trip) => total + (trip.places_disponibles || 0), 0)}
              </Typography>
            </Paper>
          </Box>

          {/* Bouton créer trajet */}
          <Button
            variant="contained"
            onClick={() => setCreateOpen(true)}
            startIcon={<AddIcon />}
            fullWidth
            sx={{
              bgcolor: '#D6FFB7',
              color: '#232323',
              borderRadius: '12px',
              fontWeight: 'bold',
              py: 1.5,
              fontSize: '1rem',
              fontFamily: 'Gluten, cursive',
              mb: 2,
              '&:hover': {
                bgcolor: '#c5e8a6',
              },
            }}
          >
            Créer un trajet
          </Button>

          {/* Bouton retour */}
          <Button
            onClick={() => navigate(-1)}
            variant="outlined"
            fullWidth
            sx={{
              borderColor: '#D6FFB7',
              color: '#D6FFB7',
              borderRadius: '12px',
              fontWeight: 'bold',
              py: 1.5,
              fontSize: '1rem',
              fontFamily: 'Gluten, cursive',
              mt: 6,
              '&:hover': { 
                borderColor: '#D6FFB7',
                bgcolor: '#D6FFB7',
                color: '#232323'
              },
            }}
            startIcon={<ArrowBackIcon />}
          >
            Retour
          </Button>
        </Box>

        {/* Contenu principal à droite */}
        <Box 
          flex={1} 
          p={4}
          sx={{ overflow: 'auto' }}
        >
          <Typography
            variant="h3"
            align="center"
            gutterBottom
            sx={{ 
              fontFamily: 'Gluten, cursive', 
              fontSize: '2.5rem', 
              mb: 4,
              color: '#232323'
            }}
          >
            Mes Trajets Proposés
          </Typography>

          {trips.length === 0 ? (
            <Box 
              sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center', 
                justifyContent: 'center',
                minHeight: '50vh',
                textAlign: 'center'
              }}
            >
              <Typography 
                sx={{ 
                  fontFamily: 'Gluten, cursive',
                  fontSize: '1.5rem',
                  color: '#666',
                  mb: 2
                }}
              >
                🚗 Aucun trajet proposé
              </Typography>
              <Typography 
                sx={{ 
                  fontFamily: 'Gluten, cursive',
                  fontSize: '1.1rem',
                  color: '#999',
                  mb: 4
                }}
              >
                Créez votre premier trajet pour commencer à recevoir des réservations !
              </Typography>
              <Button
                variant="contained"
                onClick={() => setCreateOpen(true)}
                startIcon={<AddIcon />}
                sx={{
                  bgcolor: '#232323',
                  color: 'white',
                  borderRadius: '12px',
                  fontWeight: 'bold',
                  py: 2,
                  px: 4,
                  fontSize: '1.1rem',
                  fontFamily: 'Gluten, cursive',
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: '#111',
                  },
                }}
              >
                Créer mon premier trajet
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(450px, 1fr))', gap: 3 }}>
              {trips.map((trajet, idx) => (
                <Paper 
                  key={trajet.id_trajet || idx} 
                  elevation={6}
                  sx={{ 
                    p: 3, 
                    borderRadius: '16px',
                    border: '1px solid #e0e0e0',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      border: '1px solid #D6FFB7',
                      transform: 'translateY(-4px)',
                      boxShadow: '0 12px 30px rgba(0,0,0,0.15)'
                    }
                  }}
                >
                  {/* Header du trajet */}
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                    <Typography 
                      sx={{ 
                        fontFamily: 'Gluten, cursive',
                        fontSize: '1.3rem',
                        color: '#232323',
                        fontWeight: 600
                      }}
                    >
                      {trajet.ville_depart} → {trajet.ville_arrivee}
                    </Typography>
                    <Typography 
                      sx={{ 
                        fontFamily: 'Gluten, cursive',
                        fontSize: '0.9rem',
                        color: '#666'
                      }}
                    >
                      {new Date(trajet.date_heure_depart).toLocaleDateString('fr-FR', {
                        weekday: 'short',
                        day: 'numeric',
                        month: 'short'
                      })}
                    </Typography>
                  </Box>

                  {/* Détails du trajet */}
                  <Stack spacing={2} mb={3}>
                    <Box sx={{ 
                      bgcolor: '#f8f9fa', 
                      borderRadius: '8px', 
                      p: 2,
                      border: '1px solid #e9ecef'
                    }}>
                      <Typography sx={{ 
                        fontFamily: 'Gluten, cursive',
                        fontSize: '0.9rem',
                        color: '#666',
                        mb: 1
                      }}>
                        📅 Date et heure
                      </Typography>
                      <Typography sx={{ 
                        fontFamily: 'Gluten, cursive',
                        fontSize: '1rem',
                        color: '#232323',
                        fontWeight: 600
                      }}>
                        {new Date(trajet.date_heure_depart).toLocaleString('fr-FR', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </Typography>
                    </Box>

                    <Box display="flex" gap={2}>
                      <Box sx={{ 
                        bgcolor: '#f8f9fa', 
                        borderRadius: '8px', 
                        p: 2,
                        border: '1px solid #e9ecef',
                        flex: 1
                      }}>
                        <Typography sx={{ 
                          fontFamily: 'Gluten, cursive',
                          fontSize: '0.9rem',
                          color: '#666',
                          mb: 1
                        }}>
                          💰 Prix
                        </Typography>
                        <Typography sx={{ 
                          fontFamily: 'Gluten, cursive',
                          fontSize: '1.2rem',
                          color: '#232323',
                          fontWeight: 700
                        }}>
                          {trajet.prix !== undefined && trajet.prix !== null && !isNaN(Number(trajet.prix)) ? Number(trajet.prix).toFixed(2) : trajet.prix} €
                        </Typography>
                      </Box>

                      <Box sx={{ 
                        bgcolor: '#f8f9fa', 
                        borderRadius: '8px', 
                        p: 2,
                        border: '1px solid #e9ecef',
                        flex: 1
                      }}>
                        <Typography sx={{ 
                          fontFamily: 'Gluten, cursive',
                          fontSize: '0.9rem',
                          color: '#666',
                          mb: 1
                        }}>
                          🚗 Places
                        </Typography>
                        <Typography sx={{ 
                          fontFamily: 'Gluten, cursive',
                          fontSize: '1.2rem',
                          color: trajet.places_disponibles > 0 ? '#28a745' : '#dc3545',
                          fontWeight: 700
                        }}>
                          {trajet.places_disponibles} dispo
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>

                  {/* Réservations */}
                  <Box mb={3}>
                    <Typography sx={{ 
                      fontFamily: 'Gluten, cursive',
                      fontSize: '1.1rem',
                      color: '#232323',
                      fontWeight: 600,
                      mb: 2
                    }}>
                      Réservations ({(trajet.reservations || []).length})
                    </Typography>
                    
                    {(trajet.reservations || []).length === 0 ? (
                      <Typography sx={{ 
                        fontFamily: 'Gluten, cursive',
                        fontSize: '0.9rem',
                        color: '#999',
                        fontStyle: 'italic'
                      }}>
                        Aucune réservation pour ce trajet.
                      </Typography>
                    ) : (
                      <Stack spacing={2} sx={{ maxHeight: '200px', overflowY: 'auto' }}>
                        {trajet.reservations.map((res, i) => {
                          const statusInfo = getStatusInfo(res.statut);
                          const DEFAULT_PHOTO = `${BACKEND_URL}/uploads/profile_photos/default.png`;
                          let passagerPhoto = res.passager?.photo_profil;
                          if (passagerPhoto && passagerPhoto.startsWith('/uploads/')) {
                            passagerPhoto = BACKEND_URL + passagerPhoto;
                          } else if (!passagerPhoto) {
                            passagerPhoto = DEFAULT_PHOTO;
                          }

                          return (
                            <Paper key={res.id_reservation || i} sx={{ 
                              p: 2, 
                              bgcolor: '#fff',
                              border: '1px solid #e9ecef',
                              borderRadius: '8px'
                            }}>
                              <Box display="flex" justifyContent="space-between" alignItems="center" mb={res.statut === "en_attente" ? 2 : 0}>
                                <Box display="flex" alignItems="center" gap={2}>
                                  <Avatar
                                    src={passagerPhoto}
                                    alt={res.passager?.nom || 'Passager'}
                                    sx={{ 
                                      width: 35, 
                                      height: 35,
                                      border: '2px solid #D6FFB7'
                                    }}
                                  />
                                  <Typography sx={{ 
                                    fontFamily: 'Gluten, cursive',
                                    fontSize: '1rem',
                                    color: '#232323',
                                    fontWeight: 600
                                  }}>
                                    {res.passager?.nom || `Passager ${res.passager_id}`}
                                  </Typography>
                                </Box>
                                <Chip
                                  label={statusInfo.label}
                                  sx={{
                                    bgcolor: statusInfo.bgColor,
                                    color: statusInfo.color,
                                    fontFamily: 'Gluten, cursive',
                                    fontWeight: 600,
                                    fontSize: '0.8rem',
                                    borderRadius: '8px'
                                  }}
                                />
                              </Box>
                              
                              {res.statut === "en_attente" && (
                                <Stack direction="row" spacing={1}>
                                  <Button 
                                    variant="contained" 
                                    onClick={() => handleStatut(res.id_reservation, "acceptee")}
                                    sx={{
                                      bgcolor: '#4caf50',
                                      color: 'white',
                                      borderRadius: '8px',
                                      fontWeight: 'bold',
                                      py: 0.5,
                                      px: 1.5,
                                      fontSize: '0.8rem',
                                      fontFamily: 'Gluten, cursive',
                                      textTransform: 'none',
                                      flex: 1,
                                      '&:hover': {
                                        bgcolor: '#45a049',
                                      },
                                    }}
                                  >
                                    Accepter
                                  </Button>
                                  <Button 
                                    variant="outlined" 
                                    onClick={() => handleStatut(res.id_reservation, "refusee")}
                                    sx={{
                                      borderColor: '#ff4444',
                                      color: '#ff4444',
                                      borderRadius: '8px',
                                      fontWeight: 'bold',
                                      py: 0.5,
                                      px: 1.5,
                                      fontSize: '0.8rem',
                                      fontFamily: 'Gluten, cursive',
                                      textTransform: 'none',
                                      flex: 1,
                                      '&:hover': {
                                        borderColor: '#ff4444',
                                        bgcolor: '#ff4444',
                                        color: 'white'
                                      },
                                    }}
                                  >
                                    Refuser
                                  </Button>
                                </Stack>
                              )}
                            </Paper>
                          );
                        })}
                      </Stack>
                    )}
                  </Box>

                  {/* Boutons d'action du trajet */}
                  <Stack direction="row" spacing={2}>
                    <Button 
                      variant="outlined" 
                      onClick={() => { setEditTrip(trajet); setEditOpen(true); }}
                      sx={{
                        borderColor: '#D6FFB7',
                        color: '#232323',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        py: 1,
                        px: 2,
                        fontSize: '0.9rem',
                        fontFamily: 'Gluten, cursive',
                        textTransform: 'none',
                        flex: 1,
                        '&:hover': {
                          borderColor: '#D6FFB7',
                          bgcolor: '#D6FFB7',
                          color: '#232323'
                        },
                      }}
                    >
                      Modifier
                    </Button>
                    <Button 
                      variant="outlined" 
                      onClick={() => { setDeleteId(trajet.id_trajet); setDeleteOpen(true); }}
                      sx={{
                        borderColor: '#ff4444',
                        color: '#ff4444',
                        borderRadius: '8px',
                        fontWeight: 'bold',
                        py: 1,
                        px: 2,
                        fontSize: '0.9rem',
                        fontFamily: 'Gluten, cursive',
                        textTransform: 'none',
                        flex: 1,
                        '&:hover': {
                          borderColor: '#ff4444',
                          bgcolor: '#ff4444',
                          color: 'white'
                        },
                      }}
                    >
                      Supprimer
                    </Button>
                  </Stack>
                </Paper>
              ))}
            </Box>
          )}
        </Box>
      </Box>

      {/* Dialogs et Snackbar (partagés entre mobile et desktop) */}
      {/* Dialog de création de trajet */}
      <Dialog 
        open={createOpen} 
        onClose={() => setCreateOpen(false)} 
        maxWidth="xs" 
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: '20px',
            fontFamily: 'Gluten, cursive'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: 'Gluten, cursive', 
          fontWeight: 600, 
          color: '#232323',
          fontSize: 'clamp(1.2rem, 5vw, 1.5rem)'
        }}>
          Créer un nouveau trajet
        </DialogTitle>
        <DialogContent>
          <TripForm
            onTripCreated={(trip) => {
              setTrips(prev => [trip, ...prev]);
              setCreateOpen(false);
              setSnackbar({ open: true, message: 'Trajet créé avec succès !' });
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de modification */}
      <EditTripModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        trip={editTrip}
        onSuccess={() => {
          fetchTrips();
          setSnackbar({ open: true, message: 'Trajet modifié avec succès !' });
        }}
      />

      {/* Dialog de confirmation de suppression */}
      <Dialog 
        open={deleteOpen} 
        onClose={() => setDeleteOpen(false)}
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
          <DialogContentText sx={{ fontFamily: 'Gluten, cursive', color: '#666' }}>
            Êtes-vous sûr de vouloir supprimer ce trajet ? Cette action est irréversible et toutes les réservations associées seront également supprimées.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, flexDirection: 'column' }}>
          <Button 
            onClick={() => setDeleteOpen(false)}
            sx={{
              color: '#666',
              fontFamily: 'Gluten, cursive',
              textTransform: 'none',
              borderRadius: '999px',
              px: 2,
              py: 1,
              fontSize: 'clamp(0.8rem, 3vw, 1rem)',
              whiteSpace: 'nowrap',
              minWidth: 'auto',
              width: '100%'
            }}
          >
            Non, garder
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
              fontSize: 'clamp(0.8rem, 3vw, 1rem)',
              whiteSpace: 'nowrap',
              minWidth: 'auto',
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

      {/* Snackbar pour les notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar({ open: false, message: '' })}
        message={snackbar.message}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        ContentProps={{ 
          sx: { 
            bgcolor: '#D6FFB7', 
            color: '#232323', 
            fontWeight: 600, 
            fontFamily: 'Gluten, cursive' 
          } 
        }}
      />
    </>
  );
} 