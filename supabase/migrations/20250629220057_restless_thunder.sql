-- Données initiales pour Dounie Cuisine Pro
-- Ce script insère les données de base nécessaires pour démarrer l'application

-- Insérer l'utilisateur administrateur
INSERT INTO users (id, email, password, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'admin@dounieculisine.ca',
  crypt('Admin123!', gen_salt('bf')),
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

-- Insérer le profil administrateur
INSERT INTO profiles (id, email, first_name, last_name, role, is_active, created_at, updated_at)
SELECT 
  id, 
  email, 
  'Admin', 
  'Système', 
  'admin', 
  true, 
  now(), 
  now()
FROM users 
WHERE email = 'admin@dounieculisine.ca'
ON CONFLICT (email) DO NOTHING;

-- Insérer un utilisateur employé
INSERT INTO users (id, email, password, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'employe@dounieculisine.ca',
  crypt('Employe123!', gen_salt('bf')),
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

-- Insérer le profil employé
INSERT INTO profiles (id, email, first_name, last_name, role, is_active, created_at, updated_at)
SELECT 
  id, 
  email, 
  'Employé', 
  'Test', 
  'employee', 
  true, 
  now(), 
  now()
FROM users 
WHERE email = 'employe@dounieculisine.ca'
ON CONFLICT (email) DO NOTHING;

-- Insérer un utilisateur client
INSERT INTO users (id, email, password, created_at, updated_at)
VALUES (
  gen_random_uuid(),
  'client@example.com',
  crypt('Client123!', gen_salt('bf')),
  now(),
  now()
) ON CONFLICT (email) DO NOTHING;

-- Insérer le profil client
INSERT INTO profiles (id, email, first_name, last_name, role, is_active, created_at, updated_at)
SELECT 
  id, 
  email, 
  'Client', 
  'Test', 
  'client', 
  true, 
  now(), 
  now()
FROM users 
WHERE email = 'client@example.com'
ON CONFLICT (email) DO NOTHING;

-- Insérer les paramètres de l'entreprise
INSERT INTO company_settings (id, name, slogan, description, address, phone, email, website, hero_title, hero_subtitle, hero_image_url)
VALUES (
  gen_random_uuid(),
  'Dounie Cuisine Pro',
  'Saveurs Authentiques Caribéennes',
  'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne.',
  'Montréal, Québec, Canada',
  '+1 (514) 123-4567',
  'info@dounieculisine.ca',
  'https://dounieculisine.ca',
  'Saveurs Authentiques Caribéennes',
  'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne. Nous créons des expériences culinaires mémorables pour tous vos événements.',
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'
) ON CONFLICT DO NOTHING;

-- Insérer des catégories de menu
INSERT INTO menu_categories (name, description, image_url, sort_order, is_active)
VALUES
('Entrées', 'Délicieuses entrées haïtiennes pour commencer votre repas', 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 1, true),
('Plats Principaux', 'Nos spécialités haïtiennes authentiques', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 2, true),
('Accompagnements', 'Riz, légumes et autres accompagnements traditionnels', 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 3, true),
('Desserts', 'Douceurs caribéennes pour terminer en beauté', 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 4, true),
('Boissons', 'Boissons traditionnelles et rafraîchissantes', 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 5, true)
ON CONFLICT DO NOTHING;

-- Insérer des plats
INSERT INTO menu_items (category_id, name, description, price, image_url, ingredients, allergens, preparation_time, calories, is_available, is_festive, sort_order)
VALUES
-- Entrées
((SELECT id FROM menu_categories WHERE name = 'Entrées' LIMIT 1), 'Accra de Morue', 'Beignets de morue épicés, spécialité antillaise croustillante', 12.99, 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Morue', 'Farine', 'Épices', 'Huile'], ARRAY['Gluten', 'Poisson'], 25, 320, true, false, 1),
((SELECT id FROM menu_categories WHERE name = 'Entrées' LIMIT 1), 'Pâtés Haïtiens', 'Chaussons croustillants farcis à la viande épicée', 8.99, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Pâte', 'Bœuf', 'Épices', 'Oignons'], ARRAY['Gluten'], 30, 280, true, false, 2),
((SELECT id FROM menu_categories WHERE name = 'Entrées' LIMIT 1), 'Marinade de Poisson', 'Poisson mariné aux épices créoles, servi froid', 15.99, 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Poisson', 'Citron vert', 'Épices', 'Oignons'], ARRAY['Poisson'], 20, 250, true, false, 3),

-- Plats Principaux
((SELECT id FROM menu_categories WHERE name = 'Plats Principaux' LIMIT 1), 'Griot Haïtien', 'Porc mariné et frit, servi avec du riz et des légumes traditionnels', 25.99, 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Porc', 'Épices haïtiennes', 'Ail', 'Citron vert'], ARRAY[]::text[], 45, 650, true, false, 1),
((SELECT id FROM menu_categories WHERE name = 'Plats Principaux' LIMIT 1), 'Poulet Créole', 'Poulet mijoté aux épices créoles avec légumes et riz parfumé', 22.99, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Poulet', 'Tomates', 'Oignons', 'Épices créoles'], ARRAY[]::text[], 40, 580, true, false, 2),
((SELECT id FROM menu_categories WHERE name = 'Plats Principaux' LIMIT 1), 'Poisson Gros Sel', 'Poisson frais grillé au gros sel avec légumes de saison', 28.99, 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Poisson frais', 'Gros sel', 'Légumes', 'Herbes'], ARRAY['Poisson'], 35, 520, true, false, 3),
((SELECT id FROM menu_categories WHERE name = 'Plats Principaux' LIMIT 1), 'Cabri en Sauce', 'Chèvre mijotée dans une sauce épicée traditionnelle', 32.99, 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Chèvre', 'Épices', 'Tomates', 'Oignons'], ARRAY[]::text[], 60, 720, true, true, 4),
((SELECT id FROM menu_categories WHERE name = 'Plats Principaux' LIMIT 1), 'Lambi en Sauce', 'Conque des Caraïbes mijotée aux épices', 35.99, 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Lambi', 'Épices', 'Sauce créole'], ARRAY['Fruits de mer'], 50, 480, true, true, 5),

-- Accompagnements
((SELECT id FROM menu_categories WHERE name = 'Accompagnements' LIMIT 1), 'Riz Collé aux Haricots', 'Riz traditionnel haïtien aux haricots rouges', 8.99, 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Riz', 'Haricots rouges', 'Lait de coco'], ARRAY[]::text[], 30, 280, true, false, 1),
((SELECT id FROM menu_categories WHERE name = 'Accompagnements' LIMIT 1), 'Bananes Pesées', 'Bananes plantains frites, accompagnement traditionnel', 6.99, 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Bananes plantains', 'Huile'], ARRAY[]::text[], 15, 220, true, false, 2),
((SELECT id FROM menu_categories WHERE name = 'Accompagnements' LIMIT 1), 'Légumes Créoles', 'Mélange de légumes sautés aux épices', 9.99, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Légumes variés', 'Épices créoles'], ARRAY[]::text[], 20, 150, true, false, 3),

-- Desserts
((SELECT id FROM menu_categories WHERE name = 'Desserts' LIMIT 1), 'Doukounou', 'Pudding de maïs traditionnel haïtien', 7.99, 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Maïs', 'Lait de coco', 'Épices'], ARRAY[]::text[], 45, 320, true, false, 1),
((SELECT id FROM menu_categories WHERE name = 'Desserts' LIMIT 1), 'Pain Patate', 'Gâteau à la patate douce épicé', 8.99, 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Patate douce', 'Farine', 'Épices'], ARRAY['Gluten'], 60, 380, true, false, 2),
((SELECT id FROM menu_categories WHERE name = 'Desserts' LIMIT 1), 'Flan Coco', 'Flan au lait de coco et vanille', 6.99, 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Lait de coco', 'Œufs', 'Vanille'], ARRAY['Œufs', 'Lactose'], 40, 250, true, false, 3),

-- Boissons
((SELECT id FROM menu_categories WHERE name = 'Boissons' LIMIT 1), 'Jus de Canne', 'Jus de canne à sucre frais', 4.99, 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Canne à sucre'], ARRAY[]::text[], 5, 120, true, false, 1),
((SELECT id FROM menu_categories WHERE name = 'Boissons' LIMIT 1), 'Akasan', 'Boisson traditionnelle au maïs et épices', 5.99, 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Maïs', 'Lait', 'Épices'], ARRAY['Lactose'], 15, 180, true, false, 2),
((SELECT id FROM menu_categories WHERE name = 'Boissons' LIMIT 1), 'Thé Glacé Tropical', 'Thé glacé aux fruits tropicaux', 3.99, 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', ARRAY['Thé', 'Fruits tropicaux'], ARRAY[]::text[], 10, 80, true, false, 3)
ON CONFLICT DO NOTHING;

-- Insérer des menus spéciaux
INSERT INTO special_menus (name, description, image_url, event_type, price, is_active, sort_order)
VALUES
('Menu Mariage Traditionnel', 'Menu complet pour célébrations de mariage avec plats traditionnels haïtiens pour 50 personnes', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Mariage', 45.00, true, 1),
('Menu Anniversaire Festif', 'Sélection spéciale pour anniversaires avec desserts et plats de fête', 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Anniversaire', 35.00, true, 2),
('Menu Corporatif', 'Menu professionnel adapté aux événements d''entreprise', 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Corporatif', 40.00, true, 3),
('Menu Baptême', 'Menu spécial pour célébrations religieuses et familiales', 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Baptême', 38.00, true, 4),
('Menu Graduation', 'Menu festif pour célébrer les réussites académiques', 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Graduation', 42.00, true, 5)
ON CONFLICT DO NOTHING;

-- Insérer des albums de galerie
INSERT INTO gallery_albums (name, description, cover_image_url, event_date, is_active)
VALUES
('Mariage de Marie et Jean', 'Magnifique célébration de mariage avec 120 invités dans un cadre enchanteur', 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', '2024-06-15', true),
('Anniversaire 50 ans de Paul', 'Fête d''anniversaire familiale avec cuisine traditionnelle et ambiance chaleureuse', 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', '2024-05-20', true),
('Événement Corporatif ABC Inc', 'Réception d''entreprise avec service traiteur complet et animation professionnelle', 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', '2024-04-10', true),
('Baptême de Sophie', 'Célébration religieuse intime avec menu traditionnel haïtien', 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', '2024-03-25', true),
('Graduation de Marc', 'Fête de fin d''études avec buffet festif et desserts spéciaux', 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', '2024-07-08', true)
ON CONFLICT DO NOTHING;

-- Insérer des images pour les albums
INSERT INTO gallery_images (album_id, image_url, caption, sort_order)
SELECT
  a.id,
  'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  'Table d''honneur magnifiquement dressée avec décoration florale',
  1
FROM gallery_albums a
WHERE a.name = 'Mariage de Marie et Jean'
ON CONFLICT DO NOTHING;

INSERT INTO gallery_images (album_id, image_url, caption, sort_order)
SELECT
  a.id,
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  'Buffet de plats haïtiens traditionnels avec griot et riz collé',
  2
FROM gallery_albums a
WHERE a.name = 'Mariage de Marie et Jean'
ON CONFLICT DO NOTHING;

INSERT INTO gallery_images (album_id, image_url, caption, sort_order)
SELECT
  a.id,
  'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  'Gâteau d''anniversaire et desserts créoles',
  1
FROM gallery_albums a
WHERE a.name = 'Anniversaire 50 ans de Paul'
ON CONFLICT DO NOTHING;

INSERT INTO gallery_images (album_id, image_url, caption, sort_order)
SELECT
  a.id,
  'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
  'Service cocktail professionnel avec canapés',
  1
FROM gallery_albums a
WHERE a.name = 'Événement Corporatif ABC Inc'
ON CONFLICT DO NOTHING;

-- Créer quelques commandes d'exemple
INSERT INTO orders (customer_id, order_number, status, delivery_type, delivery_address, delivery_date, subtotal, tax_amount, total_amount)
SELECT
  p.id,
  'CMD-001',
  'delivered',
  'delivery',
  'Montréal, Québec, Canada',
  now() - interval '7 days',
  245.99,
  36.77,
  282.76
FROM profiles p
WHERE p.email = 'client@example.com'
ON CONFLICT DO NOTHING;

-- Créer quelques réservations d'exemple
INSERT INTO reservations (customer_id, reservation_number, event_type, event_date, guest_count, venue_address, status, estimated_cost)
SELECT
  p.id,
  'RES-001',
  'Mariage',
  now() + interval '30 days',
  120,
  'Montréal, Québec, Canada',
  'confirmed',
  5000.00
FROM profiles p
WHERE p.email = 'client@example.com'
ON CONFLICT DO NOTHING;