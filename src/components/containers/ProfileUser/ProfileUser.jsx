// src/containers/ProfileUser/ProfileUser.jsx
import React, { useContext, useEffect, useMemo, useState } from "react";
import { Navigate } from "react-router-dom";
import { UserContext } from "../../contexts/UserContext/UserContext";
import request from "../../utils/request";
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  CircularProgress,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Modal,
  Stack,
  Tab,
  Tabs,
  TextField,
  Tooltip,
  Typography,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Edit as EditIcon,
  Logout as LogoutIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  CalendarMonth as CalendarIcon,
  WorkspacePremium as PremiumIcon,
  Shield as ShieldIcon,
  Favorite as FavoriteIcon,
  Place as PlaceIcon,
  CheckCircle as CheckIcon,
} from "@mui/icons-material";

/* utils */
function fmtDate(d) {
  if (!d) return "—";
  const date = typeof d === "string" || typeof d === "number" ? new Date(d) : d;
  return Number.isNaN(date.getTime())
    ? "—"
    : date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}
function getRoles(user) {
  if (!user) return [];
  if (Array.isArray(user.roles)) {
    if (typeof user.roles[0] === "string") return user.roles;
    return user.roles.map((r) => (typeof r === "string" ? r : r?.authority)).filter(Boolean);
  }
  return [];
}

/* assets */
const COVER_URL =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?q=80&w=1920&auto=format&fit=crop";
const DEFAULT_AVATAR =
  "https://mdbcdn.b-cdn.net/img/Photos/new-templates/bootstrap-profiles/avatar-1.webp";

export default function ProfileUser() {
  const theme = useTheme();
  const isMdUp = useMediaQuery(theme.breakpoints.up("md"));
  const isXs = useMediaQuery(theme.breakpoints.down("sm"));

  const { token, setToken } = useContext(UserContext);
  const [user, setUser] = useState(null);
  const [redirect, setRedirect] = useState(false);
  const [tab, setTab] = useState(0);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    if (!token) {
      setRedirect(true);
      return;
    }
    (async () => {
      try {
        const res = await request(
          "http://localhost:8088/AUTH-SERVICE/api/v1/auth/user",
          "GET",
          {},
          true
        );
        if (res.status === 200 && res.data.userApp) setUser(res.data.userApp);
        else setRedirect(true);
      } catch (e) {
        console.error("Erreur profil :", e);
        setRedirect(true);
      }
    })();
  }, [token]);

  const logOut = () => {
    localStorage.removeItem("token");
    setToken?.(null);
    setRedirect(true);
  };

  const roles = useMemo(() => getRoles(user), [user]);
  const isAdmin = roles.some((r) => String(r).toUpperCase().includes("ADMIN"));

  if (redirect) return <Navigate to="/login" replace />;
  if (!user)
    return (
      <Box sx={{ minHeight: "60vh", display: "flex", alignItems: "center", justifyContent: "center", gap: 2, px: 2 }}>
        <CircularProgress color="error" />
        <Typography variant="h6">Chargement du profil…</Typography>
      </Box>
    );

  const fullname = `${user.lastname || ""} ${user.firstname || ""}`.trim() || "Utilisateur";
  const email = user.email || "—";
  const phone = user.phone || user.phoneNumber || "—";
  const createdAt = user.createdAt || user.created_at;

  const avatarSize = isXs ? 90 : 120;

  return (
    <Box sx={{ bgcolor: (t) => (t.palette.mode === "dark" ? "#0b0d10" : "#f5f7fb"), py: 2 }}>
      {/* Container centré, aucune dépendance à la page/side-nav */}
      <Box sx={{ maxWidth: 1200, mx: "auto", px: { xs: 1.5, sm: 2, md: 3 } }}>
        {/* Header/cover contenu dans une Card (plus de chevauchement) */}
        <Card sx={{ borderRadius: 3, overflow: "hidden", mb: 3, boxShadow: 3 }}>
          <Box
            sx={{
              height: { xs: 120, sm: 160, md: 200 },
              backgroundImage: `linear-gradient(to bottom, rgba(0,0,0,.25), rgba(0,0,0,.45)), url(${COVER_URL})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
          <Box sx={{ position: "relative", p: { xs: 2, sm: 3 } }}>
            <Stack direction={{ xs: "column", sm: "row" }} alignItems={{ xs: "center", sm: "flex-end" }} spacing={2}>
              <Badge
                overlap="circular"
                anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                badgeContent={
                  <Tooltip title="Vérifié">
                    <Avatar sx={{ width: 28, height: 28, bgcolor: "success.main", border: "2px solid white" }}>
                      <CheckIconSmall />
                    </Avatar>
                  </Tooltip>
                }
                sx={{ mt: { xs: -avatarSize / 2.2, sm: -avatarSize / 1.5 } }}
              >
                <Avatar
                  src={user.avatar || DEFAULT_AVATAR}
                  alt={fullname}
                  sx={{ width: avatarSize, height: avatarSize, border: "3px solid #fff" }}
                />
              </Badge>

              <Box sx={{ flex: 1, textAlign: { xs: "center", sm: "left" } }}>
                <Typography variant={isXs ? "h6" : "h5"} fontWeight={700}>
                  {fullname}
                </Typography>
                <Stack direction="row" spacing={1} justifyContent={{ xs: "center", sm: "flex-start" }} flexWrap="wrap">
                  {isAdmin && <Chip color="error" size="small" label="Administrateur" />}
                  {roles
                    .filter((r) => String(r).toUpperCase() !== "ROLE_ADMIN")
                    .slice(0, 3)
                    .map((r) => (
                      <Chip key={r} size="small" label={String(r).replace(/^ROLE_/, "")} />
                    ))}
                </Stack>
              </Box>

              <Stack direction={{ xs: "column", sm: "row" }} spacing={1} sx={{ width: { xs: "100%", sm: "auto" } }}>
                <Button fullWidth={isXs} variant="contained" color="error" startIcon={<EditIcon />} onClick={() => setEditOpen(true)}>
                  Éditer
                </Button>
                <Button fullWidth={isXs} variant="outlined" color="error" startIcon={<LogoutIcon />} onClick={logOut}>
                  Logout
                </Button>
              </Stack>
            </Stack>
          </Box>
        </Card>

        {/* Corps */}
        <Grid container spacing={{ xs: 2, md: 3 }}>
          <Grid item xs={12} md={4}>
            {/* Carte infos contact + stats */}
            <Stack spacing={2}>
              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Stack spacing={1.25}>
                    <Row icon={<EmailIcon fontSize="small" color="disabled" />} text={email} breakAll />
                    <Row icon={<PhoneIcon fontSize="small" color="disabled" />} text={phone} />
                    <Row
                      icon={<CalendarIcon fontSize="small" color="disabled" />}
                      text={`Membre depuis le ${fmtDate(createdAt)}`}
                    />
                    <Row icon={<PlaceIcon fontSize="small" color="disabled" />} text="Paris, France" />
                  </Stack>
                </CardContent>
              </Card>

              <Card variant="outlined" sx={{ borderRadius: 2 }}>
                <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                  <Stack direction="row" justifyContent="space-between" textAlign="center">
                    <Stat label="Randonnées" value="18" />
                    <Stat label="Spots favoris" value="42" />
                    <Stat label="Badges" value="5" />
                  </Stack>
                  <Divider sx={{ my: 1.5 }} />
                  <Typography variant="caption" color="text.secondary">
                    Complétion du profil
                  </Typography>
                  <LinearProgress sx={{ mt: 0.5, height: 8, borderRadius: 10 }} variant="determinate" value={80} />
                </CardContent>
              </Card>
            </Stack>
          </Grid>

          <Grid item xs={12} md={8}>
            <Card sx={{ borderRadius: 3, boxShadow: 3 }}>
              <Tabs
                value={tab}
                onChange={(_, v) => setTab(v)}
                textColor="inherit"
                indicatorColor="primary"
                variant={isMdUp ? "standard" : "scrollable"}
                scrollButtons={isMdUp ? false : "auto"}
                allowScrollButtonsMobile
                sx={{ px: { xs: 0.5, sm: 1, md: 2 } }}
              >
                <Tab label="À propos" />
                <Tab label="Activité" />
                <Tab label="Sécurité" />
              </Tabs>
              <Divider />

              {tab === 0 && (
                <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Informations
                  </Typography>
                  <Grid container spacing={{ xs: 1.5, sm: 2 }}>
                    <InfoCard title="Nom complet" value={fullname} />
                    <InfoCard title="Email" value={email} breakAll />
                    <InfoCard title="Téléphone" value={phone} />
                    <Grid item xs={12} sm={6}>
                      <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
                        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                          <Typography variant="overline" color="text.secondary">
                            Rôles
                          </Typography>
                          <Stack direction="row" spacing={1} flexWrap="wrap">
                            {roles.length ? (
                              roles.map((r) => <Chip key={r} size="small" label={String(r).replace(/^ROLE_/, "")} />)
                            ) : (
                              <Chip size="small" label="USER" />
                            )}
                          </Stack>
                        </CardContent>
                      </Card>
                    </Grid>
                    <Grid item xs={12}>
                      <Card variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                          <Typography variant="overline" color="text.secondary">
                            Bio
                          </Typography>
                          <Typography variant="body1">
                            Passionné de nature et de cartographie. J’adore explorer de nouveaux sentiers et partager
                            des spots avec la communauté.
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  </Grid>

                  <Typography variant="h6" fontWeight={700} sx={{ mt: 3 }} gutterBottom>
                    Badges
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    <Chip icon={<PremiumIcon />} color="warning" label="Explorateur" />
                    <Chip icon={<FavoriteIcon />} color="error" label="Top contributeur" />
                    <Chip icon={<ShieldIcon />} color="success" label="Compte vérifié" />
                  </Stack>
                </Box>
              )}

              {tab === 1 && (
                <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Activité récente
                  </Typography>
                  <Stack spacing={1.5}>
                    {[
                      { t: "Ajout d’un spot", d: "Forêt de Fontainebleau", date: "2025-10-12" },
                      { t: "Nouvelle randonnée complétée", d: "Boucle de Meudon (12km)", date: "2025-10-08" },
                      { t: "Spot ajouté aux favoris", d: "Parc des Buttes-Chaumont", date: "2025-10-03" },
                    ].map((a, i) => (
                      <Card key={i} variant="outlined" sx={{ borderRadius: 2 }}>
                        <CardContent sx={{ py: { xs: 1, sm: 1.5 }, px: { xs: 1.5, sm: 2 } }}>
                          <Stack
                            direction={{ xs: "column", sm: "row" }}
                            spacing={{ xs: 0.5, sm: 1 }}
                            justifyContent="space-between"
                            alignItems={{ xs: "flex-start", sm: "center" }}
                          >
                            <Box>
                              <Typography variant="subtitle2">{a.t}</Typography>
                              <Typography variant="body2" color="text.secondary">
                                {a.d}
                              </Typography>
                            </Box>
                            <Typography variant="caption" color="text.secondary">
                              {fmtDate(a.date)}
                            </Typography>
                          </Stack>
                        </CardContent>
                      </Card>
                    ))}
                  </Stack>
                </Box>
              )}

              {tab === 2 && (
                <Box sx={{ p: { xs: 1.5, sm: 2, md: 3 } }}>
                  <Typography variant="h6" fontWeight={700} gutterBottom>
                    Sécurité du compte
                  </Typography>

                  <Card variant="outlined" sx={{ borderRadius: 2, mb: 2 }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <ShieldIcon color="success" />
                        <Typography variant="subtitle2">Authentification</Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Mot de passe mis à jour il y a 3 mois. 2FA non activée.
                      </Typography>
                      <CardActions sx={{ px: 0 }}>
                        <Button size="small" variant="text">Modifier le mot de passe</Button>
                        <Button size="small" variant="text">Activer la 2FA</Button>
                      </CardActions>
                    </CardContent>
                  </Card>

                  <Card variant="outlined" sx={{ borderRadius: 2 }}>
                    <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
                      <Typography variant="subtitle2">Sessions actives</Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                        Chrome • Windows • Paris — Dernière activité: {fmtDate(new Date())}
                      </Typography>
                      <CardActions sx={{ px: 0 }}>
                        <Button size="small" variant="text" color="error">
                          Déconnecter toutes les sessions
                        </Button>
                      </CardActions>
                    </CardContent>
                  </Card>
                </Box>
              )}
            </Card>
          </Grid>
        </Grid>
      </Box>

      {/* Modal d’édition */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)}>
        <Box
          sx={{
            position: "absolute",
            top: { xs: 0, sm: "50%" },
            left: { xs: 0, sm: "50%" },
            transform: { xs: "none", sm: "translate(-50%, -50%)" },
            width: { xs: "100vw", sm: 560 },
            height: { xs: "100vh", sm: "auto" },
            maxWidth: "100vw",
            bgcolor: "background.paper",
            boxShadow: 24,
            borderRadius: { xs: 0, sm: 2 },
            p: { xs: 2, sm: 3 },
            overflowY: "auto",
          }}
        >
          <Stack direction="row" alignItems="center" justifyContent="space-between" sx={{ mb: 2 }}>
            <Typography variant="h6" fontWeight={700}>Éditer le profil</Typography>
            <IconButton onClick={() => setEditOpen(false)}>
              <CloseIcon />
            </IconButton>
          </Stack>
          <Grid container spacing={{ xs: 1.5, sm: 2 }}>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Nom" defaultValue={user.lastname || ""} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Prénom" defaultValue={user.firstname || ""} />
            </Grid>
            <Grid item xs={12}>
              <TextField fullWidth label="Bio" defaultValue="Passionné de nature…" multiline minRows={3} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Téléphone" defaultValue={phone || ""} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField fullWidth label="Ville" defaultValue="Paris" />
            </Grid>
          </Grid>
          <Stack direction="row" justifyContent={{ xs: "stretch", sm: "flex-end" }} spacing={1} sx={{ mt: 2 }}>
            <Button fullWidth={isXs} onClick={() => setEditOpen(false)}>Annuler</Button>
            <Button fullWidth={isXs} variant="contained" color="error" onClick={() => setEditOpen(false)}>
              Enregistrer (mock)
            </Button>
          </Stack>
        </Box>
      </Modal>
    </Box>
  );
}

/* helpers UI */
function Row({ icon, text, breakAll }) {
  return (
    <Stack direction="row" spacing={1} alignItems="center">
      {icon}
      <Typography variant="body2" sx={breakAll ? { wordBreak: "break-all" } : undefined}>
        {text}
      </Typography>
    </Stack>
  );
}
function Stat({ label, value }) {
  return (
    <Box sx={{ flex: 1 }}>
      <Typography variant="h5" fontWeight={700}>{value}</Typography>
      <Typography variant="caption" color="text.secondary">{label}</Typography>
    </Box>
  );
}
function InfoCard({ title, value, breakAll }) {
  return (
    <Grid item xs={12} sm={6}>
      <Card variant="outlined" sx={{ borderRadius: 2, height: "100%" }}>
        <CardContent sx={{ p: { xs: 1.5, sm: 2 } }}>
          <Typography variant="overline" color="text.secondary">{title}</Typography>
          <Typography variant="body1" sx={breakAll ? { wordBreak: "break-all" } : undefined}>{value}</Typography>
        </CardContent>
      </Card>
    </Grid>
  );
}

/* icônes légères inline */
function CloseIcon(props) {
  return (
    <svg {...props} width="24" height="24" viewBox="0 0 24 24" fill="none">
      <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
function CheckIconSmall() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
      <path d="M20 6L9 17l-5-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
