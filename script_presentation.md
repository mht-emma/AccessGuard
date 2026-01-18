# Script de Présentation : ACCESS GUARD (NoSQL Security)

Ce document sert de fil conducteur pour votre vidéo de présentation. Chaque section correspond à une page de l'application avec les points clés à démontrer.

---

## 🎬 Introduction (Landing Page - Home)
**URL : `/`**

**Action :** Parcourir la page d'accueil publique en scrollant doucement.
**Narratif :**
> "Bonjour à tous. Voici **Access Guard**, un système de gestion d'accès et de monitoring de sécurité basé sur une architecture NoSQL avec **Neo4j**. Notre objectif était de créer un 'Command Center' robuste pour sécuriser des ressources sensibles. La page d'accueil présente notre vision : une sécurité granulaire, intelligente et visuelle."

---

## 🔐 Connexion (Login)
**URL : `/login`**

**Action :** Entrer les identifiants de l'administrateur (`admin1`).
**Narratif :**
> "Connectons-nous avec un compte administrateur. Le système utilise un moteur de décision d'accès qui vérifie non seulement les identifiants, mais aussi l'intégrité de l'IP du client dès cette étape."

---

## 📊 Le Command Center (Dashboard)
**URL : `/dashboard`**

**Action :** Pointer les cartes de statistiques (Identités, Ressources, Intrusions) et le score de sécurité.
**Narratif :**
> "Une fois connectés, nous arrivons sur le **Command Center**. C'est ici que tout se joue. Grâce à la rapidité des requêtes Cypher de Neo4j, nous affichons en temps réel :
> * Le nombre total d'identités et de ressources protégées.
> * L'activité des dernières 24h.
> * Et surtout le nombre d'intrusions bloquées.
> On peut aussi voir l'état de santé direct de la base de données et de notre moteur de sécurité."

---

## 👥 Gestion des Identités (Utilisateurs)
**URL : `/users`**

**Action :** Montrer la liste des utilisateurs, simuler l'ajout d'un nouvel utilisateur ou l'édition d'un rôle.
**Narratif :**
> "Dans l'onglet Utilisateurs, nous gérons notre annuaire. Chaque utilisateur est un nœud dans notre graphe NoSQL. Nous pouvons leur assigner des rôles dynamiquement, ce qui mettra immédiatement à jour leurs permissions sans redémarrage du serveur."

---

## 🛠️ Architecture RBAC (Rôles & Permissions)
**URL : `/roles` et `/permissions`**

**Action :** Passer rapidement de la page Rôles à la page Permissions.
**Narratif :**
> "Le cœur du système repose sur le format **RBAC** (Role-Based Access Control). 
> * Les **Rôles** regroupent des capacités métier.
> * Les **Permissions** sont des actions atomiques (ex: READ_USERS, WRITE_IPS). 
> Cette structure en graphe permet de vérifier une permission complexe en quelques millisecondes, même avec des milliers de nœuds."

---

## 🛡️ Gestion des IPs (IPs)
**URL : `/ips`**

**Action :** Montrer la liste des IPs, pointer les statuts (TRUSTED, SUSPICIOUS, BLOCKED).
**Narratif :**
> "Le module IP est l'une de nos fonctionnalités phares. Le système détecte automatiquement si un utilisateur se connecte depuis une nouvelle IP. Si c'est le cas, elle est marquée comme 'Suspicious' jusqu'à validation humaine. Nous pouvons aussi bannir définitivement une IP en un clic."

---

## 📜 Historique & Audit (Tentatives)
**URL : `/access-attempts`**

**Action :** Filtrer ou scroller dans la liste des accès (AUTHORIZED / DENIED).
**Narratif :**
> "Chaque tentative d'accès à une ressource protégée est logguée. Nous voyons qui a tenté d'accéder à quoi, quand, et depuis quelle adresse. C'est un audit complet indispensable pour la conformité et la détection d'intrusions."

---

## 🕸️ Visualisation du Graphe (Visualisation)
**URL : `/graph`**

**Action :** Faire bouger les nœuds du graphe, zoomer sur une relation entre un Utilisateur et une Permission.
**Narratif :**
> "Enfin, la puissance de Neo4j prend tout son sens ici. Nous visualisons physiquement notre structure de sécurité. Les relations entre utilisateurs, rôles, permissions et ressources ne sont plus des lignes dans une table, mais les liens d'un organisme vivant. On peut voir d'un coup d'œil quel utilisateur a accès à quel service."

---

## 🏁 Conclusion
**Action :** Revenir sur le Dashboard.
**Narratif :**
> "En conclusion, Access Guard transforme une base NoSQL en un bouclier actif. Entre performance, visibilité et design premium, nous offrons un outil de contrôle total sur la cybersécurité applicative. Merci pour votre attention."
