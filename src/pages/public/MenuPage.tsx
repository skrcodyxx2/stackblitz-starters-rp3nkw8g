import React, { useState, useEffect } from 'react';
import { Search, Filter, Star, Clock, Users } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { useMenuData } from '../../hooks/useMenuData';
import { formatPrice } from '../../utils/formatters';
import type { Database } from '../../types/database';

type MenuCategory = Database['public']['Tables']['menu_categories']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];
type SpecialMenu = Database['public']['Tables']['special_menus']['Row'];

export default function MenuPage() {
  const { categories, menuItems, loading, error, refetch } = useMenuData();
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>(menuItems);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'items' | 'specials'>('items');

  useEffect(() => {
    let filtered = menuItems;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category_id === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  }, [selectedCategory, searchTerm, menuItems]);

  if (loading) {
    return (
      <div className="min-h-screen">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="loading-spinner"></div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-primary-900 to-secondary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop)'
          }}
        ></div>
        <div className="relative container-custom section-padding">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white">
              Notre
              <span className="block text-secondary-400">Menu</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Découvrez nos spécialités haïtiennes et caribéennes préparées avec passion 
              et des ingrédients de qualité premium.
            </p>
          </div>
        </div>
      </section>

      {/* Menu Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          {/* Tabs */}
          <div className="flex justify-center mb-8">
            <div className="bg-gray-100 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('items')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'items'
                    ? 'bg-white text-primary-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Plats Individuels
              </button>
              <button
                onClick={() => setActiveTab('specials')}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                  activeTab === 'specials'
                    ? 'bg-white text-primary-600 shadow-md'
                    : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                Menus Spéciaux
              </button>
            </div>
          </div>

          {activeTab === 'items' ? (
            <>
              {/* Search and Filter */}
              <div className="mb-12">
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                  {/* Search */}
                  <div className="relative flex-1">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="Rechercher un plat..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="input-field pl-10"
                    />
                  </div>

                  {/* Category Filter */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Filter className="h-5 w-5 text-gray-400" />
                    </div>
                    <select
                      value={selectedCategory}
                      onChange={(e) => setSelectedCategory(e.target.value)}
                      className="input-field pl-10 pr-8"
                    >
                      <option value="all">Toutes les catégories</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Category Tabs */}
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                      selectedCategory === 'all'
                        ? 'bg-primary-600 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    Tous
                  </button>
                  {categories.map((category) => (
                    <button
                      key={category.id}
                      onClick={() => setSelectedCategory(category.id)}
                      className={`px-6 py-3 rounded-full font-medium transition-all duration-200 ${
                        selectedCategory === category.id
                          ? 'bg-primary-600 text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {category.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu Items Grid */}
              {filteredItems.length === 0 ? (
                <div className="text-center py-12">
                  <p className="text-xl text-gray-600">
                    Aucun plat trouvé pour votre recherche.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {filteredItems.map((item) => (
                    <div
                      key={item.id}
                      className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                    >
                      {/* Image */}
                      <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
                        <img
                          src={item.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'}
                          alt={item.name}
                          className="w-full h-48 object-cover"
                        />
                        {item.is_festive && (
                          <div className="absolute top-4 right-4 bg-secondary-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                            Festif
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6">
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-bold text-gray-900">{item.name}</h3>
                          {item.price && (
                            <span className="text-2xl font-bold text-primary-600">
                              {formatPrice(item.price)}
                            </span>
                          )}
                        </div>

                        <p className="text-gray-600 mb-4 line-clamp-3">
                          {item.description}
                        </p>

                        {/* Meta Info */}
                        <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                          {item.preparation_time && (
                            <div className="flex items-center">
                              <Clock className="w-4 h-4 mr-1" />
                              <span>{item.preparation_time} min</span>
                            </div>
                          )}
                          {item.calories && (
                            <div className="flex items-center">
                              <span>{item.calories} cal</span>
                            </div>
                          )}
                        </div>

                        {/* Ingredients */}
                        {item.ingredients && item.ingredients.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Ingrédients:</p>
                            <div className="flex flex-wrap gap-1">
                              {item.ingredients.slice(0, 3).map((ingredient, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full"
                                >
                                  {ingredient}
                                </span>
                              ))}
                              {item.ingredients.length > 3 && (
                                <span className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full">
                                  +{item.ingredients.length - 3}
                                </span>
                              )}
                            </div>
                          </div>
                        )}

                        {/* Allergens */}
                        {item.allergens && item.allergens.length > 0 && (
                          <div className="mb-4">
                            <p className="text-sm font-medium text-gray-700 mb-2">Allergènes:</p>
                            <div className="flex flex-wrap gap-1">
                              {item.allergens.map((allergen, index) => (
                                <span
                                  key={index}
                                  className="px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full"
                                >
                                  {allergen}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Action Button */}
                        <button className="w-full btn-primary">
                          Ajouter au Devis
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Special Menus */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {specialMenus.map((menu) => (
                <div
                  key={menu.id}
                  className="card hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
                >
                  {/* Image */}
                  <div className="aspect-w-16 aspect-h-9 relative overflow-hidden">
                    <img
                      src={menu.image_url}
                      alt={menu.name}
                      className="w-full h-48 object-cover"
                    />
                    <div className="absolute top-4 left-4 bg-accent-600 text-white px-3 py-1 rounded-full text-sm font-medium">
                      {menu.event_type}
                    </div>
                  </div>

                  {/* Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-xl font-bold text-gray-900">{menu.name}</h3>
                      {menu.price && (
                        <span className="text-2xl font-bold text-primary-600">
                          {formatPrice(menu.price)}
                        </span>
                      )}
                    </div>

                    <p className="text-gray-600 mb-6">
                      {menu.description}
                    </p>

                    {/* Action Button */}
                    <button className="w-full btn-primary">
                      Demander un Devis
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Envie de Goûter nos Spécialités ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-100">
            Contactez-nous pour créer un menu personnalisé pour votre événement 
            ou pour passer une commande.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="btn-secondary bg-white text-primary-600 hover:bg-gray-100">
              Demander un Devis
            </button>
            <button className="btn-outline border-white text-white hover:bg-white hover:text-primary-600">
              Nous Contacter
            </button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}