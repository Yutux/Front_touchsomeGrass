
import React from 'react';
import { Rating, Box } from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';

/**
 * Composant d'étoiles pour notation
 * 
 * @param {Object} props
 * @param {number} props.value - Note actuelle (0-5)
 * @param {Function} props.onChange - Callback lors du changement (mode édition)
 * @param {boolean} props.readOnly - Mode lecture seule
 * @param {string} props.size - Taille: 'small', 'medium', 'large'
 */
export default function RatingStars({ 
  value = 0, 
  onChange, 
  readOnly = false, 
  size = 'medium' 
}) {
  const fontSize = {
    small: 18,
    medium: 24,
    large: 32,
  };

  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center' }}>
      <Rating
        value={value}
        onChange={(event, newValue) => {
          if (onChange && !readOnly) {
            onChange(newValue);
          }
        }}
        readOnly={readOnly}
        precision={1}
        icon={<StarIcon fontSize="inherit" />}
        emptyIcon={<StarIcon fontSize="inherit" />}
        sx={{
          fontSize: fontSize[size] || fontSize.medium,
          '& .MuiRating-iconFilled': {
            color: '#ffc107',
          },
          '& .MuiRating-iconHover': {
            color: '#ffb300',
          },
          '& .MuiRating-iconEmpty': {
            color: 'rgba(0,0,0,0.1)',
          },
        }}
      />
    </Box>
  );
}