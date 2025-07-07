import { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Box, Typography, Paper, Stack, CircularProgress, Dialog, DialogTitle, DialogContent, IconButton, Button, useTheme, useMediaQuery, TextField, Card, CardContent, List, ListItem, ListItemText } from "@mui/material";
import { Link, useNavigate } from "react-router-dom";
import TripCardList from "../components/TripCardList";
import TripForm from "../components/TripForm";
import CloseIcon from "@mui/icons-material/Close";
import AdminPanelSettingsIcon from "@mui/icons-material/AdminPanelSettings";
import CustomPagination from '../components/CustomPagination';
import imgCannes from '../assets/img_cannes.jpg';
import imgAntibes from '../assets/img_antibes.jpg';

const BACKEND_URL = import.meta.env.VITE_API_URL;

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
  const [userName, setUserName] = useState('');
  const [currentCity, setCurrentCity] = useState('Paris');
  const [cityDialogOpen, setCityDialogOpen] = useState(false);
  const [availableCities, setAvailableCities] = useState([]);
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Fonction pour faire la recherche avec debounce
  const performSearch = (departValue, arriveeValue) => {
    setLoading(true);
    let url = `${BACKEND_URL}/api/trips?page=${page}&limit=${limit}`;
    if (departValue) url += `&ville_depart=${encodeURIComponent(departValue)}`;
    if (arriveeValue) url += `&ville_arrivee=${encodeURIComponent(arriveeValue)}`;
    
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
        
        // Trier les trajets : ceux de la ville sélectionnée en premier
        const sortedTrips = tripsArr.sort((a, b) => {
          const aFromSelected = a.ville_depart?.toLowerCase() === currentCity.toLowerCase();
          const bFromSelected = b.ville_depart?.toLowerCase() === currentCity.toLowerCase();
          
          if (aFromSelected && !bFromSelected) return -1;
          if (!aFromSelected && bFromSelected) return 1;
          return 0;
        });
        
        setTrips(sortedTrips);
        setTotal(totalCount);
        setLoading(false);
        
        // Extraire les villes disponibles depuis les vraies données
        const cities = [...new Set(tripsArr.map(trip => trip.ville_depart))];
        setAvailableCities(cities);
      })
      .catch((err) => {
        setError("Erreur lors de la récupération des trajets.");
        setLoading(false);
      });
  };

  // Fonction pour gérer le debounce
  const handleSearchWithDebounce = (departValue, arriveeValue) => {
    // Annuler le timeout précédent s'il existe
    if (searchTimeout) {
      clearTimeout(searchTimeout);
    }

    // Créer un nouveau timeout
    const newTimeout = setTimeout(() => {
      performSearch(departValue, arriveeValue);
    }, 500); // Attendre 500ms après que l'utilisateur arrête de taper

    setSearchTimeout(newTimeout);
  };

  useEffect(() => {
    // Chargement initial et changements de page/limite
    performSearch(villeDepart, villeArrivee);

    // Fetch user uniquement si connecté
    const token = localStorage.getItem("accessToken");
    const id = localStorage.getItem("userId");
    const userRole = localStorage.getItem("userRole");
    
    if (token && id) {
      setIsConnected(true);
      setIsAdmin(userRole === 'admin');
      
      axios
        .get(`${BACKEND_URL}/api/user/${id}`, {
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
      setIsAdmin(false);
    }

    // Récupérer le nom de l'utilisateur depuis le localStorage ou l'API
    const storedUserName = localStorage.getItem('userName');
    if (storedUserName) {
      setUserName(storedUserName);
    } else {
      // Si pas de nom stocké, on peut faire un appel API pour récupérer les infos utilisateur
      const userId = localStorage.getItem('userId');
      const token = localStorage.getItem('accessToken');
      
      if (userId && token) {
        // Ici on pourrait faire un appel API pour récupérer le nom
        // Pour l'instant, on utilise un nom par défaut
        setUserName('Utilisateur');
      }
    }

    // Nettoyer le timeout au démontage du composant
    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
    };
  }, [page, limit, currentCity]); // Retiré villeDepart et villeArrivee des dépendances

  // Gestionnaires pour les changements de valeurs avec debounce
  const handleVilleDepartChange = (e) => {
    const newValue = e.target.value;
    setVilleDepart(newValue);
    handleSearchWithDebounce(newValue, villeArrivee);
  };

  const handleVilleArriveeChange = (e) => {
    const newValue = e.target.value;
    setVilleArrivee(newValue);
    handleSearchWithDebounce(villeDepart, newValue);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    // Recherche immédiate lors de la soumission du formulaire
    performSearch(villeDepart, villeArrivee);
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
  };
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
  };

  const handleCityChange = () => {
    setCityDialogOpen(true);
  };

  const handleCitySelect = (city) => {
    console.log('City selected:', city, 'Previous city:', currentCity);
    setCurrentCity(city);
    setCityDialogOpen(false);
    // Forcer le rechargement des trajets avec la nouvelle ville
    setLoading(true);
    setTimeout(() => setLoading(false), 100); // Petit délai pour voir le changement
  };

  const handleTripDetails = (tripId) => {
    navigate(`/trajet/${tripId}`);
  };

  // Fonction pour le défilement tactile
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    scrollRef.current.startX = touch.clientX;
  };

  const handleTouchMove = (e) => {
    if (!scrollRef.current.startX) return;
    
    const touch = e.touches[0];
    const diff = scrollRef.current.startX - touch.clientX;
    
    if (Math.abs(diff) > 10) {
      scrollRef.current.scrollLeft += diff * 0.5;
      scrollRef.current.startX = touch.clientX;
    }
  };

  const handleTouchEnd = () => {
    scrollRef.current.startX = null;
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fff', fontFamily: 'Gluten, cursive' }}>
      {/* Section grise du haut */}
      <Box 
        sx={{ 
          bgcolor: '#232323', 
          color: 'white',
          position: 'relative',
          pb: { xs: '20vw', md: '80px' },
          borderBottomLeftRadius: '30px',
          borderBottomRightRadius: '30px',
        }}
      >
        {/* Header avec salutation et icône admin */}
        <Box sx={{ p: { xs: '6vw', md: '2rem 4rem' }, pt: { xs: '12vw', md: '2.5rem' }, position: 'relative' }}>
          {/* Icône admin en haut à droite */}
          {isAdmin && (
            <IconButton
              onClick={() => navigate('/admin')}
              sx={{
                position: 'absolute',
                top: { xs: '6vw', md: '1.5rem' },
                right: { xs: '6vw', md: '4rem' },
                bgcolor: 'rgba(214, 255, 183, 0.1)',
                color: '#D6FFB7',
                border: '2px solid #D6FFB7',
                width: { xs: 'clamp(40px, 10vw, 50px)', md: '48px' },
                height: { xs: 'clamp(40px, 10vw, 50px)', md: '48px' },
                '&:hover': {
                  bgcolor: '#D6FFB7',
                  color: '#232323',
                  transform: 'scale(1.05)',
                  transition: 'all 0.3s ease'
                },
              }}
            >
              <AdminPanelSettingsIcon sx={{ fontSize: { xs: 'clamp(20px, 5vw, 24px)', md: '24px' } }} />
            </IconButton>
          )}
          
          <Typography 
            variant="h4" 
            sx={{ 
              fontFamily: 'Gluten, cursive',
              fontSize: { xs: 'clamp(1.5rem, 8vw, 2.5rem)', md: '2rem' },
              fontWeight: 400,
              mb: { xs: '2vw', md: '0.5rem' },
              color: '#D6FFB7',
              pr: { xs: isAdmin ? '15vw' : 0, md: isAdmin ? '60px' : 0 }
            }}
          >
            Salut, {prenom || userName || 'Utilisateur'}
          </Typography>
          <Typography 
            variant="h5" 
            sx={{ 
              fontFamily: 'Gluten, cursive',
              fontSize: { xs: 'clamp(1.2rem, 6vw, 2rem)', md: '1.4rem' },
              fontWeight: 400,
              color: 'white',
              mb: { xs: '8vw', md: '2rem' }
            }}
          >
            Où voudrait tu aller aujourd'hui ?
          </Typography>
        </Box>

        {/* Section de recherche avec image - positionnée absolument pour chevaucher */}
        <Box sx={{ 
          px: { xs: '6vw', md: '4rem' }, 
          position: 'absolute', 
          bottom: { xs: '-100px', md: '-80px' },
          left: 0,
          right: 0,
          zIndex: 10 
        }}>
          <Card 
            sx={{
              borderRadius: '20px',
              overflow: 'hidden',
              position: 'relative',
              height: { xs: '200px', md: '180px' },
              backgroundImage: `url(${imgCannes})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              maxWidth: { md: '1000px' },
              margin: { md: '0 auto' }
            }}
          >
            <Box 
              sx={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                background: 'linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.1) 100%)',
        display: 'flex',
        flexDirection: 'column',
                justifyContent: 'space-between',
                p: { xs: '5vw', md: '2rem' },
              }}
            >
              {/* Header de la carte */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <Box>
                  <Typography 
                    sx={{ 
                      fontFamily: 'Gluten, cursive',
                      fontSize: { xs: 'clamp(0.9rem, 4vw, 1.1rem)', md: '1rem' },
                      color: 'white',
                      opacity: 0.9,
                      mb: { xs: '1vw', md: '0.5rem' }
                    }}
                  >
                    Co-voiturage le plus proche
                  </Typography>
                  <Typography 
                    sx={{ 
                      fontFamily: 'Gluten, cursive',
                      fontSize: { xs: 'clamp(1.5rem, 7vw, 2.2rem)', md: '2rem' },
                      color: 'white',
                      fontWeight: 600,
                    }}
                  >
                    {currentCity}
                  </Typography>
                </Box>
                <Button
                  onClick={handleCityChange}
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.9)',
                    color: '#222',
                    borderRadius: '20px',
                    px: { xs: '4vw', md: '1.5rem' },
                    py: { xs: '1vw', md: '0.6rem' },
                    fontSize: { xs: 'clamp(0.6rem, 2vw, 0.75rem)', md: '0.9rem' },
                    fontFamily: 'Gluten, cursive',
                    fontWeight: 500,
                    textTransform: 'none',
                    minWidth: { xs: '120px', md: '140px' },
                    height: { xs: '30px', md: '36px' },
                    whiteSpace: 'nowrap',
                    '&:hover': {
                      bgcolor: 'rgba(255,255,255,1)',
                    }
                  }}
                >
                  Changer de ville
                </Button>
              </Box>

              {/* Champs de recherche fonctionnels */}
              <Box component="form" onSubmit={handleSearch} sx={{ display: 'flex', gap: { xs: '3vw', md: '1.5rem' } }}>
                <Box 
                  sx={{
                    flex: 1,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    borderRadius: '15px',
                    p: { xs: '2vw', md: '1rem' },
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: '1.5vw', md: '1rem' },
                    cursor: 'pointer'
                  }}
                  onClick={() => document.getElementById('ville-depart').focus()}
                >
                  <Box 
                    sx={{
                      width: { xs: '5vw', md: '28px' },
                      height: { xs: '5vw', md: '28px' },
                      bgcolor: '#232323',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '20px',
                      minHeight: '20px',
                      maxWidth: { xs: '24px', md: '28px' },
                      maxHeight: { xs: '24px', md: '28px' },
                    }}
                  >
                    <Typography sx={{ color: 'white', fontSize: { xs: 'clamp(0.6rem, 2vw, 0.8rem)', md: '0.9rem' }, fontWeight: 'bold' }}>A</Typography>
                  </Box>
                  <TextField
                    id="ville-depart"
                    placeholder="Ville de départ"
                    value={villeDepart}
                    onChange={handleVilleDepartChange}
                    variant="standard"
                    sx={{
                      flex: 1,
                      '& .MuiInput-underline:before': { display: 'none' },
                      '& .MuiInput-underline:after': { display: 'none' },
                      '& .MuiInputBase-input': {
                        fontFamily: 'Gluten, cursive',
                        fontSize: { xs: 'clamp(0.7rem, 3vw, 0.9rem)', md: '1rem' },
                        color: '#222',
                        fontWeight: 500,
                        padding: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                      '& .MuiInputBase-input::placeholder': {
                        fontFamily: 'Gluten, cursive',
                        color: '#222',
                        opacity: 1,
                        fontSize: { xs: 'clamp(0.7rem, 3vw, 0.9rem)', md: '1rem' },
                      }
                    }}
                  />
                </Box>
                <Box 
                  sx={{
                    flex: 1,
                    bgcolor: 'rgba(255,255,255,0.95)',
                    borderRadius: '15px',
                    p: { xs: '2vw', md: '1rem' },
                    display: 'flex',
                    alignItems: 'center',
                    gap: { xs: '1.5vw', md: '1rem' },
                    cursor: 'pointer'
                  }}
                  onClick={() => document.getElementById('ville-arrivee').focus()}
                >
                  <Box 
                    sx={{
                      width: { xs: '5vw', md: '28px' },
                      height: { xs: '5vw', md: '28px' },
                      bgcolor: '#232323',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: '20px',
                      minHeight: '20px',
                      maxWidth: { xs: '24px', md: '28px' },
                      maxHeight: { xs: '24px', md: '28px' },
                    }}
                  >
                    <Typography sx={{ color: 'white', fontSize: { xs: 'clamp(0.6rem, 2vw, 0.8rem)', md: '0.9rem' }, fontWeight: 'bold' }}>B</Typography>
                  </Box>
                  <TextField
                    id="ville-arrivee"
                    placeholder="Ville d'arrivée"
                    value={villeArrivee}
                    onChange={handleVilleArriveeChange}
                    variant="standard"
                    sx={{
                      flex: 1,
                      '& .MuiInput-underline:before': { display: 'none' },
                      '& .MuiInput-underline:after': { display: 'none' },
                      '& .MuiInputBase-input': {
                        fontFamily: 'Gluten, cursive',
                        fontSize: { xs: 'clamp(0.7rem, 3vw, 0.9rem)', md: '1rem' },
                        color: '#222',
                        fontWeight: 500,
                        padding: 0,
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      },
                      '& .MuiInputBase-input::placeholder': {
                        fontFamily: 'Gluten, cursive',
                        color: '#222',
                        opacity: 1,
                        fontSize: { xs: 'clamp(0.7rem, 3vw, 0.9rem)', md: '1rem' },
                      }
                    }}
                  />
                </Box>
              </Box>
            </Box>
          </Card>
        </Box>
      </Box>

      {/* Section inférieure blanche */}
      <Box sx={{ 
        bgcolor: 'white', 
        pt: { xs: '120px', md: '100px' }, 
        px: { xs: '6vw', md: '4rem' },
        pb: { xs: 8, sm: 10, md: 12 }
      }}>
        <Typography 
          variant="h6" 
          sx={{ 
            fontFamily: 'Gluten, cursive',
            fontSize: { xs: 'clamp(1.1rem, 5vw, 1.5rem)', md: '1.3rem' },
            fontWeight: 600,
            color: '#222',
            mb: { xs: '4vw', md: '1.5rem' },
            maxWidth: { md: '1000px' },
            margin: { md: '0 auto' },
            marginBottom: { xs: '4vw', md: '1.5rem' }
          }}
        >
          Trajets disponible aujourd'hui :
        </Typography>

        {/* État de chargement */}
        {loading && (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
            <CircularProgress sx={{ color: '#D6FFB7' }} />
          </Box>
        )}

        {/* État d'erreur */}
        {error && (
          <Typography 
            sx={{ 
              fontFamily: 'Gluten, cursive',
              color: '#D6FFB7',
              textAlign: 'center',
              mb: 4
            }}
          >
            {error}
          </Typography>
        )}

        {/* Aucun trajet */}
        {!loading && !error && (trips.length === 0) && (
          <Typography 
            sx={{ 
              fontFamily: 'Gluten, cursive',
              color: '#222',
              textAlign: 'center',
              opacity: 0.7,
              mb: 4
            }}
          >
            Aucun trajet disponible.
          </Typography>
        )}

        {/* Container des cartes avec défilement */}
        {!loading && !error && (
          <Box 
            key={currentCity}
            ref={scrollRef}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            sx={{
              // Mobile: scroll horizontal
              display: { xs: 'flex', md: 'grid' },
              gridTemplateColumns: { md: 'repeat(5, 1fr)' },
              gap: { xs: '4vw', md: '1.5rem' },
              overflowX: { xs: 'auto', md: 'visible' },
              scrollBehavior: 'smooth',
              pb: { xs: '2vw', md: '1rem' },
              mb: { xs: 4, sm: 6, md: 8 },
              maxWidth: { xs: 'none', md: '100%' },
              margin: { md: '0' },
              marginBottom: { xs: 4, sm: 6, md: 8 },
              px: { md: 0 },
              '&::-webkit-scrollbar': {
                display: { xs: 'none', md: 'auto' },
              },
              scrollbarWidth: { xs: 'none', md: 'auto' },
            }}
          >
            {(() => {
              // Utiliser les vraies données de l'API maintenant qu'elles contiennent des villes françaises
              const tripsToShow = trips.length > 0 ? trips : [];
              
              console.log('Using real API data with French cities');
              console.log('API trips:', tripsToShow.map(t => `${t.ville_depart} -> ${t.ville_arrivee}`));
              console.log('Current selected city:', currentCity);
              
              // Liste des villes françaises pour le tri
              const frenchCities = [
                'Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 
                'Montpellier', 'Strasbourg', 'Bordeaux', 'Lille', 'Rennes', 
                'Reims', 'Saint-Étienne', 'Toulon', 'Le Havre', 'Grenoble',
                'Dijon', 'Angers', 'Nîmes', 'Villeurbanne', 'Clermont-Ferrand',
                'Aix-en-Provence', 'Brest', 'Tours', 'Amiens', 'Limoges',
                'Annecy', 'Perpignan', 'Boulogne-Billancourt', 'Orléans',
                'Mulhouse', 'Rouen', 'Caen', 'Nancy', 'Argenteuil',
                'Cannes', 'Antibes', 'Monaco', 'Grasse'
              ];
              
              // Trier avec priorité : ville sélectionnée > Paris > autres villes françaises > autres villes
              const sortedTrips = tripsToShow.sort((a, b) => {
                const aFromSelected = a.ville_depart?.toLowerCase() === currentCity.toLowerCase();
                const bFromSelected = b.ville_depart?.toLowerCase() === currentCity.toLowerCase();
                const aFromParis = a.ville_depart?.toLowerCase() === 'paris';
                const bFromParis = b.ville_depart?.toLowerCase() === 'paris';
                const aFromFrench = frenchCities.some(city => city.toLowerCase() === a.ville_depart?.toLowerCase());
                const bFromFrench = frenchCities.some(city => city.toLowerCase() === b.ville_depart?.toLowerCase());
                
                // 1. Ville sélectionnée en PREMIER (priorité absolue)
                if (aFromSelected && !bFromSelected) return -1;
                if (!aFromSelected && bFromSelected) return 1;
                
                // 2. Si aucun des deux n'est de la ville sélectionnée, alors Paris en second
                if (!aFromSelected && !bFromSelected) {
                  if (aFromParis && !bFromParis) return -1;
                  if (!aFromParis && bFromParis) return 1;
                }
                
                // 3. Puis autres villes françaises
                if (!aFromSelected && !bFromSelected && !aFromParis && !bFromParis) {
                  if (aFromFrench && !bFromFrench) return -1;
                  if (!aFromFrench && bFromFrench) return 1;
                }
                
                return 0;
              });
              
              console.log('Trips before sorting:', tripsToShow.map(t => `${t.ville_depart} -> ${t.ville_arrivee}`));
              console.log('Trips after sorting:', sortedTrips.map(t => `${t.ville_depart} -> ${t.ville_arrivee}`));
              console.log('Current city:', currentCity);
              
              return sortedTrips.map((trip) => (
                <Card 
                  key={trip.id_trajet}
                  sx={{
                    minWidth: { xs: '280px', md: 'auto' },
                    width: { xs: '70vw', md: '100%' },
                    maxWidth: { xs: '320px', md: 'none' },
                    borderRadius: '20px',
                    overflow: 'hidden',
                    position: 'relative',
                    height: { xs: '350px', md: '300px' },
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    }
                  }}
                  onClick={() => handleTripDetails(trip.id_trajet)}
                >
                  <Box 
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      backgroundImage: `url(${trip.ville_depart && trip.ville_depart.toLowerCase().includes('cannes') ? imgCannes : imgAntibes})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    }}
                  />
                  <Box 
                    sx={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      background: 'linear-gradient(180deg, rgba(0,0,0,0.1) 0%, rgba(0,0,0,0.7) 100%)',
                    }}
                  />
                  
                  {/* Badge "COMPLET" si places_disponibles === 0 */}
                  {trip.places_disponibles === 0 && (
                    <Box
                      sx={{
                        position: 'absolute',
                        top: '15px',
                        right: '15px',
                        bgcolor: '#ff4444',
                        color: 'white',
                        px: { xs: '8px', md: '10px' },
                        py: { xs: '4px', md: '5px' },
                        borderRadius: '12px',
                        fontSize: { xs: 'clamp(0.6rem, 2.5vw, 0.8rem)', md: '0.8rem' },
                        fontFamily: 'Gluten, cursive',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                        zIndex: 10,
                        boxShadow: '0 2px 8px rgba(0,0,0,0.3)',
                      }}
                    >
                      COMPLET
                    </Box>
                  )}
                  
                  <CardContent 
                    sx={{
                      position: 'absolute',
                      bottom: 0,
                      left: 0,
                      right: 0,
                      color: 'white',
                      p: { xs: '5vw', md: '1rem' },
                    }}
                  >
                    <Typography 
                      sx={{ 
                        fontFamily: 'Gluten, cursive',
                        fontSize: { xs: 'clamp(1.2rem, 6vw, 1.8rem)', md: '1.1rem' },
                        fontWeight: 600,
                        mb: { xs: '2vw', md: '0.8rem' }
                      }}
                    >
                      {trip.ville_depart} → {trip.ville_arrivee}
                    </Typography>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: { xs: '1vw', md: '0.3rem' } }}>
                        <Typography 
                          sx={{ 
                            fontFamily: 'Gluten, cursive',
                            fontSize: { xs: 'clamp(1rem, 5vw, 1.4rem)', md: '1.1rem' },
                            fontWeight: 600,
                          }}
                        >
                          {trip.prix}
                        </Typography>
                        <Typography 
                          sx={{ 
                            fontFamily: 'Gluten, cursive',
                            fontSize: { xs: 'clamp(0.8rem, 3vw, 1rem)', md: '0.9rem' },
                            opacity: 0.8,
                          }}
                        >
                          €
                        </Typography>
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                        <Typography 
                          sx={{ 
                            fontFamily: 'Gluten, cursive',
                            fontSize: { xs: 'clamp(0.9rem, 4vw, 1.1rem)', md: '0.8rem' },
                            opacity: 0.9,
                            textDecoration: 'underline',
                          }}
                        >
                          plus de détails ?
                        </Typography>
                        {trip.places_disponibles > 0 && (
                          <Typography 
                            sx={{ 
                              fontFamily: 'Gluten, cursive',
                              fontSize: { xs: 'clamp(0.7rem, 3vw, 0.9rem)', md: '0.7rem' },
                              opacity: 0.8,
                              mt: { xs: '0.5vw', md: '0.2rem' },
                            }}
                          >
                            {trip.places_disponibles} place{trip.places_disponibles > 1 ? 's' : ''} restante{trip.places_disponibles > 1 ? 's' : ''}
                          </Typography>
                        )}
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              ));
            })()}
          </Box>
        )}

        {/* Pagination custom sous la liste des trajets */}
        {!loading && !error && total > 0 && (
          <CustomPagination
            page={page}
            count={Math.max(1, Math.ceil(total / limit))}
            onChange={setPage}
            limit={limit}
            onLimitChange={handleLimitChange}
          />
        )}
      </Box>

      {/* Dialog de sélection de ville */}
      <Dialog 
        open={cityDialogOpen} 
        onClose={() => setCityDialogOpen(false)}
        maxWidth="xs" 
        fullWidth
      >
        <DialogTitle sx={{ 
          fontFamily: 'Gluten, cursive',
          textAlign: 'center',
          bgcolor: '#232323',
          color: 'white'
        }}>
          Choisir une ville
        </DialogTitle>
        <DialogContent sx={{ p: 0 }}>
          <List>
            {(() => {
              // Utiliser les villes disponibles depuis l'API + quelques villes françaises populaires
              const apiCities = availableCities.length > 0 ? availableCities : [];
              const popularFrenchCities = ['Paris', 'Lyon', 'Marseille', 'Toulouse', 'Nice', 'Nantes', 'Bordeaux', 'Lille', 'Montpellier', 'Strasbourg', 'Cannes', 'Antibes'];
              
              // Combiner les villes de l'API avec les villes populaires, en évitant les doublons
              const allCities = [...new Set([...apiCities, ...popularFrenchCities])].sort();
              
              console.log('City selector: Using API cities + popular French cities');
              console.log('Available cities:', allCities);

              return allCities.map((city) => (
                <ListItem 
                  key={city}
                  button
                  onClick={() => handleCitySelect(city)}
                  sx={{
                    '&:hover': {
                      bgcolor: '#D6FFB7',
                    }
                  }}
                >
                  <ListItemText 
                    primary={city}
                    sx={{
                      '& .MuiTypography-root': {
                        fontFamily: 'Gluten, cursive',
                        fontSize: '1.1rem',
                      }
                    }}
                  />
                </ListItem>
              ));
            })()}
          </List>
        </DialogContent>
      </Dialog>

      {/* Modale création trajet */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between', 
          pr: 1,
          fontFamily: 'Gluten, cursive'
        }}>
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
    </Box>
  );
}
