// Statuts des commandes
export const ORDER_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  PREPARING: 'preparing',
  READY: 'ready',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled'
} as const;

export const ORDER_STATUS_LABELS = {
  [ORDER_STATUSES.PENDING]: 'En attente',
  [ORDER_STATUSES.CONFIRMED]: 'Confirmée',
  [ORDER_STATUSES.PREPARING]: 'En préparation',
  [ORDER_STATUSES.READY]: 'Prête',
  [ORDER_STATUSES.DELIVERED]: 'Livrée',
  [ORDER_STATUSES.CANCELLED]: 'Annulée'
};

// Statuts des réservations
export const RESERVATION_STATUSES = {
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  CANCELLED: 'cancelled',
  COMPLETED: 'completed'
} as const;

export const RESERVATION_STATUS_LABELS = {
  [RESERVATION_STATUSES.PENDING]: 'En attente',
  [RESERVATION_STATUSES.CONFIRMED]: 'Confirmée',
  [RESERVATION_STATUSES.CANCELLED]: 'Annulée',
  [RESERVATION_STATUSES.COMPLETED]: 'Terminée'
};

// Types de livraison
export const DELIVERY_TYPES = {
  DELIVERY: 'delivery',
  PICKUP: 'pickup'
} as const;

export const DELIVERY_TYPE_LABELS = {
  [DELIVERY_TYPES.DELIVERY]: 'Livraison',
  [DELIVERY_TYPES.PICKUP]: 'Ramassage'
};

// Rôles utilisateur
export const USER_ROLES = {
  ADMIN: 'admin',
  EMPLOYEE: 'employee',
  CLIENT: 'client'
} as const;

export const USER_ROLE_LABELS = {
  [USER_ROLES.ADMIN]: 'Administrateur',
  [USER_ROLES.EMPLOYEE]: 'Employé',
  [USER_ROLES.CLIENT]: 'Client'
};

// Types d'événements
export const EVENT_TYPES = [
  'Mariage',
  'Anniversaire',
  'Événement corporatif',
  'Réunion familiale',
  'Baptême/Communion',
  'Graduation',
  'Autre'
];

// Services disponibles
export const AVAILABLE_SERVICES = [
  {
    id: 'catering',
    name: 'Service Traiteur',
    description: 'Cuisine haïtienne et caribéenne'
  },
  {
    id: 'dj',
    name: 'Animation DJ',
    description: 'Musique et animation'
  },
  {
    id: 'planning',
    name: 'Organisation d\'événement',
    description: 'Planification complète'
  },
  {
    id: 'decoration',
    name: 'Décoration',
    description: 'Décoration thématique'
  }
];

// Créneaux horaires
export const TIME_SLOTS = [
  '10:00', '11:00', '12:00', '13:00', '14:00', '15:00',
  '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
];

// Fourchettes de budget
export const BUDGET_RANGES = [
  { value: 'moins-1000', label: 'Moins de 1 000$' },
  { value: '1000-2500', label: '1 000$ - 2 500$' },
  { value: '2500-5000', label: '2 500$ - 5 000$' },
  { value: '5000-10000', label: '5 000$ - 10 000$' },
  { value: 'plus-10000', label: 'Plus de 10 000$' }
];

// Taux de taxes par défaut (Québec)
export const DEFAULT_TAX_RATES = {
  TPS: 0.05,
  TVQ: 0.09975
};

// Limites de pagination
export const PAGINATION_LIMITS = {
  SMALL: 10,
  MEDIUM: 25,
  LARGE: 50
};

// Messages d'erreur communs
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Erreur de connexion. Veuillez vérifier votre connexion internet.',
  UNAUTHORIZED: 'Vous n\'êtes pas autorisé à effectuer cette action.',
  NOT_FOUND: 'La ressource demandée n\'a pas été trouvée.',
  VALIDATION_ERROR: 'Les données fournies ne sont pas valides.',
  SERVER_ERROR: 'Une erreur serveur s\'est produite. Veuillez réessayer plus tard.'
};

// Messages de succès communs
export const SUCCESS_MESSAGES = {
  SAVE_SUCCESS: 'Données sauvegardées avec succès !',
  DELETE_SUCCESS: 'Élément supprimé avec succès !',
  UPDATE_SUCCESS: 'Mise à jour effectuée avec succès !',
  CREATE_SUCCESS: 'Élément créé avec succès !'
};