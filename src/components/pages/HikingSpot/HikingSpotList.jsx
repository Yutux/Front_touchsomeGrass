
import React, { useEffect, useState } from "react";
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
  Tooltip,
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
  CircularProgress,
} from "@mui/material";
import { Link } from "react-router-dom";
import TerrainIcon from "@mui/icons-material/Terrain";
import PlaceIcon from "@mui/icons-material/Place";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import MapIcon from "@mui/icons-material/Map";
import SearchIcon from "@mui/icons-material/Search";
import FilterListIcon from "@mui/icons-material/FilterList";
import ClearIcon from "@mui/icons-material/Clear";
import SortIcon from "@mui/icons-material/Sort";
import MyLocationIcon from "@mui/icons-material/MyLocation";
import TuneIcon from "@mui/icons-material/Tune";

/* --- thème --- */
const theme = createTheme({
  palette: {
    primary: { main: "#2e7d32" },
    secondary: { main: "#0288d1" },
    background: { default: "#f4f6f8" },
  },
  typography: {
    fontFamily: "Inter, system-ui, -apple-system, Segoe UI, Roboto, sans-serif",
    body2: { fontSize: 13.5 },
    caption: { fontSize: 12 },
  },
});

/* --- constantes --- */
const IMG_H = { xs: 136, sm: 156, md: 168 };
const PREVIEW_H = 56;
const DESC_MIN_H = 48;
const ITEMS_PER_PAGE = 12;

/* ------------------ Carte Spot ------------------ */
function SpotCard({ spot }) {
  const mainImage =
    spot?.imagePath && (spot.imagePath.startsWith("http") || spot.imagePath.startsWith("https"))
      ? spot.imagePath
      : spot?.imagePath
      ? `http://localhost:8088/AUTH-SERVICE/api/v1/uploads/${spot.imagePath}`
      : (spot?.imageUrls && spot.imageUrls[0]) || "/images/no-image.png";

  const distance = typeof spot?.distance === "number" ? spot.distance : null;
  const duration = typeof spot?.duration === "number" ? spot.duration : null;

  const hasDistance = typeof distance === "number" && distance > 0.001;
  const hasDuration = typeof duration === "number" && duration > 0.5;
  const hasCoords =
    typeof spot?.startLatitude === "number" &&
    typeof spot?.startLongitude === "number" &&
    Math.abs(spot.startLatitude) + Math.abs(spot.startLongitude) > 0.001;

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
          alt={spot?.name || "Hiking spot"}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = "/images/no-image.png";
          }}
          sx={{ height: IMG_H, objectFit: "cover" }}
        />
        {spot?.name && (
          <Chip
            icon={<TerrainIcon />}
            label={spot.name}
            size="small"
            sx={{
              position: "absolute",
              top: 8,
              left: 8,
              px: 0.75,
              height: 24,
              backgroundColor:
                (spot?.difficultyLevel ?? 0) < 3
                  ? "rgba(76,175,80,0.9)"
                  : (spot?.difficultyLevel ?? 0) < 5
                  ? "rgba(255,193,7,0.9)"
                  : "rgba(244,67,54,0.9)",
              color: "white",
              fontWeight: 600,
            }}
          />
        )}
      </Box>

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
          {spot.imageUrls.slice(1, 6).map((url, index) => (
            <Box
              key={index}
              component="img"
              src={url}
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
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{
            mb: 0.75,
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            minHeight: DESC_MIN_H,
          }}
        >
          {spot?.description || "Aucune description disponible."}
        </Typography>

        <Stack direction="row" spacing={0.75} sx={{ mb: 0.75, flexWrap: "wrap" }}>
          {spot?.region && (
            <Chip
              icon={<MapIcon />}
              label={spot.region}
              size="small"
              sx={{ height: 24, "& .MuiChip-label": { px: 0.75 } }}
            />
          )}
          {spot?.creatorName && (
            <Chip
              label={`👤 ${spot.creatorName}`}
              variant="outlined"
              size="small"
              sx={{ height: 24, "& .MuiChip-label": { px: 0.75 } }}
            />
          )}
        </Stack>

        <Stack direction="row" spacing={0.75} sx={{ mb: hasCoords ? 0.5 : 1, alignItems: "center", flexWrap: "wrap" }}>
          {hasDistance && (
            <Tooltip title="Distance totale">
              <Chip
                icon={<TerrainIcon />}
                label={`${distance.toFixed(1)} km`}
                color="primary"
                size="small"
                sx={{ height: 24, "& .MuiChip-label": { px: 0.75 } }}
              />
            </Tooltip>
          )}
          {hasDuration && (
            <Tooltip title="Durée estimée">
              <Chip
                icon={<AccessTimeIcon />}
                label={`${Math.round(duration)} min`}
                color="secondary"
                size="small"
                sx={{ height: 24, "& .MuiChip-label": { px: 0.75 } }}
              />
            </Tooltip>
          )}
        </Stack>

        {hasCoords && (
          <Typography
            variant="caption"
            sx={{ color: "text.secondary", display: "flex", alignItems: "center", mb: 1, gap: 0.5 }}
          >
            <PlaceIcon fontSize="small" />
            {spot.startLatitude.toFixed(3)}, {spot.startLongitude.toFixed(3)}
          </Typography>
        )}

        <Button
          variant="contained"
          color="primary"
          fullWidth
          component={Link}
          to={`/HikingSpot/${spot.id}`}
          sx={{
            mt: "auto",
            borderRadius: 1.5,
            textTransform: "none",
            fontWeight: 700,
            py: 0.75,
            fontSize: 14,
          }}
        >
          Voir les détails
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
        <Skeleton width="80%" />
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
  regions, 
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
  difficultyRange,
  setDifficultyRange,
  distanceRange,
  setDistanceRange,
  onSearch
}) {
  const handleReset = () => {
    setFilters({
      search: "",
      region: "",
      difficulty: "",
      maxDuration: "",
    });
    setSortBy("name");
    setSortOrder("asc");
    setUserLocation(null);
    setRadius(5000);
    setDifficultyRange([1, 5]);
    setDistanceRange([0, 100]);
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

  const hasActiveFilters = filters.search || filters.region || filters.difficulty || filters.maxDuration || userLocation;

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
                (filters.region ? 1 : 0) + 
                (filters.difficulty ? 1 : 0) + 
                (filters.maxDuration ? 1 : 0) +
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
          {/* Ligne 1: Recherche, Région, Difficulté, Durée */}
          <Grid item xs={12} sm={6} md={3}>
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

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Région</InputLabel>
              <Select
                value={filters.region}
                label="Région"
                onChange={(e) => setFilters({ ...filters, region: e.target.value })}
              >
                <MenuItem value="">Toutes</MenuItem>
                {regions.map((region) => (
                  <MenuItem key={region} value={region}>
                    {region}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <FormControl fullWidth size="small">
              <InputLabel>Difficulté</InputLabel>
              <Select
                value={filters.difficulty}
                label="Difficulté"
                onChange={(e) => setFilters({ ...filters, difficulty: e.target.value })}
              >
                <MenuItem value="">Toutes</MenuItem>
                <MenuItem value="1-2">Facile (1-2)</MenuItem>
                <MenuItem value="3-4">Modéré (3-4)</MenuItem>
                <MenuItem value="5-7">Difficile (5-7)</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12} sm={6} md={3}>
            <TextField
              fullWidth
              size="small"
              type="number"
              label="Durée max (min)"
              value={filters.maxDuration}
              onChange={(e) => setFilters({ ...filters, maxDuration: e.target.value })}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <AccessTimeIcon fontSize="small" />
                  </InputAdornment>
                ),
              }}
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

              {/* Slider difficulté */}
              <Grid item xs={12} md={6}>
                <Typography variant="body2" gutterBottom>
                  ⭐ Difficulté : <strong>{difficultyRange[0]} - {difficultyRange[1]}</strong> / 5
                </Typography>
                <Slider
                  value={difficultyRange}
                  onChange={(e, newValue) => setDifficultyRange(newValue)}
                  min={1}
                  max={5}
                  step={1}
                  marks
                  valueLabelDisplay="auto"
                />
              </Grid>

              {/* Slider distance du parcours */}
              <Grid item xs={12} md={6}>
                <Typography variant="body2" gutterBottom>
                  🚶 Distance du parcours : <strong>{distanceRange[0]} - {distanceRange[1]} km</strong>
                </Typography>
                <Slider
                  value={distanceRange}
                  onChange={(e, newValue) => setDistanceRange(newValue)}
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
              <Grid item xs={12} sm={6} md={4}>
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
                    <MenuItem value="difficulty">Difficulté</MenuItem>
                    <MenuItem value="distance">Distance</MenuItem>
                    <MenuItem value="duration">Durée</MenuItem>
                    <MenuItem value="region">Région</MenuItem>
                    <MenuItem value="createdAt">Date de création</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6} md={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Ordre</InputLabel>
                  <Select
                    value={sortOrder}
                    label="Ordre"
                    onChange={(e) => setSortOrder(e.target.value)}
                  >
                    <MenuItem value="asc">Croissant (A→Z, 1→9)</MenuItem>
                    <MenuItem value="desc">Décroissant (Z→A, 9→1)</MenuItem>
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

      case "difficulty":
        aVal = a.difficultyLevel ?? 0;
        bVal = b.difficultyLevel ?? 0;
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;

      case "distance":
        aVal = a.distance ?? 0;
        bVal = b.distance ?? 0;
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;

      case "duration":
        aVal = a.duration ?? 0;
        bVal = b.duration ?? 0;
        return sortOrder === "asc" ? aVal - bVal : bVal - aVal;

      case "region":
        aVal = (a.region || "").toLowerCase();
        bVal = (b.region || "").toLowerCase();
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
function HikingSpotListContent() {
  const [hikingSpots, setHikingSpots] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState("name");
  const [sortOrder, setSortOrder] = useState("asc");
  const [advancedMode, setAdvancedMode] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  
  // Filtres simples
  const [filters, setFilters] = useState({
    search: "",
    region: "",
    difficulty: "",
    maxDuration: "",
  });

  // Filtres avancés
  const [userLocation, setUserLocation] = useState(null);
  const [radius, setRadius] = useState(5000);
  const [difficultyRange, setDifficultyRange] = useState([1, 5]);
  const [distanceRange, setDistanceRange] = useState([0, 100]);

  // État pour la recherche API
  const [apiResults, setApiResults] = useState(null);

  // Chargement initial (mode simple)
  useEffect(() => {
    if (!advancedMode) {
      setLoading(true);
      request("http://localhost:8088/AUTH-SERVICE/api/v1/hikingspot/get/all", "GET", {}, false)
        .then((response) => {
          if (response?.data?.hikingSpots) setHikingSpots(response.data.hikingSpots);
          else setHikingSpots([]);
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
        region: filters.region || undefined,
        minDifficulty: difficultyRange[0],
        maxDifficulty: difficultyRange[1],
        minDistance: distanceRange[0],
        maxDistance: distanceRange[1],
        page: page,
        size: ITEMS_PER_PAGE,
        sortBy: userLocation ? 'distance' : sortBy,
        sortOrder: sortOrder,
      };

      console.log('🔍 Recherche avancée avec params:', params);

      const response = await request(
        "http://localhost:8088/AUTH-SERVICE/api/v1/hikingspot/search",
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

  // Extraire les régions uniques
  const regions = [...new Set(hikingSpots.map((spot) => spot.region).filter(Boolean))].sort();

  // Mode simple: filtrage et tri côté client
  const filteredSpots = !advancedMode ? hikingSpots.filter((spot) => {
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        spot.name?.toLowerCase().includes(searchLower) ||
        spot.description?.toLowerCase().includes(searchLower) ||
        spot.region?.toLowerCase().includes(searchLower) ||
        spot.creatorName?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    if (filters.region && spot.region !== filters.region) {
      return false;
    }

    if (filters.difficulty) {
      const level = spot.difficultyLevel ?? 0;
      if (filters.difficulty === "1-2" && (level < 1 || level > 2)) return false;
      if (filters.difficulty === "3-4" && (level < 3 || level > 4)) return false;
      if (filters.difficulty === "5-7" && (level < 5 || level > 7)) return false;
    }

    if (filters.maxDuration) {
      const maxDur = parseFloat(filters.maxDuration);
      if (spot.duration && spot.duration > maxDur) return false;
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

  // Réinitialiser la page lors du changement de filtres (mode simple)
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
        regions={regions}
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
        difficultyRange={difficultyRange}
        setDifficultyRange={setDifficultyRange}
        distanceRange={distanceRange}
        setDistanceRange={setDistanceRange}
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
                  Tri: {sortBy === "name" ? "Nom" : sortBy === "difficulty" ? "Difficulté" : sortBy === "distance" ? "Distance" : sortBy === "duration" ? "Durée" : sortBy === "region" ? "Région" : "Date"} 
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
          <Typography variant="h6" sx={{ mb: 2 }}>
            {advancedMode 
              ? "Aucun résultat trouvé pour cette recherche avancée" 
              : hikingSpots.length === 0 
                ? "Aucun spot disponible." 
                : "Aucun spot ne correspond à vos critères."}
          </Typography>
          <Button
            onClick={() => {
              setFilters({
                search: "",
                region: "",
                difficulty: "",
                maxDuration: "",
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
}

const HikingSpotList = () => (
  <ThemeProvider theme={theme}>
    <HikingSpotListContent />
  </ThemeProvider>
);

export default HikingSpotList;