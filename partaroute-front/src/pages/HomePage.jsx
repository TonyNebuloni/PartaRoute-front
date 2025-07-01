import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, Stack, CircularProgress, Dialog, DialogTitle, DialogContent, IconButton, Button, useTheme, useMediaQuery } from "@mui/material";
import { Link } from "react-router-dom";
import TripCardList from "../components/TripCardList";
import TripForm from "../components/TripForm";
import CloseIcon from "@mui/icons-material/Close";
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import Divider from '@mui/material/Divider';
import LogoutIcon from '@mui/icons-material/Logout';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';

export default function Home() {
  const [prenom, setPrenom] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Fetch trajets pour tout le monde
    setLoading(true);
    axios
      .get("http://localhost:3000/api/trips")
      .then((res) => {
        let tripsArr = [];
        if (Array.isArray(res.data)) {
          tripsArr = res.data;
        } else if (Array.isArray(res.data.data)) {
          tripsArr = res.data.data;
        } else if (res.data.trips && Array.isArray(res.data.trips)) {
          tripsArr = res.data.trips;
        }
        setTrips(tripsArr);
        setLoading(false);
      })
      .catch((err) => {
        setError("Erreur lors de la récupération des trajets.");
        setLoading(false);
      });

    // Fetch user uniquement si connecté
    const token = localStorage.getItem("accessToken");
    const id = localStorage.getItem("userId");
    if (token && id) {
      setIsConnected(true);
      axios
        .get(`http://localhost:3000/api/user/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        .then((res) => {
          setPrenom(res.data.data.nom);
        })
        .catch((err) => {
          console.error("Erreur lors de la récupération du prénom :", err);
        });
    } else {
      setIsConnected(false);
    }
  }, []);

  return (
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="grey.100" px={1}>
      <Paper elevation={3} sx={{
        width: '100%',
        maxWidth: { xs: '100%', sm: '100%' },
        borderRadius: 4,
        p: { xs: 1.5, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        minHeight: { xs: '100vh', sm: 500 },
        boxSizing: 'border-box',
      }}>
        {/* Header */}
        <Box display="flex" alignItems="center" justifyContent="space-between" mb={isMobile ? 2 : 4}>
          {/* Logo placeholder */}
          <Box sx={{ width: 48, height: 48, bgcolor: 'grey.300', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 24, color: 'grey.700' }}>
            LOGO
          </Box>
          <Typography
            variant={isMobile ? 'h5' : 'h3'}
            align="center"
            sx={{ flex: 1, fontFamily: 'Pacifico, cursive', fontSize: isMobile ? '1.5rem' : '2.5rem', letterSpacing: 2, color: 'black', textAlign: 'center' }}
          >
            PartaRoute
          </Typography>
          <IconButton
            color="primary"
            onClick={() => setDrawerOpen(true)}
            sx={{ ml: 2 }}
          >
            <MenuIcon fontSize="large" />
          </IconButton>
        </Box>
        {/* Drawer menu burger */}
        <Drawer
          anchor="right"
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
        >
          <Box sx={{ width: 250 }} role="presentation" onClick={() => setDrawerOpen(false)}>
            <List>
              {isConnected ? (
                <>
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => setOpen(true)}>
                      <ListItemIcon><AddCircleOutlineIcon color="primary" /></ListItemIcon>
                      <ListItemText primary="Créer un trajet" />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                  <ListItem disablePadding>
                    <ListItemButton onClick={() => {
                      localStorage.removeItem('accessToken');
                      localStorage.removeItem('userId');
                      localStorage.removeItem('userRole');
                      window.location.reload();
                    }}>
                      <ListItemIcon><LogoutIcon color="secondary" /></ListItemIcon>
                      <ListItemText primary="Déconnexion" />
                    </ListItemButton>
                  </ListItem>
                </>
              ) : (
                <>
                  <ListItem disablePadding>
                    <ListItemButton component="a" href="/login">
                      <ListItemText primary="Se connecter" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton component="a" href="/register">
                      <ListItemText primary="S'inscrire" />
                    </ListItemButton>
                  </ListItem>
                </>
              )}
            </List>
          </Box>
        </Drawer>
        {/* Modale création trajet */}
        <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
          <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', pr: 1 }}>
            Nouveau trajet
            <IconButton onClick={() => setOpen(false)} size="small">
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <TripForm
              onTripCreated={trip => {
                setTrips(prev => [trip, ...prev]);
                setOpen(false);
              }}
            />
          </DialogContent>
        </Dialog>
        {/* Contenu principal */}
        <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center" mt={isMobile ? 1 : 4}>
          <Typography
            variant="h5"
            align="center"
            gutterBottom
            sx={{ fontFamily: 'Pacifico, cursive', fontSize: isMobile ? '1.2rem' : '2rem', mb: 2 }}
          >
            {isConnected ? `Bienvenue, ${prenom} 👋` : 'Bienvenue sur PartaRoute !'}
          </Typography>
          <Typography variant="body2" align="center" sx={{ color: 'grey.600', mb: 2 }}>
            Voici les trajets disponibles aujourd'hui :
          </Typography>
          {loading ? (
            <CircularProgress sx={{ my: 4 }} />
          ) : error ? (
            <Typography color="error" align="center" sx={{ mb: 2 }}>{error}</Typography>
          ) : trips.length === 0 ? (
            <Typography align="center" sx={{ color: 'grey.600', mb: 2 }}>Aucun trajet disponible.</Typography>
          ) : (
            <TripCardList trips={trips} />
          )}
        </Box>
      </Paper>
    </Box>
  );
}
