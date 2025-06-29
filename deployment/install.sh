#!/bin/bash

# Script d'installation automatique pour Dounie Cuisine Pro
# Compatible avec Debian/Ubuntu

set -e

echo "🚀 Installation de Dounie Cuisine Pro"
echo "======================================"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier si l'utilisateur est root
if [[ $EUID -eq 0 ]]; then
   log_error "Ce script ne doit pas être exécuté en tant que root"
   exit 1
fi

# Vérifier le système d'exploitation
if ! command -v apt &> /dev/null; then
    log_error "Ce script est conçu pour Debian/Ubuntu uniquement"
    exit 1
fi

log_info "Mise à jour du système..."
sudo apt update && sudo apt upgrade -y

# Installation de Node.js
log_info "Installation de Node.js 18.x..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
    log_success "Node.js installé: $(node --version)"
else
    log_success "Node.js déjà installé: $(node --version)"
fi

# Installation des dépendances système
log_info "Installation des dépendances système..."
sudo apt-get install -y build-essential python3 git nginx certbot python3-certbot-nginx ufw fail2ban

# Installation de PM2
log_info "Installation de PM2..."
if ! command -v pm2 &> /dev/null; then
    sudo npm install -g pm2
    log_success "PM2 installé"
else
    log_success "PM2 déjà installé"
fi

# Demander les informations de configuration
echo ""
log_info "Configuration du projet"
echo "======================="

read -p "Nom de domaine (ex: dounieculisine.ca): " DOMAIN_NAME
read -p "Email pour SSL (ex: admin@dounieculisine.ca): " SSL_EMAIL
read -p "Répertoire d'installation [/var/www/dounie-cuisine-pro]: " INSTALL_DIR
INSTALL_DIR=${INSTALL_DIR:-/var/www/dounie-cuisine-pro}

# Créer le répertoire d'installation
log_info "Création du répertoire d'installation..."
sudo mkdir -p $INSTALL_DIR
sudo chown $USER:$USER $INSTALL_DIR

# Cloner le projet (si pas déjà fait)
if [ ! -d "$INSTALL_DIR/.git" ]; then
    log_info "Clonage du projet..."
    # Note: Remplacer par l'URL réelle du repository
    # git clone https://github.com/your-org/dounie-cuisine-pro.git $INSTALL_DIR
    log_warning "Veuillez cloner manuellement le projet dans $INSTALL_DIR"
else
    log_success "Projet déjà cloné"
fi

cd $INSTALL_DIR

# Installation des dépendances du projet
log_info "Installation des dépendances du projet..."
npm install

# Configuration de la base de données
log_info "Configuration de la base de données..."
npm run db:setup
npm run db:seed

# Configuration de l'environnement
log_info "Configuration de l'environnement..."
if [ ! -f .env ]; then
    cp .env.example .env
    
    # Générer une clé JWT sécurisée
    JWT_SECRET=$(openssl rand -base64 32)
    sed -i "s/your-super-secret-jwt-key-change-in-production-2024/$JWT_SECRET/" .env
    sed -i "s/http:\/\/localhost:3001/https:\/\/$DOMAIN_NAME/" .env
    
    log_success "Fichier .env créé et configuré"
fi

# Build de production
log_info "Build de production..."
npm run build

# Configuration de PM2
log_info "Configuration de PM2..."
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

mkdir -p logs

# Configuration de Nginx
log_info "Configuration de Nginx..."
sudo tee /etc/nginx/sites-available/dounie-cuisine-proI see you're trying to use `apt` but it's not available in this environment. This is a WebContainer environment that doesn't have full Linux package management capabilities. Let me create a complete local deployment solution that works within the current environment constraints.

<boltArtifact id="local-deployment-setup" title="Local Deployment with SQLite Database">