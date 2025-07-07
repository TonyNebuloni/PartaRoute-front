import { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Alert, Stack, Button, IconButton, Chip, Avatar, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText } from "@mui/material";
import { useNavigate } from "react-router-dom";
import DeleteIcon from '@mui/icons-material/Delete';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import NotificationsIcon from '@mui/icons-material/Notifications';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import InfoIcon from '@mui/icons-material/Info';
import axios from "axios";

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

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");
  const [deleteAllDialog, setDeleteAllDialog] = useState(false);
  const [actionDialog, setActionDialog] = useState({ open: false, type: '', reservationId: null, notifId: null, userInfo: null, tripInfo: null });
  const navigate = useNavigate();

  const fetchNotifications = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("accessToken");
    if (!token || !userId) {
      setError("Connecte-toi pour voir tes notifications.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`${BACKEND_URL}/api/notifications/utilisateur/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const notificationsData = res.data.data || res.data;
      
      // Enrichir les notifications avec les détails des réservations
      const enrichedNotifications = await Promise.all(
        notificationsData.map(async (notif) => {
          if (notif.type === "demande_reservation" && notif.reservation_id) {
            try {
              const reservationRes = await axios.get(`${BACKEND_URL}/api/reservations/${notif.reservation_id}`, {
                headers: { Authorization: `Bearer ${token}` }
              });
              return {
                ...notif,
                reservationDetails: reservationRes.data.data
              };
            } catch (err) {
              return notif;
            }
          }
          return notif;
        })
      );
      
      setNotifications(enrichedNotifications);
    } catch (err) {
      setError("Erreur lors de la récupération des notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const deleteNotif = async (id) => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.delete(`${BACKEND_URL}/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch {}
  };

  const handleStatutConfirm = async () => {
    const { type, reservationId, notifId } = actionDialog;
    const token = localStorage.getItem("accessToken");
    try {
      await axios.post(`${BACKEND_URL}/api/reservations/${reservationId}/statut`, { statut: type }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Marquer automatiquement comme lue après traitement
      if (notifId) {
        await axios.patch(`${BACKEND_URL}/api/notifications/${notifId}/lue`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
      fetchNotifications();
      window.dispatchEvent(new Event('notifRead'));
      setActionDialog({ open: false, type: '', reservationId: null, notifId: null, userInfo: null, tripInfo: null });
    } catch {
      alert("Erreur lors du changement de statut.");
      setActionDialog({ open: false, type: '', reservationId: null, notifId: null, userInfo: null, tripInfo: null });
    }
  };

  const handleActionClick = (type, reservationId, notifId, userInfo, tripInfo) => {
    setActionDialog({
      open: true,
      type,
      reservationId,
      notifId,
      userInfo,
      tripInfo
    });
  };

  const deleteAll = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      await Promise.all(notifications.map(n => axios.delete(`${BACKEND_URL}/api/notifications/${n.id_notification}`, {
        headers: { Authorization: `Bearer ${token}` }
      })));
      fetchNotifications();
      window.dispatchEvent(new Event('notifRead'));
      setDeleteAllDialog(false);
    } catch {}
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case "demande_reservation":
        return <NotificationsIcon sx={{ color: '#ff9800' }} />;
      case "confirmation":
        return <CheckCircleIcon sx={{ color: '#4caf50' }} />;
      case "refus":
        return <CancelIcon sx={{ color: '#f44336' }} />;
      case "annulation":
        return <CancelIcon sx={{ color: '#9e9e9e' }} />;
      default:
        return <InfoIcon sx={{ color: '#2196f3' }} />;
    }
  };

  const getNotificationTitle = (type) => {
    switch (type) {
      case "demande_reservation":
        return "Nouvelle demande de réservation";
      case "confirmation":
        return "Réservation acceptée";
      case "refus":
        return "Réservation refusée";
      case "annulation":
        return "Réservation annulée";
      case "generique":
        return "Notification";
      default:
        return type;
    }
  };

  const getNotificationColor = (type, isRead) => {
    if (isRead) return { bg: '#f8f9fa', border: '#e9ecef' };
    switch (type) {
      case "demande_reservation":
        return { bg: '#fff3e0', border: '#ff9800' };
      case "confirmation":
        return { bg: '#e8f5e8', border: '#4caf50' };
      case "refus":
        return { bg: '#ffebee', border: '#f44336' };
      case "annulation":
        return { bg: '#f5f5f5', border: '#9e9e9e' };
      default:
        return { bg: '#e3f2fd', border: '#2196f3' };
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
            Notifications
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
          {/* Titre et boutons d'action */}
          <Box display="flex" flexDirection="column" alignItems="center" width="100%" mb="6vw" mt="2vw">
            <Typography 
              variant="h4" 
              sx={{ 
                fontFamily: 'Gluten, cursive', 
                fontSize: 'clamp(1.5rem, 7vw, 2.2rem)',
                color: '#232323',
                fontWeight: 700,
                mb: '4vw',
                textAlign: 'center'
              }}
            >
              🔔 Mes notifications
            </Typography>
            
            {/* Bouton supprimer tout */}
            {notifications.length > 0 && (
              <Button 
                variant="outlined" 
                onClick={() => setDeleteAllDialog(true)}
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
                  minWidth: '120px',
                  '&:hover': {
                    borderColor: '#ff4444',
                    bgcolor: '#ff4444',
                    color: 'white'
                  },
                }}
                startIcon={<DeleteIcon />}
              >
                Tout supprimer
              </Button>
            )}
          </Box>

          {notifications.length === 0 ? (
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
                🔕 Aucune notification
              </Typography>
              <Typography 
                sx={{ 
                  fontFamily: 'Gluten, cursive',
                  fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
                  color: '#999',
                  mb: '6vw'
                }}
              >
                Vous êtes à jour ! Toutes vos notifications apparaîtront ici.
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
                Retour à l'accueil
              </Button>
            </Box>
          ) : (
            <Stack spacing={3} width="100%">
              {notifications.map((notif) => {
                const colors = getNotificationColor(notif.type, notif.lue);
                const passager = notif.reservationDetails?.passager;
                const trajet = notif.reservationDetails?.trajet;
                const DEFAULT_PHOTO = `${BACKEND_URL}/uploads/profile_photos/default.png`;
                
                let passagerPhoto = passager?.photo_profil;
                if (passagerPhoto) {
                  if (passagerPhoto.startsWith('/uploads/')) {
                    passagerPhoto = BACKEND_URL + passagerPhoto;
                  } else if (!passagerPhoto.startsWith('http')) {
                    passagerPhoto = BACKEND_URL + passagerPhoto;
                  }
                } else {
                  passagerPhoto = DEFAULT_PHOTO;
                }
                
                return (
                  <Paper 
                    key={notif.id_notification} 
                    elevation={notif.lue ? 1 : 3}
                    sx={{ 
                      p: '4vw', 
                      borderRadius: '20px',
                      border: `2px solid ${colors.border}`,
                      bgcolor: colors.bg,
                      opacity: notif.lue ? 0.8 : 1,
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        transition: 'all 0.3s ease'
                      }
                    }}
                  >
                    {/* Header de la notification */}
                    <Box display="flex" alignItems="center" justifyContent="space-between" mb="3vw">
                      <Box display="flex" alignItems="center" gap={2}>
                        <Avatar sx={{ 
                          bgcolor: 'white', 
                          width: 'clamp(35px, 8vw, 45px)', 
                          height: 'clamp(35px, 8vw, 45px)',
                          border: `2px solid ${colors.border}`
                        }}>
                          {getNotificationIcon(notif.type)}
                        </Avatar>
                        <Box>
                          <Typography sx={{ 
                            fontFamily: 'Gluten, cursive',
                            fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                            color: '#232323',
                            fontWeight: 700
                          }}>
                            {getNotificationTitle(notif.type)}
                          </Typography>
                          <Typography sx={{ 
                            fontFamily: 'Gluten, cursive',
                            fontSize: 'clamp(0.7rem, 2.5vw, 0.9rem)',
                            color: '#666'
                          }}>
                            {new Date(notif.date_notification).toLocaleString('fr-FR', {
                              weekday: 'short',
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </Typography>
                        </Box>
                      </Box>
                      
                      {!notif.lue && (
                        <Chip
                          label="Nouveau"
                          sx={{
                            bgcolor: '#ff4444',
                            color: 'white',
                            fontFamily: 'Gluten, cursive',
                            fontWeight: 600,
                            fontSize: 'clamp(0.6rem, 2vw, 0.8rem)',
                            borderRadius: '12px',
                            height: 'auto',
                            py: 0.5
                          }}
                        />
                      )}
                    </Box>

                    {/* Informations du passager pour les demandes de réservation */}
                    {notif.type === "demande_reservation" && passager && (
                      <Box sx={{ 
                        bgcolor: 'rgba(214, 255, 183, 0.1)', 
                        borderRadius: '12px', 
                        p: '3vw',
                        mb: '3vw',
                        border: '2px solid #D6FFB7'
                      }}>
                        <Box display="flex" alignItems="center" gap={2} mb="2vw">
                          <Avatar
                            src={passagerPhoto}
                            alt={passager.nom || 'Passager'}
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
                              color: '#666',
                              mb: '0.5vw'
                            }}>
                              👤 Demandeur
                            </Typography>
                            <Typography sx={{ 
                              fontFamily: 'Gluten, cursive',
                              fontSize: 'clamp(1rem, 4vw, 1.3rem)',
                              color: '#232323',
                              fontWeight: 700
                            }}>
                              {passager.nom || 'Nom non disponible'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {trajet && (
                          <Box sx={{ 
                            bgcolor: 'rgba(255, 255, 255, 0.8)', 
                            borderRadius: '8px', 
                            p: '2vw',
                            border: '1px solid rgba(0,0,0,0.1)'
                          }}>
                            <Typography sx={{ 
                              fontFamily: 'Gluten, cursive',
                              fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                              color: '#666',
                              mb: '1vw'
                            }}>
                              🚗 Trajet concerné
                            </Typography>
                            <Typography sx={{ 
                              fontFamily: 'Gluten, cursive',
                              fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                              color: '#232323',
                              fontWeight: 600
                            }}>
                              {trajet.ville_depart} → {trajet.ville_arrivee}
                            </Typography>
                            <Typography sx={{ 
                              fontFamily: 'Gluten, cursive',
                              fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                              color: '#666'
                            }}>
                              {new Date(trajet.date_heure_depart).toLocaleString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Contenu de la notification */}
                    <Box sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.7)', 
                      borderRadius: '12px', 
                      p: '3vw',
                      mb: '3vw',
                      border: '1px solid rgba(0,0,0,0.1)'
                    }}>
                      <Typography sx={{ 
                        fontFamily: 'Gluten, cursive',
                        fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
                        color: '#232323',
                        lineHeight: 1.5
                      }}>
                        {notif.type === "demande_reservation" && notif.lue
                          ? "Demande traitée."
                          : notif.contenu_message}
                      </Typography>
                    </Box>

                    {/* Actions pour demande de réservation */}
                    {notif.type === "demande_reservation" && notif.reservation_id && !notif.lue && (
                      <Stack direction="row" spacing={2} mb="3vw">
                        <Button 
                          variant="contained" 
                          onClick={() => handleActionClick("acceptee", notif.reservation_id, notif.id_notification, passager, trajet)}
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
                            '&:hover': {
                              bgcolor: '#45a049',
                            },
                          }}
                        >
                          ✅ Accepter
                        </Button>
                        <Button 
                          variant="contained" 
                          onClick={() => handleActionClick("refusee", notif.reservation_id, notif.id_notification, passager, trajet)}
                          sx={{
                            bgcolor: '#ff4444',
                            color: 'white',
                            borderRadius: '999px',
                            fontWeight: 'bold',
                            py: '2vw',
                            px: '4vw',
                            fontSize: 'clamp(0.8rem, 3vw, 1rem)',
                            fontFamily: 'Gluten, cursive',
                            textTransform: 'none',
                            flex: 1,
                            '&:hover': {
                              bgcolor: '#e63939',
                            },
                          }}
                        >
                          ❌ Refuser
                        </Button>
                      </Stack>
                    )}

                    {/* Bouton supprimer la notification */}
                    <Stack direction="row" spacing={2} justifyContent="flex-end">
                      <IconButton 
                        onClick={() => deleteNotif(notif.id_notification)} 
                        sx={{
                          color: '#ff4444',
                          '&:hover': {
                            bgcolor: 'rgba(255, 68, 68, 0.1)',
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Stack>
                  </Paper>
                );
              })}
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
            <img src="/src/assets/logo_icon.png" alt="Logo PartaRoute" style={{ width: '100%', height: 'auto', display: 'block' }} />
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
            Notifications
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
            Gérez vos notifications
          </Typography>

          {/* Statistiques dans la sidebar */}
          <Box sx={{ width: '100%', mb: 4 }}>
            <Paper sx={{ p: 2, bgcolor: '#333', borderRadius: '12px', mb: 2 }}>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: '#D6FFB7', fontSize: '0.9rem', mb: 1 }}>
                Total notifications
              </Typography>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: 'white', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {notifications.length}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, bgcolor: '#333', borderRadius: '12px', mb: 2 }}>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: '#D6FFB7', fontSize: '0.9rem', mb: 1 }}>
                Non lues
              </Typography>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: '#ff9800', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {notifications.filter(n => !n.lue).length}
              </Typography>
            </Paper>
            <Paper sx={{ p: 2, bgcolor: '#333', borderRadius: '12px' }}>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: '#D6FFB7', fontSize: '0.9rem', mb: 1 }}>
                Demandes en attente
              </Typography>
              <Typography sx={{ fontFamily: 'Gluten, cursive', color: '#4caf50', fontSize: '1.5rem', fontWeight: 'bold' }}>
                {notifications.filter(n => n.type === "demande_reservation" && !n.lue).length}
              </Typography>
            </Paper>
          </Box>

          {/* Bouton supprimer tout */}
          {notifications.length > 0 && (
            <Button
              variant="contained"
              onClick={() => setDeleteAllDialog(true)}
              startIcon={<DeleteIcon />}
              fullWidth
              sx={{
                bgcolor: '#ff4444',
                color: 'white',
                borderRadius: '12px',
                fontWeight: 'bold',
                py: 1.5,
                fontSize: '1rem',
                fontFamily: 'Gluten, cursive',
                mb: 2,
                '&:hover': {
                  bgcolor: '#e63939',
                },
              }}
            >
              Tout supprimer
            </Button>
          )}

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
            🔔 Mes Notifications
          </Typography>

          {notifications.length === 0 ? (
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
                🔕 Aucune notification
              </Typography>
              <Typography 
                sx={{ 
                  fontFamily: 'Gluten, cursive',
                  fontSize: '1.1rem',
                  color: '#999',
                  mb: 4
                }}
              >
                Vous êtes à jour ! Toutes vos notifications apparaîtront ici.
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
                Retour à l'accueil
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: 3 }}>
              {notifications.map((notif) => {
                const colors = getNotificationColor(notif.type, notif.lue);
                const passager = notif.reservationDetails?.passager;
                const trajet = notif.reservationDetails?.trajet;
                const DEFAULT_PHOTO = `${BACKEND_URL}/uploads/profile_photos/default.png`;
                
                let passagerPhoto = passager?.photo_profil;
                if (passagerPhoto) {
                  if (passagerPhoto.startsWith('/uploads/')) {
                    passagerPhoto = BACKEND_URL + passagerPhoto;
                  } else if (!passagerPhoto.startsWith('http')) {
                    passagerPhoto = BACKEND_URL + passagerPhoto;
                  }
                } else {
                  passagerPhoto = DEFAULT_PHOTO;
                }
                
                return (
                  <Paper 
                    key={notif.id_notification} 
                    elevation={notif.lue ? 3 : 8}
                    sx={{ 
                      p: 3, 
                      borderRadius: '16px',
                      border: `2px solid ${colors.border}`,
                      bgcolor: colors.bg,
                      opacity: notif.lue ? 0.85 : 1,
                      transition: 'all 0.3s ease',
                      position: 'relative',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: '0 12px 30px rgba(0,0,0,0.15)'
                      }
                    }}
                  >
                    {/* Badge "Nouveau" en haut à droite */}
                    {!notif.lue && (
                      <Chip
                        label="Nouveau"
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          bgcolor: '#ff4444',
                          color: 'white',
                          fontFamily: 'Gluten, cursive',
                          fontWeight: 600,
                          fontSize: '0.7rem',
                          borderRadius: '8px',
                          height: 'auto',
                          py: 0.5,
                          px: 1
                        }}
                      />
                    )}

                    {/* Header de la notification */}
                    <Box display="flex" alignItems="center" gap={2} mb={2}>
                      <Avatar sx={{ 
                        bgcolor: 'white', 
                        width: 45, 
                        height: 45,
                        border: `2px solid ${colors.border}`
                      }}>
                        {getNotificationIcon(notif.type)}
                      </Avatar>
                      <Box flex={1}>
                        <Typography sx={{ 
                          fontFamily: 'Gluten, cursive',
                          fontSize: '1.1rem',
                          color: '#232323',
                          fontWeight: 700
                        }}>
                          {getNotificationTitle(notif.type)}
                        </Typography>
                        <Typography sx={{ 
                          fontFamily: 'Gluten, cursive',
                          fontSize: '0.8rem',
                          color: '#666'
                        }}>
                          {new Date(notif.date_notification).toLocaleString('fr-FR', {
                            weekday: 'short',
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit'
                          })}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Informations du passager pour les demandes de réservation */}
                    {notif.type === "demande_reservation" && passager && (
                      <Box sx={{ 
                        bgcolor: 'rgba(214, 255, 183, 0.1)', 
                        borderRadius: '8px', 
                        p: 2,
                        mb: 2,
                        border: '1px solid #D6FFB7'
                      }}>
                        <Box display="flex" alignItems="center" gap={2} mb={1}>
                          <Avatar
                            src={passagerPhoto}
                            alt={passager.nom || 'Passager'}
                            sx={{ 
                              width: 35, 
                              height: 35,
                              border: '2px solid #D6FFB7'
                            }}
                          />
                          <Box>
                            <Typography sx={{ 
                              fontFamily: 'Gluten, cursive',
                              fontSize: '0.8rem',
                              color: '#666',
                              mb: 0.5
                            }}>
                              👤 Demandeur
                            </Typography>
                            <Typography sx={{ 
                              fontFamily: 'Gluten, cursive',
                              fontSize: '1rem',
                              color: '#232323',
                              fontWeight: 700
                            }}>
                              {passager.nom || 'Nom non disponible'}
                            </Typography>
                          </Box>
                        </Box>
                        
                        {trajet && (
                          <Box sx={{ 
                            bgcolor: 'rgba(255, 255, 255, 0.8)', 
                            borderRadius: '6px', 
                            p: 1.5,
                            border: '1px solid rgba(0,0,0,0.1)'
                          }}>
                            <Typography sx={{ 
                              fontFamily: 'Gluten, cursive',
                              fontSize: '0.8rem',
                              color: '#666',
                              mb: 0.5
                            }}>
                              🚗 Trajet concerné
                            </Typography>
                            <Typography sx={{ 
                              fontFamily: 'Gluten, cursive',
                              fontSize: '0.9rem',
                              color: '#232323',
                              fontWeight: 600
                            }}>
                              {trajet.ville_depart} → {trajet.ville_arrivee}
                            </Typography>
                            <Typography sx={{ 
                              fontFamily: 'Gluten, cursive',
                              fontSize: '0.8rem',
                              color: '#666'
                            }}>
                              {new Date(trajet.date_heure_depart).toLocaleString('fr-FR', {
                                weekday: 'long',
                                day: 'numeric',
                                month: 'long',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    )}

                    {/* Contenu de la notification */}
                    <Box sx={{ 
                      bgcolor: 'rgba(255, 255, 255, 0.7)', 
                      borderRadius: '8px', 
                      p: 2,
                      mb: 2,
                      border: '1px solid rgba(0,0,0,0.1)'
                    }}>
                      <Typography sx={{ 
                        fontFamily: 'Gluten, cursive',
                        fontSize: '0.9rem',
                        color: '#232323',
                        lineHeight: 1.5
                      }}>
                        {notif.type === "demande_reservation" && notif.lue
                          ? "Demande traitée."
                          : notif.contenu_message}
                      </Typography>
                    </Box>

                    {/* Actions pour demande de réservation */}
                    {notif.type === "demande_reservation" && notif.reservation_id && !notif.lue && (
                      <Stack direction="row" spacing={1} mb={2}>
                        <Button 
                          variant="contained" 
                          onClick={() => handleActionClick("acceptee", notif.reservation_id, notif.id_notification, passager, trajet)}
                          sx={{
                            bgcolor: '#4caf50',
                            color: 'white',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            py: 1,
                            px: 2,
                            fontSize: '0.8rem',
                            fontFamily: 'Gluten, cursive',
                            textTransform: 'none',
                            flex: 1,
                            '&:hover': {
                              bgcolor: '#45a049',
                            },
                          }}
                        >
                          ✅ Accepter
                        </Button>
                        <Button 
                          variant="contained" 
                          onClick={() => handleActionClick("refusee", notif.reservation_id, notif.id_notification, passager, trajet)}
                          sx={{
                            bgcolor: '#ff4444',
                            color: 'white',
                            borderRadius: '8px',
                            fontWeight: 'bold',
                            py: 1,
                            px: 2,
                            fontSize: '0.8rem',
                            fontFamily: 'Gluten, cursive',
                            textTransform: 'none',
                            flex: 1,
                            '&:hover': {
                              bgcolor: '#e63939',
                            },
                          }}
                        >
                          ❌ Refuser
                        </Button>
                      </Stack>
                    )}

                    {/* Bouton supprimer la notification */}
                    <Box display="flex" justifyContent="flex-end">
                      <IconButton 
                        onClick={() => deleteNotif(notif.id_notification)} 
                        sx={{
                          color: '#ff4444',
                          '&:hover': {
                            bgcolor: 'rgba(255, 68, 68, 0.1)',
                          }
                        }}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Paper>
                );
              })}
            </Box>
          )}
        </Box>
      </Box>

      {/* Dialogs (partagés entre mobile et desktop) */}
      {/* Dialog de confirmation pour les actions */}
      <Dialog 
        open={actionDialog.open} 
        onClose={() => setActionDialog({ open: false, type: '', reservationId: null, notifId: null, userInfo: null, tripInfo: null })}
        PaperProps={{
          sx: {
            borderRadius: '20px',
            fontFamily: 'Gluten, cursive'
          }
        }}
      >
        <DialogTitle sx={{ fontFamily: 'Gluten, cursive', fontWeight: 600, color: '#232323' }}>
          {actionDialog.type === 'acceptee' ? 'Confirmer l\'acceptation' : 'Confirmer le refus'}
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ fontFamily: 'Gluten, cursive', color: '#666', mb: 2 }}>
            {actionDialog.type === 'acceptee' 
              ? 'Êtes-vous sûr de vouloir accepter cette demande de réservation ?'
              : 'Êtes-vous sûr de vouloir refuser cette demande de réservation ?'
            }
          </DialogContentText>
          
          {actionDialog.userInfo && (
            <Box sx={{ 
              bgcolor: '#f8f9fa', 
              borderRadius: '12px', 
              p: 2,
              mb: 2,
              border: '1px solid #e9ecef'
            }}>
              <Typography sx={{ 
                fontFamily: 'Gluten, cursive',
                fontSize: '0.9rem',
                color: '#666',
                mb: 1
              }}>
                👤 Passager
              </Typography>
              <Typography sx={{ 
                fontFamily: 'Gluten, cursive',
                fontSize: '1.1rem',
                color: '#232323',
                fontWeight: 600
              }}>
                {actionDialog.userInfo.nom}
              </Typography>
            </Box>
          )}
          
          {actionDialog.tripInfo && (
            <Box sx={{ 
              bgcolor: '#f8f9fa', 
              borderRadius: '12px', 
              p: 2,
              border: '1px solid #e9ecef'
            }}>
              <Typography sx={{ 
                fontFamily: 'Gluten, cursive',
                fontSize: '0.9rem',
                color: '#666',
                mb: 1
              }}>
                🚗 Trajet
              </Typography>
              <Typography sx={{ 
                fontFamily: 'Gluten, cursive',
                fontSize: '1.1rem',
                color: '#232323',
                fontWeight: 600
              }}>
                {actionDialog.tripInfo.ville_depart} → {actionDialog.tripInfo.ville_arrivee}
              </Typography>
              <Typography sx={{ 
                fontFamily: 'Gluten, cursive',
                fontSize: '0.9rem',
                color: '#666'
              }}>
                {actionDialog.tripInfo.date_heure_depart && new Date(actionDialog.tripInfo.date_heure_depart).toLocaleString('fr-FR', {
                  weekday: 'long',
                  day: 'numeric',
                  month: 'long',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, flexDirection: 'column' }}>
          <Button 
            onClick={() => setActionDialog({ open: false, type: '', reservationId: null, notifId: null, userInfo: null, tripInfo: null })}
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
            Annuler
          </Button>
          <Button 
            onClick={handleStatutConfirm}
            variant="contained"
            sx={{
              bgcolor: actionDialog.type === 'acceptee' ? '#4caf50' : '#ff4444',
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
                bgcolor: actionDialog.type === 'acceptee' ? '#45a049' : '#e63939',
              },
            }}
          >
            {actionDialog.type === 'acceptee' ? '✅ Confirmer l\'acceptation' : '❌ Confirmer le refus'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de confirmation pour tout supprimer */}
      <Dialog 
        open={deleteAllDialog} 
        onClose={() => setDeleteAllDialog(false)}
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
            Êtes-vous sûr de vouloir supprimer toutes vos notifications ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2, gap: 1, flexDirection: 'column' }}>
          <Button 
            onClick={() => setDeleteAllDialog(false)}
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
            onClick={deleteAll}
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
            Oui, tout supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 