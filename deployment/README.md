# 🚀 Guide de Déploiement Local - Dounie Cuisine Pro

## 📋 Prérequis

- **Node.js** 18+ ([Télécharger](https://nodejs.org/))
- **npm** (inclus avec Node.js)
- **Système d'exploitation**: Linux (Debian/Ubuntu), macOS, ou Windows avec WSL

## 🛠️ Installation sur Debian/Ubuntu

### 1. Mise à jour du système

```bash
sudo apt update && sudo apt upgrade -y
```

### 2. Installation de Node.js

```bash
# Installer Node.js 18.x
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Vérifier l'installation
node --version
npm --version
```

### 3. Installation des dépendances système

```bash
# Installer les outils de build nécessaires pour better-sqlite3
sudo apt-get install -y build-essential python3

# Installer PM2 pour la gestion des processus (optionnel)
sudo npm install -g pm2
```

### 4. Cloner et configurer le projet

```bash
# Cloner le projet
git clone <repository-url>
cd dounie-cuisine-pro

# Installer les dépendances
npm install

# Configurer la base de données
npm run db:setup
npm run db:seed
```

### 5. Configuration

```bash
# Copier le fichier d'environnement
cp .env.example .env

# Modifier les variables d'environnement
nano .env
```

Variables importantes à configurer :
```env
NODE_ENV=production
PORT=3001
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
DATABASE_PATH=./database.sqlite
APP_URL=http://your-domain.com
```

### 6. Build de production

```bash
# Créer le build de production
npm run build
```

### 7. Démarrage de l'application

#### Option A: Démarrage simple
```bash
# Démarrer l'application
npm start
```

#### Option B: Avec PM2 (recommandé pour la production)
```bash
# Créer le fichier de configuration PM2
cat > ecosystem.config.js << EOF
module.exports = {
  apps: [{
    name: 'dounie-cuisine-pro',
    script: 'server/index.js',
    instances: 'max',
    exec_mode: 'cluster',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/err.log',
    out_file: './logs/out.log',
    log_file: './logs/combined.log',
    time: true
  }]
};
EOF

# Créer le dossier des logs
mkdir -p logs

# Démarrer avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## 🔧 Configuration du Serveur Web (Nginx)

### 1. Installation de Nginx

```bash
sudo apt install nginx -y
```

### 2. Configuration du site

```bash
# Créer la configuration du site
sudo nano /etc/nginx/sites-available/dounie-cuisine-pro
```

Contenu du fichier :
```nginx
server {
    listen 80;
    server_name your-domain.com www.your-domain.com;

    # Redirection vers HTTPS (après configuration SSL)
    # return 301 https://$server_name$request_uri;

    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Gestion des fichiers statiques
    location /static/ {
        alias /path/to/dounie-cuisine-pro/dist/;
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

### 3. Activer le site

```bash
# Créer le lien symbolique
sudo ln -s /etc/nginx/sites-available/dounie-cuisine-pro /etc/nginx/sites-enabled/

# Tester la configuration
sudo nginx -t

# Redémarrer Nginx
sudo systemctl restart nginx
sudo systemctl enable nginx
```

## 🔒 Configuration SSL avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir le certificat SSL
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Vérifier le renouvellement automatique
sudo certbot renew --dry-run
```

## 🗄️ Sauvegarde de la Base de Données

### Script de sauvegarde automatique

```bash
# Créer le script de sauvegarde
cat > backup-db.sh << 'EOF'
#!/bin/bash

# Configuration
DB_PATH="/path/to/dounie-cuisine-pro/database.sqlite"
BACKUP_DIR="/path/to/backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/database_backup_$DATE.sqlite"

# Créer le dossier de sauvegarde
mkdir -p $BACKUP_DIR

# Copier la base de données
cp $DB_PATH $BACKUP_FILE

# Compresser la sauvegarde
gzip $BACKUP_FILE

# Supprimer les sauvegardes de plus de 30 jours
find $BACKUP_DIR -name "database_backup_*.sqlite.gz" -mtime +30 -delete

echo "Sauvegarde créée: $BACKUP_FILE.gz"
EOF

# Rendre le script exécutable
chmod +x backup-db.sh

# Ajouter au crontab pour sauvegarde quotidienne
(crontab -l 2>/dev/null; echo "0 2 * * * /path/to/backup-db.sh") | crontab -
```

## 🔥 Configuration du Firewall

```bash
# Installer UFW
sudo apt install ufw -y

# Configurer les règles de base
sudo ufw default deny incoming
sudo ufw default allow outgoing

# Autoriser SSH
sudo ufw allow ssh

# Autoriser HTTP et HTTPS
sudo ufw allow 80
sudo ufw allow 443

# Activer le firewall
sudo ufw enable

# Vérifier le statut
sudo ufw status
```

## 📊 Monitoring et Logs

### 1. Logs de l'application

```bash
# Voir les logs PM2
pm2 logs dounie-cuisine-pro

# Logs Nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Logs système
sudo journalctl -u nginx -f
```

### 2. Monitoring avec PM2

```bash
# Interface de monitoring
pm2 monit

# Statistiques
pm2 show dounie-cuisine-pro

# Redémarrer l'application
pm2 restart dounie-cuisine-pro

# Recharger la configuration
pm2 reload dounie-cuisine-pro
```

## 🔄 Mise à Jour de l'Application

### Script de mise à jour

```bash
cat > update-app.sh << 'EOF'
#!/bin/bash

echo "🔄 Mise à jour de Dounie Cuisine Pro..."

# Aller dans le répertoire du projet
cd /path/to/dounie-cuisine-pro

# Sauvegarder la base de données
./backup-db.sh

# Mettre à jour le code
git pull origin main

# Installer les nouvelles dépendances
npm install

# Exécuter les migrations de base de données si nécessaire
npm run db:migrate

# Rebuilder l'application
npm run build

# Redémarrer l'application
pm2 reload dounie-cuisine-pro

echo "✅ Mise à jour terminée!"
EOF

chmod +x update-app.sh
```

## 🛡️ Sécurité

### 1. Configuration de sécurité

```bash
# Mettre à jour le système régulièrement
sudo apt update && sudo apt upgrade -y

# Installer fail2ban pour la protection SSH
sudo apt install fail2ban -y

# Configurer fail2ban
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban
```

### 2. Sécurisation de la base de données

```bash
# Permissions strictes sur la base de données
chmod 600 database.sqlite
chown www-data:www-data database.sqlite
```

### 3. Variables d'environnement sécurisées

```bash
# Protéger le fichier .env
chmod 600 .env
chown www-data:www-data .env
```

## 📋 Checklist de Déploiement

- [ ] Node.js 18+ installé
- [ ] Dépendances système installées
- [ ] Base de données configurée et initialisée
- [ ] Variables d'environnement configurées
- [ ] Build de production créé
- [ ] Nginx configuré et actif
- [ ] SSL configuré avec Let's Encrypt
- [ ] Firewall configuré
- [ ] PM2 configuré pour la gestion des processus
- [ ] Sauvegardes automatiques configurées
- [ ] Monitoring en place
- [ ] Tests de fonctionnement effectués

## 🆘 Dépannage

### Problèmes courants

1. **Erreur de permissions sur la base de données**
   ```bash
   sudo chown -R www-data:www-data /path/to/dounie-cuisine-pro
   chmod 755 /path/to/dounie-cuisine-pro
   chmod 600 /path/to/dounie-cuisine-pro/database.sqlite
   ```

2. **Port déjà utilisé**
   ```bash
   # Trouver le processus utilisant le port
   sudo lsof -i :3001
   
   # Tuer le processus
   sudo kill -9 PID
   ```

3. **Erreur de build**
   ```bash
   # Nettoyer et réinstaller
   rm -rf node_modules package-lock.json
   npm install
   npm run build
   ```

4. **Problème de mémoire**
   ```bash
   # Augmenter la limite de mémoire Node.js
   export NODE_OPTIONS="--max-old-space-size=4096"
   npm run build
   ```

## 📞 Support

Pour obtenir de l'aide :
- 📧 Email: support@dounieculisine.ca
- 📚 Documentation: Consultez les fichiers dans `/docs/`
- 🐛 Issues: Créez un ticket sur le repository GitHub

---

**Dernière mise à jour**: Janvier 2025  
**Version**: 2.0.0 (Base de données locale)