import { useState } from 'react';
import axios from 'axios';

export default function ReportPage() {
    const [formData, setFormData] = useState({
        networkType: '',
        phoneNumber: '',
        issue: '',
        description: '',
        locationConsent: false,
    });

    const [notification, setNotification] = useState({ show: false, message: '' });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

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
        }
    };

    const styles = {
        container: {
            backgroundColor: '#001f3f',
            color: 'white',
            padding: '40px',
            borderRadius: '12px',
            maxWidth: '600px',
            margin: 'auto',
            boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        },
        header: {
            textAlign: 'center',
            marginBottom: '30px',
            fontSize: '28px',
            fontWeight: '600',
            letterSpacing: '0.5px',
        },
        formGroup: {
            marginBottom: '20px',
            display: 'flex',
            flexDirection: 'column',
        },
        label: {
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '8px',
            color: '#e0e0e0',
            textTransform: 'uppercase',
            letterSpacing: '0.3px',
        },
        input: {
            padding: '12px 14px',
            border: '2px solid #0074D9',
            borderRadius: '6px',
            backgroundColor: '#f5f5f5',
            color: '#001f3f',
            fontSize: '14px',
            fontWeight: '500',
            transition: 'all 0.3s ease',
            outline: 'none',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
        },
        inputFocus: {
            borderColor: '#0055a5',
            boxShadow: '0 0 0 4px rgba(0, 116, 217, 0.1)',
        },
        textarea: {
            padding: '12px 14px',
            border: '2px solid #0074D9',
            borderRadius: '6px',
            backgroundColor: '#f5f5f5',
            color: '#001f3f',
            fontSize: '14px',
            fontWeight: '500',
            fontFamily: 'inherit',
            resize: 'vertical',
            minHeight: '100px',
            transition: 'all 0.3s ease',
            outline: 'none',
            boxShadow: '0 2px 4px rgba(0, 0, 0, 0.05)',
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
            accentColor: '#0074D9',
        },
        checkboxLabel: {
            fontSize: '13px',
            color: '#d0d0d0',
            cursor: 'pointer',
            fontWeight: '400',
        },
        button: {
            backgroundColor: '#0074D9',
            color: 'white',
            padding: '12px 24px',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '600',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            transition: 'all 0.3s ease',
            boxShadow: '0 4px 12px rgba(0, 116, 217, 0.3)',
        },
        buttonHover: {
            backgroundColor: '#0055a5',
            boxShadow: '0 6px 16px rgba(0, 116, 217, 0.4)',
            transform: 'translateY(-2px)',
        },
        notification: {
            backgroundColor: '#004d7a',
            padding: '16px 20px',
            borderRadius: '6px',
            marginTop: '20px',
            borderLeft: '4px solid #0074D9',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)',
        },
        notificationText: {
            fontSize: '14px',
            fontWeight: '500',
            marginBottom: '12px',
            color: '#ffffff',
        },
    };

    return (
        <div style={styles.container}>
            <h1 style={styles.header}>Network Issue Report</h1>
            <form onSubmit={handleSubmit}>
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
                    <label htmlFor="phoneNumber" style={styles.label}>Phone Number</label>
                    <input 
                        type="tel" 
                        id="phoneNumber" 
                        name="phoneNumber" 
                        pattern="6[256789][0-9]{7}" 
                        value={formData.phoneNumber} 
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

                <div style={styles.formGroup}>
                    <div style={styles.checkboxGroup}>
                        <input 
                            type="checkbox" 
                            id="locationConsent" 
                            name="locationConsent" 
                            checked={formData.locationConsent} 
                            onChange={handleChange}
                            style={styles.checkbox}
                        />
                        <label htmlFor="locationConsent" style={styles.checkboxLabel}>
                            I allow NETLINK to collect my location to report network issues
                        </label>
                    </div>
                </div>

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

            {notification.show && (
                <div style={styles.notification}>
                    <p style={styles.notificationText}>{notification.message}</p>
                    <button 
                        style={styles.button}
                        onClick={() => setNotification({ ...notification, show: false })}
                        onMouseEnter={(e) => Object.assign(e.target.style, styles.buttonHover)}
                        onMouseLeave={(e) => Object.assign(e.target.style, { backgroundColor: styles.button.backgroundColor, boxShadow: styles.button.boxShadow, transform: 'none' })}
                    >
                        Ok
                    </button>
                </div>
            )}
        </div>
    );
}