import Database from 'better-sqlite3';
import bcrypt from 'bcryptjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DB_PATH = path.join(__dirname, '..', 'database.sqlite');

console.log('🌱 Initialisation des données de base...');

const db = new Database(DB_PATH);

// Fonction pour générer un UUID simple
function generateId() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

try {
  // Créer l'utilisateur admin par défaut
  const adminId = generateId();
  const adminPassword = await bcrypt.hash('admin123', 10);
  
  const insertAdmin = db.prepare(`
    INSERT OR IGNORE INTO users (id, email, password_hash, first_name, last_name, role, is_active)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);
  
  insertAdmin.run(adminId, 'admin@dounieculisine.ca', adminPassword, 'Admin', 'Dounie', 'admin', 1);
  console.log('✅ Utilisateur admin créé (email: admin@dounieculisine.ca, mot de passe: admin123)');

  // Insérer les paramètres de l'entreprise
  const insertCompanySettings = db.prepare(`
    INSERT OR IGNORE INTO company_settings (id) VALUES (?)
  `);
  insertCompanySettings.run(generateId());
  console.log('✅ Paramètres de l\'entreprise initialisés');

  // Insérer les catégories de menu
  const insertCategory = db.prepare(`
    INSERT OR IGNORE INTO menu_categories (id, name, description, image_url, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  const categories = [
    ['Entrées', 'Délicieuses entrées haïtiennes pour commencer votre repas', 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 1],
    ['Plats Principaux', 'Nos spécialités haïtiennes authentiques', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 2],
    ['Accompagnements', 'Riz, légumes et autres accompagnements traditionnels', 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 3],
    ['Desserts', 'Douceurs caribéennes pour terminer en beauté', 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 4],
    ['Boissons', 'Boissons traditionnelles et rafraîchissantes', 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 5]
  ];

  const categoryIds = {};
  categories.forEach(([name, description, image_url, sort_order]) => {
    const id = generateId();
    categoryIds[name] = id;
    insertCategory.run(id, name, description, image_url, sort_order);
  });
  console.log('✅ Catégories de menu créées');

  // Insérer les plats du menu
  const insertMenuItem = db.prepare(`
    INSERT OR IGNORE INTO menu_items (id, category_id, name, description, price, image_url, ingredients, allergens, preparation_time, calories, is_available, is_festive, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  const menuItems = [
    // Entrées
    [categoryIds['Entrées'], 'Accra de Morue', 'Beignets de morue épicés, spécialité antillaise croustillante', 12.99, 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Morue", "Farine", "Épices", "Huile"]', '["Gluten", "Poisson"]', 25, 320, 1, 0, 1],
    [categoryIds['Entrées'], 'Pâtés Haïtiens', 'Chaussons croustillants farcis à la viande épicée', 8.99, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Pâte", "Bœuf", "Épices", "Oignons"]', '["Gluten"]', 30, 280, 1, 0, 2],
    [categoryIds['Entrées'], 'Marinade de Poisson', 'Poisson mariné aux épices créoles, servi froid', 15.99, 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Poisson", "Citron vert", "Épices", "Oignons"]', '["Poisson"]', 20, 250, 1, 0, 3],

    // Plats Principaux
    [categoryIds['Plats Principaux'], 'Griot Haïtien', 'Porc mariné et frit, servi avec du riz et des légumes traditionnels', 25.99, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Porc", "Épices haïtiennes", "Ail", "Citron vert"]', '[]', 45, 650, 1, 0, 1],
    [categoryIds['Plats Principaux'], 'Poulet Créole', 'Poulet mijoté aux épices créoles avec légumes et riz parfumé', 22.99, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Poulet", "Tomates", "Oignons", "Épices créoles"]', '[]', 40, 580, 1, 0, 2],
    [categoryIds['Plats Principaux'], 'Poisson Gros Sel', 'Poisson frais grillé au gros sel avec légumes de saison', 28.99, 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Poisson frais", "Gros sel", "Légumes", "Herbes"]', '["Poisson"]', 35, 520, 1, 0, 3],
    [categoryIds['Plats Principaux'], 'Cabri en Sauce', 'Chèvre mijotée dans une sauce épicée traditionnelle', 32.99, 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Chèvre", "Épices", "Tomates", "Oignons"]', '[]', 60, 720, 1, 1, 4],
    [categoryIds['Plats Principaux'], 'Lambi en Sauce', 'Conque des Caraïbes mijotée aux épices', 35.99, 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Lambi", "Épices", "Sauce créole"]', '["Fruits de mer"]', 50, 480, 1, 1, 5],

    // Accompagnements
    [categoryIds['Accompagnements'], 'Riz Collé aux Haricots', 'Riz traditionnel haïtien aux haricots rouges', 8.99, 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Riz", "Haricots rouges", "Lait de coco"]', '[]', 30, 280, 1, 0, 1],
    [categoryIds['Accompagnements'], 'Bananes Pesées', 'Bananes plantains frites, accompagnement traditionnel', 6.99, 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Bananes plantains", "Huile"]', '[]', 15, 220, 1, 0, 2],
    [categoryIds['Accompagnements'], 'Légumes Créoles', 'Mélange de légumes sautés aux épices', 9.99, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Légumes variés", "Épices créoles"]', '[]', 20, 150, 1, 0, 3],

    // Desserts
    [categoryIds['Desserts'], 'Doukounou', 'Pudding de maïs traditionnel haïtien', 7.99, 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Maïs", "Lait de coco", "Épices"]', '[]', 45, 320, 1, 0, 1],
    [categoryIds['Desserts'], 'Pain Patate', 'Gâteau à la patate douce épicé', 8.99, 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Patate douce", "Farine", "Épices"]', '["Gluten"]', 60, 380, 1, 0, 2],
    [categoryIds['Desserts'], 'Flan Coco', 'Flan au lait de coco et vanille', 6.99, 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Lait de coco", "Œufs", "Vanille"]', '["Œufs", "Lactose"]', 40, 250, 1, 0, 3],

    // Boissons
    [categoryIds['Boissons'], 'Jus de Canne', 'Jus de canne à sucre frais', 4.99, 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Canne à sucre"]', '[]', 5, 120, 1, 0, 1],
    [categoryIds['Boissons'], 'Akasan', 'Boisson traditionnelle au maïs et épices', 5.99, 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Maïs", "Lait", "Épices"]', '["Lactose"]', 15, 180, 1, 0, 2],
    [categoryIds['Boissons'], 'Thé Glacé Tropical', 'Thé glacé aux fruits tropicaux', 3.99, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', '["Thé", "Fruits tropicaux"]', '[]', 10, 80, 1, 0, 3]
  ];

  menuItems.forEach(([category_id, name, description, price, image_url, ingredients, allergens, preparation_time, calories, is_available, is_festive, sort_order]) => {
    const id = generateId();
    insertMenuItem.run(id, category_id, name, description, price, image_url, ingredients, allergens, preparation_time, calories, is_available, is_festive, sort_order);
  });
  console.log('✅ Plats du menu créés');

  // Insérer les menus spéciaux
  const insertSpecialMenu = db.prepare(`
    INSERT OR IGNORE INTO special_menus (id, name, description, image_url, event_type, price, sort_order)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  const specialMenus = [
    ['Menu Mariage Traditionnel', 'Menu complet pour célébrations de mariage avec plats traditionnels haïtiens pour 50 personnes', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Mariage', 45.00, 1],
    ['Menu Anniversaire Festif', 'Sélection spéciale pour anniversaires avec desserts et plats de fête', 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Anniversaire', 35.00, 2],
    ['Menu Corporatif', 'Menu professionnel adapté aux événements d\'entreprise', 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Corporatif', 40.00, 3],
    ['Menu Baptême', 'Menu spécial pour célébrations religieuses et familiales', 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Baptême', 38.00, 4],
    ['Menu Graduation', 'Menu festif pour célébrer les réussites académiques', 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Graduation', 42.00, 5]
  ];

  specialMenus.forEach(([name, description, image_url, event_type, price, sort_order]) => {
    const id = generateId();
    insertSpecialMenu.run(id, name, description, image_url, event_type, price, sort_order);
  });
  console.log('✅ Menus spéciaux créés');

  // Insérer les albums de galerie
  const insertAlbum = db.prepare(`
    INSERT OR IGNORE INTO gallery_albums (id, name, description, cover_image_url, event_date)
    VALUES (?, ?, ?, ?, ?)
  `);

  const albums = [
    ['Mariage de Marie et Jean', 'Magnifique célébration de mariage avec 120 invités dans un cadre enchanteur', 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', '2024-06-15'],
    ['Anniversaire 50 ans de Paul', 'Fête d\'anniversaire familiale avec cuisine traditionnelle et ambiance chaleureuse', 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', '2024-05-20'],
    ['Événement Corporatif ABC Inc', 'Réception d\'entreprise avec service traiteur complet et animation professionnelle', 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', '2024-04-10'],
    ['Baptême de Sophie', 'Célébration religieuse intime avec menu traditionnel haïtien', 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', '2024-03-25'],
    ['Graduation de Marc', 'Fête de fin d\'études avec buffet festif et desserts spéciaux', 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', '2024-07-08']
  ];

  const albumIds = {};
  albums.forEach(([name, description, cover_image_url, event_date]) => {
    const id = generateId();
    albumIds[name] = id;
    insertAlbum.run(id, name, description, cover_image_url, event_date);
  });
  console.log('✅ Albums de galerie créés');

  // Insérer les images de galerie
  const insertImage = db.prepare(`
    INSERT OR IGNORE INTO gallery_images (id, album_id, image_url, caption, sort_order)
    VALUES (?, ?, ?, ?, ?)
  `);

  const images = [
    // Mariage de Marie et Jean
    [albumIds['Mariage de Marie et Jean'], 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Table d\'honneur magnifiquement dressée avec décoration florale', 1],
    [albumIds['Mariage de Marie et Jean'], 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Buffet de plats haïtiens traditionnels avec griot et riz collé', 2],
    [albumIds['Mariage de Marie et Jean'], 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Service professionnel pendant la réception', 3],
    [albumIds['Mariage de Marie et Jean'], 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Gâteau de mariage et desserts traditionnels', 4],

    // Anniversaire 50 ans de Paul
    [albumIds['Anniversaire 50 ans de Paul'], 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Gâteau d\'anniversaire et desserts créoles', 1],
    [albumIds['Anniversaire 50 ans de Paul'], 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Ambiance familiale chaleureuse autour du buffet', 2],
    [albumIds['Anniversaire 50 ans de Paul'], 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Plats traditionnels servis avec amour', 3],

    // Événement Corporatif ABC Inc
    [albumIds['Événement Corporatif ABC Inc'], 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Service cocktail professionnel avec canapés', 1],
    [albumIds['Événement Corporatif ABC Inc'], 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Buffet élégant pour l\'événement d\'entreprise', 2],
    [albumIds['Événement Corporatif ABC Inc'], 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Présentation soignée des mets', 3],

    // Baptême de Sophie
    [albumIds['Baptême de Sophie'], 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Table festive pour la célébration religieuse', 1],
    [albumIds['Baptême de Sophie'], 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Buffet traditionnel haïtien pour l\'occasion', 2],

    // Graduation de Marc
    [albumIds['Graduation de Marc'], 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Buffet festif pour célébrer la réussite', 1],
    [albumIds['Graduation de Marc'], 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Desserts spéciaux et gâteau de graduation', 2]
  ];

  images.forEach(([album_id, image_url, caption, sort_order]) => {
    const id = generateId();
    insertImage.run(id, album_id, image_url, caption, sort_order);
  });
  console.log('✅ Images de galerie créées');

  console.log('\n🎉 Initialisation des données terminée!');
  console.log('👤 Utilisateur admin créé:');
  console.log('   Email: admin@dounieculisine.ca');
  console.log('   Mot de passe: admin123');

} catch (error) {
  console.error('❌ Erreur lors de l\'initialisation des données:', error);
  process.exit(1);
} finally {
  db.close();
}