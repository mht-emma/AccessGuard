import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './AdminPages.css'

const Permissions = () => {
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [showForm, setShowForm] = useState(false)
  const [editingPermission, setEditingPermission] = useState(null)

  useEffect(() => {
    fetchPermissions()
  }, [])

  const fetchPermissions = async () => {
    try {
      setError('')
      setLoading(true)
      const response = await api.get('/permissions')
      console.log('Réponse de /permissions :', response)
      setPermissions(response.data.permissions || [])
    } catch (error) {
      const errorMessage = error.userMessage ||
        error.response?.data?.message ||
        'Erreur lors du chargement des permissions'
      setError(errorMessage)
      setPermissions([])
      console.error('Erreur complète :', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError('')
      if (editingPermission) {
        await api.put(`/permissions/${editingPermission.id}`, formData)
      } else {
        await api.post('/permissions', formData)
      }
      setShowForm(false)
      setEditingPermission(null)
      setFormData({ name: '', description: '' })
      fetchPermissions()
    } catch (error) {
      const errorMessage = error.userMessage ||
        error.response?.data?.message ||
        'Erreur lors de la sauvegarde'
      setError(errorMessage)
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleEdit = (permission) => {
    setEditingPermission(permission)
    setFormData({
      name: permission.name,
      description: permission.description || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (permissionId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette permission ?')) {
      return
    }
    try {
      setError('')
      await api.delete(`/permissions/${permissionId}`)
      fetchPermissions()
    } catch (error) {
      const errorMessage = error.userMessage ||
        error.response?.data?.message ||
        'Erreur lors de la suppression'
      setError(errorMessage)
      console.error('Erreur lors de la suppression:', error)
    }
  }

  if (loading) return <div className="admin-page">Chargement des permissions...</div>

  if (error) {
    return (
      <div className="admin-page">
        <div className="error-message">
          <p>Erreur lors du chargement des permissions : {error}</p>
          <button onClick={fetchPermissions} className="btn-primary">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Gestion des Permissions</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setShowForm(!showForm)
            setEditingPermission(null)
            setFormData({ name: '', description: '' })
          }}
        >
          {showForm ? 'Annuler' : '+ Nouvelle permission'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="admin-form">
          <h2>{editingPermission ? 'Modifier' : 'Créer'} une permission</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nom de la permission</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="ex: READ_DASHBOARD, WRITE_USERS"
                required
              />
            </div>
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                rows="3"
              />
            </div>
            <button type="submit" className="btn-primary">
              {editingPermission ? 'Modifier' : 'Créer'}
            </button>
          </form>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom</th>
              <th>Description</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {permissions && permissions.length > 0 ? (
              permissions.map((permission) => (
                <tr key={permission.id}>
                  <td>{permission.id}</td>
                  <td>{permission.name}</td>
                  <td>{permission.description || 'N/A'}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(permission)}
                    >
                      Modifier
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(permission.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="no-data">
                  Aucune permission trouvée
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Permissions

