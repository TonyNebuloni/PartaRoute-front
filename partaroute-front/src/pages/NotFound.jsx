import { Box, Typography, Button, Paper } from "@mui/material";
import { Link } from "react-router-dom";

export default function NotFound() {
  return (
    <Box 
      minHeight="100vh" 
      bgcolor="grey.100" 
      display="flex" 
      alignItems="center" 
      justifyContent="center"
      p={3}
    >
      <Paper 
        sx={{ 
          p: 4, 
          borderRadius: 4, 
          textAlign: 'center',
          maxWidth: 500,
          width: '100%'
        }}
      >
        <Typography variant="h1" color="primary" gutterBottom sx={{ fontSize: '4rem', fontWeight: 'bold' }}>
          404
        </Typography>
        <Typography variant="h4" gutterBottom sx={{ mb: 2 }}>
          Page non trouvée
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4 }}>
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </Typography>
        <Button 
          component={Link} 
          to="/" 
          variant="contained" 
          size="large"
          sx={{ borderRadius: 2 }}
        >
          Retour à l'accueil
        </Button>
      </Paper>
    </Box>
  );
} 