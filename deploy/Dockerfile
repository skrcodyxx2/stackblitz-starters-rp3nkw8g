# Dockerfile pour Dounie Cuisine Pro
FROM node:18-alpine

# Créer le répertoire de l'application
WORKDIR /app

# Installer les dépendances système
RUN apk add --no-cache \
    curl \
    postgresql-client \
    bash

# Copier les fichiers de dépendances
COPY package*.json ./

# Installer les dépendances
RUN npm ci

# Copier le reste des fichiers de l'application
COPY . .

# Exposer le port
EXPOSE 5173

# Commande de démarrage
CMD ["npm", "run", "dev"]