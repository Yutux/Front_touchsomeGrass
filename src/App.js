import './App.css';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Auth from './components/pages/Auth/Auth';
import Home from './components/pages/Home/Home';
import UserProvider, { UserContext } from './components/contexts/UserContext/UserContext';
import PrivateRoute from './components/pages/PrivateRoute';
import HikingSpotList from './components/pages/HikingSpot/HikingSpotList.jsx';

import AllSpots from './components/pages/Spot/AllSpots.jsx';
import UserDetails from './components/containers/ProfileUser/UserDetails.jsx';
import AllUsers from './components/containers/ProfileUser/AllUsers.jsx';
import SpotDetails from './components/pages/Spot/SpotDetails.jsx';
import HikingSpotDetail from './components/pages/HikingSpot/HikingSpotDetail.jsx'
import HomeCarousel from './components/pages/Carrousel/HomeCarrousel.jsx';
import NavBarCustom from './components/navBar/NavBarCustom.jsx';
import Test from './components/pages/Test/Tester.jsx';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';
import { useContext } from 'react';
import { MantineProvider } from '@mantine/core';
import AdminDashboard from './components/pages/Admin/AdminDashboard';
import SpotCreator from './components/containers/searchMaps/SpotCreator';
import UpdateHikingSpotPage from './components/pages/HikingSpot/UpdateHikingSpotPage';
import UpdateSpotPage from './components/pages/Spot/UpdateSpotPage';
import ProfileUser from './components/containers/ProfileUser/ProfileUser';
import SearchPage from './components/search/SearchPage';
import CreateSpotPage from './components/pages/Spot/CreateSpotPage';
import CreateHikingSpotPage from './components/pages/HikingSpot/CreateHikingSpotPage';
import TrajetMap from './components/Map/TrajetMap';


function Layout() {
  const location = useLocation();
  const { isLoading } = useContext(UserContext);

  if (isLoading) return null;

  const hideNavPaths = ["/login", "/test"]; // on garde la logique

  return (
    <>
      {!hideNavPaths.includes(location.pathname) && <NavBarCustom />} 
      
      <div style={{ paddingTop: '70px' }}> {/* espace réservé sous la navbar */}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Auth />} />
          <Route element={<PrivateRoute />}>
            <Route path="/profile" element={<ProfileUser />} />
          </Route>
          <Route path="/CreateHikingSpots" element={<TrajetMap />} />
          <Route path="/spots/create" element={<CreateSpotPage />} />
          <Route path="/HikingSpots" element={<HikingSpotList />} />
          <Route path="/Spots" element={<AllSpots />} />
          <Route path="/Spot/:id" element={<SpotDetails />} />
          <Route path="/HikingSpot/:id" element={<HikingSpotDetail />} />
          <Route path="/users" element={<AllUsers />} />
          <Route path="/user/:id" element={<UserDetails />} />
          <Route path="/carousel" element={<HomeCarousel />} />
          <Route path="/test" element={<Test />} />
          <Route path="/AdminDashboard" element={<AdminDashboard />} />
          <Route path="/testcreate" element={<SpotCreator />} />
          <Route path="/search" element={<SearchPage />} />
          <Route
          path="/admin/hikingspot/update/:id"
          element={<UpdateHikingSpotPage />}
          />
          <Route path="/admin/spot/update/:id" element={<UpdateSpotPage />} />
        </Routes>
      </div>
    </>
  );
}

export default function App() {
  return (
    <MantineProvider
      theme={{ colorScheme: "dark" }}
      withGlobalStyles
      withNormalizeCSS
    >
      <UserProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </UserProvider>
    </MantineProvider>
  );
}