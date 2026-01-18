import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './AdminPages.css'

const Resources = () => {
  const [resources, setResources] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ path: '', permissionId: '' })
  const [showForm, setShowForm] = useState(false)
  const [editingResource, setEditingResource] = useState(null)

  useEffect(() => {
    fetchResources()
    fetchPermissions()
  }, [])

  const fetchResources = async () => {
    try {
      setError('')
      const response = await api.get('/resources')
      // Utiliser response.data.resources
      const resourcesData = response.data.resources || []
      console.log('📦 Resources data loaded:', resourcesData)
      setResources(resourcesData)
    } catch (error) {
      const errorMessage = error.userMessage ||
        error.response?.data?.message ||
        'Erreur lors du chargement des ressources'
      setError(errorMessage)
      console.error('Erreur lors du chargement des ressources:', error)
      // S'assurer que resources est un tableau même en cas d'erreur
      setResources([])
    } finally {
      setLoading(false)
    }
  }

  const fetchPermissions = async () => {
    try {
      const response = await api.get('/permissions')
      setPermissions(response.data.permissions || [])
    } catch (error) {
      console.error('Erreur lors du chargement des permissions:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError('')
      if (editingResource) {
        await api.put(`/resources/${editingResource.id}`, formData)
      } else {
        await api.post('/resources', formData)
      }
      setShowForm(false)
      setEditingResource(null)
      setFormData({ path: '', permissionId: '' })
      fetchResources()
    } catch (error) {
      const errorMessage = error.userMessage ||
        error.response?.data?.message ||
        'Erreur lors de la sauvegarde'
      setError(errorMessage)
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleEdit = (resource) => {
    setEditingResource(resource)
    setFormData({
      path: resource.path,
      permissionId: resource.permission?.id || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (resourceId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette ressource ?')) {
      return
    }
    try {
      setError('')
      await api.delete(`/resources/${resourceId}`)
      fetchResources()
    } catch (error) {
      const errorMessage = error.userMessage ||
        error.response?.data?.message ||
        'Erreur lors de la suppression'
      setError(errorMessage)
      console.error('Erreur lors de la suppression:', error)
    }
  }

  if (loading) return <div className="admin-page">Chargement...</div>

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Gestion des Ressources</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setShowForm(!showForm)
            setEditingResource(null)
            setFormData({ path: '', permissionId: '' })
          }}
        >
          {showForm ? 'Annuler' : '+ Nouvelle ressource'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="admin-form">
          <h2>{editingResource ? 'Modifier' : 'Créer'} une ressource</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Chemin de la ressource</label>
              <input
                type="text"
                value={formData.path}
                onChange={(e) =>
                  setFormData({ ...formData, path: e.target.value })
                }
                placeholder="ex: /dashboard, /users"
                required
              />
            </div>
            <div className="form-group">
              <label>Permission requise</label>
              <select
                value={formData.permissionId}
                onChange={(e) =>
                  setFormData({ ...formData, permissionId: e.target.value })
                }
                required
              >
                <option value="">-- Sélectionnez une permission --</option>
                {permissions.map((permission) => (
                  <option key={permission.id} value={permission.id}>
                    {permission.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary">
              {editingResource ? 'Modifier' : 'Créer'}
            </button>
          </form>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Chemin</th>
              <th>Permission requise</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {resources.map((resource) => (
              <tr key={resource.id}>
                <td>{resource.id}</td>
                <td>{resource.path}</td>
                <td>{resource.permission?.name || 'N/A'}</td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(resource)}
                  >
                    Modifier
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(resource.id)}
                  >
                    Supprimer
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Resources

