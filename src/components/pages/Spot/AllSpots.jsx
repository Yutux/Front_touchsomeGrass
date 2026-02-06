
import { useEffect, useState } from "react";
import request from "../../utils/request";
import {
  ThemeProvider,
  createTheme,
  Container,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Button,
  Box,
  Chip,
  Stack,
  Grid,
  Skeleton,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  InputAdornment,
  Collapse,
  Pagination,
  Slider,
  Switch,
  FormControlLabel,
  Alert,
} from "@mui/material";
import { Link } from "react-router-dom";
import PlaceIcon from "@mui/icons-material/Place";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import SortIcon from "@mui/icons-material/Sort";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import TuneIcon from "@mui/icons-material/Tune";
import FavoriteButton from "../../UI/FavoriteButton";

const theme = createTheme({
  palette: {
    primary: { main: "#d32f2f" },
    secondary: { main: "#0288d1" },
    background: { default: "#f9fafb" },
  },
  typography: { fontFamily: "Inter, sans-serif" },
});

/* tailles compactes */
const IMG_H = { xs: 136, sm: 156, md: 168 };
const PREVIEW_H = 56;
const DESC_MIN_H = 48;
const ITEMS_PER_PAGE = 12;

// 🔥 Clé API Google Maps
const GOOGLE_API_KEY = "AIzaSyBHiBCqOdyA356J87JgT3ZWnKR2zr7_Rvs";

// 🔥 Fonction pour générer la bonne URL d'image
const getImageUrl = (imagePath) => {
  if (!imagePath) return "/images/no-image.png";

  if (imagePath.length > 100 && !imagePath.includes('/') && !imagePath.includes('.')) {
    return `https://maps.googleapis.com/maps/api/place/photo?photoreference=${imagePath}&maxwidth=800&key=${GOOGLE_API_KEY}`;
  }

  if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
    return imagePath;
  }

  return `http://localhost:8088/api/v1/uploads/${imagePath}`;
};

/* ------------------ Carte Spot ------------------ */
function SpotCard({ spot }) {
  const mainImage = getImageUrl(spot?.imagePath || (spot?.imageUrls && spot.imageUrls[0]));

  const hasCoords =
    typeof spot?.latitude === "number" &&
    typeof spot?.longitude === "number" &&
    Math.abs(spot.latitude) + Math.abs(spot.longitude) > 0.001;

  return (
    <Card
      sx={{
        width: "100%",
        height: "100%",
        borderRadius: 2.5,
        overflow: "hidden",
        boxShadow: "0 3px 16px rgba(0,0,0,0.08)",
        transition: "transform .22s ease, box-shadow .22s ease",
        display: "flex",
        flexDirection: "column",
        "&:hover": { transform: "translateY(-4px)", boxShadow: "0 6px 18px rgba(0,0,0,0.14)" },
      }}
    >
      <Box sx={{ position: "relative" }}>
        <CardMedia
          component="img"
          loading="lazy"
          image={mainImage}
          alt={spot?.name || "Spot"}
          sx={{ height: IMG_H, objectFit: "cover" }}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/no-image.png";
          }}
        />
        
        {/* 🔥 BOUTON FAVORIS - En haut à droite de l'image */}
        <Box sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1 }}>
          <FavoriteButton 
            spotId={spot.id} 
            type="spot"
            size="small"
            color="error"
          />
        </Box>

        {hasCoords && (
          <Chip
            icon={<PlaceIcon />}
            label={`${spot.latitude.toFixed(3)}, ${spot.longitude.toFixed(3)}`}
            size="small"
            sx={{
              position: "absolute",
              bottom: 8,
              left: 8,
              height: 24,
              backgroundColor: "rgba(255,255,255,0.9)",
              fontWeight: 600,
              "& .MuiChip-label": { px: 0.75 },
            }}
          />
        )}
      </Box>

      {/* ... Reste du code inchangé ... */}
      {Array.isArray(spot?.imageUrls) && spot.imageUrls.length > 1 ? (
        <Stack
          direction="row"
          spacing={1}
          sx={{
            p: 1,
            px: 1.25,
            flexWrap: "wrap",
            rowGap: 1,
            height: PREVIEW_H,
            overflow: "hidden",
          }}
        >
          {spot.imageUrls.slice(1, 6).map((imagePath, index) => (
            <Box
              key={index}
              component="img"
              src={getImageUrl(imagePath)}
              loading="lazy"
              alt={`preview-${index}`}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = "/images/no-image.png";
              }}
              sx={{
                width: 50,
                height: 50,
                borderRadius: 1.25,
                objectFit: "cover",
                flex: "0 0 auto",
              }}
            />
          ))}
        </Stack>
      ) : (
        <Box sx={{ height: PREVIEW_H }} />
      )}

      <CardContent sx={{ flexGrow: 1, display: "flex", flexDirection: "column", pt: 1, pb: 1.25 }}>
        <Typography variant="subtitle1" sx={{ fontWeight: 700, color: "text.primary" }}>
          {spot?.name || "Spot"}
        </Typography>

        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mt: 0.5,
            mb: 1.25,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: DESC_MIN_H,
          }}
        >
          {spot?.description || "Aucune description disponible."}
        </Typography>

        {spot?.creator && (
          <Chip
            label={`👤 ${spot.creator}`}
            variant="outlined"
            size="small"
            sx={{ height: 24, mb: 1, alignSelf: "flex-start" }}
          />
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          component={Link}
          to={`/spot/${spot.id}`}
          sx={{ borderRadius: 1.5, textTransform: "none", fontWeight: 700, py: 0.75, mt: "auto" }}
        >
          Voir plus
        </Button>
      </CardContent>
    </Card>
  );
}

/* ------------------ Skeleton ------------------ */
function SpotCardSkeleton() {
  return (
    <Card sx={{ width: "100%", borderRadius: 2.5, overflow: "hidden" }}>
      <Skeleton variant="rectangular" height={IMG_H.md} />
      <Box sx={{ p: 1.5 }}>
        <Skeleton width="75%" />
        <Skeleton width="55%" />
        <Skeleton width="40%" />
        <Skeleton variant="rectangular" height={34} sx={{ mt: 1.25, borderRadius: 1.5 }} />
      </Box>
    </Card>
  );
}

/* ------------------ Panneau de filtres ------------------ */
function FilterPanel({ 
  filters, 
  setFilters, 
  showFilters, 
  setShowFilters, 
  sortBy, 
  setSortBy, 
  sortOrder, 
  setSortOrder,
  advancedMode,
  setAdvancedMode,
  userLocation,
  setUserLocation,
  radius,
  setRadius,
  onSearch
}) {
  const handleReset = () => {
    setFilters({
      search: "",
      creatorEmail: "",
    });
    setSortBy("name");
    setSortOrder("asc");
    setUserLocation(null);
    setRadius(5000);
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
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

  const hasActiveFilters = filters.search || filters.creatorEmail || userLocation;

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        mb: 3,
        borderRadius: 2,
        backgroundColor: "white",
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: showFilters ? 2 : 0 }}>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <FilterListIcon color="primary" />
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Filtres & Tri
          </Typography>
          {hasActiveFilters && (
            <Chip
              label={
                (filters.search ? 1 : 0) + 
                (filters.creatorEmail ? 1 : 0) +
                (userLocation ? 1 : 0)
              }
              size="small"
              color="primary"
              sx={{ height: 20, fontSize: 11 }}
            />
          )}
          {advancedMode && (
            <Chip
              label="Mode avancé"
              size="small"
              color="secondary"
              sx={{ height: 20, fontSize: 11 }}
            />
          )}
        </Box>
        <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
          <FormControlLabel
            control={
              <Switch
                checked={advancedMode}
                onChange={(e) => setAdvancedMode(e.target.checked)}
                size="small"
              />
            }
            label={
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
                <TuneIcon fontSize="small" />
                <Typography variant="caption">Avancé</Typography>
              </Box>
            }
            sx={{ mr: 1 }}
          />
          {hasActiveFilters && (
            <Button
              size="small"
              startIcon={<ClearIcon />}
              onClick={handleReset}
              sx={{ textTransform: "none" }}
            >
              Réinitialiser
            </Button>
          )}
          <Button
            size="small"
            onClick={() => setShowFilters(!showFilters)}
            sx={{ textTransform: "none" }}
          >
            {showFilters ? "Masquer" : "Afficher"}
          </Button>
        </Box>
      </Box>

      <Collapse in={showFilters}>
        <Grid container spacing={2}>
          {/* Recherche */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Rechercher"
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          {/* Email créateur */}
          <Grid item xs={12} sm={6}>
            <TextField
              fullWidth
              size="small"
              label="Email du créateur"
              placeholder="exemple@email.com"
              value={filters.creatorEmail}
              onChange={(e) => setFilters({ ...filters, creatorEmail: e.target.value })}
            />
          </Grid>

          {/* Filtres avancés */}
          {advancedMode && (
            <>
              {/* Géolocalisation */}
              <Grid item xs={12}>
                <Alert severity="info" sx={{ mb: 2 }}>
                  <strong>Mode recherche avancée activé</strong> - Les résultats proviennent de l'API avec filtrage côté serveur
                </Alert>
                <Box sx={{ display: "flex", alignItems: "center", gap: 2, flexWrap: "wrap" }}>
                  <Button
                    variant={userLocation ? 'contained' : 'outlined'}
                    color={userLocation ? 'success' : 'primary'}
                    startIcon={<MyLocationIcon />}
                    onClick={getUserLocation}
                    disabled={!!userLocation}
                    size="small"
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
                <Grid item xs={12}>
                  <Typography variant="body2" gutterBottom>
                    📏 Rayon de recherche : <strong>{radius / 1000} km</strong>
                  </Typography>
                  <Slider
                    value={radius}
                    onChange={(e, newValue) => setRadius(newValue)}
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

              {/* Bouton recherche API */}
              <Grid item xs={12}>
                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  color="secondary"
                  startIcon={<SearchIcon />}
                  onClick={onSearch}
                >
                  Lancer la recherche avancée
                </Button>
              </Grid>
            </>
          )}

          {/* Tri (seulement en mode simple) */}
          {!advancedMode && (
            <>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Trier par</InputLabel>
                  <Select
                    value={sortBy}
                    label="Trier par"
                    onChange={(e) => setSortBy(e.target.value)}
                    startAdornment={
                      <InputAdornment position="start">
                        <SortIcon fontSize="small" />
                      </InputAdornment>
                    }
                  >
                    <MenuItem value="name">Nom</MenuItem>
                    <MenuItem value="creator">Créateur</MenuItem>
                    <MenuItem value="createdAt">Date de création</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth size="small">
                  <InputLabel>Ordre</InputLabel>
                  <Select
                    value={sortOrder}
                    label="Ordre"
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <MenuItem value="asc">Croissant (A→Z)</MenuItem>
                    <MenuItem value="desc">Décroissant (Z→A)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </>
          )}
        </Grid>
      </Collapse>
    </Paper>
  );
}

/* ------------------ Fonction de tri ------------------ */
function sortSpots(spots, sortBy, sortOrder) {
  const sorted = [...spots].sort((a, b) => {
    let aVal, bVal;

    switch (sortBy) {
      case "name":
        aVal = (a.name || "").toLowerCase();
        bVal = (b.name || "").toLowerCase();
        return sortOrder === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);

      case "creator":
        aVal = (a.creator || "").toLowerCase();
        bVal = (b.creator || "").toLowerCase();
        return sortOrder === "asc" 
          ? aVal.localeCompare(bVal) 
          : bVal.localeCompare(aVal);

      case "createdAt":
        aVal = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        bVal = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;

      default:
        return 0;
    }
  });

  return sorted;
}

/* ------------------ Liste ------------------ */
const AllSpotsContent = () => {
  const [spots, setSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [advancedMode, setAdvancedMode] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  const [filters, setFilters] = useState({
    search: "",
    creatorEmail: "",
  });

  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(5000);
  const [apiResults, setApiResults] = useState(null);

  // Chargement initial
  useEffect(() => {
    if (!advancedMode) {
      setLoading(true);
      request("http://localhost:8088/api/v1/spots/get/all", "GET", {}, false)
        .then((response) => {
          if (Array.isArray(response?.data)) {
            setSpots(response.data);
          } else if (response?.data?.spots) {
            setSpots(response.data.spots);
          } else {
            setSpots([]);
          }
          setApiResults(null);
        })
        .catch((error) => console.error("❌ Erreur lors du chargement des spots :", error))
        .finally(() => setLoading(false));
    }
  }, [advancedMode]);

  // Recherche avancée via API
  const handleAdvancedSearch = async (page = 0) => {
    setSearchLoading(true);
    try {
      const params = {
        query: filters.search || undefined,
        latitude: userLocation?.lat,
        longitude: userLocation?.lng,
        radius: userLocation ? radius : undefined,
        creatorEmail: filters.creatorEmail || undefined,
        page: page,
        size: ITEMS_PER_PAGE,
        sortBy: userLocation ? 'distance' : sortBy,
        sortOrder: sortOrder,
      };

      console.log('🔍 Recherche avancée avec params:', params);

      const response = await request(
        "http://localhost:8088/api/v1/spots/search",
        "POST",
        params,
        false
      );

      if (response?.data) {
        setApiResults(response.data);
        setCurrentPage(page + 1);
        console.log('✅ Résultats:', response.data);
      }
    } catch (error) {
      console.error('❌ Erreur lors de la recherche:', error);
      alert('❌ Erreur lors de la recherche avancée');
    } finally {
      setSearchLoading(false);
    }
  };

  // Filtrage côté client
  const filteredSpots = !advancedMode ? spots.filter((spot) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        spot.name?.toLowerCase().includes(searchLower) ||
        spot.description?.toLowerCase().includes(searchLower) ||
        spot.creator?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    if (filters.creatorEmail) {
      const emailLower = filters.creatorEmail.toLowerCase();
      if (!spot.creatorEmail || !spot.creatorEmail.toLowerCase().includes(emailLower)) {
        return false;
      }
    }

    return true;
  }) : [];

  const sortedSpots = !advancedMode ? sortSpots(filteredSpots, sortBy, sortOrder) : [];

  // Pagination
  const displaySpots = advancedMode && apiResults ? apiResults.results : sortedSpots;
  const totalResults = advancedMode && apiResults ? apiResults.totalResults : sortedSpots.length;
  const totalPages = advancedMode && apiResults 
    ? apiResults.totalPages 
    : Math.ceil(sortedSpots.length / ITEMS_PER_PAGE);

  const startIndex = !advancedMode ? (currentPage - 1) * ITEMS_PER_PAGE : 0;
  const endIndex = !advancedMode ? startIndex + ITEMS_PER_PAGE : displaySpots.length;
  const paginatedSpots = !advancedMode ? displaySpots.slice(startIndex, endIndex) : displaySpots;

  useEffect(() => {
    if (!advancedMode) {
      setCurrentPage(1);
    }
  }, [filters, sortBy, sortOrder, advancedMode]);

  const handlePageChange = (event, value) => {
    if (advancedMode && apiResults) {
      handleAdvancedSearch(value - 1);
    } else {
      setCurrentPage(value);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const isLoading = loading || searchLoading;

  return (
    <Container
      maxWidth="xl"
      sx={{
        minHeight: "90vh",
        backgroundColor: "background.default",
        py: { xs: 1.5, sm: 2.5, md: 3 },
        pb: { xs: 9, sm: 4 },
      }}
    >
      <FilterPanel
        filters={filters}
        setFilters={setFilters}
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        advancedMode={advancedMode}
        setAdvancedMode={setAdvancedMode}
        userLocation={userLocation}
        setUserLocation={setUserLocation}
        radius={radius}
        setRadius={setRadius}
        onSearch={() => handleAdvancedSearch(0)}
      />

      {isLoading ? (
        <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ px: { xs: 1, sm: 0 } }}>
          {Array.from({ length: 8 }).map((_, i) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={i}>
              <SpotCardSkeleton />
            </Grid>
          ))}
        </Grid>
      ) : totalResults > 0 ? (
        <>
          <Box sx={{ mb: 2, px: { xs: 1, sm: 0 }, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 1 }}>
            <Typography variant="body2" color="text.secondary">
              {totalResults} spot{totalResults > 1 ? "s" : ""} trouvé{totalResults > 1 ? "s" : ""}
              {totalPages > 1 && ` • Page ${currentPage} sur ${totalPages}`}
            </Typography>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              {advancedMode && apiResults && (
                <Chip 
                  label="API" 
                  size="small" 
                  color="secondary"
                  sx={{ height: 20 }}
                />
              )}
              {!advancedMode && (
                <Typography variant="caption" color="text.secondary">
                  Tri: {sortBy === "name" ? "Nom" : sortBy === "creator" ? "Créateur" : "Date"} 
                  ({sortOrder === "asc" ? "↑" : "↓"})
                </Typography>
              )}
            </Box>
          </Box>

          <Grid container spacing={{ xs: 1.5, sm: 2.5 }} sx={{ px: { xs: 1, sm: 0 } }}>
            {paginatedSpots.map((spot) => (
              <Grid item xs={12} sm={6} md={4} lg={3} key={spot.id}>
                <SpotCard spot={spot} />
              </Grid>
            ))}
          </Grid>

          {totalPages > 1 && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                size="large"
                showFirstButton
                showLastButton
                siblingCount={1}
                boundaryCount={1}
                disabled={searchLoading}
              />
            </Box>
          )}
        </>
      ) : (
        <Box sx={{ py: 6, textAlign: "center" }}>
          <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
            {advancedMode 
              ? "Aucun résultat trouvé pour cette recherche avancée" 
              : spots.length === 0 
                ? "Aucun spot disponible." 
                : "Aucun spot ne correspond à vos critères."}
          </Typography>
          <Button
            onClick={() => {
              setFilters({
                search: "",
                creatorEmail: "",
              });
              setSortBy("name");
              setSortOrder("asc");
              setUserLocation(null);
              setApiResults(null);
            }}
            variant="outlined"
          >
            Réinitialiser les filtres
          </Button>
        </Box>
      )}
    </Container>
  );
};

const AllSpots = () => (
  <ThemeProvider theme={theme}>
    <AllSpotsContent />
  </ThemeProvider>
);

export default AllSpots;