import React, { useState, useEffect } from 'react'
import api from '../services/api'
import './AdminPages.css'

const Users = () => {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    roleId: ''
  })
  const [roles, setRoles] = useState([])
  const [showForm, setShowForm] = useState(false)
  const [editingUser, setEditingUser] = useState(null)

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const fetchUsers = async () => {
    try {
      setError('')
      setLoading(true)
      const response = await api.get('/users')
      console.log('Réponse de /users :', response)
      setUsers(response.data.users || [])
    } catch (error) {
      console.error('Erreur complète :', error)
      const errorMessage = error.userMessage ||
        error.response?.data?.message ||
        'Erreur lors du chargement des utilisateurs'
      setError(errorMessage)
      setUsers([])
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const response = await api.get('/roles')
      setRoles(response.data)
    } catch (error) {
      console.error('Erreur lors du chargement des rôles:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setError('')
      if (editingUser) {
        await api.put(`/users/${editingUser.id}`, formData)
      } else {
        await api.post('/users', formData)
      }
      setShowForm(false)
      setEditingUser(null)
      setFormData({ username: '', email: '', roleId: '' })
      fetchUsers()
    } catch (error) {
      const errorMessage = error.userMessage ||
        error.response?.data?.message ||
        'Erreur lors de la sauvegarde'
      setError(errorMessage)
      console.error('Erreur lors de la sauvegarde:', error)
    }
  }

  const handleEdit = (user) => {
    setEditingUser(user)
    setFormData({
      username: user.username,
      email: user.email || '',
      roleId: user.role?.id || ''
    })
    setShowForm(true)
  }

  const handleDelete = async (userId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cet utilisateur ?')) {
      return
    }
    try {
      setError('')
      await api.delete(`/users/${userId}`)
      fetchUsers()
    } catch (error) {
      const errorMessage = error.userMessage ||
        error.response?.data?.message ||
        'Erreur lors de la suppression'
      setError(errorMessage)
      console.error('Erreur lors de la suppression:', error)
    }
  }

  if (loading) return <div className="admin-page">Chargement des utilisateurs...</div>

  if (error) {
    return (
      <div className="admin-page">
        <div className="error-message">
          <p>Erreur lors du chargement des utilisateurs : {error}</p>
          <button onClick={fetchUsers} className="btn-primary">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="admin-page">
      <div className="admin-header">
        <h1>Gestion des Utilisateurs</h1>
        <button
          className="btn-primary"
          onClick={() => {
            setShowForm(!showForm)
            setEditingUser(null)
            setFormData({ username: '', email: '', roleId: '' })
          }}
        >
          {showForm ? 'Annuler' : '+ Nouvel utilisateur'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {showForm && (
        <div className="admin-form">
          <h2>{editingUser ? 'Modifier' : 'Créer'} un utilisateur</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Nom d'utilisateur</label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                required
              />
            </div>
            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>
            <div className="form-group">
              <label>Rôle</label>
              <select
                value={formData.roleId}
                onChange={(e) =>
                  setFormData({ ...formData, roleId: e.target.value })
                }
                required
              >
                <option value="">-- Sélectionnez un rôle --</option>
                {roles.map((role) => (
                  <option key={role.id} value={role.id}>
                    {role.name}
                  </option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-primary">
              {editingUser ? 'Modifier' : 'Créer'}
            </button>
          </form>
        </div>
      )}

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nom d'utilisateur</th>
              <th>Email</th>
              <th>Rôle</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users && users.length > 0 ? (
              users.map((user) => (
                <tr key={user.id}>
                  <td>{user.id}</td>
                  <td>{user.username}</td>
                  <td>{user.email || 'N/A'}</td>
                  <td>{user.role?.name || 'N/A'}</td>
                  <td>
                    <button
                      className="btn-edit"
                      onClick={() => handleEdit(user)}
                    >
                      Modifier
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(user.id)}
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="5" className="no-data">
                  Aucun utilisateur trouvé
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Users

