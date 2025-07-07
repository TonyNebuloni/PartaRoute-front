import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Box, Typography, Paper, Button, CircularProgress, Alert, Stack, Snackbar, Slide, Avatar } from "@mui/material";
import axios from "axios";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
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
  
  if (!trip) return null;

  const placesRestantes = (typeof trip?.places_disponibles === 'number' ? trip.places_disponibles : Number(trip.places_disponibles)) - (trip.reservations?.length || 0);

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
      >
        <Snackbar
          open={notifOpen}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          TransitionComponent={Slide}
          message={<span style={{ color: 'black', fontWeight: 600, fontFamily: 'Gluten, cursive' }}>Connecte-toi pour réserver !</span>}
          ContentProps={{ sx: { bgcolor: '#D6FFB7', color: 'black', fontWeight: 600, fontFamily: 'Gluten, cursive' } }}
        />
        
        {/* Header avec bouton retour */}
        <Box width="100%" maxWidth="500px" bgcolor="#232323" pt="8vw" pb="4vw" display="flex" alignItems="center" justifyContent="space-between" px="6vw">
          <Button
            onClick={() => navigate(-1)}
            sx={{
              color: '#D6FFB7',
              fontFamily: 'Gluten, cursive',
              fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
              textTransform: 'none',
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
            }}
          >
            Détails du trajet
          </Typography>
          <Box width="80px" /> {/* Spacer pour centrer le titre */}
        </Box>

        {/* Contenu principal blanc */}
        <Paper elevation={3} sx={{
          width: '100%',
          minHeight: '100vh',
          borderTopLeftRadius: '10vw',
          borderTopRightRadius: 0,
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          mt: 0,
          p: '6vw',
          pb: { xs: 8, sm: 10, md: 12 }, // Ajout de marge en bas pour le scroll
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          fontFamily: 'Gluten, cursive',
          boxSizing: 'border-box',
          backgroundColor: '#fff',
        }}>
          {/* Photo du conducteur */}
          <Box display="flex" flexDirection="column" alignItems="center" mb="6vw" mt="4vw">
            <Avatar
              src={conducteurPhoto}
              alt={trip.conducteur?.nom || 'Conducteur'}
              sx={{ 
                width: 'clamp(80px, 20vw, 120px)', 
                height: 'clamp(80px, 20vw, 120px)', 
                mb: '3vw', 
                border: '4px solid #D6FFB7',
                boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
              }}
            />
            <Typography 
              variant="h6" 
              sx={{ 
                fontFamily: 'Gluten, cursive',
                fontSize: 'clamp(1.1rem, 4vw, 1.4rem)',
                color: '#232323',
                fontWeight: 600,
                textAlign: 'center'
              }}
            >
              {trip.conducteur?.nom || 'Conducteur'}
            </Typography>
          </Box>

          {/* Titre du trajet */}
          <Typography 
            variant="h4" 
            align="center" 
            sx={{ 
              fontFamily: 'Gluten, cursive', 
              fontSize: 'clamp(1.5rem, 8vw, 2.5rem)',
              color: '#232323',
              fontWeight: 700,
              mb: '6vw',
              textAlign: 'center'
            }}
          >
            {trip.ville_depart} → {trip.ville_arrivee}
          </Typography>

          {/* Informations du trajet */}
          <Stack spacing={3} mb="6vw" width="100%">
            <Box sx={{ 
              bgcolor: '#f8f9fa', 
              borderRadius: '15px', 
              p: '4vw',
              border: '2px solid #e9ecef'
            }}>
              <Typography sx={{ 
                fontFamily: 'Gluten, cursive',
                fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                color: '#666',
                mb: '1vw'
              }}>
                📅 Date et heure
              </Typography>
              <Typography sx={{ 
                fontFamily: 'Gluten, cursive',
                fontSize: 'clamp(1rem, 4vw, 1.3rem)',
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

            <Box sx={{ 
              bgcolor: '#f8f9fa', 
              borderRadius: '15px', 
              p: '4vw',
              border: '2px solid #e9ecef'
            }}>
              <Typography sx={{ 
                fontFamily: 'Gluten, cursive',
                fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                color: '#666',
                mb: '1vw'
              }}>
                💰 Prix par personne
              </Typography>
              <Typography sx={{ 
                fontFamily: 'Gluten, cursive',
                fontSize: 'clamp(1.2rem, 5vw, 1.8rem)',
                color: '#232323',
                fontWeight: 700
              }}>
                {trip.prix !== undefined && trip.prix !== null && !isNaN(Number(trip.prix)) ? Number(trip.prix).toFixed(2) : trip.prix} €
              </Typography>
            </Box>

            <Box sx={{ 
              bgcolor: '#f8f9fa', 
              borderRadius: '15px', 
              p: '4vw',
              border: '2px solid #e9ecef'
            }}>
              <Typography sx={{ 
                fontFamily: 'Gluten, cursive',
                fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                color: '#666',
                mb: '1vw'
              }}>
                🚗 Places disponibles
              </Typography>
              <Typography sx={{ 
                fontFamily: 'Gluten, cursive',
                fontSize: 'clamp(1.2rem, 5vw, 1.8rem)',
                color: placesRestantes > 0 ? '#28a745' : '#dc3545',
                fontWeight: 700
              }}>
                {placesRestantes > 0 ? `${placesRestantes} place${placesRestantes > 1 ? 's' : ''} restante${placesRestantes > 1 ? 's' : ''}` : 'Complet'}
              </Typography>
            </Box>
          </Stack>

          {/* Alertes */}
          {userReservation && (
            <Alert 
              severity="info" 
              sx={{ 
                mb: '4vw', 
                width: '100%',
                fontFamily: 'Gluten, cursive',
                fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                '& .MuiAlert-message': {
                  fontFamily: 'Gluten, cursive',
                }
              }}
            >
              Vous avez déjà une demande de réservation en cours pour ce trajet.
            </Alert>
          )}
          
          {reservationStatus && (
            <Alert 
              severity={reservationStatus.type} 
              sx={{ 
                mb: '4vw', 
                width: '100%',
                fontFamily: 'Gluten, cursive',
                fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                '& .MuiAlert-message': {
                  fontFamily: 'Gluten, cursive',
                }
              }}
            >
              {reservationStatus.msg}
            </Alert>
          )}

          {/* Boutons d'action */}
          <Stack spacing={3} width="100%">
            {String(trip.conducteur?.id_utilisateur) === String(userId) ? (
              <>
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate('/mes-trajets-conducteur')}
                  sx={{
                    bgcolor: '#D6FFB7',
                    color: '#232323',
                    borderRadius: '999px',
                    fontWeight: 'bold',
                    py: '3vw',
                    fontSize: 'clamp(1rem, 4vw, 1.2rem)',
                    fontFamily: 'Gluten, cursive',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: '#c5e8a6',
                    },
                  }}
                >
                  Gérer mon trajet
                </Button>
                <Button
                  variant="outlined"
                  fullWidth
                  onClick={handleDeleteTrip}
                  sx={{
                    borderColor: '#ff4444',
                    color: '#ff4444',
                    borderRadius: '999px',
                    fontWeight: 'bold',
                    py: '3vw',
                    fontSize: 'clamp(1rem, 4vw, 1.2rem)',
                    fontFamily: 'Gluten, cursive',
                    textTransform: 'none',
                    '&:hover': {
                      borderColor: '#ff4444',
                      bgcolor: '#ff4444',
                      color: 'white'
                    },
                  }}
                >
                  Supprimer mon trajet
                </Button>
              </>
            ) : (
              userReservation ? (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate('/my-trips')}
                  sx={{
                    bgcolor: '#D6FFB7',
                    color: '#232323',
                    borderRadius: '999px',
                    fontWeight: 'bold',
                    py: '3vw',
                    fontSize: 'clamp(1rem, 4vw, 1.2rem)',
                    fontFamily: 'Gluten, cursive',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: '#c5e8a6',
                    },
                  }}
                >
                  Voir le statut de ma réservation
                </Button>
              ) : reservationStatus && reservationStatus.type === "success" ? (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => navigate('/my-trips')}
                  sx={{
                    bgcolor: '#28a745',
                    color: 'white',
                    borderRadius: '999px',
                    fontWeight: 'bold',
                    py: '3vw',
                    fontSize: 'clamp(1rem, 4vw, 1.2rem)',
                    fontFamily: 'Gluten, cursive',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: '#218838',
                    },
                  }}
                >
                  Voir mes trajets
                </Button>
              ) : (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleReservation}
                  disabled={resLoading || placesRestantes <= 0}
                  sx={{
                    bgcolor: placesRestantes > 0 ? '#D6FFB7' : '#ccc',
                    color: placesRestantes > 0 ? '#232323' : '#666',
                    borderRadius: '999px',
                    fontWeight: 'bold',
                    py: '3vw',
                    fontSize: 'clamp(1rem, 4vw, 1.2rem)',
                    fontFamily: 'Gluten, cursive',
                    textTransform: 'none',
                    '&:hover': {
                      bgcolor: placesRestantes > 0 ? '#c5e8a6' : '#ccc',
                    },
                  }}
                >
                  {resLoading ? 'Réservation...' : placesRestantes > 0 ? 'Réserver une place' : 'Trajet complet'}
                </Button>
              )
            )}
          </Stack>
        </Paper>
      </Box>

      {/* VERSION DESKTOP (simple avec sidebar comme les autres pages) */}
      <Box 
        minHeight="100vh" 
        bgcolor="#f5f5f5" 
        display={{ xs: "none", md: "flex" }} 
        fontFamily="'Gluten', cursive"
        position="relative"
      >
        <Snackbar
          open={notifOpen}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          TransitionComponent={Slide}
          message={<span style={{ color: 'black', fontWeight: 600, fontFamily: 'Gluten, cursive' }}>Connecte-toi pour réserver !</span>}
          ContentProps={{ sx: { bgcolor: '#D6FFB7', color: 'black', fontWeight: 600, fontFamily: 'Gluten, cursive' } }}
        />

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
            Détails du Trajet
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
            Informations complètes
          </Typography>

          {/* Informations du conducteur dans la sidebar */}
          <Box sx={{ width: '100%', mb: 4 }}>
            <Paper sx={{ p: 2, bgcolor: '#333', borderRadius: '12px', mb: 2 }}>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: '#D6FFB7', fontSize: '0.9rem', mb: 1 }}>
                Conducteur
              </Typography>
              <Box display="flex" alignItems="center" gap={2}>
                <Avatar
                  src={conducteurPhoto}
                  alt={trip.conducteur?.nom || 'Conducteur'}
                  sx={{ 
                    width: 40, 
                    height: 40,
                    border: '2px solid #D6FFB7'
                  }}
                />
                <Typography sx={{ fontFamily: 'Gluten, cursive', color: 'white', fontSize: '1rem', fontWeight: 'bold' }}>
                  {trip.conducteur?.nom || 'Conducteur'}
                </Typography>
              </Box>
            </Paper>
            <Paper sx={{ p: 2, bgcolor: '#333', borderRadius: '12px', mb: 2 }}>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: '#D6FFB7', fontSize: '0.9rem', mb: 1 }}>
                Prix
              </Typography>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: '#4caf50', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {trip.prix !== undefined && trip.prix !== null && !isNaN(Number(trip.prix)) ? Number(trip.prix).toFixed(2) : trip.prix} €
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, bgcolor: '#333', borderRadius: '12px' }}>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: '#D6FFB7', fontSize: '0.9rem', mb: 1 }}>
                Places disponibles
              </Typography>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: placesRestantes > 0 ? '#4caf50' : '#ff4444', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {placesRestantes > 0 ? placesRestantes : '0'}
              </Typography>
            </Paper>
          </Box>

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
            {trip.ville_depart} → {trip.ville_arrivee}
          </Typography>

          <Box display="flex" justifyContent="center">
            <Paper 
              elevation={6}
              sx={{
                maxWidth: '600px',
                width: '100%',
                p: 4,
                borderRadius: '16px',
                border: '1px solid #e0e0e0'
              }}
            >
              {/* Photo du conducteur */}
              <Box display="flex" flexDirection="column" alignItems="center" mb={4}>
                <Avatar
                  src={conducteurPhoto}
                  alt={trip.conducteur?.nom || 'Conducteur'}
                  sx={{ 
                    width: 120, 
                    height: 120, 
                    mb: 2, 
                    border: '4px solid #D6FFB7',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.1)'
                  }}
                />
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontFamily: 'Gluten, cursive',
                    fontSize: '1.4rem',
                    color: '#232323',
                    fontWeight: 600,
                    textAlign: 'center'
                  }}
                >
                  {trip.conducteur?.nom || 'Conducteur'}
                </Typography>
              </Box>

              {/* Informations du trajet */}
              <Stack spacing={3} mb={4}>
                <Box sx={{ 
                  bgcolor: '#f8f9fa', 
                  borderRadius: '12px', 
                  p: 3,
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
                    fontSize: '1.1rem',
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

                <Box display="flex" gap={2}>
                  <Box sx={{ 
                    bgcolor: '#f8f9fa', 
                    borderRadius: '12px', 
                    p: 3,
                    border: '1px solid #e9ecef',
                    flex: 1,
                    textAlign: 'center'
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
                      fontSize: '1.5rem',
                      color: '#232323',
                      fontWeight: 700
                    }}>
                      {trip.prix !== undefined && trip.prix !== null && !isNaN(Number(trip.prix)) ? Number(trip.prix).toFixed(2) : trip.prix} €
                    </Typography>
                  </Box>

                  <Box sx={{ 
                    bgcolor: '#f8f9fa', 
                    borderRadius: '12px', 
                    p: 3,
                    border: '1px solid #e9ecef',
                    flex: 1,
                    textAlign: 'center'
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
                      fontSize: '1.5rem',
                      color: placesRestantes > 0 ? '#28a745' : '#dc3545',
                      fontWeight: 700
                    }}>
                      {placesRestantes > 0 ? `${placesRestantes} dispo` : 'Complet'}
                    </Typography>
                  </Box>
                </Box>
              </Stack>

              {/* Alertes */}
              {userReservation && (
                <Alert 
                  severity="info" 
                  sx={{ 
                    mb: 3, 
                    width: '100%',
                    fontFamily: 'Gluten, cursive',
                    fontSize: '0.9rem',
                    '& .MuiAlert-message': {
                      fontFamily: 'Gluten, cursive',
                    }
                  }}
                >
                  Vous avez déjà une demande de réservation en cours pour ce trajet.
                </Alert>
              )}
              
              {reservationStatus && (
                <Alert 
                  severity={reservationStatus.type} 
                  sx={{ 
                    mb: 3, 
                    width: '100%',
                    fontFamily: 'Gluten, cursive',
                    fontSize: '0.9rem',
                    '& .MuiAlert-message': {
                      fontFamily: 'Gluten, cursive',
                    }
                  }}
                >
                  {reservationStatus.msg}
                </Alert>
              )}

              {/* Boutons d'action */}
              <Stack spacing={2} width="100%">
                {String(trip.conducteur?.id_utilisateur) === String(userId) ? (
                  <>
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => navigate('/mes-trajets-conducteur')}
                      sx={{
                        bgcolor: '#D6FFB7',
                        color: '#232323',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        py: 1.5,
                        fontSize: '1rem',
                        fontFamily: 'Gluten, cursive',
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: '#c5e8a6',
                        },
                      }}
                    >
                      Gérer mon trajet
                    </Button>
                    <Button
                      variant="outlined"
                      fullWidth
                      onClick={handleDeleteTrip}
                      sx={{
                        borderColor: '#ff4444',
                        color: '#ff4444',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        py: 1.5,
                        fontSize: '1rem',
                        fontFamily: 'Gluten, cursive',
                        textTransform: 'none',
                        '&:hover': {
                          borderColor: '#ff4444',
                          bgcolor: '#ff4444',
                          color: 'white'
                        },
                      }}
                    >
                      Supprimer mon trajet
                    </Button>
                  </>
                ) : (
                  userReservation ? (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => navigate('/my-trips')}
                      sx={{
                        bgcolor: '#D6FFB7',
                        color: '#232323',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        py: 1.5,
                        fontSize: '1rem',
                        fontFamily: 'Gluten, cursive',
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: '#c5e8a6',
                        },
                      }}
                    >
                      Voir le statut de ma réservation
                    </Button>
                  ) : reservationStatus && reservationStatus.type === "success" ? (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={() => navigate('/my-trips')}
                      sx={{
                        bgcolor: '#28a745',
                        color: 'white',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        py: 1.5,
                        fontSize: '1rem',
                        fontFamily: 'Gluten, cursive',
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: '#218838',
                        },
                      }}
                    >
                      Voir mes trajets
                    </Button>
                  ) : (
                    <Button
                      variant="contained"
                      fullWidth
                      onClick={handleReservation}
                      disabled={resLoading || placesRestantes <= 0}
                      sx={{
                        bgcolor: placesRestantes > 0 ? '#232323' : '#ccc',
                        color: placesRestantes > 0 ? 'white' : '#666',
                        borderRadius: '12px',
                        fontWeight: 'bold',
                        py: 2,
                        fontSize: '1.1rem',
                        fontFamily: 'Gluten, cursive',
                        textTransform: 'none',
                        '&:hover': {
                          bgcolor: placesRestantes > 0 ? '#111' : '#ccc',
                        },
                      }}
                    >
                      {resLoading ? 'Réservation...' : placesRestantes > 0 ? 'Réserver une place' : 'Trajet complet'}
                    </Button>
                  )
                )}
              </Stack>
            </Paper>
          </Box>
        </Box>
      </Box>
    </>
  );
} 