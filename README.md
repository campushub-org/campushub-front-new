# 🎓 CampusHub - Front-end Next-Gen

[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Vite](https://img.shields.io/badge/Vite-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)

> **CampusHub** est une plateforme de gestion académique moderne conçue comme une application SaaS (Software as a Service) haute performance. Elle offre une expérience utilisateur fluide pour les étudiants, les enseignants, les doyens et les administrateurs.

---

## ✨ Points Forts de l'Interface

CampusHub a été repensé pour s'éloigner des designs e-commerce classiques et adopter une esthétique **SaaS/Admin** professionnelle inspirée des meilleurs outils du marché (Linear, Vercel, Notion).

### 🖥️ Expérience SaaS Moderne
- **Sidebar Adaptive** : Une navigation latérale intelligente et rétractable qui maximise l'espace de travail.
- **Command Palette (`⌘K`)** : Un menu de recherche globale pour naviguer et exécuter des actions à la vitesse de la lumière.
- **Dark Mode Natif** : Une interface reposante pour les yeux, entièrement personnalisable via le profil utilisateur.
*   **Drawers & Sheets** : Finis les changements de page inutiles. Les actions de gestion s'ouvrent dans des panneaux latéraux fluides.

### 📊 Tableaux de Bord Intelligents
- **Enseignants** : Suivi des supports de cours, agenda dynamique et outils de dépôt rapide.
- **Étudiants** : Vue d'ensemble de la progression, emploi du temps et accès aux ressources pédagogiques.
- **Doyens** : Console de supervision, validation des documents et statistiques académiques.
- **Admin** : Monitoring des microservices et gestion des ressources système.

---

## 🛠️ Stack Technique

- **Core :** React 18 + TypeScript (Typage fort pour une stabilité maximale)
- **Styling :** Tailwind CSS + Shadcn/UI (Design System atomique)
- **État & API :** TanStack Query (React Query) + Axios
- **Icônes :** Lucide React (Icônes vectorielles épurées)
- **Animations :** Tailwind Animate + Framer Motion (Transitions fluides)
- **Build Tool :** Vite (HMR ultra-rapide)

---

## 🚀 Installation & Démarrage

### Prérequis
- Node.js (v18+)
- npm ou bun

### Étapes
1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd campushub-front-new
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de l'environnement**
   Créez un fichier `.env` à la racine :
   ```env
   VITE_API_URL=http://<SERVER_IP>:8080
   VITE_CLOUDINARY_CLOUD_NAME=your_name
   VITE_CLOUDINARY_UPLOAD_PRESET=your_preset
   ```

4. **Lancer le serveur de développement**
   ```bash
   npm run dev
   ```

---

## 📁 Architecture du Projet

```text
src/
├── components/       # Composants atomiques et widgets
│   ├── dashboard/    # Composants spécifiques au Dashboard
│   ├── ui/           # Design System (Shadcn)
│   └── ThemeProvider # Gestion du Dark Mode
├── hooks/            # Hooks React personnalisés
├── lib/              # Utilitaires (API, Auth, Utils)
├── pages/            # Vues principales de l'application
│   ├── dashboard/    # Pages par rôles (Teacher, Student...)
│   └── Index.tsx     # Landing Page
└── App.tsx           # Router et Providers
```

---

## 🎨 Design System

Le projet utilise un système de variables CSS (`hsl`) pour permettre le changement de thème dynamique.
- **Couleurs Sobres** : Palette de gris `slate` et `zinc` pour minimiser la fatigue visuelle.
- **Densité Optimisée** : Utilisation de `text-sm` par défaut pour afficher plus de données sans encombrer l'écran.
- **Skeletons** : Chargement élégant simulant la structure des données.

---

## 📝 Licence

Distribué sous la licence MIT. Voir `LICENSE` pour plus d'informations.

---
<p align="center">Fait avec ❤️ pour CampusHub</p>
