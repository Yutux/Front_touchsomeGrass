import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Avatar,
  Grid,
  Card,
  CardMedia,
  CardContent,
  Chip,
  Stack,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Place as PlaceIcon,
  Hiking as HikingIcon,
  AdminPanelSettings as AdminIcon,
  Star as StarIcon,
} from '@mui/icons-material';
import { UserContext } from '../../contexts/UserContext/UserContext';
import request from '../../utils/request';
import AddFriendButton from '../../Social/AddFriendButton';

const DEFAULT_AVATAR = "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp";

export default function UserProfilePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { token, user: currentUser } = useContext(UserContext);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserProfile = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await request(
          `http://localhost:8088/api/v1/auth/user/${userId}`,
          'GET',
          null,
          true
        );

        if (response.status === 200 && response.data?.userApp) {
          setUser(response.data.userApp);
        } else {
          setError('Utilisateur introuvable');
        }
      } catch (err) {
        console.error('Erreur:', err);
        setError('Erreur lors du chargement du profil');
      } finally {
        setLoading(false);
      }
    };

    if (userId && token) {
      fetchUserProfile();
    }
  }, [userId, token]);

  const isCurrentUser = currentUser?.id === parseInt(userId);
  const isAdmin = user?.roles?.some((role) => {
    const roleName = typeof role === 'string' ? role : role.roleName || role.authority;
    return String(roleName).toUpperCase().includes('ADMIN');
  });

  if (!token) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        <Alert severity="info">Connectez-vous pour voir les profils</Alert>
      </Box>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error || !user) {
    return (
      <Box sx={{ maxWidth: 900, mx: 'auto', p: 3 }}>
        <Alert severity="error">{error || 'Utilisateur introuvable'}</Alert>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/users')}
          sx={{ mt: 2, textTransform: 'none' }}
        >
          Retour à la liste
        </Button>
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900, mx: 'auto', p: { xs: 2, sm: 3 } }}>
      {/* Bouton retour */}
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/users')}
        sx={{ mb: 2, textTransform: 'none' }}
      >
        Retour à la liste
      </Button>

      {/* En-tête du profil */}
      <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
        <Grid container spacing={3} alignItems="center">
          <Grid item xs={12} sm="auto">
            <Avatar
              src={user.avatar || DEFAULT_AVATAR}
              alt={`${user.firstname} ${user.lastname}`}
              sx={{
                width: { xs: 100, sm: 120 },
                height: { xs: 100, sm: 120 },
                mx: 'auto',
                border: '4px solid',
                borderColor: 'primary.main',
              }}
            >
              {user.firstname?.[0]}{user.lastname?.[0]}
            </Avatar>
          </Grid>

          <Grid item xs={12} sm>
            <Stack spacing={1}>
              <Box>
                <Typography variant="h4" fontWeight={700}>
                  {user.firstname} {user.lastname}
                  {isCurrentUser && (
                    <Chip
                      label="C'est vous"
                      size="small"
                      color="primary"
                      sx={{ ml: 1, verticalAlign: 'middle' }}
                    />
                  )}
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  {user.email}
                </Typography>
              </Box>

              {/* Badges */}
              <Stack direction="row" spacing={1} flexWrap="wrap">
                {isAdmin && (
                  <Chip
                    icon={<AdminIcon fontSize="small" />}
                    label="Administrateur"
                    color="error"
                    size="small"
                  />
                )}
                <Chip
                  label={`Membre depuis ${new Date(user.createdAt || Date.now()).getFullYear()}`}
                  size="small"
                  variant="outlined"
                />
              </Stack>

              {/* Bouton ajouter ami */}
              {!isCurrentUser && (
                <Box sx={{ pt: 1 }}>
                  <AddFriendButton
                    targetUserId={user.id}
                    variant="button"
                    size="medium"
                  />
                </Box>
              )}
            </Stack>
          </Grid>
        </Grid>
      </Paper>

      {/* Statistiques */}
      <Grid container spacing={2} sx={{ mb: 3 }}>
        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <PlaceIcon color="primary" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              {user.spots?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Spots créés
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <HikingIcon color="success" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              {user.hikingSpots?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Randonnées
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <StarIcon color="warning" sx={{ fontSize: 40, mb: 1 }} />
            <Typography variant="h4" fontWeight={700}>
              {(user.favoriteSpots?.length || 0) + (user.favoriteHikingSpots?.length || 0)}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Favoris
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={6} sm={3}>
          <Paper sx={{ p: 2, textAlign: 'center', borderRadius: 2 }}>
            <Typography variant="h1" sx={{ fontSize: 40, mb: 1 }}>
              👥
            </Typography>
            <Typography variant="h4" fontWeight={700}>
              {user.friends?.length || 0}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Amis
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Spots créés */}
      {user.spots && user.spots.length > 0 && (
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            📍 Spots créés par {user.firstname}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {user.spots.slice(0, 6).map((spot) => (
              <Grid item xs={12} sm={6} md={4} key={spot.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                  onClick={() => navigate(`/spot/${spot.id}`)}
                >
                  {spot.images?.[0] && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={spot.images[0]}
                      alt={spot.name}
                    />
                  )}
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                      {spot.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" noWrap>
                      {spot.city}, {spot.country}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {user.spots.length > 6 && (
            <Typography
              variant="body2"
              color="primary"
              sx={{ mt: 2, textAlign: 'center', cursor: 'pointer' }}
            >
              + {user.spots.length - 6} autres spots
            </Typography>
          )}
        </Paper>
      )}

      {/* Randonnées créées */}
      {user.hikingSpots && user.hikingSpots.length > 0 && (
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Typography variant="h6" fontWeight={700} gutterBottom>
            🥾 Randonnées de {user.firstname}
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <Grid container spacing={2}>
            {user.hikingSpots.slice(0, 6).map((hiking) => (
              <Grid item xs={12} sm={6} md={4} key={hiking.id}>
                <Card
                  sx={{
                    cursor: 'pointer',
                    transition: 'transform 0.2s',
                    '&:hover': { transform: 'translateY(-4px)' },
                  }}
                  onClick={() => navigate(`/hikingspot/${hiking.id}`)}
                >
                  {hiking.images?.[0] && (
                    <CardMedia
                      component="img"
                      height="140"
                      image={hiking.images[0]}
                      alt={hiking.name}
                    />
                  )}
                  <CardContent>
                    <Typography variant="subtitle1" fontWeight={600} noWrap>
                      {hiking.name}
                    </Typography>
                    <Stack direction="row" spacing={1} sx={{ mt: 1 }}>
                      <Chip label={`${hiking.distance || 0} km`} size="small" />
                      <Chip label={hiking.difficulty || 'N/A'} size="small" color="primary" />
                    </Stack>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
          {user.hikingSpots.length > 6 && (
            <Typography
              variant="body2"
              color="primary"
              sx={{ mt: 2, textAlign: 'center', cursor: 'pointer' }}
            >
              + {user.hikingSpots.length - 6} autres randonnées
            </Typography>
          )}
        </Paper>
      )}

      {/* Message si aucun contenu */}
      {(!user.spots || user.spots.length === 0) && (!user.hikingSpots || user.hikingSpots.length === 0) && (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 2 }}>
          <Typography variant="h6" color="text.secondary">
            {isCurrentUser
              ? "Vous n'avez pas encore créé de spots ou de randonnées"
              : `${user.firstname} n'a pas encore créé de contenu`}
          </Typography>
        </Paper>
      )}
    </Box>
  );
}