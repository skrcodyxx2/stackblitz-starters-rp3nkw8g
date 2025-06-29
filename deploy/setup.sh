#!/bin/bash

# Script d'installation pour Dounie Cuisine Pro
# Ce script installe toutes les dépendances nécessaires et configure
# l'environnement pour exécuter l'application sur Debian/Ubuntu

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
log() {
  echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
  echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
  echo -e "${RED}[ERROR]${NC} $1"
  exit 1
}

# Vérifier si l'utilisateur est root
if [ "$(id -u)" -ne 0 ]; then
  warn "Ce script n'est pas exécuté en tant que root. Certaines opérations pourraient échouer."
  warn "Considérez exécuter avec sudo: sudo $0"
  read -p "Continuer quand même? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Vérifier la distribution
if [ -f /etc/os-release ]; then
  . /etc/os-release
  if [[ "$ID" != "debian" && "$ID" != "ubuntu" ]]; then
    warn "Cette distribution ($ID) n'est pas officiellement supportée."
    warn "Ce script est conçu pour Debian/Ubuntu."
    read -p "Continuer quand même? (y/n) " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
      exit 1
    fi
  fi
else
  warn "Impossible de déterminer la distribution."
  read -p "Continuer quand même? (y/n) " -n 1 -r
  echo
  if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    exit 1
  fi
fi

# Chemin de l'application
APP_PATH=$(cd .. && pwd)
log "Chemin de l'application: $APP_PATH"

# Mettre à jour les paquets
log "Mise à jour des paquets..."
apt-get update || warn "Impossible de mettre à jour les paquets. Continuons..."

# Installer les dépendances système
log "Installation des dépendances système..."
apt-get install -y curl gnupg2 ca-certificates lsb-release apt-transport-https || warn "Impossible d'installer certaines dépendances. Continuons..."

# Installer Node.js si nécessaire
if ! command -v node &> /dev/null || [[ $(node -v | cut -d. -f1 | tr -d 'v') -lt 18 ]]; then
  log "Installation de Node.js 18..."
  curl -fsSL https://deb.nodesource.com/setup_18.x | bash - || error "Impossible d'installer Node.js"
  apt-get install -y nodejs || error "Impossible d'installer Node.js"
else
  log "Node.js $(node -v) est déjà installé."
fi

# Installer PostgreSQL si nécessaire
if ! command -v psql &> /dev/null; then
  log "Installation de PostgreSQL..."
  apt-get install -y postgresql postgresql-contrib || error "Impossible d'installer PostgreSQL"
else
  log "PostgreSQL est déjà installé."
fi

# Créer la base de données et l'utilisateur
log "Configuration de la base de données PostgreSQL..."
if sudo -u postgres psql -lqt | cut -d \| -f 1 | grep -qw dounie_cuisine; then
  log "La base de données dounie_cuisine existe déjà."
else
  log "Création de la base de données et de l'utilisateur..."
  sudo -u postgres psql -c "CREATE USER dounie_user WITH PASSWORD 'dounie_password';" || warn "L'utilisateur existe peut-être déjà"
  sudo -u postgres psql -c "CREATE DATABASE dounie_cuisine OWNER dounie_user;" || error "Impossible de créer la base de données"
  sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE dounie_cuisine TO dounie_user;" || warn "Impossible de définir les privilèges"
  
  # Importer le schéma et les données
  log "Importation du schéma de base de données..."
  sudo -u postgres psql -d dounie_cuisine -f "$(pwd)/schema.sql" || error "Impossible d'importer le schéma"
  
  log "Importation des données initiales..."
  sudo -u postgres psql -d dounie_cuisine -f "$(pwd)/seed.sql" || warn "Impossible d'importer les données initiales"
fi

# Installer les dépendances npm
log "Installation des dépendances npm..."
cd "$APP_PATH" || error "Impossible d'accéder au répertoire de l'application"
npm install || error "Impossible d'installer les dépendances npm"

# Créer le fichier .env s'il n'existe pas
if [ ! -f "$APP_PATH/.env" ]; then
  log "Création du fichier .env..."
  cp "$(pwd)/deploy/.env.example" "$APP_PATH/.env" || warn "Impossible de créer le fichier .env"
  log "Veuillez modifier le fichier .env avec vos paramètres."
else
  log "Le fichier .env existe déjà."
fi

# Créer le répertoire de logs
log "Création du répertoire de logs..."
mkdir -p /var/log/dounie-cuisine || warn "Impossible de créer le répertoire de logs"
chmod 755 /var/log/dounie-cuisine || warn "Impossible de définir les permissions du répertoire de logs"

# Configuration de Nginx (optionnel)
if command -v nginx &> /dev/null; then
  log "Nginx est installé. Voulez-vous configurer un serveur web?"
  read -p "Configurer Nginx? (y/n) " -n 1 -r
  echo
  if [[ $REPLY =~ ^[Yy]$ ]]; then
    log "Configuration de Nginx..."
    cp "$(pwd)/nginx/dounie-cuisine.conf" /etc/nginx/sites-available/ || warn "Impossible de copier la configuration Nginx"
    ln -sf /etc/nginx/sites-available/dounie-cuisine.conf /etc/nginx/sites-enabled/ || warn "Impossible de créer le lien symbolique"
    nginx -t && systemctl reload nginx || warn "Impossible de recharger Nginx"
    log "Nginx configuré avec succès."
  fi
else
  log "Nginx n'est pas installé. Ignorons la configuration du serveur web."
fi

# Finalisation
log "Installation terminée avec succès!"
log "Pour démarrer l'application, exécutez: ./start.sh"
log "L'application sera accessible à l'adresse: http://localhost:5173"
log "Interface d'administration: http://localhost:5173/admin"
log "  - Email: admin@dounieculisine.ca"
log "  - Mot de passe: Admin123!"