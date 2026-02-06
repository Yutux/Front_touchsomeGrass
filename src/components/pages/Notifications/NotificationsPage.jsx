// src/pages/Notifications/NotificationsPage.jsx
// 🔥 VERSION UNIFIÉE : Invitations de groupe + Demandes d'ami

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
  Groups as GroupsIcon,
  People as PeopleIcon,
  Check as CheckIcon,
  Close as CloseIcon,
  Refresh as RefreshIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { UserContext } from '../../contexts/UserContext/UserContext';
import { useNotifications } from '../../contexts/NotificationsContext/NotificationsContext'; 
import request from '../../utils/request';

const DEFAULT_AVATAR = "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp";

function TabPanel({ children, value, index }) {
  return (
    <div role="tabpanel" hidden={value !== index}>
      {value === index && <Box sx={{ pt: 2 }}>{children}</Box>}
    </div>
  );
}

export default function NotificationsPage() {
  const { token } = useContext(UserContext);
  const { decrementUnread, refresh: refreshCount } = useNotifications();
  const [tab, setTab] = useState(0);
  const [loading, setLoading] = useState(true);
  
  // Invitations de groupe
  const [groupInvitations, setGroupInvitations] = useState([]);
  
  // Demandes d'ami
  const [friendRequests, setFriendRequests] = useState([]);
  
  const [error, setError] = useState('');

  // Charger toutes les notifications
  const loadNotifications = async () => {
    if (!token) {
      setError("Vous devez être connecté pour voir vos notifications");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    try {
      const [groupInvRes, friendReqRes] = await Promise.allSettled([
        request('http://localhost:8088/api/v1/user-relations/groups/invitations/pending', 'GET', null, true),
        request('http://localhost:8088/api/v1/friend-requests/received', 'GET', null, true),
      ]);

      if (groupInvRes.status === 'fulfilled' && groupInvRes.value?.data?.invitations) {
        setGroupInvitations(groupInvRes.value.data.invitations);
      }

      if (friendReqRes.status === 'fulfilled' && friendReqRes.value?.data?.requests) {
        setFriendRequests(friendReqRes.value.data.requests);
      }

      refreshCount();
    } catch (err) {
      console.error('Erreur lors du chargement des notifications:', err);
      setError('Impossible de charger les notifications');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadNotifications();
  }, [token]); // eslint-disable-line

  // ========================================
  // INVITATIONS DE GROUPE
  // ========================================

  const handleAcceptGroupInvitation = async (invitationId) => {
    try {
      const response = await request(
        `http://localhost:8088/api/v1/user-relations/groups/invitations/${invitationId}/accept`,
        'POST',
        null,
        true
      );

      if (response.status === 200) {
        setGroupInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        decrementUnread();
        alert('✅ Invitation acceptée ! Vous êtes maintenant membre du groupe.');
      } else {
        alert(response.data?.message || 'Erreur lors de l\'acceptation');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    }
  };

  const handleDeclineGroupInvitation = async (invitationId) => {
    try {
      const response = await request(
        `http://localhost:8088/api/v1/user-relations/groups/invitations/${invitationId}/decline`,
        'POST',
        null,
        true
      );

      if (response.status === 200) {
        setGroupInvitations(prev => prev.filter(inv => inv.id !== invitationId));
        decrementUnread();
        alert('❌ Invitation refusée');
      } else {
        alert(response.data?.message || 'Erreur lors du refus');
      }
    } catch (error) {
      console.error('Erreur:', error);
      alert('Une erreur est survenue');
    }
  };

  // ========================================
  // DEMANDES D'AMI
  // ========================================

  const handleAcceptFriendRequest = async (requestId) => {
    try {
      const response = await request(
        `http://localhost:8088/api/v1/friend-requests/${requestId}/accept`,
        'POST',
        null,
        true
      );

      if (response.status === 200) {
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
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

  const handleDeclineFriendRequest = async (requestId) => {
    try {
      const response = await request(
        `http://localhost:8088/api/v1/friend-requests/${requestId}/decline`,
        'POST',
        null,
        true
      );

      if (response.status === 200) {
        setFriendRequests(prev => prev.filter(req => req.id !== requestId));
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

  // ========================================
  // UTILITAIRES
  // ========================================

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

  const pendingGroupInvCount = groupInvitations.filter(inv => inv.status === 'PENDING').length;
  const pendingFriendReqCount = friendRequests.filter(req => req.status === 'PENDING').length;
  const totalPending = pendingGroupInvCount + pendingFriendReqCount;

  if (!token) {
    return (
      <Box sx={{ p: 3, maxWidth: 900, mx: 'auto' }}>
        <Alert severity="warning">
          Vous devez être connecté pour voir vos notifications
        </Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: { xs: 2, sm: 3 }, maxWidth: 900, mx: 'auto' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <NotificationsIcon sx={{ fontSize: 32, color: 'primary.main' }} />
          <Typography variant="h4" fontWeight={700}>
            Notifications
          </Typography>
          {totalPending > 0 && (
            <Chip label={`${totalPending} en attente`} color="error" size="small" />
          )}
        </Box>
        <IconButton 
          onClick={() => {
            loadNotifications();
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
                <PeopleIcon fontSize="small" />
                Demandes d'ami
                {pendingFriendReqCount > 0 && (
                  <Badge badgeContent={pendingFriendReqCount} color="error" />
                )}
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <GroupsIcon fontSize="small" />
                Invitations groupe
                {pendingGroupInvCount > 0 && (
                  <Badge badgeContent={pendingGroupInvCount} color="error" />
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
            {/* ============================================ */}
            {/* ONGLET 1 : DEMANDES D'AMI */}
            {/* ============================================ */}
            <TabPanel value={tab} index={0}>
              {friendRequests.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    Aucune demande d'ami
                  </Typography>
                </Box>
              ) : (
                <List>
                  {friendRequests.map((request, index) => (
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
                                Demande d'ami
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
                                onClick={() => handleAcceptFriendRequest(request.id)}
                                sx={{ textTransform: 'none' }}
                              >
                                Accepter
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<CloseIcon />}
                                onClick={() => handleDeclineFriendRequest(request.id)}
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
                      {index < friendRequests.length - 1 && <Divider />}
                    </React.Fragment>
                  ))}
                </List>
              )}
            </TabPanel>

            {/* ============================================ */}
            {/* ONGLET 2 : INVITATIONS DE GROUPE */}
            {/* ============================================ */}
            <TabPanel value={tab} index={1}>
              {groupInvitations.length === 0 ? (
                <Box sx={{ p: 4, textAlign: 'center' }}>
                  <Typography color="text.secondary">
                    Aucune invitation de groupe
                  </Typography>
                </Box>
              ) : (
                <List>
                  {groupInvitations.map((invitation, index) => (
                    <React.Fragment key={invitation.id}>
                      <ListItem
                        sx={{
                          py: 2,
                          flexDirection: { xs: 'column', sm: 'row' },
                          alignItems: { xs: 'flex-start', sm: 'center' },
                          gap: 2,
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar sx={{ bgcolor: 'primary.main' }}>
                            <GroupsIcon />
                          </Avatar>
                        </ListItemAvatar>

                        <ListItemText
                          primary={
                            <Typography variant="subtitle1" fontWeight={600}>
                              Invitation au groupe "{invitation.groupName}"
                            </Typography>
                          }
                          secondary={
                            <Stack spacing={0.5} sx={{ mt: 0.5 }}>
                              <Typography variant="body2" color="text.secondary">
                                Invité par {invitation.inviterName || 'Inconnu'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary">
                                {formatDate(invitation.createdAt)}
                              </Typography>
                            </Stack>
                          }
                          sx={{ flex: 1 }}
                        />

                        <Stack direction="row" spacing={1}>
                          {invitation.status === 'PENDING' ? (
                            <>
                              <Button
                                variant="contained"
                                color="success"
                                size="small"
                                startIcon={<CheckIcon />}
                                onClick={() => handleAcceptGroupInvitation(invitation.id)}
                                sx={{ textTransform: 'none' }}
                              >
                                Accepter
                              </Button>
                              <Button
                                variant="outlined"
                                color="error"
                                size="small"
                                startIcon={<CloseIcon />}
                                onClick={() => handleDeclineGroupInvitation(invitation.id)}
                                sx={{ textTransform: 'none' }}
                              >
                                Refuser
                              </Button>
                            </>
                          ) : (
                            <Chip
                              label={invitation.status === 'ACCEPTED' ? 'Acceptée' : 'Refusée'}
                              color={invitation.status === 'ACCEPTED' ? 'success' : 'default'}
                              size="small"
                            />
                          )}
                        </Stack>
                      </ListItem>
                      {index < groupInvitations.length - 1 && <Divider />}
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