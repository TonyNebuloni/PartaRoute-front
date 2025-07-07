import { useEffect, useRef, useState } from "react";
import axios from "axios";
import { Box, Button, Avatar, Typography, CircularProgress, Snackbar, Alert, Stack } from "@mui/material";

const BACKEND_URL = import.meta.env.VITE_API_URL;
const DEFAULT_PHOTO = `${BACKEND_URL}/uploads/profile_photos/default.png`;

export default function ProfilePhotoUploader({ onPhotoChange, textColor = "text.primary" }) {
  const [photoUrl, setPhotoUrl] = useState(null);
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef();

  useEffect(() => {
    const fetchPhoto = async () => {
      try {
        const token = localStorage.getItem("accessToken");
        const userId = localStorage.getItem("userId");
        if (!token || !userId) return;
        const res = await axios.get(`${BACKEND_URL}/api/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setPhotoUrl(res.data.data.photo_profil ? `${BACKEND_URL}${res.data.data.photo_profil}` : DEFAULT_PHOTO);
      } catch (err) {
        setPhotoUrl(DEFAULT_PHOTO);
      }
    };
    fetchPhoto();
  }, []);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);
    setErrorMsg("");
    setSuccessMsg("");
    try {
      const token = localStorage.getItem("accessToken");
      const formData = new FormData();
      formData.append("photo", file);
      const res = await axios.post(`${BACKEND_URL}/api/user/upload-photo`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data"
        }
      });
      setPhotoUrl(`${BACKEND_URL}${res.data.photo_profil}`);
      setSuccessMsg("Photo de profil mise à jour !");
      setPreview(null);
      setFile(null);
      if (onPhotoChange) onPhotoChange(res.data.photo_profil);
    } catch (err) {
      setErrorMsg("Erreur lors de l'upload de la photo.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box display="flex" flexDirection="column" alignItems="center" gap={2} mb={2}>
      <Typography variant="subtitle1" gutterBottom sx={{ color: textColor, fontFamily: 'Gluten, cursive' }}>Photo de profil</Typography>
      <Avatar
        src={preview || photoUrl || DEFAULT_PHOTO}
        alt="Photo de profil"
        sx={{ width: 100, height: 100, mb: 1, border: "2px solid #ccc" }}
      />
      <input
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        ref={inputRef}
        onChange={handleFileChange}
      />
      <Stack direction="row" spacing={2}>
        <Button variant="outlined" onClick={() => inputRef.current.click()} disabled={loading}>
          Choisir une photo
        </Button>
        {file && (
          <Button variant="contained" color="primary" onClick={handleUpload} disabled={loading}>
            {loading ? <CircularProgress size={24} /> : "Envoyer"}
          </Button>
        )}
      </Stack>
      {preview && (
        <Typography variant="body2" color="text.secondary">
          Aperçu avant envoi
        </Typography>
      )}
      <Snackbar open={!!successMsg} autoHideDuration={2000} onClose={() => setSuccessMsg("")}>
        <Alert onClose={() => setSuccessMsg("")} severity="success">{successMsg}</Alert>
      </Snackbar>
      <Snackbar open={!!errorMsg} autoHideDuration={3000} onClose={() => setErrorMsg("")}>
        <Alert onClose={() => setErrorMsg("")} severity="error">{errorMsg}</Alert>
      </Snackbar>
    </Box>
  );
} 