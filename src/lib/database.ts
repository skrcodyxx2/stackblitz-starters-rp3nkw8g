import Database from 'better-sqlite3';
import path from 'path';

// Configuration de la base de données
const DB_PATH = path.join(process.cwd(), 'database.sqlite');

let db: Database.Database | null = null;

export function getDatabase() {
  if (!db) {
    db = new Database(DB_PATH);
    db.pragma('foreign_keys = ON');
  }
  return db;
}

export function closeDatabase() {
  if (db) {
    db.close();
    db = null;
  }
}

// Types pour la base de données
export interface User {
  id: string;
  email: string;
  password_hash: string;
  first_name?: string;
  last_name?: string;
  phone?: string;
  role: 'admin' | 'employee' | 'client';
  avatar_url?: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  must_change_password: boolean;
}

export interface CompanySettings {
  id: string;
  name: string;
  slogan?: string;
  description?: string;
  address?: string;
  phone?: string;
  email?: string;
  website?: string;
  logo_url?: string;
  favicon_url?: string;
  hero_title?: string;
  hero_subtitle?: string;
  hero_image_url?: string;
  tax_tps: number;
  tax_tvq: number;
  business_hours: string;
  social_media: string;
  privacy_policy?: string;
  terms_of_service?: string;
  about_us?: string;
  created_at: string;
  updated_at: string;
}

export interface MenuCategory {
  id: string;
  name: string;
  description?: string;
  image_url?: string;
  sort_order: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  category_id?: string;
  name: string;
  description?: string;
  price?: number;
  image_url?: string;
  ingredients?: string; // JSON string
  allergens?: string; // JSON string
  preparation_time?: number;
  calories?: number;
  is_available: boolean;
  is_festive: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface SpecialMenu {
  id: string;
  name: string;
  description?: string;
  image_url: string;
  event_type: string;
  price?: number;
  is_active: boolean;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface GalleryAlbum {
  id: string;
  name: string;
  description?: string;
  cover_image_url?: string;
  event_date?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface GalleryImage {
  id: string;
  album_id?: string;
  image_url: string;
  caption?: string;
  sort_order: number;
  created_at: string;
}

export interface Order {
  id: string;
  customer_id?: string;
  order_number: string;
  status: 'pending' | 'confirmed' | 'preparing' | 'ready' | 'delivered' | 'cancelled';
  delivery_type: 'delivery' | 'pickup';
  delivery_address?: string;
  delivery_date?: string;
  delivery_time?: string;
  subtotal: number;
  tax_amount: number;
  total_amount: number;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id?: string;
  menu_item_id?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  special_instructions?: string;
  created_at: string;
}

export interface Reservation {
  id: string;
  customer_id?: string;
  reservation_number: string;
  event_type: string;
  event_date: string;
  event_time?: string;
  guest_count: number;
  venue_address?: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  special_requests?: string;
  estimated_cost?: number;
  created_at: string;
  updated_at: string;
}

export interface UserSession {
  id: string;
  user_id: string;
  token: string;
  expires_at: string;
  created_at: string;
}