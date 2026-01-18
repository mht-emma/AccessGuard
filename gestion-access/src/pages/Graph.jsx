import React from 'react'
import './Graph.css'

// Icons
const Icons = {
  Database: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
      <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
    </svg>
  ),
  ExternalLink: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <polyline points="15,3 21,3 21,9" />
      <line x1="10" y1="14" x2="21" y2="3" />
    </svg>
  ),
  Refresh: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <polyline points="23,4 23,10 17,10" />
      <polyline points="1,20 1,14 7,14" />
      <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
    </svg>
  ),
  Share: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="18" cy="5" r="3" />
      <circle cx="6" cy="12" r="3" />
      <circle cx="18" cy="19" r="3" />
      <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
      <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
    </svg>
  )
}

const Graph = () => {
  const openInNewTab = () => {
    window.open('http://localhost:7474', '_blank')
  }

  return (
    <div className="graph-container">
      <h1>Visualisation du Graphe Neo4j</h1>

      <div className="graph-content">
        {/* Info Panel */}
        <div className="graph-info">
          <h2>
            <Icons.Database />
            Accès au graphe Neo4j
          </h2>
          <p>
            Explorez les relations entre utilisateurs, rôles, permissions et ressources
            dans votre base de données Neo4j.
          </p>
          <ul>
            <li>
              Ouvrir Neo4j Browser à l'adresse : <code>http://localhost:7474</code>
            </li>
            <li>
              Exécuter des requêtes Cypher pour explorer les relations
            </li>
            <li>
              Visualiser les tentatives d'accès et les patterns suspects
            </li>
          </ul>

          <div className="cypher-examples">
            <h3>Exemples de requêtes Cypher</h3>

            <div className="cypher-query">
              <h4>1️ Requête simple (sélection)</h4>
              <p>Objectif : afficher tous les utilisateurs existants</p>
              <code>
                {`MATCH (u:User) RETURN u.username`}
              </code>
            </div>

            <div className="cypher-query">
              <h4>2️ Requête conditionnée</h4>
              <p>Objectif : afficher les tentatives d’accès refusées</p>
              <code>
                {`MATCH (a:AccessAttempt) 
WHERE a.status = "REFUSED" 
RETURN a.id, a.username, a.path, a.reason`}
              </code>
            </div>

            <div className="cypher-query">
              <h4>3️ Requête d’agrégation</h4>
              <p>Objectif : compter le nombre de tentatives par utilisateur</p>
              <code>
                {`MATCH (u:User)-[:TRIED_TO_ACCESS]->(a:AccessAttempt) 
RETURN u.username, COUNT(a) AS total_attempts 
ORDER BY total_attempts DESC`}
              </code>
            </div>

            <div className="cypher-query">
              <h4>4️ Requête de modification (UPDATE)</h4>
              <p>Objectif : marquer une IP comme connue pour un utilisateur (Exemple)</p>
              <code>
                {`MATCH (u:User {username: "user1"}) 
MATCH (ip:IP {address: "192.168.1.20"}) 
MERGE (u)-[:CONNECTS_FROM]->(ip)`}
              </code>
            </div>

            <div className="cypher-query">
              <h4>5️ Requête de chemin (PATH)</h4>
              <p>Objectif : visualiser le chemin complet des droits</p>
              <code>
                {`MATCH p = (u:User)-[:HAS_ROLE]->(r:Role)
        -[:GRANTS]->(perm:Permission)
        -[:ACCESS_TO]->(res:Resource) 
RETURN p`}
              </code>
            </div>
          </div>
        </div>

        {/* Iframe Replacement - Call to Action */}
        <div className="graph-iframe-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px', backgroundColor: '#1a1a1a', borderRadius: '8px', border: '1px solid #333' }}>
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <div style={{ marginBottom: '1.5rem', transform: 'scale(1.5)', display: 'inline-block' }}>
              <Icons.Share />
            </div>
            <h3 style={{ marginBottom: '1rem', color: '#fff' }}>
              Accéder à l'interface Neo4j
            </h3>
            <p style={{ color: '#aaa', maxWidth: '400px', margin: '0 auto 2rem auto', lineHeight: '1.6' }}>
              Pour des raisons de sécurité, le navigateur Neo4j ne peut pas être intégré directement dans cette page.
              Veuillez l'ouvrir dans un nouvel onglet pour visualiser vos données.
            </p>

            <button
              className="iframe-btn"
              onClick={openInNewTab}
              style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                backgroundColor: '#ff7e1d', // Typical Neo4j orange or theme primary
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.5rem',
                fontWeight: '600'
              }}
            >
              <Icons.ExternalLink />
              Ouvrir Neo4j Browser
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Graph
