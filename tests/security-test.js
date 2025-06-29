/**
 * Tests de Sécurité - Dounie Cuisine Pro
 * Vérifie les aspects de sécurité de l'application
 */

const fs = require('fs');
const path = require('path');

class SecurityTest {
  constructor() {
    this.vulnerabilities = [];
    this.warnings = [];
    this.recommendations = [];
  }

  async runSecurityTests() {
    console.log('🔒 Démarrage des tests de sécurité...\n');

    await this.checkEnvironmentVariables();
    await this.checkAuthenticationSecurity();
    await this.checkInputValidation();
    await this.checkDependencyVulnerabilities();
    await this.checkCodeSecurity();
    await this.checkDatabaseSecurity();

    this.generateSecurityReport();
  }

  async checkEnvironmentVariables() {
    console.log('🔐 Vérification des variables d\'environnement...');

    try {
      // Vérifier le fichier .env
      if (!fs.existsSync('.env')) {
        this.vulnerabilities.push({
          severity: 'high',
          type: 'Configuration',
          message: 'Fichier .env manquant',
          recommendation: 'Créer un fichier .env avec les variables Supabase'
        });
        return;
      }

      const envContent = fs.readFileSync('.env', 'utf8');
      
      // Vérifier les variables requises
      const requiredVars = [
        'VITE_SUPABASE_URL',
        'VITE_SUPABASE_ANON_KEY'
      ];

      for (const varName of requiredVars) {
        if (!envContent.includes(varName)) {
          this.vulnerabilities.push({
            severity: 'high',
            type: 'Configuration',
            message: `Variable d'environnement manquante: ${varName}`,
            recommendation: 'Ajouter toutes les variables Supabase requises'
          });
        }
      }

      // Vérifier que les clés ne sont pas exposées dans le code
      const srcFiles = this.getAllFiles('src', ['.tsx', '.ts', '.jsx', '.js']);
      for (const file of srcFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Chercher des clés hardcodées
        const hardcodedKeys = content.match(/[a-zA-Z0-9]{40,}/g) || [];
        if (hardcodedKeys.length > 0) {
          this.warnings.push({
            severity: 'medium',
            type: 'Secrets',
            message: `Clés potentiellement hardcodées dans ${file}`,
            recommendation: 'Utiliser les variables d\'environnement'
          });
        }
      }

      console.log('✅ Variables d\'environnement vérifiées');

    } catch (error) {
      console.error('❌ Erreur lors de la vérification des variables:', error.message);
    }
  }

  async checkAuthenticationSecurity() {
    console.log('\n🔑 Vérification de la sécurité d\'authentification...');

    try {
      // Vérifier AuthContext
      const authContextPath = 'src/contexts/AuthContext.tsx';
      if (!fs.existsSync(authContextPath)) {
        this.vulnerabilities.push({
          severity: 'critical',
          type: 'Authentication',
          message: 'AuthContext manquant',
          recommendation: 'Implémenter un système d\'authentification sécurisé'
        });
        return;
      }

      const authContent = fs.readFileSync(authContextPath, 'utf8');

      // Vérifier la gestion des erreurs
      if (!authContent.includes('try') || !authContent.includes('catch')) {
        this.vulnerabilities.push({
          severity: 'medium',
          type: 'Authentication',
          message: 'Gestion d\'erreurs insuffisante dans AuthContext',
          recommendation: 'Ajouter une gestion d\'erreurs robuste'
        });
      }

      // Vérifier la protection des routes
      const protectedRoutePath = 'src/components/auth/ProtectedRoute.tsx';
      if (!fs.existsSync(protectedRoutePath)) {
        this.vulnerabilities.push({
          severity: 'high',
          type: 'Authorization',
          message: 'Composant ProtectedRoute manquant',
          recommendation: 'Implémenter la protection des routes par rôle'
        });
      } else {
        const protectedContent = fs.readFileSync(protectedRoutePath, 'utf8');
        
        if (!protectedContent.includes('requiredRole')) {
          this.vulnerabilities.push({
            severity: 'high',
            type: 'Authorization',
            message: 'Protection par rôle insuffisante',
            recommendation: 'Implémenter la vérification des rôles utilisateur'
          });
        }
      }

      // Vérifier les pages de connexion
      const loginPagePath = 'src/pages/auth/LoginPage.tsx';
      if (fs.existsSync(loginPagePath)) {
        const loginContent = fs.readFileSync(loginPagePath, 'utf8');
        
        if (!loginContent.includes('zodResolver')) {
          this.warnings.push({
            severity: 'medium',
            type: 'Validation',
            message: 'Validation des formulaires de connexion insuffisante',
            recommendation: 'Utiliser Zod pour la validation côté client'
          });
        }
      }

      console.log('✅ Sécurité d\'authentification vérifiée');

    } catch (error) {
      console.error('❌ Erreur lors de la vérification de l\'authentification:', error.message);
    }
  }

  async checkInputValidation() {
    console.log('\n✅ Vérification de la validation des entrées...');

    try {
      const formPages = [
        'src/pages/auth/LoginPage.tsx',
        'src/pages/auth/RegisterPage.tsx',
        'src/pages/public/ContactPage.tsx',
        'src/pages/public/ReservationPage.tsx'
      ];

      for (const pagePath of formPages) {
        if (!fs.existsSync(pagePath)) continue;

        const content = fs.readFileSync(pagePath, 'utf8');
        
        // Vérifier la présence de validation
        if (!content.includes('zodResolver') && !content.includes('yupResolver')) {
          this.warnings.push({
            severity: 'medium',
            type: 'Validation',
            message: `Validation manquante dans ${path.basename(pagePath)}`,
            recommendation: 'Ajouter une validation avec Zod ou Yup'
          });
        }

        // Vérifier la sanitisation
        if (content.includes('dangerouslySetInnerHTML')) {
          this.vulnerabilities.push({
            severity: 'high',
            type: 'XSS',
            message: `Utilisation dangereuse de dangerouslySetInnerHTML dans ${pagePath}`,
            recommendation: 'Sanitiser le contenu HTML ou utiliser des alternatives sûres'
          });
        }

        // Vérifier les injections SQL potentielles
        if (content.includes('${') && content.includes('supabase')) {
          this.warnings.push({
            severity: 'medium',
            type: 'SQL Injection',
            message: `Interpolation de chaînes avec Supabase dans ${pagePath}`,
            recommendation: 'Utiliser les paramètres de requête Supabase'
          });
        }
      }

      console.log('✅ Validation des entrées vérifiée');

    } catch (error) {
      console.error('❌ Erreur lors de la vérification de la validation:', error.message);
    }
  }

  async checkDependencyVulnerabilities() {
    console.log('\n📦 Vérification des vulnérabilités des dépendances...');

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      const dependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

      // Dépendances connues avec des vulnérabilités
      const knownVulnerabilities = {
        'react-scripts': {
          versions: ['<5.0.0'],
          severity: 'medium',
          issue: 'Vulnérabilités dans les versions anciennes'
        },
        'lodash': {
          versions: ['<4.17.21'],
          severity: 'high',
          issue: 'Prototype pollution'
        }
      };

      for (const [dep, info] of Object.entries(knownVulnerabilities)) {
        if (dependencies[dep]) {
          this.warnings.push({
            severity: info.severity,
            type: 'Dependency',
            message: `Vulnérabilité potentielle dans ${dep}`,
            recommendation: `Mettre à jour ${dep} vers une version sécurisée`
          });
        }
      }

      // Vérifier les dépendances obsolètes
      const outdatedPatterns = [
        'react@16',
        'react@17',
        'node-sass',
        'babel-eslint'
      ];

      for (const pattern of outdatedPatterns) {
        const [pkg] = pattern.split('@');
        if (dependencies[pkg]) {
          this.warnings.push({
            severity: 'low',
            type: 'Outdated',
            message: `Dépendance potentiellement obsolète: ${pkg}`,
            recommendation: `Considérer la mise à jour de ${pkg}`
          });
        }
      }

      console.log('✅ Dépendances vérifiées');

    } catch (error) {
      console.error('❌ Erreur lors de la vérification des dépendances:', error.message);
    }
  }

  async checkCodeSecurity() {
    console.log('\n🔍 Vérification de la sécurité du code...');

    try {
      const allFiles = this.getAllFiles('src', ['.tsx', '.ts', '.jsx', '.js']);

      for (const file of allFiles) {
        const content = fs.readFileSync(file, 'utf8');

        // Vérifier les patterns dangereux
        const dangerousPatterns = [
          {
            pattern: /eval\s*\(/g,
            message: 'Utilisation d\'eval() détectée',
            severity: 'critical'
          },
          {
            pattern: /innerHTML\s*=/g,
            message: 'Utilisation d\'innerHTML détectée',
            severity: 'medium'
          },
          {
            pattern: /document\.write/g,
            message: 'Utilisation de document.write détectée',
            severity: 'medium'
          },
          {
            pattern: /window\.location\.href\s*=/g,
            message: 'Redirection non contrôlée détectée',
            severity: 'low'
          }
        ];

        for (const { pattern, message, severity } of dangerousPatterns) {
          if (pattern.test(content)) {
            this.warnings.push({
              severity,
              type: 'Code Security',
              message: `${message} dans ${file}`,
              recommendation: 'Utiliser des alternatives sécurisées'
            });
          }
        }

        // Vérifier les commentaires avec des informations sensibles
        const sensitiveComments = content.match(/\/\/.*(?:password|secret|key|token|api)/gi);
        if (sensitiveComments) {
          this.warnings.push({
            severity: 'low',
            type: 'Information Disclosure',
            message: `Commentaires potentiellement sensibles dans ${file}`,
            recommendation: 'Supprimer les informations sensibles des commentaires'
          });
        }
      }

      console.log('✅ Sécurité du code vérifiée');

    } catch (error) {
      console.error('❌ Erreur lors de la vérification du code:', error.message);
    }
  }

  async checkDatabaseSecurity() {
    console.log('\n🗄️ Vérification de la sécurité de la base de données...');

    try {
      // Vérifier la configuration Supabase
      const supabaseConfigPath = 'src/lib/supabase.ts';
      if (!fs.existsSync(supabaseConfigPath)) {
        this.vulnerabilities.push({
          severity: 'critical',
          type: 'Database',
          message: 'Configuration Supabase manquante',
          recommendation: 'Configurer correctement le client Supabase'
        });
        return;
      }

      const supabaseContent = fs.readFileSync(supabaseConfigPath, 'utf8');

      // Vérifier l'utilisation des variables d'environnement
      if (!supabaseContent.includes('import.meta.env')) {
        this.vulnerabilities.push({
          severity: 'high',
          type: 'Database',
          message: 'Clés Supabase potentiellement hardcodées',
          recommendation: 'Utiliser les variables d\'environnement'
        });
      }

      // Vérifier les migrations SQL
      if (fs.existsSync('supabase/migrations')) {
        const migrationFiles = fs.readdirSync('supabase/migrations')
          .filter(f => f.endsWith('.sql'));

        for (const migrationFile of migrationFiles) {
          const migrationPath = path.join('supabase/migrations', migrationFile);
          const migrationContent = fs.readFileSync(migrationPath, 'utf8');

          // Vérifier RLS
          if (!migrationContent.includes('ROW LEVEL SECURITY')) {
            this.warnings.push({
              severity: 'high',
              type: 'Database Security',
              message: `RLS manquant dans ${migrationFile}`,
              recommendation: 'Activer Row Level Security sur toutes les tables'
            });
          }

          // Vérifier les politiques
          if (!migrationContent.includes('CREATE POLICY')) {
            this.warnings.push({
              severity: 'medium',
              type: 'Database Security',
              message: `Politiques de sécurité manquantes dans ${migrationFile}`,
              recommendation: 'Créer des politiques RLS appropriées'
            });
          }
        }
      }

      console.log('✅ Sécurité de la base de données vérifiée');

    } catch (error) {
      console.error('❌ Erreur lors de la vérification de la base de données:', error.message);
    }
  }

  getAllFiles(dirPath, extensions) {
    if (!fs.existsSync(dirPath)) return [];
    
    let allFiles = [];
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        allFiles = allFiles.concat(this.getAllFiles(filePath, extensions));
      } else if (extensions.some(ext => file.endsWith(ext))) {
        allFiles.push(filePath);
      }
    }
    
    return allFiles;
  }

  generateSecurityReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🔒 RAPPORT DE SÉCURITÉ');
    console.log('='.repeat(60));

    const totalIssues = this.vulnerabilities.length + this.warnings.length;
    const criticalIssues = this.vulnerabilities.filter(v => v.severity === 'critical').length;
    const highIssues = this.vulnerabilities.filter(v => v.severity === 'high').length + 
                      this.warnings.filter(w => w.severity === 'high').length;

    console.log(`\n📊 RÉSUMÉ:`);
    console.log(`   Total des problèmes: ${totalIssues}`);
    console.log(`   Critiques: ${criticalIssues}`);
    console.log(`   Élevés: ${highIssues}`);
    console.log(`   Moyens: ${this.vulnerabilities.filter(v => v.severity === 'medium').length + this.warnings.filter(w => w.severity === 'medium').length}`);
    console.log(`   Faibles: ${this.vulnerabilities.filter(v => v.severity === 'low').length + this.warnings.filter(w => w.severity === 'low').length}`);

    // Score de sécurité
    const securityScore = this.calculateSecurityScore();
    console.log(`\n🎯 SCORE DE SÉCURITÉ: ${this.getScoreEmoji(securityScore)} ${securityScore}/100`);

    // Vulnérabilités critiques
    if (this.vulnerabilities.length > 0) {
      console.log('\n🚨 VULNÉRABILITÉS:');
      for (const vuln of this.vulnerabilities) {
        const icon = vuln.severity === 'critical' ? '🔴' : vuln.severity === 'high' ? '🟠' : '🟡';
        console.log(`   ${icon} [${vuln.severity.toUpperCase()}] ${vuln.message}`);
        console.log(`      → ${vuln.recommendation}`);
      }
    }

    // Avertissements
    if (this.warnings.length > 0) {
      console.log('\n⚠️ AVERTISSEMENTS:');
      for (const warning of this.warnings) {
        const icon = warning.severity === 'high' ? '🟠' : warning.severity === 'medium' ? '🟡' : '🔵';
        console.log(`   ${icon} [${warning.severity.toUpperCase()}] ${warning.message}`);
        console.log(`      → ${warning.recommendation}`);
      }
    }

    // Recommandations générales
    console.log('\n💡 RECOMMANDATIONS GÉNÉRALES:');
    const generalRecommendations = [
      'Implémenter des headers de sécurité (CSP, HSTS, etc.)',
      'Configurer un système de monitoring de sécurité',
      'Effectuer des audits de sécurité réguliers',
      'Mettre en place des tests de pénétration',
      'Former l\'équipe aux bonnes pratiques de sécurité'
    ];

    for (const rec of generalRecommendations) {
      console.log(`   💡 ${rec}`);
    }

    // Sauvegarder le rapport
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        totalIssues,
        criticalIssues,
        highIssues,
        securityScore
      },
      vulnerabilities: this.vulnerabilities,
      warnings: this.warnings,
      recommendations: generalRecommendations
    };

    fs.writeFileSync('security-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Rapport détaillé sauvegardé dans security-report.json');

    // Statut final
    if (criticalIssues > 0) {
      console.log('\n🚨 STATUT: VULNÉRABILITÉS CRITIQUES DÉTECTÉES - ACTION IMMÉDIATE REQUISE');
    } else if (highIssues > 0) {
      console.log('\n⚠️ STATUT: PROBLÈMES DE SÉCURITÉ ÉLEVÉS - CORRECTIONS RECOMMANDÉES');
    } else if (totalIssues > 0) {
      console.log('\n✅ STATUT: SÉCURITÉ ACCEPTABLE - AMÉLIORATIONS MINEURES POSSIBLES');
    } else {
      console.log('\n🎉 STATUT: EXCELLENTE SÉCURITÉ - AUCUN PROBLÈME DÉTECTÉ');
    }
  }

  calculateSecurityScore() {
    let score = 100;

    // Pénalités par sévérité
    score -= this.vulnerabilities.filter(v => v.severity === 'critical').length * 25;
    score -= this.vulnerabilities.filter(v => v.severity === 'high').length * 15;
    score -= this.vulnerabilities.filter(v => v.severity === 'medium').length * 10;
    score -= this.vulnerabilities.filter(v => v.severity === 'low').length * 5;

    score -= this.warnings.filter(w => w.severity === 'high').length * 10;
    score -= this.warnings.filter(w => w.severity === 'medium').length * 5;
    score -= this.warnings.filter(w => w.severity === 'low').length * 2;

    return Math.max(0, score);
  }

  getScoreEmoji(score) {
    if (score >= 90) return '🟢';
    if (score >= 70) return '🟡';
    if (score >= 50) return '🟠';
    return '🔴';
  }
}

// Exécution des tests
if (require.main === module) {
  const securityTest = new SecurityTest();
  securityTest.runSecurityTests().catch(error => {
    console.error('Erreur lors des tests de sécurité:', error);
    process.exit(1);
  });
}

module.exports = SecurityTest;