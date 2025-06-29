import { getDatabase, MenuCategory, MenuItem, SpecialMenu, GalleryAlbum, GalleryImage, CompanySettings } from './database';

export class ApiClient {
  private db = getDatabase();

  // Company Settings
  getCompanySettings(): CompanySettings | null {
    const settings = this.db.prepare('SELECT * FROM company_settings LIMIT 1').get() as CompanySettings;
    if (settings) {
      // Parse JSON fields
      settings.business_hours = JSON.parse(settings.business_hours);
      settings.social_media = JSON.parse(settings.social_media);
    }
    return settings;
  }

  updateCompanySettings(updates: Partial<CompanySettings>): void {
    const fields = Object.keys(updates).filter(key => key !== 'id');
    const values = fields.map(field => {
      const value = updates[field as keyof CompanySettings];
      if (field === 'business_hours' || field === 'social_media') {
        return typeof value === 'string' ? value : JSON.stringify(value);
      }
      return value;
    });
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const query = `UPDATE company_settings SET ${setClause}, updated_at = datetime('now')`;
    
    this.db.prepare(query).run(...values);
  }

  // Menu Categories
  getMenuCategories(activeOnly = false): MenuCategory[] {
    let query = 'SELECT * FROM menu_categories';
    if (activeOnly) {
      query += ' WHERE is_active = 1';
    }
    query += ' ORDER BY sort_order';
    
    return this.db.prepare(query).all() as MenuCategory[];
  }

  createMenuCategory(category: Omit<MenuCategory, 'id' | 'created_at' | 'updated_at'>): string {
    const id = this.generateId();
    const insert = this.db.prepare(`
      INSERT INTO menu_categories (id, name, description, image_url, sort_order, is_active)
      VALUES (?, ?, ?, ?, ?, ?)
    `);
    
    insert.run(
      id,
      category.name,
      category.description || null,
      category.image_url || null,
      category.sort_order,
      category.is_active ? 1 : 0
    );
    
    return id;
  }

  updateMenuCategory(id: string, updates: Partial<MenuCategory>): void {
    const fields = Object.keys(updates).filter(key => !['id', 'created_at', 'updated_at'].includes(key));
    const values = fields.map(field => {
      const value = updates[field as keyof MenuCategory];
      return field === 'is_active' ? (value ? 1 : 0) : value;
    });
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const query = `UPDATE menu_categories SET ${setClause}, updated_at = datetime('now') WHERE id = ?`;
    
    this.db.prepare(query).run(...values, id);
  }

  deleteMenuCategory(id: string): void {
    this.db.prepare('DELETE FROM menu_categories WHERE id = ?').run(id);
  }

  // Menu Items
  getMenuItems(availableOnly = false): MenuItem[] {
    let query = 'SELECT * FROM menu_items';
    if (availableOnly) {
      query += ' WHERE is_available = 1';
    }
    query += ' ORDER BY sort_order';
    
    const items = this.db.prepare(query).all() as MenuItem[];
    return items.map(item => ({
      ...item,
      ingredients: item.ingredients ? JSON.parse(item.ingredients) : [],
      allergens: item.allergens ? JSON.parse(item.allergens) : []
    }));
  }

  getMenuItemsByCategory(categoryId: string, availableOnly = false): MenuItem[] {
    let query = 'SELECT * FROM menu_items WHERE category_id = ?';
    if (availableOnly) {
      query += ' AND is_available = 1';
    }
    query += ' ORDER BY sort_order';
    
    const items = this.db.prepare(query).all(categoryId) as MenuItem[];
    return items.map(item => ({
      ...item,
      ingredients: item.ingredients ? JSON.parse(item.ingredients) : [],
      allergens: item.allergens ? JSON.parse(item.allergens) : []
    }));
  }

  createMenuItem(item: Omit<MenuItem, 'id' | 'created_at' | 'updated_at'>): string {
    const id = this.generateId();
    const insert = this.db.prepare(`
      INSERT INTO menu_items (id, category_id, name, description, price, image_url, ingredients, allergens, preparation_time, calories, is_available, is_festive, sort_order)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    
    insert.run(
      id,
      item.category_id || null,
      item.name,
      item.description || null,
      item.price || null,
      item.image_url || null,
      JSON.stringify(item.ingredients || []),
      JSON.stringify(item.allergens || []),
      item.preparation_time || null,
      item.calories || null,
      item.is_available ? 1 : 0,
      item.is_festive ? 1 : 0,
      item.sort_order
    );
    
    return id;
  }

  updateMenuItem(id: string, updates: Partial<MenuItem>): void {
    const processedUpdates = { ...updates };
    if (processedUpdates.ingredients) {
      processedUpdates.ingredients = JSON.stringify(processedUpdates.ingredients);
    }
    if (processedUpdates.allergens) {
      processedUpdates.allergens = JSON.stringify(processedUpdates.allergens);
    }
    
    const fields = Object.keys(processedUpdates).filter(key => !['id', 'created_at', 'updated_at'].includes(key));
    const values = fields.map(field => {
      const value = processedUpdates[field as keyof MenuItem];
      if (field === 'is_available' || field === 'is_festive') {
        return value ? 1 : 0;
      }
      return value;
    });
    
    const setClause = fields.map(field => `${field} = ?`).join(', ');
    const query = `UPDATE menu_items SET ${setClause}, updated_at = datetime('now') WHERE id = ?`;
    
    this.db.prepare(query).run(...values, id);
  }

  deleteMenuItem(id: string): void {
    this.db.prepare('DELETE FROM menu_items WHERE id = ?').run(id);
  }

  // Special Menus
  getSpecialMenus(activeOnly = false): SpecialMenu[] {
    let query = 'SELECT * FROM special_menus';
    if (activeOnly) {
      query += ' WHERE is_active = 1';
    }
    query += ' ORDER BY sort_order';
    
    return this.db.prepare(query).all() as SpecialMenu[];
  }

  // Gallery
  getGalleryAlbums(activeOnly = false): (GalleryAlbum & { gallery_images: GalleryImage[] })[] {
    let query = 'SELECT * FROM gallery_albums';
    if (activeOnly) {
      query += ' WHERE is_active = 1';
    }
    query += ' ORDER BY event_date DESC';
    
    const albums = this.db.prepare(query).all() as GalleryAlbum[];
    
    return albums.map(album => ({
      ...album,
      gallery_images: this.getGalleryImages(album.id)
    }));
  }

  getGalleryImages(albumId: string): GalleryImage[] {
    return this.db.prepare('SELECT * FROM gallery_images WHERE album_id = ? ORDER BY sort_order').all(albumId) as GalleryImage[];
  }

  private generateId(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c == 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }
}

export const apiClient = new ApiClient();