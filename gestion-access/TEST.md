# Guide de Test Rapide

## ✅ Vérifications effectuées

- ✅ 36 fichiers créés et présents
- ✅ Dépendances installées (139 packages)
- ✅ Build réussi sans erreurs
- ✅ Structure complète du projet

## 🚀 Pour démarrer l'application

```bash
cd d:/gestion-access
npm run dev
```

L'application sera accessible sur : **http://localhost:3000**

## ⚠️ Important avant de tester

1. **Backend requis** : Le backend doit être démarré sur `http://localhost:8000`
2. **Endpoints API attendus** : Voir le README.md pour la liste complète
3. **Base Neo4j** : Doit être configurée avec les entités (User, Role, Permission, Resource, IP, AccessAttempt)

## 🧪 Tests à effectuer

### 1. Test de connexion
- Ouvrir http://localhost:3000
- Vérifier que la page de login s'affiche
- Sélectionner un utilisateur et se connecter

### 2. Test de navigation
- Naviguer vers différentes pages
- Vérifier que chaque navigation appelle l'API `/access/check`
- Vérifier les statuts (AUTHORIZED, REFUSED, SUSPICIOUS)

### 3. Test des pages ADMIN
- Se connecter avec un utilisateur ADMIN
- Vérifier l'accès aux pages de gestion :
  - `/users`
  - `/roles`
  - `/permissions`
  - `/resources`
  - `/ips`
  - `/access-attempts`

### 4. Test des pages USER
- Se connecter avec un utilisateur USER
- Vérifier que les pages ADMIN sont inaccessibles
- Vérifier l'accès aux pages publiques :
  - `/dashboard`
  - `/profile`
  - `/`

## 📊 Structure des fichiers

```
d:/gestion-access/
├── src/
│   ├── components/      (7 fichiers)
│   ├── context/         (1 fichier)
│   ├── pages/           (20 fichiers)
│   ├── services/        (1 fichier)
│   ├── App.jsx
│   ├── main.jsx
│   └── index.css
├── package.json
├── vite.config.js
├── index.html
├── README.md
└── .gitignore
```

**Total : 36 fichiers**

