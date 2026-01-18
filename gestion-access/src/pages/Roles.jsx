import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './AdminPages.css'

const Roles = () => {
  const [roles, setRoles] = useState([])
  const [permissions, setPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({ name: '', permissionIds: [] })
  const [showForm, setShowForm] = useState(false)
  const [editingRole, setEditingRole] = useState(null)

  useEffect(() => {
    fetchRoles()
    fetchPermissions()
  }, [])

  const fetchRoles = async () => {
    try {
      setError('')
      const response = await api.get('/roles')
      setRoles(response.data)
    } catch (error) {
      const errorMessage = error.userMessage ||
        error.response?.data?.message ||
        'Erreur lors du chargement des rôles'
      setError(errorMessage)
      console.error('Erreur lors du chargement des rôles:', error)
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
      if (editingRole) {
        await api.put(`/roles/${editingRole.id}`, formData)
      } else {
        await api.post('/roles', formData)
      }
      setShowForm(false)
      setEditingRole(null)
      setFormData({ name: '', permissionIds: [] })
      fetchRoles()
    } catch (error) {
      const errorMessage = error.userMessage ||
        error.response?.data?.message ||
        'Erreur lors de la sauvegarde'
      setError(errorMessage)
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleEdit = (role) => {
    setEditingRole(role)
    setFormData({
      name: role.name,
      permissionIds: role.permissions?.map((p) => p.id) || []
    })
    setShowForm(true)
  }

  const handleDelete = async (roleId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce rôle ?')) {
      return
    }
    try {
      setError('')
      await api.delete(`/roles/${roleId}`)
      fetchRoles()
    } catch (error) {
      const errorMessage = error.userMessage ||
        error.response?.data?.message ||
        'Erreur lors de la suppression'
      setError(errorMessage)
      console.error('Erreur lors de la suppression:', error)
    }
  }

  const togglePermission = (permissionId) => {
    setFormData((prev) => ({
      ...prev,
      permissionIds: prev.permissionIds.includes(permissionId)
        ? prev.permissionIds.filter((id) => id !== permissionId)
        : [...prev.permissionIds, permissionId]
    }))
  }

  if (loading) return <div className="admin-page">Chargement...</div>

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Gestion des Rôles</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setShowForm(!showForm)
            setEditingRole(null)
            setFormData({ name: '', permissionIds: [] })
          }}
        >
          {showForm ? 'Annuler' : '+ Nouveau rôle'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="admin-form">
          <h2>{editingRole ? 'Modifier' : 'Créer'} un rôle</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nom du rôle</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Permissions</label>
              <div className="checkbox-group">
                {permissions.map((permission) => (
                  <label key={permission.id} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={formData.permissionIds.includes(permission.id)}
                      onChange={() => togglePermission(permission.id)}
                    />
                    {permission.name}
                  </label>
                ))}
              </div>
            </div>
            <button type="submit" className="btn-primary">
              {editingRole ? 'Modifier' : 'Créer'}
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
              <th>Permissions</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {roles.map((role) => (
              <tr key={role.id}>
                <td>{role.id}</td>
                <td>{role.name}</td>
                <td>
                  {role.permissions?.length > 0 ? (
                    <div className="permissions-list">
                      {role.permissions.map((p, idx) => (
                        <span key={idx} className="permission-tag">
                          {p.name}
                        </span>
                      ))}
                    </div>
                  ) : (
                    'Aucune'
                  )}
                </td>
                <td>
                  <button
                    className="btn-edit"
                    onClick={() => handleEdit(role)}
                  >
                    Modifier
                  </button>
                  <button
                    className="btn-delete"
                    onClick={() => handleDelete(role.id)}
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

export default Roles

