import React from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import './Home.css'

const Home = () => {
  const { user } = useAuth()
  const navigate = useNavigate()

  return (
    <div className="landing-page">
      <nav className="landing-nav">
        <div className="logo">
          <div className="logo-icon"></div>
          <span>ACCESS<strong>GUARD</strong></span>
        </div>
        <div className="nav-links">
          {user ? (
            <Link to="/dashboard" className="btn-nav">Tableau de Bord</Link>
          ) : (
            <>
              <Link to="/login" className="btn-nav">Connexion</Link>
              <Link to="/login" className="btn-nav btn-primary-nav">Essayer Gratuitement</Link>
            </>
          )}
        </div>
      </nav>

      <header className="hero-section">
        <div className="hero-content">
          <div className="badge-glow pulse">Nouveau: Moteur RBAC v2.0</div>
          <h1>Sécurisez votre Infrastructure avec <span>Précision</span></h1>
          <p>
            Une solution de gestion d'accès NoSQL ultra-performante basée sur Neo4j.
            Contrôlez, visualisez et auditez chaque interaction en temps réel.
          </p>
          <div className="hero-actions">
            <button className="btn-hero-primary" onClick={() => navigate(user ? '/dashboard' : '/login')}>
              {user ? 'Accéder au Dashboard' : 'Commencer Maintenant'}
            </button>
            <button className="btn-hero-secondary">Documentations</button>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-grid">
            {/* Simulated Node Network */}
            <div className="node n1"></div>
            <div className="node n2"></div>
            <div className="node n3"></div>
            <div className="line l1"></div>
            <div className="line l2"></div>
          </div>
        </div>
      </header>

      <section className="features-section">
        <div className="feature-card">
          <div className="f-icon">🛡️</div>
          <h3>RBAC Dynamique</h3>
          <p>Gestion fine des permissions par rôles et ressources.</p>
        </div>
        <div className="feature-card">
          <div className="f-icon">📊</div>
          <h3>Graphes de Relation</h3>
          <p>Visualisez les dépendances d'accès via la puissance de Neo4j.</p>
        </div>
        <div className="feature-card">
          <h3>Audit en Temps Réel</h3>
          <p>Traçabilité complète des tentatives d'accès et filtrage IP.</p>
        </div>
      </section>

      <footer className="landing-footer">
        <p>&copy; 2026 AccessGuard IAM System. Tous droits réservés.</p>
      </footer>
    </div>
  )
}

export default Home
