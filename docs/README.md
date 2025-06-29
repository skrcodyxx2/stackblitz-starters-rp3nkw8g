# Dounie Cuisine Pro - Documentation

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Architecture](#architecture)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Fonctionnalités](#fonctionnalités)
6. [API et Base de Données](#api-et-base-de-données)
7. [Déploiement](#déploiement)
8. [Maintenance](#maintenance)

## 🎯 Vue d'ensemble

Dounie Cuisine Pro est une application web complète pour un service traiteur haïtien premium. L'application permet la gestion des commandes, réservations, menu, clients et administration complète de l'entreprise.

### Technologies Utilisées

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Base de données**: Supabase (PostgreSQL)
- **Authentification**: Supabase Auth
- **Icônes**: Lucide React
- **Formulaires**: React Hook Form + Zod
- **Notifications**: React Hot Toast
- **Animations**: Framer Motion

### Fonctionnalités Principales

- 🏠 Site vitrine public avec menu et services
- 👥 Système d'authentification multi-rôles
- 📊 Tableau de bord administrateur
- 🛒 Gestion des commandes et réservations
- 🍽️ Gestion du menu et des catégories
- 👤 Espace client personnalisé
- 📱 Design responsive et moderne

## 🏗️ Architecture

### Structure du Projet

```
src/
├── components/          # Composants réutilisables
│   ├── admin/          # Composants spécifiques admin
│   ├── auth/           # Composants d'authentification
│   ├── client/         # Composants spécifiques client
│   └── common/         # Composants partagés
├── contexts/           # Contextes React
├── hooks/              # Hooks personnalisés
├── lib/                # Configuration des librairies
├── pages/              # Pages de l'application
│   ├── admin/          # Pages administrateur
│   ├── auth/           # Pages d'authentification
│   ├── client/         # Pages client
│   └── public/         # Pages publiques
├── types/              # Types TypeScript
└── utils/              # Utilitaires et helpers
```

### Composants Principaux

#### Layouts
- `AdminLayout`: Layout pour les pages d'administration
- `ClientLayout`: Layout pour l'espace client
- `Header/Footer`: Composants de navigation publique

#### Contextes
- `AuthContext`: Gestion de l'authentification et des profils utilisateur

#### Hooks Personnalisés
- `useMenuData`: Récupération et gestion des données du menu
- `useAuth`: Hook d'authentification (via contexte)

## 🚀 Installation

### Prérequis

- Node.js 18+ 
- npm ou yarn
- Compte Supabase

### Étapes d'Installation

1. **Cloner le repository**
```bash
git clone [repository-url]
cd dounie-cuisine-pro
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration de l'environnement**
```bash
cp .env.example .env
```

4. **Configurer Supabase**
- Créer un projet sur [Supabase](https://supabase.com)
- Copier l'URL et la clé anonyme dans `.env`
- Exécuter les migrations SQL

5. **Démarrer le serveur de développement**
```bash
npm run dev
```

## ⚙️ Configuration

### Variables d'Environnement

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Configuration Supabase

#### Tables Principales

- `profiles`: Profils utilisateur
- `menu_categories`: Catégories du menu
- `menu_items`: Articles du menu
- `orders`: Commandes
- `order_items`: Articles de commande
- `reservations`: Réservations d'événements
- `company_settings`: Paramètres de l'entreprise

#### Politiques RLS (Row Level Security)

Toutes les tables utilisent RLS pour la sécurité :
- Les clients ne voient que leurs propres données
- Les admins/employés ont accès à toutes les données
- Les données publiques (menu) sont accessibles à tous

## 🎨 Fonctionnalités

### Interface Publique

#### Page d'Accueil
- Hero section avec appel à l'action
- Présentation des services
- Témoignages clients
- Statistiques de l'entreprise

#### Menu
- Affichage des catégories et plats
- Filtrage par catégorie
- Recherche textuelle
- Informations nutritionnelles et allergènes

#### Services
- Description détaillée des services
- Types d'événements supportés
- Processus de travail
- Tarification

#### Réservation
- Formulaire multi-étapes
- Validation en temps réel
- Sélection de services
- Calcul automatique des coûts

### Espace Administrateur

#### Tableau de Bord
- Statistiques en temps réel
- Commandes récentes
- Actions rapides
- Graphiques de performance

#### Gestion des Utilisateurs
- Liste des clients/employés
- Filtrage et recherche
- Modification des rôles
- Activation/désactivation

#### Gestion du Menu
- CRUD des catégories
- CRUD des plats
- Gestion des images
- Contrôle de disponibilité

#### Gestion des Commandes
- Suivi des statuts
- Modification des commandes
- Génération de factures
- Historique complet

#### Gestion des Réservations
- Calendrier des événements
- Validation des demandes
- Suivi des paiements
- Communication client

### Espace Client

#### Tableau de Bord Personnel
- Résumé des commandes
- Réservations à venir
- Points de fidélité
- Notifications

#### Profil
- Modification des informations
- Historique des commandes
- Préférences alimentaires
- Adresses de livraison

## 🗄️ API et Base de Données

### Schéma de Base de Données

#### Table `profiles`
```sql
- id (uuid, PK)
- email (text, unique)
- first_name (text)
- last_name (text)
- phone (text)
- role (enum: admin, employee, client)
- avatar_url (text)
- created_at (timestamp)
- updated_at (timestamp)
- is_active (boolean)
```

#### Table `menu_items`
```sql
- id (uuid, PK)
- category_id (uuid, FK)
- name (text)
- description (text)
- price (decimal)
- image_url (text)
- ingredients (text[])
- allergens (text[])
- preparation_time (integer)
- calories (integer)
- is_available (boolean)
- is_festive (boolean)
```

#### Table `orders`
```sql
- id (uuid, PK)
- customer_id (uuid, FK)
- order_number (text, unique)
- status (enum)
- delivery_type (enum)
- delivery_address (text)
- delivery_date (timestamp)
- subtotal (decimal)
- tax_amount (decimal)
- total_amount (decimal)
- created_at (timestamp)
```

### Fonctions Utilitaires

#### Formatage
- `formatPrice()`: Formatage des prix en CAD
- `formatDate()`: Formatage des dates en français
- `formatPhoneNumber()`: Formatage des numéros de téléphone

#### Validation
- `isValidEmail()`: Validation d'email
- `isValidPhoneNumber()`: Validation de téléphone
- `calculateTaxes()`: Calcul des taxes québécoises

#### Génération
- `generateOrderNumber()`: Numéros de commande uniques
- `generateReservationNumber()`: Numéros de réservation uniques

## 🚀 Déploiement

### Déploiement sur Netlify

1. **Build de production**
```bash
npm run build
```

2. **Configuration Netlify**
```toml
[build]
  publish = "dist"
  command = "npm run build"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

3. **Variables d'environnement**
- Configurer les variables Supabase dans Netlify

### Déploiement sur Vercel

1. **Installation Vercel CLI**
```bash
npm i -g vercel
```

2. **Déploiement**
```bash
vercel --prod
```

### Configuration DNS

- Configurer le domaine personnalisé
- Activer HTTPS
- Configurer les redirections

## 🔧 Maintenance

### Monitoring

#### Métriques à Surveiller
- Temps de réponse des pages
- Taux d'erreur des API
- Utilisation de la base de données
- Satisfaction utilisateur

#### Outils Recommandés
- Google Analytics pour le trafic
- Sentry pour les erreurs
- Supabase Dashboard pour la DB

### Sauvegardes

#### Base de Données
- Sauvegardes automatiques Supabase
- Export manuel périodique
- Test de restauration

#### Code Source
- Repository Git sécurisé
- Branches de développement
- Tags de version

### Mises à Jour

#### Dépendances
```bash
npm audit
npm update
```

#### Sécurité
- Mise à jour régulière des dépendances
- Audit de sécurité mensuel
- Révision des permissions RLS

### Performance

#### Optimisations Frontend
- Lazy loading des images
- Code splitting
- Compression des assets
- Cache des API calls

#### Optimisations Backend
- Index de base de données
- Requêtes optimisées
- Cache Redis si nécessaire

## 📞 Support

### Documentation Technique
- [Guide d'utilisation](./USER_GUIDE.md)
- [API Reference](./API_REFERENCE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)

### Contact
- Email technique: dev@dounieculisine.ca
- Documentation: [docs.dounieculisine.ca]
- Support: [support.dounieculisine.ca]

---

**Version**: 1.0.0  
**Dernière mise à jour**: Mars 2024  
**Auteur**: Équipe de développement Dounie Cuisine Pro