import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, CircularProgress, Alert
} from '@mui/material';
import axios from 'axios';

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

export default function EditTripModal({ open, onClose, trip, onSuccess }) {
  const [form, setForm] = useState({
    ville_depart: '',
    ville_arrivee: '',
    date_heure_depart: '',
    places_disponibles: '',
    prix: '',
    conditions: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (trip) {
      setForm({
        ville_depart: trip.ville_depart || '',
        ville_arrivee: trip.ville_arrivee || '',
        date_heure_depart: trip.date_heure_depart ? new Date(trip.date_heure_depart).toISOString().slice(0,16) : '',
        places_disponibles: trip.places_disponibles || '',
        prix: trip.prix || '',
        conditions: trip.conditions || ''
      });
    }
  }, [trip, open]);

  const handleChange = e => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const token = localStorage.getItem('accessToken');
    try {
      await axios.patch(`${BACKEND_URL}/api/trips/${trip.id_trajet}`, {
        ...form,
        places_disponibles: Number(form.places_disponibles),
        prix: Number(form.prix)
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setLoading(false);
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la modification.');
      setLoading(false);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="xs" 
      fullWidth
      PaperProps={{
        sx: {
          borderRadius: '20px',
          fontFamily: 'Gluten, cursive',
          bgcolor: '#fff'
        }
      }}
    >
      <DialogTitle sx={{ 
        fontFamily: 'Gluten, cursive', 
        fontWeight: 700, 
        color: '#232323',
        fontSize: 'clamp(1.2rem, 5vw, 1.5rem)',
        textAlign: 'center',
        pb: 2
      }}>
        ✏️ Modifier le trajet
      </DialogTitle>
      <DialogContent sx={{ px: 3 }}>
        <form onSubmit={handleSubmit} id="edit-trip-form">
          <Stack spacing={3} mt={1}>
            <TextField 
              label="Ville de départ" 
              name="ville_depart" 
              value={form.ville_depart} 
              onChange={handleChange} 
              fullWidth 
              required 
              variant="outlined"
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
              label="Ville d'arrivée" 
              name="ville_arrivee" 
              value={form.ville_arrivee} 
              onChange={handleChange} 
              fullWidth 
              required 
              variant="outlined"
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
              label="Date et heure de départ"
              name="date_heure_depart"
              type="datetime-local"
              value={form.date_heure_depart}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
              variant="outlined"
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
            <Stack direction="row" spacing={2}>
              <TextField 
                label="Places disponibles" 
                name="places_disponibles" 
                type="number" 
                value={form.places_disponibles} 
                onChange={handleChange} 
                fullWidth 
                required 
                variant="outlined"
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
                label="Prix (€)" 
                name="prix" 
                type="number" 
                value={form.prix} 
                onChange={handleChange} 
                fullWidth 
                required 
                variant="outlined"
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
            <TextField 
              label="Conditions (optionnel)" 
              name="conditions" 
              value={form.conditions} 
              onChange={handleChange} 
              fullWidth 
              multiline 
              minRows={3}
              placeholder="Ex: Non-fumeur, animaux acceptés..."
              variant="outlined"
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
            {error && (
              <Alert 
                severity="error" 
                sx={{ 
                  borderRadius: '12px',
                  '& .MuiAlert-message': {
                    fontFamily: 'Gluten, cursive',
                  }
                }}
              >
                {error}
              </Alert>
            )}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions sx={{ p: 3, gap: 2, flexDirection: 'column' }}>
        <Button 
          onClick={onClose} 
          disabled={loading}
          sx={{
            color: '#666',
            fontFamily: 'Gluten, cursive',
            textTransform: 'none',
            borderRadius: '999px',
            px: 4,
            py: 1.5,
            fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
            fontWeight: 600,
            width: '100%',
            '&:hover': {
              bgcolor: 'rgba(0,0,0,0.05)',
            },
          }}
        >
          Annuler
        </Button>
        <Button 
          type="submit" 
          form="edit-trip-form" 
          variant="contained" 
          disabled={loading}
          sx={{
            bgcolor: '#D6FFB7',
            color: '#232323',
            fontFamily: 'Gluten, cursive',
            textTransform: 'none',
            borderRadius: '999px',
            px: 4,
            py: 1.5,
            fontSize: 'clamp(0.9rem, 3.5vw, 1.1rem)',
            fontWeight: 700,
            width: '100%',
            '&:hover': {
              bgcolor: '#c5e8a6',
            },
            '&:disabled': {
              bgcolor: '#e0e0e0',
              color: '#999',
            },
          }}
        >
          {loading ? <CircularProgress size={20} sx={{ color: '#999' }} /> : '💾 Enregistrer les modifications'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 