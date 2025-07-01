import { useState } from "react";
import { Box, TextField, Button, Typography, Stack } from "@mui/material";
import axios from "axios";

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
        "http://localhost:3000/api/trips",
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
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de la création du trajet.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
      <Stack spacing={2}>
        <TextField
          label="Ville de départ"
          name="ville_depart"
          value={form.ville_depart}
          onChange={handleChange}
          required
        />
        <TextField
          label="Ville d'arrivée"
          name="ville_arrivee"
          value={form.ville_arrivee}
          onChange={handleChange}
          required
        />
        <TextField
          label="Date et heure de départ"
          name="date_heure_depart"
          type="datetime-local"
          value={form.date_heure_depart}
          onChange={handleChange}
          required
          InputLabelProps={{ shrink: true }}
        />
        <TextField
          label="Places disponibles"
          name="places_disponibles"
          type="number"
          value={form.places_disponibles}
          onChange={handleChange}
          required
          inputProps={{ min: 1 }}
        />
        <TextField
          label="Prix (€)"
          name="prix"
          type="number"
          value={form.prix}
          onChange={handleChange}
          required
          inputProps={{ min: 0 }}
        />
        <TextField
          label="Conditions (optionnel)"
          name="conditions"
          value={form.conditions}
          onChange={handleChange}
          multiline
          rows={2}
        />
        {error && <Typography color="error">{error}</Typography>}
        {success && <Typography color="success.main">{success}</Typography>}
        <Button type="submit" variant="contained" color="primary" disabled={loading}>
          {loading ? "Création..." : "Créer le trajet"}
        </Button>
      </Stack>
    </Box>
  );
} 