import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Grid,
  Card,
  CardContent,
  Typography,
  Chip,
  Slider,
  CircularProgress,
  CardMedia,
  CardActions,
  Pagination,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import MyLocationIcon from '@mui/icons-material/MyLocation';
import axios from 'axios';

const API_URL = 'http://localhost:8088/AUTH-SERVICE/api/v1';

interface SearchParams {
  query?: string;
  latitude?: number;
  longitude?: number;
  radius?: number;
  region?: string;
  creatorEmail?: string;
  minDifficulty?: number;
  maxDifficulty?: number;
  minDistance?: number;
  maxDistance?: number;
  page?: number;
  size?: number;
  sortBy?: string;
  sortOrder?: string;
}

const SearchPage = () => {
  const [searchType, setSearchType] = useState<'spots' | 'hiking'>('spots');
  const [query, setQuery] = useState('');
  const [radius, setRadius] = useState(5000); // 5km par défaut
  const [region, setRegion] = useState('');
  const [creatorEmail, setCreatorEmail] = useState('');
  
  // 🔥 Slider difficulté (1-5)
  const [difficultyRange, setDifficultyRange] = useState<number[]>([1, 5]);
  
  // Filtre distance du parcours
  const [distanceRange, setDistanceRange] = useState<number[]>([0, 100]); // km
  
  const [results, setResults] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [userLocation, setUserLocation] = useState<{lat: number, lng: number} | null>(null);
  const [currentPage, setCurrentPage] = useState(0);

  // 📍 Obtenir la position de l'utilisateur
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          alert('✅ Position obtenue !');
        },
        (error) => {
          alert('❌ Impossible d\'obtenir votre position');
          console.error('Geolocation error:', error);
        }
      );
    } else {
      alert('❌ La géolocalisation n\'est pas supportée par votre navigateur');
    }
  };

  // 🔍 Recherche
  const handleSearch = async (page = 0) => {
    setLoading(true);
    try {
      const params: SearchParams = {
        query: query || undefined,
        latitude: userLocation?.lat,
        longitude: userLocation?.lng,
        radius: userLocation ? radius : undefined,
        region: region || undefined,
        creatorEmail: creatorEmail || undefined,
        page: page,
        size: 20,
        sortBy: userLocation ? 'distance' : 'name',
        sortOrder: 'asc',
      };

      // Filtres spécifiques HikingSpots
      if (searchType === 'hiking') {
        params.minDifficulty = difficultyRange[0];
        params.maxDifficulty = difficultyRange[1];
        params.minDistance = distanceRange[0];
        params.maxDistance = distanceRange[1];
      }

      console.log('🔍 Recherche avec params:', params);

      const endpoint = searchType === 'spots' 
        ? `${API_URL}/spots/search` 
        : `${API_URL}/hikingspot/search`;
    
      const response = await axios.post(endpoint, params);

      setResults(response.data);
      setCurrentPage(page);
      console.log('✅ Résultats:', response.data);
    } catch (error) {
      console.error('Erreur:', error);
      alert('❌ Erreur lors de la recherche');
    } finally {
      setLoading(false);
    }
  };

  // 🔄 Changement de page
  const handlePageChange = (event: React.ChangeEvent<unknown>, page: number) => {
    handleSearch(page - 1); // MUI Pagination commence à 1
  };

  // 🖼️ Obtenir l'URL de l'image
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '/images/no-image.png';
    
    // Photo reference Google
    if (imagePath.length > 100 && !imagePath.includes('/') && !imagePath.includes('.')) {
      return `https://maps.googleapis.com/maps/api/place/photo?photoreference=${imagePath}&maxwidth=400&key=AIzaSyBHiBCqOdyA356J87JgT3ZWnKR2zr7_Rvs`;
    }
    
    // URL complète
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    
    // Fichier local
    return `${API_URL}/uploads/${imagePath}`;
  };

  // 🎨 Badge difficulté
  const getDifficultyBadge = (level: number) => {
    const labels = ['', 'Très facile', 'Facile', 'Modéré', 'Difficile', 'Très difficile'];
    const colors: any = ['', 'success', 'info', 'warning', 'error', 'error'];
    return <Chip label={`${labels[level]} (${level}/5)`} color={colors[level]} size="small" />;
  };

  return (
    <Box sx={{ p: 3, maxWidth: 1400, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom sx={{ mb: 3 }}>
        🔍 Recherche avancée
      </Typography>

      {/* Formulaire de recherche */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={2}>
            {/* Type de recherche */}
            <Grid size={{ xs: 12, md: 6 }}>
              <FormControl fullWidth>
                <InputLabel>Type de recherche</InputLabel>
                <Select
                  value={searchType}
                  onChange={(e) => {
                    setSearchType(e.target.value as any);
                    setResults(null); // Reset résultats
                  }}
                  label="Type de recherche"
                >
                  <MenuItem value="spots">📍 Spots</MenuItem>
                  <MenuItem value="hiking">🏞️ Randonnées (Hiking Spots)</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            {/* Recherche textuelle */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Rechercher..."
                placeholder="Nom, description, région..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </Grid>

            {/* Email créateur */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Email du créateur"
                placeholder="exemple@email.com"
                value={creatorEmail}
                onChange={(e) => setCreatorEmail(e.target.value)}
              />
            </Grid>

            {/* Région */}
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Région"
                placeholder="Île-de-France, Provence..."
                value={region}
                onChange={(e) => setRegion(e.target.value)}
              />
            </Grid>

            {/* Géolocalisation */}
            <Grid size={{ xs: 12 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Button
                  variant={userLocation ? 'contained' : 'outlined'}
                  color={userLocation ? 'success' : 'primary'}
                  startIcon={<MyLocationIcon />}
                  onClick={getUserLocation}
                  disabled={!!userLocation}
                >
                  {userLocation 
                    ? `✅ Position : ${userLocation.lat.toFixed(4)}, ${userLocation.lng.toFixed(4)}` 
                    : '📍 Obtenir ma position'}
                </Button>

                {userLocation && (
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => setUserLocation(null)}
                  >
                    Supprimer
                  </Button>
                )}
              </Box>
            </Grid>

            {/* Rayon de recherche */}
            {userLocation && (
              <Grid size={{ xs: 12 }}>
                <Typography variant="body2" gutterBottom>
                  📏 Rayon de recherche : <strong>{radius / 1000} km</strong>
                </Typography>
                <Slider
                  value={radius}
                  onChange={(e, newValue) => setRadius(newValue as number)}
                  min={1000}
                  max={50000}
                  step={1000}
                  marks={[
                    { value: 1000, label: '1 km' },
                    { value: 10000, label: '10 km' },
                    { value: 25000, label: '25 km' },
                    { value: 50000, label: '50 km' },
                  ]}
                  valueLabelDisplay="auto"
                  valueLabelFormat={(value) => `${value / 1000} km`}
                />
              </Grid>
            )}

            {/* Filtres HikingSpots */}
            {searchType === 'hiking' && (
              <>
                {/* Slider difficulté */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" gutterBottom>
                    ⭐ Difficulté : <strong>{difficultyRange[0]} - {difficultyRange[1]}</strong> / 5
                  </Typography>
                  <Slider
                    value={difficultyRange}
                    onChange={(e, newValue) => setDifficultyRange(newValue as number[])}
                    min={1}
                    max={5}
                    step={1}
                    marks
                    valueLabelDisplay="auto"
                  />
                </Grid>

                {/* Slider distance du parcours */}
                <Grid size={{ xs: 12, md: 6 }}>
                  <Typography variant="body2" gutterBottom>
                    🚶 Distance du parcours : <strong>{distanceRange[0]} - {distanceRange[1]} km</strong>
                  </Typography>
                  <Slider
                    value={distanceRange}
                    onChange={(e, newValue) => setDistanceRange(newValue as number[])}
                    min={0}
                    max={100}
                    step={5}
                    marks={[
                      { value: 0, label: '0' },
                      { value: 25, label: '25' },
                      { value: 50, label: '50' },
                      { value: 100, label: '100 km' },
                    ]}
                    valueLabelDisplay="auto"
                    valueLabelFormat={(value) => `${value} km`}
                  />
                </Grid>
              </>
            )}

            {/* Bouton recherche */}
            <Grid size={{ xs: 12 }}>
              <Button
                fullWidth
                variant="contained"
                size="large"
                startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SearchIcon />}
                onClick={() => handleSearch(0)}
                disabled={loading}
              >
                {loading ? 'Recherche en cours...' : 'Rechercher'}
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Résultats */}
      {results && (
        <>
          {/* En-tête résultats */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography variant="h5">
              📊 <strong>{results.totalResults}</strong> résultat(s) trouvé(s)
            </Typography>
            
            {results.metadata && (
              <Box sx={{ textAlign: 'right' }}>
                {results.metadata.query && (
                  <Chip label={`Recherche: "${results.metadata.query}"`} sx={{ mr: 1 }} />
                )}
                {results.metadata.radiusKm && (
                  <Chip label={`Rayon: ${results.metadata.radiusKm} km`} color="primary" sx={{ mr: 1 }} />
                )}
                {results.metadata.creatorEmail && (
                  <Chip label={`Créateur: ${results.metadata.creatorEmail}`} color="secondary" />
                )}
              </Box>
            )}
          </Box>

          {/* Grille de résultats */}
          {results.results.length > 0 ? (
            <>
              <Grid container spacing={3}>
                {results.results.map((item: any) => (
                  <Grid size={{ xs: 12, sm: 6, md: 4, lg: 3 }} key={item.id}>
                    <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                      <CardMedia
                        component="img"
                        height="180"
                        image={getImageUrl(item.imagePath)}
                        alt={item.name}
                        sx={{ objectFit: 'cover' }}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = '/images/no-image.png';
                        }}
                      />
                      
                      <CardContent sx={{ flexGrow: 1 }}>
                        <Typography variant="h6" gutterBottom>
                          {item.name}
                        </Typography>
                        
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                          {item.description?.substring(0, 100)}
                          {item.description?.length > 100 && '...'}
                        </Typography>

                        {/* Badges */}
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          {item.region && (
                            <Chip label={item.region} size="small" variant="outlined" />
                          )}
                          
                          {item.difficultyLevel && getDifficultyBadge(item.difficultyLevel)}
                          
                          {item.distance && (
                            <Chip 
                              label={`${item.distance} km`} 
                              size="small" 
                              color="info"
                              variant="outlined"
                            />
                          )}
                          
                          {item.creatorName && (
                            <Chip 
                              label={`👤 ${item.creatorName}`} 
                              size="small" 
                              variant="outlined"
                            />
                          )}
                        </Box>
                      </CardContent>

                      <CardActions>
                        <Button 
                          size="small" 
                          color="primary"
                          href={searchType === 'spots' ? `/spot/${item.id}` : `/hiking-spot/${item.id}`}
                        >
                          Voir plus
                        </Button>
                      </CardActions>
                    </Card>
                  </Grid>
                ))}
              </Grid>

              {/* Pagination */}
              {results.totalPages > 1 && (
                <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                  <Pagination
                    count={results.totalPages}
                    page={currentPage + 1}
                    onChange={handlePageChange}
                    color="primary"
                    size="large"
                    showFirstButton
                    showLastButton
                  />
                </Box>
              )}
            </>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" color="text.secondary" textAlign="center">
                  😔 Aucun résultat trouvé
                </Typography>
                <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
                  Essayez de modifier vos critères de recherche
                </Typography>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* État initial */}
      {!results && !loading && (
        <Card>
          <CardContent>
            <Typography variant="h6" color="text.secondary" textAlign="center">
              🔍 Commencez votre recherche
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center" sx={{ mt: 1 }}>
              Utilisez les filtres ci-dessus pour trouver des spots ou des randonnées
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default SearchPage;