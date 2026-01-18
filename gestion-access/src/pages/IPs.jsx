import React, { useState, useEffect, useCallback } from 'react'
import api from '../services/api'
import './AdminPages.css'

// Icons
const Icons = {
  Globe: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  User: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
      <circle cx="12" cy="7" r="4" />
    </svg>
  ),
  Shield: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  ),
  Alert: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  ),
  Trash: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    </svg>
  ),
  Edit: () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
    </svg>
  )
}

const IPs = () => {
  const [ips, setIPs] = useState([])
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingIP, setEditingIP] = useState(null)
  const [formData, setFormData] = useState({ address: '', userId: '', isSuspicious: false })

  const fetchUsers = useCallback(async () => {
    try {
      const response = await api.get('/users')
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('Erreur lors du chargement des utilisateurs:', error)
      setUsers([])
    }
  }, [])

  const fetchIPs = useCallback(async () => {
    try {
      setLoading(true)
      setError('')
      const response = await api.get('/ips')
      setIPs(Array.isArray(response.data) ? response.data : [])
    } catch (error) {
      setError('Erreur lors du chargement des adresses IP')
      console.error(error)
      setIPs([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchIPs()
    fetchUsers()
  }, [fetchIPs, fetchUsers])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (editingIP) {
        await api.put(`/ips/${editingIP.id}`, formData)
      } else {
        await api.post('/ips', formData)
      }
      setShowForm(false)
      setEditingIP(null)
      setFormData({ address: '', userId: '', isSuspicious: false })
      fetchIPs()
    } catch (error) {
      setError(error.response?.data?.message || 'Erreur lors de la sauvegarde')
    }
  }

  const handleEdit = (ip) => {
    setEditingIP(ip)
    setFormData({
      address: ip.address,
      userId: ip.users?.[0]?.id || '',
      isSuspicious: ip.isSuspicious || false
    })
    setShowForm(true)
  }

  const handleDelete = async (ipId) => {
    if (!window.confirm('Supprimer cette adresse IP ?')) return
    try {
      await api.delete(`/ips/${ipId}`)
      fetchIPs()
    } catch (error) {
      setError('Erreur lors de la suppression')
    }
  }

  if (loading) return <div className="admin-page">Chargement en cours...</div>

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Gestion des Adresses IP</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setShowForm(!showForm)
            setEditingIP(null)
            setFormData({ address: '', userId: '', isSuspicious: false })
          }}
        >
          {showForm ? 'Annuler' : '+ Ajouter une IP'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="admin-form">
          <h2>{editingIP ? 'Modifier l\'adresse' : 'Nouvelle adresse IP'}</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Adresse IP</label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="ex: 192.168.1.1"
                required
              />
            </div>

            <div className="form-group">
              <label>Utilisateur associé</label>
              <select
                value={formData.userId}
                onChange={(e) => setFormData({ ...formData, userId: e.target.value })}
              >
                <option value="">-- Aucun utilisateur --</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={formData.isSuspicious}
                  onChange={(e) => setFormData({ ...formData, isSuspicious: e.target.checked })}
                />
                Signaler comme suspecte
              </label>
            </div>

            <button type="submit" className="btn-primary">
              {editingIP ? 'Mettre à jour' : 'Enregistrer'}
            </button>
          </form>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Adresse IP</th>
              <th>Utilisateurs</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {ips.length === 0 ? (
              <tr><td colSpan="5" className="no-data">Aucune adresse IP enregistrée</td></tr>
            ) : (
              ips.map((ip) => (
                <tr key={ip.id || ip.address}>
                  <td>{ip.id?.substring(0, 8)}...</td>
                  <td>{ip.address}</td>
                  <td>
                    {ip.users && ip.users.length > 0 ? (
                      <div className="permissions-list">
                        {ip.users.map(u => (
                          <span key={u.id} className="permission-tag">
                            {u.username}
                          </span>
                        ))}
                      </div>
                    ) : (
                      'N/A'
                    )}
                  </td>
                  <td>
                    {ip.isSuspicious ? (
                      <span className="suspicious-badge">SUSPECTE</span>
                    ) : (
                      <span className="normal-badge">NORMALE</span>
                    )}
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => handleEdit(ip)}>
                      Modifier
                    </button>
                    <button className="btn-delete" onClick={() => handleDelete(ip.id)}>
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default IPs


