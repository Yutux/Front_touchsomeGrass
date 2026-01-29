import { useState, useEffect } from 'react';
import Plx from 'react-plx';
import { Link } from 'react-router-dom';
import Helmet from 'react-helmet';
import HomeCarousel from '../Carrousel/HomeCarrousel';

export default function Home() {
  const [showNavbar, setShowNavbar] = useState(false);

  // Gestion du scroll pour afficher la navbar
  useEffect(() => {
    const handleScroll = () => {
      setShowNavbar(window.scrollY > 400);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <div>
      <Helmet>
        <style>
          {`
            html, body {
              overscroll-behavior: none;
            }
            body {
              font-family: Arial Black, sans-serif;
              text-align: center;
              background: #000;
              height: 200vh;
              margin: 0;
            }
            .navbar {
              position: fixed;
              top: 0;
              width: 100%;
              background: rgba(0, 0, 0, 0.8);
              padding: 15px;
              display: flex;
              justify-content: center;
              gap: 20px;
              transition: opacity 0.5s ease-in-out;
            }
            .navbar a {
              color: white;
              text-decoration: none;
              font-size: 18px;
              font-weight: bold;
            }
          `}
        </style>
      </Helmet>

      {/* Navbar visible après 400px de scroll */}
      {showNavbar && (
        <div className="navbar">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
          <Link to="/contact">Contact</Link>
        </div>
      )}

      {/* Effet Parallax */}
      <Plx
        parallaxData={[{ start: 0, end: 900, easing: "ease-in", properties: [{ startValue: 1, endValue: 2, property: "scale" }] }]}
        style={{ position: "fixed", left: 0, top: 0, width: "100%", zIndex: 100 }}
      >
        <img style={{ width: "100%" }} src={require('../../styles/bg.png')} alt="foreground" />
      </Plx>

      <Plx
        parallaxData={[{ start: 0, end: 800, properties: [{ startValue: 1, endValue: 1.18, property: "scale" }] }]}
        style={{ position: "fixed", left: 0, top: 0, width: "100%" }}
      >
        <img style={{ width: "100%" }} src={require('../../styles/background.jpg')} alt="background" />
      </Plx>

      {/* Texte qui disparaît avec le scroll */}
      <Plx
        parallaxData={[{ start: 0, end: 400, properties: [{ startValue: 1, endValue: 0, property: "opacity" }] }]}
        style={{ position: "fixed", left: 0, top: "26vw", width: "100%" }}
      >
        <h1 style={{ color: "white" }}>TouchSomeGrass</h1>
      </Plx>

      {/* Carrousel qui remplace MDBCarousel après le scroll */}
      <Plx
        parallaxData={[{ start: 0, end: 400, properties: [{ startValue: 0, endValue: 1, property: "opacity" }] }]}
        style={{
          position: "fixed",
          left: "50%",
          top: "50%",
          transform: "translate(-50%, -50%)",
          width: "80%",
          maxWidth: "600px",
        }}
      >
      
      </Plx>
    </div>
  );
}

