import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import {
  Box,
  Paper,
  Typography,
  TextField,
  Button,
  Stack,
} from "@mui/material";
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

//const BACKEND_URL = import.meta.env.VITE_API_URL;
const BACKEND_URL = "http://localhost:3000";

export default function Register() {
  const [formData, setFormData] = useState({ nom: "", email: "", mot_de_passe: "" });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    if (localStorage.getItem('accessToken')) {
      navigate('/');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await fetch(`${BACKEND_URL}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Erreur lors de l'inscription.");
      }
      const loginRes = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          mot_de_passe: formData.mot_de_passe,
        }),
      });
      const loginData = await loginRes.json();
      if (!loginRes.ok || !loginData.success) {
        throw new Error("Inscription réussie, mais erreur de connexion automatique.");
      }
      const token = loginData.data.accessToken;
      const decoded = jwtDecode(token);
      localStorage.setItem("accessToken", token);
      localStorage.setItem("userId", decoded.id_utilisateur);
      localStorage.setItem("userRole", decoded.role);
      navigate("/");
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <Box 
      minHeight="100vh" 
      bgcolor="#232323" 
      display="flex" 
      flexDirection="column" 
      alignItems="center" 
      justifyContent="flex-start" 
      fontFamily="'Gluten', cursive"
      sx={{
        // Desktop: Center the form and limit width
        justifyContent: { xs: 'flex-start', md: 'center' },
        px: { md: 4 }
      }}
    >
      {/* Header noir avec logo et nom */}
      <Box 
        width="100%" 
        maxWidth={{ xs: "500px", md: "400px" }} 
        bgcolor="#232323" 
        pt={{ xs: "8vw", md: "2rem" }} 
        pb={{ xs: "4vw", md: "1.5rem" }} 
        borderTopLeftRadius={0} 
        borderTopRightRadius={0} 
        display="flex" 
        flexDirection="column" 
        alignItems="center"
      >
        <Box mb={{ xs: "2vw", md: "1rem" }} width={{ xs: "40vw", md: "120px" }} maxWidth="250px">
          <img src={logoIcon} alt="Logo PartaRoute" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </Box>
      </Box>
      
      {/* Formulaire blanc arrondi */}
      <Paper elevation={3} sx={{
        width: '100%',
        maxWidth: { xs: 'none', md: '400px' },
        minHeight: { xs: '100vh', md: 'auto' },
        borderTopLeftRadius: { xs: '10vw', md: '30px' },
        borderTopRightRadius: { xs: 0, md: '30px' },
        borderBottomLeftRadius: { xs: 0, md: '30px' },
        borderBottomRightRadius: { xs: 0, md: '30px' },
        mt: 0,
        p: { xs: '6vw', md: '2rem' },
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        fontFamily: 'Gluten, cursive',
        boxSizing: 'border-box',
        backgroundColor: '#fff',
      }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ 
            fontFamily: 'Gluten, cursive', 
            fontSize: { xs: 'clamp(1.2rem, 7vw, 2.2rem)', md: '1.8rem' }, 
            mb: { xs: '6vw', md: '1.5rem' }, 
            mt: { xs: '2vw', md: '1rem' }
          }}
        >
          Inscription
        </Typography>
        <Typography 
          variant="body2" 
          align="center" 
          sx={{ 
            color: 'grey.600', 
            mb: { xs: '4vw', md: '2rem' }, 
            fontFamily: 'Gluten, cursive', 
            fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', md: '1rem' }
          }}
        >
          Crée ton compte gratuitement
        </Typography>
        {error && (
          <Typography color="error" align="center" variant="body2" sx={{ mb: { xs: '4vw', md: '1.5rem' } }}>
            {error}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit} width="100%" noValidate>
          <Stack spacing={{ xs: 3, md: 2 }}>
            <TextField
              label="Nom"
              name="nom"
              type="text"
              placeholder="Doe"
              value={formData.nom}
              onChange={handleChange}
              fullWidth
              required
              variant="standard"
              InputProps={{ 
                sx: { 
                  fontFamily: 'Gluten, cursive', 
                  fontSize: { xs: 'clamp(1rem, 4vw, 1.2rem)', md: '1rem' },
                  paddingLeft: '16px',
                  paddingRight: '8px',
                  paddingY: '4px',
                  '&:before': {
                    borderBottomColor: '#000',
                    borderBottomWidth: '2px',
                  },
                  '&:after': {
                    borderBottomColor: '#D6FFB7',
                    borderBottomWidth: '2px',
                    borderImage: 'linear-gradient(to right, #D6FFB7, #D6FFB7) 1',
                  },
                  '&:hover:not(.Mui-disabled):before': {
                    borderBottomColor: '#000',
                  },
                  '&.Mui-focused:after': {
                    borderBottomColor: '#D6FFB7',
                  },
                } 
              }}
              InputLabelProps={{ 
                sx: { 
                  fontFamily: 'Gluten, cursive', 
                  fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', md: '0.9rem' },
                  color: '#000',
                  paddingLeft: '16px',
                  '&.Mui-focused': {
                    color: '#000',
                  },
                } 
              }}
            />
            <TextField
              label="Courriel"
              name="email"
              type="email"
              placeholder="Joe.Doe@partaroute.com"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              variant="standard"
              InputProps={{ 
                sx: { 
                  fontFamily: 'Gluten, cursive', 
                  fontSize: { xs: 'clamp(1rem, 4vw, 1.2rem)', md: '1rem' },
                  paddingLeft: '16px',
                  paddingRight: '8px',
                  paddingY: '4px',
                  '&:before': {
                    borderBottomColor: '#000',
                    borderBottomWidth: '2px',
                  },
                  '&:after': {
                    borderBottomColor: '#D6FFB7',
                    borderBottomWidth: '2px',
                    borderImage: 'linear-gradient(to right, #D6FFB7, #D6FFB7) 1',
                  },
                  '&:hover:not(.Mui-disabled):before': {
                    borderBottomColor: '#000',
                  },
                  '&.Mui-focused:after': {
                    borderBottomColor: '#D6FFB7',
                  },
                } 
              }}
              InputLabelProps={{ 
                sx: { 
                  fontFamily: 'Gluten, cursive', 
                  fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', md: '0.9rem' },
                  color: '#000',
                  paddingLeft: '16px',
                  '&.Mui-focused': {
                    color: '#000',
                  },
                } 
              }}
            />
            <TextField
              label="Mot de passe"
              name="mot_de_passe"
              type="password"
              placeholder="********************"
              value={formData.mot_de_passe}
              onChange={handleChange}
              fullWidth
              required
              variant="standard"
              InputProps={{ 
                sx: { 
                  fontFamily: 'Gluten, cursive', 
                  fontSize: { xs: 'clamp(1rem, 4vw, 1.2rem)', md: '1rem' },
                  paddingLeft: '16px',
                  paddingRight: '8px',
                  paddingY: '4px',
                  '&:before': {
                    borderBottomColor: '#000',
                    borderBottomWidth: '2px',
                  },
                  '&:after': {
                    borderBottomColor: '#D6FFB7',
                    borderBottomWidth: '2px',
                    borderImage: 'linear-gradient(to right, #D6FFB7, #D6FFB7) 1',
                  },
                  '&:hover:not(.Mui-disabled):before': {
                    borderBottomColor: '#000',
                  },
                  '&.Mui-focused:after': {
                    borderBottomColor: '#D6FFB7',
                  },
                } 
              }}
              InputLabelProps={{ 
                sx: { 
                  fontFamily: 'Gluten, cursive', 
                  fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', md: '0.9rem' },
                  color: '#000',
                  paddingLeft: '16px',
                  '&.Mui-focused': {
                    color: '#000',
                  },
                } 
              }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: { xs: '2vw', md: '1.5rem' },
                bgcolor: '#232323',
                color: 'white',
                borderRadius: '999px',
                fontWeight: 'bold',
                fontSize: { xs: 'clamp(0.9rem, 4vw, 1.1rem)', md: '1rem' },
                fontFamily: 'Gluten, cursive',
                py: { xs: '2.5vw', md: '0.8rem' },
                px: { xs: '8vw', md: '2rem' },
                maxWidth: { xs: '300px', md: 'none' },
                width: { xs: '80%', md: '100%' },
                alignSelf: 'center',
                whiteSpace: 'nowrap',
                '&:hover': {
                  bgcolor: '#333',
                },
              }}
            >
              REJOINDRE PARTAROUTE
            </Button>
          </Stack>
        </Box>
        <Typography 
          variant="body2" 
          align="center" 
          sx={{ 
            mt: { xs: '6vw', md: '2rem' }, 
            color: 'grey.800', 
            fontFamily: 'Gluten, cursive', 
            fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', md: '0.9rem' }
          }}
        >
          Déjà un compte ?{' '}
          <Link to="/login" style={{ fontWeight: 'bold', color: 'inherit', textDecoration: 'none' }}>Se connecter</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
