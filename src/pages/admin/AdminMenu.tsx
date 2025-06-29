import React, { useState, useEffect } from 'react';
import { Utensils, Plus, Search, Edit, Trash2, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import { formatPrice } from '../../utils/formatters';
import toast from 'react-hot-toast';
import type { Database } from '../../types/database';

type MenuCategory = Database['public']['Tables']['menu_categories']['Row'];
type MenuItem = Database['public']['Tables']['menu_items']['Row'];
type SpecialMenu = Database['public']['Tables']['special_menus']['Row'];

export default function AdminMenu() {
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [specialMenus, setSpecialMenus] = useState<SpecialMenu[]>([]);
  const [filteredItems, setFilteredItems] = useState<MenuItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'items' | 'specials' | 'categories'>('items');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<'category' | 'item' | 'special'>('item');
  const [editingItem, setEditingItem] = useState<any>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  useEffect(() => {
    filterItems();
  }, [selectedCategory, searchTerm, menuItems]);

  const fetchData = async () => {
    try {
      const [categoriesRes, itemsRes, specialsRes] = await Promise.all([
        supabase.from('menu_categories').select('*').order('sort_order'),
        supabase.from('menu_items').select('*').order('sort_order'),
        supabase.from('special_menus').select('*').order('sort_order')
      ]);

      if (categoriesRes.error) throw categoriesRes.error;
      if (itemsRes.error) throw itemsRes.error;
      if (specialsRes.error) throw specialsRes.error;

      setCategories(categoriesRes.data || []);
      setMenuItems(itemsRes.data || []);
      setSpecialMenus(specialsRes.data || []);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      toast.error('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  const filterItems = () => {
    let filtered = menuItems;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(item => item.category_id === selectedCategory);
    }

    if (searchTerm) {
      filtered = filtered.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredItems(filtered);
  };

  const handleSave = async () => {
    try {
      if (modalType === 'category') {
        if (editingItem.id) {
          const { error } = await supabase
            .from('menu_categories')
            .update(editingItem)
            .eq('id', editingItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('menu_categories')
            .insert(editingItem);
          if (error) throw error;
        }
      } else if (modalType === 'item') {
        if (editingItem.id) {
          const { error } = await supabase
            .from('menu_items')
            .update(editingItem)
            .eq('id', editingItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('menu_items')
            .insert(editingItem);
          if (error) throw error;
        }
      } else if (modalType === 'special') {
        if (editingItem.id) {
          const { error } = await supabase
            .from('special_menus')
            .update(editingItem)
            .eq('id', editingItem.id);
          if (error) throw error;
        } else {
          const { error } = await supabase
            .from('special_menus')
            .insert(editingItem);
          if (error) throw error;
        }
      }

      toast.success('Sauvegardé avec succès');
      setShowModal(false);
      setEditingItem({});
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (type: string, id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet élément ?')) return;

    try {
      let error;
      if (type === 'category') {
        ({ error } = await supabase.from('menu_categories').delete().eq('id', id));
      } else if (type === 'item') {
        ({ error } = await supabase.from('menu_items').delete().eq('id', id));
      } else if (type === 'special') {
        ({ error } = await supabase.from('special_menus').delete().eq('id', id));
      }

      if (error) throw error;
      toast.success('Supprimé avec succès');
      fetchData();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const openModal = (type: 'category' | 'item' | 'special', item?: any) => {
    setModalType(type);
    setEditingItem(item || {});
    setShowModal(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Gestion du Menu</h1>
              <p className="text-gray-600">Gérez vos catégories, plats et menus spéciaux</p>
            </div>
            <div className="flex space-x-3">
              <button 
                onClick={() => openModal('category')}
                className="btn-outline"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle Catégorie
              </button>
              <button 
                onClick={() => openModal('item')}
                className="btn-primary"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouveau Plat
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8">
            {[
              { id: 'items', label: 'Plats', count: menuItems.length },
              { id: 'specials', label: 'Menus Spéciaux', count: specialMenus.length },
              { id: 'categories', label: 'Catégories', count: categories.length }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'items' && (
          <>
            {/* Search and Filters */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Rechercher un plat..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="input-field pl-10"
                  />
                </div>
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="input-field"
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

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredItems.map((item) => (
                <div key={item.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <img
                    src={item.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'}
                    alt={item.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                      {item.price && (
                        <span className="text-lg font-bold text-primary-600">
                          {formatPrice(item.price)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">{item.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        item.is_available ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                        {item.is_available ? 'Disponible' : 'Indisponible'}
                      </span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openModal('item', item)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete('item', item.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'specials' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Menus Spéciaux</h2>
              <button 
                onClick={() => openModal('special')}
                className="btn-primary"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouveau Menu Spécial
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {specialMenus.map((menu) => (
                <div key={menu.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <img
                    src={menu.image_url}
                    alt={menu.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-gray-900">{menu.name}</h3>
                      {menu.price && (
                        <span className="text-lg font-bold text-primary-600">
                          {formatPrice(menu.price)}
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 text-sm mb-3">{menu.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                        {menu.event_type}
                      </span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openModal('special', menu)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete('special', menu.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'categories' && (
          <>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">Catégories</h2>
              <button 
                onClick={() => openModal('category')}
                className="btn-primary"
              >
                <Plus className="w-5 h-5 mr-2" />
                Nouvelle Catégorie
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <div key={category.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <img
                    src={category.image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'}
                    alt={category.name}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">{category.name}</h3>
                    <p className="text-gray-600 text-sm mb-4">{category.description}</p>
                    <div className="flex items-center justify-between">
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        category.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {category.is_active ? 'Active' : 'Inactive'}
                      </span>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => openModal('category', category)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDelete('category', category.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">
                  {editingItem.id ? 'Modifier' : 'Créer'} {
                    modalType === 'category' ? 'une Catégorie' :
                    modalType === 'item' ? 'un Plat' : 'un Menu Spécial'
                  }
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Nom</label>
                  <input
                    type="text"
                    value={editingItem.name || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    value={editingItem.description || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, description: e.target.value })}
                    className="input-field resize-none"
                    rows={3}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Image URL</label>
                  <input
                    type="url"
                    value={editingItem.image_url || ''}
                    onChange={(e) => setEditingItem({ ...editingItem, image_url: e.target.value })}
                    className="input-field"
                  />
                </div>

                {modalType === 'item' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Catégorie</label>
                      <select
                        value={editingItem.category_id || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, category_id: e.target.value })}
                        className="input-field"
                      >
                        <option value="">Sélectionner une catégorie</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>
                            {category.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prix (optionnel)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingItem.price || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || null })}
                        className="input-field"
                      />
                    </div>

                    <div className="flex items-center space-x-4">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingItem.is_available ?? true}
                          onChange={(e) => setEditingItem({ ...editingItem, is_available: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-900">Disponible</span>
                      </label>

                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={editingItem.is_festive || false}
                          onChange={(e) => setEditingItem({ ...editingItem, is_festive: e.target.checked })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="ml-2 text-sm text-gray-900">Plat festif</span>
                      </label>
                    </div>
                  </>
                )}

                {modalType === 'special' && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Type d'événement</label>
                      <input
                        type="text"
                        value={editingItem.event_type || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, event_type: e.target.value })}
                        className="input-field"
                        placeholder="Ex: Mariage, Anniversaire, Corporatif"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Prix (optionnel)</label>
                      <input
                        type="number"
                        step="0.01"
                        value={editingItem.price || ''}
                        onChange={(e) => setEditingItem({ ...editingItem, price: parseFloat(e.target.value) || null })}
                        className="input-field"
                      />
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={editingItem.is_active ?? true}
                        onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                        className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                      />
                      <span className="ml-2 text-sm text-gray-900">Menu actif</span>
                    </div>
                  </>
                )}

                {modalType === 'category' && (
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={editingItem.is_active ?? true}
                      onChange={(e) => setEditingItem({ ...editingItem, is_active: e.target.checked })}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                    />
                    <span className="ml-2 text-sm text-gray-900">Catégorie active</span>
                  </div>
                )}
              </div>

              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => setShowModal(false)}
                  className="btn-outline"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  className="btn-primary flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Sauvegarder
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}