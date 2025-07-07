import { useEffect, useState } from "react";
import axios from "axios";
import { Box, Typography, Paper, Grid, CircularProgress, Card, CardContent, Stack } from "@mui/material";

const BACKEND_URL = import.meta.env.VITE_API_URL;

export default function AdminDashboard({ onNavigate }) {
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

  const statCards = [
    {
      title: "Utilisateurs",
      value: stats?.totalUsers ?? 0,
      emoji: "👥",
      color: "#4caf50",
      bgColor: "#e8f5e8"
    },
    {
      title: "Trajets",
      value: stats?.totalTrips ?? 0,
      emoji: "🚗",
      color: "#2196f3",
      bgColor: "#e3f2fd"
    },
    {
      title: "Réservations",
      value: stats?.totalReservations ?? 0,
      emoji: "📅",
      color: "#ff9800",
      bgColor: "#fff3e0"
    },
    {
      title: "Admins",
      value: stats?.totalAdmins ?? 0,
      emoji: "🛠️",
      color: "#9c27b0",
      bgColor: "#f3e5f5"
    }
  ];

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="40vh">
        <CircularProgress sx={{ color: '#D6FFB7' }} size={60} />
      </Box>
    );
  }

  if (error) {
    return (
      <Box textAlign="center" py="8vw">
        <Typography sx={{ 
          fontFamily: 'Gluten, cursive',
          fontSize: 'clamp(1.1rem, 4vw, 1.4rem)',
          color: '#ff4444',
          mb: '2vw'
        }}>
          ❌ {error}
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ pb: { xs: 4, sm: 6, md: 8 } }}>
      {/* Titre du dashboard */}
      <Box mb={{ xs: "6vw", md: "3rem" }} textAlign="center">
        <Typography 
          variant="h4" 
          sx={{ 
            fontFamily: 'Gluten, cursive', 
            fontSize: { xs: 'clamp(1.5rem, 7vw, 2.2rem)', md: '2.5rem' },
            color: '#232323',
            fontWeight: 700,
            mb: { xs: '2vw', md: '1rem' }
          }}
        >
          📊 Dashboard Administrateur
        </Typography>
        <Typography 
          sx={{ 
            fontFamily: 'Gluten, cursive',
            fontSize: { xs: 'clamp(0.9rem, 3vw, 1.1rem)', md: '1.2rem' },
            color: '#666'
          }}
        >
          Vue d'ensemble de la plateforme PartaRoute
        </Typography>
      </Box>

      {/* Cartes de statistiques */}
      <Box 
        sx={{
          display: 'grid',
          gridTemplateColumns: { 
            xs: 'repeat(2, 1fr)', 
            md: 'repeat(4, 1fr)' 
          },
          gridTemplateRows: { 
            xs: 'repeat(2, 1fr)', 
            md: '1fr' 
          },
          gap: { xs: 2, sm: 3, md: 4 },
          mb: { xs: '8vw', md: '4rem' },
          maxWidth: { xs: '100%', sm: '600px', md: '100%' },
          margin: '0 auto'
        }}
      >
        {statCards.map((card, index) => (
          <Card 
            key={index}
            elevation={3}
            sx={{ 
              borderRadius: '20px',
              border: '2px solid #f0f0f0',
              height: { xs: '200px', sm: '220px', md: '240px' },
              transition: 'all 0.3s ease',
              '&:hover': {
                border: '2px solid #D6FFB7',
                transform: 'translateY(-5px)',
                boxShadow: '0 8px 25px rgba(214, 255, 183, 0.3)'
              }
            }}
          >
            <CardContent sx={{ 
              p: { xs: 2, sm: 3, md: 4 },
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              alignItems: 'center',
              width: '100%',
              height: '100%',
              boxSizing: 'border-box'
            }}>
              <Box 
                sx={{
                  width: { xs: '60px', sm: '65px', md: '70px' },
                  height: { xs: '60px', sm: '65px', md: '70px' },
                  bgcolor: card.bgColor,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  mb: { xs: 2, sm: 2.5, md: 3 },
                  border: `3px solid ${card.color}`
                }}
              >
                <Typography sx={{ 
                  fontSize: { xs: '1.4rem', sm: '1.6rem', md: '1.8rem' }
                }}>
                  {card.emoji}
                </Typography>
              </Box>
              
              <Typography sx={{ 
                fontFamily: 'Gluten, cursive',
                fontSize: { xs: '1rem', sm: '1.1rem', md: '1.2rem' },
                color: '#666',
                mb: { xs: 1, sm: 1.5, md: 2 },
                fontWeight: 600
              }}>
                {card.title}
              </Typography>
              
              <Typography sx={{ 
                fontFamily: 'Gluten, cursive',
                fontSize: { xs: '2rem', sm: '2.3rem', md: '2.5rem' },
                color: card.color,
                fontWeight: 700,
                lineHeight: 1
              }}>
                {card.value}
              </Typography>
            </CardContent>
          </Card>
        ))}
      </Box>

      {/* Section d'informations supplémentaires */}
      <Box mt={{ xs: "8vw", md: "4rem" }}>
        <Grid container spacing={{ xs: 4, md: 6 }}>
          <Grid item xs={12} md={6}>
            <Card 
              elevation={2}
              sx={{ 
                borderRadius: '20px',
                border: '2px solid #f0f0f0',
                height: '100%'
              }}
            >
              <CardContent sx={{ p: { xs: '6vw', md: '2rem' } }}>
                <Typography sx={{ 
                  fontFamily: 'Gluten, cursive',
                  fontSize: { xs: 'clamp(1.2rem, 5vw, 1.5rem)', md: '1.8rem' },
                  color: '#232323',
                  fontWeight: 700,
                  mb: { xs: '4vw', md: '2rem' },
                  textAlign: 'center'
                }}>
                  🎯 Actions rapides
                </Typography>
                
                <Stack spacing={{ xs: 3, md: 4 }}>
                  <Box sx={{ 
                    bgcolor: '#f8f9fa', 
                    borderRadius: '12px', 
                    p: { xs: '4vw', md: '1.5rem' },
                    border: '1px solid #e9ecef',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#D6FFB7',
                      border: '1px solid #D6FFB7',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(214, 255, 183, 0.3)'
                    }
                  }}
                  onClick={() => onNavigate && onNavigate('users')}
                  >
                    <Typography sx={{ 
                      fontFamily: 'Gluten, cursive',
                      fontSize: { xs: 'clamp(0.9rem, 3.5vw, 1.1rem)', md: '1.2rem' },
                      color: '#232323',
                      fontWeight: 600
                    }}>
                      👥 Gérer les utilisateurs
                    </Typography>
                    <Typography sx={{ 
                      fontFamily: 'Gluten, cursive',
                      fontSize: { xs: 'clamp(0.8rem, 3vw, 1rem)', md: '1rem' },
                      color: '#666'
                    }}>
                      Promouvoir, modifier ou supprimer des comptes
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    bgcolor: '#f8f9fa', 
                    borderRadius: '12px', 
                    p: { xs: '4vw', md: '1.5rem' },
                    border: '1px solid #e9ecef',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#D6FFB7',
                      border: '1px solid #D6FFB7',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(214, 255, 183, 0.3)'
                    }
                  }}
                  onClick={() => onNavigate && onNavigate('trips')}
                  >
                    <Typography sx={{ 
                      fontFamily: 'Gluten, cursive',
                      fontSize: { xs: 'clamp(0.9rem, 3.5vw, 1.1rem)', md: '1.2rem' },
                      color: '#232323',
                      fontWeight: 600
                    }}>
                      🚗 Superviser les trajets
                    </Typography>
                    <Typography sx={{ 
                      fontFamily: 'Gluten, cursive',
                      fontSize: { xs: 'clamp(0.8rem, 3vw, 1rem)', md: '1rem' },
                      color: '#666'
                    }}>
                      Modérer et gérer les trajets publiés
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    bgcolor: '#f8f9fa', 
                    borderRadius: '12px', 
                    p: { xs: '4vw', md: '1.5rem' },
                    border: '1px solid #e9ecef',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      bgcolor: '#D6FFB7',
                      border: '1px solid #D6FFB7',
                      transform: 'translateY(-2px)',
                      boxShadow: '0 4px 12px rgba(214, 255, 183, 0.3)'
                    }
                  }}
                  onClick={() => onNavigate && onNavigate('reservations')}
                  >
                    <Typography sx={{ 
                      fontFamily: 'Gluten, cursive',
                      fontSize: { xs: 'clamp(0.9rem, 3.5vw, 1.1rem)', md: '1.2rem' },
                      color: '#232323',
                      fontWeight: 600
                    }}>
                      📅 Contrôler les réservations
                    </Typography>
                    <Typography sx={{ 
                      fontFamily: 'Gluten, cursive',
                      fontSize: { xs: 'clamp(0.8rem, 3vw, 1rem)', md: '1rem' },
                      color: '#666'
                    }}>
                      Résoudre les conflits et annuler si nécessaire
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} md={6}>
            <Card 
              elevation={2}
              sx={{ 
                borderRadius: '20px',
                border: '2px solid #f0f0f0',
                height: '100%'
              }}
            >
              <CardContent sx={{ p: { xs: '6vw', md: '2rem' } }}>
                <Typography sx={{ 
                  fontFamily: 'Gluten, cursive',
                  fontSize: { xs: 'clamp(1.2rem, 5vw, 1.5rem)', md: '1.8rem' },
                  color: '#232323',
                  fontWeight: 700,
                  mb: { xs: '4vw', md: '2rem' },
                  textAlign: 'center'
                }}>
                  📈 Statut de la plateforme
                </Typography>
                
                <Stack spacing={{ xs: 3, md: 4 }}>
                  <Box sx={{ 
                    bgcolor: '#e8f5e8', 
                    borderRadius: '12px', 
                    p: { xs: '4vw', md: '1.5rem' },
                    border: '2px solid #4caf50'
                  }}>
                    <Typography sx={{ 
                      fontFamily: 'Gluten, cursive',
                      fontSize: { xs: 'clamp(0.9rem, 3.5vw, 1.1rem)', md: '1.2rem' },
                      color: '#4caf50',
                      fontWeight: 700,
                      textAlign: 'center'
                    }}>
                      ✅ Système opérationnel
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    bgcolor: '#fff3e0', 
                    borderRadius: '12px', 
                    p: { xs: '4vw', md: '1.5rem' },
                    border: '1px solid #ff9800'
                  }}>
                    <Typography sx={{ 
                      fontFamily: 'Gluten, cursive',
                      fontSize: { xs: 'clamp(0.8rem, 3vw, 1rem)', md: '1.1rem' },
                      color: '#ff9800',
                      fontWeight: 600,
                      mb: { xs: '1vw', md: '0.5rem' }
                    }}>
                      📊 Activité récente
                    </Typography>
                    <Typography sx={{ 
                      fontFamily: 'Gluten, cursive',
                      fontSize: { xs: 'clamp(0.8rem, 3vw, 1rem)', md: '1rem' },
                      color: '#666'
                    }}>
                      {stats?.totalTrips > 0 ? 
                        `${stats.totalTrips} trajets et ${stats.totalReservations} réservations enregistrés` :
                        "En attente des premiers utilisateurs"
                      }
                    </Typography>
                  </Box>
                  
                  <Box sx={{ 
                    bgcolor: '#e3f2fd', 
                    borderRadius: '12px', 
                    p: { xs: '4vw', md: '1.5rem' },
                    border: '1px solid #2196f3'
                  }}>
                    <Typography sx={{ 
                      fontFamily: 'Gluten, cursive',
                      fontSize: { xs: 'clamp(0.8rem, 3vw, 1rem)', md: '1.1rem' },
                      color: '#2196f3',
                      fontWeight: 600,
                      mb: { xs: '1vw', md: '0.5rem' }
                    }}>
                      🛡️ Sécurité
                    </Typography>
                    <Typography sx={{ 
                      fontFamily: 'Gluten, cursive',
                      fontSize: { xs: 'clamp(0.8rem, 3vw, 1rem)', md: '1rem' },
                      color: '#666'
                    }}>
                      {stats?.totalAdmins} administrateur{stats?.totalAdmins > 1 ? 's' : ''} actif{stats?.totalAdmins > 1 ? 's' : ''}
                    </Typography>
                  </Box>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
} 