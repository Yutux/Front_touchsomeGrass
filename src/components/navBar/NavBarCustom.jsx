// src/components/navBar/NavBarCustom.jsx
import React, { useEffect, useMemo, useState, useContext, Fragment } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  AppBar,
  Toolbar,
  Typography,
  Box,
  Divider,
  IconButton,
  Tooltip,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Badge,
  Drawer,
  Paper,
  BottomNavigation,
  BottomNavigationAction,
} from "@mui/material";
import {
  Menu as MenuIcon,
  Home,
  Search,
  Settings,
  Person,
  Notifications,
  ChevronLeft,
  Logout,
  Login,
  AdminPanelSettings,
  Group,
  Dashboard,
  Place,
  Hiking,
  Close as CloseIcon,
} from "@mui/icons-material";
import { motion } from "framer-motion";
import { UserContext } from "../contexts/UserContext/UserContext";

const NAV_WIDTH_COLLAPSED = 72;
const NAV_WIDTH_EXPANDED = 232;

/* --- helpers JWT --- */
function decodeJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => `%${("00" + c.charCodeAt(0).toString(16)).slice(-2)}`)
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
}
function extractRolesFromJwt(payload) {
  if (!payload) return [];
  const out = new Set();
  const direct = payload.roles || payload.authorities || payload.scope || [];
  (Array.isArray(direct) ? direct : String(direct).split(" ")).forEach((r) => {
    if (!r) return;
    if (typeof r === "string") out.add(r);
    else if (r && typeof r.authority === "string") out.add(r.authority);
  });
  (payload.realm_access?.roles || []).forEach((r) => r && out.add(r));
  const ra = payload.resource_access || {};
  Object.values(ra).forEach((e) => (e?.roles || []).forEach((r) => r && out.add(r)));
  return Array.from(out).map((r) => String(r).toUpperCase());
}

export default function NavbarCustom() {
  const navigate = useNavigate();
  const location = useLocation();
  const isDesktop = useMediaQuery("(min-width:900px)");
  const isMobile = !isDesktop;

  const { token, setToken, user } = useContext(UserContext) || {};

  /* --- auth & rôles --- */
  const jwtPayload = useMemo(() => decodeJwt(token), [token]);
  const rolesFromJwt = extractRolesFromJwt(jwtPayload);
  const rolesFromCtx = (Array.isArray(user?.roles)
    ? user.roles.map((r) => (typeof r === "string" ? r : r?.authority)).filter(Boolean)
    : []
  ).map((r) => String(r).toUpperCase());
  const roles = rolesFromCtx.length ? rolesFromCtx : rolesFromJwt;
  const isAuthenticated = !!token;
  const isAdmin = roles.some((r) => r.includes("ADMIN"));

  /* --- état desktop --- */
  const [open, setOpen] = useState(() => {
    const saved = localStorage.getItem("nav_open");
    // par défaut: ouverte en desktop, fermée en mobile
    return saved ? JSON.parse(saved) : isDesktop;
  });

  /* --- état mobile --- */
  const [drawerOpen, setDrawerOpen] = useState(false);
  const pathsForBottom = ["/", "/search", "/allspot", "/allhikingspot"];
  const pathIndex = Math.max(0, pathsForBottom.indexOf(location.pathname));
  const [mobileTab, setMobileTab] = useState(pathIndex);

  useEffect(() => {
    // synchronise le tab lorsque la route change (via liens ailleurs)
    const idx = pathsForBottom.indexOf(location.pathname);
    setMobileTab(idx >= 0 ? idx : 0);
  }, [location.pathname]); // eslint-disable-line

  /* --- publier --nav-w (desktop) & --bn-h (mobile) --- */
  useEffect(() => {
    if (isDesktop) {
      const w = open ? `${NAV_WIDTH_EXPANDED}px` : `${NAV_WIDTH_COLLAPSED}px`;
      document.documentElement.style.setProperty("--nav-w", w);
      document.documentElement.style.setProperty("--bn-h", "0px");
    } else {
      // mobile: sidebar n'occupe pas la largeur, et bottom nav a une hauteur utile
      document.documentElement.style.setProperty("--nav-w", "0px");
      const h = `calc(72px + env(safe-area-inset-bottom, 0px))`;
      document.documentElement.style.setProperty("--bn-h", h);
    }
  }, [isDesktop, open]);

  // persiste l'état d'ouverture en desktop uniquement
  useEffect(() => {
    if (isDesktop) localStorage.setItem("nav_open", JSON.stringify(open));
  }, [open, isDesktop]);

  const width = open ? NAV_WIDTH_EXPANDED : NAV_WIDTH_COLLAPSED;
  const activePath = location.pathname || "/";

  const handleLogout = () => {
    try {
      localStorage.removeItem("token");
    } catch {}
    setToken?.(null);
    navigate("/login");
  };
  const handleLogin = () => navigate("/login");

  const baseNav = [
    { label: "Accueil", icon: <Home fontSize="small" />, path: "/", auth: false },
    { label: "Recherche", icon: <Search fontSize="small" />, path: "/search", auth: false },
    { label: "Tous les spots", icon: <Place fontSize="small" />, path: "/spots", auth: false },
    { label: "Randonnées", icon: <Hiking fontSize="small" />, path: "/hikingSpots", auth: false },
    { label: "Profil", icon: <Person fontSize="small" />, path: "/profile", auth: true },
    {
      label: "Notifications",
      icon: (
        <Badge badgeContent={3} max={99} color="error">
          <Notifications fontSize="small" />
        </Badge>
      ),
      path: "/notifications",
      auth: true,
    },
    { label: "Paramètres", icon: <Settings fontSize="small" />, path: "/settings", auth: true },
  ];
  const adminNav = [
    { label: "Admin • Dashboard", icon: <Dashboard fontSize="small" />, path: "/admin" },
    { label: "Admin • Utilisateurs", icon: <Group fontSize="small" />, path: "/admin/users" },
  ];
  const visibleBaseNav = baseNav.filter((i) => (i.auth ? isAuthenticated : true));
  const visibleAdminNav = isAdmin ? adminNav : [];

  const renderItem = (item) => {
    const isActive = activePath === item.path;
    const content = (
      <ListItemButton
        key={item.path}
        selected={isActive}
        onClick={() => {
          navigate(item.path);
          if (isMobile) setDrawerOpen(false);
        }}
        component={motion.div}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.99 }}
        sx={{
          borderRadius: 1.5,
          mb: 0.5,
          px: 1.25,
          py: 1,
          "&.Mui-selected": {
            bgcolor: "rgba(0,188,212,0.12)",
            color: "#00bcd4",
            "& .MuiListItemIcon-root": { color: "#00bcd4" },
          },
          "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
        }}
      >
        <ListItemIcon
          sx={{
            minWidth: 0,
            mr: 1.25,
            justifyContent: "center",
            color: isActive ? "#00bcd4" : "inherit",
          }}
        >
          {item.icon}
        </ListItemIcon>
        <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }} />
      </ListItemButton>
    );

    if (isMobile) return <Fragment key={item.path}>{content}</Fragment>;
    return open ? (
      <Fragment key={item.path}>{content}</Fragment>
    ) : (
      <Tooltip key={item.path} title={item.label} placement="right" arrow>
        <Box>
          <ListItemButton
            selected={isActive}
            onClick={() => navigate(item.path)}
            component={motion.div}
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.98 }}
            sx={{
              borderRadius: 1.5,
              mb: 0.5,
              px: 1,
              py: 1,
              justifyContent: "center",
              "&.Mui-selected": {
                bgcolor: "rgba(0,188,212,0.12)",
                color: "#00bcd4",
              },
              "&:hover": { bgcolor: "rgba(255,255,255,0.06)" },
            }}
          >
            <ListItemIcon sx={{ minWidth: 0, color: isActive ? "#00bcd4" : "inherit" }}>{item.icon}</ListItemIcon>
          </ListItemButton>
        </Box>
      </Tooltip>
    );
  };

  /* --------- MOBILE RENDER --------- */
  if (isMobile) {
    return (
      <>
        {/* AppBar mobile */}
        <AppBar position="fixed" elevation={2} sx={{ bgcolor: "#121212" }}>
          <Toolbar sx={{ minHeight: 56 }}>
            <IconButton onClick={() => setDrawerOpen(true)} sx={{ color: "#00bcd4", mr: 1 }}>
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" sx={{ flex: 1 }}>
              Immoversive
            </Typography>
            <IconButton
              onClick={isAuthenticated ? handleLogout : handleLogin}
              sx={{ color: isAuthenticated ? "#f44336" : "#00bcd4" }}
              aria-label={isAuthenticated ? "Se déconnecter" : "Se connecter"}
            >
              {isAuthenticated ? <Logout /> : <Login />}
            </IconButton>
          </Toolbar>
        </AppBar>
        <Toolbar /> {/* pousse le contenu sous l'AppBar */}

        {/* Drawer mobile */}
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          PaperProps={{ sx: { width: 280, bgcolor: "#121212", color: "#fff" } }}
        >
          <Box sx={{ p: 1 }}>
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", px: 1, py: 0.5 }}>
              <Typography variant="subtitle1">Menu</Typography>
              <IconButton onClick={() => setDrawerOpen(false)} sx={{ color: "#00bcd4" }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {isAdmin && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  px: 1,
                  py: 0.75,
                  mb: 0.5,
                  borderRadius: 1.5,
                  bgcolor: "rgba(255,255,255,0.06)",
                }}
              >
                <AdminPanelSettings fontSize="small" />
                <Box component="span" sx={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.3 }}>
                  Administrateur
                </Box>
              </Box>
            )}

            <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 1 }} />
            <List disablePadding sx={{ px: 0.5 }}>
              {visibleBaseNav.map(renderItem)}
            </List>

            {visibleAdminNav.length > 0 && (
              <>
                <Box sx={{ px: 1, py: 0.5, fontSize: 11, opacity: 0.7, textTransform: "uppercase", letterSpacing: 0.6 }}>
                  Administration
                </Box>
                <List disablePadding sx={{ px: 0.5, mb: 1 }}>
                  {visibleAdminNav.map(renderItem)}
                </List>
              </>
            )}
          </Box>
        </Drawer>

        {/* BottomNavigation mobile */}
        <Paper
          sx={{
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            // assure une bonne zone tactile + prise en charge iPhone
            pb: "env(safe-area-inset-bottom, 0px)",
            zIndex: 1300,
          }}
          elevation={8}
        >
          <BottomNavigation
            showLabels
            value={mobileTab}
            onChange={(e, idx) => {
              setMobileTab(idx);
              navigate(pathsForBottom[idx]);
            }}
          >
            <BottomNavigationAction label="Accueil" icon={<Home />} />
            <BottomNavigationAction label="Recherche" icon={<Search />} />
            <BottomNavigationAction label="Spots" icon={<Place />} />
            <BottomNavigationAction label="Randos" icon={<Hiking />} />
          </BottomNavigation>
        </Paper>
      </>
    );
  }

  /* --------- DESKTOP RENDER --------- */
  return (
    <Box
      component={motion.aside}
      initial={false}
      animate={{ width }}
      transition={{ duration: 0.25 }}
      sx={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        bgcolor: "#121212",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        p: 1,
        boxShadow: "2px 0 10px rgba(0,0,0,0.35)",
        zIndex: 1300,
      }}
      aria-label="Navigation principale"
    >
      {/* Header */}
      <Box sx={{ width: "100%" }}>
        <IconButton
          onClick={() => setOpen((o) => !o)}
          sx={{ color: "#00bcd4", mb: 1, ml: open ? 0.5 : 0, "&:focus-visible": { outline: "2px solid #00bcd4" } }}
          aria-label={open ? "Réduire la barre latérale" : "Ouvrir la barre latérale"}
          aria-expanded={open}
        >
          {open ? <ChevronLeft /> : <MenuIcon />}
        </IconButton>

        {open && isAdmin && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              px: 1,
              py: 0.75,
              mb: 0.5,
              borderRadius: 1.5,
              bgcolor: "rgba(255,255,255,0.06)",
            }}
          >
            <AdminPanelSettings fontSize="small" />
            <Box component="span" sx={{ fontSize: 12, fontWeight: 600, letterSpacing: 0.3 }}>
              Administrateur
            </Box>
          </Box>
        )}

        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)" }} />
      </Box>

      {/* Items */}
      <Box sx={{ overflowY: "auto", flex: 1, mt: 1 }}>
        <List disablePadding sx={{ px: 0.5 }}>
          {visibleBaseNav.map(renderItem)}
        </List>

        {visibleAdminNav.length > 0 && (
          <Box sx={{ mt: 1 }}>
            {open ? (
              <Box
                sx={{
                  px: 1,
                  py: 0.5,
                  fontSize: 11,
                  opacity: 0.7,
                  textTransform: "uppercase",
                  letterSpacing: 0.6,
                }}
              >
                Administration
              </Box>
            ) : (
              <Box sx={{ height: 8 }} />
            )}
            <List disablePadding sx={{ px: 0.5 }}>
              {visibleAdminNav.map(renderItem)}
            </List>
          </Box>
        )}
      </Box>

      {/* Footer auth */}
      <Box sx={{ width: "100%", mb: 1 }}>
        <Divider sx={{ borderColor: "rgba(255,255,255,0.08)", mb: 0.5 }} />
        {open ? (
          <List disablePadding sx={{ px: 0.5 }}>
            <ListItemButton
              onClick={isAuthenticated ? handleLogout : handleLogin}
              sx={{ borderRadius: 1.5, px: 1.25, py: 1, "&:hover": { bgcolor: "rgba(255,255,255,0.06)" } }}
            >
              <ListItemIcon sx={{ minWidth: 0, mr: 1.25, justifyContent: "center" }}>
                {isAuthenticated ? <Logout /> : <Login />}
              </ListItemIcon>
              <ListItemText
                primary={isAuthenticated ? "Logout" : "Login"}
                primaryTypographyProps={{ fontSize: 14, fontWeight: 500 }}
              />
            </ListItemButton>
          </List>
        ) : (
          <Tooltip title={isAuthenticated ? "Logout" : "Login"} placement="right" arrow>
            <Box sx={{ display: "flex", justifyContent: "center" }}>
              <IconButton
                onClick={isAuthenticated ? handleLogout : handleLogin}
                sx={{ color: isAuthenticated ? "#f44336" : "#00bcd4" }}
                aria-label={isAuthenticated ? "Se déconnecter" : "Se connecter"}
              >
                {isAuthenticated ? <Logout /> : <Login />}
              </IconButton>
            </Box>
          </Tooltip>
        )}
      </Box>
    </Box>
  );
}
