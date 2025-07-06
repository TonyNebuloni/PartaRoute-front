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

const BACKEND_URL = "http://localhost:3000";

export default function Login() {
  const [formData, setFormData] = useState({ email: "", mot_de_passe: "" });
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
      const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.message || "Erreur lors de la connexion.");
      }
      const token = data.data.accessToken;
      const decoded = jwtDecode(token);
      localStorage.setItem("accessToken", token);
      localStorage.setItem("userId", decoded.id_utilisateur);
      localStorage.setItem("userRole", decoded.role);
      const redirect = localStorage.getItem('redirectAfterLogin');
      if (redirect) {
        localStorage.removeItem('redirectAfterLogin');
        navigate(redirect);
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(err);
      setError(err.message);
    }
  };

  return (
    <Box minHeight="100vh" bgcolor="#232323" display="flex" flexDirection="column" alignItems="center" justifyContent="flex-start" fontFamily="'Gluten', cursive">
      {/* Header noir avec logo et nom */}
      <Box width="100%" maxWidth="500px" bgcolor="#232323" pt="8vw" pb="4vw" borderTopLeftRadius={0} borderTopRightRadius={0} display="flex" flexDirection="column" alignItems="center">
        <Box mb="2vw" width="40vw" maxWidth="250px">
          <img src={logoIcon} alt="Logo PartaRoute" style={{ width: '100%', height: 'auto', display: 'block' }} />
        </Box>
      </Box>
      {/* Formulaire blanc arrondi */}
      <Paper elevation={3} sx={{
        width: '100%',
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
      }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontFamily: 'Gluten, cursive', fontSize: 'clamp(1.2rem, 7vw, 2.2rem)', mb: '6vw', mt: '2vw' }}
        >
          Connexion
        </Typography>
        <Typography variant="body2" align="center" sx={{ color: 'grey.600', mb: '4vw', fontFamily: 'Gluten, cursive', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
          Connecte-toi à ton compte
        </Typography>
        {error && (
          <Typography color="error" align="center" variant="body2" sx={{ mb: '4vw' }}>
            {error}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit} width="100%" noValidate>
          <Stack spacing={3}>
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
                  fontSize: 'clamp(1rem, 4vw, 1.2rem)',
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
                  fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
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
                  fontSize: 'clamp(1rem, 4vw, 1.2rem)',
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
                  fontSize: 'clamp(0.9rem, 3vw, 1.1rem)',
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
                mt: '2vw',
                bgcolor: '#232323',
                color: 'white',
                borderRadius: '999px',
                fontWeight: 'bold',
                fontSize: 'clamp(0.9rem, 4vw, 1.1rem)',
                fontFamily: 'Gluten, cursive',
                py: '2.5vw',
                px: '8vw',
                maxWidth: '300px',
                width: '80%',
                alignSelf: 'center',
                '&:hover': {
                  bgcolor: '#333',
                },
              }}
            >
              SE CONNECTER
            </Button>
          </Stack>
        </Box>
        <Typography variant="body2" align="center" sx={{ mt: '6vw', color: 'grey.800', fontFamily: 'Gluten, cursive', fontSize: 'clamp(0.9rem, 3vw, 1.1rem)' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ fontWeight: 'bold', color: 'inherit', textDecoration: 'none' }}>Inscription</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
