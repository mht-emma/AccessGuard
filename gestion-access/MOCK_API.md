# 🧪 Guide d'utilisation du Mode MOCK API

## Pourquoi utiliser le mode MOCK ?

Le mode MOCK permet de tester le frontend **sans avoir besoin du backend**. C'est parfait pour :
- Développer et tester l'interface utilisateur
- Vérifier que tous les composants fonctionnent
- Tester les différents scénarios (ADMIN, USER, accès refusé, etc.)
- Développer en parallèle avec votre collègue backend

## 🚀 Comment activer le mode MOCK

### Méthode 1 : Variable d'environnement (recommandé)

1. Créez un fichier `.env` à la racine du projet :
```bash
VITE_USE_MOCK_API=true
```

2. Redémarrez le serveur de développement :
```bash
npm run dev
```

### Méthode 2 : Modification directe du code

Dans `src/services/api.js`, changez :
```javascript
const USE_MOCK_API = true  // au lieu de false
```

## 📋 Données mockées disponibles

### Utilisateurs de test

**Admin :**
- Username: `admin`
- Password: `admin`
- Rôle: ADMIN
- Accès: Toutes les pages

**Utilisateur standard :**
- Username: `user1`
- Password: `password`
- Rôle: USER
- Accès: Dashboard, Profile, Home uniquement

### Endpoints mockés

Tous les endpoints sont mockés :
- ✅ `POST /auth/login` - Connexion
- ✅ `POST /access/check` - Vérification d'accès
- ✅ `GET /users` - Liste des utilisateurs
- ✅ `GET /roles` - Liste des rôles
- ✅ `GET /permissions` - Liste des permissions
- ✅ `GET /resources` - Liste des ressources
- ✅ `GET /ips` - Liste des IP
- ✅ `GET /access-attempts` - Tentatives d'accès
- ✅ `POST /users`, `/roles`, `/permissions`, etc. - Création
- ✅ `PUT /users/:id`, etc. - Modification
- ✅ `DELETE /users/:id`, etc. - Suppression

## 🧪 Scénarios de test

### Test 1 : Connexion Admin
1. Aller sur `/login`
2. Username: `admin`
3. Password: `admin`
4. Vous devriez être connecté et voir toutes les pages ADMIN

### Test 2 : Connexion User
1. Aller sur `/login`
2. Username: `user1`
3. Password: `password`
4. Vous devriez être connecté mais les pages ADMIN redirigent vers `/forbidden`

### Test 3 : Accès refusé
1. Se connecter en tant que `user1`
2. Essayer d'accéder à `/users`
3. Vous devriez être redirigé vers `/forbidden`

### Test 4 : Accès suspect
- Les IP suspectes sont simulées dans les données mockées
- L'accès suspect s'affiche avec un warning jaune

## ⚠️ Limitations du mode MOCK

- Les données ne sont **pas persistées** (rechargement = reset)
- Les modifications (création/modification/suppression) sont simulées mais ne sont pas sauvegardées
- Les tentatives d'accès sont statiques (pré-définies)
- Pas de vraie vérification de sécurité

## 🔄 Basculer vers le vrai backend

Quand le backend de votre collègue est prêt :

1. Désactivez le mode MOCK :
```bash
# Dans .env
VITE_USE_MOCK_API=false
```

2. Assurez-vous que le backend tourne sur `http://localhost:8000`

3. Redémarrez le serveur frontend :
```bash
npm run dev
```

## 📝 Modifier les données mockées

Les données mockées sont dans `src/services/mockApi.js`. Vous pouvez :
- Ajouter des utilisateurs
- Modifier les rôles et permissions
- Ajouter des ressources
- Simuler différents scénarios

## 🎯 Checklist de test frontend

Avec le mode MOCK, vous pouvez tester :

- [ ] Page de login fonctionne
- [ ] Connexion admin réussie
- [ ] Connexion user réussie
- [ ] Erreur de connexion affichée
- [ ] Navigation entre les pages
- [ ] Menu dynamique selon le rôle
- [ ] Pages ADMIN accessibles uniquement pour ADMIN
- [ ] Redirection vers /forbidden pour USER sur pages ADMIN
- [ ] Affichage des statuts (AUTHORIZED, REFUSED, SUSPICIOUS)
- [ ] CRUD sur toutes les pages ADMIN
- [ ] Affichage des tentatives d'accès
- [ ] Déconnexion fonctionne

