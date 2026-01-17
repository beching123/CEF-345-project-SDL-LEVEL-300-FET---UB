import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import ReportPage from "./pages/ReportPage";

/*
  App.js - Professional Network Issue Portal Shell
  - Routes: "/", "/report", "/map", "/faq"
  - Clean page placeholders for team to replace with real components
  - High-end navigation with "network-pulse" logo feel
  - Color scheme: deep navy (#001f3f) and professional blue (#007bff)
  - Global footer: "secure & encrypted reporting"
*/

const styles = `
:root{
  --navy: #001f3f;
  --blue: #007bff;
  --muted: #f6f8fb;
  --glass: rgba(255,255,255,0.04);
}

*{box-sizing:border-box}
html,body,#root{height:100%}
body{
  margin:0;
  font-family:Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial;
  background: linear-gradient(180deg, var(--muted), #ffffff);
  color:#0b1b2b;
  -webkit-font-smoothing:antialiased;
  -moz-osx-font-smoothing:grayscale;
}

/* Layout */
.app {
  min-height:100vh;
  display:flex;
  flex-direction:column;
}

.container {
  width:100%;
  max-width:1100px;
  margin: 28px auto;
  padding: 0 20px;
  flex:1;
}

/* Nav */
.navbar {
  background: linear-gradient(90deg, rgba(0,31,63,1), rgba(0,123,255,0.06));
  color: white;
  padding: 10px 20px;
  display:flex;
  align-items:center;
  justify-content:space-between;
  gap:20px;
  box-shadow: 0 6px 18px rgba(0,31,63,0.18);
  position:sticky;
  top:0;
  z-index:50;
}

.brand {
  display:flex;
  align-items:center;
  gap:12px;
  text-decoration:none;
  color:inherit;
}

.logo {
  display:inline-grid;
  place-items:center;
  width:48px;
  height:48px;
  position:relative;
  margin-right:6px;
}

.pulse-ring, .pulse-core {
  position:absolute;
  border-radius:50%;
  left:50%; top:50%;
  transform:translate(-50%,-50%);
}

.pulse-core{
  width:16px; height:16px;
  background:var(--blue);
  box-shadow:0 0 12px rgba(0,123,255,0.6), inset 0 0 6px rgba(255,255,255,0.12);
}

.pulse-ring{
  width:36px; height:36px;
  border:2px solid rgba(0,123,255,0.22);
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% { transform: translate(-50%,-50%) scale(0.9); opacity:0.9; }
  70% { transform: translate(-50%,-50%) scale(1.55); opacity:0; }
  100% { opacity:0; }
}

.brand-title {
  display:flex;
  flex-direction:column;
  line-height:1;
}

.brand-title .title {
  font-weight:700;
  font-size:16px;
  letter-spacing:0.2px;
}

.brand-title .subtitle {
  font-size:11px;
  opacity:0.85;
}

/* Nav Links */
.navlinks {
  display:flex;
  gap:12px;
  align-items:center;
}

.navlinks a {
  color:rgba(255,255,255,0.92);
  text-decoration:none;
  padding:8px 12px;
  border-radius:8px;
  font-weight:600;
  font-size:14px;
  transition: all .16s ease;
}

.navlinks a:hover { background: rgba(255,255,255,0.04); transform:translateY(-2px) }

.navlinks a.active {
  background: rgba(255,255,255,0.08);
  box-shadow: 0 6px 18px rgba(0,123,255,0.14);
  color:var(--blue);
  border:1px solid rgba(255,255,255,0.06);
}

/* Card style for page shells */
.card {
  background: #fff;
  border-radius:12px;
  padding:20px;
  box-shadow: 0 8px 30px rgba(8,20,40,0.06);
  border:1px solid rgba(3,10,22,0.04);
}

/* Footer */
.footer {
  background: linear-gradient(90deg, rgba(0,31,63,1), rgba(0,31,63,0.92));
  color: #ffffff;
  padding:12px 20px;
  text-align:center;
  font-size:13px;
  font-weight:600;
  letter-spacing:0.2px;
}

/* Responsive */
@media (max-width:720px){
  .navlinks { display:flex; gap:6px; flex-wrap:wrap }
  .brand-title .subtitle { display:none }
  .container { margin:16px auto }
}
`;

/* Placeholder pages - Teams should replace contents with their components */
function HomePage() {
  return (
    <section className="card" aria-label="Home">
      <h1 style={{marginTop:0}}>Network Overview</h1>
      <p style={{color:"#1f2d3a", marginBottom:12}}>Summary and quick status panels go here. Replace with the dashboard component.</p>
      <div style={{height:220, borderRadius:8, background:"linear-gradient(90deg,#f8fafc,#fff)", display:"flex", alignItems:"center", justifyContent:"center", color:"#31445a"}}>
        Dashboard placeholder — plug your dashboard widgets here.
      </div>
    </section>
  );
}

function MapPage() {
  return (
    <section className="card" aria-label="Network Map">
      <h1 style={{marginTop:0}}>Network Map</h1>
      <p style={{color:"#1f2d3a", marginBottom:12}}>Interactive map / topology component goes here.</p>
      <div style={{height:420, borderRadius:8, background:"#eef6ff", display:"flex", alignItems:"center", justifyContent:"center", color:"#234564"}}>
        Map placeholder — integrate your mapping / topology view here.
      </div>
    </section>
  );
}

function FAQPage() {
  return (
    <section className="card" aria-label="FAQ">
      <h1 style={{marginTop:0}}>FAQ & Help</h1>
      <p style={{color:"#1f2d3a", marginBottom:12}}>Replace with searchable FAQ and troubleshooting steps.</p>
      <div style={{display:"grid", gap:8}}>
        <div style={{padding:12, borderRadius:8, background:"#fcfdff", border:"1px solid rgba(3,10,22,0.03)"}}>
          FAQ placeholder item
        </div>
        <div style={{padding:12, borderRadius:8, background:"#fcfdff", border:"1px solid rgba(3,10,22,0.03)"}}>
          FAQ placeholder item
        </div>
      </div>
    </section>
  );
}

/* App component with Router and global layout */
export default function App() {
  return (
    <div className="app">
      <style>{styles}</style>
      <Router>
        <header className="navbar" role="banner">
          <Link to="/" className="brand" aria-label="Network Pulse Home" style={{textDecoration:"none"}}>
            <div className="logo" aria-hidden="true">
              <span className="pulse-ring" />
              <span className="pulse-core" />
            </div>
            <div className="brand-title">
              <span className="title">Network Pulse</span>
              <span className="subtitle">incident & reporting portal</span>
            </div>
          </Link>

          <nav className="navlinks" role="navigation" aria-label="Main navigation">
            <Link to="/" className={({isActive}) => isActive ? "active" : ""}>Home</Link>
            <Link to="/report" className={({isActive}) => isActive ? "active" : ""}>Report</Link>
            <Link to="/map" className={({isActive}) => isActive ? "active" : ""}>Map</Link>
            <Link to="/faq" className={({isActive}) => isActive ? "active" : ""}>FAQ</Link>
          </nav>
        </header>

        <main className="container" role="main">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/report" element={<ReportPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/faq" element={<FAQPage />} />
          </Routes>
        </main>

        <footer className="footer" role="contentinfo">
          secure & encrypted reporting
        </footer>
      </Router>
    </div>
  );
}
