import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, Stack, CircularProgress, Dialog, DialogTitle, DialogContent, IconButton, Button, useTheme, useMediaQuery, TextField } from "@mui/material";
import { Link } from "react-router-dom";
import TripCardList from "../components/TripCardList";
import TripForm from "../components/TripForm";
import CloseIcon from "@mui/icons-material/Close";
import PaginationMUI from '../components/PaginationMUI';

export default function Home() {
  const [prenom, setPrenom] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [open, setOpen] = useState(false);
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

  // MOCK DATA pour démo
  const DEMO_CONDUCTEURS = [
    {
      id_utilisateur: 1,
      nom: "Alice Martin",
      photo_profil: "https://randomuser.me/api/portraits/women/1.jpg"
    },
    {
      id_utilisateur: 2,
      nom: "Bob Dupont",
      photo_profil: "https://randomuser.me/api/portraits/men/2.jpg"
    },
    {
      id_utilisateur: 3,
      nom: "Chloé Bernard",
      photo_profil: "https://randomuser.me/api/portraits/women/3.jpg"
    },
    {
      id_utilisateur: 4,
      nom: "David Leroy",
      photo_profil: "https://randomuser.me/api/portraits/men/4.jpg"
    }
  ];
  const DEMO_VILLES = ["Paris", "Lyon", "Marseille", "Toulouse", "Nantes", "Lille", "Bordeaux", "Nice"];
  const DEMO_TRAJETS = Array.from({ length: 20 }).map((_, i) => {
    const conducteur = DEMO_CONDUCTEURS[i % 4];
    const ville_depart = DEMO_VILLES[i % DEMO_VILLES.length];
    let ville_arrivee = DEMO_VILLES[(i + 3) % DEMO_VILLES.length];
    if (ville_arrivee === ville_depart) ville_arrivee = DEMO_VILLES[(i + 4) % DEMO_VILLES.length];
    return {
      id_trajet: 1000 + i,
      conducteur_id: conducteur.id_utilisateur,
      ville_depart,
      ville_arrivee,
      date_heure_depart: new Date(Date.now() + i * 3600 * 1000).toISOString(),
      places_disponibles: 1 + (i % 5),
      prix: (10 + (i * 2.5)).toFixed(2),
      conducteur
    };
  });

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
              <TripCardList trips={trips.length === 0 ? DEMO_TRAJETS : trips} showPlacesRestantes={false} showSimple={true} />
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
