# Application de Gestion des Accès - IAM/RBAC

Application React frontend pour la gestion des accès basée sur les rôles et permissions (RBAC), connectée à une base de données Neo4j.

## 🎯 Fonctionnalités

- **Gestion des utilisateurs** : CRUD complet des utilisateurs
- **Gestion des rôles** : Création et modification des rôles avec association de permissions
- **Gestion des permissions** : Définition des permissions (READ_X, WRITE_Y, etc.)
- **Gestion des ressources** : Association des ressources protégées aux permissions
- **Gestion des IP** : Suivi des adresses IP et détection des IP suspectes
- **Tentatives d'accès** : Visualisation de toutes les tentatives d'accès avec statuts (AUTHORIZED, REFUSED, SUSPICIOUS)
- **Contrôle d'accès automatique** : Chaque navigation vérifie automatiquement les permissions via le backend

## 🚀 Installation

1. Installer les dépendances :
```bash
npm install
```

2. Démarrer le serveur de développement :
```bash
npm run dev
```

L'application sera accessible sur `http://localhost:3000`

## 🔧 Configuration

### Fichier `.env`

Créez un fichier `.env` à la racine du projet :

```env
# Mode MOCK : true pour tester sans backend, false pour utiliser le vrai backend
VITE_USE_MOCK_API=false

# URL du backend (optionnel, par défaut utilise le proxy Vite)
# VITE_API_URL=http://localhost:8000
```

Le projet utilise Vite comme bundler. La configuration du proxy pour l'API backend se trouve dans `vite.config.js`.

Par défaut, le proxy redirige les requêtes `/api/*` vers `http://localhost:8000`.

## 📁 Structure du projet

```
src/
  ├── components/          # Composants réutilisables
  │   ├── Layout.jsx      # Layout principal avec menu
  │   ├── Menu.jsx        # Menu de navigation
  │   ├── ProtectedRoute.jsx  # Guard de routes
  │   └── StatusBadge.jsx     # Badge de statut d'accès
  ├── context/
  │   └── AuthContext.jsx     # Contexte d'authentification
  ├── pages/              # Pages de l'application
  │   ├── Login.jsx
  │   ├── Home.jsx
  │   ├── Dashboard.jsx
  │   ├── Profile.jsx
  │   ├── Users.jsx        # ADMIN uniquement
  │   ├── Roles.jsx        # ADMIN uniquement
  │   ├── Permissions.jsx  # ADMIN uniquement
  │   ├── Resources.jsx    # ADMIN uniquement
  │   ├── IPs.jsx          # ADMIN uniquement
  │   ├── AccessAttempts.jsx  # ADMIN uniquement
  │   ├── Graph.jsx
  │   └── Forbidden.jsx
  ├── services/
  │   └── api.js           # Configuration Axios
  ├── App.jsx              # Composant racine avec routes
  └── main.jsx             # Point d'entrée
```

## 🔐 Système d'authentification

- **Connexion** : Formulaire classique avec nom d'utilisateur et mot de passe
- **Vérification backend** : Le backend vérifie les credentials via `POST /auth/login`
- **Session** : Stockée dans localStorage et gérée via Context API
- **Protection des routes** : Le composant `ProtectedRoute` vérifie automatiquement l'accès à chaque ressource

## 🛡️ Contrôle d'accès

Chaque page est une **ressource protégée**. Lors de la navigation :

1. Le frontend appelle `POST /api/access/check` avec :
   - L'ID de l'utilisateur
   - Le chemin de la ressource (route)
   - L'adresse IP (récupérée automatiquement)

2. Le backend décide :
   - **AUTHORIZED** : La page s'affiche normalement
   - **REFUSED** : Redirection vers `/forbidden`
   - **SUSPICIOUS** : La page s'affiche avec un warning visuel

3. Une `AccessAttempt` est automatiquement créée dans Neo4j

## 👥 Rôles

- **ADMIN** : Accès complet à toutes les fonctionnalités de gestion
- **USER/GUEST** : Accès limité aux pages publiques (Dashboard, Profile, Home)

## 🧪 Mode MOCK pour tester sans backend

Le projet inclut un système de **MOCK API** pour tester le frontend sans attendre le backend.

**Pour activer le mode MOCK :**
1. Créez un fichier `.env` avec : `VITE_USE_MOCK_API=true`
2. Redémarrez le serveur : `npm run dev`

**Utilisateurs de test MOCK :**
- Admin : `admin` / `admin`
- User : `user1` / `password`

📖 Voir `MOCK_API.md` pour plus de détails.

## 📡 API Backend attendue

L'application s'attend à ce que le backend expose les endpoints suivants :

- `GET /users` - Liste des utilisateurs
- `GET /users/:id` - Détails d'un utilisateur
- `POST /users` - Créer un utilisateur
- `PUT /users/:id` - Modifier un utilisateur
- `DELETE /users/:id` - Supprimer un utilisateur
- `GET /roles` - Liste des rôles
- `POST /roles` - Créer un rôle
- `PUT /roles/:id` - Modifier un rôle
- `DELETE /roles/:id` - Supprimer un rôle
- `GET /permissions` - Liste des permissions
- `POST /permissions` - Créer une permission
- `PUT /permissions/:id` - Modifier une permission
- `DELETE /permissions/:id` - Supprimer une permission
- `GET /resources` - Liste des ressources
- `POST /resources` - Créer une ressource
- `PUT /resources/:id` - Modifier une ressource
- `DELETE /resources/:id` - Supprimer une ressource
- `GET /ips` - Liste des adresses IP
- `POST /ips` - Créer une adresse IP
- `PUT /ips/:id` - Modifier une adresse IP
- `DELETE /ips/:id` - Supprimer une adresse IP
- `GET /access-attempts` - Liste des tentatives d'accès
- `POST /access/check` - Vérifier l'accès à une ressource
- `POST /auth/login` - Authentification (username, password) - Retourne les données de l'utilisateur

## 🎨 Technologies utilisées

- React 18
- React Router v6
- Axios
- Vite
- Context API

## 📝 Notes

- Ce projet est à but pédagogique
- Le système de contrôle d'accès est géré entièrement par le backend
- Toutes les tentatives d'accès sont enregistrées dans Neo4j
- L'application ne simule pas les accès, elle les vérifie réellement à chaque navigation

## ✨ Améliorations Récentes

L'application a été améliorée avec :
- ✅ Gestion d'erreurs centralisée avec intercepteurs Axios
- ✅ Messages d'erreur utilisateur clairs et informatifs
- ✅ Redirection automatique en cas de session expirée
- ✅ Vérification d'accès simplifiée et plus robuste
- ✅ Login préparé pour l'ajout du password (structure flexible)
- ✅ Configuration backend prête avec variables d'environnement

📖 Voir `AMELIORATIONS.md` pour plus de détails sur les améliorations.

