import React from 'react'
import { useLocation, Link } from 'react-router-dom'
import StatusBadge from '../components/StatusBadge'
import './Forbidden.css'

// Icons
const Icons = {
  ShieldOff: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M19.69 14a6.9 6.9 0 0 0 .31-2V5l-8-3-3.16 1.18"/>
      <path d="M4.73 4.73L4 5v7c0 6 8 10 8 10a20.29 20.29 0 0 0 5.62-4.38"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  ),
  ArrowLeft: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <line x1="19" y1="12" x2="5" y2="12"/>
      <polyline points="12,19 5,12 12,5"/>
    </svg>
  ),
  Home: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9,22 9,12 15,12 15,22"/>
    </svg>
  )
}

const Forbidden = () => {
  const location = useLocation()
  const reason = location.state?.reason || 'Accès refusé'

  return (
    <div className="forbidden-container">
      <div className="forbidden-content">
        <div className="forbidden-icon">
          <Icons.ShieldOff />
        </div>
        
        <h1>Accès Refusé</h1>
        
        <StatusBadge status="REFUSED" />
        
        <p className="forbidden-reason">{reason}</p>
        
        <p className="forbidden-message">
          Vous n'avez pas les permissions nécessaires pour accéder à cette
          ressource. Cette tentative d'accès a été enregistrée.
        </p>
        
        <Link to="/" className="back-button">
          <Icons.Home />
          Retour au Dashboard
        </Link>
        
        <div className="forbidden-info">
          <p>
            Si vous pensez qu'il s'agit d'une erreur, veuillez contacter{' '}
            <a href="mailto:admin@accessguard.com">l'administrateur</a>.
          </p>
        </div>
      </div>
    </div>
  )
}

export default Forbidden
