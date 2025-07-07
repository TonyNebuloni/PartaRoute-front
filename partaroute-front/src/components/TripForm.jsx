import { useState } from "react";
import { Box, TextField, Button, Typography, Stack } from "@mui/material";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function TripForm({ onTripCreated }) {
  const [form, setForm] = useState({
    ville_depart: "",
    ville_arrivee: "",
    date_heure_depart: "",
    places_disponibles: 1,
    prix: 0,
    conditions: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.post(
        `${BACKEND_URL}/api/trips`,
        {
          ...form,
          places_disponibles: Number(form.places_disponibles),
          prix: Number(form.prix),
          conditions: form.conditions ? { note: form.conditions } : undefined
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      setSuccess("Trajet créé avec succès !");
      setForm({
        ville_depart: "",
        ville_arrivee: "",
        date_heure_depart: "",
        places_disponibles: 1,
        prix: 0,
        conditions: ""
      });
      if (onTripCreated) onTripCreated(res.data.data || res.data);
      window.dispatchEvent(new Event('trajetCreated'));
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création du trajet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 2 }}>
      <Stack spacing={3}>
        <TextField
          label="Ville de départ"
          name="ville_depart"
          value={form.ville_depart}
          onChange={handleChange}
          required
          fullWidth
          sx={{
            fontFamily: 'Gluten, cursive',
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
                color: '#232323',
              },
            },
          }}
        />
        <TextField
          label="Ville d'arrivée"
          name="ville_arrivee"
          value={form.ville_arrivee}
          onChange={handleChange}
          required
          fullWidth
          sx={{
            fontFamily: 'Gluten, cursive',
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
                color: '#232323',
              },
            },
          }}
        />
        <TextField
          label="Date et heure de départ"
          name="date_heure_depart"
          type="datetime-local"
          value={form.date_heure_depart}
          onChange={handleChange}
          required
          fullWidth
          InputLabelProps={{ shrink: true }}
          sx={{
            fontFamily: 'Gluten, cursive',
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
                color: '#232323',
              },
            },
          }}
        />
        <Box display="flex" gap={2}>
          <TextField
            label="Places disponibles"
            name="places_disponibles"
            type="number"
            value={form.places_disponibles}
            onChange={handleChange}
            required
            inputProps={{ min: 1, max: 8 }}
            sx={{
              flex: 1,
              fontFamily: 'Gluten, cursive',
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
                  color: '#232323',
                },
              },
            }}
          />
          <TextField
            label="Prix (€)"
            name="prix"
            type="number"
            value={form.prix}
            onChange={handleChange}
            required
            inputProps={{ min: 0, step: 0.5 }}
            sx={{
              flex: 1,
              fontFamily: 'Gluten, cursive',
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
                  color: '#232323',
                },
              },
            }}
          />
        </Box>
        <TextField
          label="Conditions ou remarques (optionnel)"
          name="conditions"
          value={form.conditions}
          onChange={handleChange}
          multiline
          rows={3}
          fullWidth
          placeholder="Ex: Non-fumeur, animaux acceptés, musique autorisée..."
          sx={{
            fontFamily: 'Gluten, cursive',
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
                color: '#232323',
              },
            },
          }}
        />
        
        {error && (
          <Typography 
            sx={{ 
              color: '#ff4444', 
              fontFamily: 'Gluten, cursive',
              fontSize: 'clamp(0.8rem, 3vw, 1rem)',
              textAlign: 'center',
              p: 2,
              bgcolor: '#ffebee',
              borderRadius: '12px',
              border: '1px solid #ff4444'
            }}
          >
            {error}
          </Typography>
        )}
        
        {success && (
          <Typography 
            sx={{ 
              color: '#4caf50', 
              fontFamily: 'Gluten, cursive',
              fontSize: 'clamp(0.8rem, 3vw, 1rem)',
              textAlign: 'center',
              p: 2,
              bgcolor: '#e8f5e8',
              borderRadius: '12px',
              border: '1px solid #4caf50'
            }}
          >
            {success}
          </Typography>
        )}
        
        <Button 
          type="submit" 
          variant="contained" 
          disabled={loading}
          sx={{
            bgcolor: '#D6FFB7',
            color: '#232323',
            borderRadius: '999px',
            fontWeight: 'bold',
            py: 2,
            px: 4,
            fontSize: 'clamp(1rem, 4vw, 1.2rem)',
            fontFamily: 'Gluten, cursive',
            textTransform: 'none',
            mt: 2,
            '&:hover': {
              bgcolor: '#c5e8a6',
            },
            '&:disabled': {
              bgcolor: '#e0e0e0',
              color: '#999',
            },
          }}
        >
          {loading ? "Création en cours..." : "🚗 Créer le trajet"}
        </Button>
      </Stack>
    </Box>
  );
} 