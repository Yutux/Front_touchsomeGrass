// src/pages/Social/FriendRequestsPage.jsx
import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Avatar,
  Button,
  Stack,
  Chip,
  CircularProgress,
  Alert,
  Divider,
  IconButton,
  Badge,
} from '@mui/material';
import {
  PersonAdd as PersonAddIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  People as PeopleIcon,
} from '@mui/icons-material';
import { UserContext } from '../../contexts/UserContext/UserContext'; 
import { useFriendRequests } from '../../contexts/Friendrequestscontext/Friendrequestscontext';
import request from '../../utils/request';

const DEFAULT_AVATAR = "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp";

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function FriendRequestsPage() {
  const { token } = useContext(UserContext);
  const { decrementUnread, refresh: refreshCount } = useFriendRequests();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [error, setError] = useState('');

  // Charger les demandes d'ami
  const loadRequests = async () => {
    if (!token) {
      setError("Vous devez être connecté pour voir vos demandes d'ami");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [receivedRes, sentRes] = await Promise.allSettled([
        request('http://localhost:8088/api/v1/friend-requests/received', 'GET', null, true),
        request('http://localhost:8088/api/v1/friend-requests/sent', 'GET', null, true),
      ]);

      if (receivedRes.status === 'fulfilled' && receivedRes.value?.data?.requests) {
        setReceivedRequests(receivedRes.value.data.requests);
      }

      if (sentRes.status === 'fulfilled' && sentRes.value?.data?.requests) {
        setSentRequests(sentRes.value.data.requests);
      }

      refreshCount();
    } catch (err) {
      console.error('Erreur lors du chargement des demandes:', err);
      setError('Impossible de charger les demandes d\'ami');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRequests();
  }, [token]); // eslint-disable-line

  // Accepter une demande
  const handleAccept = async (requestId) => {
    try {
      const response = await request(
        `http://localhost:8088/api/v1/friend-requests/${requestId}/accept`,
        'POST',
        null,
        true
      );

      if (response.status === 200) {
        setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
        decrementUnread();
        alert('✅ Demande acceptée ! Vous êtes maintenant amis.');
      } else {
        alert(response.data?.message || 'Erreur lors de l\'acceptation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    }
  };

  // Refuser une demande
  const handleDecline = async (requestId) => {
    try {
      const response = await request(
        `http://localhost:8088/api/v1/friend-requests/${requestId}/decline`,
        'POST',
        null,
        true
      );

      if (response.status === 200) {
        setReceivedRequests(prev => prev.filter(req => req.id !== requestId));
        decrementUnread();
        alert('❌ Demande refusée');
      } else {
        alert(response.data?.message || 'Erreur lors du refus');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    }
  };

  // Annuler une demande envoyée
  const handleCancel = async (requestId) => {
    try {
      const response = await request(
        `http://localhost:8088/api/v1/friend-requests/${requestId}`,
        'DELETE',
        null,
        true
      );

      if (response.status === 200) {
        setSentRequests(prev => prev.filter(req => req.id !== requestId));
        alert('✅ Demande annulée');
      } else {
        alert(response.data?.message || 'Erreur lors de l\'annulation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const pendingReceivedCount = receivedRequests.filter(req => req.status === 'PENDING').length;
  const pendingSentCount = sentRequests.filter(req => req.status === 'PENDING').length;

  if (!token) {
    return (
      <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
        <Alert severity="warning">
          Vous devez être connecté pour voir vos demandes d'ami
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <PeopleIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            Demandes d'ami
          </Typography>
        </Box>
        <IconButton 
          onClick={() => {
            loadRequests();
            refreshCount();
          }} 
          disabled={loading}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Tabs */}
      <Paper sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <Tabs
          value={tab}
          onChange={(e, newValue) => setTab(newValue)}
          variant="fullWidth"
          sx={{
            borderBottom: 1,
            borderColor: 'divider',
            '& .MuiTab-root': { textTransform: 'none', fontWeight: 600 },
          }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Reçues
                {pendingReceivedCount > 0 && (
                  <Badge badgeContent={pendingReceivedCount} color="error" />
                )}
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                Envoyées
                {pendingSentCount > 0 && (
                  <Badge badgeContent={pendingSentCount} color="primary" />
                )}
              </Box>
            }
          />
        </Tabs>

        {/* Contenu */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Box sx={{ p: 3 }}>
            <Alert severity="error">{error}</Alert>
          </Box>
        ) : (
          <>
            {/* Onglet Demandes reçues */}
            <TabPanel value={tab} index={0}>
              {receivedRequests.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    Aucune demande d'ami reçue
                  </Typography>
                </Box>
              ) : (
                <List>
                  {receivedRequests.map((request, index) => (
                    <React.Fragment key={request.id}>
                      <ListItem
                        sx={{
                          py: 2,
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          gap: 2,
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar src={request.senderAvatar || DEFAULT_AVATAR}>
                            {request.senderFirstname?.[0]}{request.senderLastname?.[0]}
                          </Avatar>
                        </ListItemAvatar>

                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight={600}>
                              {request.senderFirstname} {request.senderLastname}
                            </Typography>
                          }
                          secondary={
                            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                {request.senderEmail}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(request.createdAt)}
                              </Typography>
                            </Stack>
                          }
                          sx={{ flex: 1 }}
                        />

                        <Stack direction="row" spacing={1}>
                          {request.status === 'PENDING' ? (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<CheckIcon />}
                                onClick={() => handleAccept(request.id)}
                                sx={{ textTransform: 'none' }}
                              >
                                Accepter
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<CloseIcon />}
                                onClick={() => handleDecline(request.id)}
                                sx={{ textTransform: 'none' }}
                              >
                                Refuser
                              </Button>
                            </>
                          ) : (
                            <Chip
                              label={request.status === 'ACCEPTED' ? 'Acceptée' : 'Refusée'}
                              color={request.status === 'ACCEPTED' ? 'success' : 'default'}
                              size="small"
                            />
                          )}
                        </Stack>
                      </ListItem>
                      {index < receivedRequests.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </TabPanel>

            {/* Onglet Demandes envoyées */}
            <TabPanel value={tab} index={1}>
              {sentRequests.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    Aucune demande d'ami envoyée
                  </Typography>
                </Box>
              ) : (
                <List>
                  {sentRequests.map((request, index) => (
                    <React.Fragment key={request.id}>
                      <ListItem
                        sx={{
                          py: 2,
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          gap: 2,
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar src={request.receiverAvatar || DEFAULT_AVATAR}>
                            {request.receiverFirstname?.[0]}{request.receiverLastname?.[0]}
                          </Avatar>
                        </ListItemAvatar>

                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight={600}>
                              {request.receiverFirstname} {request.receiverLastname}
                            </Typography>
                          }
                          secondary={
                            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                {request.receiverEmail}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(request.createdAt)}
                              </Typography>
                            </Stack>
                          }
                          sx={{ flex: 1 }}
                        />

                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={
                              request.status === 'PENDING'
                                ? 'En attente'
                                : request.status === 'ACCEPTED'
                                ? 'Acceptée'
                                : 'Refusée'
                            }
                            color={
                              request.status === 'PENDING'
                                ? 'warning'
                                : request.status === 'ACCEPTED'
                                ? 'success'
                                : 'default'
                            }
                            size="small"
                          />
                          {request.status === 'PENDING' && (
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleCancel(request.id)}
                              title="Annuler la demande"
                            >
                              <CloseIcon fontSize="small" />
                            </IconButton>
                          )}
                        </Stack>
                      </ListItem>
                      {index < sentRequests.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </TabPanel>
          </>
        )}
      </Paper>
    </Box>
  );
}