/*
  # Populate database with complete data

  1. Company Settings
    - Insert default company information
    - Business hours and social media
    - Legal pages content

  2. Menu Data
    - Categories with descriptions and images
    - Complete menu items with ingredients and allergens
    - Special menus for events

  3. Gallery Data
    - Photo albums for different events
    - Images for each album with captions
*/

-- Insert default company settings if none exist
INSERT INTO company_settings (
  id,
  name,
  slogan,
  description,
  address,
  phone,
  email,
  website,
  logo_url,
  favicon_url,
  hero_title,
  hero_subtitle,
  hero_image_url,
  tax_tps,
  tax_tvq,
  business_hours,
  social_media,
  privacy_policy,
  terms_of_service,
  about_us,
  created_at,
  updated_at
) 
SELECT 
  gen_random_uuid(),
  'Dounie Cuisine Pro',
  'Saveurs Authentiques Caribéennes',
  'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne.',
  'Montréal, Québec, Canada',
  '+1 (514) 123-4567',
  'info@dounieculisine.ca',
  'https://dounieculisine.ca',
  null,
  null,
  'Saveurs Authentiques Caribéennes',
  'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne. Nous créons des expériences culinaires mémorables pour tous vos événements.',
  'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
  0.05,
  0.09975,
  '{
    "monday": {"open": "09:00", "close": "18:00", "closed": false},
    "tuesday": {"open": "09:00", "close": "18:00", "closed": false},
    "wednesday": {"open": "09:00", "close": "18:00", "closed": false},
    "thursday": {"open": "09:00", "close": "18:00", "closed": false},
    "friday": {"open": "09:00", "close": "18:00", "closed": false},
    "saturday": {"open": "10:00", "close": "16:00", "closed": false},
    "sunday": {"open": "10:00", "close": "16:00", "closed": true}
  }'::jsonb,
  '{
    "facebook": "https://facebook.com/dounieculisine",
    "instagram": "https://instagram.com/dounieculisine",
    "twitter": "https://twitter.com/dounieculisine",
    "linkedin": ""
  }'::jsonb,
  'Notre politique de confidentialité sera mise à jour prochainement.',
  'Nos conditions d''utilisation seront mises à jour prochainement.',
  'Dounie Cuisine Pro est une entreprise familiale spécialisée dans la cuisine haïtienne et caribéenne. Nous offrons des services de traiteur haut de gamme pour tous vos événements spéciaux.',
  now(),
  now()
WHERE NOT EXISTS (SELECT 1 FROM company_settings);

-- Insert menu categories if they don't exist
INSERT INTO menu_categories (name, description, image_url, sort_order, is_active) VALUES
('Entrées', 'Délicieuses entrées haïtiennes pour commencer votre repas', 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 1, true),
('Plats Principaux', 'Nos spécialités haïtiennes authentiques', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 2, true),
('Accompagnements', 'Riz, légumes et autres accompagnements traditionnels', 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 3, true),
('Desserts', 'Douceurs caribéennes pour terminer en beauté', 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 4, true),
('Boissons', 'Boissons traditionnelles et rafraîchissantes', 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop', 5, true)
ON CONFLICT (name) DO NOTHING;

-- Insert menu items if they don't exist
INSERT INTO menu_items (category_id, name, description, price, image_url, ingredients, allergens, preparation_time, calories, is_available, is_festive, sort_order) VALUES
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
ON CONFLICT (name) DO NOTHING;

-- Insert special menus if they don't exist
INSERT INTO special_menus (name, description, image_url, event_type, price, is_active, sort_order) VALUES
('Menu Mariage Traditionnel', 'Menu complet pour célébrations de mariage avec plats traditionnels haïtiens pour 50 personnes', 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Mariage', 45.00, true, 1),
('Menu Anniversaire Festif', 'Sélection spéciale pour anniversaires avec desserts et plats de fête', 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Anniversaire', 35.00, true, 2),
('Menu Corporatif', 'Menu professionnel adapté aux événements d''entreprise', 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Corporatif', 40.00, true, 3),
('Menu Baptême', 'Menu spécial pour célébrations religieuses et familiales', 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Baptême', 38.00, true, 4),
('Menu Graduation', 'Menu festif pour célébrer les réussites académiques', 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Graduation', 42.00, true, 5)
ON CONFLICT (name) DO NOTHING;

-- Insert gallery albums if they don't exist
INSERT INTO gallery_albums (name, description, cover_image_url, event_date, is_active) VALUES
('Mariage de Marie et Jean', 'Magnifique célébration de mariage avec 120 invités dans un cadre enchanteur', 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', '2024-06-15', true),
('Anniversaire 50 ans de Paul', 'Fête d''anniversaire familiale avec cuisine traditionnelle et ambiance chaleureuse', 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', '2024-05-20', true),
('Événement Corporatif ABC Inc', 'Réception d''entreprise avec service traiteur complet et animation professionnelle', 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', '2024-04-10', true),
('Baptême de Sophie', 'Célébration religieuse intime avec menu traditionnel haïtien', 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', '2024-03-25', true),
('Graduation de Marc', 'Fête de fin d''études avec buffet festif et desserts spéciaux', 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', '2024-07-08', true)
ON CONFLICT (name) DO NOTHING;

-- Insert gallery images if they don't exist
INSERT INTO gallery_images (album_id, image_url, caption, sort_order) VALUES
-- Mariage de Marie et Jean
((SELECT id FROM gallery_albums WHERE name = 'Mariage de Marie et Jean' LIMIT 1), 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Table d''honneur magnifiquement dressée avec décoration florale', 1),
((SELECT id FROM gallery_albums WHERE name = 'Mariage de Marie et Jean' LIMIT 1), 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Buffet de plats haïtiens traditionnels avec griot et riz collé', 2),
((SELECT id FROM gallery_albums WHERE name = 'Mariage de Marie et Jean' LIMIT 1), 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Service professionnel pendant la réception', 3),
((SELECT id FROM gallery_albums WHERE name = 'Mariage de Marie et Jean' LIMIT 1), 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Gâteau de mariage et desserts traditionnels', 4),

-- Anniversaire 50 ans de Paul
((SELECT id FROM gallery_albums WHERE name = 'Anniversaire 50 ans de Paul' LIMIT 1), 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Gâteau d''anniversaire et desserts créoles', 1),
((SELECT id FROM gallery_albums WHERE name = 'Anniversaire 50 ans de Paul' LIMIT 1), 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Ambiance familiale chaleureuse autour du buffet', 2),
((SELECT id FROM gallery_albums WHERE name = 'Anniversaire 50 ans de Paul' LIMIT 1), 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Plats traditionnels servis avec amour', 3),

-- Événement Corporatif ABC Inc
((SELECT id FROM gallery_albums WHERE name = 'Événement Corporatif ABC Inc' LIMIT 1), 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Service cocktail professionnel avec canapés', 1),
((SELECT id FROM gallery_albums WHERE name = 'Événement Corporatif ABC Inc' LIMIT 1), 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Buffet élégant pour l''événement d''entreprise', 2),
((SELECT id FROM gallery_albums WHERE name = 'Événement Corporatif ABC Inc' LIMIT 1), 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Présentation soignée des mets', 3),

-- Baptême de Sophie
((SELECT id FROM gallery_albums WHERE name = 'Baptême de Sophie' LIMIT 1), 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Table festive pour la célébration religieuse', 1),
((SELECT id FROM gallery_albums WHERE name = 'Baptême de Sophie' LIMIT 1), 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Buffet traditionnel haïtien pour l''occasion', 2),

-- Graduation de Marc
((SELECT id FROM gallery_albums WHERE name = 'Graduation de Marc' LIMIT 1), 'https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Buffet festif pour célébrer la réussite', 1),
((SELECT id FROM gallery_albums WHERE name = 'Graduation de Marc' LIMIT 1), 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop', 'Desserts spéciaux et gâteau de graduation', 2)
ON CONFLICT DO NOTHING;