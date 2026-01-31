<<<<<<< HEAD
import React, { useState } from "react";
=======

import logo from './logo.svg';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React
        </a>
      </header>
    </div>
  );
}


import React from "react";
>>>>>>> 332df103079b5c4f8da0812851d5dc13e074abb7
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Dashboard from "./components/Dashboard";
import ReportPage from "./pages/ReportPage";
import MapComponent from "./components/MapComponent";

export default function App() {
  const [activeNav, setActiveNav] = useState('home');

  const styles = {
    // Global styles
    app: {
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      backgroundColor: '#F5F5F5'
    },

    // Navigation
    navbar: {
      backgroundColor: '#1A237E',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      borderBottom: '3px solid #FFCC00'
    },
    navContainer: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '0 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '70px'
    },
    navBrand: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      textDecoration: 'none',
      color: '#FFCC00',
      fontSize: '24px',
      fontWeight: '700',
      letterSpacing: '-0.5px',
      cursor: 'pointer'
    },
    navIcon: {
      fontSize: '32px'
    },
    navMenu: {
      display: 'flex',
      gap: '0',
      listStyle: 'none',
      margin: 0,
      padding: 0
    },
    navItem: {
      margin: 0,
      padding: 0
    },
    navLink: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '25px 20px',
      color: '#ffffff',
      textDecoration: 'none',
      fontWeight: '600',
      fontSize: '14px',
      textTransform: 'uppercase',
      letterSpacing: '0.3px',
      transition: 'all 0.3s ease',
      borderBottom: '3px solid transparent',
      cursor: 'pointer'
    },
    navLinkActive: {
      backgroundColor: 'rgba(255, 204, 0, 0.1)',
      borderBottom: '3px solid #FFCC00',
      color: '#FFCC00'
    },
    navLinkHover: {
      backgroundColor: 'rgba(255, 204, 0, 0.05)',
      borderBottomColor: '#FFCC00'
    },

    // Main content
    main: {
      flex: 1,
      width: '100%'
    },

    // Footer
    footer: {
      backgroundColor: '#1A237E',
      color: '#E0E0E0',
      textAlign: 'center',
      padding: '30px 20px',
      borderTop: '2px solid #FFCC00',
      marginTop: '60px'
    },
    footerText: {
      fontSize: '13px',
      margin: '5px 0',
      letterSpacing: '0.3px'
    },
    footerBrand: {
      color: '#FFCC00',
      fontWeight: '700',
      fontSize: '14px',
      marginBottom: '10px'
    }
  };

  return (
    <Router>
      <div style={styles.app}>
        {/* Navigation */}
        <nav style={styles.navbar}>
          <div style={styles.navContainer}>
            <Link 
              to="/" 
              style={styles.navBrand}
              onClick={() => setActiveNav('home')}
            >
              <span style={styles.navIcon}>🌐</span>
              <span>NetLink</span>
            </Link>

            <ul style={styles.navMenu}>
              <li style={styles.navItem}>
                <Link
                  to="/"
                  style={{
                    ...styles.navLink,
                    ...(activeNav === 'home' ? styles.navLinkActive : {})
                  }}
                  onClick={() => setActiveNav('home')}
                  onMouseEnter={(e) => activeNav !== 'home' && Object.assign(e.currentTarget.style, styles.navLinkHover)}
                  onMouseLeave={(e) => {
                    if (activeNav !== 'home') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderBottomColor = 'transparent';
                    }
                  }}
                >
                  📊 Dashboard
                </Link>
              </li>

              <li style={styles.navItem}>
                <Link
                  to="/report"
                  style={{
                    ...styles.navLink,
                    ...(activeNav === 'report' ? styles.navLinkActive : {})
                  }}
                  onClick={() => setActiveNav('report')}
                  onMouseEnter={(e) => activeNav !== 'report' && Object.assign(e.currentTarget.style, styles.navLinkHover)}
                  onMouseLeave={(e) => {
                    if (activeNav !== 'report') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderBottomColor = 'transparent';
                    }
                  }}
                >
                  📝 Report Issue
                </Link>
              </li>

              <li style={styles.navItem}>
                <Link
                  to="/map"
                  style={{
                    ...styles.navLink,
                    ...(activeNav === 'map' ? styles.navLinkActive : {})
                  }}
                  onClick={() => setActiveNav('map')}
                  onMouseEnter={(e) => activeNav !== 'map' && Object.assign(e.currentTarget.style, styles.navLinkHover)}
                  onMouseLeave={(e) => {
                    if (activeNav !== 'map') {
                      e.currentTarget.style.backgroundColor = 'transparent';
                      e.currentTarget.style.borderBottomColor = 'transparent';
                    }
                  }}
                >
                  📍 Target Map
                </Link>
              </li>
            </ul>
          </div>
        </nav>

        {/* Main Content */}
        <main style={styles.main}>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/map" element={<MapComponent />} />
          </Routes>
        </main>

        {/* Footer */}
        <footer style={styles.footer}>
          <div style={styles.footerBrand}>🔐 NetLink - Professional Network Reporting</div>
          <p style={styles.footerText}>Secure & Encrypted | Real-time Monitoring | Community-Driven</p>
          <p style={styles.footerText}>© 2026 Network Helper. Connecting Cameroon through transparency.</p>
          <p style={{...styles.footerText, fontSize: '12px', marginTop: '15px', color: '#999'}}>
            Data is secure, encrypted, and used only for network improvement purposes.
          </p>
        </footer>
      </div>
    </Router>
  );
}
