import { useEffect, useState } from "react";
import { Box, Typography, Paper, CircularProgress, Alert, Stack, Button, IconButton } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import DoneIcon from '@mui/icons-material/Done';
import axios from "axios";
import PaginationMUI from '../components/PaginationMUI';

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const userId = localStorage.getItem("userId");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [total, setTotal] = useState(0);

  const fetchNotifications = async (pageArg = page, limitArg = limit) => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("accessToken");
    if (!token || !userId) {
      setError("Connecte-toi pour voir tes notifications.");
      setLoading(false);
      return;
    }
    try {
      const res = await axios.get(`http://localhost:3000/api/notifications/utilisateur/${userId}?page=${pageArg}&limit=${limitArg}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setNotifications(res.data.data || res.data);
      setTotal(res.data.total || 0);
      setPage(res.data.page || 1);
      setLimit(res.data.limit || 10);
    } catch (err) {
      setError("Erreur lors de la récupération des notifications.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAsRead = async (id) => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.patch(`http://localhost:3000/api/notifications/${id}/lue`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
      window.dispatchEvent(new Event('notifRead'));
    } catch {}
  };

  const deleteNotif = async (id) => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.delete(`http://localhost:3000/api/notifications/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      fetchNotifications();
    } catch {}
  };

  const handleStatut = async (reservationId, statut, notifId) => {
    const token = localStorage.getItem("accessToken");
    try {
      await axios.post(`http://localhost:3000/api/reservations/${reservationId}/statut`, { statut }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (notifId) await markAsRead(notifId);
      fetchNotifications();
    } catch {
      alert("Erreur lors du changement de statut.");
    }
  };

  const markAllAsRead = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      const unread = notifications.filter(n => !n.lue);
      await Promise.all(unread.map(n => axios.patch(`http://localhost:3000/api/notifications/${n.id_notification}/lue`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })));
      fetchNotifications();
      window.dispatchEvent(new Event('notifRead'));
    } catch {}
  };

  const deleteAll = async () => {
    const token = localStorage.getItem("accessToken");
    try {
      await Promise.all(notifications.map(n => axios.delete(`http://localhost:3000/api/notifications/${n.id_notification}`, {
        headers: { Authorization: `Bearer ${token}` }
      })));
      fetchNotifications();
      window.dispatchEvent(new Event('notifRead'));
    } catch {}
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    fetchNotifications(newPage, limit);
  };
  const handleLimitChange = (newLimit) => {
    setLimit(newLimit);
    setPage(1);
    fetchNotifications(1, newLimit);
  };

  if (loading) return <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh"><CircularProgress /></Box>;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <Box minHeight="100vh" bgcolor="grey.100" display="flex" justifyContent="center" alignItems="flex-start" px={1}>
      <Paper sx={{ maxWidth: 600, width: '100%', p: 4, borderRadius: 4 }}>
        <Typography variant="h4" align="center" sx={{ fontFamily: 'Pacifico, cursive', mb: 2 }}>
          Notifications
        </Typography>
        <Stack direction="row" spacing={2} justifyContent="center" mb={2}>
          <Button variant="outlined" size="small" onClick={markAllAsRead} disabled={notifications.filter(n => !n.lue).length === 0}>
            Tout marquer comme lu
          </Button>
          <Button variant="outlined" color="error" size="small" onClick={deleteAll} disabled={notifications.length === 0}>
            Tout supprimer
          </Button>
        </Stack>
        {notifications.length === 0 ? (
          <Typography align="center">Aucune notification.</Typography>
        ) : (
          <>
            <Stack spacing={2}>
              {notifications.map((notif) => (
                <Paper key={notif.id_notification} sx={{ p: 2, bgcolor: notif.lue ? '#f5f5f5' : '#e3f2fd' }}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Box>
                      <Typography>
                        <b>{
                          notif.type === "demande_reservation" ? "Nouvelle demande de réservation" :
                          notif.type === "confirmation" ? "Réservation acceptée" :
                          notif.type === "refus" ? "Réservation refusée" :
                          notif.type === "annulation" ? "Réservation annulée" :
                          notif.type === "generique" ? "Notification" :
                          notif.type
                        }</b> — {new Date(notif.date_notification).toLocaleString()}
                      </Typography>
                      <Typography>
                        {notif.type === "demande_reservation" && notif.lue
                          ? "Demande traitée."
                          : notif.contenu_message}
                      </Typography>
                    </Box>
                    <Stack direction="row" spacing={1}>
                      {!notif.lue && (
                        <>
                          <IconButton onClick={() => markAsRead(notif.id_notification)} title="Marquer comme lue">
                            <DoneIcon color="primary" />
                          </IconButton>
                          <Button size="small" onClick={() => markAsRead(notif.id_notification)}>
                            Marquer comme lu
                          </Button>
                        </>
                      )}
                      <IconButton onClick={() => deleteNotif(notif.id_notification)} title="Supprimer">
                        <DeleteIcon color="error" />
                      </IconButton>
                    </Stack>
                  </Stack>
                  {/* Actions pour demande de réservation */}
                  {notif.type === "demande_reservation" && notif.reservation_id && !notif.lue && (
                    <Stack direction="row" spacing={1} mt={2}>
                      <Button variant="contained" color="success" size="small" onClick={() => handleStatut(notif.reservation_id, "acceptee", notif.id_notification)}>Accepter</Button>
                      <Button variant="contained" color="error" size="small" onClick={() => handleStatut(notif.reservation_id, "refusee", notif.id_notification)}>Refuser</Button>
                    </Stack>
                  )}
                </Paper>
              ))}
            </Stack>
            <PaginationMUI
              page={page}
              count={Math.ceil(total / limit) || 1}
              onChange={handlePageChange}
              limit={limit}
              onLimitChange={handleLimitChange}
            />
          </>
        )}
      </Paper>
    </Box>
  );
} 