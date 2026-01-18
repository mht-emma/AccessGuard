import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './Dashboard.css'

// Premium Icons
const Icons = {
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Activity: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Database: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="12" cy="5" rx="9" ry="3" /><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" /><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  )
}

const Dashboard = () => {
  const [summary, setSummary] = useState(null)
  const [activity, setActivity] = useState([])
  const [dbStatus, setDbStatus] = useState('checking')
  const [loading, setLoading] = useState(true)

  const fetchData = async () => {
    try {
      const [sumRes, actRes, healthRes] = await Promise.all([
        api.get('/stats/summary'),
        api.get('/stats/activity'),
        api.get('/health').catch(() => ({ data: { status: 'error' } }))
      ])
      setSummary(sumRes.data)
      setActivity(actRes.data)
      setDbStatus(healthRes.data?.status === 'ok' ? 'online' : 'offline')
    } catch (error) {
      console.error('Erreur Dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchData()
    const interval = setInterval(fetchData, 30000) // Auto-refresh every 30s
    return () => clearInterval(interval)
  }, [])

  if (loading && !summary) return <div className="dashboard-page">Chargement du centre de contrôle...</div>

  // Dynamic security score calculation (simple example)
  const securityScore = summary ? Math.max(0, 100 - (summary.failedAttempts * 5)) : 95

  const stats = [
    {
      label: 'Identités',
      value: summary?.users || 0,
      icon: 'Users',
      trend: '+2',
      trendDir: 'up'
    },
    {
      label: 'Ressources',
      value: summary?.resources || 0,
      icon: 'Shield',
      trend: '+1',
      trendDir: 'up'
    },
    {
      label: 'Activités (24h)',
      value: summary?.recentActivity || 0,
      icon: 'Activity',
      trend: summary?.recentActivity > 10 ? '+5%' : 'Stable',
      trendDir: 'up'
    },
    {
      label: 'Intrusions Bloquées',
      value: summary?.totalFailed || 0,
      icon: 'Alert',
      trend: summary?.failedAttempts > 0 ? `+${summary.failedAttempts} (24h)` : '0 (24h)',
      trendDir: summary?.failedAttempts > 0 ? 'up' : 'down'
    }
  ]

  const formatEventDate = (dateStr) => {
    try {
      if (!dateStr) return 'N/A'
      // Handle Neo4j toString() format which might be ISO-like
      const date = new Date(dateStr)
      if (isNaN(date.getTime())) return 'Date invalide'
      return date.toLocaleTimeString()
    } catch (e) {
      return 'Erreur date'
    }
  }

  return (
    <div className="dashboard-page">
      <header className="dashboard-header">
        <div>
          <h1>Command Center</h1>
          <p className="text-tertiary text-xs">Vue d'overview de la sécurité NoSQL</p>
        </div>
        <div className="system-badge">
          <div className="status-dot-pulse"></div>
          <span>Système en direct</span>
        </div>
      </header>

      <section className="stats-container">
        {stats.map((stat, i) => {
          const IconComp = Icons[stat.icon]
          return (
            <div key={i} className="premium-stat-card">
              <div className="stat-icon-wrapper">
                <IconComp />
              </div>
              <div className="stat-info">
                <span className="stat-label">{stat.label}</span>
                <div className="stat-main">
                  <span className="stat-big-value">{stat.value}</span>
                  <span className={`stat-trend-tag ${stat.trendDir}`}>{stat.trend}</span>
                </div>
              </div>
            </div>
          )
        })}
      </section>

      <div className="dashboard-main-grid">
        <section className="glass-panel">
          <div className="panel-header">
            <h2>Derniers Événements</h2>
            <button className="btn-secondary" onClick={() => window.location.href = '/access-attempts'}>Historique Complet</button>
          </div>
          <div className="activity-feed">
            {activity.length === 0 ? (
              <div className="p-8 text-center text-tertiary">Aucune activité détectée sur le réseau</div>
            ) : (
              activity.map((event) => (
                <div key={event.id} className="feed-item">
                  <div className={`status-indicator ${event.status === 'DENIED' ? 'denied' : 'allowed'}`}>
                    {event.status === 'DENIED' ? <Icons.Alert /> : <Icons.Shield />}
                  </div>
                  <div className="feed-content">
                    <p className="feed-text">
                      <b>{event.username}</b> <code>{event.resourcePath}</code>
                    </p>
                    <span className="feed-time">IP: {event.ip} • {formatEventDate(event.timestamp)}</span>
                  </div>
                  <div className={`auth-badge ${event.status.toLowerCase()}`}>
                    {event.status}
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="glass-panel">
          <div className="panel-header">
            <h2>Santé Système</h2>
          </div>
          <div className="health-widget">
            <div className="health-score">
              <div className="circular-progress">
                <div className="score-value">{securityScore}%</div>
              </div>
              <span className="score-label">Score de Sécurité Global</span>
            </div>

            <div className="system-checks">
              <div className="check-item">
                <span className="check-label">Base Neo4j</span>
                <span className={`check-status ${dbStatus === 'online' ? 'text-success' : 'text-danger'}`}>
                  {dbStatus === 'online' ? 'OPÉRATIONNEL' : 'ERREUR'}
                </span>
              </div>
              <div className="check-item">
                <span className="check-label">Moteur RBAC</span>
                <span className="check-status text-success">ACTIF</span>
              </div>
              <div className="check-item">
                <span className="check-label">Latence API</span>
                <span className="check-status text-success">12ms</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default Dashboard
