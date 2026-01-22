import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  IconButton,
  Tooltip,
  Divider,
  Button,
} from "@mui/material";
import {
  Menu,
  Home,
  Search,
  Settings,
  Person,
  Notifications,
  ChevronLeft,
  Logout,
  Login,
} from "@mui/icons-material";
import { motion, AnimatePresence } from "framer-motion";
import { UserContext } from "../../contexts/UserContext/UserContext"; 

const navItems = [
  { label: "Accueil", icon: <Home />, path: "/" },
  { label: "Recherche", icon: <Search />, path: "/search" },
  { label: "Profil", icon: <Person />, path: "/profile" },
  { label: "Notifications", icon: <Notifications />, path: "/notifications" },
  { label: "Paramètres", icon: <Settings />, path: "/settings" },
];

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState("/");
  const { token, setToken } = useContext(UserContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/login");
  };

  const handleLogin = () => {
    navigate("/login");
  };

  return (
    <motion.div
      animate={{ width: open ? 200 : 70 }}
      transition={{ duration: 0.3 }}
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        height: "100vh",
        background: "#121212",
        color: "#fff",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: open ? "flex-start" : "center",
        padding: "1rem 0.5rem",
        boxShadow: "2px 0 10px rgba(0,0,0,0.3)",
        zIndex: 1000,
      }}
    >
      {/* Header - bouton toggle */}
      <Box sx={{ width: "100%" }}>
        <IconButton
          onClick={() => setOpen(!open)}
          sx={{
            color: "#00bcd4",
            mb: 2,
            alignSelf: open ? "flex-end" : "center",
          }}
        >
          {open ? <ChevronLeft /> : <Menu />}
        </IconButton>

        <Divider sx={{ width: "100%", borderColor: "rgba(255,255,255,0.1)" }} />
      </Box>

      {/* Navigation principale */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mt: 3,
          width: "100%",
          alignItems: open ? "flex-start" : "center",
        }}
      >
        {navItems.map((item) => (
          <Tooltip
            key={item.path}
            title={!open ? item.label : ""}
            placement="right"
            arrow
          >
            <motion.div
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setActive(item.path);
                navigate(item.path);
              }}
              style={{
                display: "flex",
                alignItems: "center",
                gap: open ? 12 : 0,
                width: "100%",
                padding: open ? "0.5rem 1rem" : "0.5rem 0",
                borderRadius: "8px",
                cursor: "pointer",
                color: active === item.path ? "#00bcd4" : "#fff",
                background:
                  active === item.path ? "rgba(0,188,212,0.1)" : "transparent",
                transition: "all 0.3s ease",
              }}
            >
              {item.icon}
              <AnimatePresence>
                {open && (
                  <motion.span
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -10 }}
                    style={{
                      fontSize: "0.95rem",
                      fontWeight: 500,
                    }}
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.div>
          </Tooltip>
        ))}
      </Box>

      {/* Footer - Auth */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: open ? "flex-start" : "center",
          width: "100%",
          mb: 2,
        }}
      >
        <Divider sx={{ width: "100%", borderColor: "rgba(255,255,255,0.1)" }} />

        <Tooltip title={!open ? (token ? "Logout" : "Login") : ""} placement="right" arrow>
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            onClick={token ? handleLogout : handleLogin}
            style={{
              display: "flex",
              alignItems: "center",
              gap: open ? 12 : 0,
              width: "100%",
              padding: open ? "0.5rem 1rem" : "0.5rem 0",
              borderRadius: "8px",
              cursor: "pointer",
              color: token ? "#f44336" : "#00bcd4",
              transition: "all 0.3s ease",
            }}
          >
            {token ? <Logout /> : <Login />}
            <AnimatePresence>
              {open && (
                <motion.span
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  style={{
                    fontSize: "0.95rem",
                    fontWeight: 500,
                  }}
                >
                  {token ? "Logout" : "Login"}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.div>
        </Tooltip>
      </Box>
    </motion.div>
  );
}
