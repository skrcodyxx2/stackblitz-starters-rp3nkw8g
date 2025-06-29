# Dounie Cuisine Pro - Déploiement Local sur Debian

Ce guide explique comment déployer l'application Dounie Cuisine Pro sur une machine Debian en utilisant PostgreSQL comme base de données locale.

## Prérequis

- Debian 11+ ou Ubuntu 20.04+
- Node.js 18+ 
- PostgreSQL 14+
- Git (optionnel)

## Structure des fichiers

```
deploy/
├── README.md                 # Ce guide
├── setup.sh                  # Script d'installation
├── start.sh                  # Script de démarrage
├── .env.example              # Exemple de variables d'environnement
├── schema.sql                # Schéma de base de données
├── seed.sql                  # Données initiales
└── nginx/
    └── dounie-cuisine.conf   # Configuration Nginx (optionnel)
```

## Installation

1. Clonez le dépôt ou copiez les fichiers de l'application

2. Exécutez le script d'installation:

```bash
cd deploy
chmod +x setup.sh
./setup.sh
```

3. Configurez les variables d'environnement:

```bash
cp .env.example ../.env
nano ../.env
```

4. Démarrez l'application:

```bash
chmod +x start.sh
./start.sh
```

## Accès à l'application

- Interface web: http://localhost:5173
- Interface d'administration: http://localhost:5173/admin
  - Email: admin@dounieculisine.ca
  - Mot de passe: Admin123!

## Maintenance

- Les logs sont disponibles dans `/var/log/dounie-cuisine/`
- La base de données peut être sauvegardée avec `pg_dump`
- Pour redémarrer l'application: `./start.sh restart`

## Support

Pour toute question ou problème, contactez support@dounieculisine.ca