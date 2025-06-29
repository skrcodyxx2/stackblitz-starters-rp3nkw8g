/**
 * Tests de Performance - Dounie Cuisine Pro
 * Mesure les métriques de performance de l'application
 */

const fs = require('fs');
const path = require('path');

class PerformanceTest {
  constructor() {
    this.results = {
      bundleSize: {},
      dependencies: {},
      codeQuality: {},
      recommendations: []
    };
  }

  async runPerformanceTests() {
    console.log('🚀 Démarrage des tests de performance...\n');

    await this.analyzeBundleSize();
    await this.analyzeDependencies();
    await this.analyzeCodeQuality();
    await this.analyzeImages();
    await this.generateRecommendations();

    this.generateReport();
  }

  async analyzeBundleSize() {
    console.log('📦 Analyse de la taille du bundle...');

    try {
      // Analyser la taille des fichiers source
      const srcSize = this.getDirectorySize('src');
      const publicSize = this.getDirectorySize('public');
      const nodeModulesSize = this.getDirectorySize('node_modules');

      this.results.bundleSize = {
        sourceCode: this.formatBytes(srcSize),
        publicAssets: this.formatBytes(publicSize),
        dependencies: this.formatBytes(nodeModulesSize),
        totalProject: this.formatBytes(srcSize + publicSize + nodeModulesSize)
      };

      // Analyser les gros fichiers
      const largeFiles = this.findLargeFiles('src', 50 * 1024); // > 50KB
      if (largeFiles.length > 0) {
        this.results.bundleSize.largeFiles = largeFiles;
        this.results.recommendations.push({
          type: 'warning',
          message: `${largeFiles.length} fichiers volumineux détectés (>50KB)`,
          files: largeFiles
        });
      }

      console.log(`✅ Code source: ${this.results.bundleSize.sourceCode}`);
      console.log(`✅ Assets publics: ${this.results.bundleSize.publicAssets}`);
      console.log(`✅ Dépendances: ${this.results.bundleSize.dependencies}`);

    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse du bundle:', error.message);
    }
  }

  async analyzeDependencies() {
    console.log('\n📚 Analyse des dépendances...');

    try {
      const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
      
      const dependencies = packageJson.dependencies || {};
      const devDependencies = packageJson.devDependencies || {};
      
      this.results.dependencies = {
        production: Object.keys(dependencies).length,
        development: Object.keys(devDependencies).length,
        total: Object.keys(dependencies).length + Object.keys(devDependencies).length,
        list: {
          production: dependencies,
          development: devDependencies
        }
      };

      // Vérifier les dépendances lourdes connues
      const heavyDeps = [
        '@supabase/supabase-js',
        'react-router-dom',
        'framer-motion',
        '@headlessui/react'
      ];

      const foundHeavyDeps = heavyDeps.filter(dep => dependencies[dep]);
      if (foundHeavyDeps.length > 0) {
        this.results.recommendations.push({
          type: 'info',
          message: 'Dépendances lourdes détectées - vérifier si toutes sont nécessaires',
          deps: foundHeavyDeps
        });
      }

      // Vérifier les doublons potentiels
      const duplicates = this.findPotentialDuplicates(dependencies);
      if (duplicates.length > 0) {
        this.results.recommendations.push({
          type: 'warning',
          message: 'Doublons potentiels de dépendances détectés',
          duplicates: duplicates
        });
      }

      console.log(`✅ Dépendances de production: ${this.results.dependencies.production}`);
      console.log(`✅ Dépendances de développement: ${this.results.dependencies.development}`);

    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse des dépendances:', error.message);
    }
  }

  async analyzeCodeQuality() {
    console.log('\n🔍 Analyse de la qualité du code...');

    try {
      const metrics = {
        totalFiles: 0,
        totalLines: 0,
        avgFileSize: 0,
        largestFile: { name: '', lines: 0 },
        componentFiles: 0,
        pageFiles: 0,
        utilFiles: 0,
        typeFiles: 0
      };

      const srcFiles = this.getAllFiles('src', ['.tsx', '.ts', '.jsx', '.js']);
      
      for (const file of srcFiles) {
        const content = fs.readFileSync(file, 'utf8');
        const lines = content.split('\n').length;
        
        metrics.totalFiles++;
        metrics.totalLines += lines;
        
        if (lines > metrics.largestFile.lines) {
          metrics.largestFile = { name: file, lines };
        }
        
        // Catégoriser les fichiers
        if (file.includes('/components/')) metrics.componentFiles++;
        else if (file.includes('/pages/')) metrics.pageFiles++;
        else if (file.includes('/utils/')) metrics.utilFiles++;
        else if (file.includes('/types/')) metrics.typeFiles++;
      }

      metrics.avgFileSize = Math.round(metrics.totalLines / metrics.totalFiles);

      this.results.codeQuality = metrics;

      // Recommandations basées sur les métriques
      if (metrics.largestFile.lines > 300) {
        this.results.recommendations.push({
          type: 'warning',
          message: `Fichier très volumineux détecté: ${metrics.largestFile.name} (${metrics.largestFile.lines} lignes)`,
          suggestion: 'Considérer la refactorisation en composants plus petits'
        });
      }

      if (metrics.avgFileSize > 150) {
        this.results.recommendations.push({
          type: 'info',
          message: `Taille moyenne des fichiers élevée: ${metrics.avgFileSize} lignes`,
          suggestion: 'Vérifier si certains fichiers peuvent être divisés'
        });
      }

      console.log(`✅ Fichiers analysés: ${metrics.totalFiles}`);
      console.log(`✅ Lignes de code total: ${metrics.totalLines}`);
      console.log(`✅ Taille moyenne: ${metrics.avgFileSize} lignes/fichier`);

    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse de la qualité:', error.message);
    }
  }

  async analyzeImages() {
    console.log('\n🖼️ Analyse des images...');

    try {
      const imageAnalysis = {
        totalImages: 0,
        optimizedImages: 0,
        unoptimizedImages: [],
        externalImages: 0,
        localImages: 0
      };

      // Analyser les références d'images dans le code
      const allFiles = this.getAllFiles('src', ['.tsx', '.ts', '.jsx', '.js']);
      
      for (const file of allFiles) {
        const content = fs.readFileSync(file, 'utf8');
        
        // Chercher les URLs d'images
        const imageUrls = content.match(/https?:\/\/[^"'\s]*\.(jpg|jpeg|png|gif|webp|svg)/gi) || [];
        const localImages = content.match(/src=["'][^"']*\.(jpg|jpeg|png|gif|webp|svg)["']/gi) || [];
        
        imageAnalysis.totalImages += imageUrls.length + localImages.length;
        imageAnalysis.externalImages += imageUrls.length;
        imageAnalysis.localImages += localImages.length;
        
        // Vérifier l'optimisation des images Pexels
        for (const url of imageUrls) {
          if (url.includes('pexels.com')) {
            if (url.includes('auto=compress') && url.includes('cs=tinysrgb')) {
              imageAnalysis.optimizedImages++;
            } else {
              imageAnalysis.unoptimizedImages.push({
                file: file,
                url: url.substring(0, 80) + '...'
              });
            }
          }
        }
      }

      this.results.images = imageAnalysis;

      if (imageAnalysis.unoptimizedImages.length > 0) {
        this.results.recommendations.push({
          type: 'warning',
          message: `${imageAnalysis.unoptimizedImages.length} images non optimisées détectées`,
          suggestion: 'Ajouter les paramètres auto=compress&cs=tinysrgb aux URLs Pexels',
          images: imageAnalysis.unoptimizedImages
        });
      }

      console.log(`✅ Images analysées: ${imageAnalysis.totalImages}`);
      console.log(`✅ Images optimisées: ${imageAnalysis.optimizedImages}`);
      console.log(`✅ Images externes: ${imageAnalysis.externalImages}`);

    } catch (error) {
      console.error('❌ Erreur lors de l\'analyse des images:', error.message);
    }
  }

  async generateRecommendations() {
    console.log('\n💡 Génération des recommandations...');

    // Recommandations générales basées sur l'analyse
    const generalRecommendations = [
      {
        type: 'info',
        category: 'Performance',
        message: 'Implémenter le lazy loading pour les pages non critiques',
        priority: 'medium'
      },
      {
        type: 'info',
        category: 'SEO',
        message: 'Ajouter des meta descriptions pour toutes les pages',
        priority: 'medium'
      },
      {
        type: 'info',
        category: 'Accessibilité',
        message: 'Vérifier les contrastes de couleurs et les alt texts',
        priority: 'high'
      },
      {
        type: 'info',
        category: 'Sécurité',
        message: 'Implémenter CSP (Content Security Policy) headers',
        priority: 'high'
      },
      {
        type: 'info',
        category: 'Performance',
        message: 'Considérer l\'utilisation d\'un CDN pour les assets statiques',
        priority: 'low'
      }
    ];

    this.results.recommendations.push(...generalRecommendations);

    console.log(`✅ ${this.results.recommendations.length} recommandations générées`);
  }

  // Utilitaires
  getDirectorySize(dirPath) {
    if (!fs.existsSync(dirPath)) return 0;
    
    let totalSize = 0;
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        totalSize += this.getDirectorySize(filePath);
      } else {
        totalSize += stats.size;
      }
    }
    
    return totalSize;
  }

  findLargeFiles(dirPath, sizeLimit) {
    if (!fs.existsSync(dirPath)) return [];
    
    let largeFiles = [];
    const files = fs.readdirSync(dirPath);
    
    for (const file of files) {
      const filePath = path.join(dirPath, file);
      const stats = fs.statSync(filePath);
      
      if (stats.isDirectory()) {
        largeFiles = largeFiles.concat(this.findLargeFiles(filePath, sizeLimit));
      } else if (stats.size > sizeLimit) {
        largeFiles.push({
          path: filePath,
          size: this.formatBytes(stats.size)
        });
      }
    }
    
    return largeFiles;
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

  findPotentialDuplicates(dependencies) {
    const duplicates = [];
    const depNames = Object.keys(dependencies);
    
    // Chercher des patterns de doublons communs
    const patterns = [
      ['react-router', 'react-router-dom'],
      ['lodash', 'lodash-es'],
      ['moment', 'dayjs', 'date-fns'],
      ['axios', 'fetch']
    ];
    
    for (const pattern of patterns) {
      const found = pattern.filter(dep => depNames.some(name => name.includes(dep)));
      if (found.length > 1) {
        duplicates.push(found);
      }
    }
    
    return duplicates;
  }

  formatBytes(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('📊 RAPPORT DE PERFORMANCE');
    console.log('='.repeat(60));

    // Résumé du bundle
    console.log('\n📦 TAILLE DU BUNDLE:');
    console.log(`   Code source: ${this.results.bundleSize.sourceCode}`);
    console.log(`   Assets publics: ${this.results.bundleSize.publicAssets}`);
    console.log(`   Dépendances: ${this.results.bundleSize.dependencies}`);

    // Résumé des dépendances
    console.log('\n📚 DÉPENDANCES:');
    console.log(`   Production: ${this.results.dependencies.production}`);
    console.log(`   Développement: ${this.results.dependencies.development}`);
    console.log(`   Total: ${this.results.dependencies.total}`);

    // Résumé de la qualité du code
    console.log('\n🔍 QUALITÉ DU CODE:');
    console.log(`   Fichiers analysés: ${this.results.codeQuality.totalFiles}`);
    console.log(`   Lignes de code: ${this.results.codeQuality.totalLines}`);
    console.log(`   Taille moyenne: ${this.results.codeQuality.avgFileSize} lignes/fichier`);
    console.log(`   Plus gros fichier: ${this.results.codeQuality.largestFile.lines} lignes`);

    // Images
    if (this.results.images) {
      console.log('\n🖼️ IMAGES:');
      console.log(`   Total: ${this.results.images.totalImages}`);
      console.log(`   Optimisées: ${this.results.images.optimizedImages}`);
      console.log(`   Non optimisées: ${this.results.images.unoptimizedImages.length}`);
    }

    // Recommandations
    console.log('\n💡 RECOMMANDATIONS:');
    const priorityOrder = { high: 1, medium: 2, low: 3 };
    const sortedRecommendations = this.results.recommendations.sort((a, b) => {
      return (priorityOrder[a.priority] || 4) - (priorityOrder[b.priority] || 4);
    });

    for (const rec of sortedRecommendations) {
      const icon = rec.type === 'warning' ? '⚠️' : rec.type === 'error' ? '❌' : '💡';
      const priority = rec.priority ? `[${rec.priority.toUpperCase()}]` : '';
      console.log(`   ${icon} ${priority} ${rec.message}`);
      if (rec.suggestion) {
        console.log(`      → ${rec.suggestion}`);
      }
    }

    // Score de performance global
    const performanceScore = this.calculatePerformanceScore();
    console.log('\n🎯 SCORE DE PERFORMANCE GLOBAL:');
    console.log(`   ${this.getScoreEmoji(performanceScore)} ${performanceScore}/100`);
    console.log(`   ${this.getScoreDescription(performanceScore)}`);

    // Sauvegarder le rapport
    const report = {
      timestamp: new Date().toISOString(),
      bundleSize: this.results.bundleSize,
      dependencies: this.results.dependencies,
      codeQuality: this.results.codeQuality,
      images: this.results.images,
      recommendations: this.results.recommendations,
      performanceScore: performanceScore
    };

    fs.writeFileSync('performance-report.json', JSON.stringify(report, null, 2));
    console.log('\n📄 Rapport détaillé sauvegardé dans performance-report.json');
  }

  calculatePerformanceScore() {
    let score = 100;

    // Pénalités basées sur les problèmes détectés
    const warnings = this.results.recommendations.filter(r => r.type === 'warning').length;
    const errors = this.results.recommendations.filter(r => r.type === 'error').length;

    score -= warnings * 5;
    score -= errors * 10;

    // Bonus pour les bonnes pratiques
    if (this.results.dependencies.production < 15) score += 5;
    if (this.results.codeQuality.avgFileSize < 100) score += 5;
    if (this.results.images && this.results.images.optimizedImages > this.results.images.unoptimizedImages.length) score += 5;

    return Math.max(0, Math.min(100, score));
  }

  getScoreEmoji(score) {
    if (score >= 90) return '🟢';
    if (score >= 70) return '🟡';
    if (score >= 50) return '🟠';
    return '🔴';
  }

  getScoreDescription(score) {
    if (score >= 90) return 'Excellent - Performance optimale';
    if (score >= 70) return 'Bon - Quelques améliorations possibles';
    if (score >= 50) return 'Moyen - Optimisations recommandées';
    return 'Faible - Optimisations nécessaires';
  }
}

// Exécution des tests
if (require.main === module) {
  const perfTest = new PerformanceTest();
  perfTest.runPerformanceTests().catch(error => {
    console.error('Erreur lors des tests de performance:', error);
    process.exit(1);
  });
}

module.exports = PerformanceTest;