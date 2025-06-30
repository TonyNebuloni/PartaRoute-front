import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Container, Stack } from "@mui/material";
import HomeCard from "../components/HomeCard";

export default function Home() {
  const [prenom, setPrenom] = useState("");

  useEffect(() => {
    const token = localStorage.getItem("accessToken");
    const id = localStorage.getItem("userId");

    if (!token || !id) return;

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
  }, []);

  return (
    <Container maxWidth="sm" sx={{ pt: 4, pb: 6 }}>
      {/* Header */}
      <Box mb={4} textAlign="center">
        <Typography variant="h5" fontWeight={600}>
          Bienvenue, {prenom} 👋
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Voici les trajets disponibles aujourd’hui :
        </Typography>
      </Box>

      {/* Liste de trajets (mockée pour l'instant) */}
      <Stack spacing={2}>
        <HomeCard
          depart="Nice"
          arrivee="Marseille"
          heure="08:30"
          date="2025-07-01"
          conducteur="Lucas"
        />
        <HomeCard
          depart="Grasse"
          arrivee="Cannes"
          heure="10:15"
          date="2025-07-01"
          conducteur="Sarah"
        />
      </Stack>
    </Container>
  );
}
