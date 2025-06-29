# Guide de Déploiement - Dounie Cuisine Pro

## 🚀 Table des Matières

1. [Préparation](#préparation)
2. [Déploiement Netlify](#déploiement-netlify)
3. [Déploiement Vercel](#déploiement-vercel)
4. [Configuration DNS](#configuration-dns)
5. [Variables d'Environnement](#variables-denvironnement)
6. [Monitoring](#monitoring)

## 📋 Préparation

### Prérequis

- [ ] Code source finalisé et testé
- [ ] Base de données Supabase configurée
- [ ] Variables d'environnement définies
- [ ] Tests passants
- [ ] Build de production fonctionnel

### Vérifications pré-déploiement

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer les tests
npm run test

# 3. Vérifier le build
npm run build

# 4. Tester le build localement
npm run preview
```

### Optimisations

1. **Optimisation des images**
   ```typescript
   // Utiliser des formats optimisés
   const imageUrl = `${baseUrl}?format=webp&quality=80&w=800`;
   ```

2. **Code splitting**
   ```typescript
   // Lazy loading des pages
   const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
   ```

3. **Minification**
   ```javascript
   // vite.config.ts
   export default defineConfig({
     build: {
       minify: 'terser',
       terserOptions: {
         compress: {
           drop_console: true,
           drop_debugger: true
         }
       }
     }
   });
   ```

## 🌐 Déploiement Netlify

### Méthode 1: Interface Web

1. **Connexion à Netlify**
   - Aller sur [netlify.com](https://netlify.com)
   - Se connecter avec GitHub

2. **Nouveau site**
   - Cliquer "New site from Git"
   - Sélectionner le repository
   - Configurer les paramètres de build

3. **Configuration de build**
   ```
   Build command: npm run build
   Publish directory: dist
   ```

4. **Variables d'environnement**
   - Aller dans Site settings > Environment variables
   - Ajouter les variables Supabase

### Méthode 2: Netlify CLI

```bash
# 1. Installer Netlify CLI
npm install -g netlify-cli

# 2. Login
netlify login

# 3. Initialiser le site
netlify init

# 4. Déployer
netlify deploy --prod
```

### Configuration netlify.toml

```toml
[build]
  publish = "dist"
  command = "npm run build"

[build.environment]
  NODE_VERSION = "18"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[[headers]]
  for = "/static/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
```

### Déploiement automatique

```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Build
      run: npm run build
      env:
        VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
        VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
    
    - name: Deploy to Netlify
      uses: netlify/actions/cli@master
      with:
        args: deploy --dir=dist --prod
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## ▲ Déploiement Vercel

### Méthode 1: Interface Web

1. **Connexion à Vercel**
   - Aller sur [vercel.com](https://vercel.com)
   - Se connecter avec GitHub

2. **Import du projet**
   - Cliquer "New Project"
   - Sélectionner le repository
   - Configurer automatiquement détecté

3. **Variables d'environnement**
   - Ajouter les variables Supabase
   - Déployer

### Méthode 2: Vercel CLI

```bash
# 1. Installer Vercel CLI
npm install -g vercel

# 2. Login
vercel login

# 3. Déployer
vercel --prod
```

### Configuration vercel.json

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/static/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

## 🌍 Configuration DNS

### Domaine personnalisé

1. **Acheter un domaine**
   - Recommandé: Namecheap, Google Domains, OVH

2. **Configuration DNS**
   ```
   Type: CNAME
   Name: www
   Value: your-site.netlify.app
   
   Type: A
   Name: @
   Value: 75.2.60.5 (IP Netlify)
   ```

3. **SSL/TLS**
   - Activé automatiquement par Netlify/Vercel
   - Certificat Let's Encrypt

### Sous-domaines

```
admin.dounieculisine.ca -> Admin interface
api.dounieculisine.ca -> API endpoints
docs.dounieculisine.ca -> Documentation
```

## 🔐 Variables d'Environnement

### Variables de production

```env
# Supabase
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Analytics (optionnel)
VITE_GA_TRACKING_ID=GA-XXXXXXXXX

# Sentry (optionnel)
VITE_SENTRY_DSN=https://your-sentry-dsn

# Environment
NODE_ENV=production
```

### Sécurité des variables

1. **Variables publiques** (VITE_*)
   - Visibles côté client
   - Pas de secrets sensibles

2. **Variables serveur**
   - Uniquement pour les fonctions serverless
   - Clés API privées

3. **Rotation des clés**
   - Changer régulièrement les clés API
   - Utiliser des clés différentes par environnement

## 📊 Monitoring

### Analytics

1. **Google Analytics 4**
   ```typescript
   // src/lib/analytics.ts
   import { gtag } from 'ga-gtag';
   
   export const trackEvent = (action: string, category: string) => {
     gtag('event', action, {
       event_category: category,
       event_label: window.location.pathname
     });
   };
   ```

2. **Plausible Analytics** (alternative privacy-friendly)
   ```html
   <script defer data-domain="dounieculisine.ca" src="https://plausible.io/js/plausible.js"></script>
   ```

### Monitoring d'erreurs

1. **Sentry**
   ```typescript
   // src/lib/sentry.ts
   import * as Sentry from "@sentry/react";
   
   Sentry.init({
     dsn: import.meta.env.VITE_SENTRY_DSN,
     environment: import.meta.env.NODE_ENV,
     tracesSampleRate: 1.0,
   });
   ```

2. **LogRocket** (sessions utilisateur)
   ```typescript
   import LogRocket from 'logrocket';
   
   LogRocket.init('your-app-id');
   ```

### Performance

1. **Web Vitals**
   ```typescript
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
   
   getCLS(console.log);
   getFID(console.log);
   getFCP(console.log);
   getLCP(console.log);
   getTTFB(console.log);
   ```

2. **Lighthouse CI**
   ```yaml
   # .github/workflows/lighthouse.yml
   name: Lighthouse CI
   on: [push]
   jobs:
     lighthouse:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v3
         - name: Audit URLs using Lighthouse
           uses: treosh/lighthouse-ci-action@v9
           with:
             urls: |
               https://dounieculisine.ca
               https://dounieculisine.ca/menu
             uploadArtifacts: true
   ```

### Uptime monitoring

1. **UptimeRobot**
   - Monitoring gratuit
   - Alertes par email/SMS

2. **Pingdom**
   - Monitoring avancé
   - Métriques de performance

### Alertes

```javascript
// Webhook Slack pour les erreurs critiques
const sendSlackAlert = async (error) => {
  await fetch(process.env.SLACK_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: `🚨 Erreur critique: ${error.message}`,
      channel: '#alerts'
    })
  });
};
```

## 🔄 CI/CD Pipeline

### GitHub Actions

```yaml
name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Run linting
        run: npm run lint
      
      - name: Type check
        run: npm run type-check

  build:
    needs: test
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          VITE_SUPABASE_URL: ${{ secrets.VITE_SUPABASE_URL }}
          VITE_SUPABASE_ANON_KEY: ${{ secrets.VITE_SUPABASE_ANON_KEY }}
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: dist
          path: dist/

  deploy:
    needs: build
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    steps:
      - uses: actions/checkout@v3
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: dist
          path: dist/
      
      - name: Deploy to Netlify
        uses: netlify/actions/cli@master
        with:
          args: deploy --dir=dist --prod
        env:
          NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
          NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

## 🔒 Sécurité

### Headers de sécurité

```toml
# netlify.toml
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    X-XSS-Protection = "1; mode=block"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdn.jsdelivr.net; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' https://*.supabase.co"
```

### Audit de sécurité

```bash
# Audit des dépendances
npm audit

# Fix automatique
npm audit fix

# Audit manuel
npm audit --audit-level high
```

## 📈 Optimisations post-déploiement

### Performance

1. **Compression Gzip/Brotli**
   - Activée automatiquement par Netlify/Vercel

2. **CDN**
   - Distribution mondiale automatique

3. **Cache**
   ```javascript
   // Service Worker pour le cache
   if ('serviceWorker' in navigator) {
     navigator.serviceWorker.register('/sw.js');
   }
   ```

### SEO

1. **Meta tags**
   ```html
   <meta name="description" content="Service traiteur haïtien premium à Montréal">
   <meta property="og:title" content="Dounie Cuisine Pro">
   <meta property="og:description" content="Cuisine haïtienne authentique">
   ```

2. **Sitemap**
   ```xml
   <!-- public/sitemap.xml -->
   <?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://dounieculisine.ca/</loc>
       <changefreq>weekly</changefreq>
       <priority>1.0</priority>
     </url>
   </urlset>
   ```

---

**Checklist de déploiement** ✅

- [ ] Tests passants
- [ ] Build de production fonctionnel
- [ ] Variables d'environnement configurées
- [ ] DNS configuré
- [ ] SSL activé
- [ ] Monitoring en place
- [ ] Sauvegardes configurées
- [ ] Documentation mise à jour

**Support**: support@dounieculisine.ca  
**Dernière mise à jour**: Mars 2024