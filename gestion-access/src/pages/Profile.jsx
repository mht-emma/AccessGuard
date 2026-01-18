import React from 'react'
import { useAuth } from '../context/AuthContext'
import './Profile.css'

// Icons
const Icons = {
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Key: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  ),
  Mail: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  ),
  Calendar: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  ),
  Lock: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  ),
  Check: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="20,6 9,17 4,12" />
    </svg>
  ),
  AlertTriangle: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Globe: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Activity: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
    </svg>
  )
}

const Profile = () => {
  const { user } = useAuth()

  // Debug
  console.log('Profile - User Data:', user);

  const securityItems = [
    {
      icon: 'Lock',
      title: 'Authentification',
      status: 'Sécurisée',
      type: 'success'
    },
    {
      icon: 'Shield',
      title: 'Session active',
      status: 'Protégée',
      type: 'success'
    },
    {
      icon: 'Globe',
      title: 'Dernière connexion',
      status: 'Aujourd\'hui',
      type: 'success'
    },
    {
      icon: 'Activity',
      title: 'Activité',
      status: 'Normale',
      type: 'success'
    }
  ]

  const userRoles = Array.isArray(user?.roles) ? user.roles : (user?.role ? [user.role] : []);
  const mainRole = userRoles[0] || 'USER';

  return (
    <div className="profile-container">
      <h1>Mon Profil</h1>

      <div className="profile-card">
        {/* Profile Header */}
        <div className="profile-header">
          <div className="profile-avatar">
            {user?.username?.charAt(0).toUpperCase()}
          </div>
          <div className="profile-header-info">
            <h2 className="profile-name">{user?.username}</h2>
            <p className="profile-handle">@{user?.username?.toLowerCase()}</p>
            <span className="profile-role-badge">
              <Icons.Shield />
              {mainRole}
            </span>
          </div>
        </div>

        {/* Personal Information */}
        <div className="profile-section">
          <h2>
            <Icons.User />
            Informations personnelles
          </h2>
          <div className="profile-info">
            <div className="info-row">
              <span className="info-label">
                <Icons.User />
                Nom d'utilisateur
              </span>
              <span className="info-value">{user?.username || 'N/A'}</span>
            </div>
            <div className="info-row">
              <span className="info-label">
                <Icons.Shield />
                Rôle
              </span>
              <span className="info-value">{mainRole}</span>
            </div>
            {user?.email && (
              <div className="info-row">
                <span className="info-label">
                  <Icons.Mail />
                  Email
                </span>
                <span className="info-value">{user?.email || `${user?.username?.toLowerCase()}@accessguard.com`}</span>
              </div>
            )}
            <div className="info-row">
              <span className="info-label">
                <Icons.Calendar />
                Membre depuis
              </span>
              <span className="info-value">
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })
                  : 'Janvier 2025'}
              </span>
            </div>
          </div>
        </div>

        {/* Permissions */}
        {user?.permissions && user.permissions.length > 0 && (
          <div className="profile-section">
            <h2>
              <Icons.Key />
              Permissions (Directes)
            </h2>
            <div className="permissions-list">
              {user.permissions.map((permission, index) => (
                <span key={index} className="permission-badge">
                  <Icons.Check />
                  {typeof permission === 'string' ? permission : (permission.permission || permission.name)}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Security Status */}
        <div className="profile-section">
          <h2>
            <Icons.Shield />
            Sécurité du compte
          </h2>
          <div className="security-grid">
            {securityItems.map((item, index) => {
              const IconComponent = Icons[item.icon]
              return (
                <div key={index} className="security-item">
                  <div className={`security-icon ${item.type === 'warning' ? 'warning' : ''}`}>
                    <IconComponent />
                  </div>
                  <div className="security-content">
                    <span className="security-title">{item.title}</span>
                    <span className="security-status">{item.status}</span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile
