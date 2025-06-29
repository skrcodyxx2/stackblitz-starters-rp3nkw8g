/**
 * Script de test complet pour Dounie Cuisine Pro
 * Teste toutes les fonctionnalités de l'application
 */

import fs from 'fs';
import path from 'path';

class TestRunner {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      details: []
    };
    this.startTime = Date.now();
  }

  log(message, type = 'info') {
    const timestamp = new Date().toISOString();
    const colors = {
      info: '\x1b[36m',
      success: '\x1b[32m',
      error: '\x1b[31m',
      warning: '\x1b[33m',
      reset: '\x1b[0m'
    };
    
    console.log(`${colors[type]}[${timestamp}] ${message}${colors.reset}`);
  }

  async test(name, testFunction) {
    this.results.total++;
    this.log(`🧪 Testing: ${name}`, 'info');
    
    try {
      await testFunction();
      this.results.passed++;
      this.results.details.push({ name, status: 'PASSED', error: null });
      this.log(`✅ PASSED: ${name}`, 'success');
    } catch (error) {
      this.results.failed++;
      this.results.details.push({ name, status: 'FAILED', error: error.message });
      this.log(`❌ FAILED: ${name} - ${error.message}`, 'error');
    }
  }

  async runAllTests() {
    this.log('🚀 Démarrage des tests complets de Dounie Cuisine Pro', 'info');
    this.log('=' * 60, 'info');

    // Tests de structure de fichiers
    await this.testFileStructure();
    
    // Tests de configuration
    await this.testConfiguration();
    
    // Tests des composants
    await this.testComponents();
    
    // Tests des pages
    await this.testPages();
    
    // Tests des hooks
    await this.testHooks();
    
    // Tests des utilitaires
    await this.testUtilities();
    
    // Tests de la base de données
    await this.testDatabase();
    
    // Tests de sécurité
    await this.testSecurity();
    
    // Tests de performance
    await this.testPerformance();
    
    // Tests de documentation
    await this.testDocumentation();

    this.generateReport();
  }

  async testFileStructure() {
    this.log('📁 Tests de structure de fichiers', 'info');

    const requiredFiles = [
      'src/App.tsx',
      'src/main.tsx',
      'src/index.css',
      'package.json',
      'vite.config.ts',
      'tailwind.config.js',
      'tsconfig.json'
    ];

    const requiredDirectories = [
      'src/components',
      'src/pages',
      'src/contexts',
      'src/hooks',
      'src/utils',
      'src/types',
      'src/lib',
      'docs'
    ];

    for (const file of requiredFiles) {
      await this.test(`Fichier requis: ${file}`, () => {
        if (!fs.existsSync(file)) {
          throw new Error(`Fichier manquant: ${file}`);
        }
      });
    }

    for (const dir of requiredDirectories) {
      await this.test(`Répertoire requis: ${dir}`, () => {
        if (!fs.existsSync(dir)) {
          throw new Error(`Répertoire manquant: ${dir}`);
        }
      });
    }

    // Test de la structure des composants
    const componentDirs = [
      'src/components/admin',
      'src/components/auth',
      'src/components/client',
      'src/components/common'
    ];

    for (const dir of componentDirs) {
      await this.test(`Structure composants: ${dir}`, () => {
        if (!fs.existsSync(dir)) {
          throw new Error(`Répertoire de composants manquant: ${dir}`);
        }
      });
    }

    // Test de la structure des pages
    const pageDirs = [
      'src/pages/public',
      'src/pages/admin',
      'src/pages/auth',
      'src/pages/client'
    ];

    for (const dir of pageDirs) {
      await this.test(`Structure pages: ${dir}`, () => {
        if (!fs.existsSync(dir)) {
          throw new Error(`Répertoire de pages manquant: ${dir}`);
        }
      });
    }
  }

  async testConfiguration() {
    this.log('⚙️ Tests de configuration', 'info');

    await this.test('Package.json valide', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      const requiredDeps = [
        '@supabase/supabase-js',
        'react',
        'react-dom',
        'react-router-dom',
        'lucide-react',
        'react-hook-form',
        'zod',
        'react-hot-toast'
      ];

      for (const dep of requiredDeps) {
        if (!packageJson.dependencies[dep]) {
          throw new Error(`Dépendance manquante: ${dep}`);
        }
      }
    });

    await this.test('Configuration TypeScript', () => {
      const tsConfig = JSON.parse(fs.readFileSync('tsconfig.json', 'utf8'));
      
      if (!tsConfig.compilerOptions.strict) {
        throw new Error('Mode strict TypeScript non activé');
      }
      
      if (!tsConfig.compilerOptions.jsx) {
        throw new Error('Configuration JSX manquante');
      }
    });

    await this.test('Configuration Tailwind', () => {
      if (!fs.existsSync('tailwind.config.js')) {
        throw new Error('Configuration Tailwind manquante');
      }
      
      const tailwindConfig = fs.readFileSync('tailwind.config.js', 'utf8');
      if (!tailwindConfig.includes('primary') || !tailwindConfig.includes('secondary')) {
        throw new Error('Couleurs personnalisées Tailwind manquantes');
      }
    });

    await this.test('Configuration Vite', () => {
      if (!fs.existsSync('vite.config.ts')) {
        throw new Error('Configuration Vite manquante');
      }
      
      const viteConfig = fs.readFileSync('vite.config.ts', 'utf8');
      if (!viteConfig.includes('@vitejs/plugin-react')) {
        throw new Error('Plugin React Vite manquant');
      }
    });
  }

  async testComponents() {
    this.log('🧩 Tests des composants', 'info');

    const components = [
      'src/components/common/Header.tsx',
      'src/components/common/Footer.tsx',
      'src/components/admin/AdminLayout.tsx',
      'src/components/client/ClientLayout.tsx',
      'src/components/auth/ProtectedRoute.tsx'
    ];

    for (const component of components) {
      await this.test(`Composant: ${path.basename(component)}`, () => {
        if (!fs.existsSync(component)) {
          throw new Error(`Composant manquant: ${component}`);
        }
        
        const content = fs.readFileSync(component, 'utf8');
        
        // Vérifications de base
        if (!content.includes('import React')) {
          throw new Error('Import React manquant');
        }
        
        if (!content.includes('export default')) {
          throw new Error('Export par défaut manquant');
        }
        
        // Vérification TypeScript
        if (!content.includes('interface') && !content.includes('type')) {
          this.log(`⚠️ Aucun type défini dans ${component}`, 'warning');
        }
      });
    }

    // Test spécifique pour AdminLayout
    await this.test('AdminLayout - Navigation', () => {
      const content = fs.readFileSync('src/components/admin/AdminLayout.tsx', 'utf8');
      
      const requiredNavItems = [
        'Tableau de bord',
        'Utilisateurs',
        'Menu',
        'Commandes',
        'Réservations',
        'Paramètres'
      ];
      
      for (const item of requiredNavItems) {
        if (!content.includes(item)) {
          throw new Error(`Item de navigation manquant: ${item}`);
        }
      }
    });

    // Test spécifique pour ClientLayout
    await this.test('ClientLayout - Navigation', () => {
      const content = fs.readFileSync('src/components/client/ClientLayout.tsx', 'utf8');
      
      const requiredNavItems = [
        'Tableau de bord',
        'Mon Profil',
        'Mes Commandes',
        'Mes Réservations'
      ];
      
      for (const item of requiredNavItems) {
        if (!content.includes(item)) {
          throw new Error(`Item de navigation client manquant: ${item}`);
        }
      }
    });
  }

  async testPages() {
    this.log('📄 Tests des pages', 'info');

    const publicPages = [
      'src/pages/public/HomePage.tsx',
      'src/pages/public/MenuPage.tsx',
      'src/pages/public/ServicesPage.tsx',
      'src/pages/public/GalleryPage.tsx',
      'src/pages/public/ContactPage.tsx',
      'src/pages/public/ReservationPage.tsx'
    ];

    const authPages = [
      'src/pages/auth/LoginPage.tsx',
      'src/pages/auth/RegisterPage.tsx'
    ];

    const adminPages = [
      'src/pages/admin/AdminDashboard.tsx',
      'src/pages/admin/AdminUsers.tsx',
      'src/pages/admin/AdminMenu.tsx',
      'src/pages/admin/AdminOrders.tsx',
      'src/pages/admin/AdminReservations.tsx',
      'src/pages/admin/AdminSettings.tsx'
    ];

    const clientPages = [
      'src/pages/client/ClientDashboard.tsx',
      'src/pages/client/ClientProfile.tsx',
      'src/pages/client/ClientOrders.tsx',
      'src/pages/client/ClientReservations.tsx'
    ];

    const allPages = [...publicPages, ...authPages, ...adminPages, ...clientPages];

    for (const page of allPages) {
      await this.test(`Page: ${path.basename(page)}`, () => {
        if (!fs.existsSync(page)) {
          throw new Error(`Page manquante: ${page}`);
        }
        
        const content = fs.readFileSync(page, 'utf8');
        
        // Vérifications de base
        if (!content.includes('export default')) {
          throw new Error('Export par défaut manquant');
        }
        
        // Vérification de la structure React
        if (!content.includes('return')) {
          throw new Error('Composant React invalide - pas de return');
        }
      });
    }

    // Tests spécifiques pour les pages publiques
    await this.test('HomePage - Sections requises', () => {
      const content = fs.readFileSync('src/pages/public/HomePage.tsx', 'utf8');
      
      const requiredSections = [
        'Hero Section',
        'Features Section',
        'Services Preview',
        'Testimonials',
        'CTA Section'
      ];
      
      for (const section of requiredSections) {
        if (!content.includes(section)) {
          throw new Error(`Section manquante sur HomePage: ${section}`);
        }
      }
    });

    await this.test('MenuPage - Fonctionnalités', () => {
      const content = fs.readFileSync('src/pages/public/MenuPage.tsx', 'utf8');
      
      const requiredFeatures = [
        'Search',
        'Filter',
        'useMenuData',
        'formatPrice'
      ];
      
      for (const feature of requiredFeatures) {
        if (!content.includes(feature)) {
          throw new Error(`Fonctionnalité manquante sur MenuPage: ${feature}`);
        }
      }
    });

    await this.test('ReservationPage - Étapes', () => {
      const content = fs.readFileSync('src/pages/public/ReservationPage.tsx', 'utf8');
      
      if (!content.includes('currentStep') || !content.includes('totalSteps')) {
        throw new Error('Système d\'étapes manquant sur ReservationPage');
      }
      
      const stepCount = (content.match(/currentStep === \d/g) || []).length;
      if (stepCount < 4) {
        throw new Error('Pas assez d\'étapes dans le processus de réservation');
      }
    });
  }

  async testHooks() {
    this.log('🎣 Tests des hooks', 'info');

    await this.test('Hook useMenuData', () => {
      if (!fs.existsSync('src/hooks/useMenuData.ts')) {
        throw new Error('Hook useMenuData manquant');
      }
      
      const content = fs.readFileSync('src/hooks/useMenuData.ts', 'utf8');
      
      const requiredExports = [
        'categories',
        'menuItems',
        'loading',
        'error',
        'refetch'
      ];
      
      for (const exp of requiredExports) {
        if (!content.includes(exp)) {
          throw new Error(`Export manquant dans useMenuData: ${exp}`);
        }
      }
    });

    await this.test('AuthContext', () => {
      if (!fs.existsSync('src/contexts/AuthContext.tsx')) {
        throw new Error('AuthContext manquant');
      }
      
      const content = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
      
      const requiredMethods = [
        'signIn',
        'signUp',
        'signOut',
        'updateProfile'
      ];
      
      for (const method of requiredMethods) {
        if (!content.includes(method)) {
          throw new Error(`Méthode manquante dans AuthContext: ${method}`);
        }
      }
    });
  }

  async testUtilities() {
    this.log('🔧 Tests des utilitaires', 'info');

    await this.test('Utilitaires de formatage', () => {
      if (!fs.existsSync('src/utils/formatters.ts')) {
        throw new Error('Fichier formatters.ts manquant');
      }
      
      const content = fs.readFileSync('src/utils/formatters.ts', 'utf8');
      
      const requiredFunctions = [
        'formatPrice',
        'formatDate',
        'formatPhoneNumber',
        'generateOrderNumber',
        'calculateTaxes'
      ];
      
      for (const func of requiredFunctions) {
        if (!content.includes(func)) {
          throw new Error(`Fonction manquante dans formatters: ${func}`);
        }
      }
    });

    await this.test('Constantes métier', () => {
      if (!fs.existsSync('src/utils/constants.ts')) {
        throw new Error('Fichier constants.ts manquant');
      }
      
      const content = fs.readFileSync('src/utils/constants.ts', 'utf8');
      
      const requiredConstants = [
        'ORDER_STATUSES',
        'RESERVATION_STATUSES',
        'USER_ROLES',
        'EVENT_TYPES'
      ];
      
      for (const constant of requiredConstants) {
        if (!content.includes(constant)) {
          throw new Error(`Constante manquante: ${constant}`);
        }
      }
    });

    await this.test('Types TypeScript', () => {
      if (!fs.existsSync('src/types/database.ts')) {
        throw new Error('Fichier database.ts manquant');
      }
      
      const content = fs.readFileSync('src/types/database.ts', 'utf8');
      
      if (!content.includes('Database') || !content.includes('Tables')) {
        throw new Error('Types de base de données manquants');
      }
    });
  }

  async testDatabase() {
    this.log('🗄️ Tests de base de données', 'info');

    await this.test('Configuration Supabase', () => {
      if (!fs.existsSync('src/lib/supabase.ts')) {
        throw new Error('Configuration Supabase manquante');
      }
      
      const content = fs.readFileSync('src/lib/supabase.ts', 'utf8');
      
      if (!content.includes('createClient')) {
        throw new Error('Client Supabase non configuré');
      }
      
      if (!content.includes('VITE_SUPABASE_URL') || !content.includes('VITE_SUPABASE_ANON_KEY')) {
        throw new Error('Variables d\'environnement Supabase manquantes');
      }
    });

    await this.test('Variables d\'environnement', () => {
      if (!fs.existsSync('.env')) {
        throw new Error('Fichier .env manquant');
      }
      
      const content = fs.readFileSync('.env', 'utf8');
      
      if (!content.includes('VITE_SUPABASE_URL') || !content.includes('VITE_SUPABASE_ANON_KEY')) {
        throw new Error('Variables Supabase manquantes dans .env');
      }
    });

    // Test des migrations
    await this.test('Migrations SQL', () => {
      if (!fs.existsSync('supabase')) {
        this.log('⚠️ Répertoire supabase manquant - migrations non testées', 'warning');
        return;
      }
      
      const migrationFiles = fs.readdirSync('supabase/migrations').filter(f => f.endsWith('.sql'));
      
      if (migrationFiles.length === 0) {
        throw new Error('Aucune migration SQL trouvée');
      }
      
      this.log(`✅ ${migrationFiles.length} migrations trouvées`, 'success');
    });
  }

  async testSecurity() {
    this.log('🔒 Tests de sécurité', 'info');

    await this.test('Protection des routes', () => {
      if (!fs.existsSync('src/components/auth/ProtectedRoute.tsx')) {
        throw new Error('Composant ProtectedRoute manquant');
      }
      
      const content = fs.readFileSync('src/components/auth/ProtectedRoute.tsx', 'utf8');
      
      if (!content.includes('requiredRole')) {
        throw new Error('Protection par rôle manquante');
      }
      
      if (!content.includes('Navigate')) {
        throw new Error('Redirection de sécurité manquante');
      }
    });

    await this.test('Validation des formulaires', () => {
      const loginPage = fs.readFileSync('src/pages/auth/LoginPage.tsx', 'utf8');
      const registerPage = fs.readFileSync('src/pages/auth/RegisterPage.tsx', 'utf8');
      
      if (!loginPage.includes('zodResolver') || !registerPage.includes('zodResolver')) {
        throw new Error('Validation Zod manquante sur les formulaires d\'auth');
      }
    });

    await this.test('Gestion des erreurs', () => {
      const authContext = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
      
      if (!authContext.includes('try') || !authContext.includes('catch')) {
        throw new Error('Gestion d\'erreurs manquante dans AuthContext');
      }
    });
  }

  async testPerformance() {
    this.log('⚡ Tests de performance', 'info');

    await this.test('Lazy loading des pages', () => {
      const appContent = fs.readFileSync('src/App.tsx', 'utf8');
      
      // Vérifier si les imports sont directs (pas optimal) ou lazy
      const directImports = (appContent.match(/import.*from.*pages/g) || []).length;
      
      if (directImports > 10) {
        this.log('⚠️ Beaucoup d\'imports directs - considérer le lazy loading', 'warning');
      }
    });

    await this.test('Optimisation des images', () => {
      const publicPages = [
        'src/pages/public/HomePage.tsx',
        'src/pages/public/MenuPage.tsx',
        'src/pages/public/GalleryPage.tsx'
      ];
      
      for (const page of publicPages) {
        const content = fs.readFileSync(page, 'utf8');
        
        // Vérifier l'utilisation d'images optimisées
        const imageUrls = content.match(/https:\/\/images\.pexels\.com[^"']*/g) || [];
        
        for (const url of imageUrls) {
          if (!url.includes('auto=compress') || !url.includes('cs=tinysrgb')) {
            this.log(`⚠️ Image non optimisée trouvée: ${url.substring(0, 50)}...`, 'warning');
          }
        }
      }
    });

    await this.test('Bundle size check', () => {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const depCount = Object.keys(packageJson.dependencies || {}).length;
      
      if (depCount > 20) {
        this.log(`⚠️ Beaucoup de dépendances (${depCount}) - vérifier la taille du bundle`, 'warning');
      }
    });
  }

  async testDocumentation() {
    this.log('📚 Tests de documentation', 'info');

    const requiredDocs = [
      'docs/README.md',
      'docs/USER_GUIDE.md',
      'docs/API_REFERENCE.md',
      'docs/TROUBLESHOOTING.md',
      'docs/DEPLOYMENT.md',
      'docs/CHANGELOG.md'
    ];

    for (const doc of requiredDocs) {
      await this.test(`Documentation: ${path.basename(doc)}`, () => {
        if (!fs.existsSync(doc)) {
          throw new Error(`Documentation manquante: ${doc}`);
        }
        
        const content = fs.readFileSync(doc, 'utf8');
        
        if (content.length < 1000) {
          throw new Error(`Documentation trop courte: ${doc}`);
        }
        
        // Vérifier la structure markdown
        if (!content.includes('#')) {
          throw new Error(`Pas de structure markdown dans: ${doc}`);
        }
      });
    }

    await this.test('README principal', () => {
      if (!fs.existsSync('README.md')) {
        this.log('⚠️ README.md principal manquant', 'warning');
        return;
      }
      
      const content = fs.readFileSync('README.md', 'utf8');
      
      const requiredSections = [
        'Installation',
        'Configuration',
        'Utilisation'
      ];
      
      for (const section of requiredSections) {
        if (!content.toLowerCase().includes(section.toLowerCase())) {
          this.log(`⚠️ Section manquante dans README: ${section}`, 'warning');
        }
      }
    });

    await this.test('Qualité de la documentation', () => {
      const userGuide = fs.readFileSync('docs/USER_GUIDE.md', 'utf8');
      const apiRef = fs.readFileSync('docs/API_REFERENCE.md', 'utf8');
      
      // Vérifier la présence d'exemples de code
      if (!apiRef.includes('```typescript') && !apiRef.includes('```javascript')) {
        throw new Error('Pas d\'exemples de code dans API_REFERENCE.md');
      }
      
      // Vérifier la structure du guide utilisateur
      if (!userGuide.includes('Table des Matières')) {
        this.log('⚠️ Table des matières manquante dans USER_GUIDE.md', 'warning');
      }
    });
  }

  generateReport() {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;
    
    this.log('=' * 60, 'info');
    this.log('📊 RAPPORT DE TESTS COMPLET', 'info');
    this.log('=' * 60, 'info');
    
    this.log(`⏱️  Durée totale: ${duration.toFixed(2)}s`, 'info');
    this.log(`📈 Tests réussis: ${this.results.passed}/${this.results.total}`, 'success');
    this.log(`📉 Tests échoués: ${this.results.failed}/${this.results.total}`, this.results.failed > 0 ? 'error' : 'info');
    this.log(`📊 Taux de réussite: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`, 'info');
    
    if (this.results.failed > 0) {
      this.log('\n❌ TESTS ÉCHOUÉS:', 'error');
      this.results.details
        .filter(test => test.status === 'FAILED')
        .forEach(test => {
          this.log(`   • ${test.name}: ${test.error}`, 'error');
        });
    }
    
    // Générer un rapport JSON
    const report = {
      timestamp: new Date().toISOString(),
      duration: duration,
      summary: {
        total: this.results.total,
        passed: this.results.passed,
        failed: this.results.failed,
        successRate: (this.results.passed / this.results.total) * 100
      },
      details: this.results.details
    };
    
    fs.writeFileSync('test-report.json', JSON.stringify(report, null, 2));
    this.log('\n📄 Rapport détaillé sauvegardé dans test-report.json', 'info');
    
    if (this.results.failed === 0) {
      this.log('\n🎉 TOUS LES TESTS SONT PASSÉS! L\'APPLICATION EST PRÊTE!', 'success');
    } else {
      this.log('\n⚠️  Certains tests ont échoué. Veuillez corriger les problèmes identifiés.', 'warning');
    }
  }
}

// Exécution des tests
// Remplacer require.main === module par une vérification adaptée ES module
if (import.meta.url === `file://${process.argv[1]}`) {
  const runner = new TestRunner();
  runner.runAllTests().catch(error => {
    console.error('Erreur lors de l\'exécution des tests:', error);
    process.exit(1);
  });
}

export default TestRunner;