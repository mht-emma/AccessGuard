# 📡 Documentation des Appels API

## 📍 Où se trouve la logique d'appel au backend ?

**Fichier principal :** `src/services/api.js`

Ce fichier configure Axios pour tous les appels API. Il peut basculer entre :
- **Mode RÉEL** : Appels vers le vrai backend (http://localhost:8000)
- **Mode MOCK** : Données simulées pour tester sans backend

## 🔄 Comment ça fonctionne actuellement

### Configuration actuelle

```javascript
// src/services/api.js
baseURL: '/api'  // Tous les appels commencent par /api
```

**Proxy Vite** (`vite.config.js`) :
- Les requêtes vers `/api/*` sont redirigées vers `http://localhost:8000`
- Exemple : `POST /api/auth/login` → `POST http://localhost:8000/auth/login`

## 📋 Liste complète des appels API

### Authentification
- **`POST /auth/login`** (Login.jsx → AuthContext.jsx)
  - Body: `{ username, password }`
  - Retourne: Données utilisateur avec rôle et permissions

### Vérification d'accès
- **`POST /access/check`** (ProtectedRoute.jsx)
  - Body: `{ resource: "/dashboard", userId: "1" }`
  - Retourne: `{ status: "AUTHORIZED"|"REFUSED"|"SUSPICIOUS", reason: "..." }`
  - Appelé automatiquement à chaque navigation

### Gestion des utilisateurs (ADMIN)
- **`GET /users`** (Users.jsx)
- **`POST /users`** (Users.jsx) - Création
- **`PUT /users/:id`** (Users.jsx) - Modification
- **`DELETE /users/:id`** (Users.jsx) - Suppression

### Gestion des rôles (ADMIN)
- **`GET /roles`** (Roles.jsx, Users.jsx)
- **`GET /permissions`** (Roles.jsx) - Pour associer permissions
- **`POST /roles`** (Roles.jsx) - Création
- **`PUT /roles/:id`** (Roles.jsx) - Modification
- **`DELETE /roles/:id`** (Roles.jsx) - Suppression

### Gestion des permissions (ADMIN)
- **`GET /permissions`** (Permissions.jsx, Roles.jsx, Resources.jsx)
- **`POST /permissions`** (Permissions.jsx) - Création
- **`PUT /permissions/:id`** (Permissions.jsx) - Modification
- **`DELETE /permissions/:id`** (Permissions.jsx) - Suppression

### Gestion des ressources (ADMIN)
- **`GET /resources`** (Resources.jsx)
- **`GET /permissions`** (Resources.jsx) - Pour associer permission
- **`POST /resources`** (Resources.jsx) - Création
- **`PUT /resources/:id`** (Resources.jsx) - Modification
- **`DELETE /resources/:id`** (Resources.jsx) - Suppression

### Gestion des IP (ADMIN)
- **`GET /ips`** (IPs.jsx)
- **`GET /users`** (IPs.jsx) - Pour associer utilisateur
- **`POST /ips`** (IPs.jsx) - Création
- **`PUT /ips/:id`** (IPs.jsx) - Modification
- **`DELETE /ips/:id`** (IPs.jsx) - Suppression

### Tentatives d'accès (ADMIN)
- **`GET /access-attempts?status=...&userId=...&resource=...`** (AccessAttempts.jsx)
  - Paramètres de filtrage optionnels

## 🧪 Tester sans backend (Mode MOCK)

### Activer le mode MOCK

1. Créez `.env` à la racine :
```
VITE_USE_MOCK_API=true
```

2. Redémarrez : `npm run dev`

### Utilisateurs de test MOCK

- **Admin** : `admin` / `admin`
- **User** : `user1` / `password`

### Ce qui est mocké

✅ Tous les endpoints listés ci-dessus
✅ Données réalistes (utilisateurs, rôles, permissions, etc.)
✅ Logique de vérification d'accès basique
✅ Délai réseau simulé (500ms)

## 🔍 Où sont les appels dans le code ?

| Appel API | Fichier | Ligne approximative |
|-----------|---------|---------------------|
| `POST /auth/login` | `src/context/AuthContext.jsx` | ~35 |
| `POST /access/check` | `src/components/ProtectedRoute.jsx` | ~31 |
| `GET /users` | `src/pages/Users.jsx` | ~25 |
| `GET /roles` | `src/pages/Roles.jsx` | ~21 |
| `GET /permissions` | `src/pages/Permissions.jsx` | ~19 |
| `GET /resources` | `src/pages/Resources.jsx` | ~21 |
| `GET /ips` | `src/pages/IPs.jsx` | ~21 |
| `GET /access-attempts` | `src/pages/AccessAttempts.jsx` | ~27 |

## ⚙️ Configuration du backend

Quand le backend sera prêt, il doit écouter sur :
- **URL** : `http://localhost:8000`
- **Endpoints** : Tous les endpoints listés ci-dessus (sans le préfixe `/api`)

Le proxy Vite s'occupe de rediriger `/api/*` vers `http://localhost:8000/*`

## 🎯 Checklist pour votre collègue backend

Voici ce que le backend doit implémenter :

- [ ] `POST /auth/login` - Authentification
- [ ] `POST /access/check` - Vérification d'accès (cœur du système)
- [ ] `GET /users` - Liste utilisateurs
- [ ] `POST /users` - Créer utilisateur
- [ ] `PUT /users/:id` - Modifier utilisateur
- [ ] `DELETE /users/:id` - Supprimer utilisateur
- [ ] `GET /roles` - Liste rôles
- [ ] `POST /roles` - Créer rôle
- [ ] `PUT /roles/:id` - Modifier rôle
- [ ] `DELETE /roles/:id` - Supprimer rôle
- [ ] `GET /permissions` - Liste permissions
- [ ] `POST /permissions` - Créer permission
- [ ] `PUT /permissions/:id` - Modifier permission
- [ ] `DELETE /permissions/:id` - Supprimer permission
- [ ] `GET /resources` - Liste ressources
- [ ] `POST /resources` - Créer ressource
- [ ] `PUT /resources/:id` - Modifier ressource
- [ ] `DELETE /resources/:id` - Supprimer ressource
- [ ] `GET /ips` - Liste IP
- [ ] `POST /ips` - Créer IP
- [ ] `PUT /ips/:id` - Modifier IP
- [ ] `DELETE /ips/:id` - Supprimer IP
- [ ] `GET /access-attempts` - Liste tentatives d'accès

