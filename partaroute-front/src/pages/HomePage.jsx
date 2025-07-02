import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, Stack, CircularProgress, Dialog, DialogTitle, DialogContent, IconButton, Button, useTheme, useMediaQuery, TextField } from "@mui/material";
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
import PaginationMUI from '../components/PaginationMUI';

export default function Home() {
  const [prenom, setPrenom] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [villeDepart, setVilleDepart] = useState("");
  const [villeArrivee, setVilleArrivee] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    setLoading(true);
    let url = `http://localhost:3000/api/trips?page=${page}&limit=${limit}`;
    if (villeDepart) url += `&ville_depart=${encodeURIComponent(villeDepart)}`;
    if (villeArrivee) url += `&ville_arrivee=${encodeURIComponent(villeArrivee)}`;
    axios
      .get(url)
      .then((res) => {
        let tripsArr = [];
        let totalCount = 0;
        if (Array.isArray(res.data)) {
          tripsArr = res.data;
        } else if (Array.isArray(res.data.data)) {
          tripsArr = res.data.data;
          totalCount = res.data.total || 0;
        } else if (res.data.trips && Array.isArray(res.data.trips)) {
          tripsArr = res.data.trips;
        }
        setTrips(tripsArr);
        setTotal(totalCount);
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
  }, [page, limit, villeDepart, villeArrivee]);

  const handleSearch = (e) => {
    e.preventDefault();
    // Les useEffect se déclenchent automatiquement
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  return (
    <Box minHeight="100vh" display="flex" alignItems="stretch" justifyContent="flex-start" bgcolor="grey.100" px={1}>
      <Paper elevation={3} sx={{
        width: '100%',
        maxWidth: { xs: '100%', sm: '100%' },
        borderRadius: 4,
        p: { xs: 1.5, sm: 3 },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'stretch',
        minHeight: 'calc(100vh - 64px)',
        boxSizing: 'border-box',
      }}>
        {/* Header */}
        {/* (Supprimé : logo et titre, maintenant dans la navbar globale) */}
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
        <Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="flex-start" mt={isMobile ? 1 : 4}>
          <form onSubmit={handleSearch} style={{ width: '100%', maxWidth: 600, marginBottom: 24 }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="center" justifyContent="center">
              <TextField
                label="Ville de départ"
                variant="outlined"
                size="small"
                value={villeDepart}
                onChange={e => setVilleDepart(e.target.value)}
                fullWidth
              />
              <TextField
                label="Ville d'arrivée"
                variant="outlined"
                size="small"
                value={villeArrivee}
                onChange={e => setVilleArrivee(e.target.value)}
                fullWidth
              />
              <Button type="submit" variant="contained" color="primary" sx={{ minWidth: 120, height: 40 }}>
                Rechercher
              </Button>
            </Stack>
          </form>
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
            <>
              <TripCardList trips={trips} />
              <PaginationMUI
                page={page}
                count={Math.ceil(total / limit) || 1}
                onChange={handlePageChange}
                limit={limit}
                onLimitChange={handleLimitChange}
              />
            </>
          )}
        </Box>
      </Paper>
    </Box>
  );
}
