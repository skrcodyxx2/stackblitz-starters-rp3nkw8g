/**
 * Script principal pour exécuter tous les tests de Dounie Cuisine Pro
 * Ce script lance tous les tests disponibles et génère un rapport global
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

class TestRunner {
  constructor() {
    this.results = {
      complete: { passed: 0, failed: 0, total: 0 },
      e2e: { passed: 0, failed: 0, total: 0 },
      auth: { passed: 0, failed: 0, total: 0 },
      performance: { passed: 0, failed: 0, total: 0 },
      security: { passed: 0, failed: 0, total: 0 }
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

  async runAllTests() {
    this.log('🚀 DÉMARRAGE DE TOUS LES TESTS POUR DOUNIE CUISINE PRO', 'info');
    this.log('='.repeat(80), 'info');

    try {
      // Exécuter les tests complets
      this.log('\n📋 Exécution des tests complets...', 'info');
      await this.runTest('complete-test.js');
      this.parseResults('complete-test-report.json', 'complete');

      // Exécuter les tests end-to-end
      this.log('\n🎬 Exécution des tests end-to-end...', 'info');
      await this.runTest('e2e-test.js');
      this.parseResults('e2e-test-report.json', 'e2e');

      // Exécuter les tests d'authentification
      this.log('\n🔐 Exécution des tests d\'authentification...', 'info');
      await this.runTest('auth-test.js');
      this.parseResults('auth-test-report.json', 'auth');

      // Exécuter les tests de performance
      this.log('\n⚡ Exécution des tests de performance...', 'info');
      await this.runTest('performance-test.js');
      this.parseResults('performance-report.json', 'performance');

      // Exécuter les tests de sécurité
      this.log('\n🔒 Exécution des tests de sécurité...', 'info');
      await this.runTest('security-test.js');
      this.parseResults('security-report.json', 'security');

      // Générer le rapport global
      this.generateGlobalReport();
    } catch (error) {
      this.log(`\n❌ ERREUR LORS DE L'EXÉCUTION DES TESTS: ${error.message}`, 'error');
      process.exit(1);
    }
  }

  async runTest(testFile) {
    try {
      execSync(`node tests/${testFile}`, { stdio: 'inherit' });
      return true;
    } catch (error) {
      this.log(`\n⚠️ Le test ${testFile} a échoué avec le code ${error.status}`, 'warning');
      return false;
    }
  }

  parseResults(reportFile, category) {
    try {
      if (fs.existsSync(reportFile)) {
        const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'));
        
        if (category === 'performance' || category === 'security') {
          // Format différent pour les rapports de performance et sécurité
          this.results[category].total = report.summary?.total || 0;
          this.results[category].passed = report.summary?.passed || 0;
          this.results[category].failed = report.summary?.failed || 0;
        } else {
          // Format standard pour les autres rapports
          this.results[category].total = report.summary.total;
          this.results[category].passed = report.summary.passed;
          this.results[category].failed = report.summary.failed;
        }
        
        this.log(`   📊 Résultats ${category}: ${this.results[category].passed}/${this.results[category].total} tests réussis`, 
          this.results[category].failed === 0 ? 'success' : 'warning');
      } else {
        this.log(`   ⚠️ Rapport ${reportFile} non trouvé`, 'warning');
      }
    } catch (error) {
      this.log(`   ⚠️ Erreur lors de l'analyse du rapport ${reportFile}: ${error.message}`, 'warning');
    }
  }

  generateGlobalReport() {
    const endTime = Date.now();
    const duration = (endTime - this.startTime) / 1000;
    
    // Calculer les totaux
    const totalTests = Object.values(this.results).reduce((sum, category) => sum + category.total, 0);
    const totalPassed = Object.values(this.results).reduce((sum, category) => sum + category.passed, 0);
    const totalFailed = Object.values(this.results).reduce((sum, category) => sum + category.failed, 0);
    
    this.log('\n' + '='.repeat(80), 'info');
    this.log('📊 RAPPORT GLOBAL DE TESTS', 'info');
    this.log('='.repeat(80), 'info');
    
    this.log(`\n⏱️  Durée totale: ${duration.toFixed(2)}s`, 'info');
    this.log(`📈 Tests réussis: ${totalPassed}/${totalTests} (${((totalPassed / totalTests) * 100).toFixed(1)}%)`, 
      totalFailed === 0 ? 'success' : 'warning');
    
    // Résultats par catégorie
    this.log('\n📋 Résultats par catégorie:', 'info');
    
    const categories = {
      complete: 'Tests complets',
      e2e: 'Tests end-to-end',
      auth: 'Tests d\'authentification',
      performance: 'Tests de performance',
      security: 'Tests de sécurité'
    };
    
    for (const [key, label] of Object.entries(categories)) {
      const category = this.results[key];
      const successRate = category.total > 0 ? ((category.passed / category.total) * 100).toFixed(1) : '0.0';
      
      this.log(`   ${label}: ${category.passed}/${category.total} (${successRate}%)`, 
        category.failed === 0 ? 'success' : 'warning');
    }
    
    // Générer un rapport JSON
    const report = {
      timestamp: new Date().toISOString(),
      duration: duration,
      summary: {
        total: totalTests,
        passed: totalPassed,
        failed: totalFailed,
        successRate: totalTests > 0 ? (totalPassed / totalTests) * 100 : 0
      },
      categories: this.results
    };
    
    fs.writeFileSync('global-test-report.json', JSON.stringify(report, null, 2));
    this.log('\n📄 Rapport global sauvegardé dans global-test-report.json', 'info');
    
    // Statut final
    if (totalFailed === 0) {
      this.log('\n🎉 TOUS LES TESTS SONT PASSÉS! L\'APPLICATION EST PRÊTE POUR LA PRODUCTION!', 'success');
    } else {
      const failureRate = ((totalFailed / totalTests) * 100).toFixed(1);
      
      if (failureRate < 5) {
        this.log(`\n✅ APPLICATION PRÊTE AVEC AVERTISSEMENTS: ${totalFailed} tests ont échoué (${failureRate}%)`, 'warning');
        this.log('   Ces problèmes mineurs peuvent être corrigés dans une prochaine mise à jour.', 'warning');
      } else if (failureRate < 20) {
        this.log(`\n⚠️ APPLICATION PARTIELLEMENT PRÊTE: ${totalFailed} tests ont échoué (${failureRate}%)`, 'warning');
        this.log('   Corriger ces problèmes avant le déploiement en production.', 'warning');
      } else {
        this.log(`\n❌ APPLICATION NON PRÊTE: ${totalFailed} tests ont échoué (${failureRate}%)`, 'error');
        this.log('   Des problèmes majeurs doivent être résolus avant le déploiement.', 'error');
      }
    }
  }
}

// Exécution des tests
const runner = new TestRunner();
runner.runAllTests().catch(error => {
  console.error('Erreur lors de l\'exécution des tests:', error);
  process.exit(1);
});