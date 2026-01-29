import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Box, Typography, IconButton, Divider, TextField, Grid, useMediaQuery } from '@mui/material';
import { motion } from 'framer-motion';
import { useState } from 'react';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  GitHub,
  Email,
  Phone,
  LocationOn,
  Send,
  KeyboardArrowDown,
  KeyboardArrowUp,
} from '@mui/icons-material';

const Footer = () => {
  //const navigate = useNavigate();
  const currentYear = new Date().getFullYear();
  const isDesktop = useMediaQuery('(min-width:900px)');
  const isMobile = !isDesktop;
  const [isFooterVisible, setIsFooterVisible] = useState(true);
  const themeStyles = {
    background: isDesktop 
      ? 'linear-gradient(135deg, #121212 0%, #1a1a1a 50%, #121212 100%)'
      : 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 50%, #f8f9fa 100%)',
    textColor: isDesktop ? '#fff' : '#1c1c1c',
    textSecondary: isDesktop ? 'rgba(255,255,255,0.7)' : 'rgba(28,28,28,0.7)',
    textMuted: isDesktop ? 'rgba(255,255,255,0.5)' : 'rgba(28,28,28,0.5)',
    accentColor: isDesktop ? '#00bcd4' : '#228be6',
    accentGradient: isDesktop 
      ? 'linear-gradient(90deg, #00bcd4 0%, #00e5ff 100%)'
      : 'linear-gradient(90deg, #228be6 0%, #339af0 100%)',
    borderColor: isDesktop 
      ? 'rgba(0, 188, 212, 0.1)' 
      : 'rgba(34, 139, 230, 0.15)',
    dividerColor: isDesktop 
      ? 'rgba(255,255,255,0.1)' 
      : 'rgba(0,0,0,0.08)',
    inputBg: isDesktop 
      ? 'rgba(255,255,255,0.05)' 
      : 'rgba(0,0,0,0.02)',
    inputBorder: isDesktop 
      ? 'rgba(255,255,255,0.1)' 
      : 'rgba(0,0,0,0.12)',
    inputBorderHover: isDesktop 
      ? 'rgba(0,188,212,0.5)' 
      : 'rgba(34,139,230,0.5)',
    buttonBg: isDesktop ? '#00bcd4' : '#228be6',
    buttonHoverBg: isDesktop ? '#00e5ff' : '#339af0',
    buttonTextColor: isDesktop ? '#121212' : '#fff',
    socialBg: isDesktop 
      ? 'rgba(255,255,255,0.05)' 
      : 'rgba(34,139,230,0.08)',
    socialHoverBg: isDesktop ? '#00bcd4' : '#228be6',
    socialHoverColor: isDesktop ? '#121212' : '#fff',
  };

  const footerLinks = {
    company: [
      { name: 'À propos', path: '/about' },
      { name: 'Services', path: '/services' },
      { name: 'Équipe', path: '/team' },
      { name: 'Carrières', path: '/careers' }
    ],
    support: [
      { name: 'FAQ', path: '/faq' },
      { name: 'Contact', path: '/contact' },
      { name: 'Support', path: '/support' },
      { name: 'Documentation', path: '/docs' }
    ],
    legal: [
      { name: 'Confidentialité', path: '/privacy' },
      { name: 'Conditions', path: '/terms' },
      { name: 'Cookies', path: '/cookies' },
      { name: 'Mentions légales', path: '/legal' }
    ]
  };

  const socialLinks = [
    { icon: <Facebook fontSize="small" />, url: 'https://facebook.com', label: 'Facebook' },
    { icon: <Twitter fontSize="small" />, url: 'https://twitter.com', label: 'Twitter' },
    { icon: <Instagram fontSize="small" />, url: 'https://instagram.com', label: 'Instagram' },
    { icon: <LinkedIn fontSize="small" />, url: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: <GitHub fontSize="small" />, url: 'https://github.com', label: 'GitHub' }
  ];

  const contactInfo = [
    { icon: <Email fontSize="small" />, text: 'contact@touchsomegrass.com' },
    { icon: <Phone fontSize="small" />, text: '+33 1 23 45 67 89' },
    { icon: <LocationOn fontSize="small" />, text: 'Paris, France' }
  ];

  return (
    <>
      {/* Bouton flottant pour afficher le footer quand il est caché */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          zIndex: 99,
          transform: isFooterVisible ? 'scale(0)' : 'scale(1)',
          transition: 'all 0.3s ease',
          opacity: isFooterVisible ? 0 : 1,
          pointerEvents: isFooterVisible ? 'none' : 'auto',
        }}
      >
        <IconButton
          onClick={() => setIsFooterVisible(true)}
          sx={{
            backgroundColor: themeStyles.buttonBg,
            color: themeStyles.buttonTextColor,
            padding: '12px',
            '&:hover': {
              backgroundColor: themeStyles.buttonHoverBg,
              transform: 'scale(1.1)',
            },
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
          }}
          title="Afficher le footer"
        >
          <KeyboardArrowUp fontSize="medium" />
        </IconButton>
      </Box>

      {/* Footer principal */}
    <Box
      component="footer"
      sx={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 100,
        background: themeStyles.background,
        color: themeStyles.textColor,
        pt: isMobile ? 3 : 4,
        pb: isMobile ? 2 : 2,
        borderTop: `1px solid ${themeStyles.borderColor}`,
        transition: 'all 0.3s ease',
        width: '100%',
        transform: isFooterVisible ? 'translateY(0)' : 'translateY(100%)',
        opacity: isFooterVisible ? 1 : 0,
        pointerEvents: isFooterVisible ? 'auto' : 'none',
      }}
    >
      {/* Main Footer Content */}
      <Box sx={{ maxWidth: '1400px', margin: '0 auto', px: isMobile ? 2 : 4, position: 'relative' }}>
        {/* Bouton de fermeture */}
        <Box
          sx={{
            position: 'absolute',
            top: isMobile ? -35 : -40,
            right: 0,
            zIndex: 101,
          }}
        >
          <IconButton
            onClick={() => setIsFooterVisible(!isFooterVisible)}
            sx={{
              backgroundColor: themeStyles.buttonBg,
              color: themeStyles.buttonTextColor,
              '&:hover': {
                backgroundColor: themeStyles.buttonHoverBg,
              },
              transition: 'all 0.3s ease',
            }}
            size="small"
          >
            {isFooterVisible ? <KeyboardArrowDown /> : <KeyboardArrowUp />}
          </IconButton>
        </Box>

        <Grid container spacing={isMobile ? 2 : 3} sx={{ mb: isMobile ? 2 : 2.5 }}>
          
          {/* Company Info */}
          <Grid item xs={12} sm={6} lg={3}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              viewport={{ once: true }}
            >
              <Typography
                variant={isMobile ? 'subtitle1' : 'h6'}
                sx={{
                  fontWeight: 700,
                  mb: 1,
                  background: themeStyles.accentGradient,
                  backgroundClip: 'text',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                TouchSomeGrass
              </Typography>
              <Typography 
                variant="body2" 
                sx={{ 
                  color: themeStyles.textSecondary,
                  mb: 1.5, 
                  lineHeight: 1.5,
                  fontSize: isMobile ? 12 : 13
                }}
              >
                Go Out and live Your Adventure with TouchSomeGrass – Your Ultimate Hiking Companion!
              </Typography>

              {/* Social Links */}
              <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                {socialLinks.map((social, index) => (
                  <motion.div key={index} whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
                    <IconButton
                      component="a"
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={social.label}
                      size="small"
                      sx={{
                        color: themeStyles.textColor,
                        backgroundColor: themeStyles.socialBg,
                        padding: isMobile ? '6px' : '8px',
                        '&:hover': {
                          backgroundColor: themeStyles.socialHoverBg,
                          color: themeStyles.socialHoverColor,
                        },
                        transition: 'all 0.3s ease',
                      }}
                    >
                      {social.icon}
                    </IconButton>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Grid>

          {/* Company Links */}
          <Grid item xs={6} sm={6} lg={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 1, 
                  color: themeStyles.accentColor,
                  fontSize: isMobile ? 13 : 14
                }}
              >
                Entreprise
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {footerLinks.company.map((link, index) => (
                  <motion.div key={index} whileHover={{ x: 3 }}>
                    <Typography
                      component={Link}
                      to={link.path}
                      variant="body2"
                      sx={{
                        color: themeStyles.textSecondary,
                        textDecoration: 'none',
                        transition: 'color 0.3s ease',
                        fontSize: isMobile ? 12 : 13,
                        display: 'block',
                        '&:hover': {
                          color: themeStyles.accentColor,
                        },
                      }}
                    >
                      {link.name}
                    </Typography>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Grid>

          {/* Support Links */}
          <Grid item xs={6} sm={6} lg={2}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 1, 
                  color: themeStyles.accentColor,
                  fontSize: isMobile ? 13 : 14
                }}
              >
                Support
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75 }}>
                {footerLinks.support.map((link, index) => (
                  <motion.div key={index} whileHover={{ x: 3 }}>
                    <Typography
                      component={Link}
                      to={link.path}
                      variant="body2"
                      sx={{
                        color: themeStyles.textSecondary,
                        textDecoration: 'none',
                        transition: 'color 0.3s ease',
                        fontSize: isMobile ? 12 : 13,
                        display: 'block',
                        '&:hover': {
                          color: themeStyles.accentColor,
                        },
                      }}
                    >
                      {link.name}
                    </Typography>
                  </motion.div>
                ))}
              </Box>
            </motion.div>
          </Grid>

          {/* Contact Info & Newsletter */}
          <Grid item xs={12} sm={12} lg={5}>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <Typography 
                variant="subtitle2" 
                sx={{ 
                  fontWeight: 600, 
                  mb: 1, 
                  color: themeStyles.accentColor,
                  fontSize: isMobile ? 13 : 14
                }}
              >
                Contact
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, mb: 1.5 }}>
                {contactInfo.map((info, index) => (
                  <Box key={index} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Box sx={{ color: themeStyles.accentColor, display: 'flex' }}>{info.icon}</Box>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: themeStyles.textSecondary,
                        fontSize: isMobile ? 12 : 13
                      }}
                    >
                      {info.text}
                    </Typography>
                  </Box>
                ))}
              </Box>

              {/* Newsletter */}
              <Box>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    fontWeight: 600, 
                    mb: 1,
                    fontSize: isMobile ? 12 : 13,
                    color: themeStyles.textColor
                  }}
                >
                  Newsletter
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <TextField
                    size="small"
                    placeholder="Votre email"
                    variant="outlined"
                    fullWidth
                    sx={{
                      '& .MuiOutlinedInput-root': {
                        color: themeStyles.textColor,
                        fontSize: isMobile ? 12 : 13,
                        backgroundColor: themeStyles.inputBg,
                        '& fieldset': {
                          borderColor: themeStyles.inputBorder,
                        },
                        '&:hover fieldset': {
                          borderColor: themeStyles.inputBorderHover,
                        },
                        '&.Mui-focused fieldset': {
                          borderColor: themeStyles.accentColor,
                        },
                      },
                      '& .MuiInputBase-input': {
                        padding: '8px 12px',
                      },
                      '& .MuiInputBase-input::placeholder': {
                        color: themeStyles.textMuted,
                        opacity: 1,
                      },
                    }}
                  />
                  <IconButton
                    size="small"
                    sx={{
                      backgroundColor: themeStyles.buttonBg,
                      color: themeStyles.buttonTextColor,
                      padding: '8px',
                      '&:hover': {
                        backgroundColor: themeStyles.buttonHoverBg,
                      },
                    }}
                  >
                    <Send fontSize="small" />
                  </IconButton>
                </Box>
              </Box>
            </motion.div>
          </Grid>
        </Grid>

        <Divider sx={{ borderColor: themeStyles.dividerColor, my: isMobile ? 1.5 : 2 }} />

        {/* Bottom Bar */}
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: isMobile ? 1 : 1.5,
          }}
        >
          <Typography 
            variant="body2" 
            sx={{ 
              color: themeStyles.textMuted,
              fontSize: isMobile ? 11 : 12,
              textAlign: isMobile ? 'center' : 'left'
            }}
          >
            © {currentYear} TouchSomeGrass. Tous droits réservés.
          </Typography>

          <Box 
            sx={{ 
              display: 'flex', 
              gap: isMobile ? 1.5 : 2,
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            {footerLinks.legal.map((link, index) => (
              <Typography
                key={index}
                component={Link}
                to={link.path}
                variant="body2"
                sx={{
                  color: themeStyles.textMuted,
                  textDecoration: 'none',
                  transition: 'color 0.3s ease',
                  fontSize: isMobile ? 11 : 12,
                  '&:hover': {
                    color: themeStyles.accentColor,
                  },
                }}
              >
                {link.name}
              </Typography>
            ))}
          </Box>
        </Box>
      </Box>
    </Box>
    </>
  );
};

export default Footer;