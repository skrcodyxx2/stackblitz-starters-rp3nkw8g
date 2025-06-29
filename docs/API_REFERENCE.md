# API Reference - Dounie Cuisine Pro

## 📋 Table des Matières

1. [Vue d'ensemble](#vue-densemble)
2. [Authentification](#authentification)
3. [Endpoints Publics](#endpoints-publics)
4. [Endpoints Clients](#endpoints-clients)
5. [Endpoints Admin](#endpoints-admin)
6. [Types de Données](#types-de-données)
7. [Codes d'Erreur](#codes-derreur)

## 🎯 Vue d'ensemble

L'API de Dounie Cuisine Pro est construite sur Supabase et utilise PostgreSQL avec Row Level Security (RLS). Toutes les requêtes utilisent le client Supabase JavaScript.

### Base URL
```
https://domzrauccnekgiweftpt.supabase.co
```

### Authentification
Toutes les requêtes authentifiées doivent inclure le token JWT dans l'en-tête Authorization.

## 🔐 Authentification

### Inscription
```typescript
const { data, error } = await supabase.auth.signUp({
  email: 'user@example.com',
  password: 'password123'
});
```

### Connexion
```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
});
```

### Déconnexion
```typescript
const { error } = await supabase.auth.signOut();
```

### Récupération de l'utilisateur actuel
```typescript
const { data: { user } } = await supabase.auth.getUser();
```

## 🌐 Endpoints Publics

### Menu

#### Récupérer toutes les catégories
```typescript
const { data, error } = await supabase
  .from('menu_categories')
  .select('*')
  .eq('is_active', true)
  .order('sort_order');
```

#### Récupérer tous les plats disponibles
```typescript
const { data, error } = await supabase
  .from('menu_items')
  .select(`
    *,
    menu_categories (
      name,
      id
    )
  `)
  .eq('is_available', true)
  .order('sort_order');
```

#### Récupérer les plats par catégorie
```typescript
const { data, error } = await supabase
  .from('menu_items')
  .select('*')
  .eq('category_id', categoryId)
  .eq('is_available', true)
  .order('sort_order');
```

#### Rechercher des plats
```typescript
const { data, error } = await supabase
  .from('menu_items')
  .select('*')
  .ilike('name', `%${searchTerm}%`)
  .eq('is_available', true);
```

### Paramètres de l'entreprise
```typescript
const { data, error } = await supabase
  .from('company_settings')
  .select('*')
  .single();
```

## 👤 Endpoints Clients

### Profil

#### Récupérer le profil
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .eq('id', userId)
  .single();
```

#### Mettre à jour le profil
```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    first_name: 'Nouveau prénom',
    last_name: 'Nouveau nom',
    phone: '+1234567890',
    updated_at: new Date().toISOString()
  })
  .eq('id', userId);
```

### Commandes

#### Créer une commande
```typescript
const { data, error } = await supabase
  .from('orders')
  .insert({
    customer_id: userId,
    order_number: generateOrderNumber(),
    delivery_type: 'delivery',
    delivery_address: 'Adresse de livraison',
    delivery_date: '2024-03-15T18:00:00Z',
    subtotal: 100.00,
    tax_amount: 14.98,
    total_amount: 114.98,
    notes: 'Instructions spéciales'
  })
  .select()
  .single();
```

#### Ajouter des articles à une commande
```typescript
const { data, error } = await supabase
  .from('order_items')
  .insert([
    {
      order_id: orderId,
      menu_item_id: itemId,
      quantity: 2,
      unit_price: 25.99,
      total_price: 51.98,
      special_instructions: 'Sans épices'
    }
  ]);
```

#### Récupérer les commandes du client
```typescript
const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    order_items (
      *,
      menu_items (
        name,
        image_url
      )
    )
  `)
  .eq('customer_id', userId)
  .order('created_at', { ascending: false });
```

### Réservations

#### Créer une réservation
```typescript
const { data, error } = await supabase
  .from('reservations')
  .insert({
    customer_id: userId,
    reservation_number: generateReservationNumber(),
    event_type: 'Mariage',
    event_date: '2024-06-15T18:00:00Z',
    event_time: '18:00',
    guest_count: 120,
    venue_address: 'Adresse du lieu',
    special_requests: 'Demandes spéciales',
    estimated_cost: 5000.00
  })
  .select()
  .single();
```

#### Récupérer les réservations du client
```typescript
const { data, error } = await supabase
  .from('reservations')
  .select('*')
  .eq('customer_id', userId)
  .order('event_date', { ascending: true });
```

#### Mettre à jour une réservation
```typescript
const { data, error } = await supabase
  .from('reservations')
  .update({
    guest_count: 150,
    special_requests: 'Nouvelles demandes',
    updated_at: new Date().toISOString()
  })
  .eq('id', reservationId)
  .eq('customer_id', userId);
```

## 👨‍💼 Endpoints Admin

### Gestion des utilisateurs

#### Récupérer tous les utilisateurs
```typescript
const { data, error } = await supabase
  .from('profiles')
  .select('*')
  .order('created_at', { ascending: false });
```

#### Mettre à jour le rôle d'un utilisateur
```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    role: 'employee',
    updated_at: new Date().toISOString()
  })
  .eq('id', userId);
```

#### Désactiver un utilisateur
```typescript
const { data, error } = await supabase
  .from('profiles')
  .update({
    is_active: false,
    updated_at: new Date().toISOString()
  })
  .eq('id', userId);
```

### Gestion du menu

#### Créer une catégorie
```typescript
const { data, error } = await supabase
  .from('menu_categories')
  .insert({
    name: 'Nouvelle catégorie',
    description: 'Description de la catégorie',
    image_url: 'https://example.com/image.jpg',
    sort_order: 1,
    is_active: true
  })
  .select()
  .single();
```

#### Créer un plat
```typescript
const { data, error } = await supabase
  .from('menu_items')
  .insert({
    category_id: categoryId,
    name: 'Nouveau plat',
    description: 'Description du plat',
    price: 25.99,
    image_url: 'https://example.com/dish.jpg',
    ingredients: ['Ingrédient 1', 'Ingrédient 2'],
    allergens: ['Gluten', 'Lactose'],
    preparation_time: 30,
    calories: 450,
    is_available: true,
    is_festive: false,
    sort_order: 1
  })
  .select()
  .single();
```

#### Mettre à jour un plat
```typescript
const { data, error } = await supabase
  .from('menu_items')
  .update({
    price: 27.99,
    is_available: false,
    updated_at: new Date().toISOString()
  })
  .eq('id', itemId);
```

#### Supprimer un plat
```typescript
const { data, error } = await supabase
  .from('menu_items')
  .delete()
  .eq('id', itemId);
```

### Gestion des commandes

#### Récupérer toutes les commandes
```typescript
const { data, error } = await supabase
  .from('orders')
  .select(`
    *,
    profiles (
      first_name,
      last_name,
      email
    ),
    order_items (
      *,
      menu_items (
        name
      )
    )
  `)
  .order('created_at', { ascending: false });
```

#### Mettre à jour le statut d'une commande
```typescript
const { data, error } = await supabase
  .from('orders')
  .update({
    status: 'confirmed',
    updated_at: new Date().toISOString()
  })
  .eq('id', orderId);
```

### Gestion des réservations

#### Récupérer toutes les réservations
```typescript
const { data, error } = await supabase
  .from('reservations')
  .select(`
    *,
    profiles (
      first_name,
      last_name,
      email,
      phone
    )
  `)
  .order('event_date', { ascending: true });
```

#### Confirmer une réservation
```typescript
const { data, error } = await supabase
  .from('reservations')
  .update({
    status: 'confirmed',
    updated_at: new Date().toISOString()
  })
  .eq('id', reservationId);
```

### Statistiques

#### Statistiques des commandes
```typescript
const { data, error } = await supabase
  .from('orders')
  .select('total_amount, created_at, status')
  .gte('created_at', startDate)
  .lte('created_at', endDate);
```

#### Plats les plus populaires
```typescript
const { data, error } = await supabase
  .from('order_items')
  .select(`
    menu_item_id,
    quantity,
    menu_items (
      name
    )
  `)
  .gte('created_at', startDate);
```

## 📊 Types de Données

### Profile
```typescript
interface Profile {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  phone: string | null;
  role: 'admin' | 'employee' | 'client';
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  must_change_password: boolean;
}
```

### MenuCategory
```typescript
interface MenuCategory {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
```

### MenuItem
```typescript
interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  ingredients: string[] | null;
  allergens: string[] | null;
  preparation_time: number | null;
  calories: number | null;
  is_available: boolean;
  is_festive: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}
```

### Order
```typescript
interface Order {
  id: string;
  customer_id: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  delivery_type: 'delivery' | 'pickup';
  delivery_address: string | null;
  delivery_date: string | null;
  delivery_time: string | null;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes: string | null;
  created_at: string;
  updated_at: string;
}
```

### OrderItem
```typescript
interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions: string | null;
  created_at: string;
}
```

### Reservation
```typescript
interface Reservation {
  id: string;
  customer_id: string;
  reservation_number: string;
  event_type: string;
  event_date: string;
  event_time: string | null;
  guest_count: number;
  venue_address: string | null;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests: string | null;
  estimated_cost: number | null;
  created_at: string;
  updated_at: string;
}
```

## ⚠️ Codes d'Erreur

### Erreurs d'Authentification
- `401 Unauthorized`: Token manquant ou invalide
- `403 Forbidden`: Permissions insuffisantes
- `422 Unprocessable Entity`: Données de connexion invalides

### Erreurs de Validation
- `400 Bad Request`: Données manquantes ou invalides
- `409 Conflict`: Conflit de données (email déjà utilisé)
- `422 Unprocessable Entity`: Validation échouée

### Erreurs de Ressources
- `404 Not Found`: Ressource non trouvée
- `410 Gone`: Ressource supprimée

### Erreurs Serveur
- `500 Internal Server Error`: Erreur serveur interne
- `503 Service Unavailable`: Service temporairement indisponible

### Gestion des Erreurs

```typescript
try {
  const { data, error } = await supabase
    .from('menu_items')
    .select('*');
    
  if (error) {
    console.error('Erreur Supabase:', error.message);
    // Gérer l'erreur selon le code
    switch (error.code) {
      case 'PGRST116':
        // Aucun résultat trouvé
        break;
      case '23505':
        // Violation de contrainte unique
        break;
      default:
        // Erreur générique
        break;
    }
  }
  
  return data;
} catch (error) {
  console.error('Erreur réseau:', error);
  throw new Error('Erreur de connexion');
}
```

### Bonnes Pratiques

1. **Toujours vérifier les erreurs** avant d'utiliser les données
2. **Utiliser des types TypeScript** pour la sécurité des types
3. **Implémenter un retry logic** pour les erreurs temporaires
4. **Logger les erreurs** pour le debugging
5. **Afficher des messages d'erreur** compréhensibles pour l'utilisateur

---

**Version API**: 1.0.0  
**Dernière mise à jour**: Mars 2024  
**Documentation Supabase**: [supabase.com/docs](https://supabase.com/docs)