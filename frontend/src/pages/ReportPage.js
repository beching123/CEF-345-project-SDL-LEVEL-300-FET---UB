<<<<<<< HEAD
import { useState, useEffect } from 'react';
import apiClient from '../api/axios';
=======
import { useState } from 'react';
import axios from 'axios';
>>>>>>> b6845d04487e18850dc753ebe89579106f841b22

export default function ReportPage() {
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [formData, setFormData] = useState({
        networkType: '',
        phone: '',
        issue: '',
        description: '',
        locationAllowed: false,
        issueScale: 'Street', // NEW: Issue scale (Street, Neighborhood, City)
        // Offline location fields
        manual_lat: '',
        manual_long: '',
        address_landmark: '',
        // Device info (auto-filled where possible)
        deviceModel: 'Web Browser',
        osType: 'Web',
        osVersion: typeof navigator !== 'undefined' ? navigator.userAgentData?.platform || 'Unknown' : 'Unknown',
        appVersion: '1.0',
        // Network details
        signalStrength: 0,
        connectionType: 'Web',
        issueSeverity: 'Warning',
        bandwidthMbps: 0,
        latencyMs: 0,
    });

<<<<<<< HEAD
    const [notification, setNotification] = useState({ show: false, message: '', type: 'success' });
    const [loading, setLoading] = useState(false);
    const [connectionError, setConnectionError] = useState(null);

    // Monitor online/offline status and get geolocation
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setConnectionError(null);
            console.log('✅ Connection restored');
            syncOfflineQueue();
            // Get user location when coming online
            if (navigator.geolocation) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        setFormData(prev => ({
                            ...prev,
                            manual_lat: position.coords.latitude.toString(),
                            manual_long: position.coords.longitude.toString()
                        }));
                        console.log('📍 Location obtained:', position.coords.latitude, position.coords.longitude);
                    },
                    (error) => console.warn('⚠️ Geolocation error:', error.message)
                );
            }
        };

        const handleOffline = () => {
            setIsOnline(false);
            console.log('🔴 Connection lost - offline mode activated');
        };

        const handleConnectionError = (event) => {
            const { message, httpStatus } = event.detail;
            setConnectionError(`${message} (${httpStatus})`);
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        window.addEventListener('connectionError', handleConnectionError);

        // Get initial location if online
        if (navigator.onLine && navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        manual_lat: position.coords.latitude.toString(),
                        manual_long: position.coords.longitude.toString()
                    }));
                    console.log('📍 Initial location obtained:', position.coords.latitude, position.coords.longitude);
                },
                (error) => console.warn('⚠️ Initial geolocation error:', error.message)
            );
        }

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
            window.removeEventListener('connectionError', handleConnectionError);
        };
    }, []);
=======
    const [notification, setNotification] = useState({ show: false, message: '' });
    const [loading, setLoading] = useState(false);
>>>>>>> b6845d04487e18850dc753ebe89579106f841b22

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

<<<<<<< HEAD
    const handleManualLocationFetch = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setFormData(prev => ({
                        ...prev,
                        manual_lat: position.coords.latitude.toString(),
                        manual_long: position.coords.longitude.toString()
                    }));
                    setNotification({
                        show: true,
                        message: `✅ Location captured: ${position.coords.latitude.toFixed(4)}, ${position.coords.longitude.toFixed(4)}`,
                        type: 'success'
                    });
                    console.log('📍 Location manually obtained:', position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.error('Geolocation error:', error);
                    setNotification({
                        show: true,
                        message: `❌ Location access denied or unavailable: ${error.message}`,
                        type: 'error'
                    });
                }
            );
        } else {
            setNotification({
                show: true,
                message: '❌ Geolocation not supported by your browser',
                type: 'error'
            });
        }
    };

    // LOCAL STORAGE SYNC QUEUE for offline reports
    const addToSyncQueue = (reportData) => {
        const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
        queue.push({
            ...reportData,
            timestamp: new Date().toISOString(),
            id: Date.now()
        });
        localStorage.setItem('syncQueue', JSON.stringify(queue));
        console.log('📦 Report added to sync queue:', queue.length, 'reports pending');
    };

    const syncOfflineQueue = async () => {
        const queue = JSON.parse(localStorage.getItem('syncQueue') || '[]');
        if (queue.length === 0) return;

        console.log('🔄 Syncing', queue.length, 'offline reports...');
        const failedItems = [];

        for (const item of queue) {
            try {
                const { id, timestamp, ...reportData } = item;
                await apiClient.post('/api/reports', reportData);
                console.log('✅ Synced report:', id);
            } catch (err) {
                console.error('❌ Failed to sync report:', err);
                failedItems.push(item);
            }
        }

        // Update queue with only failed items
        localStorage.setItem('syncQueue', JSON.stringify(failedItems));
        
        if (failedItems.length === 0) {
            setNotification({
                show: true,
                message: `✅ Successfully synced ${queue.length} offline reports!`,
                type: 'success'
            });
        } else {
            setNotification({
                show: true,
                message: `⚠️ Synced ${queue.length - failedItems.length}/${queue.length} reports. ${failedItems.length} will retry when online.`,
                type: 'warning'
            });
        }

        setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        // Create submit data with proper field names for backend
        let submitData = { 
            ...formData,
            latitude: formData.manual_lat ? parseFloat(formData.manual_lat) : null,
            longitude: formData.manual_long ? parseFloat(formData.manual_long) : null,
            addressLandmark: formData.address_landmark || 'Unknown Location'
        };

        // Remove the old field names since backend expects latitude/longitude
        delete submitData.manual_lat;
        delete submitData.manual_long;
        delete submitData.address_landmark;

        try {
            if (isOnline) {
                // Submit directly if online
                const response = await apiClient.post('/api/reports', submitData);
                setNotification({
                    show: true,
                    message: '✅ Report submitted successfully!',
                    type: 'success'
                });
                console.log('Report ID:', response.data.reportId);
                // Reset form
                setFormData(prev => ({
                    ...prev,
                    networkType: '',
                    phone: '',
                    issue: '',
                    description: '',
                    manual_lat: '',
                    manual_long: '',
                    address_landmark: ''
                }));
            } else {
                // Add to queue if offline
                addToSyncQueue(submitData);
                setNotification({
                    show: true,
                    message: '📡 You are offline! Report saved locally. It will be sent when your connection is restored.',
                    type: 'warning'
                });
            }
        } catch (err) {
            if (!isOnline) {
                // Still save to queue on error if offline
                addToSyncQueue(submitData);
                setNotification({
                    show: true,
                    message: '📡 Saved to queue (offline). Will retry when online.',
                    type: 'warning'
                });
            } else {
                setNotification({
                    show: true,
                    message: `❌ Submission failed: ${err.message || 'Unknown error'}`,
                    type: 'error'
                });
            }
        } finally {
            setLoading(false);
            setTimeout(() => setNotification({ show: false, message: '', type: 'success' }), 5000);
=======
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!formData.networkType || !formData.phoneNumber || !formData.issue || !formData.description) {
            setNotification({ show: true, message: 'Please fill in all required fields.' });
            return;
        }

        setLoading(true);
        try {
            const response = await axios.post('http://localhost:3000/api/reports', {
                networkType: formData.networkType,
                phoneNumber: formData.phoneNumber,
                issue: formData.issue,
                description: formData.description,
                locationConsent: formData.locationConsent,
            });

            setNotification({ show: true, message: 'Report submitted successfully!' });
            setFormData({
                networkType: '',
                phoneNumber: '',
                issue: '',
                description: '',
                locationConsent: false,
            });
        } catch (error) {
            setNotification({ 
                show: true, 
                message: error.response?.data?.message || 'Error submitting report. Please try again.' 
            });
        } finally {
            setLoading(false);
>>>>>>> b6845d04487e18850dc753ebe89579106f841b22
        }
    };

    const styles = {
        wrapper: {
            backgroundColor: isOnline ? '#F5F5F5' : '#FFF3CD',
            minHeight: '100vh',
            padding: '20px',
            transition: 'background-color 0.3s ease'
        },
        container: {
            backgroundColor: isOnline ? '#1A237E' : '#FF6B6B',
            color: 'white',
            padding: '40px',
            borderRadius: '12px',
            maxWidth: '700px',
            margin: 'auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            fontFamily: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        statusBadge: {
            display: 'inline-block',
            padding: '6px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: '600',
            marginBottom: '20px',
            backgroundColor: isOnline ? '#00C853' : '#FF3D00',
            color: '#ffffff'
        },
        header: {
            textAlign: 'center',
            marginBottom: '30px',
            fontSize: '28px',
            fontWeight: '700',
            letterSpacing: '0.5px',
        },
        subheader: {
            textAlign: 'center',
            fontSize: '13px',
            color: isOnline ? '#B0BEC5' : '#fff',
            marginBottom: '20px',
            fontStyle: 'italic'
        },
        formGroup: {
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
        },
        label: {
            fontSize: '13px',
            fontWeight: '600',
            marginBottom: '8px',
            color: '#E0E0E0',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
        },
        input: {
            padding: '12px 14px',
            border: '2px solid #FFCC00',
            borderRadius: '6px',
            backgroundColor: '#f5f5f5',
            color: '#1A237E',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            outline: 'none',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        },
        textarea: {
            padding: '12px 14px',
            border: '2px solid #FFCC00',
            borderRadius: '6px',
            backgroundColor: '#f5f5f5',
            color: '#1A237E',
            fontSize: '14px',
            fontWeight: '500',
            fontFamily: 'inherit',
            resize: 'vertical',
            minHeight: '100px',
            transition: 'all 0.3s ease',
            outline: 'none',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        },
        sectionLabel: {
            fontSize: '12px',
            fontWeight: '700',
            color: '#FFCC00',
            marginTop: '20px',
            marginBottom: '10px',
            textTransform: 'uppercase',
            borderBottom: '1px solid rgba(255, 204, 0, 0.3)',
            paddingBottom: '8px'
        },
        offlineSection: {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            padding: '15px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 204, 0, 0.5)'
        },
        locationStatus: {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            padding: '15px',
            borderRadius: '6px',
            marginBottom: '20px',
            border: '1px solid rgba(255, 204, 0, 0.3)',
            fontSize: '13px',
            lineHeight: '1.6'
        },
        checkboxGroup: {
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
        },
        checkbox: {
            width: '18px',
            height: '18px',
            cursor: 'pointer',
            accentColor: '#FFCC00',
        },
        checkboxLabel: {
            fontSize: '13px',
            color: '#E0E0E0',
            cursor: 'pointer',
            fontWeight: '400',
        },
        button: {
            backgroundColor: '#FFCC00',
            color: '#1A237E',
            padding: '14px 24px',
            border: 'none',
            borderRadius: '6px',
            cursor: loading ? 'not-allowed' : 'pointer',
            fontSize: '14px',
            fontWeight: '700',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(255, 204, 0, 0.3)',
            opacity: loading ? 0.7 : 1
        },
        buttonHover: {
            backgroundColor: '#FFD54F',
            boxShadow: '0 6px 16px rgba(255, 204, 0, 0.5)',
            transform: 'translateY(-2px)',
        },
        notification: {
            backgroundColor: '#ffffff',
            color: '#1A237E',
            padding: '16px 20px',
            borderRadius: '6px',
            marginTop: '20px',
            borderLeft: '4px solid',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
            fontSize: '14px',
            fontWeight: '500'
        },
        notificationSuccess: {
            borderLeftColor: '#00C853',
            backgroundColor: '#E8F5E9'
        },
        notificationWarning: {
            borderLeftColor: '#FFCC00',
            backgroundColor: '#FFF9C4'
        },
        notificationError: {
            borderLeftColor: '#FF3D00',
            backgroundColor: '#FFEBEE'
        },
        connectionError: {
            backgroundColor: '#FF5252',
            color: '#ffffff',
            padding: '12px 16px',
            borderRadius: '6px',
            marginBottom: '20px',
            fontSize: '13px',
            fontWeight: '600'
        },
        gridRow: {
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '15px'
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.statusBadge}>
                    {isOnline ? '🟢 Online' : '🔴 Offline Mode'}
                </div>
                
                <h1 style={styles.header}>Report Network Issue</h1>
                <p style={styles.subheader}>Help us improve service by reporting connection problems</p>

                {connectionError && (
                    <div style={styles.connectionError}>
                        ⚠️ {connectionError}
                    </div>
                )}

<<<<<<< HEAD
                <form onSubmit={handleSubmit}>
                    {/* Basic Info Section */}
                    <div style={styles.sectionLabel}>📋 Basic Information</div>

                    <div style={styles.formGroup}>
                        <label htmlFor="networkType" style={styles.label}>Network Type</label>
                        <select 
                            id="networkType" 
                            name="networkType" 
                            value={formData.networkType} 
                            onChange={handleChange}
                            style={styles.input}
                            required
                        >
                            <option value="">Select a network</option>
                            <option value="MTN">MTN</option>
                            <option value="ORANGE">ORANGE</option>
                            <option value="CAMTEL">CAMTEL</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="phone" style={styles.label}>Phone Number</label>
                        <input 
                            type="tel" 
                            id="phone" 
                            name="phone" 
                            pattern="6[256789][0-9]{7}" 
                            value={formData.phone} 
                            onChange={handleChange} 
                            placeholder="653435467"
                            style={styles.input}
                            required 
                        />
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="issue" style={styles.label}>Main Issue</label>
                        <select 
                            id="issue" 
                            name="issue" 
                            value={formData.issue} 
                            onChange={handleChange}
                            style={styles.input}
                            required
                        >
                            <option value="">Select an issue</option>
                            <option value="slow-speed">Slow Internet Speed</option>
                            <option value="no-connection">No Internet Connection</option>
                            <option value="call-drops">Call Drops</option>
                            <option value="data-issues">Data Bundle Issues</option>
                            <option value="poor-coverage">Poor Network Coverage</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="issueScale" style={styles.label}>Issue Scale (Map Radius)</label>
                        <select 
                            id="issueScale" 
                            name="issueScale" 
                            value={formData.issueScale} 
                            onChange={handleChange}
                            style={styles.input}
                        >
                            <option value="Street">Street Level (50m)</option>
                            <option value="Neighborhood">Neighborhood (250m)</option>
                            <option value="City">City District (500m)</option>
                            <option value="Citywide">City-wide (1000m)</option>
                        </select>
                    </div>

                    <div style={styles.formGroup}>
                        <label htmlFor="description" style={styles.label}>Problem Description</label>
                        <textarea 
                            id="description" 
                            name="description" 
                            value={formData.description} 
                            onChange={handleChange} 
                            maxLength="300"
                            placeholder="Describe your issue in detail..."
                            style={styles.textarea}
                        />
                    </div>

                    {/* Location Section */}
                    <div style={styles.sectionLabel}>📍 Location Information</div>

                    <div style={styles.formGroup}>
                        <div style={styles.checkboxGroup}>
                            <input 
                                type="checkbox" 
                                id="locationAllowed" 
                                name="locationAllowed" 
                                checked={formData.locationAllowed} 
                                onChange={handleChange}
                                style={styles.checkbox}
                            />
                            <label htmlFor="locationAllowed" style={styles.checkboxLabel}>
                                I allow NETLINK to collect my location
                            </label>
                        </div>
                    </div>

                    {formData.locationAllowed && (
                        <div style={styles.locationStatus}>
                            {formData.manual_lat && formData.manual_long ? (
                                <div style={{color: '#00C853', marginBottom: '15px'}}>
                                    ✅ <strong>Location Captured:</strong><br/>
                                    Latitude: {parseFloat(formData.manual_lat).toFixed(4)}<br/>
                                    Longitude: {parseFloat(formData.manual_long).toFixed(4)}
                                </div>
                            ) : (
                                <div style={{color: '#FFCC00', marginBottom: '15px'}}>
                                    ⚠️ <strong>Location Not Captured Yet</strong><br/>
                                    Click "Get My Location" to capture coordinates
                                </div>
                            )}
                            <button 
                                type="button"
                                onClick={handleManualLocationFetch}
                                style={{...styles.button, backgroundColor: '#FFA500', marginBottom: '15px'}}
                                onMouseEnter={(e) => Object.assign(e.target.style, {backgroundColor: '#FF8800', boxShadow: '0 4px 12px rgba(255, 165, 0, 0.4)'})}
                                onMouseLeave={(e) => Object.assign(e.target.style, {backgroundColor: '#FFA500', boxShadow: '0 2px 8px rgba(0, 0, 0, 0.2)'})}
                            >
                                📍 Get My Location
                            </button>
                        </div>
                    )}

                    {/* Offline Location Section (shown when offline and location allowed) */}
                    {!isOnline && formData.locationAllowed && (
                        <div style={styles.offlineSection}>
                            <div style={{color: '#FFCC00', marginBottom: '10px', fontWeight: '600'}}>
                                📡 You are offline - Manual location entry available:
                            </div>
                            <div style={styles.gridRow}>
                                <div style={styles.formGroup}>
                                    <label htmlFor="manual_lat" style={styles.label}>Latitude</label>
                                    <input 
                                        type="number" 
                                        id="manual_lat" 
                                        name="manual_lat" 
                                        value={formData.manual_lat} 
                                        onChange={handleChange}
                                        placeholder="3.8667"
                                        step="0.0001"
                                        style={styles.input}
                                    />
                                </div>
                                <div style={styles.formGroup}>
                                    <label htmlFor="manual_long" style={styles.label}>Longitude</label>
                                    <input 
                                        type="number" 
                                        id="manual_long" 
                                        name="manual_long" 
                                        value={formData.manual_long} 
                                        onChange={handleChange}
                                        placeholder="11.5167"
                                        step="0.0001"
                                        style={styles.input}
                                    />
                                </div>
                            </div>
                            <div style={styles.formGroup}>
                                <label htmlFor="address_landmark" style={styles.label}>Landmark / Address</label>
                                <textarea 
                                    id="address_landmark" 
                                    name="address_landmark" 
                                    value={formData.address_landmark} 
                                    onChange={handleChange}
                                    placeholder="e.g., Near Carrefour Yaounde, Akwa..."
                                    style={{...styles.textarea, minHeight: '80px'}}
                                />
                            </div>
                        </div>
                    )}

                    {/* Online Location Section - READ-ONLY display */}
                    {isOnline && formData.locationAllowed && (
                        <div style={styles.offlineSection}>
                            <div style={{color: '#00C853', marginBottom: '10px', fontWeight: '600'}}>
                                ✅ Auto-Captured Location (Read-Only):
                            </div>
                            <div style={{backgroundColor: 'rgba(0, 200, 83, 0.1)', padding: '10px', borderRadius: '4px', border: '1px solid #00C853'}}>
                                {formData.manual_lat && formData.manual_long ? (
                                    <>
                                        <div style={{fontSize: '13px', marginBottom: '5px'}}>
                                            <strong>Latitude:</strong> {parseFloat(formData.manual_lat).toFixed(6)}
                                        </div>
                                        <div style={{fontSize: '13px', marginBottom: '5px'}}>
                                            <strong>Longitude:</strong> {parseFloat(formData.manual_long).toFixed(6)}
                                        </div>
                                        {formData.address_landmark && (
                                            <div style={{fontSize: '13px'}}>
                                                <strong>Area:</strong> {formData.address_landmark}
                                            </div>
                                        )}
                                    </>
                                ) : (
                                    <div style={{fontSize: '13px', color: '#FFA500'}}>
                                        📍 Click "Get My Location" to auto-capture your coordinates
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
=======
                <button 
                    type="submit" 
                    style={styles.button}
                    disabled={loading}
                    onMouseEnter={(e) => Object.assign(e.target.style, styles.buttonHover)}
                    onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: styles.button.backgroundColor, boxShadow: styles.button.boxShadow, transform: 'none' })}
                >
                    {loading ? 'Submitting...' : 'Submit Report'}
                </button>
            </form>
>>>>>>> b6845d04487e18850dc753ebe89579106f841b22

                    <button 
                        type="submit" 
                        disabled={loading}
                        style={styles.button}
                        onMouseEnter={(e) => !loading && Object.assign(e.target.style, styles.buttonHover)}
                        onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: styles.button.backgroundColor, boxShadow: styles.button.boxShadow, transform: 'none' })}
                    >
                        {loading ? '⏳ Submitting...' : isOnline ? '✉️ Submit Report' : '📦 Save Report (Offline)'}
                    </button>
                </form>

                {notification.show && (
                    <div style={{
                        ...styles.notification,
                        ...(notification.type === 'success' ? styles.notificationSuccess : notification.type === 'warning' ? styles.notificationWarning : styles.notificationError)
                    }}>
                        {notification.message}
                    </div>
                )}
            </div>
        </div>
    );
}