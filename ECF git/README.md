# 🎮 ESPORTIFY - Plateforme E-Sport

## 📋 À propos

Esportify est une plateforme innovante dédiée à l'organisation et à la gestion d'événements e-sport. Elle permet aux joueurs de s'inscrire à des tournois, aux organisateurs de créer des événements, et aux administrateurs de modérer la plateforme.

## ✨ Fonctionnalités

### Pour les visiteurs
- 🏠 Page d'accueil avec présentation de l'entreprise
- 📸 Galerie d'images des événements
- 🎯 Visualisation des événements à venir
- 🔍 Recherche et filtrage d'événements

### Pour les joueurs
- ✅ Inscription et connexion sécurisées
- 📝 Inscription aux événements
- 👥 Visualisation des participants
- 💬 Chat en temps réel (MongoDB)
- 📊 Historique de participation

### Pour les organisateurs
- 🎪 Création d'événements
- ✏️ Modification d'événements
- 👥 Gestion des participants
- 🚀 Démarrage d'événements (30 min avant)
- 📊 Tableau de bord

### Pour les administrateurs
- ✅ Validation des événements
- 👤 Gestion des utilisateurs
- 🛡️ Modération de la plateforme
- 📊 Statistiques globales

## 🚀 Installation

### Prérequis

- **Serveur local**: XAMPP, WAMP, ou MAMP
- **PHP**: Version 7.4 ou supérieure
- **MySQL**: Pour la base de données relationnelle
- **MongoDB**: Pour les messages (optionnel)
- **Navigateur moderne**: Chrome, Firefox, Edge, Safari

### Étape 1: Installer le serveur local

#### XAMPP (recommandé)
1. Téléchargez XAMPP depuis https://www.apachefriends.org/
2. Installez XAMPP
3. Démarrez Apache et MySQL depuis le panneau de contrôle XAMPP


### Étape 2: Copier les fichiers

```bash
# Copier le dossier esportify-xampp dans le répertoire web

# Pour XAMPP (Windows)
Copier vers: C:\xampp\htdocs\esportify\

# Pour XAMPP (Mac/Linux)
Copier vers: /opt/lampp/htdocs/esportify/

# Pour WAMP
Copier vers: C:\wamp64\www\esportify\
```

### Étape 3: Configurer la base de données

1. Ouvrez phpMyAdmin: http://localhost/phpmyadmin
2. Créez une nouvelle base de données nommée `esportify`
3. Importez le fichier SQL : `esportify.sql`



### Étape 4: Configurer l'API

Modifiez le fichier `js/config.js` si nécessaire:

```javascript
const API_CONFIG = {
    BASE_URL: 'http://localhost/esportify/api',
    // ...
};
```

Vérifiez la configuration de la base de données dans `api/database.php`:

```php
define('DB_HOST', 'localhost');
define('DB_NAME', 'esportify');
define('DB_USER', 'root');
define('DB_PASS', '');
```

### Étape 5: Lancer l'application

1. Assurez-vous qu'Apache et MySQL sont démarrés
2. Ouvrez votre navigateur
3. Accédez à: http://localhost/esportify-xampp/index.html

## 👤 Comptes de test

### Joueur
- Email: `player4@esportify.com`
- Mot de passe: `test123`

### Organisateur
- Email: `organizer2@esportify.com`
- Mot de passe: `test123`

### Administrateur
- Email: `admin@esportify.com`
- Mot de passe: `test123`

```

### Activer MongoDB (pour les messages)

1. Installez MongoDB: https://www.mongodb.com/try/download/community
2. Démarrez MongoDB
3. Vérifiez la connexion dans `api/Message.php`


🎮 Bon gaming ! 🚀
