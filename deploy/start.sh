#!/bin/bash

# Script de démarrage pour Dounie Cuisine Pro
# Ce script démarre l'application et la base de données

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

# Chemin de l'application
APP_PATH=$(cd .. && pwd)
PID_FILE="$APP_PATH/app.pid"
LOG_FILE="/var/log/dounie-cuisine/app.log"

# Créer le répertoire de logs s'il n'existe pas
mkdir -p /var/log/dounie-cuisine || warn "Impossible de créer le répertoire de logs"

# Vérifier si PostgreSQL est en cours d'exécution
check_postgres() {
  if systemctl is-active --quiet postgresql; then
    log "PostgreSQL est en cours d'exécution."
  else
    warn "PostgreSQL n'est pas en cours d'exécution. Tentative de démarrage..."
    systemctl start postgresql || error "Impossible de démarrer PostgreSQL"
  fi
}

# Démarrer l'application
start_app() {
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null; then
      log "L'application est déjà en cours d'exécution (PID: $PID)"
      return 0
    else
      log "PID file exists but process is not running. Removing stale PID file."
      rm "$PID_FILE"
    fi
  fi

  log "Démarrage de l'application..."
  cd "$APP_PATH" || error "Impossible d'accéder au répertoire de l'application"
  
  # Démarrer l'application en arrière-plan
  nohup npm run dev > "$LOG_FILE" 2>&1 &
  
  # Enregistrer le PID
  echo $! > "$PID_FILE"
  log "Application démarrée avec PID: $(cat "$PID_FILE")"
  log "Logs disponibles dans: $LOG_FILE"
  
  # Attendre que l'application soit prête
  log "Attente du démarrage de l'application..."
  sleep 5
  
  # Vérifier si l'application est en cours d'exécution
  if ! ps -p "$(cat "$PID_FILE")" > /dev/null; then
    error "L'application n'a pas pu démarrer. Vérifiez les logs: $LOG_FILE"
  fi
  
  log "Application démarrée avec succès!"
  log "Accédez à l'application à l'adresse: http://localhost:5173"
}

# Arrêter l'application
stop_app() {
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null; then
      log "Arrêt de l'application (PID: $PID)..."
      kill "$PID" || warn "Impossible d'arrêter l'application proprement. Tentative de kill -9..."
      sleep 2
      
      # Vérifier si le processus est toujours en cours d'exécution
      if ps -p "$PID" > /dev/null; then
        log "L'application ne répond pas. Arrêt forcé..."
        kill -9 "$PID" || warn "Impossible d'arrêter l'application"
      fi
      
      rm "$PID_FILE"
      log "Application arrêtée."
    else
      warn "L'application n'est pas en cours d'exécution."
      rm "$PID_FILE"
    fi
  else
    warn "L'application n'est pas en cours d'exécution."
  fi
}

# Redémarrer l'application
restart_app() {
  log "Redémarrage de l'application..."
  stop_app
  sleep 2
  start_app
}

# Afficher le statut de l'application
status_app() {
  if [ -f "$PID_FILE" ]; then
    PID=$(cat "$PID_FILE")
    if ps -p "$PID" > /dev/null; then
      log "L'application est en cours d'exécution (PID: $PID)"
      log "Logs: $LOG_FILE"
      return 0
    else
      warn "L'application n'est pas en cours d'exécution (PID file exists but process is dead)"
      rm "$PID_FILE"
      return 1
    fi
  else
    warn "L'application n'est pas en cours d'exécution (No PID file)"
    return 1
  fi
}

# Afficher les logs
show_logs() {
  if [ -f "$LOG_FILE" ]; then
    tail -n 50 "$LOG_FILE"
  else
    warn "Fichier de logs non trouvé: $LOG_FILE"
  fi
}

# Traiter les arguments
case "$1" in
  start)
    check_postgres
    start_app
    ;;
  stop)
    stop_app
    ;;
  restart)
    check_postgres
    restart_app
    ;;
  status)
    status_app
    ;;
  logs)
    show_logs
    ;;
  *)
    # Par défaut, démarrer l'application
    check_postgres
    start_app
    ;;
esac

exit 0