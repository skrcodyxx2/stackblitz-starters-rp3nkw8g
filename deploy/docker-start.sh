#!/bin/bash

# Script pour démarrer l'application avec Docker
# Ce script démarre l'application et la base de données avec Docker Compose

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

# Vérifier si Docker est installé
if ! command -v docker &> /dev/null; then
  error "Docker n'est pas installé. Veuillez l'installer avant de continuer."
fi

# Vérifier si Docker Compose est installé
if ! command -v docker-compose &> /dev/null; then
  error "Docker Compose n'est pas installé. Veuillez l'installer avant de continuer."
fi

# Chemin de l'application
APP_PATH=$(cd .. && pwd)
DEPLOY_PATH=$(pwd)

# Vérifier si le fichier docker-compose.yml existe
if [ ! -f "$DEPLOY_PATH/docker-compose.yml" ]; then
  error "Le fichier docker-compose.yml n'existe pas dans $DEPLOY_PATH"
fi

# Traiter les arguments
case "$1" in
  start)
    log "Démarrage des conteneurs Docker..."
    docker-compose up -d
    log "Conteneurs démarrés avec succès!"
    log "L'application est accessible à l'adresse: http://localhost:5173"
    log "Interface d'administration: http://localhost:5173/admin"
    log "  - Email: admin@dounieculisine.ca"
    log "  - Mot de passe: Admin123!"
    ;;
  stop)
    log "Arrêt des conteneurs Docker..."
    docker-compose down
    log "Conteneurs arrêtés avec succès!"
    ;;
  restart)
    log "Redémarrage des conteneurs Docker..."
    docker-compose down
    docker-compose up -d
    log "Conteneurs redémarrés avec succès!"
    log "L'application est accessible à l'adresse: http://localhost:5173"
    ;;
  logs)
    log "Affichage des logs..."
    docker-compose logs -f
    ;;
  build)
    log "Construction des images Docker..."
    docker-compose build
    log "Images construites avec succès!"
    ;;
  *)
    # Par défaut, démarrer les conteneurs
    log "Démarrage des conteneurs Docker..."
    docker-compose up -d
    log "Conteneurs démarrés avec succès!"
    log "L'application est accessible à l'adresse: http://localhost:5173"
    log "Interface d'administration: http://localhost:5173/admin"
    log "  - Email: admin@dounieculisine.ca"
    log "  - Mot de passe: Admin123!"
    ;;
esac

exit 0