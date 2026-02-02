import React, { useState, useEffect } from 'react';
import apiClient from '../api/axios';

export default function Dashboard() {
    const [stats, setStats] = useState({ total: 0, mtn: 0, orange: 0, camtel: 0, lastUpdate: null });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchStats();
        // Refresh stats every 5 seconds
        const interval = setInterval(fetchStats, 5000);
        return () => clearInterval(interval);
    }, []);

    const fetchStats = async () => {
        try {
            const [countRes, networkRes] = await Promise.all([
                apiClient.get('/api/reports/count'),
                apiClient.get('/api/reports/count-by-network')
            ]);
            
            setStats({
                total: countRes.data.total,
                mtn: networkRes.data.mtn || 0,
                orange: networkRes.data.orange || 0,
                camtel: networkRes.data.camtel || 0,
                lastUpdate: new Date().toLocaleTimeString()
            });
            setError(null);
        } catch (err) {
            console.error('Failed to fetch stats:', err);
            setError('Unable to load statistics');
        } finally {
            setLoading(false);
        }
    };

    const styles = {
        wrapper: {
            backgroundColor: '#F5F5F5',
            minHeight: '100vh',
            padding: '40px 20px'
        },
        container: {
            maxWidth: '1200px',
            margin: '0 auto'
        },
        header: {
            textAlign: 'center',
            marginBottom: '50px'
        },
        title: {
            fontSize: '42px',
            fontWeight: '700',
            color: '#1A237E',
            marginBottom: '10px',
            letterSpacing: '-0.5px'
        },
        subtitle: {
            fontSize: '16px',
            color: '#666',
            fontWeight: '400'
        },
        cardGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginBottom: '40px'
        },
        card: {
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            border: '1px solid #E0E0E0',
            transition: 'all 0.3s ease',
            cursor: 'pointer',
            textAlign: 'center'
        },
        cardHover: {
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            transform: 'translateY(-4px)',
            borderColor: '#FFCC00'
        },
        cardIcon: {
            fontSize: '48px',
            marginBottom: '15px'
        },
        cardLabel: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#666',
            textTransform: 'uppercase',
            letterSpacing: '0.5px',
            marginBottom: '10px'
        },
        cardValue: {
            fontSize: '48px',
            fontWeight: '700',
            color: '#1A237E',
            marginBottom: '8px'
        },
        cardSubtext: {
            fontSize: '12px',
            color: '#999',
            fontStyle: 'italic'
        },
        statsContainer: {
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            border: '1px solid #E0E0E0',
            marginBottom: '30px'
        },
        statsGrid: {
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '20px',
            marginTop: '20px'
        },
        statItem: {
            padding: '15px',
            backgroundColor: '#F5F5F5',
            borderRadius: '8px',
            borderLeft: '4px solid #FFCC00'
        },
        statLabel: {
            fontSize: '12px',
            fontWeight: '600',
            color: '#666',
            textTransform: 'uppercase',
            marginBottom: '8px'
        },
        statValue: {
            fontSize: '32px',
            fontWeight: '700',
            color: '#1A237E'
        },
        networkHealth: {
            backgroundColor: '#ffffff',
            borderRadius: '12px',
            padding: '30px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
            border: '1px solid #E0E0E0'
        },
        healthBar: {
            width: '100%',
            height: '8px',
            backgroundColor: '#E0E0E0',
            borderRadius: '4px',
            overflow: 'hidden',
            marginTop: '15px'
        },
        healthBarFill: {
            height: '100%',
            backgroundColor: '#00C853',
            width: '85%',
            transition: 'width 0.3s ease'
        },
        networkLabel: {
            fontSize: '14px',
            fontWeight: '600',
            color: '#1A237E',
            marginBottom: '20px'
        },
        loading: {
            textAlign: 'center',
            color: '#1A237E',
            fontSize: '18px',
            fontWeight: '500',
            padding: '40px'
        },
        error: {
            backgroundColor: '#FFEBEE',
            color: '#C62828',
            padding: '15px',
            borderRadius: '8px',
            textAlign: 'center',
            fontWeight: '500'
        }
    };

    return (
        <div style={styles.wrapper}>
            <div style={styles.container}>
                <div style={styles.header}>
                    <h1 style={styles.title}>Network Status Dashboard</h1>
                    <p style={styles.subtitle}>Real-time monitoring and reporting for Cameroon network providers</p>
                </div>

                {loading ? (
                    <div style={styles.loading}>⏳ Loading dashboard...</div>
                ) : error ? (
                    <div style={styles.error}>⚠️ {error}</div>
                ) : (
                    <>
                        {/* Main Stats Cards */}
                        <div style={styles.cardGrid}>
                            <div 
                                style={styles.card}
                                onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
                                onMouseLeave={(e) => Object.assign(e.currentTarget.style, {
                                    boxShadow: styles.card.boxShadow,
                                    transform: 'none',
                                    borderColor: '#E0E0E0'
                                })}
                            >
                                <div style={styles.cardIcon}>📋</div>
                                <div style={styles.cardLabel}>Total Reports</div>
                                <div style={styles.cardValue}>{stats.total}</div>
                                <div style={styles.cardSubtext}>All-time submissions</div>
                            </div>

                            <div 
                                style={styles.card}
                                onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
                                onMouseLeave={(e) => Object.assign(e.currentTarget.style, {
                                    boxShadow: styles.card.boxShadow,
                                    transform: 'none',
                                    borderColor: '#E0E0E0'
                                })}
                            >
                                <div style={styles.cardIcon}>🔴</div>
                                <div style={styles.cardLabel}>Critical Issues</div>
                                <div style={styles.cardValue}>7</div>
                                <div style={styles.cardSubtext}>Requiring attention</div>
                            </div>

                            <div 
                                style={styles.card}
                                onMouseEnter={(e) => Object.assign(e.currentTarget.style, styles.cardHover)}
                                onMouseLeave={(e) => Object.assign(e.currentTarget.style, {
                                    boxShadow: styles.card.boxShadow,
                                    transform: 'none',
                                    borderColor: '#E0E0E0'
                                })}
                            >
                                <div style={styles.cardIcon}>📍</div>
                                <div style={styles.cardLabel}>Areas Monitored</div>
                                <div style={styles.cardValue}>12</div>
                                <div style={styles.cardSubtext}>Geographic zones</div>
                            </div>
                        </div>

                        {/* Detailed Stats */}
                        <div style={styles.statsContainer}>
                            <h2 style={styles.networkLabel}>📊 Detailed Network Statistics</h2>
                            <div style={styles.statsGrid}>
                                <div style={styles.statItem}>
                                    <div style={styles.statLabel}>🟡 MTN Reports</div>
                                    <div style={{...styles.statValue, color: '#FFCC00'}}>{stats.mtn}</div>
                                </div>
                                <div style={styles.statItem}>
                                    <div style={styles.statLabel}>🟠 ORANGE Reports</div>
                                    <div style={{...styles.statValue, color: '#FFA500'}}>{stats.orange}</div>
                                </div>
                                <div style={styles.statItem}>
                                    <div style={styles.statLabel}>🔵 CAMTEL Reports</div>
                                    <div style={{...styles.statValue, color: '#0066CC'}}>{stats.camtel}</div>
                                </div>
                                <div style={styles.statItem}>
                                    <div style={styles.statLabel}>Last Updated</div>
                                    <div style={{...styles.statValue, fontSize: '16px'}}>
                                        {stats.lastUpdate}
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Network Health */}
                        <div style={styles.networkHealth}>
                            <h2 style={styles.networkLabel}>🟢 Overall Network Health</h2>
                            <div>
                                <p style={{color: '#666', marginBottom: '10px'}}>
                                    The network shows stable performance with 85% uptime across all monitored zones.
                                </p>
                                <div style={styles.healthBar}>
                                    <div style={styles.healthBarFill} />
                                </div>
                                <p style={{color: '#00C853', fontWeight: '600', marginTop: '10px'}}>85% - Excellent</p>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
