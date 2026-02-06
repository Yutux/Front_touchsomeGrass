import React, { useState, useEffect, useContext } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Avatar,
  Chip,
  CircularProgress,
  Alert,
  Stack,
  TextField,
  InputAdornment,
  Fab,
} from '@mui/material';
import {
  Groups as GroupsIcon,
  Add as AddIcon,
  Search as SearchIcon,
  Lock as LockIcon,
  Public as PublicIcon,
  Login as LoginIcon,
} from '@mui/icons-material';
import { UserContext } from '../contexts/UserContext/UserContext';
import { useNavigate } from 'react-router-dom';
import request from '../utils/request';
import CreateGroupModal from './CreateGroupModal';

export default function GroupsList() {
  const { token } = useContext(UserContext);
  const navigate = useNavigate();
  const [groups, setGroups] = useState([]);
  const [myGroups, setMyGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [joiningGroupId, setJoiningGroupId] = useState(null);

  // ✅ Fonction de chargement des groupes
  const fetchGroups = async () => {
    setLoading(true);
    try {
      // 1️⃣ Charger les groupes PUBLICS (sans auth)
      const publicRes = await request(
        'http://localhost:8088/api/v1/groupSource/public',
        'GET',
        null,
        false
      );

      console.log("🔍 Groupes publics (réponse brute):", publicRes.data);

      // Parser les groupes publics
      let publicGroupsList = [];
      if (Array.isArray(publicRes.data)) {
        publicGroupsList = publicRes.data;
      } else if (publicRes?.data?.groups && Array.isArray(publicRes.data.groups)) {
        publicGroupsList = publicRes.data.groups;
      }

      console.log("✅ Groupes publics (parsés):", publicGroupsList);

      // 2️⃣ Charger MES GROUPES (avec auth) - INCLUT publics ET privés
      if (token) {
        const myRes = await request(
          'http://localhost:8088/api/v1/groupSource/my-groups',
          'GET',
          null,
          true
        );

        console.log("🔍 Mes groupes (réponse brute):", myRes.data);

        // Parser mes groupes
        let myGroupsList = [];
        if (Array.isArray(myRes.data)) {
          myGroupsList = myRes.data;
        } else if (myRes?.data?.groups && Array.isArray(myRes.data.groups)) {
          myGroupsList = myRes.data.groups;
        }

        console.log("✅ Mes groupes (parsés):", myGroupsList);
        setMyGroups(myGroupsList);

        // 3️⃣ Filtrer les groupes publics pour exclure ceux dont je suis déjà membre
        const myGroupIds = myGroupsList.map(g => g.id);
        const filteredPublicGroups = publicGroupsList.filter(g => !myGroupIds.includes(g.id));
        
        console.log("✅ Groupes publics (après filtre):", filteredPublicGroups);
        setGroups(filteredPublicGroups);
      } else {
        // Si pas connecté, afficher tous les groupes publics
        setGroups(publicGroupsList);
      }
    } catch (error) {
      console.error("❌ Erreur lors du chargement des groupes:", error);
    } finally {
      setLoading(false);
    }
  };

  // Charger les groupes au montage et quand le token change
  useEffect(() => {
    fetchGroups();
  }, [token]);

  // Filtrer les groupes par recherche
  const filteredGroups = groups.filter((group) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      group.name?.toLowerCase().includes(searchLower) ||
      group.description?.toLowerCase().includes(searchLower)
    );
  });

  const filteredMyGroups = myGroups.filter((group) => {
    if (!searchQuery) return true;
    const searchLower = searchQuery.toLowerCase();
    return (
      group.name?.toLowerCase().includes(searchLower) ||
      group.description?.toLowerCase().includes(searchLower)
    );
  });

  // Rejoindre un groupe public
  const handleJoinGroup = async (groupId) => {
    if (!token) {
      alert('Vous devez être connecté pour rejoindre un groupe');
      return;
    }

    setJoiningGroupId(groupId);

    try {
      const response = await request(
        `http://localhost:8088/api/v1/user-relations/groups/${groupId}/members/self`,
        'POST',
        null,
        true
      );

      if (response.status === 200) {
        console.log("✅ Groupe rejoint avec succès");
        // Recharger les groupes pour mettre à jour l'affichage
        fetchGroups();
      }
    } catch (error) {
      console.error("❌ Erreur lors de l'adhésion au groupe:", error);
      alert("Erreur lors de l'adhésion au groupe");
    } finally {
      setJoiningGroupId(null);
    }
  };

  // Callback après création d'un groupe
  const handleGroupCreated = (newGroup) => {
    console.log("🎉 Groupe créé:", newGroup);
    // Recharger tous les groupes depuis le backend
    fetchGroups();
  };

  // Vérifier si un groupe est dans "Mes groupes"
  const isGroupMember = (groupId) => {
    return myGroups.some(g => g.id === groupId);
  };

  // Si pas connecté
  if (!token) {
    return (
      <Box sx={{ p: 2 }}>
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Alert severity="info">Connectez-vous pour voir et rejoindre des groupes</Alert>
        </Paper>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2 }}>
      {/* Header avec recherche */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, borderRadius: 2 }}>
        <Stack 
          direction={{ xs: 'column', sm: 'row' }} 
          justifyContent="space-between" 
          alignItems={{ xs: 'stretch', sm: 'center' }} 
          spacing={2}
        >
          <Box>
            <Typography variant="h5" fontWeight={700}>
              🏕️ Groupes
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Découvrez et rejoignez des groupes de randonneurs
            </Typography>
          </Box>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setCreateModalOpen(true)}
            sx={{ textTransform: 'none' }}
          >
            Créer un groupe
          </Button>
        </Stack>

        <TextField
          fullWidth
          size="small"
          placeholder="Rechercher un groupe..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
          sx={{ mt: 2 }}
        />
      </Paper>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          {/* Mes groupes (PUBLICS + PRIVÉS) */}
          {filteredMyGroups.length > 0 && (
            <Box sx={{ mb: 4 }}>
              <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
                Mes groupes ({filteredMyGroups.length})
              </Typography>
              <Grid container spacing={2}>
                {filteredMyGroups.map((group) => (
                  <Grid item xs={12} sm={6} md={4} key={group.id}>
                    <GroupCard
                      group={group}
                      isMember={true}
                      onJoin={handleJoinGroup}
                      joiningId={joiningGroupId}
                    />
                  </Grid>
                ))}
              </Grid>
            </Box>
          )}

          {/* Groupes publics (SAUF ceux dont je suis membre) */}
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
              Groupes publics ({filteredGroups.length})
            </Typography>
            {filteredGroups.length === 0 ? (
              <Paper sx={{ p: 3, textAlign: 'center' }}>
                <Typography variant="body1" color="text.secondary">
                  {searchQuery
                    ? 'Aucun groupe ne correspond à votre recherche'
                    : 'Aucun groupe public disponible'}
                </Typography>
              </Paper>
            ) : (
              <Grid container spacing={2}>
                {filteredGroups.map((group) => (
                  <Grid item xs={12} sm={6} md={4} key={group.id}>
                    <GroupCard
                      group={group}
                      isMember={isGroupMember(group.id)}
                      onJoin={handleJoinGroup}
                      joiningId={joiningGroupId}
                    />
                  </Grid>
                ))}
              </Grid>
            )}
          </Box>
        </>
      )}

      {/* FAB pour créer un groupe (mobile) */}
      <Fab
        color="primary"
        onClick={() => setCreateModalOpen(true)}
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
          display: { xs: 'flex', sm: 'none' },
        }}
      >
        <AddIcon />
      </Fab>

      {/* Modal de création */}
      <CreateGroupModal
        open={createModalOpen}
        onClose={() => setCreateModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </Box>
  );
}

/**
 * Composant de carte de groupe
 */
function GroupCard({ group, isMember, onJoin, joiningId }) {
  const navigate = useNavigate();
  const isJoining = joiningId === group.id;

  return (
    <Card
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 2,
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4,
        },
      }}
    >
      <CardContent sx={{ flexGrow: 1 }}>
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main', width: 48, height: 48 }}>
            <GroupsIcon />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle1" fontWeight={700} noWrap>
              {group.name}
            </Typography>
            <Chip
              size="small"
              icon={group.isPrivate ? <LockIcon fontSize="small" /> : <PublicIcon fontSize="small" />}
              label={group.isPrivate ? 'Privé' : 'Public'}
              sx={{ height: 20, fontSize: 11 }}
            />
          </Box>
        </Stack>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
            minHeight: 60,
          }}
        >
          {group.description || 'Aucune description'}
        </Typography>

        <Stack direction="row" spacing={1} sx={{ mt: 2 }}>
          <Chip size="small" label={`${group.memberCount || 0} membres`} />
          {group.ownerName && (
            <Chip size="small" label={`Par ${group.ownerName}`} variant="outlined" />
          )}
        </Stack>
      </CardContent>

      <CardActions sx={{ p: 2, pt: 0 }}>
        {isMember ? (
          <Button
            fullWidth
            variant="outlined"
            onClick={() => navigate(`/groups/${group.id}`)}
            sx={{ textTransform: 'none' }}
          >
            Voir le groupe
          </Button>
        ) : (
          <Button
            fullWidth
            variant="contained"
            startIcon={isJoining ? <CircularProgress size={16} /> : <LoginIcon />}
            onClick={() => onJoin(group.id)}
            disabled={isJoining}
            sx={{ textTransform: 'none' }}
          >
            {isJoining ? 'Adhésion...' : 'Rejoindre'}
          </Button>
        )}
      </CardActions>
    </Card>
  );
}