// src/pages/Social/GroupDetails.jsx
import React, { useState, useEffect, useContext, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  IconButton,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Card,
  CardContent,
  Badge,
} from '@mui/material';
import {
  Groups as GroupsIcon,
  MoreVert as MoreVertIcon,
  PersonAdd as PersonAddIcon,
  ExitToApp as ExitIcon,
  Delete as DeleteIcon,
  AdminPanelSettings as AdminIcon,
  Edit as EditIcon,
  Settings as SettingsIcon,
  Chat as ChatIcon,
} from '@mui/icons-material';
import { UserContext } from '../contexts/UserContext/UserContext'; 
import request from '../utils/request';
import InviteToGroupModal from '../../components/Social/InviteToGroupModal';
import ChatWindow from '../../components/Chat/ChatWindow';
import useChat from '../../hooks/useChat';

const DEFAULT_AVATAR = "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp";

const ROLE_LABELS = {
  OWNER: { label: 'Créateur', color: 'error', icon: '👑' },
  ADMIN: { label: 'Admin', color: 'warning', icon: '⭐' },
  MODERATOR: { label: 'Modérateur', color: 'info', icon: '🛡️' },
  MEMBER: { label: 'Membre', color: 'default', icon: '👤' },
};

export default function GroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { token, user } = useContext(UserContext);
  const { selectConversation } = useChat();
  
  const [group, setGroup] = useState(null);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(user?.id || null);
  const [userRole, setUserRole] = useState(null);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [selectedMember, setSelectedMember] = useState(null);
  const [leaveDialogOpen, setLeaveDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [groupConversationId, setGroupConversationId] = useState(null);

  // ✅ Ref pour éviter les appels multiples
  const conversationInitialized = useRef(false);

  // Récupérer l'utilisateur connecté
  useEffect(() => {
    if (!token || userId) return;

    const fetchUser = async () => {
      try {
        const res = await request(
          "http://localhost:8088/api/v1/auth/user",
          "GET",
          null,
          true
        );
        if (res.status === 200 && res.data?.userApp) {
          setUserId(res.data.userApp.id);
        }
      } catch (error) {
        console.error("Erreur:", error);
      }
    };

    fetchUser();
  }, [token, userId]);

  // ✅ Reset quand on change de groupe
  useEffect(() => {
    conversationInitialized.current = false;
    setGroupConversationId(null);
    setGroup(null);
    setMembers([]);
    setUserRole(null);
  }, [id]);

  // 🔥 Charger ou créer la conversation du groupe - UNE SEULE FOIS
  useEffect(() => {
    if (!id || !userId || conversationInitialized.current) return;

    const setupGroupConversation = async () => {
      setLoading(true);
      try {
        // 1️⃣ Charger les détails du groupe
        const groupRes = await request(
          `http://localhost:8088/api/v1/groupSource/details/${id}`,
          'GET',
          null,
          true
        );

        if (groupRes?.data?.group) {
          setGroup(groupRes.data.group);
        }

        // 2️⃣ Charger les membres du groupe
        const membersRes = await request(
          `http://localhost:8088/api/v1/groupSource/${id}/members`,
          'GET',
          null,
          true
        );

        if (membersRes?.data?.members) {
          setMembers(membersRes.data.members);
          
          const userMember = membersRes.data.members.find(m => m.userId === userId);
          setUserRole(userMember?.role || null);
        }

        // 3️⃣ Charger toutes les conversations pour trouver celle du groupe
        const convsRes = await request(
          `http://localhost:8088/api/v1/user-relations/conversations`,
          'GET',
          null,
          true
        );

        let existingConversation = null;
        
        if (convsRes?.data?.conversations) {
          existingConversation = convsRes.data.conversations.find(
            conv => conv.type === 'GROUP' && conv.group?.id === parseInt(id)
          );
        }

        // 4️⃣ Si pas de conversation, en créer une
        if (!existingConversation) {
          console.log('📝 Création conversation pour groupe', id);
          const createConvRes = await request(
            `http://localhost:8088/api/v1/user-relations/groups/${id}/conversations`,
            'POST',
            {
              title: groupRes?.data?.group?.name || 'Discussion du groupe',
            },
            true
          );

          if (createConvRes?.data?.conversation) {
            existingConversation = createConvRes.data.conversation;
          }
        }

        // 5️⃣ Sélectionner la conversation UNE SEULE FOIS
        if (existingConversation) {
          console.log('✅ Conversation trouvée/créée:', existingConversation.id);
          setGroupConversationId(existingConversation.id);
          selectConversation(existingConversation.id);
          conversationInitialized.current = true; // ✅ Marquer comme initialisé
        }

      } catch (error) {
        console.error("Erreur lors du chargement du groupe:", error);
      } finally {
        setLoading(false);
      }
    };

    setupGroupConversation();
  }, [id, userId, selectConversation]); // ✅ Dépendances minimales

  const isOwner = userRole === 'OWNER';
  const isAdmin = userRole === 'ADMIN' || isOwner;
  const isModerator = userRole === 'MODERATOR' || isAdmin;

  const handleLeaveGroup = async () => {
    if (!userId) return;

    try {
      const response = await request(
        `http://localhost:8088/api/v1/groupSource/${id}/leave`,
        'POST',
        null,
        true
      );

      if (response.status === 200) {
        navigate('/groups');
      }
    } catch (error) {
      console.error("Erreur lors de la sortie du groupe:", error);
      alert("Erreur lors de la sortie du groupe");
    }
  };

  const handleDeleteGroup = async () => {
    try {
      const response = await request(
        `http://localhost:8088/api/v1/groupSource/delete/${id}`,
        'DELETE',
        null,
        true
      );

      if (response.status === 200) {
        navigate('/groups');
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du groupe:", error);
      alert("Erreur lors de la suppression du groupe");
    }
  };

  const handleRemoveMember = async (memberId) => {
    try {
      const response = await request(
        `http://localhost:8088/api/v1/groupSource/${id}/members/remove/${memberId}`,
        'DELETE',
        null,
        true
      );

      if (response.status === 200) {
        setMembers(prev => prev.filter(m => m.userId !== memberId));
        setMenuAnchor(null);
        setSelectedMember(null);
      }
    } catch (error) {
      console.error("Erreur lors de la suppression du membre:", error);
      alert("Erreur lors de la suppression du membre");
    }
  };

  const handleChangeRole = async (memberId, newRole) => {
    try {
      const response = await request(
        `http://localhost:8088/api/v1/groupSource/${id}/members/${memberId}/role?newRole=${newRole}`,
        'PUT',
        { role: newRole },
        true
      );

      if (response.status === 200) {
        setMembers(prev =>
          prev.map(m => m.userId === memberId ? { ...m, role: newRole } : m)
        );
        setMenuAnchor(null);
        setSelectedMember(null);
      }
    } catch (error) {
      console.error("Erreur lors du changement de rôle:", error);
      alert("Erreur lors du changement de rôle");
    }
  };

  const handleMemberMenuOpen = (event, member) => {
    setMenuAnchor(event.currentTarget);
    setSelectedMember(member);
  };

  const handleMemberMenuClose = () => {
    setMenuAnchor(null);
    setSelectedMember(null);
  };

  if (!token) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', maxWidth: 900, mx: 'auto', mt: 3 }}>
        <Alert severity="info">Connectez-vous pour voir ce groupe</Alert>
      </Paper>
    );
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!group) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center', maxWidth: 900, mx: 'auto', mt: 3 }}>
        <Alert severity="error">Groupe introuvable</Alert>
      </Paper>
    );
  }

  return (
    <Box sx={{ height: 'calc(100vh - 100px)', p: 2 }}>
      {/* Header du groupe */}
      <Paper sx={{ p: 2, mb: 2, borderRadius: 2 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56 }}>
            <GroupsIcon sx={{ fontSize: 32 }} />
          </Avatar>
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700}>
              {group.name}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 0.5 }}>
              <Chip
                size="small"
                label={group.isPrivate ? '🔒 Privé' : '🌍 Public'}
                sx={{ height: 24 }}
              />
              <Chip
                size="small"
                label={`${members.length} membres`}
                variant="outlined"
                sx={{ height: 24 }}
              />
              {userRole && (
                <Chip
                  size="small"
                  icon={<span>{ROLE_LABELS[userRole].icon}</span>}
                  label={ROLE_LABELS[userRole].label}
                  color={ROLE_LABELS[userRole].color}
                  sx={{ height: 24 }}
                />
              )}
            </Stack>
          </Box>
          <Stack direction="row" spacing={1}>
            {isModerator && (
              <Button
                variant="contained"
                size="small"
                startIcon={<PersonAddIcon />}
                onClick={() => setInviteModalOpen(true)}
                sx={{ textTransform: 'none' }}
              >
                Inviter
              </Button>
            )}
            {!isOwner && (
              <Button
                variant="outlined"
                size="small"
                color="error"
                startIcon={<ExitIcon />}
                onClick={() => setLeaveDialogOpen(true)}
                sx={{ textTransform: 'none' }}
              >
                Quitter
              </Button>
            )}
          </Stack>
        </Stack>
      </Paper>

      {/* Layout 3 colonnes */}
      <Grid container spacing={2} sx={{ height: 'calc(100% - 100px)' }}>
        {/* COLONNE GAUCHE - Membres */}
        <Grid item xs={12} md={3} sx={{ height: '100%' }}>
          <Paper sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={700}>
                Membres ({members.length})
              </Typography>
            </Box>
            <List sx={{ flex: 1, overflow: 'auto', py: 1 }}>
              {members.map((member) => (
                <ListItem
                  key={member.userId}
                  secondaryAction={
                    isOwner && member.userId !== userId && member.role !== 'OWNER' && (
                      <IconButton
                        size="small"
                        onClick={(e) => handleMemberMenuOpen(e, member)}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    )
                  }
                  sx={{
                    px: 2,
                    py: 1,
                    '&:hover': { bgcolor: 'action.hover' },
                  }}
                >
                  <ListItemAvatar>
                    <Badge
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        <span style={{ fontSize: 12 }}>
                          {ROLE_LABELS[member.role]?.icon}
                        </span>
                      }
                    >
                      <Avatar 
                        src={member.avatar || DEFAULT_AVATAR}
                        sx={{ width: 40, height: 40 }}
                      >
                        {member.firstname?.[0]}{member.lastname?.[0]}
                      </Avatar>
                    </Badge>
                  </ListItemAvatar>
                  <ListItemText
                    primary={
                      <Typography variant="subtitle2" fontWeight={600} noWrap>
                        {member.firstname} {member.lastname}
                      </Typography>
                    }
                    secondary={
                      <Typography variant="caption" color="text.secondary" noWrap>
                        {ROLE_LABELS[member.role]?.label}
                      </Typography>
                    }
                  />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>

        {/* COLONNE CENTRE - Chat */}
        <Grid item xs={12} md={isOwner ? 6 : 9} sx={{ height: '100%' }}>
          <Paper sx={{ height: '100%', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            <Box sx={{ p: 2, borderBottom: 1, borderColor: 'divider' }}>
              <Stack direction="row" alignItems="center" spacing={1}>
                <ChatIcon color="primary" />
                <Typography variant="h6" fontWeight={700}>
                  Discussion du groupe
                </Typography>
                {groupConversationId && (
                  <Chip 
                    size="small" 
                    label="✓ Connecté" 
                    color="success" 
                    sx={{ height: 20 }} 
                  />
                )}
              </Stack>
            </Box>
            <Box sx={{ flex: 1, overflow: 'hidden' }}>
              {groupConversationId ? (
                <ChatWindow />
              ) : (
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                  <Alert severity="info">
                    Chargement de la conversation...
                  </Alert>
                </Box>
              )}
            </Box>
          </Paper>
        </Grid>

        {/* COLONNE DROITE - Actions (seulement pour le créateur) */}
        {isOwner && (
          <Grid item xs={12} md={3} sx={{ height: '100%' }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              {/* Informations */}
              <Card>
                <CardContent>
                  <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 2 }}>
                    <SettingsIcon color="primary" />
                    <Typography variant="h6" fontWeight={700}>
                      Gestion
                    </Typography>
                  </Stack>

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    En tant que créateur, vous pouvez gérer ce groupe.
                  </Typography>

                  <Stack spacing={1}>
                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<EditIcon />}
                      sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                      onClick={() => {/* TODO: Éditer le groupe */}}
                    >
                      Modifier le groupe
                    </Button>

                    <Button
                      fullWidth
                      variant="outlined"
                      startIcon={<PersonAddIcon />}
                      sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                      onClick={() => setInviteModalOpen(true)}
                    >
                      Inviter des membres
                    </Button>

                    <Divider sx={{ my: 1 }} />

                    <Button
                      fullWidth
                      variant="outlined"
                      color="error"
                      startIcon={<DeleteIcon />}
                      sx={{ textTransform: 'none', justifyContent: 'flex-start' }}
                      onClick={() => setDeleteDialogOpen(true)}
                    >
                      Supprimer le groupe
                    </Button>
                  </Stack>
                </CardContent>
              </Card>

              {/* Statistiques */}
              <Card>
                <CardContent>
                  <Typography variant="subtitle2" fontWeight={700} sx={{ mb: 2 }}>
                    📊 Statistiques
                  </Typography>
                  <Stack spacing={1}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Membres
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {members.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Admins
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {members.filter(m => m.role === 'ADMIN').length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Typography variant="body2" color="text.secondary">
                        Modérateurs
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {members.filter(m => m.role === 'MODERATOR').length}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Stack>
          </Grid>
        )}
      </Grid>

      {/* Menu d'actions sur un membre */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMemberMenuClose}
      >
        {isOwner && selectedMember && (
          <>
            <MenuItem onClick={() => handleChangeRole(selectedMember.userId, 'ADMIN')}>
              <AdminIcon sx={{ mr: 1 }} fontSize="small" />
              Nommer administrateur
            </MenuItem>
            <MenuItem onClick={() => handleChangeRole(selectedMember.userId, 'MODERATOR')}>
              <EditIcon sx={{ mr: 1 }} fontSize="small" />
              Nommer modérateur
            </MenuItem>
            <MenuItem onClick={() => handleChangeRole(selectedMember.userId, 'MEMBER')}>
              Rétrograder en membre
            </MenuItem>
            <Divider />
          </>
        )}
        <MenuItem
          onClick={() => selectedMember && handleRemoveMember(selectedMember.userId)}
          sx={{ color: 'error.main' }}
        >
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" />
          Retirer du groupe
        </MenuItem>
      </Menu>

      {/* Dialog de confirmation de départ */}
      <Dialog open={leaveDialogOpen} onClose={() => setLeaveDialogOpen(false)}>
        <DialogTitle>Quitter le groupe ?</DialogTitle>
        <DialogContent>
          <Typography>
            Êtes-vous sûr de vouloir quitter ce groupe ? Vous devrez être réinvité pour le rejoindre.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setLeaveDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Annuler
          </Button>
          <Button
            onClick={handleLeaveGroup}
            color="error"
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            Quitter
          </Button>
        </DialogActions>
      </Dialog>

      {/* Dialog de suppression du groupe */}
      <Dialog open={deleteDialogOpen} onClose={() => setDeleteDialogOpen(false)}>
        <DialogTitle>⚠️ Supprimer le groupe ?</DialogTitle>
        <DialogContent>
          <Alert severity="error" sx={{ mb: 2 }}>
            Cette action est irréversible !
          </Alert>
          <Typography>
            Tous les membres seront retirés et toutes les conversations seront supprimées.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} sx={{ textTransform: 'none' }}>
            Annuler
          </Button>
          <Button
            onClick={handleDeleteGroup}
            color="error"
            variant="contained"
            sx={{ textTransform: 'none' }}
          >
            Supprimer définitivement
          </Button>
        </DialogActions>
      </Dialog>

      {/* Modal d'invitation */}
      <InviteToGroupModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        groupId={id}
        currentMembers={members}
      />
    </Box>
  );
}