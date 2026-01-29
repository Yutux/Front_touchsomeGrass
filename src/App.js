import './App.css';
import { BrowserRouter, Route, Routes, useLocation } from 'react-router-dom';
import { useContext } from 'react';
import { MantineProvider } from '@mantine/core';

import UserProvider, { UserContext } from './components/contexts/UserContext/UserContext';
import PrivateRoute from './components/pages/PrivateRoute';

import NavBarCustom from './components/navBar/NavBarCustom';
import Footer from './components/footer/Footer';
import CookieBanner from './components/cookiesPop/CookiesBanner';

// Pages
import Home from './components/pages/Home/Home';
import Auth from './components/pages/Auth/Auth';
import ProfileUser from './components/containers/ProfileUser/ProfileUser';
import HikingSpotList from './components/pages/HikingSpot/HikingSpotList';
import HikingSpotDetail from './components/pages/HikingSpot/HikingSpotDetail';
import AllSpots from './components/pages/Spot/AllSpots';
import SpotDetails from './components/pages/Spot/SpotDetails';
import CreateSpotPage from './components/pages/Spot/CreateSpotPage';
import UpdateSpotPage from './components/pages/Spot/UpdateSpotPage';
import UpdateHikingSpotPage from './components/pages/HikingSpot/UpdateHikingSpotPage';
import AdminDashboard from './components/pages/Admin/AdminDashboard';
import AllUsers from './components/containers/ProfileUser/AllUsers';
import UserDetails from './components/containers/ProfileUser/UserDetails';
import SearchPage from './components/search/SearchPage';
import TrajetMap from './components/Map/TrajetMap';
import HomeCarousel from './components/pages/Carrousel/HomeCarrousel';
import SpotCreator from './components/containers/searchMaps/SpotCreator';
import Test from './components/pages/Test/Tester';

function Layout() {
  const location = useLocation();
  const { isLoading } = useContext(UserContext);

  if (isLoading) return null;

  const hideNavAndFooter = ['/login', '/test'].includes(location.pathname);

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {!hideNavAndFooter && <NavBarCustom />}

      {/* 🔥 CONTENU PRINCIPAL */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          paddingBottom: 'var(--bn-h, 0px)', // espace bottom-nav
          marginLeft: !hideNavAndFooter ? 'var(--nav-w, 0px)' : 0,
          width: '100%',
          minHeight: 0,
        }}
      >
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Auth />} />

            <Route element={<PrivateRoute />}>
              <Route path="/profile" element={<ProfileUser />} />
            </Route>

            <Route path="/HikingSpots" element={<HikingSpotList />} />
            <Route path="/HikingSpot/:id" element={<HikingSpotDetail />} />
            <Route path="/Spots" element={<AllSpots />} />
            <Route path="/Spot/:id" element={<SpotDetails />} />
            <Route path="/spots/create" element={<CreateSpotPage />} />
            <Route path="/admin/spot/update/:id" element={<UpdateSpotPage />} />
            <Route path="/admin/hikingspot/update/:id" element={<UpdateHikingSpotPage />} />
            <Route path="/AdminDashboard" element={<AdminDashboard />} />
            <Route path="/users" element={<AllUsers />} />
            <Route path="/user/:id" element={<UserDetails />} />
            <Route path="/search" element={<SearchPage />} />
            <Route path="/CreateHikingSpots" element={<TrajetMap />} />
            <Route path="/carousel" element={<HomeCarousel />} />
            <Route path="/testcreate" element={<SpotCreator />} />
            <Route path="/test" element={<Test />} />

            {/* Pages légales */}
            <Route path="/about" element={<Page text="À propos" />} />
            <Route path="/services" element={<Page text="Services" />} />
            <Route path="/team" element={<Page text="Équipe" />} />
            <Route path="/careers" element={<Page text="Carrières" />} />
            <Route path="/faq" element={<Page text="FAQ" />} />
            <Route path="/contact" element={<Page text="Contact" />} />
            <Route path="/support" element={<Page text="Support" />} />
            <Route path="/docs" element={<Page text="Documentation" />} />
            <Route path="/privacy" element={<Page text="Politique de confidentialité" />} />
            <Route path="/terms" element={<Page text="Conditions d'utilisation" />} />
            <Route path="/cookies" element={<Page text="Cookies" />} />
            <Route path="/legal" element={<Page text="Mentions légales" />} />
          </Routes>
        </div>
      </main>

      {!hideNavAndFooter && <Footer />}

      {/* IMPORTANT : inclus dans le layout */}
      <CookieBanner />
    </div>
  );
}

function Page({ text }) {
  return <div style={{ padding: '2rem' }}>{text}</div>;
}

export default function App() {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <UserProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </UserProvider>
    </MantineProvider>
  );
}
