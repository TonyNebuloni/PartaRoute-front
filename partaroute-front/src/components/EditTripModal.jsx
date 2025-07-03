import React, { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Button, Stack, CircularProgress, Alert
} from '@mui/material';
import axios from 'axios';

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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Modifier le trajet</DialogTitle>
      <DialogContent>
        <form onSubmit={handleSubmit} id="edit-trip-form">
          <Stack spacing={2} mt={1}>
            <TextField label="Ville de départ" name="ville_depart" value={form.ville_depart} onChange={handleChange} fullWidth required />
            <TextField label="Ville d'arrivée" name="ville_arrivee" value={form.ville_arrivee} onChange={handleChange} fullWidth required />
            <TextField
              label="Date et heure de départ"
              name="date_heure_depart"
              type="datetime-local"
              value={form.date_heure_depart}
              onChange={handleChange}
              fullWidth
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField label="Places disponibles" name="places_disponibles" type="number" value={form.places_disponibles} onChange={handleChange} fullWidth required />
            <TextField label="Prix (€)" name="prix" type="number" value={form.prix} onChange={handleChange} fullWidth required />
            <TextField label="Conditions" name="conditions" value={form.conditions} onChange={handleChange} fullWidth multiline minRows={2} />
            {error && <Alert severity="error">{error}</Alert>}
          </Stack>
        </form>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>Annuler</Button>
        <Button type="submit" form="edit-trip-form" variant="contained" disabled={loading}>
          {loading ? <CircularProgress size={20} /> : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
} 