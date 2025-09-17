import './App.css';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import Auth from './components/pages/Auth/Auth';
import Home from './components/pages/Home/Home';
import Profile from './components/pages/Profile/Profile';
import CreateHikingSpot from './components/pages/HikingSpot/CreateHikingSpot';
import UserProvider from './components/contexts/UserContext/UserContext';
import PrivateRoute from './components/pages/PrivateRoute';
import HikingSpotList from './components/pages/HikingSpot/HikingSpotList.jsx';
import CreateSpot from './components/pages/Spot/CreateSpot.jsx';
import AllSpots from './components/pages/Spot/AllSpots.jsx';
import UserDetails from './components/containers/ProfileUser/UserDetails.jsx';
import AllUsers from './components/containers/ProfileUser/AllUsers.jsx';
import SpotDetails from './components/pages/Spot/SpotDetails.jsx';
import HikingSpotDetail from './components/pages/HikingSpot/HikingSpotDetail.jsx'
import HomeCarousel from './components/pages/Carrousel/HomeCarrousel.jsx';
import NavBarCustom from './components/navBar/NavBarCustom.jsx';
import Test from './components/pages/Test/Tester.jsx';
import { GoogleMap, useLoadScript } from '@react-google-maps/api';

function Layout() {
  const location = useLocation();

  return (
    <>
      {/* ✅ La NavBar ne s'affiche pas sur la page de login */}
      {location.pathname !== "/login" && <NavBarCustom />}
      
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Auth />} />

        <Route element={<PrivateRoute />}>
          <Route path="/profile" element={<Profile />} />
          <Route path="/CreateHikingSpots" element={<CreateHikingSpot />} />
          <Route path="/CreateSpots" element={<CreateSpot />} />
        </Route>

        <Route path="/HikingSpots" element={<HikingSpotList />} />
        <Route path="/Spots" element={<AllSpots />} />
        <Route path="/Spot/:id" element={<SpotDetails />} />
        <Route path="/HikingSpot/:id" element={<HikingSpotDetail />} />
        <Route path="/users" element={<AllUsers />} />
        <Route path="/user/:id" element={<UserDetails />} />
        <Route path="/carousel" element={<HomeCarousel />} />
        <Route path="/test" element={<Test />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Layout />
      </BrowserRouter>
    </UserProvider>
  );
}