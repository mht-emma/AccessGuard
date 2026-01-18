import React, { useState, useEffect, useRef } from 'react'
import api from '../services/api'
import StatusBadge from '../components/StatusBadge'
import './AdminPages.css'

const AccessAttempts = () => {
  const [allAttempts, setAllAttempts] = useState([]) // Stores all fetched data
  const [filteredAttempts, setFilteredAttempts] = useState([]) // Stores data after filter application
  const [paginatedAttempts, setPaginatedAttempts] = useState([]) // Stores data for current page header

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [filters, setFilters] = useState({
    status: '',
    userId: '',
    resource: ''
  })

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0
  })

  // Initial Fetch
  useEffect(() => {
    fetchAllAttempts()
  }, [])

  // Apply filters and pagination whenever filters, page, or source data changes
  useEffect(() => {
    applyFiltersAndPagination()
  }, [filters, pagination.page, allAttempts])

  const fetchAllAttempts = async () => {
    try {
      setLoading(true)
      setError('')
      // Fetch a large batch initialy (max 1000 allowed by backend)
      const response = await api.get('/access/attempts?limit=1000&offset=0')

      const data = response.data.data || []
      setAllAttempts(data)
      // Initial filter application will happen via useEffect
    } catch (error) {
      const errorMessage = error.userMessage ||
        error.response?.data?.message ||
        'Erreur lors du chargement des tentatives d\'accès'
      setError(errorMessage)
      console.error('Erreur lors du chargement des tentatives d\'accès:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndPagination = () => {
    let result = [...allAttempts]

    // 1. Client-side Filtering
    if (filters.status) {
      result = result.filter(a => a.status === filters.status)
    }
    if (filters.resource) {
      const term = filters.resource.toLowerCase()
      result = result.filter(a =>
        (a.resource?.path || a.resource || '').toLowerCase().includes(term)
      )
    }
    // Note: userId filter on frontend implies we have the username loaded. 
    // If filtering by ID string, we check user.id. Assuming text input currently not used or is hidden? 
    // The previous code had userId input.
    if (filters.userId) {
      result = result.filter(a => a.user?.id === filters.userId)
    }

    setFilteredAttempts(result)

    // 2. Client-side Pagination
    const total = result.length
    const startIndex = (pagination.page - 1) * pagination.limit
    const endIndex = startIndex + pagination.limit
    const currentSlice = result.slice(startIndex, endIndex)

    setPaginatedAttempts(currentSlice)
    setPagination(prev => ({
      ...prev,
      total: total
    }))
  }

  const handlePageChange = (newPage) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A'
    return new Date(dateString).toLocaleString('fr-FR')
  }

  const PaginationControls = () => (
    <div className="pagination-controls" style={{ display: 'flex', justifyContent: 'center', gap: '1rem', margin: '1rem 0', alignItems: 'center' }}>
      <button
        className="btn-secondary"
        disabled={pagination.page === 1}
        onClick={() => handlePageChange(pagination.page - 1)}
      >
        Précédent
      </button>
      <span>
        Page {pagination.page} / {Math.max(1, Math.ceil(pagination.total / pagination.limit))} (Total: {pagination.total})
      </span>
      <button
        className="btn-secondary"
        disabled={pagination.page >= Math.ceil(pagination.total / pagination.limit)}
        onClick={() => handlePageChange(pagination.page + 1)}
      >
        Suivant
      </button>
    </div>
  )

  if (loading && allAttempts.length === 0) return <div className="admin-page">Chargement...</div>

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Tentatives d'Accès</h1>
        <button className="btn-primary" onClick={() => fetchAllAttempts()}>
          Actualiser
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="filters-section">
        <h3>Filtres</h3>
        <div className="filters-grid">
          <div className="form-group">
            <label>Statut</label>
            <select
              value={filters.status}
              onChange={(e) => {
                setFilters({ ...filters, status: e.target.value })
                setPagination(prev => ({ ...prev, page: 1 })) // Reset page on filter change
              }}
            >
              <option value="">Tous</option>
              <option value="AUTHORIZED">Autorisé</option>
              <option value="REFUSED">Refusé</option>
              <option value="SUSPICIOUS">Suspect</option>
            </select>
          </div>
          <div className="form-group">
            <label>Ressource</label>
            <input
              type="text"
              value={filters.resource}
              onChange={(e) => {
                setFilters({ ...filters, resource: e.target.value })
                setPagination(prev => ({ ...prev, page: 1 })) // Reset page on filter change
              }}
              placeholder="ex: /dashboard"
            />
          </div>
        </div>
      </div>

      <PaginationControls />

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Utilisateur</th>
              <th>Ressource</th>
              <th>Adresse IP</th>
              <th>Statut</th>
              <th>Raison</th>
              <th>Date/Heure</th>
            </tr>
          </thead>
          <tbody>
            {paginatedAttempts.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '2rem' }}>
                  Aucune tentative d'accès trouvée
                </td>
              </tr>
            ) : (
              paginatedAttempts.map((attempt) => (
                <tr key={attempt.id}>
                  <td title={attempt.id} style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {attempt.id.substring(0, 8)}...
                  </td>
                  <td>{attempt.user?.username || 'N/A'}</td>
                  <td>{attempt.resource?.path || attempt.resource || 'N/A'}</td>
                  <td>{attempt.ip?.address || 'N/A'}</td>
                  <td>
                    <StatusBadge status={attempt.status} />
                  </td>
                  <td>{attempt.reason || 'N/A'}</td>
                  <td>{formatDate(attempt.timestamp)}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls />
    </div>
  )
}

export default AccessAttempts
