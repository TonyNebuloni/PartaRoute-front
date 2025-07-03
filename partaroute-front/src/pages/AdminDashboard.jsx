import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, Grid, CircularProgress } from "@mui/material";

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("accessToken");
        const res = await axios.get(`${BACKEND_URL}/api/admin/stats`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data.data || res.data);
        setError("");
      } catch {
        setError("Erreur lors du chargement des statistiques.");
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <Box minHeight="100vh" bgcolor="grey.100" display="flex" flexDirection="column" alignItems="center" py={4}>
      <Paper sx={{ width: '100%', maxWidth: 700, p: 3, borderRadius: 4 }}>
        <Typography variant="h4" align="center" gutterBottom>Dashboard Admin</Typography>
        {loading ? (
          <Box display="flex" justifyContent="center" alignItems="center" minHeight={200}><CircularProgress /></Box>
        ) : error ? (
          <Typography color="error" align="center">{error}</Typography>
        ) : (
          <Grid container spacing={3} justifyContent="center">
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Utilisateurs</Typography>
                <Typography variant="h4" color="primary">{stats?.totalUsers ?? 0}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Trajets</Typography>
                <Typography variant="h4" color="primary">{stats?.totalTrips ?? 0}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Réservations</Typography>
                <Typography variant="h4" color="primary">{stats?.totalReservations ?? 0}</Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Paper sx={{ p: 2, textAlign: 'center' }}>
                <Typography variant="h6">Admins</Typography>
                <Typography variant="h4" color="primary">{stats?.totalAdmins ?? 0}</Typography>
              </Paper>
            </Grid>
          </Grid>
        )}
      </Paper>
    </Box>
  );
} 