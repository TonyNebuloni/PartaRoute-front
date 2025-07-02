import { AppBar, Toolbar, Typography, Box, IconButton, Drawer, List, ListItem, ListItemButton, ListItemText, Divider, Badge } from "@mui/material";
import MenuIcon from '@mui/icons-material/Menu';
import NotificationsNoneIcon from '@mui/icons-material/NotificationsNone';
import { Link, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "axios";

export default function Header({ onOpenCreateTrip }) {
  const navigate = useNavigate();
  const token = localStorage.getItem("accessToken");
  const userId = localStorage.getItem("userId");
  const isLogged = !!token;
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [notifCount, setNotifCount] = useState(0);

  useEffect(() => {
    const fetchNotifCount = () => {
      if (!isLogged || !userId) {
        setNotifCount(0);
        return;
      }
      axios.get(`http://localhost:3000/api/notifications/utilisateur/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => {
          const notifs = res.data.data || res.data;
          setNotifCount(notifs.filter(n => !n.lue).length);
        })
        .catch(() => setNotifCount(0));
    };
    fetchNotifCount();
    window.addEventListener('notifRead', fetchNotifCount);
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') fetchNotifCount();
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => {
      window.removeEventListener('notifRead', fetchNotifCount);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [isLogged, userId]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("userId");
    localStorage.removeItem("userRole");
    localStorage.removeItem("userEmail");
    setDrawerOpen(false);
    navigate("/login");
  };

  const handleCreateTrip = () => {
    setDrawerOpen(false);
    if (onOpenCreateTrip) onOpenCreateTrip();
  };

  return (
    <AppBar position="static" color="default" elevation={1} sx={{ mb: 3 }}>
      <Toolbar sx={{ position: 'relative', minHeight: 64 }}>
        <Box component={Link} to="/" sx={{ width: 40, height: 40, bgcolor: 'grey.300', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: 18, color: 'grey.700', mr: 2, textDecoration: 'none' }}>
          LOGO
        </Box>
        <Typography
          variant="h6"
          sx={{
            position: 'absolute',
            left: '50%',
            transform: 'translateX(-50%)',
            fontFamily: 'Pacifico, cursive',
            fontSize: '1.7rem',
            letterSpacing: 2,
            color: 'inherit',
            pointerEvents: 'none',
            userSelect: 'none',
          }}
        >
          PartaRoute
        </Typography>
        <Box sx={{ flexGrow: 1 }} />
        {isLogged && (
          <IconButton color="inherit" component={Link} to="/notifications" sx={{ mr: 1 }}>
            <Badge badgeContent={notifCount} color="error" overlap="circular" invisible={notifCount === 0}>
              <NotificationsNoneIcon fontSize="large" />
            </Badge>
          </IconButton>
        )}
        <IconButton color="inherit" edge="end" onClick={() => setDrawerOpen(true)}>
          <MenuIcon fontSize="large" />
        </IconButton>
        <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
          <Box sx={{ width: 250 }} role="presentation" onClick={() => {}}>
            <List>
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/" onClick={() => setDrawerOpen(false)}>
                  <ListItemText primary="Accueil" />
                </ListItemButton>
              </ListItem>
              {isLogged && (
                <>
                  <ListItem disablePadding>
                    <ListItemButton component={Link} to="/mes-trajets" onClick={() => setDrawerOpen(false)}>
                      <ListItemText primary="Mes trajets" />
                    </ListItemButton>
                  </ListItem>
                  <ListItem disablePadding>
                    <ListItemButton component={Link} to="/mes-trajets-conducteur" onClick={() => setDrawerOpen(false)}>
                      <ListItemText primary="Mes trajets proposés" />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                  <ListItem disablePadding>
                    <ListItemButton onClick={handleCreateTrip}>
                      <ListItemText primary="Créer un trajet" />
                    </ListItemButton>
                  </ListItem>
                  <Divider />
                  <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout}>
                      <ListItemText primary="Déconnexion" />
                    </ListItemButton>
                  </ListItem>
                </>
              )}
              {!isLogged && (
                <ListItem disablePadding>
                  <ListItemButton component={Link} to="/login" onClick={() => setDrawerOpen(false)}>
                    <ListItemText primary="Connexion" />
                  </ListItemButton>
                </ListItem>
              )}
            </List>
          </Box>
        </Drawer>
      </Toolbar>
    </AppBar>
  );
} 