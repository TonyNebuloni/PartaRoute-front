import { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Alert, Stack, Button, Avatar, Chip, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import CustomPagination from '../components/CustomPagination';
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

export default function MyTrips() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [cancelDialog, setCancelDialog] = useState({ open: false, reservationId: null, trajetInfo: null });
  const navigate = useNavigate();
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
      let reservationsData = res.data.data || res.data;
      
      // Filtrer les réservations annulées de plus d'1 heure
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
      reservationsData = reservationsData.filter(res => {
        if (res.statut === "annulee" && res.date_annulation) {
          const dateAnnulation = new Date(res.date_annulation);
          return dateAnnulation > oneHourAgo;
        }
        return true;
      });
      
      // Trier les réservations : actives en haut, annulées en bas
      const sortedReservations = reservationsData.sort((a, b) => {
        const getPriority = (statut) => {
          switch (statut) {
            case "acceptee": return 1;
            case "en_attente": return 2;
            case "refusee": return 3;
            case "annulee": return 4;
            default: return 2;
          }
        };
        return getPriority(a.statut) - getPriority(b.statut);
      });
      
      setReservations(sortedReservations);
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

  const handleCancel = (id, trajetInfo) => {
    setCancelDialog({ 
      open: true, 
      reservationId: id, 
      trajetInfo: trajetInfo 
    });
  };

  const confirmCancel = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.patch(`${BACKEND_URL}/api/reservations/${cancelDialog.reservationId}/annuler`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchReservations();
      setCancelDialog({ open: false, reservationId: null, trajetInfo: null });
    } catch (err) {
      alert("Erreur lors de l'annulation.");
      setCancelDialog({ open: false, reservationId: null, trajetInfo: null });
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

  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
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
            Mes réservations
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
          <Typography 
            variant="h4" 
            align="center" 
            sx={{ 
              fontFamily: 'Gluten, cursive', 
              fontSize: 'clamp(1.5rem, 7vw, 2.2rem)',
              color: '#232323',
              fontWeight: 700,
              mb: '6vw',
              mt: '2vw'
            }}
          >
            Mes trajets réservés
          </Typography>

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
                  mb: '4vw'
                }}
              >
                🚗 Aucune réservation trouvée
              </Typography>
              <Typography 
                sx={{ 
                  fontFamily: 'Gluten, cursive',
                  fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                  color: '#999',
                  mb: '6vw'
                }}
              >
                Explorez les trajets disponibles pour faire votre première réservation !
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/')}
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
                Découvrir les trajets
              </Button>
            </Box>
          ) : (
            <Stack spacing={4} width="100%">
              {reservations.map((res, idx) => {
                const statusInfo = getStatusInfo(res.statut);
                const DEFAULT_PHOTO = `${BACKEND_URL}/uploads/profile_photos/default.png`;
                
                // Améliorer la récupération des informations du conducteur
                const conducteur = res.trajet?.conducteur || res.conducteur || null;
                let conducteurPhoto = conducteur?.photo_profil;
                if (conducteurPhoto) {
                  if (conducteurPhoto.startsWith('/uploads/')) {
                    conducteurPhoto = BACKEND_URL + conducteurPhoto;
                  } else if (!conducteurPhoto.startsWith('http')) {
                    conducteurPhoto = BACKEND_URL + conducteurPhoto;
                  }
                } else {
                  conducteurPhoto = DEFAULT_PHOTO;
                }

                return (
                  <Paper 
                    key={res.id_reservation || res.id || res._id || idx} 
                    elevation={2}
                    sx={{ 
                      p: '5vw', 
                      borderRadius: '20px',
                      border: '2px solid #f0f0f0',
                      opacity: res.statut === "annulee" ? 0.6 : 1,
                      '&:hover': {
                        border: '2px solid #D6FFB7',
                        transform: 'translateY(-2px)',
                        transition: 'all 0.3s ease'
                      }
                    }}
                  >
                    {/* Header avec statut */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb="4vw">
                      <Typography 
                        sx={{ 
                          fontFamily: 'Gluten, cursive',
                          fontSize: 'clamp(1.2rem, 5vw, 1.6rem)',
                          color: '#232323',
                          fontWeight: 600
                        }}
                      >
                        {res.trajet?.ville_depart || 'N/A'} → {res.trajet?.ville_arrivee || 'N/A'}
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

                    {/* Informations du conducteur */}
                    <Box display="flex" alignItems="center" mb="4vw">
                      <Avatar
                        src={conducteurPhoto}
                        alt={conducteur?.nom || conducteur?.prenom || 'Conducteur'}
                        sx={{ 
                          width: 'clamp(40px, 10vw, 60px)', 
                          height: 'clamp(40px, 10vw, 60px)', 
                          mr: '3vw',
                          border: '2px solid #D6FFB7'
                        }}
                      />
                      <Box>
                        <Typography 
                          sx={{ 
                            fontFamily: 'Gluten, cursive',
                            fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                            color: '#666',
                            mb: '0.5vw'
                          }}
                        >
                          Conducteur
                        </Typography>
                        <Typography 
                          sx={{ 
                            fontFamily: 'Gluten, cursive',
                            fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                            color: '#232323',
                            fontWeight: 600
                          }}
                        >
                          {conducteur ? 
                            (conducteur.prenom && conducteur.nom ? `${conducteur.prenom} ${conducteur.nom}` : 
                             conducteur.nom || conducteur.prenom || 'Conducteur') 
                            : 'Conducteur non disponible'}
                        </Typography>
                      </Box>
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
                          📅 Date et heure
                        </Typography>
                        <Typography sx={{ 
                          fontFamily: 'Gluten, cursive',
                          fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                          color: '#232323',
                          fontWeight: 600
                        }}>
                          {res.trajet ? new Date(res.trajet.date_heure_depart).toLocaleString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </Typography>
                      </Box>

                      {res.trajet?.prix !== undefined && (
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
                            💰 Prix
                          </Typography>
                          <Typography sx={{ 
                            fontFamily: 'Gluten, cursive',
                            fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                            color: '#232323',
                            fontWeight: 700
                          }}>
                            {res.trajet.prix !== undefined && res.trajet.prix !== null && !isNaN(Number(res.trajet.prix)) ? Number(res.trajet.prix).toFixed(2) : res.trajet.prix} €
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    {/* Boutons d'action */}
                    <Stack direction="row" spacing={2} flexWrap="wrap" gap={2}>
                      {/* Bouton Annuler pour le passager */}
                      {String(res.passager_id) === String(userId) && !["annulee", "refusee"].includes(res.statut) && (
                        <Button 
                          variant="outlined" 
                          onClick={() => handleCancel(res.id_reservation, res.trajet)}
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
                          Annuler
                        </Button>
                      )}
                      
                      {/* Boutons Accepter/Refuser pour le conducteur */}
                      {String(res.trajet?.conducteur_id) === String(userId) && res.statut === "en_attente" && (
                        <>
                          <Button 
                            variant="contained" 
                            onClick={() => handleStatut(res.id_reservation, "acceptee")}
                            sx={{
                              bgcolor: '#4caf50',
                              color: 'white',
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
                            Refuser
                          </Button>
                        </>
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </Stack>
          )}

          {/* Pagination custom sous la liste des réservations */}
          {reservations.length > 0 && (
            <CustomPagination
              page={page}
              count={Math.max(1, Math.ceil(reservations.length / limit))}
              onChange={setPage}
              limit={limit}
              onLimitChange={handleLimitChange}
            />
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
            Gérez vos réservations de trajets
          </Typography>

          {/* Statistiques dans la sidebar */}
          <Box sx={{ width: '100%', mb: 4 }}>
            <Paper sx={{ p: 2, bgcolor: '#333', borderRadius: '12px', mb: 2 }}>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: '#D6FFB7', fontSize: '0.9rem', mb: 1 }}>
                Total réservations
              </Typography>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {reservations.length}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, bgcolor: '#333', borderRadius: '12px' }}>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: '#D6FFB7', fontSize: '0.9rem', mb: 1 }}>
                Acceptées
              </Typography>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: '#4caf50', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {reservations.filter(r => r.statut === 'acceptee').length}
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
            Mes Réservations
          </Typography>

          {reservations.length === 0 ? (
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
                🚗 Aucune réservation trouvée
              </Typography>
              <Typography 
                sx={{ 
                  fontFamily: 'Gluten, cursive',
                  fontSize: '1.1rem',
                  color: '#999',
                  mb: 4
                }}
              >
                Explorez les trajets disponibles pour faire votre première réservation !
              </Typography>
              <Button
                variant="contained"
                onClick={() => navigate('/')}
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
                Découvrir les trajets
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 3 }}>
              {reservations.map((res, idx) => {
                const statusInfo = getStatusInfo(res.statut);
                const DEFAULT_PHOTO = `${BACKEND_URL}/uploads/profile_photos/default.png`;
                
                const conducteur = res.trajet?.conducteur || res.conducteur || null;
                let conducteurPhoto = conducteur?.photo_profil;
                if (conducteurPhoto) {
                  if (conducteurPhoto.startsWith('/uploads/')) {
                    conducteurPhoto = BACKEND_URL + conducteurPhoto;
                  } else if (!conducteurPhoto.startsWith('http')) {
                    conducteurPhoto = BACKEND_URL + conducteurPhoto;
                  }
                } else {
                  conducteurPhoto = DEFAULT_PHOTO;
                }

                return (
                  <Paper 
                    key={res.id_reservation || res.id || res._id || idx} 
                    elevation={6}
                    sx={{ 
                      p: 3, 
                      borderRadius: '16px',
                      border: '1px solid #e0e0e0',
                      opacity: res.statut === "annulee" ? 0.7 : 1,
                      transition: 'all 0.3s ease',
                      '&:hover': {
                        border: '1px solid #D6FFB7',
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    {/* Header avec statut */}
                    <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                      <Typography 
                        sx={{ 
                          fontFamily: 'Gluten, cursive',
                          fontSize: '1.3rem',
                          color: '#232323',
                          fontWeight: 600
                        }}
                      >
                        {res.trajet?.ville_depart || 'N/A'} → {res.trajet?.ville_arrivee || 'N/A'}
                      </Typography>
                      <Chip
                        label={statusInfo.label}
                        sx={{
                          bgcolor: statusInfo.bgColor,
                          color: statusInfo.color,
                          fontFamily: 'Gluten, cursive',
                          fontWeight: 600,
                          fontSize: '0.9rem',
                          borderRadius: '8px'
                        }}
                      />
                    </Box>

                    {/* Informations du conducteur */}
                    <Box display="flex" alignItems="center" mb={3}>
                      <Avatar
                        src={conducteurPhoto}
                        alt={conducteur?.nom || conducteur?.prenom || 'Conducteur'}
                        sx={{ 
                          width: 50, 
                          height: 50, 
                          mr: 2,
                          border: '2px solid #D6FFB7'
                        }}
                      />
                      <Box>
                        <Typography 
                          sx={{ 
                            fontFamily: 'Gluten, cursive',
                            fontSize: '0.9rem',
                            color: '#666',
                            mb: 0.5
                          }}
                        >
                          Conducteur
                        </Typography>
                        <Typography 
                          sx={{ 
                            fontFamily: 'Gluten, cursive',
                            fontSize: '1.1rem',
                            color: '#232323',
                            fontWeight: 600
                          }}
                        >
                          {conducteur ? 
                            (conducteur.prenom && conducteur.nom ? `${conducteur.prenom} ${conducteur.nom}` : 
                             conducteur.nom || conducteur.prenom || 'Conducteur') 
                            : 'Conducteur non disponible'}
                        </Typography>
                      </Box>
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
                          {res.trajet ? new Date(res.trajet.date_heure_depart).toLocaleString('fr-FR', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : 'N/A'}
                        </Typography>
                      </Box>

                      {res.trajet?.prix !== undefined && (
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
                            💰 Prix
                          </Typography>
                          <Typography sx={{ 
                            fontFamily: 'Gluten, cursive',
                            fontSize: '1.2rem',
                            color: '#232323',
                            fontWeight: 700
                          }}>
                            {res.trajet.prix !== undefined && res.trajet.prix !== null && !isNaN(Number(res.trajet.prix)) ? Number(res.trajet.prix).toFixed(2) : res.trajet.prix} €
                          </Typography>
                        </Box>
                      )}
                    </Stack>

                    {/* Boutons d'action */}
                    <Stack direction="row" spacing={2}>
                      {/* Bouton Annuler pour le passager */}
                      {String(res.passager_id) === String(userId) && !["annulee", "refusee"].includes(res.statut) && (
                        <Button 
                          variant="outlined" 
                          onClick={() => handleCancel(res.id_reservation, res.trajet)}
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
                          Annuler
                        </Button>
                      )}
                      
                      {/* Boutons Accepter/Refuser pour le conducteur */}
                      {String(res.trajet?.conducteur_id) === String(userId) && res.statut === "en_attente" && (
                        <>
                          <Button 
                            variant="contained" 
                            onClick={() => handleStatut(res.id_reservation, "acceptee")}
                            sx={{
                              bgcolor: '#4caf50',
                              color: 'white',
                              borderRadius: '8px',
                              fontWeight: 'bold',
                              py: 1,
                              px: 2,
                              fontSize: '0.9rem',
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
                            Refuser
                          </Button>
                        </>
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* Dialog de confirmation d'annulation (partagé entre mobile et desktop) */}
      <Dialog 
        open={cancelDialog.open} 
        onClose={() => setCancelDialog({ open: false, reservationId: null, trajetInfo: null })}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            fontFamily: 'Gluten, cursive'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Gluten, cursive', fontWeight: 600, color: '#232323' }}>
          Confirmer l'annulation
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: 'Gluten, cursive', color: '#666' }}>
            Êtes-vous sûr de vouloir annuler votre réservation pour le trajet{' '}
            <strong>{cancelDialog.trajetInfo?.ville_depart} → {cancelDialog.trajetInfo?.ville_arrivee}</strong> ?
            <br /><br />
            Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, flexDirection: 'column' }}>
          <Button 
            onClick={() => setCancelDialog({ open: false, reservationId: null, trajetInfo: null })}
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
            onClick={confirmCancel}
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
            Oui, annuler
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 