# 🚀 Guide Rapide d'Utilisation

## ⚡ Démarrage en 30 secondes

### 1. Activer le mode MOCK

Créez un fichier `.env` à la racine du projet :
```bash
VITE_USE_MOCK_API=true
```

### 2. Démarrer l'application

```bash
cd d:/gestion-access
npm run dev
```

L'application sera sur : **http://localhost:3000**

---

## 🔑 Identifiants de connexion

### 👤 Administrateur (ADMIN)
```
Username: admin
(Pas de mot de passe - projet pédagogique)
```
**Accès :** Toutes les pages (y compris pages ADMIN)

### 👤 Utilisateur standard (USER)
```
Username: user1
(Pas de mot de passe - projet pédagogique)
```
**Accès :** Dashboard, Profile, Home uniquement (pas les pages ADMIN)

---

## 📋 Données disponibles dans le MOCK

### Utilisateurs
- **admin** (ADMIN) - Peut tout faire
- **user1** (USER) - Accès limité

### Rôles
- **ADMIN** - Avec permissions READ_USERS, WRITE_USERS, READ_ROLES, WRITE_ROLES
- **USER** - Avec permission READ_DASHBOARD uniquement

### Permissions
- READ_USERS
- WRITE_USERS
- READ_ROLES
- WRITE_ROLES
- READ_DASHBOARD

### Ressources
- `/dashboard` (nécessite READ_DASHBOARD)
- `/users` (nécessite READ_USERS)
- `/roles` (nécessite READ_ROLES)

### Adresses IP
- `192.168.1.1` (admin, normale)
- `10.0.0.1` (user1, **SUSPICIOUS** ⚠️)

### Tentatives d'accès
- Quelques exemples pré-chargés (AUTHORIZED, REFUSED)

---

## 🎯 Scénarios de test rapides

### Test 1 : Connexion Admin
1. Aller sur http://localhost:3000/login
2. Username: `admin` (pas de mot de passe)
3. Cliquez sur "Se connecter"
4. ✅ Vous êtes connecté, menu complet visible

### Test 2 : Navigation Admin
1. Connecté en tant qu'admin
2. Cliquez sur "Utilisateurs" → Voir la liste
3. Cliquez sur "Rôles" → Voir la liste
4. Cliquez sur "Tentatives d'accès" → Voir les exemples
5. ✅ Toutes les pages ADMIN accessibles

### Test 3 : Connexion User
1. Déconnectez-vous
2. Reconnectez-vous avec `user1` (pas de mot de passe)
3. Menu réduit (pas de section Administration)
4. ✅ Seules les pages publiques accessibles

### Test 4 : Accès refusé
1. Connecté en tant que `user1`
2. Essayez d'aller sur http://localhost:3000/users
3. ✅ Redirection vers `/forbidden`

### Test 5 : Accès suspect
1. Connecté en tant que `user1` (IP suspecte dans le mock)
2. Naviguez vers `/dashboard`
3. ✅ Warning jaune "SUSPICIOUS" affiché en haut

---

## 📍 Pages disponibles

### Accessibles à tous (connectés)
- `/` - Accueil
- `/dashboard` - Tableau de bord
- `/profile` - Mon profil
- `/graph` - Visualisation Neo4j

### ADMIN uniquement
- `/users` - Gestion utilisateurs
- `/roles` - Gestion rôles
- `/permissions` - Gestion permissions
- `/resources` - Gestion ressources
- `/ips` - Gestion IP
- `/access-attempts` - Tentatives d'accès

### Spéciales
- `/login` - Connexion
- `/forbidden` - Accès refusé

---

## ⚠️ Notes importantes

1. **Mode MOCK = Données non persistantes**
   - Les modifications (créer/modifier/supprimer) sont simulées
   - Recharger la page = reset des données

2. **Pour tester les CRUD**
   - Connectez-vous en tant qu'admin
   - Allez sur `/users`, `/roles`, etc.
   - Cliquez sur "+ Nouvel..." pour créer
   - Modifier/Supprimer fonctionne (simulé)

3. **Vérification d'accès automatique**
   - Chaque navigation appelle automatiquement `/access/check`
   - Le statut s'affiche (AUTHORIZED/REFUSED/SUSPICIOUS)

---

## 🔄 Désactiver le MOCK (quand backend prêt)

Dans `.env` :
```bash
VITE_USE_MOCK_API=false
```

Puis redémarrer : `npm run dev`

---

## ✅ Checklist de test

- [ ] Connexion admin fonctionne
- [ ] Connexion user fonctionne
- [ ] Erreur de connexion affichée (mauvais password)
- [ ] Menu admin complet visible
- [ ] Menu user réduit visible
- [ ] Navigation entre pages
- [ ] Pages ADMIN accessibles pour admin
- [ ] Pages ADMIN refusées pour user
- [ ] Warning SUSPICIOUS affiché
- [ ] CRUD sur pages ADMIN (simulé)
- [ ] Déconnexion fonctionne

**C'est tout ! Vous pouvez maintenant tester votre frontend ! 🎉**

