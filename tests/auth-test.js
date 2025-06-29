/**
 * Tests d'authentification pour Dounie Cuisine Pro
 * Ce script vérifie spécifiquement les fonctionnalités d'authentification
 */

const fs = require('fs');
const path = require('path');

class AuthTest {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      total: 0,
      tests: []
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

  async test(name, testFunction) {
    this.results.total++;
    this.log(`🔐 Testing: ${name}`, 'info');
    
    try {
      await testFunction();
      this.results.passed++;
      this.results.tests.push({ name, status: 'PASSED', error: null });
      this.log(`✅ PASSED: ${name}`, 'success');
    } catch (error) {
      this.results.failed++;
      this.results.tests.push({ name, status: 'FAILED', error: error.message });
      this.log(`❌ FAILED: ${name} - ${error.message}`, 'error');
    }
  }

  async runAuthTests() {
    this.log('🚀 Démarrage des tests d\'authentification pour Dounie Cuisine Pro', 'info');
    this.log('='.repeat(80), 'info');

    // Tests du contexte d'authentification
    await this.testAuthContext();
    
    // Tests des pages d'authentification
    await this.testAuthPages();
    
    // Tests des routes protégées
    await this.testProtectedRoutes();
    
    // Tests des politiques de sécurité
    await this.testSecurityPolicies();

    this.generateReport();
  }

  async testAuthContext() {
    this.log('\n🔑 TESTS DU CONTEXTE D\'AUTHENTIFICATION', 'info');
    this.log('─'.repeat(80), 'info');

    await this.test('AuthContext - Structure', () => {
      const authContext = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
      
      // Vérifier la structure du contexte
      if (!authContext.includes('createContext') || !authContext.includes('AuthProvider')) {
        throw new Error('Structure de contexte React manquante dans AuthContext');
      }
      
      // Vérifier le hook useAuth
      if (!authContext.includes('useAuth') || !authContext.includes('useContext')) {
        throw new Error('Hook useAuth manquant ou mal implémenté');
      }
      
      // Vérifier la gestion des erreurs
      if (!authContext.includes('if (context === undefined)')) {
        throw new Error('Vérification du contexte manquante dans useAuth');
      }
    });

    await this.test('AuthContext - États', () => {
      const authContext = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
      
      // Vérifier les états
      const states = [
        'user',
        'profile',
        'session',
        'loading'
      ];
      
      for (const state of states) {
        if (!authContext.includes(`const [${state}, set${state.charAt(0).toUpperCase() + state.slice(1)}]`)) {
          throw new Error(`État ${state} manquant dans AuthContext`);
        }
      }
    });

    await this.test('AuthContext - Méthodes d\'authentification', () => {
      const authContext = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
      
      // Vérifier les méthodes d'authentification
      const methods = [
        'signIn',
        'signUp',
        'signOut',
        'updateProfile',
        'fetchProfile'
      ];
      
      for (const method of methods) {
        if (!authContext.includes(`const ${method} =`)) {
          throw new Error(`Méthode ${method} manquante dans AuthContext`);
        }
      }
    });

    await this.test('AuthContext - Intégration Supabase', () => {
      const authContext = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
      
      // Vérifier l'intégration Supabase
      const supabaseMethods = [
        'supabase.auth.getSession',
        'supabase.auth.onAuthStateChange',
        'supabase.auth.signInWithPassword',
        'supabase.auth.signUp',
        'supabase.auth.signOut'
      ];
      
      for (const method of supabaseMethods) {
        if (!authContext.includes(method)) {
          throw new Error(`Méthode Supabase ${method} manquante dans AuthContext`);
        }
      }
    });

    await this.test('AuthContext - Gestion des erreurs', () => {
      const authContext = fs.readFileSync('src/contexts/AuthContext.tsx', 'utf8');
      
      // Vérifier la gestion des erreurs
      const errorHandling = [
        'try {',
        'catch (error)',
        'console.error',
        'throw error'
      ];
      
      for (const pattern of errorHandling) {
        if (!authContext.includes(pattern)) {
          throw new Error(`Gestion des erreurs ${pattern} manquante dans AuthContext`);
        }
      }
    });
  }

  async testAuthPages() {
    this.log('\n📝 TESTS DES PAGES D\'AUTHENTIFICATION', 'info');
    this.log('─'.repeat(80), 'info');

    await this.test('LoginPage - Structure', () => {
      const loginPage = fs.readFileSync('src/pages/auth/LoginPage.tsx', 'utf8');
      
      // Vérifier la structure de la page
      if (!loginPage.includes('export default function LoginPage')) {
        throw new Error('Structure de composant React manquante dans LoginPage');
      }
      
      // Vérifier l'intégration avec AuthContext
      if (!loginPage.includes('useAuth') || !loginPage.includes('signIn')) {
        throw new Error('Intégration AuthContext manquante dans LoginPage');
      }
      
      // Vérifier le formulaire
      if (!loginPage.includes('useForm') || !loginPage.includes('handleSubmit')) {
        throw new Error('Formulaire React Hook Form manquant dans LoginPage');
      }
    });

    await this.test('LoginPage - Validation', () => {
      const loginPage = fs.readFileSync('src/pages/auth/LoginPage.tsx', 'utf8');
      
      // Vérifier la validation Zod
      if (!loginPage.includes('zodResolver') || !loginPage.includes('loginSchema')) {
        throw new Error('Validation Zod manquante dans LoginPage');
      }
      
      // Vérifier les règles de validation
      if (!loginPage.includes('z.string().email') || !loginPage.includes('z.string().min')) {
        throw new Error('Règles de validation manquantes dans LoginPage');
      }
      
      // Vérifier l'affichage des erreurs
      if (!loginPage.includes('errors.email') || !loginPage.includes('errors.password')) {
        throw new Error('Affichage des erreurs de validation manquant dans LoginPage');
      }
    });

    await this.test('LoginPage - Soumission', () => {
      const loginPage = fs.readFileSync('src/pages/auth/LoginPage.tsx', 'utf8');
      
      // Vérifier la soumission du formulaire
      if (!loginPage.includes('onSubmit') || !loginPage.includes('setIsLoading')) {
        throw new Error('Gestion de la soumission du formulaire manquante dans LoginPage');
      }
      
      // Vérifier la gestion des erreurs
      if (!loginPage.includes('try') || !loginPage.includes('catch')) {
        throw new Error('Gestion des erreurs manquante dans LoginPage');
      }
      
      // Vérifier la redirection
      if (!loginPage.includes('navigate(')) {
        throw new Error('Redirection après connexion manquante dans LoginPage');
      }
      
      // Vérifier le feedback utilisateur
      if (!loginPage.includes('toast.success') || !loginPage.includes('toast.error')) {
        throw new Error('Feedback utilisateur manquant dans LoginPage');
      }
    });

    await this.test('RegisterPage - Structure', () => {
      const registerPage = fs.readFileSync('src/pages/auth/RegisterPage.tsx', 'utf8');
      
      // Vérifier la structure de la page
      if (!registerPage.includes('export default function RegisterPage')) {
        throw new Error('Structure de composant React manquante dans RegisterPage');
      }
      
      // Vérifier l'intégration avec AuthContext
      if (!registerPage.includes('useAuth') || !registerPage.includes('signUp')) {
        throw new Error('Intégration AuthContext manquante dans RegisterPage');
      }
      
      // Vérifier le formulaire
      if (!registerPage.includes('useForm') || !registerPage.includes('handleSubmit')) {
        throw new Error('Formulaire React Hook Form manquant dans RegisterPage');
      }
    });

    await this.test('RegisterPage - Validation', () => {
      const registerPage = fs.readFileSync('src/pages/auth/RegisterPage.tsx', 'utf8');
      
      // Vérifier la validation Zod
      if (!registerPage.includes('zodResolver') || !registerPage.includes('registerSchema')) {
        throw new Error('Validation Zod manquante dans RegisterPage');
      }
      
      // Vérifier les règles de validation
      if (!registerPage.includes('z.string().email') || !registerPage.includes('z.string().min')) {
        throw new Error('Règles de validation manquantes dans RegisterPage');
      }
      
      // Vérifier la confirmation de mot de passe
      if (!registerPage.includes('refine') || !registerPage.includes('confirmPassword')) {
        throw new Error('Validation de confirmation de mot de passe manquante dans RegisterPage');
      }
      
      // Vérifier l'affichage des erreurs
      if (!registerPage.includes('errors.email') || !registerPage.includes('errors.password')) {
        throw new Error('Affichage des erreurs de validation manquant dans RegisterPage');
      }
    });

    await this.test('RegisterPage - Soumission', () => {
      const registerPage = fs.readFileSync('src/pages/auth/RegisterPage.tsx', 'utf8');
      
      // Vérifier la soumission du formulaire
      if (!registerPage.includes('onSubmit') || !registerPage.includes('setIsLoading')) {
        throw new Error('Gestion de la soumission du formulaire manquante dans RegisterPage');
      }
      
      // Vérifier la gestion des erreurs
      if (!registerPage.includes('try') || !registerPage.includes('catch')) {
        throw new Error('Gestion des erreurs manquante dans RegisterPage');
      }
      
      // Vérifier la redirection
      if (!registerPage.includes('navigate(')) {
        throw new Error('Redirection après inscription manquante dans RegisterPage');
      }
      
      // Vérifier le feedback utilisateur
      if (!registerPage.includes('toast.success') || !registerPage.includes('toast.error')) {
        throw new Error('Feedback utilisateur manquant dans RegisterPage');
      }
    });
  }

  async testProtectedRoutes() {
    this.log('\n🛡️ TESTS DES ROUTES PROTÉGÉES', 'info');
    this.log('─'.repeat(80), 'info');

    await this.test('ProtectedRoute - Structure', () => {
      const protectedRoute = fs.readFileSync('src/components/auth/ProtectedRoute.tsx', 'utf8');
      
      // Vérifier la structure du composant
      if (!protectedRoute.includes('export function ProtectedRoute') && !protectedRoute.includes('export default function ProtectedRoute')) {
        throw new Error('Structure de composant React manquante dans ProtectedRoute');
      }
      
      // Vérifier l'intégration avec AuthContext
      if (!protectedRoute.includes('useAuth') || !protectedRoute.includes('user') || !protectedRoute.includes('profile')) {
        throw new Error('Intégration AuthContext manquante dans ProtectedRoute');
      }
      
      // Vérifier la redirection
      if (!protectedRoute.includes('Navigate')) {
        throw new Error('Redirection manquante dans ProtectedRoute');
      }
    });

    await this.test('ProtectedRoute - Vérification d\'authentification', () => {
      const protectedRoute = fs.readFileSync('src/components/auth/ProtectedRoute.tsx', 'utf8');
      
      // Vérifier la vérification d'authentification
      if (!protectedRoute.includes('!user') || !protectedRoute.includes('!profile')) {
        throw new Error('Vérification d\'authentification manquante dans ProtectedRoute');
      }
      
      // Vérifier la redirection vers la page de connexion
      if (!protectedRoute.includes('Navigate to="/connexion"')) {
        throw new Error('Redirection vers la page de connexion manquante dans ProtectedRoute');
      }
    });

    await this.test('ProtectedRoute - Vérification de rôle', () => {
      const protectedRoute = fs.readFileSync('src/components/auth/ProtectedRoute.tsx', 'utf8');
      
      // Vérifier la vérification de rôle
      if (!protectedRoute.includes('requiredRole') || !protectedRoute.includes('profile.role !== requiredRole')) {
        throw new Error('Vérification de rôle manquante dans ProtectedRoute');
      }
      
      // Vérifier la redirection basée sur le rôle
      if (!protectedRoute.includes('profile.role === \'admin\'')) {
        throw new Error('Redirection basée sur le rôle manquante dans ProtectedRoute');
      }
    });

    await this.test('App - Routes protégées', () => {
      const app = fs.readFileSync('src/App.tsx', 'utf8');
      
      // Vérifier les routes admin protégées
      if (!app.includes('<ProtectedRoute requiredRole="admin">')) {
        throw new Error('Routes admin non protégées dans App');
      }
      
      // Vérifier les routes client protégées
      if (!app.includes('<ProtectedRoute requiredRole="client">')) {
        throw new Error('Routes client non protégées dans App');
      }
      
      // Vérifier les layouts
      if (!app.includes('<AdminLayout>') || !app.includes('<ClientLayout>')) {
        throw new Error('Layouts admin/client manquants dans App');
      }
    });
  }

  async testSecurityPolicies() {
    this.log('\n🔒 TESTS DES POLITIQUES DE SÉCURITÉ', 'info');
    this.log('─'.repeat(80), 'info');

    await this.test('Migrations SQL - RLS', () => {
      // Vérifier l'existence du dossier migrations
      if (!fs.existsSync('supabase/migrations')) {
        throw new Error('Dossier migrations manquant');
      }
      
      // Vérifier les fichiers de migration
      const migrationFiles = fs.readdirSync('supabase/migrations').filter(f => f.endsWith('.sql'));
      
      if (migrationFiles.length === 0) {
        throw new Error('Aucun fichier de migration trouvé');
      }
      
      // Vérifier l'activation de RLS
      let hasRLS = false;
      
      for (const file of migrationFiles) {
        const content = fs.readFileSync(`supabase/migrations/${file}`, 'utf8');
        
        if (content.includes('ENABLE ROW LEVEL SECURITY')) {
          hasRLS = true;
          break;
        }
      }
      
      if (!hasRLS) {
        throw new Error('Activation de RLS non trouvée dans les migrations');
      }
    });

    await this.test('Migrations SQL - Politiques', () => {
      // Vérifier les fichiers de migration
      const migrationFiles = fs.readdirSync('supabase/migrations').filter(f => f.endsWith('.sql'));
      
      // Vérifier les politiques de sécurité
      let hasPolicies = false;
      let hasProfilePolicies = false;
      let hasPublicPolicies = false;
      
      for (const file of migrationFiles) {
        const content = fs.readFileSync(`supabase/migrations/${file}`, 'utf8');
        
        if (content.includes('CREATE POLICY')) {
          hasPolicies = true;
          
          if (content.includes('ON profiles')) {
            hasProfilePolicies = true;
          }
          
          if (content.includes('TO anon')) {
            hasPublicPolicies = true;
          }
        }
      }
      
      if (!hasPolicies) {
        throw new Error('Aucune politique de sécurité trouvée dans les migrations');
      }
      
      if (!hasProfilePolicies) {
        throw new Error('Aucune politique de sécurité pour les profils trouvée dans les migrations');
      }
      
      if (!hasPublicPolicies) {
        throw new Error('Aucune politique de sécurité publique trouvée dans les migrations');
      }
    });

    await this.test('Migrations SQL - Fonctions', () => {
      // Vérifier les fichiers de migration
      const migrationFiles = fs.readdirSync('supabase/migrations').filter(f => f.endsWith('.sql'));
      
      // Vérifier les fonctions de sécurité
      let hasHandleNewUser = false;
      let hasHandleUpdatedAt = false;
      
      for (const file of migrationFiles) {
        const content = fs.readFileSync(`supabase/migrations/${file}`, 'utf8');
        
        if (content.includes('FUNCTION public.handle_new_user')) {
          hasHandleNewUser = true;
        }
        
        if (content.includes('FUNCTION public.handle_updated_at')) {
          hasHandleUpdatedAt = true;
        }
      }
      
      if (!hasHandleNewUser) {
        throw new Error('Fonction handle_new_user non trouvée dans les migrations');
      }
      
      if (!hasHandleUpdatedAt) {
        throw new Error('Fonction handle_updated_at non trouvée dans les migrations');
      }
    });

    await this.test('Supabase - Configuration sécurisée', () => {
      const supabaseConfig = fs.readFileSync('src/lib/supabase.ts', 'utf8');
      
      // Vérifier la configuration sécurisée
      if (!supabaseConfig.includes('import.meta.env.VITE_SUPABASE_URL') || !supabaseConfig.includes('import.meta.env.VITE_SUPABASE_ANON_KEY')) {
        throw new Error('Variables d\'environnement non utilisées dans la configuration Supabase');
      }
      
      // Vérifier la validation des variables d'environnement
      if (!supabaseConfig.includes('if (!supabaseUrl || !supabaseAnonKey)')) {
        throw new Error('Validation des variables d\'environnement manquante dans la configuration Supabase');
      }
      
      // Vérifier les options de sécurité
      if (!supabaseConfig.includes('persistSession') || !supabaseConfig.includes('autoRefreshToken')) {
        throw new Error('Options de sécurité manquantes dans la configuration Supabase');
      }
    });
  }

  generateReport() {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;
    
    this.log('\n' + '='.repeat(80), 'info');
    this.log('📊 RAPPORT DE TESTS D\'AUTHENTIFICATION', 'info');
    this.log('='.repeat(80), 'info');
    
    this.log(`\n⏱️  Durée totale: ${duration.toFixed(2)}s`, 'info');
    this.log(`📈 Tests réussis: ${this.results.passed}/${this.results.total}`, 'success');
    this.log(`📉 Tests échoués: ${this.results.failed}/${this.results.total}`, this.results.failed > 0 ? 'error' : 'info');
    
    // Afficher les tests échoués
    if (this.results.failed > 0) {
      this.log('\n❌ TESTS ÉCHOUÉS:', 'error');
      
      for (const test of this.results.tests.filter(t => t.status === 'FAILED')) {
        this.log(`   • ${test.name}: ${test.error}`, 'error');
      }
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
      tests: this.results.tests
    };
    
    fs.writeFileSync('auth-test-report.json', JSON.stringify(report, null, 2));
    this.log('\n📄 Rapport détaillé sauvegardé dans auth-test-report.json', 'info');
    
    if (this.results.failed === 0) {
      this.log('\n🎉 TOUS LES TESTS D\'AUTHENTIFICATION SONT PASSÉS!', 'success');
    } else {
      this.log(`\n⚠️  ${this.results.failed} tests ont échoué. Veuillez corriger les problèmes identifiés.`, 'warning');
    }
  }
}

// Exécution des tests
const runner = new AuthTest();
runner.runAuthTests().catch(error => {
  console.error('Erreur lors de l\'exécution des tests d\'authentification:', error);
  process.exit(1);
});