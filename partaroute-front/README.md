# 🚗 Partaroute Front – Interface moderne de covoiturage

**Partaroute Front** est l’interface utilisateur de la plateforme de covoiturage Partaroute. Elle permet aux conducteurs et passagers de gérer leurs trajets, réservations, notifications et profils, le tout dans une expérience fluide et responsive.

---

## 📦 Fonctionnalités principales

- 🔐 Authentification avec rôles (`user`, `admin`)
- 🧑‍💼 Gestion du profil utilisateur (édition, photo de profil)
- 📍 Création, réservation et gestion de trajets
- 🔎 Recherche de trajets avec filtres
- 🗓️ Visualisation des réservations et trajets en tant que conducteur ou passager
- 🛎️ Système de notifications (avec compteur de non-lues)
- 📊 Dashboard administrateur (modération, gestion des utilisateurs et trajets)
- 🖼️ Upload de photo de profil (intégration backend)
- 📱 Interface responsive et navigation mobile-friendly
- ☁️ Déploiement sur Vercel

---

## 🧰 Stack technique (Frontend)

- React.js (Vite)
- React Router
- Context API (ou Redux) pour la gestion d'état global
- Material UI (ou composants personnalisés)
- Axios ou Fetch API pour la communication avec le backend
- CSS Modules / CSS-in-JS
- Déploiement sur Vercel

---

## 🗃️ Structure du projet (Frontend)

```
partaroute-front/
├── public/
│   └── vite.svg
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── BottomNav.jsx
│   │   ├── EditTripModal.jsx
│   │   ├── Header.jsx
│   │   ├── HomeCard.jsx
│   │   ├── PaginationMUI.jsx
│   │   ├── ProfilePhotoUploader.jsx
│   │   ├── TripCard.jsx
│   │   ├── TripCardList.jsx
│   │   └── TripForm.jsx
│   ├── pages/
│   │   ├── AdminDashboard.jsx
│   │   ├── AdminPanel.jsx
│   │   ├── AdminReservations.jsx
│   │   ├── AdminTrips.jsx
│   │   ├── HomePage.jsx
│   │   ├── Login.jsx
│   │   ├── MyDriverTrips.jsx
│   │   ├── MyProfile.jsx
│   │   ├── MyTrips.jsx
│   │   ├── NotFound.jsx
│   │   ├── Notifications.jsx
│   │   ├── Register.jsx
│   │   └── TripDetails.jsx
│   ├── routes/
│   │   ├── AppRouter.jsx
│   │   └── ProtectedRoute.jsx
│   ├── App.jsx
│   ├── App.css
│   ├── index.css
│   └── main.jsx
├── package.json
├── vite.config.js
└── README.md
```

---

## 🚀 Lancer le frontend en local

### Prérequis

- Node.js (>= 18)
- npm ou yarn

### Installation & lancement

```bash
cd partaroute-front
npm install
npm run dev
```

L'application sera accessible sur [http://localhost:5173](http://localhost:5173) (ou le port affiché dans le terminal).

---

## �� Configuration de l'API

- Par défaut, le frontend communique avec le backend via des appels HTTP.
- **Pense à configurer l'URL de l'API** (variable d'environnement `.env`, ou directement dans le code) pour pointer vers le backend déployé (ex: `https://parta-route-back.vercel.app`).
- Pour l'upload de photo, assure-toi que le backend accepte bien les requêtes CORS depuis le domaine du front.

---

## 📁 Gestion des fichiers uploadés (photos de profil)

- L'upload de photo de profil s'effectue via le backend.
- En local, les fichiers sont stockés sur le serveur backend.
- Sur Vercel, le backend stocke temporairement les fichiers dans `/tmp` (voir README backend pour les limitations).
- **Pour une persistance réelle, il est recommandé d'utiliser un service cloud (ex : AWS S3, Cloudinary, etc.).**

---

## 📌 Roadmap

- [X] Authentification et gestion de session
- [X] Réservation et création de trajets
- [X] Dashboard administrateur
- [X] Système de notifications avec compteur
- [X] Upload de photo de profil
- [X] Déploiement frontend sur Vercel
- [ ] Carte interactive (Leaflet, Google Maps…)
- [ ] Paiement en ligne
- [ ] Gestion avancée des notifications (temps réel, emails…)
- [ ] Amélioration de l'accessibilité et du responsive

---

## 🤝 Contribution

Les contributions sont les bienvenues !

```bash
# Étapes recommandées
1. Fork le projet
2. Crée une branche (`git checkout -b feature/NouvelleFonction`)
3. Commit tes changements (`git commit -m 'Ajoute ma fonctionnalité'`)
4. Push ta branche (`git push origin feature/NouvelleFonction`)
5. Crée une Pull Request
```

---

## ✨ À propos

Projet développé dans un objectif pédagogique.  
Partaroute vise à offrir une plateforme simple et efficace pour le covoiturage, à la fois pour les utilisateurs et les administrateurs.
