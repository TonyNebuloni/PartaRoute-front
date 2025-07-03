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

const BACKEND_URL = import.meta.env.VITE_API_URL;

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
    <Box minHeight="100vh" display="flex" alignItems="center" justifyContent="center" bgcolor="grey.100" px={1}>
      <Paper elevation={3} sx={{ width: '100%', maxWidth: 400, borderTopLeftRadius: 24, borderTopRightRadius: 24, p: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography
          variant="h3"
          align="center"
          gutterBottom
          sx={{ fontFamily: 'Pacifico, cursive', fontSize: '2rem', mb: 3 }}
        >
          Connexion
        </Typography>
        <Typography variant="body2" align="center" sx={{ color: 'grey.600', mb: 2 }}>
          Connecte-toi à ton compte
        </Typography>
        {error && (
          <Typography color="error" align="center" variant="body2" sx={{ mb: 2 }}>
            {error}
          </Typography>
        )}
        <Box component="form" onSubmit={handleSubmit} width="100%" noValidate>
          <Stack spacing={2}>
            <TextField
              label="Courriel"
              name="email"
              type="email"
              placeholder="Joe.Doe@partaroute.com"
              value={formData.email}
              onChange={handleChange}
              fullWidth
              required
              InputProps={{ sx: { borderBottomLeftRadius: 16, borderRadius: 0 } }}
            />
            <TextField
              label="Mot de passe"
              name="mot_de_passe"
              type="password"
              placeholder="Mot de passe"
              value={formData.mot_de_passe}
              onChange={handleChange}
              fullWidth
              required
              InputProps={{ sx: { borderBottomLeftRadius: 16, borderRadius: 0 } }}
            />
            <Button
              type="submit"
              variant="contained"
              fullWidth
              sx={{
                mt: 1,
                bgcolor: 'black',
                color: 'white',
                borderRadius: 999,
                fontWeight: 'bold',
                py: 1.5,
                fontSize: '1rem',
                letterSpacing: 1,
                boxShadow: 2,
                '&:active': { transform: 'scale(0.97)' },
                '&:hover': { bgcolor: '#222' },
              }}
            >
              Connexion
            </Button>
          </Stack>
        </Box>
        <Typography variant="body2" align="center" sx={{ mt: 3, color: 'grey.800' }}>
          Pas encore de compte ?{' '}
          <Link to="/register" style={{ fontWeight: 'bold', color: 'inherit', textDecoration: 'none' }}>Inscription</Link>
        </Typography>
      </Paper>
    </Box>
  );
}
