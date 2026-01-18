import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Menu.css'

// Icons as SVG components for better performance
const Icons = {
  Dashboard: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  ),
  ProfessionalShield: () => (
    <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 22C12 22 20 18 20 12V5L12 2L4 5V12C4 18 12 22 12 22Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 11V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 7H12.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="0.5" strokeOpacity="0.3" />
    </svg>
  ),
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9,22 9,12 15,12 15,22" />
    </svg>
  ),
  Users: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Key: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 1 1-7.778 7.778 5.5 5.5 0 0 1 7.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" />
    </svg>
  ),
  Server: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  ),
  Globe: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  Activity: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
    </svg>
  ),
  Graph: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Logout: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16,17 21,12 16,7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  ),
  Menu: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  ),
  Close: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  ),
  Help: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  ),
  Settings: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  ),
  Plus: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  )
}

const Menu = () => {
  const { user, permissions: userPermissions, logout, isAdmin } = useAuth()
  const location = useLocation()
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [isMobileOpen, setIsMobileOpen] = useState(false)

  if (!user) return null;

  // Mappage des permissions par défaut (identique à ProtectedRoute)
  const pathToPermission = {
    '/dashboard': 'READ_DASHBOARD',
    '/users': 'READ_USERS',
    '/roles': 'READ_ROLES',
    '/permissions': 'READ_PERMISSIONS',
    '/resources': 'READ_RESOURCES',
    '/ips': 'READ_IPS',
    '/access-attempts': 'READ_ACCESS_ATTEMPTS',
    '/graph': 'READ_GRAPH',
    '/profile': 'READ_PROFILE',
  };

  const hasItemPermission = (path) => {
    if (isAdmin) return true;
    const required = pathToPermission[path];
    if (!required) return true;

    return (userPermissions || []).includes(required);
  };

  const menuItems = [
    { path: '/', label: 'Accueil Publique', icon: 'Home' },
    { path: '/dashboard', label: 'Dashboard', icon: 'Dashboard' },
    { path: '/profile', label: 'Mon Profil', icon: 'User' },
  ].filter(item => hasItemPermission(item.path));

  const adminItems = [
    { path: '/users', label: 'Utilisateurs', icon: 'Users' },
    { path: '/roles', label: 'Rôles', icon: 'Shield' },
    { path: '/permissions', label: 'Permissions', icon: 'Key' },
    { path: '/resources', label: 'Ressources', icon: 'Server' },
    { path: '/ips', label: 'Adresses IP', icon: 'Globe' },
    { path: '/access-attempts', label: 'Tentatives', icon: 'Activity' },
  ].filter(item => hasItemPermission(item.path));

  const bottomItems = [
    { path: '/graph', label: 'Visualisation', icon: 'Graph' },
  ].filter(item => hasItemPermission(item.path));

  const isActive = (path) => location.pathname === path

  const NavLink = ({ item }) => {
    const IconComponent = Icons[item.icon]
    return (
      <Link
        to={item.path}
        className={`menu-link ${isActive(item.path) ? 'active' : ''}`}
        onClick={() => setIsMobileOpen(false)}
      >
        <span className="menu-icon">
          <IconComponent />
        </span>
        <span className="menu-label">{item.label}</span>
        {isActive(item.path) && <span className="active-indicator" />}
      </Link>
    )
  }

  return (
    <>
      {/* Mobile Toggle Button */}
      <button
        className="mobile-menu-toggle"
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        aria-label="Toggle menu"
      >
        {isMobileOpen ? <Icons.Close /> : <Icons.Menu />}
      </button>

      {/* Overlay for mobile */}
      {isMobileOpen && (
        <div
          className="menu-overlay"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      <nav className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${isMobileOpen ? 'mobile-open' : ''}`}>
        {/* Logo Section */}
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon professional">
              <Icons.ProfessionalShield />
            </div>
            <div className="logo-text">
              <span className="logo-title">ACCESS</span>
              <span className="logo-subtitle">GUARD</span>
            </div>
          </div>
          <button
            className="collapse-btn hide-mobile"
            onClick={() => setIsCollapsed(!isCollapsed)}
            aria-label="Collapse menu"
          >
            <Icons.Menu />
          </button>
        </div>

        {/* New Task Button */}
        <div className="sidebar-action">
          <Link to="/dashboard" className="new-task-btn">
            <span className="btn-icon"><Icons.Plus /></span>
            <span className="btn-text">Nouveau</span>
          </Link>
        </div>

        {/* Main Navigation */}
        <div className="sidebar-nav">
          {menuItems.length > 0 && (
            <div className="nav-section">
              {menuItems.map((item) => (
                <NavLink key={item.path} item={item} />
              ))}
            </div>
          )}

          {adminItems.length > 0 && (
            <div className="nav-section">
              <div className="nav-section-title">
                <span className="section-dot" />
                <span className="section-text">Administration</span>
              </div>
              {adminItems.map((item) => (
                <NavLink key={item.path} item={item} />
              ))}
            </div>
          )}

          {bottomItems.length > 0 && (
            <div className="nav-section">
              <div className="nav-section-title">
                <span className="section-dot" />
                <span className="section-text">Outils</span>
              </div>
              {bottomItems.map((item) => (
                <NavLink key={item.path} item={item} />
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <Link to="/help" className="footer-link">
            <span className="menu-icon"><Icons.Help /></span>
            <span className="menu-label">Aide & Docs</span>
          </Link>

          <div className="user-section">
            <div className="user-avatar">
              {user.username?.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <span className="user-name">{user.username}</span>
              <span className="user-handle">@{user.username?.toLowerCase()}</span>
            </div>
            <button
              onClick={logout}
              className="logout-btn"
              aria-label="Déconnexion"
            >
              <Icons.Logout />
            </button>
          </div>
        </div>
      </nav>
    </>
  )
}

export default Menu
