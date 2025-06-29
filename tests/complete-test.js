/**
 * Tests complets pour Dounie Cuisine Pro
 * Ce script exécute des tests automatisés pour vérifier toutes les fonctionnalités
 * de l'interface publique et de l'administration.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class CompleteTest {
  constructor() {
    this.results = {
      publicInterface: {
        passed: 0,
        failed: 0,
        tests: []
      },
      adminInterface: {
        passed: 0,
        failed: 0,
        tests: []
      },
      authentication: {
        passed: 0,
        failed: 0,
        tests: []
      },
      database: {
        passed: 0,
        failed: 0,
        tests: []
      }
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const colors = {
      info: '\x1b[36m',    // Cyan
      success: '\x1b[32m', // Green
      error: '\x1b[31m',   // Red
      warning: '\x1b[33m', // Yellow
      reset: '\x1b[0m'     // Reset
    };
    
    console.log(`${colors[type]}${message}${colors.reset}`);
  }

  async test(category, name, testFunction) {
    this.log(`🧪 Testing: ${name}`, 'info');
    
    try {
      await testFunction();
      this.results[category].passed++;
      this.results[category].tests.push({ name, status: 'PASSED', error: null });
      this.log(`✅ PASSED: ${name}`, 'success');
    } catch (error) {
      this.results[category].failed++;
      this.results[category].tests.push({ name, status: 'FAILED', error: error.message });
      this.log(`❌ FAILED: ${name} - ${error.message}`, 'error');
    }
  }

  async runAllTests() {
    this.log('🚀 Démarrage des tests complets pour Dounie Cuisine Pro', 'info');
    this.log('='.repeat(80), 'info');

    // Tests de l'interface publique
    await this.testPublicInterface();
    
    // Tests d'authentification
    await this.testAuthentication();
    
    // Tests de l'interface d'administration
    await this.testAdminInterface();
    
    // Tests de la base de données
    await this.testDatabase();

    this.generateReport();
  }

  async testPublicInterface() {
    this.log('\n🌐 TESTS DE L\'INTERFACE PUBLIQUE', 'info');
    this.log('='.repeat(80), 'info');

    // Test de la page d'accueil
    await this.test('publicInterface', 'Page d\'accueil - Structure', () => {
      const homePage = fs.readFileSync('src/pages/public/HomePage.tsx', 'utf8');
      
      // Vérifier les sections principales
      const requiredSections = [
        'Hero Section',
        'Features Section',
        'About Section',
        'Services Preview',
        'Testimonials',
        'CTA Section'
      ];
      
      for (const section of requiredSections) {
        if (!homePage.includes(section)) {
          throw new Error(`Section manquante sur la page d'accueil: ${section}`);
        }
      }
      
      // Vérifier les composants importés
      if (!homePage.includes('import Header') || !homePage.includes('import Footer')) {
        throw new Error('Composants Header/Footer manquants sur la page d\'accueil');
      }
      
      // Vérifier l'intégration Supabase
      if (!homePage.includes('supabase')) {
        throw new Error('Intégration Supabase manquante sur la page d\'accueil');
      }
    });

    // Test de la page Menu
    await this.test('publicInterface', 'Page Menu - Fonctionnalités', () => {
      const menuPage = fs.readFileSync('src/pages/public/MenuPage.tsx', 'utf8');
      
      // Vérifier les fonctionnalités principales
      const requiredFeatures = [
        'useMenuData',
        'filteredItems',
        'selectedCategory',
        'searchTerm',
        'formatPrice'
      ];
      
      for (const feature of requiredFeatures) {
        if (!menuPage.includes(feature)) {
          throw new Error(`Fonctionnalité manquante sur la page Menu: ${feature}`);
        }
      }
      
      // Vérifier les composants de filtrage
      if (!menuPage.includes('setSelectedCategory') || !menuPage.includes('setSearchTerm')) {
        throw new Error('Fonctionnalités de filtrage manquantes sur la page Menu');
      }
    });

    // Test de la page Services
    await this.test('publicInterface', 'Page Services - Contenu', () => {
      const servicesPage = fs.readFileSync('src/pages/public/ServicesPage.tsx', 'utf8');
      
      // Vérifier les services proposés
      const requiredServices = [
        'Service Traiteur Premium',
        'Animation & DJ',
        'Organisation d\'Événements',
        'Consultation Culinaire'
      ];
      
      for (const service of requiredServices) {
        if (!servicesPage.includes(service)) {
          throw new Error(`Service manquant sur la page Services: ${service}`);
        }
      }
      
      // Vérifier les types d'événements
      const eventTypes = [
        'Mariages',
        'Anniversaires',
        'Événements Corporatifs',
        'Célébrations Familiales'
      ];
      
      for (const eventType of eventTypes) {
        if (!servicesPage.includes(eventType)) {
          throw new Error(`Type d'événement manquant sur la page Services: ${eventType}`);
        }
      }
    });

    // Test de la page Galerie
    await this.test('publicInterface', 'Page Galerie - Fonctionnalités', () => {
      const galleryPage = fs.readFileSync('src/pages/public/GalleryPage.tsx', 'utf8');
      
      // Vérifier les fonctionnalités principales
      const requiredFeatures = [
        'selectedAlbum',
        'selectedImageIndex',
        'openLightbox',
        'closeLightbox',
        'nextImage',
        'prevImage'
      ];
      
      for (const feature of requiredFeatures) {
        if (!galleryPage.includes(feature)) {
          throw new Error(`Fonctionnalité manquante sur la page Galerie: ${feature}`);
        }
      }
      
      // Vérifier la gestion des erreurs
      if (!galleryPage.includes('catch') || !galleryPage.includes('error')) {
        throw new Error('Gestion des erreurs manquante sur la page Galerie');
      }
    });

    // Test de la page Contact
    await this.test('publicInterface', 'Page Contact - Formulaire', () => {
      const contactPage = fs.readFileSync('src/pages/public/ContactPage.tsx', 'utf8');
      
      // Vérifier les champs du formulaire
      const requiredFields = [
        'name',
        'email',
        'phone',
        'subject',
        'message',
        'eventType',
        'eventDate',
        'guestCount'
      ];
      
      for (const field of requiredFields) {
        if (!contactPage.includes(`register('${field}')`)) {
          throw new Error(`Champ de formulaire manquant sur la page Contact: ${field}`);
        }
      }
      
      // Vérifier la validation
      if (!contactPage.includes('zodResolver')) {
        throw new Error('Validation Zod manquante sur la page Contact');
      }
      
      // Vérifier la gestion des erreurs
      if (!contactPage.includes('errors.') || !contactPage.includes('text-red-600')) {
        throw new Error('Affichage des erreurs de validation manquant sur la page Contact');
      }
    });

    // Test de la page Réservation
    await this.test('publicInterface', 'Page Réservation - Processus multi-étapes', () => {
      const reservationPage = fs.readFileSync('src/pages/public/ReservationPage.tsx', 'utf8');
      
      // Vérifier le système d'étapes
      if (!reservationPage.includes('currentStep') || !reservationPage.includes('totalSteps')) {
        throw new Error('Processus multi-étapes manquant sur la page Réservation');
      }
      
      // Vérifier les étapes
      const steps = [
        'Informations Personnelles',
        'Détails de l\'Événement',
        'Lieu et Services',
        'Finalisation'
      ];
      
      for (const step of steps) {
        if (!reservationPage.includes(step)) {
          throw new Error(`Étape manquante sur la page Réservation: ${step}`);
        }
      }
      
      // Vérifier la navigation entre étapes
      if (!reservationPage.includes('nextStep') || !reservationPage.includes('prevStep')) {
        throw new Error('Navigation entre étapes manquante sur la page Réservation');
      }
      
      // Vérifier la validation
      if (!reservationPage.includes('trigger(')) {
        throw new Error('Validation par étape manquante sur la page Réservation');
      }
    });

    // Test du composant Header
    await this.test('publicInterface', 'Composant Header - Navigation', () => {
      const header = fs.readFileSync('src/components/common/Header.tsx', 'utf8');
      
      // Vérifier les liens de navigation
      const navLinks = [
        'Accueil',
        'Menu',
        'Services',
        'Galerie',
        'Contact'
      ];
      
      for (const link of navLinks) {
        if (!header.includes(link)) {
          throw new Error(`Lien de navigation manquant dans le Header: ${link}`);
        }
      }
      
      // Vérifier la gestion de l'authentification
      if (!header.includes('useAuth') || !header.includes('signOut')) {
        throw new Error('Gestion de l\'authentification manquante dans le Header');
      }
      
      // Vérifier le menu mobile
      if (!header.includes('isMenuOpen') || !header.includes('setIsMenuOpen')) {
        throw new Error('Menu mobile manquant dans le Header');
      }
    });

    // Test du composant Footer
    await this.test('publicInterface', 'Composant Footer - Contenu', () => {
      const footer = fs.readFileSync('src/components/common/Footer.tsx', 'utf8');
      
      // Vérifier les sections
      const sections = [
        'Liens Rapides',
        'Nos Services',
        'Contact'
      ];
      
      for (const section of sections) {
        if (!footer.includes(section)) {
          throw new Error(`Section manquante dans le Footer: ${section}`);
        }
      }
      
      // Vérifier les liens légaux
      if (!footer.includes('Politique de Confidentialité') || !footer.includes('Conditions d\'Utilisation')) {
        throw new Error('Liens légaux manquants dans le Footer');
      }
      
      // Vérifier l'intégration Supabase
      if (!footer.includes('supabase') || !footer.includes('fetchCompanySettings')) {
        throw new Error('Intégration Supabase manquante dans le Footer');
      }
    });

    // Test de la page Légale
    await this.test('publicInterface', 'Page Légale - Contenu dynamique', () => {
      const legalPage = fs.readFileSync('src/pages/public/LegalPage.tsx', 'utf8');
      
      // Vérifier le chargement dynamique
      if (!legalPage.includes('useParams') || !legalPage.includes('type')) {
        throw new Error('Chargement dynamique manquant sur la page Légale');
      }
      
      // Vérifier l'intégration Supabase
      if (!legalPage.includes('supabase') || !legalPage.includes('fetchLegalContent')) {
        throw new Error('Intégration Supabase manquante sur la page Légale');
      }
      
      // Vérifier la gestion des erreurs
      if (!legalPage.includes('catch') || !legalPage.includes('error')) {
        throw new Error('Gestion des erreurs manquante sur la page Légale');
      }
    });
  }

  async testAuthentication() {
    this.log('\n🔐 TESTS D\'AUTHENTIFICATION', 'info');
    this.log('='.repeat(80), 'info');

    // Test du contexte d'authentification
    await this.test('authentication', 'AuthContext - Fonctionnalités', () => {
      const authContext = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
      
      // Vérifier les fonctions d'authentification
      const authFunctions = [
        'signIn',
        'signUp',
        'signOut',
        'updateProfile',
        'fetchProfile'
      ];
      
      for (const func of authFunctions) {
        if (!authContext.includes(func)) {
          throw new Error(`Fonction d'authentification manquante: ${func}`);
        }
      }
      
      // Vérifier la gestion des états
      const authStates = [
        'user',
        'profile',
        'session',
        'loading'
      ];
      
      for (const state of authStates) {
        if (!authContext.includes(`const [${state}, set${state.charAt(0).toUpperCase() + state.slice(1)}]`)) {
          throw new Error(`État d'authentification manquant: ${state}`);
        }
      }
      
      // Vérifier la gestion des erreurs
      if (!authContext.includes('try') || !authContext.includes('catch')) {
        throw new Error('Gestion des erreurs manquante dans AuthContext');
      }
    });

    // Test de la page de connexion
    await this.test('authentication', 'Page Connexion - Validation', () => {
      const loginPage = fs.readFileSync('src/pages/auth/LoginPage.tsx', 'utf8');
      
      // Vérifier le formulaire
      const formFields = [
        'email',
        'password'
      ];
      
      for (const field of formFields) {
        if (!loginPage.includes(`register('${field}')`)) {
          throw new Error(`Champ de formulaire manquant sur la page Connexion: ${field}`);
        }
      }
      
      // Vérifier la validation
      if (!loginPage.includes('zodResolver')) {
        throw new Error('Validation Zod manquante sur la page Connexion');
      }
      
      // Vérifier la gestion des erreurs
      if (!loginPage.includes('errors.') || !loginPage.includes('text-red-600')) {
        throw new Error('Affichage des erreurs de validation manquant sur la page Connexion');
      }
      
      // Vérifier l'intégration avec AuthContext
      if (!loginPage.includes('useAuth') || !loginPage.includes('signIn')) {
        throw new Error('Intégration AuthContext manquante sur la page Connexion');
      }
    });

    // Test de la page d'inscription
    await this.test('authentication', 'Page Inscription - Validation', () => {
      const registerPage = fs.readFileSync('src/pages/auth/RegisterPage.tsx', 'utf8');
      
      // Vérifier le formulaire
      const formFields = [
        'firstName',
        'lastName',
        'email',
        'phone',
        'password',
        'confirmPassword'
      ];
      
      for (const field of formFields) {
        if (!registerPage.includes(`register('${field}')`)) {
          throw new Error(`Champ de formulaire manquant sur la page Inscription: ${field}`);
        }
      }
      
      // Vérifier la validation
      if (!registerPage.includes('zodResolver')) {
        throw new Error('Validation Zod manquante sur la page Inscription');
      }
      
      // Vérifier la confirmation de mot de passe
      if (!registerPage.includes('refine') || !registerPage.includes('confirmPassword')) {
        throw new Error('Validation de confirmation de mot de passe manquante sur la page Inscription');
      }
      
      // Vérifier l'intégration avec AuthContext
      if (!registerPage.includes('useAuth') || !registerPage.includes('signUp')) {
        throw new Error('Intégration AuthContext manquante sur la page Inscription');
      }
    });

    // Test du composant ProtectedRoute
    await this.test('authentication', 'ProtectedRoute - Sécurité', () => {
      const protectedRoute = fs.readFileSync('src/components/auth/ProtectedRoute.tsx', 'utf8');
      
      // Vérifier la protection de base
      if (!protectedRoute.includes('Navigate') || !protectedRoute.includes('useAuth')) {
        throw new Error('Protection de base manquante dans ProtectedRoute');
      }
      
      // Vérifier la protection par rôle
      if (!protectedRoute.includes('requiredRole')) {
        throw new Error('Protection par rôle manquante dans ProtectedRoute');
      }
      
      // Vérifier la gestion du chargement
      if (!protectedRoute.includes('loading')) {
        throw new Error('Gestion du chargement manquante dans ProtectedRoute');
      }
    });
  }

  async testAdminInterface() {
    this.log('\n👨‍💼 TESTS DE L\'INTERFACE D\'ADMINISTRATION', 'info');
    this.log('='.repeat(80), 'info');

    // Test du layout Admin
    await this.test('adminInterface', 'AdminLayout - Structure', () => {
      const adminLayout = fs.readFileSync('src/components/admin/AdminLayout.tsx', 'utf8');
      
      // Vérifier la navigation
      const navItems = [
        'Tableau de bord',
        'Utilisateurs',
        'Menu',
        'Commandes',
        'Réservations',
        'Galerie',
        'Paramètres'
      ];
      
      for (const item of navItems) {
        if (!adminLayout.includes(item)) {
          throw new Error(`Item de navigation manquant dans AdminLayout: ${item}`);
        }
      }
      
      // Vérifier l'intégration avec AuthContext
      if (!adminLayout.includes('useAuth') || !adminLayout.includes('signOut')) {
        throw new Error('Intégration AuthContext manquante dans AdminLayout');
      }
      
      // Vérifier la gestion du menu mobile
      if (!adminLayout.includes('sidebarOpen') || !adminLayout.includes('setSidebarOpen')) {
        throw new Error('Gestion du menu mobile manquante dans AdminLayout');
      }
    });

    // Test du dashboard Admin
    await this.test('adminInterface', 'AdminDashboard - Contenu', () => {
      const adminDashboard = fs.readFileSync('src/pages/admin/AdminDashboard.tsx', 'utf8');
      
      // Vérifier les statistiques
      const statItems = [
        'Commandes du jour',
        'Réservations',
        'Revenus',
        'Nouveaux clients'
      ];
      
      for (const item of statItems) {
        if (!adminDashboard.includes(item)) {
          throw new Error(`Statistique manquante dans AdminDashboard: ${item}`);
        }
      }
      
      // Vérifier les sections
      const sections = [
        'Commandes Récentes',
        'Actions Rapides'
      ];
      
      for (const section of sections) {
        if (!adminDashboard.includes(section)) {
          throw new Error(`Section manquante dans AdminDashboard: ${section}`);
        }
      }
      
      // Vérifier l'intégration avec AuthContext
      if (!adminDashboard.includes('useAuth') || !adminDashboard.includes('profile')) {
        throw new Error('Intégration AuthContext manquante dans AdminDashboard');
      }
    });

    // Test de la gestion des utilisateurs
    await this.test('adminInterface', 'AdminUsers - Fonctionnalités', () => {
      const adminUsers = fs.readFileSync('src/pages/admin/AdminUsers.tsx', 'utf8');
      
      // Vérifier le tableau des utilisateurs
      const tableHeaders = [
        'Utilisateur',
        'Rôle',
        'Statut',
        'Dernière connexion',
        'Actions'
      ];
      
      for (const header of tableHeaders) {
        if (!adminUsers.includes(header)) {
          throw new Error(`En-tête de tableau manquant dans AdminUsers: ${header}`);
        }
      }
      
      // Vérifier les filtres
      const filters = [
        'Rechercher un utilisateur',
        'Tous les rôles',
        'Tous les statuts'
      ];
      
      for (const filter of filters) {
        if (!adminUsers.includes(filter)) {
          throw new Error(`Filtre manquant dans AdminUsers: ${filter}`);
        }
      }
      
      // Vérifier les actions
      if (!adminUsers.includes('Modifier') || !adminUsers.includes('Supprimer')) {
        throw new Error('Actions utilisateur manquantes dans AdminUsers');
      }
    });

    // Test de la gestion du menu
    await this.test('adminInterface', 'AdminMenu - CRUD', () => {
      const adminMenu = fs.readFileSync('src/pages/admin/AdminMenu.tsx', 'utf8');
      
      // Vérifier les onglets
      const tabs = [
        'Plats',
        'Menus Spéciaux',
        'Catégories'
      ];
      
      for (const tab of tabs) {
        if (!adminMenu.includes(tab)) {
          throw new Error(`Onglet manquant dans AdminMenu: ${tab}`);
        }
      }
      
      // Vérifier les fonctionnalités CRUD
      const crudFunctions = [
        'handleSave',
        'handleDelete',
        'openModal'
      ];
      
      for (const func of crudFunctions) {
        if (!adminMenu.includes(func)) {
          throw new Error(`Fonction CRUD manquante dans AdminMenu: ${func}`);
        }
      }
      
      // Vérifier l'intégration Supabase
      if (!adminMenu.includes('supabase.from')) {
        throw new Error('Intégration Supabase manquante dans AdminMenu');
      }
      
      // Vérifier les formulaires
      const formFields = [
        'name',
        'description',
        'price',
        'image_url',
        'is_available'
      ];
      
      for (const field of formFields) {
        if (!adminMenu.includes(field)) {
          throw new Error(`Champ de formulaire manquant dans AdminMenu: ${field}`);
        }
      }
    });

    // Test de la gestion des commandes
    await this.test('adminInterface', 'AdminOrders - Tableau', () => {
      const adminOrders = fs.readFileSync('src/pages/admin/AdminOrders.tsx', 'utf8');
      
      // Vérifier le tableau des commandes
      const tableHeaders = [
        'Commande',
        'Client',
        'Montant',
        'Statut',
        'Date',
        'Actions'
      ];
      
      for (const header of tableHeaders) {
        if (!adminOrders.includes(header)) {
          throw new Error(`En-tête de tableau manquant dans AdminOrders: ${header}`);
        }
      }
      
      // Vérifier les filtres
      const filters = [
        'Rechercher une commande',
        'Tous les statuts'
      ];
      
      for (const filter of filters) {
        if (!adminOrders.includes(filter)) {
          throw new Error(`Filtre manquant dans AdminOrders: ${filter}`);
        }
      }
      
      // Vérifier les statuts
      if (!adminOrders.includes('En préparation')) {
        throw new Error('Statuts de commande manquants dans AdminOrders');
      }
    });

    // Test de la gestion des réservations
    await this.test('adminInterface', 'AdminReservations - Tableau', () => {
      const adminReservations = fs.readFileSync('src/pages/admin/AdminReservations.tsx', 'utf8');
      
      // Vérifier le tableau des réservations
      const tableHeaders = [
        'Réservation',
        'Client',
        'Événement',
        'Date/Heure',
        'Invités',
        'Statut',
        'Actions'
      ];
      
      for (const header of tableHeaders) {
        if (!adminReservations.includes(header)) {
          throw new Error(`En-tête de tableau manquant dans AdminReservations: ${header}`);
        }
      }
      
      // Vérifier les filtres
      const filters = [
        'Rechercher une réservation',
        'Tous les statuts'
      ];
      
      for (const filter of filters) {
        if (!adminReservations.includes(filter)) {
          throw new Error(`Filtre manquant dans AdminReservations: ${filter}`);
        }
      }
      
      // Vérifier les actions
      if (!adminReservations.includes('Eye') || !adminReservations.includes('Check') || !adminReservations.includes('X')) {
        throw new Error('Actions de réservation manquantes dans AdminReservations');
      }
    });

    // Test de la gestion de la galerie
    await this.test('adminInterface', 'AdminGallery - CRUD', () => {
      const adminGallery = fs.readFileSync('src/pages/admin/AdminGallery.tsx', 'utf8');
      
      // Vérifier les fonctionnalités CRUD
      const crudFunctions = [
        'fetchAlbums',
        'handleSaveAlbum',
        'handleDeleteAlbum',
        'handleSaveImage',
        'handleDeleteImage'
      ];
      
      for (const func of crudFunctions) {
        if (!adminGallery.includes(func)) {
          throw new Error(`Fonction CRUD manquante dans AdminGallery: ${func}`);
        }
      }
      
      // Vérifier les modals
      if (!adminGallery.includes('showAlbumModal') || !adminGallery.includes('showImageModal')) {
        throw new Error('Modals manquants dans AdminGallery');
      }
      
      // Vérifier l'intégration Supabase
      if (!adminGallery.includes('supabase.from(\'gallery_albums\')')) {
        throw new Error('Intégration Supabase manquante dans AdminGallery');
      }
      
      // Vérifier la gestion des erreurs
      if (!adminGallery.includes('catch') || !adminGallery.includes('error')) {
        throw new Error('Gestion des erreurs manquante dans AdminGallery');
      }
    });

    // Test des paramètres de l'entreprise
    await this.test('adminInterface', 'AdminSettings - Sections', () => {
      const adminSettings = fs.readFileSync('src/pages/admin/AdminSettings.tsx', 'utf8');
      
      // Vérifier les sections de paramètres
      const sections = [
        'Informations Générales',
        'Informations de Contact',
        'Contenu du Site',
        'Horaires d\'Ouverture',
        'Réseaux Sociaux',
        'Mentions Légales'
      ];
      
      for (const section of sections) {
        if (!adminSettings.includes(section)) {
          throw new Error(`Section de paramètres manquante dans AdminSettings: ${section}`);
        }
      }
      
      // Vérifier les fonctionnalités de mise à jour
      if (!adminSettings.includes('handleSave') || !adminSettings.includes('updateSettings')) {
        throw new Error('Fonctionnalités de mise à jour manquantes dans AdminSettings');
      }
      
      // Vérifier l'intégration Supabase
      if (!adminSettings.includes('supabase.from(\'company_settings\')')) {
        throw new Error('Intégration Supabase manquante dans AdminSettings');
      }
      
      // Vérifier la gestion des erreurs
      if (!adminSettings.includes('catch') || !adminSettings.includes('error')) {
        throw new Error('Gestion des erreurs manquante dans AdminSettings');
      }
    });
  }

  async testDatabase() {
    this.log('\n🗄️ TESTS DE LA BASE DE DONNÉES', 'info');
    this.log('='.repeat(80), 'info');

    // Test de la configuration Supabase
    await this.test('database', 'Configuration Supabase', () => {
      const supabaseConfig = fs.readFileSync('src/lib/supabase.ts', 'utf8');
      
      // Vérifier la création du client
      if (!supabaseConfig.includes('createClient')) {
        throw new Error('Création du client Supabase manquante');
      }
      
      // Vérifier les variables d'environnement
      if (!supabaseConfig.includes('VITE_SUPABASE_URL') || !supabaseConfig.includes('VITE_SUPABASE_ANON_KEY')) {
        throw new Error('Variables d\'environnement Supabase manquantes');
      }
      
      // Vérifier la gestion des erreurs
      if (!supabaseConfig.includes('try') || !supabaseConfig.includes('catch')) {
        throw new Error('Gestion des erreurs manquante dans la configuration Supabase');
      }
      
      // Vérifier le test de connexion
      if (!supabaseConfig.includes('testSupabaseConnection')) {
        throw new Error('Test de connexion Supabase manquant');
      }
    });

    // Test du hook useMenuData
    await this.test('database', 'Hook useMenuData', () => {
      const useMenuData = fs.readFileSync('src/hooks/useMenuData.ts', 'utf8');
      
      // Vérifier les fonctions de récupération
      const fetchFunctions = [
        'fetchCategories',
        'fetchMenuItems',
        'fetchData'
      ];
      
      for (const func of fetchFunctions) {
        if (!useMenuData.includes(func)) {
          throw new Error(`Fonction de récupération manquante dans useMenuData: ${func}`);
        }
      }
      
      // Vérifier les états
      const states = [
        'categories',
        'menuItems',
        'loading',
        'error'
      ];
      
      for (const state of states) {
        if (!useMenuData.includes(`const [${state}, set${state.charAt(0).toUpperCase() + state.slice(1)}]`)) {
          throw new Error(`État manquant dans useMenuData: ${state}`);
        }
      }
      
      // Vérifier l'intégration Supabase
      if (!useMenuData.includes('supabase.from(\'menu_categories\')') || !useMenuData.includes('supabase.from(\'menu_items\')')) {
        throw new Error('Intégration Supabase manquante dans useMenuData');
      }
      
      // Vérifier la gestion des erreurs
      if (!useMenuData.includes('catch') || !useMenuData.includes('setError')) {
        throw new Error('Gestion des erreurs manquante dans useMenuData');
      }
    });

    // Test des migrations SQL
    await this.test('database', 'Migrations SQL', () => {
      // Vérifier l'existence du dossier migrations
      if (!fs.existsSync('supabase/migrations')) {
        throw new Error('Dossier migrations manquant');
      }
      
      // Vérifier les fichiers de migration
      const migrationFiles = fs.readdirSync('supabase/migrations').filter(f => f.endsWith('.sql'));
      
      if (migrationFiles.length === 0) {
        throw new Error('Aucun fichier de migration trouvé');
      }
      
      // Vérifier le contenu des migrations
      let hasTableCreation = false;
      let hasRLS = false;
      let hasPolicies = false;
      
      for (const file of migrationFiles) {
        const content = fs.readFileSync(`supabase/migrations/${file}`, 'utf8');
        
        if (content.includes('CREATE TABLE')) {
          hasTableCreation = true;
        }
        
        if (content.includes('ENABLE ROW LEVEL SECURITY')) {
          hasRLS = true;
        }
        
        if (content.includes('CREATE POLICY')) {
          hasPolicies = true;
        }
      }
      
      if (!hasTableCreation) {
        throw new Error('Aucune création de table trouvée dans les migrations');
      }
      
      if (!hasRLS) {
        throw new Error('Aucune activation de RLS trouvée dans les migrations');
      }
      
      if (!hasPolicies) {
        throw new Error('Aucune politique RLS trouvée dans les migrations');
      }
    });

    // Test des types de base de données
    await this.test('database', 'Types TypeScript', () => {
      const databaseTypes = fs.readFileSync('src/types/database.ts', 'utf8');
      
      // Vérifier l'interface Database
      if (!databaseTypes.includes('export interface Database')) {
        throw new Error('Interface Database manquante');
      }
      
      // Vérifier les tables principales
      const mainTables = [
        'profiles',
        'menu_categories',
        'menu_items',
        'orders',
        'reservations'
      ];
      
      for (const table of mainTables) {
        if (!databaseTypes.includes(`${table}: {`)) {
          throw new Error(`Type de table manquant: ${table}`);
        }
      }
      
      // Vérifier les types d'opérations
      const operations = [
        'Row',
        'Insert',
        'Update'
      ];
      
      for (const op of operations) {
        if (!databaseTypes.includes(op)) {
          throw new Error(`Type d'opération manquant: ${op}`);
        }
      }
    });
  }

  generateReport() {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;
    
    // Calculer les totaux
    const totalPassed = this.results.publicInterface.passed + 
                        this.results.adminInterface.passed + 
                        this.results.authentication.passed + 
                        this.results.database.passed;
                        
    const totalFailed = this.results.publicInterface.failed + 
                        this.results.adminInterface.failed + 
                        this.results.authentication.failed + 
                        this.results.database.failed;
                        
    const totalTests = totalPassed + totalFailed;
    
    this.log('\n' + '='.repeat(80), 'info');
    this.log('📊 RAPPORT DE TESTS COMPLET', 'info');
    this.log('='.repeat(80), 'info');
    
    this.log(`\n⏱️  Durée totale: ${duration.toFixed(2)}s`, 'info');
    this.log(`📈 Tests réussis: ${totalPassed}/${totalTests} (${((totalPassed / totalTests) * 100).toFixed(1)}%)`, 'success');
    
    // Résultats par catégorie
    this.log('\n📋 Résultats par catégorie:', 'info');
    
    this.log(`   🌐 Interface publique: ${this.results.publicInterface.passed}/${this.results.publicInterface.passed + this.results.publicInterface.failed} tests réussis`, 
      this.results.publicInterface.failed === 0 ? 'success' : 'warning');
      
    this.log(`   🔐 Authentification: ${this.results.authentication.passed}/${this.results.authentication.passed + this.results.authentication.failed} tests réussis`, 
      this.results.authentication.failed === 0 ? 'success' : 'warning');
      
    this.log(`   👨‍💼 Interface d'administration: ${this.results.adminInterface.passed}/${this.results.adminInterface.passed + this.results.adminInterface.failed} tests réussis`, 
      this.results.adminInterface.failed === 0 ? 'success' : 'warning');
      
    this.log(`   🗄️ Base de données: ${this.results.database.passed}/${this.results.database.passed + this.results.database.failed} tests réussis`, 
      this.results.database.failed === 0 ? 'success' : 'warning');
    
    // Afficher les tests échoués
    if (totalFailed > 0) {
      this.log('\n❌ TESTS ÉCHOUÉS:', 'error');
      
      for (const category in this.results) {
        const failedTests = this.results[category].tests.filter(test => test.status === 'FAILED');
        
        if (failedTests.length > 0) {
          this.log(`\n   ${category}:`, 'error');
          
          for (const test of failedTests) {
            this.log(`   • ${test.name}: ${test.error}`, 'error');
          }
        }
      }
    }
    
    // Générer un rapport JSON
    const report = {
      timestamp: new Date().toISOString(),
      duration: duration,
      summary: {
        total: totalTests,
        passed: totalPassed,
        failed: totalFailed,
        successRate: (totalPassed / totalTests) * 100
      },
      categories: {
        publicInterface: {
          passed: this.results.publicInterface.passed,
          failed: this.results.publicInterface.failed,
          tests: this.results.publicInterface.tests
        },
        authentication: {
          passed: this.results.authentication.passed,
          failed: this.results.authentication.failed,
          tests: this.results.authentication.tests
        },
        adminInterface: {
          passed: this.results.adminInterface.passed,
          failed: this.results.adminInterface.failed,
          tests: this.results.adminInterface.tests
        },
        database: {
          passed: this.results.database.passed,
          failed: this.results.database.failed,
          tests: this.results.database.tests
        }
      }
    };
    
    fs.writeFileSync('complete-test-report.json', JSON.stringify(report, null, 2));
    this.log('\n📄 Rapport détaillé sauvegardé dans complete-test-report.json', 'info');
    
    if (totalFailed === 0) {
      this.log('\n🎉 TOUS LES TESTS SONT PASSÉS! L\'APPLICATION EST PRÊTE!', 'success');
    } else {
      this.log(`\n⚠️  ${totalFailed} tests ont échoué. Veuillez corriger les problèmes identifiés.`, 'warning');
    }
  }
}

// Exécution des tests
const runner = new CompleteTest();
runner.runAllTests().catch(error => {
  console.error('Erreur lors de l\'exécution des tests:', error);
  process.exit(1);
});