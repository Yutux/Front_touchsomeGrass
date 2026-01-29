import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  IconButton,
  Collapse,
  Switch,
  FormControlLabel,
  useMediaQuery,
  Paper,
  Divider,
} from '@mui/material';
import { Close, Settings, Cookie } from '@mui/icons-material';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const isDesktop = useMediaQuery('(min-width:900px)');
  const isMobile = !isDesktop;

  // État des préférences cookies
  const [preferences, setPreferences] = useState({
    necessary: true, // Toujours activé
    analytics: false,
    marketing: false,
    functional: false,
  });

  // Styles adaptatifs selon desktop/mobile
  const themeStyles = {
    background: isDesktop ? '#1a1a1a' : '#ffffff',
    textColor: isDesktop ? '#fff' : '#1c1c1c',
    textSecondary: isDesktop ? 'rgba(255,255,255,0.8)' : 'rgba(28,28,28,0.7)',
    accentColor: isDesktop ? '#00bcd4' : '#228be6',
    borderColor: isDesktop ? 'rgba(0, 188, 212, 0.2)' : 'rgba(34, 139, 230, 0.2)',
    buttonPrimary: isDesktop ? '#00bcd4' : '#228be6',
    buttonPrimaryHover: isDesktop ? '#00e5ff' : '#339af0',
    buttonSecondary: isDesktop ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
    buttonSecondaryHover: isDesktop ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.08)',
  };

  useEffect(() => {
    // Vérifier si l'utilisateur a déjà donné son consentement
    const consent = localStorage.getItem('cookieConsent');
    if (!consent) {
      // Attendre un peu avant d'afficher pour une meilleure UX
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      functional: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookieConsent', JSON.stringify(allAccepted));
    setIsVisible(false);
    
    // Initialiser les services (analytics, etc.)
    initializeServices(allAccepted);
  };

  const handleRejectAll = () => {
    const onlyNecessary = {
      necessary: true,
      analytics: false,
      marketing: false,
      functional: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookieConsent', JSON.stringify(onlyNecessary));
    setIsVisible(false);
  };

  const handleSavePreferences = () => {
    const savedPreferences = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem('cookieConsent', JSON.stringify(savedPreferences));
    setIsVisible(false);
    
    // Initialiser les services selon les préférences
    initializeServices(savedPreferences);
  };

  const initializeServices = (consent) => {
    // Ici vous pouvez initialiser vos services selon le consentement
    if (consent.analytics) {
      // Initialiser Google Analytics, etc.
      console.log('Analytics activé');
    }
    if (consent.marketing) {
      // Initialiser pixels de tracking marketing
      console.log('Marketing activé');
    }
    if (consent.functional) {
      // Initialiser fonctionnalités additionnelles
      console.log('Fonctionnalités activées');
    }
  };

  const handleTogglePreference = (key) => {
    if (key === 'necessary') return; // Ne peut pas être désactivé
    setPreferences((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const cookieTypes = [
    {
      key: 'necessary',
      title: 'Cookies nécessaires',
      description: 'Ces cookies sont essentiels au fonctionnement du site. Ils ne peuvent pas être désactivés.',
      required: true,
    },
    {
      key: 'analytics',
      title: 'Cookies analytiques',
      description: "Nous aident à comprendre comment vous utilisez notre site pour l'améliorer.",
      required: false,
    },
    {
      key: 'marketing',
      title: 'Cookies marketing',
      description: 'Utilisés pour vous proposer des publicités personnalisées.',
      required: false,
    },
    {
      key: 'functional',
      title: 'Cookies fonctionnels',
      description: 'Permettent des fonctionnalités avancées comme la mémorisation de vos préférences.',
      required: false,
    },
  ];

  if (!isVisible) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 100, opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{
          position: 'fixed',
          bottom: isMobile ? 'var(--bn-h, 0px)' : 20,
          left: isMobile ? 0 : isDesktop ? 'calc(var(--nav-w, 0px) + 20px)' : 20,
          right: 20,
          zIndex: 2000,
          maxWidth: isMobile ? '100%' : 600,
        }}
      >
        <Paper
          elevation={8}
          sx={{
            background: themeStyles.background,
            color: themeStyles.textColor,
            p: isMobile ? 2 : 3,
            borderRadius: isMobile ? '16px 16px 0 0' : 2,
            border: `1px solid ${themeStyles.borderColor}`,
            backdropFilter: 'blur(10px)',
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
              <Cookie sx={{ color: themeStyles.accentColor, fontSize: 28 }} />
              <Typography variant="h6" sx={{ fontWeight: 700, fontSize: isMobile ? 16 : 18 }}>
                Respect de votre vie privée
              </Typography>
            </Box>
            <IconButton
              size="small"
              onClick={() => setIsVisible(false)}
              sx={{ color: themeStyles.textSecondary }}
              aria-label="Fermer"
            >
              <Close fontSize="small" />
            </IconButton>
          </Box>

          {/* Description */}
          <Typography
            variant="body2"
            sx={{
              color: themeStyles.textSecondary,
              mb: 2,
              lineHeight: 1.6,
              fontSize: isMobile ? 13 : 14,
            }}
          >
            Nous utilisons des cookies pour améliorer votre expérience, analyser le trafic et personnaliser le contenu.
            En cliquant sur "Tout accepter", vous consentez à notre utilisation des cookies.{' '}
            <Typography
              component={Link}
              to="/privacy"
              sx={{
                color: themeStyles.accentColor,
                textDecoration: 'none',
                fontWeight: 500,
                '&:hover': { textDecoration: 'underline' },
              }}
            >
              En savoir plus
            </Typography>
          </Typography>

          {/* Settings Panel */}
          <Collapse in={showSettings}>
            <Box sx={{ mb: 2 }}>
              <Divider sx={{ mb: 2, borderColor: themeStyles.borderColor }} />
              {cookieTypes.map((type) => (
                <Box
                  key={type.key}
                  sx={{
                    mb: 2,
                    p: 1.5,
                    borderRadius: 1,
                    backgroundColor: isDesktop ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)',
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 0.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 600, fontSize: isMobile ? 13 : 14 }}>
                      {type.title}
                    </Typography>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={preferences[type.key]}
                          onChange={() => handleTogglePreference(type.key)}
                          disabled={type.required}
                          size="small"
                          sx={{
                            '& .MuiSwitch-switchBase.Mui-checked': {
                              color: themeStyles.accentColor,
                            },
                            '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
                              backgroundColor: themeStyles.accentColor,
                            },
                          }}
                        />
                      }
                      label=""
                      sx={{ m: 0 }}
                    />
                  </Box>
                  <Typography
                    variant="caption"
                    sx={{ color: themeStyles.textSecondary, fontSize: isMobile ? 11 : 12 }}
                  >
                    {type.description}
                  </Typography>
                </Box>
              ))}
            </Box>
          </Collapse>

          {/* Actions */}
          <Box
            sx={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: 1.5,
              alignItems: 'stretch',
            }}
          >
            {!showSettings ? (
              <>
                <Button
                  variant="contained"
                  onClick={handleAcceptAll}
                  fullWidth={isMobile}
                  sx={{
                    backgroundColor: themeStyles.buttonPrimary,
                    color: isDesktop ? '#121212' : '#fff',
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 1,
                    fontSize: isMobile ? 13 : 14,
                    '&:hover': {
                      backgroundColor: themeStyles.buttonPrimaryHover,
                    },
                  }}
                >
                  Tout accepter
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleRejectAll}
                  fullWidth={isMobile}
                  sx={{
                    borderColor: themeStyles.borderColor,
                    color: themeStyles.textColor,
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 1,
                    fontSize: isMobile ? 13 : 14,
                    '&:hover': {
                      borderColor: themeStyles.accentColor,
                      backgroundColor: themeStyles.buttonSecondaryHover,
                    },
                  }}
                >
                  Tout refuser
                </Button>
                <Button
                  variant="text"
                  onClick={() => setShowSettings(true)}
                  startIcon={<Settings fontSize="small" />}
                  fullWidth={isMobile}
                  sx={{
                    color: themeStyles.textSecondary,
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 1,
                    fontSize: isMobile ? 13 : 14,
                    '&:hover': {
                      backgroundColor: themeStyles.buttonSecondaryHover,
                      color: themeStyles.accentColor,
                    },
                  }}
                >
                  Personnaliser
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="contained"
                  onClick={handleSavePreferences}
                  fullWidth={isMobile}
                  sx={{
                    backgroundColor: themeStyles.buttonPrimary,
                    color: isDesktop ? '#121212' : '#fff',
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 1,
                    flex: 1,
                    fontSize: isMobile ? 13 : 14,
                    '&:hover': {
                      backgroundColor: themeStyles.buttonPrimaryHover,
                    },
                  }}
                >
                  Enregistrer mes choix
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => setShowSettings(false)}
                  fullWidth={isMobile}
                  sx={{
                    borderColor: themeStyles.borderColor,
                    color: themeStyles.textColor,
                    fontWeight: 600,
                    textTransform: 'none',
                    py: 1,
                    fontSize: isMobile ? 13 : 14,
                    '&:hover': {
                      borderColor: themeStyles.accentColor,
                      backgroundColor: themeStyles.buttonSecondaryHover,
                    },
                  }}
                >
                  Annuler
                </Button>
              </>
            )}
          </Box>
        </Paper>
      </motion.div>
    </AnimatePresence>
  );
};

export default CookieBanner;