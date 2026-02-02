import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import apiClient from '../api/axios';
import 'leaflet/dist/leaflet.css';

// Custom hook to center map on load
const MapCenter = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (center) {
      map.setView(center, zoom);
    }
  }, [center, zoom, map]);
  return null;
};

// Get network provider color
const getNetworkColor = (networkType) => {
  switch (networkType?.toUpperCase()) {
    case 'MTN':
      return '#FFCC00'; // Yellow
    case 'ORANGE':
      return '#FFA500'; // Orange
    case 'CAMTEL':
      return '#0066CC'; // Blue
    default:
      return '#999999'; // Gray
  }
};

// Get issue magnitude color
const getMagnitudeColor = (magnitude) => {
  if (!magnitude) return '#FFA500';
  if (magnitude >= 8) return '#FF0000'; // Critical - Red
  if (magnitude >= 5) return '#FFA500'; // Warning - Orange
  return '#00FF00'; // Healthy - Green
};

// Create custom marker icon with network color and magnitude
const createCustomMarker = (networkType, magnitude) => {
  const networkColor = getNetworkColor(networkType);
  const magnitudeColor = getMagnitudeColor(magnitude);

  // SVG icon with concentric circles
  const svgIcon = `<svg width="50" height="50" viewBox="0 0 50 50" xmlns="http://www.w3.org/2000/svg"><circle cx="25" cy="25" r="22" fill="${networkColor}" opacity="0.3" stroke="${networkColor}" stroke-width="2"/><circle cx="25" cy="25" r="12" fill="${magnitudeColor}" opacity="0.9" stroke="${magnitudeColor}" stroke-width="1.5"/><circle cx="25" cy="25" r="2" fill="white"/></svg>`;

  const encodedSvg = encodeURIComponent(svgIcon);
  
  return L.icon({
    iconUrl: `data:image/svg+xml,${encodedSvg}`,
    iconSize: [50, 50],
    iconAnchor: [25, 25],
    popupAnchor: [0, -15]
  });
};

// Memoized map component
const MapComponent = React.memo(function MapComponent() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [center, setCenter] = useState([3.8667, 11.5167]); // Default: Cameroon center (Yaoundé)
  const [zoom, setZoom] = useState(10);

  useEffect(() => {
    fetchMapLocations();
    // Refresh map every 10 seconds
    const interval = setInterval(fetchMapLocations, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMapLocations = async () => {
    try {
      const response = await apiClient.get('/api/map/locations');
      setLocations(response.data);
      setError(null);

      // Calculate center point (average of all coordinates)
      if (response.data.length > 0) {
        const avgLat = response.data.reduce((sum, loc) => sum + parseFloat(loc.latitude), 0) / response.data.length;
        const avgLng = response.data.reduce((sum, loc) => sum + parseFloat(loc.longitude), 0) / response.data.length;
        setCenter([avgLat, avgLng]);

        // Adjust zoom based on spread of locations
        if (response.data.length === 1) {
          setZoom(15);
        } else {
          setZoom(12);
        }
      }
    } catch (err) {
      console.error('Failed to fetch map locations:', err);
      setError('Failed to load map data');
    } finally {
      setLoading(false);
    }
  };

  // Helper: Get network provider color
  // (declared at module level, not needed here)

  // Helper: Get issue magnitude color (inner circle)
  // (declared at module level, not needed here)

  // Helper: Calculate radius for circle (not used in Leaflet version but keeping for reference)

  const styles = {
    wrapper: {
      padding: '20px',
      backgroundColor: '#F5F5F5',
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    },
    title: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1A237E',
      marginBottom: '20px',
      textAlign: 'center'
    },
    mapContainer: {
      flex: 1,
      height: '600px',
      marginBottom: '20px',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
      border: '2px solid #1A237E'
    },
    infoBox: {
      display: 'flex',
      gap: '20px',
      marginBottom: '20px',
      flexWrap: 'wrap'
    },
    infoCard: {
      backgroundColor: '#ffffff',
      padding: '15px',
      borderRadius: '6px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      flex: '1',
      minWidth: '200px',
      textAlign: 'center'
    },
    infoLabel: {
      fontSize: '12px',
      color: '#999',
      fontWeight: '600',
      textTransform: 'uppercase'
    },
    infoValue: {
      fontSize: '24px',
      fontWeight: '700',
      color: '#1A237E',
      marginTop: '8px'
    },
    legend: {
      backgroundColor: '#ffffff',
      padding: '20px',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      marginBottom: '20px'
    },
    legendTitle: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#1A237E',
      marginBottom: '12px',
      borderBottom: '2px solid #FFCC00',
      paddingBottom: '8px'
    },
    legendGrid: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '15px'
    },
    legendSection: {
      marginBottom: '15px'
    },
    legendSectionTitle: {
      fontSize: '12px',
      fontWeight: '600',
      color: '#1A237E',
      marginBottom: '8px',
      textTransform: 'uppercase'
    },
    legendItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      fontSize: '13px',
      color: '#333'
    },
    legendColor: {
      width: '16px',
      height: '16px',
      borderRadius: '50%',
      border: '2px solid #1A237E'
    },
    tableContainer: {
      overflow: 'x',
      marginTop: '20px'
    },
    table: {
      width: '100%',
      borderCollapse: 'collapse',
      backgroundColor: '#ffffff',
      borderRadius: '8px',
      overflow: 'hidden',
      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
    },
    tableRow: {
      borderBottom: '1px solid #e0e0e0'
    },
    tableHeader: {
      backgroundColor: '#1A237E',
      color: '#ffffff',
      padding: '12px',
      textAlign: 'left',
      fontWeight: '600',
      fontSize: '13px'
    },
    tableCell: {
      padding: '12px',
      fontSize: '13px',
      color: '#333'
    },
    loading: {
      textAlign: 'center',
      color: '#1A237E',
      fontWeight: '500',
      marginTop: '40px'
    },
    error: {
      textAlign: 'center',
      color: '#FF0000',
      fontWeight: '500',
      marginTop: '40px'
    },
    noData: {
      textAlign: 'center',
      color: '#666',
      fontWeight: '500',
      marginTop: '40px'
    }
  };

  return (
    <div style={styles.wrapper}>
      <h2 style={styles.title}>📍 Real-Time Network Issues Map</h2>

      {loading && <p style={styles.loading}>Loading map data...</p>}
      {error && <p style={styles.error}>{error}</p>}

      {!loading && locations.length === 0 && (
        <p style={styles.noData}>No reports yet. Be the first to report!</p>
      )}

      {!loading && locations.length > 0 && (
        <>
          {/* Info Cards */}
          <div style={styles.infoBox}>
            <div style={styles.infoCard}>
              <div style={styles.infoLabel}>Total Reports</div>
              <div style={styles.infoValue}>{locations.length}</div>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoLabel}>Coverage Area</div>
              <div style={styles.infoValue}>Active</div>
            </div>
            <div style={styles.infoCard}>
              <div style={styles.infoLabel}>Last Updated</div>
              <div style={styles.infoValue}>{new Date().toLocaleTimeString()}</div>
            </div>
          </div>

          {/* Legend */}
          <div style={styles.legend}>
            <div style={styles.legendTitle}>Map Legend</div>
            <div style={styles.legendGrid}>
              <div style={styles.legendSection}>
                <div style={styles.legendSectionTitle}>🔗 Network Provider (Outer Circle)</div>
                <div style={styles.legendItem}>
                  <div style={{...styles.legendColor, backgroundColor: '#FFCC00'}}/>
                  MTN
                </div>
                <div style={styles.legendItem}>
                  <div style={{...styles.legendColor, backgroundColor: '#FFA500'}}/>
                  Orange
                </div>
                <div style={styles.legendItem}>
                  <div style={{...styles.legendColor, backgroundColor: '#0066CC'}}/>
                  Camtel
                </div>
              </div>

              <div style={styles.legendSection}>
                <div style={styles.legendSectionTitle}>⚠️ Issue Severity (Inner Circle)</div>
                <div style={styles.legendItem}>
                  <div style={{...styles.legendColor, backgroundColor: '#FF0000'}}/>
                  Critical (8-10)
                </div>
                <div style={styles.legendItem}>
                  <div style={{...styles.legendColor, backgroundColor: '#FFA500'}}/>
                  Warning (5-7)
                </div>
                <div style={styles.legendItem}>
                  <div style={{...styles.legendColor, backgroundColor: '#00FF00'}}/>
                  Healthy (1-4)
                </div>
              </div>
            </div>
          </div>

          {/* Map */}
          <div style={styles.mapContainer}>
            <MapContainer center={center} zoom={zoom} style={{ width: '100%', height: '100%' }}>
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              />
              <MapCenter center={center} zoom={zoom} />

              {/* Markers */}
              {locations.map((loc) => (
                <Marker
                  key={loc.id}
                  position={[parseFloat(loc.latitude), parseFloat(loc.longitude)]}
                  icon={createCustomMarker(loc.network_type, loc.issue_magnitude)}
                >
                  <Popup>
                    <div style={{ fontSize: '12px', minWidth: '200px' }}>
                      <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '13px' }}>
                        Report #{loc.id}
                      </div>
                      <div style={{ marginBottom: '6px' }}>
                        <strong>Location:</strong> {loc.address_landmark}
                      </div>
                      <div style={{ marginBottom: '6px' }}>
                        <strong>Network:</strong>{' '}
                        <span style={{ color: getNetworkColor(loc.network_type), fontWeight: 'bold' }}>
                          {loc.network_type}
                        </span>
                      </div>
                      <div style={{ marginBottom: '6px' }}>
                        <strong>Severity:</strong>{' '}
                        <span style={{ color: getMagnitudeColor(loc.issue_magnitude), fontWeight: 'bold' }}>
                          {loc.issue_magnitude || 'N/A'} / 10
                        </span>
                      </div>
                      <div style={{ marginBottom: '6px' }}>
                        <strong>Coverage:</strong> {loc.radius_meters}m radius
                      </div>
                      <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
                        📍 {parseFloat(loc.latitude).toFixed(4)}, {parseFloat(loc.longitude).toFixed(4)}
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>

          {/* Data Table */}
          <div style={styles.tableContainer}>
            <table style={styles.table}>
              <thead>
                <tr style={styles.tableRow}>
                  <th style={styles.tableHeader}>ID</th>
                  <th style={styles.tableHeader}>Location</th>
                  <th style={styles.tableHeader}>Severity</th>
                  <th style={styles.tableHeader}>Network</th>
                  <th style={styles.tableHeader}>Coverage</th>
                  <th style={styles.tableHeader}>Coordinates</th>
                </tr>
              </thead>
              <tbody>
                {locations.map(loc => (
                  <tr key={loc.id} style={styles.tableRow}>
                    <td style={styles.tableCell}>{loc.id}</td>
                    <td style={styles.tableCell}>{loc.address_landmark}</td>
                    <td style={{...styles.tableCell, color: getMagnitudeColor(loc.issue_magnitude), fontWeight: 'bold'}}>
                      {loc.issue_magnitude || 'N/A'} / 10
                    </td>
                    <td style={{...styles.tableCell, color: getNetworkColor(loc.network_type), fontWeight: 'bold'}}>
                      {loc.network_type}
                    </td>
                    <td style={styles.tableCell}>{loc.radius_meters}m</td>
                    <td style={styles.tableCell}>
                      {parseFloat(loc.latitude).toFixed(4)}, {parseFloat(loc.longitude).toFixed(4)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
});

export default MapComponent;
