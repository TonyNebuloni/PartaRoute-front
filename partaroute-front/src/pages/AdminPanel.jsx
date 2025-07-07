import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, Avatar, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, MenuItem, List, ListItem, ListItemButton, ListItemText, Divider, Chip, Card, CardContent, Stack, Drawer, useMediaQuery, useTheme, Fab } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PeopleIcon from '@mui/icons-material/People';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import { useNavigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard.jsx";
import AdminTrips from "./AdminTrips.jsx";
import AdminReservations from "./AdminReservations.jsx";

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
const DEFAULT_PHOTO = `${BACKEND_URL}/uploads/profile_photos/default.jpg`;

const MENU = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon />, emoji: '📊' },
  { key: 'users', label: 'Utilisateurs', icon: <PeopleIcon />, emoji: '👥' },
  { key: 'trips', label: 'Trajets', icon: <DirectionsCarIcon />, emoji: '🚗' },
  { key: 'reservations', label: 'Réservations', icon: <BookOnlineIcon />, emoji: '📅' },
];

export default function AdminPanel() {
  const [selected, setSelected] = useState('dashboard');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [editDialog, setEditDialog] = useState({ open: false, user: null, form: { nom: '', email: '', role: '', mot_de_passe: '' } });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  // Vérifier si admin (simple check, à sécuriser côté backend aussi)
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") navigate("/");
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${BACKEND_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let data = res.data.data || res.data;
      // Recherche
      if (search) {
        data = data.filter(u =>
          u.nom.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      setTotal(data.length);
      // Pagination
      setUsers(data.slice(page * pageSize, (page + 1) * pageSize));
      setError("");
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (selected === 'users') {
      fetchUsers();
    }
    // eslint-disable-next-line
  }, [search, page, pageSize, selected]);

  const handlePromote = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.patch(`${BACKEND_URL}/api/admin/user/${id}/promote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg("Utilisateur promu administrateur !");
      fetchUsers();
    } catch {
      setError("Erreur lors de la promotion.");
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.user) return;
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${BACKEND_URL}/api/admin/users/${deleteDialog.user.id_utilisateur}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg("Utilisateur supprimé !");
      setDeleteDialog({ open: false, user: null });
      fetchUsers();
    } catch {
      setError("Erreur lors de la suppression.");
    }
  };

  const handleEditOpen = (user) => {
    setEditDialog({ open: true, user, form: { nom: user.nom, email: user.email, role: user.role, mot_de_passe: '' } });
  };

  const handleEditChange = (e) => {
    setEditDialog(prev => ({ ...prev, form: { ...prev.form, [e.target.name]: e.target.value } }));
  };

  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const { nom, email, role, mot_de_passe } = editDialog.form;
      const data = { nom, email, role };
      if (mot_de_passe) data.mot_de_passe = mot_de_passe;
      await axios.put(`${BACKEND_URL}/api/admin/users/${editDialog.user.id_utilisateur}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg("Utilisateur modifié !");
      setEditDialog({ open: false, user: null, form: { nom: '', email: '', role: '', mot_de_passe: '' } });
      fetchUsers();
    } catch {
      setError("Erreur lors de la modification.");
    }
  };

  const handleMenuItemClick = (key) => {
    setSelected(key);
    if (isMobile) {
      setMobileMenuOpen(false);
    }
  };

  const pageCount = Math.ceil(total / pageSize);

  // Composant de menu réutilisable
  const MenuContent = () => (
    <Box sx={{ 
      p: 3,
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Box sx={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center',
        mb: 3
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontFamily: 'Gluten, cursive',
            fontSize: { xs: '1.1rem', sm: '1.2rem', md: '1.4rem' },
            color: '#232323',
            fontWeight: 700,
            textAlign: 'center'
          }}
        >
          Menu Admin
        </Typography>
        {isMobile && (
          <IconButton 
            onClick={() => setMobileMenuOpen(false)}
            sx={{ color: '#666' }}
          >
            <CloseIcon />
          </IconButton>
        )}
      </Box>
      
      <Stack spacing={2} flex={1}>
        {MENU.map(item => (
          <Button
            key={item.key}
            onClick={() => handleMenuItemClick(item.key)}
            sx={{
              bgcolor: selected === item.key ? '#D6FFB7' : 'transparent',
              color: selected === item.key ? '#232323' : '#666',
              borderRadius: '15px',
              fontFamily: 'Gluten, cursive',
              fontSize: { xs: '0.9rem', sm: '1rem', md: '1.1rem' },
              fontWeight: 600,
              textTransform: 'none',
              py: { xs: 2, sm: 2.5, md: 3 },
              px: { xs: 2, sm: 3, md: 4 },
              justifyContent: 'flex-start',
              gap: 2,
              '&:hover': {
                bgcolor: selected === item.key ? '#c5e8a6' : 'rgba(214, 255, 183, 0.1)',
              },
            }}
            startIcon={
              <Box sx={{ fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' } }}>
                {item.emoji}
              </Box>
            }
          >
            {item.label}
          </Button>
        ))}
      </Stack>
    </Box>
  );

  return (
    <Box 
      sx={{
        minHeight: '100vh',
        bgcolor: '#232323',
        fontFamily: "'Gluten', cursive",
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Header Mobile First */}
      <Box 
        sx={{
          bgcolor: '#232323',
          p: { xs: 2, sm: 3, md: 4 },
          pt: { xs: 3, sm: 4, md: 6 },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'relative'
        }}
      >
        {/* Bouton retour */}
        <Button
          onClick={() => selected === 'dashboard' ? navigate('/') : setSelected('dashboard')}
          sx={{
            color: '#D6FFB7',
            fontFamily: 'Gluten, cursive',
            fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1.1rem' },
            textTransform: 'none',
            minWidth: 'auto',
            p: { xs: 1, sm: 1.5 },
            '&:hover': {
              bgcolor: 'rgba(214, 255, 183, 0.1)',
            }
          }}
          startIcon={<ArrowBackIcon sx={{ fontSize: { xs: '1rem', sm: '1.2rem' } }} />}
        >
          {!isMobile && (selected === 'dashboard' ? 'Retour' : 'Dashboard')}
        </Button>

        {/* Titre */}
        <Typography 
          sx={{ 
            fontFamily: 'Gluten, cursive',
            fontSize: { xs: '1rem', sm: '1.3rem', md: '1.8rem' },
            color: '#D6FFB7',
            fontWeight: 600,
            textAlign: 'center',
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)'
          }}
        >
          🛠️ Admin
        </Typography>

        {/* Bouton menu mobile */}
        {isMobile && (
          <IconButton
            onClick={() => setMobileMenuOpen(true)}
            sx={{
              color: '#D6FFB7',
              bgcolor: 'rgba(214, 255, 183, 0.1)',
              '&:hover': {
                bgcolor: 'rgba(214, 255, 183, 0.2)',
              }
            }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Spacer pour desktop */}
        {!isMobile && <Box width="60px" />}
      </Box>

      {/* Contenu principal */}
      <Box 
        sx={{
          flex: 1,
          display: 'flex',
          position: 'relative'
        }}
      >
        {/* Sidebar Desktop */}
        {!isMobile && (
          <Paper 
            elevation={3} 
            sx={{ 
              width: { md: '280px', lg: '320px' },
              bgcolor: '#fff', 
              borderTopRightRadius: '20px',
              borderBottomRightRadius: 0,
              borderTopLeftRadius: 0,
              borderBottomLeftRadius: 0,
              minHeight: '100%'
            }}
          >
            <MenuContent />
          </Paper>
        )}

        {/* Drawer Mobile */}
        <Drawer
          anchor="left"
          open={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          PaperProps={{
            sx: {
              width: '280px',
              bgcolor: '#fff',
              borderTopRightRadius: '20px',
              borderBottomRightRadius: '20px'
            }
          }}
        >
          <MenuContent />
        </Drawer>

        {/* Contenu principal */}
        <Box 
          sx={{
            flex: 1,
            bgcolor: '#fff',
            borderTopLeftRadius: { xs: '20px', md: '20px' },
            borderTopRightRadius: { xs: '20px', md: 0 },
            borderBottomLeftRadius: 0,
            borderBottomRightRadius: 0,
            p: { xs: 3, sm: 4, md: 6 },
            pb: { xs: 8, sm: 10, md: 12 },
            overflow: 'auto',
            fontFamily: 'Gluten, cursive'
          }}
        >
          {selected === 'dashboard' && <AdminDashboard onNavigate={setSelected} />}
          {selected === 'trips' && <AdminTrips />}
          {selected === 'reservations' && <AdminReservations />}
          {selected === 'users' && (
            <Box>
              {/* Titre */}
              <Box mb={{ xs: 3, sm: 4, md: 6 }}>
                <Typography 
                  variant="h4" 
                  sx={{ 
                    fontFamily: 'Gluten, cursive', 
                    fontSize: { xs: '1.3rem', sm: '1.6rem', md: '2.2rem' },
                    color: '#232323',
                    fontWeight: 700,
                    textAlign: { xs: 'center', md: 'left' }
                  }}
                >
                  👥 Gestion des utilisateurs
                </Typography>
              </Box>

              {/* Barre de recherche */}
              <Box mb={{ xs: 3, sm: 4 }}>
                <TextField
                  label="Rechercher un utilisateur"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(0); }}
                  variant="outlined"
                  fullWidth
                  size={isMobile ? "small" : "medium"}
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
                    startAdornment: <SearchIcon sx={{ color: '#666', mr: 1, fontSize: { xs: '1.2rem', md: '1.5rem' } }} />
                  }}
                />
              </Box>

              {/* Messages */}
              {successMsg && (
                <Alert 
                  severity="success" 
                  sx={{ 
                    mb: { xs: 2, sm: 3, md: 4 },
                    borderRadius: '12px',
                    '& .MuiAlert-message': {
                      fontFamily: 'Gluten, cursive',
                      fontSize: { xs: '0.8rem', sm: '0.9rem' }
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
                    mb: { xs: 2, sm: 3, md: 4 },
                    borderRadius: '12px',
                    '& .MuiAlert-message': {
                      fontFamily: 'Gluten, cursive',
                      fontSize: { xs: '0.8rem', sm: '0.9rem' }
                    }
                  }}
                >
                  {error}
                </Alert>
              )}

              {/* Liste des utilisateurs */}
              <Stack spacing={{ xs: 2, sm: 3 }}>
                {users.map(user => (
                  <Card 
                    key={user.id_utilisateur}
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
                    <CardContent sx={{ p: { xs: 2, sm: 3, md: 4 } }}>
                      <Box 
                        sx={{
                          display: 'flex',
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'center', sm: 'center' },
                          justifyContent: 'space-between',
                          gap: { xs: 2, sm: 3 }
                        }}
                      >
                        {/* Informations utilisateur */}
                        <Box 
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'column', sm: 'row' },
                            alignItems: 'center',
                            gap: { xs: 2, sm: 3 },
                            textAlign: { xs: 'center', sm: 'left' },
                            flex: 1
                          }}
                        >
                          <Avatar
                            src={user.photo_profil ? (user.photo_profil.startsWith('/uploads/') ? BACKEND_URL + user.photo_profil : user.photo_profil) : DEFAULT_PHOTO}
                            alt={user.nom}
                            sx={{ 
                              width: { xs: 60, sm: 70, md: 80 }, 
                              height: { xs: 60, sm: 70, md: 80 },
                              border: '3px solid #D6FFB7'
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Typography sx={{ 
                              fontFamily: 'Gluten, cursive',
                              fontSize: { xs: '1rem', sm: '1.2rem', md: '1.4rem' },
                              color: '#232323',
                              fontWeight: 700,
                              mb: 0.5
                            }}>
                              {user.nom}
                            </Typography>
                            <Typography sx={{ 
                              fontFamily: 'Gluten, cursive',
                              fontSize: { xs: '0.8rem', sm: '0.9rem', md: '1.1rem' },
                              color: '#666',
                              mb: 1,
                              wordBreak: 'break-all'
                            }}>
                              {user.email}
                            </Typography>
                            <Chip
                              icon={user.role === 'admin' ? <AdminPanelSettingsIcon /> : <PeopleIcon />}
                              label={user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
                              sx={{
                                bgcolor: user.role === 'admin' ? '#D6FFB7' : '#f0f0f0',
                                color: user.role === 'admin' ? '#232323' : '#666',
                                fontFamily: 'Gluten, cursive',
                                fontWeight: 600,
                                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '0.9rem' },
                                borderRadius: '12px'
                              }}
                            />
                          </Box>
                        </Box>

                        {/* Actions */}
                        <Box 
                          sx={{
                            display: 'flex',
                            flexDirection: { xs: 'row', sm: 'row' },
                            gap: { xs: 1, sm: 2 },
                            flexWrap: 'wrap',
                            justifyContent: 'center'
                          }}
                        >
                          <IconButton 
                            onClick={() => handleEditOpen(user)}
                            size={isMobile ? "small" : "medium"}
                            sx={{
                              bgcolor: '#D6FFB7',
                              color: '#232323',
                              '&:hover': {
                                bgcolor: '#c5e8a6',
                                transform: 'scale(1.05)',
                              },
                            }}
                          >
                            <EditIcon />
                          </IconButton>
                          
                          {user.role !== 'admin' && (
                            <Button 
                              variant="contained"
                              onClick={() => handlePromote(user.id_utilisateur)}
                              size={isMobile ? "small" : "medium"}
                              sx={{
                                bgcolor: '#4caf50',
                                color: 'white',
                                borderRadius: '999px',
                                fontWeight: 'bold',
                                px: { xs: 2, sm: 3 },
                                fontSize: { xs: '0.7rem', sm: '0.8rem', md: '1rem' },
                                fontFamily: 'Gluten, cursive',
                                textTransform: 'none',
                                whiteSpace: 'nowrap',
                                '&:hover': {
                                  bgcolor: '#45a049',
                                },
                              }}
                            >
                              Promouvoir
                            </Button>
                          )}
                          
                          <IconButton 
                            onClick={() => setDeleteDialog({ open: true, user })}
                            size={isMobile ? "small" : "medium"}
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

              {/* Pagination */}
              {pageCount > 1 && (
                <Box 
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'center',
                    alignItems: 'center',
                    mt: { xs: 4, sm: 6 },
                    gap: { xs: 1, sm: 2 }
                  }}
                >
                  <Button 
                    disabled={page === 0}
                    onClick={() => setPage(page - 1)}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      fontFamily: 'Gluten, cursive',
                      borderRadius: '999px',
                      px: { xs: 2, sm: 3 }
                    }}
                  >
                    Précédent
                  </Button>
                  <Typography sx={{ 
                    fontFamily: 'Gluten, cursive',
                    px: 2,
                    fontSize: { xs: '0.9rem', sm: '1rem' }
                  }}>
                    Page {page + 1} sur {pageCount}
                  </Typography>
                  <Button 
                    disabled={page >= pageCount - 1}
                    onClick={() => setPage(page + 1)}
                    size={isMobile ? "small" : "medium"}
                    sx={{
                      fontFamily: 'Gluten, cursive',
                      borderRadius: '999px',
                      px: { xs: 2, sm: 3 }
                    }}
                  >
                    Suivant
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Box>
      </Box>

      {/* Dialog de suppression */}
      <Dialog 
        open={deleteDialog.open} 
        onClose={() => setDeleteDialog({ open: false, user: null })}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            fontFamily: 'Gluten, cursive',
            m: { xs: 2, sm: 3 }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: 'Gluten, cursive', 
          fontWeight: 600, 
          color: '#232323',
          fontSize: { xs: '1.1rem', sm: '1.3rem' },
          textAlign: 'center'
        }}>
          Confirmer la suppression
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Typography sx={{ 
            fontFamily: 'Gluten, cursive', 
            color: '#666',
            fontSize: { xs: '0.9rem', sm: '1rem' },
            textAlign: 'center'
          }}>
            Êtes-vous sûr de vouloir supprimer l'utilisateur <strong>{deleteDialog.user?.nom}</strong> ? Cette action est irréversible.
          </Typography>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, gap: 1, flexDirection: 'column' }}>
          <Button 
            onClick={() => setDeleteDialog({ open: false, user: null })}
            fullWidth
            sx={{
              color: '#666',
              fontFamily: 'Gluten, cursive',
              textTransform: 'none',
              borderRadius: '999px',
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleDelete}
            variant="contained"
            fullWidth
            sx={{
              bgcolor: '#ff4444',
              color: 'white',
              fontFamily: 'Gluten, cursive',
              textTransform: 'none',
              borderRadius: '999px',
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.9rem', sm: '1rem' },
              '&:hover': {
                bgcolor: '#e63939',
              },
            }}
          >
            Oui, supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog d'édition */}
      <Dialog 
        open={editDialog.open} 
        onClose={() => setEditDialog({ open: false, user: null, form: { nom: '', email: '', role: '', mot_de_passe: '' } })}
        fullWidth
        maxWidth="xs"
        PaperProps={{
          sx: {
            borderRadius: '20px',
            fontFamily: 'Gluten, cursive',
            m: { xs: 2, sm: 3 }
          }
        }}
      >
        <DialogTitle sx={{ 
          fontFamily: 'Gluten, cursive', 
          fontWeight: 600, 
          color: '#232323',
          textAlign: 'center',
          fontSize: { xs: '1.1rem', sm: '1.3rem' }
        }}>
          ✏️ Modifier l'utilisateur
        </DialogTitle>
        <DialogContent sx={{ px: { xs: 2, sm: 3 } }}>
          <Stack spacing={{ xs: 2, sm: 3 }} mt={1}>
            <TextField
              label="Nom"
              name="nom"
              value={editDialog.form.nom}
              onChange={handleEditChange}
              fullWidth
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
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
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={editDialog.form.email}
              onChange={handleEditChange}
              fullWidth
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
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
            />
            <TextField
              label="Rôle"
              name="role"
              select
              value={editDialog.form.role}
              onChange={handleEditChange}
              fullWidth
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
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
            >
              <MenuItem value="user">Utilisateur</MenuItem>
              <MenuItem value="admin">Administrateur</MenuItem>
            </TextField>
            <TextField
              label="Nouveau mot de passe (optionnel)"
              name="mot_de_passe"
              type="password"
              value={editDialog.form.mot_de_passe}
              onChange={handleEditChange}
              fullWidth
              variant="outlined"
              size={isMobile ? "small" : "medium"}
              sx={{
                '& .MuiOutlinedInput-root': {
                  borderRadius: '12px',
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
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: { xs: 2, sm: 3 }, gap: { xs: 1, sm: 2 }, flexDirection: 'column' }}>
          <Button 
            onClick={() => setEditDialog({ open: false, user: null, form: { nom: '', email: '', role: '', mot_de_passe: '' } })}
            fullWidth
            sx={{
              color: '#666',
              fontFamily: 'Gluten, cursive',
              textTransform: 'none',
              borderRadius: '999px',
              py: { xs: 1, sm: 1.5 },
              fontSize: { xs: '0.9rem', sm: '1rem' }
            }}
          >
            Annuler
          </Button>
          <Button 
            onClick={handleEditSave}
            variant="contained"
            fullWidth
            sx={{
              bgcolor: '#D6FFB7',
              color: '#232323',
              fontFamily: 'Gluten, cursive',
              textTransform: 'none',
              borderRadius: '999px',
              py: { xs: 1, sm: 1.5 },
              fontWeight: 700,
              fontSize: { xs: '0.9rem', sm: '1rem' },
              '&:hover': {
                bgcolor: '#c5e8a6',
              },
            }}
          >
            💾 Enregistrer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 