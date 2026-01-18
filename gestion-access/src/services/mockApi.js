// Mock API pour tester le frontend sans backend
// Activez ce mode en définissant USE_MOCK_API=true dans .env ou en modifiant api.js

// Données mockées
const mockUsers = [
  {
    id: '1',
    username: 'admin',
    email: 'admin@example.com',
    role: {
      id: '1',
      name: 'ADMIN',
      permissions: [
        { id: '1', name: 'READ_USERS' },
        { id: '2', name: 'WRITE_USERS' },
        { id: '3', name: 'READ_ROLES' },
        { id: '4', name: 'WRITE_ROLES' }
      ]
    }
  },
  {
    id: '2',
    username: 'user1',
    email: 'user1@example.com',
    role: {
      id: '2',
      name: 'USER',
      permissions: [
        { id: '5', name: 'READ_DASHBOARD' }
      ]
    }
  }
]

const mockRoles = [
  {
    id: '1',
    name: 'ADMIN',
    permissions: [
      { id: '1', name: 'READ_USERS' },
      { id: '2', name: 'WRITE_USERS' }
    ]
  },
  {
    id: '2',
    name: 'USER',
    permissions: [
      { id: '5', name: 'READ_DASHBOARD' }
    ]
  }
]

const mockPermissions = [
  { id: '1', name: 'READ_USERS', description: 'Lire les utilisateurs' },
  { id: '2', name: 'WRITE_USERS', description: 'Modifier les utilisateurs' },
  { id: '3', name: 'READ_ROLES', description: 'Lire les rôles' },
  { id: '4', name: 'WRITE_ROLES', description: 'Modifier les rôles' },
  { id: '5', name: 'READ_DASHBOARD', description: 'Accéder au dashboard' }
]

const mockResources = [
  { id: '1', path: '/dashboard', permission: { id: '5', name: 'READ_DASHBOARD' } },
  { id: '2', path: '/users', permission: { id: '1', name: 'READ_USERS' } },
  { id: '3', path: '/roles', permission: { id: '3', name: 'READ_ROLES' } }
]

const mockIPs = [
  { id: '1', address: '192.168.1.1', user: { id: '1', username: 'admin' }, isSuspicious: false },
  { id: '2', address: '10.0.0.1', user: { id: '2', username: 'user1' }, isSuspicious: true }
]

const mockAccessAttempts = [
  {
    id: '1',
    user: { id: '1', username: 'admin' },
    resource: { id: '1', path: '/dashboard' },
    ip: { id: '1', address: '192.168.1.1' },
    status: 'AUTHORIZED',
    reason: 'Accès autorisé',
    timestamp: new Date().toISOString()
  },
  {
    id: '2',
    user: { id: '2', username: 'user1' },
    resource: { id: '2', path: '/users' },
    ip: { id: '2', address: '10.0.0.1' },
    status: 'REFUSED',
    reason: 'Permissions insuffisantes',
    timestamp: new Date().toISOString()
  }
]

// Simule un délai réseau
const delay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms))

// Mock de l'API Axios
const mockApi = {
  get: async (url) => {
    await delay()
    
    if (url === '/users') {
      return { data: mockUsers }
    }
    
    if (url.startsWith('/users/')) {
      const id = url.split('/')[2]
      const user = mockUsers.find(u => u.id === id)
      return user ? { data: user } : Promise.reject({ response: { status: 404 } })
    }
    
    if (url === '/roles') {
      return { data: mockRoles }
    }
    
    if (url === '/permissions') {
      return { data: mockPermissions }
    }
    
    if (url === '/resources') {
      return { data: mockResources }
    }
    
    if (url === '/ips') {
      return { data: mockIPs }
    }
    
    if (url.startsWith('/access-attempts')) {
      return { data: mockAccessAttempts }
    }
    
    return Promise.reject({ response: { status: 404, data: { message: 'Not found' } } })
  },

  post: async (url, data) => {
    await delay()
    
    if (url === '/auth/login') {
      const { username } = data // Le backend n'utilise PAS de password
      
      // Mock : accepte admin et user1 (sans password)
      if (username === 'admin') {
        return { data: mockUsers[0] }
      }
      if (username === 'user1') {
        return { data: mockUsers[1] }
      }
      
      return Promise.reject({
        response: {
          status: 401,
          data: { message: 'Nom d\'utilisateur incorrect' }
        }
      })
    }
    
    if (url.startsWith('/check-access/')) {
      // Endpoint GET /check-access/:path du backend
      const path = url.replace('/check-access/', '')
      const resource = '/' + path
      
      // Simuler la vérification d'accès
      // Dans le vrai backend, le middleware accessControl fait ça automatiquement
      return { data: { status: 'AUTHORIZED', reason: 'Accès autorisé' } }
    }
    
    if (url === '/access/check') {
      const { resource, userId } = data
      const user = mockUsers.find(u => u.id === userId)
      
      if (!user) {
        return Promise.reject({ response: { status: 401 } })
      }
      
      // Logique simple de vérification
      if (resource === '/users' || resource === '/roles' || resource === '/permissions' || 
          resource === '/resources' || resource === '/ips' || resource === '/access-attempts') {
        if (user.role.name !== 'ADMIN') {
          return { data: { status: 'REFUSED', reason: 'Accès réservé aux administrateurs' } }
        }
      }
      
      // Vérifier si l'IP est suspecte
      const userIP = mockIPs.find(ip => ip.user?.id === userId && ip.isSuspicious)
      if (userIP) {
        return { data: { status: 'SUSPICIOUS', reason: 'IP suspecte détectée' } }
      }
      
      return { data: { status: 'AUTHORIZED', reason: 'Accès autorisé' } }
    }
    
    // Pour les POST de création, simuler la création
    if (url === '/users' || url === '/roles' || url === '/permissions' || 
        url === '/resources' || url === '/ips') {
      return { data: { id: Date.now().toString(), ...data } }
    }
    
    return Promise.reject({ response: { status: 404 } })
  },

  put: async (url, data) => {
    await delay()
    // Simule une mise à jour réussie
    const id = url.split('/').pop()
    return { data: { id, ...data } }
  },

  delete: async (url) => {
    await delay()
    // Simule une suppression réussie
    return { data: { success: true } }
  }
}

export default mockApi

