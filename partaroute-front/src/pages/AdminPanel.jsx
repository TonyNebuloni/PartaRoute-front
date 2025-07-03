import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, Avatar, Button, TextField, IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Alert, MenuItem, List, ListItem, ListItemButton, ListItemText, Divider } from "@mui/material";
import DeleteIcon from '@mui/icons-material/Delete';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import SearchIcon from '@mui/icons-material/Search';
import DashboardIcon from '@mui/icons-material/Dashboard';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import PeopleIcon from '@mui/icons-material/People';
import BookOnlineIcon from '@mui/icons-material/BookOnline';
import { useNavigate } from "react-router-dom";
import AdminDashboard from "./AdminDashboard.jsx";
import AdminTrips from "./AdminTrips.jsx";
import AdminReservations from "./AdminReservations.jsx";

const BACKEND_URL = import.meta.env.VITE_API_URL;
const DEFAULT_PHOTO = `${BACKEND_URL}/uploads/profile_photos/default.jpg`;

const MENU = [
  { key: 'dashboard', label: 'Dashboard', icon: <DashboardIcon /> },
  { key: 'users', label: 'Utilisateurs', icon: <PeopleIcon /> },
  { key: 'trips', label: 'Trajets', icon: <DirectionsCarIcon /> },
  { key: 'reservations', label: 'Réservations', icon: <BookOnlineIcon /> },
];

export default function AdminPanel() {
  const [selected, setSelected] = useState('users');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [deleteDialog, setDeleteDialog] = useState({ open: false, user: null });
  const [editDialog, setEditDialog] = useState({ open: false, user: null, form: { nom: '', email: '', role: '', mot_de_passe: '' } });
  const navigate = useNavigate();

  // Vérifier si admin (simple check, à sécuriser côté backend aussi)
  useEffect(() => {
    const role = localStorage.getItem("userRole");
    if (role !== "admin") navigate("/");
  }, [navigate]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("accessToken");
      const res = await axios.get(`${BACKEND_URL}/api/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      let data = res.data.data || res.data;
      // Recherche
      if (search) {
        data = data.filter(u =>
          u.nom.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
        );
      }
      setTotal(data.length);
      // Pagination
      setUsers(data.slice(page * pageSize, (page + 1) * pageSize));
      setError("");
    } catch (err) {
      setError("Erreur lors du chargement des utilisateurs.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line
  }, [search, page, pageSize]);

  const handlePromote = async (id) => {
    try {
      const token = localStorage.getItem("accessToken");
      await axios.patch(`${BACKEND_URL}/api/admin/user/${id}/promote`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg("Utilisateur promu administrateur !");
      fetchUsers();
    } catch {
      setError("Erreur lors de la promotion.");
    }
  };

  const handleDelete = async () => {
    if (!deleteDialog.user) return;
    try {
      const token = localStorage.getItem("accessToken");
      await axios.delete(`${BACKEND_URL}/api/admin/users/${deleteDialog.user.id_utilisateur}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg("Utilisateur supprimé !");
      setDeleteDialog({ open: false, user: null });
      fetchUsers();
    } catch {
      setError("Erreur lors de la suppression.");
    }
  };

  const handleEditOpen = (user) => {
    setEditDialog({ open: true, user, form: { nom: user.nom, email: user.email, role: user.role, mot_de_passe: '' } });
  };

  const handleEditChange = (e) => {
    setEditDialog(prev => ({ ...prev, form: { ...prev.form, [e.target.name]: e.target.value } }));
  };

  const handleEditSave = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const { nom, email, role, mot_de_passe } = editDialog.form;
      const data = { nom, email, role };
      if (mot_de_passe) data.mot_de_passe = mot_de_passe;
      await axios.put(`${BACKEND_URL}/api/admin/users/${editDialog.user.id_utilisateur}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setSuccessMsg("Utilisateur modifié !");
      setEditDialog({ open: false, user: null, form: { nom: '', email: '', role: '', mot_de_passe: '' } });
      fetchUsers();
    } catch {
      setError("Erreur lors de la modification.");
    }
  };

  const pageCount = Math.ceil(total / pageSize);

  return (
    <Box minHeight="100vh" bgcolor="grey.100" display="flex">
      {/* Sidebar */}
      <Box sx={{ width: 220, bgcolor: 'white', borderRight: '1px solid #eee', minHeight: '100vh', pt: 4 }}>
        <Typography variant="h5" align="center" gutterBottom>Admin</Typography>
        <List>
          {MENU.map(item => (
            <ListItem key={item.key} disablePadding>
              <ListItemButton selected={selected === item.key} onClick={() => setSelected(item.key)}>
                {item.icon}
                <ListItemText primary={item.label} sx={{ ml: 2 }} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <Divider sx={{ my: 2 }} />
      </Box>
      {/* Main content */}
      <Box flex={1} p={3}>
        {selected === 'dashboard' && <AdminDashboard />}
        {selected === 'trips' && <AdminTrips />}
        {selected === 'reservations' && <AdminReservations />}
        {selected === 'users' && (
          <Box minHeight="100vh" bgcolor="grey.100" display="flex" flexDirection="column" alignItems="center" py={4}>
            <Paper sx={{ width: '100%', maxWidth: 900, p: 3, borderRadius: 4 }}>
              <Typography variant="h4" align="center" gutterBottom>Panel Administrateur</Typography>
              <Box display="flex" alignItems="center" mb={2}>
                <TextField
                  label="Rechercher utilisateur"
                  size="small"
                  value={search}
                  onChange={e => { setSearch(e.target.value); setPage(0); }}
                  sx={{ mr: 2 }}
                />
                <SearchIcon color="action" />
              </Box>
              {successMsg && <Box mb={2}><Alert severity="success">{successMsg}</Alert></Box>}
              {error && <Box mb={2}><Alert severity="error">{error}</Alert></Box>}
              <Box overflow="auto">
                <table style={{ width: '100%', borderCollapse: 'collapse', background: 'white' }}>
                  <thead>
                    <tr style={{ background: '#f5f5f5' }}>
                      <th style={{ padding: 8 }}>Photo</th>
                      <th style={{ padding: 8 }}>Nom</th>
                      <th style={{ padding: 8 }}>Email</th>
                      <th style={{ padding: 8 }}>Rôle</th>
                      <th style={{ padding: 8 }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(user => (
                      <tr key={user.id_utilisateur} style={{ borderBottom: '1px solid #eee' }}>
                        <td style={{ textAlign: 'center', padding: 8 }}>
                          <img src={user.photo_profil ? (user.photo_profil.startsWith('/uploads/') ? BACKEND_URL + user.photo_profil : user.photo_profil) : DEFAULT_PHOTO} alt="profil" style={{ width: 40, height: 40, borderRadius: '50%' }} />
                        </td>
                        <td style={{ padding: 8 }}>{user.nom}</td>
                        <td style={{ padding: 8 }}>{user.email}</td>
                        <td style={{ padding: 8 }}>
                          {user.role === 'admin' ? <><AdminPanelSettingsIcon color="primary" fontSize="small" /> Admin</> : 'Utilisateur'}
                        </td>
                        <td style={{ padding: 8 }}>
                          <Button size="small" color="primary" variant="outlined" onClick={() => handleEditOpen(user)} style={{ marginRight: 8 }}>
                            Éditer
                          </Button>
                          {user.role !== 'admin' && (
                            <Button size="small" color="info" variant="outlined" onClick={() => handlePromote(user.id_utilisateur)}>
                              Promouvoir admin
                            </Button>
                          )}
                          <IconButton color="error" onClick={() => setDeleteDialog({ open: true, user })}>
                            <DeleteIcon />
                          </IconButton>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </Box>
              <Box display="flex" justifyContent="center" alignItems="center" mt={2} gap={2}>
                <Button disabled={page === 0} onClick={() => setPage(page - 1)}>Précédent</Button>
                <span>Page {page + 1} / {pageCount}</span>
                <Button disabled={page + 1 >= pageCount} onClick={() => setPage(page + 1)}>Suivant</Button>
                <TextField
                  select
                  SelectProps={{ native: true }}
                  value={pageSize}
                  onChange={e => { setPageSize(Number(e.target.value)); setPage(0); }}
                  size="small"
                  sx={{ width: 80, ml: 2 }}
                >
                  {[5, 10, 20].map(size => <option key={size} value={size}>{size} / page</option>)}
                </TextField>
              </Box>
              <Dialog open={deleteDialog.open} onClose={() => setDeleteDialog({ open: false, user: null })}>
                <DialogTitle>Confirmer la suppression</DialogTitle>
                <DialogContent>
                  <Typography>Supprimer l'utilisateur <b>{deleteDialog.user?.nom}</b> ? Cette action est irréversible.</Typography>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setDeleteDialog({ open: false, user: null })}>Annuler</Button>
                  <Button onClick={handleDelete} color="error">Supprimer</Button>
                </DialogActions>
              </Dialog>
              <Dialog open={editDialog.open} onClose={() => setEditDialog({ open: false, user: null, form: { nom: '', email: '', role: '', mot_de_passe: '' } })}>
                <DialogTitle>Éditer l'utilisateur</DialogTitle>
                <DialogContent>
                  <TextField
                    margin="dense"
                    label="Nom"
                    name="nom"
                    value={editDialog.form.nom}
                    onChange={handleEditChange}
                    fullWidth
                  />
                  <TextField
                    margin="dense"
                    label="Email"
                    name="email"
                    value={editDialog.form.email}
                    onChange={handleEditChange}
                    fullWidth
                    type="email"
                  />
                  <TextField
                    margin="dense"
                    label="Rôle"
                    name="role"
                    value={editDialog.form.role}
                    onChange={handleEditChange}
                    select
                    fullWidth
                  >
                    <MenuItem value="user">Utilisateur</MenuItem>
                    <MenuItem value="admin">Admin</MenuItem>
                  </TextField>
                  <TextField
                    margin="dense"
                    label="Nouveau mot de passe (optionnel)"
                    name="mot_de_passe"
                    value={editDialog.form.mot_de_passe}
                    onChange={handleEditChange}
                    fullWidth
                    type="password"
                    autoComplete="new-password"
                  />
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setEditDialog({ open: false, user: null, form: { nom: '', email: '', role: '', mot_de_passe: '' } })}>Annuler</Button>
                  <Button onClick={handleEditSave} color="primary">Enregistrer</Button>
                </DialogActions>
              </Dialog>
            </Paper>
          </Box>
        )}
      </Box>
    </Box>
  );
} 