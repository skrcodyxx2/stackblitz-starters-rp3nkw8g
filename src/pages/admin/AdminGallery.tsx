import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Upload, X, Save } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import type { Database } from '../../types/database';

type Album = Database['public']['Tables']['gallery_albums']['Row'] & {
  gallery_images?: Database['public']['Tables']['gallery_images']['Row'][];
};

type AlbumImage = Database['public']['Tables']['gallery_images']['Row'];

export default function AdminGallery() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [showAlbumModal, setShowAlbumModal] = useState(false);
  const [showImageModal, setShowImageModal] = useState(false);
  const [editingAlbum, setEditingAlbum] = useState<Partial<Album>>({});
  const [editingImage, setEditingImage] = useState<Partial<AlbumImage>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const { data, error } = await supabase
        .from('gallery_albums')
        .select(`
          *,
          gallery_images (
            id,
            image_url,
            caption,
            sort_order
          )
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setAlbums(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des albums:', error);
      toast.error('Erreur lors du chargement des albums');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAlbum = async () => {
    try {
      if (editingAlbum.id) {
        // Update existing album
        const { error } = await supabase
          .from('gallery_albums')
          .update({
            name: editingAlbum.name,
            description: editingAlbum.description,
            cover_image_url: editingAlbum.cover_image_url,
            event_date: editingAlbum.event_date,
            is_active: editingAlbum.is_active,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingAlbum.id);

        if (error) throw error;
        toast.success('Album mis à jour avec succès');
      } else {
        // Create new album
        const { error } = await supabase
          .from('gallery_albums')
          .insert({
            name: editingAlbum.name,
            description: editingAlbum.description,
            cover_image_url: editingAlbum.cover_image_url,
            event_date: editingAlbum.event_date,
            is_active: editingAlbum.is_active ?? true
          });

        if (error) throw error;
        toast.success('Album créé avec succès');
      }

      setShowAlbumModal(false);
      setEditingAlbum({});
      fetchAlbums();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteAlbum = async (albumId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet album ?')) return;

    try {
      const { error } = await supabase
        .from('gallery_albums')
        .delete()
        .eq('id', albumId);

      if (error) throw error;
      toast.success('Album supprimé avec succès');
      fetchAlbums();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleSaveImage = async () => {
    try {
      if (editingImage.id) {
        // Update existing image
        const { error } = await supabase
          .from('gallery_images')
          .update({
            image_url: editingImage.image_url,
            caption: editingImage.caption,
            sort_order: editingImage.sort_order
          })
          .eq('id', editingImage.id);

        if (error) throw error;
        toast.success('Image mise à jour avec succès');
      } else {
        // Create new image
        const { error } = await supabase
          .from('gallery_images')
          .insert({
            album_id: selectedAlbum?.id,
            image_url: editingImage.image_url,
            caption: editingImage.caption,
            sort_order: editingImage.sort_order ?? 0
          });

        if (error) throw error;
        toast.success('Image ajoutée avec succès');
      }

      setShowImageModal(false);
      setEditingImage({});
      fetchAlbums();
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette image ?')) return;

    try {
      const { error } = await supabase
        .from('gallery_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;
      toast.success('Image supprimée avec succès');
      fetchAlbums();
    } catch (error) {
      console.error('Erreur lors de la suppression:', error);
      toast.error('Erreur lors de la suppression');
    }
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
              <h1 className="text-2xl font-bold text-gray-900">Gestion de la Galerie</h1>
              <p className="text-gray-600">Gérez les albums et photos de vos événements</p>
            </div>
            <button
              onClick={() => {
                setEditingAlbum({});
                setShowAlbumModal(true);
              }}
              className="btn-primary flex items-center"
            >
              <Plus className="w-5 h-5 mr-2" />
              Nouvel Album
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {selectedAlbum ? (
          /* Album Detail View */
          <div>
            <div className="flex items-center justify-between mb-6">
              <div>
                <button
                  onClick={() => setSelectedAlbum(null)}
                  className="text-primary-600 hover:text-primary-700 mb-2"
                >
                  ← Retour aux albums
                </button>
                <h2 className="text-2xl font-bold text-gray-900">{selectedAlbum.name}</h2>
                <p className="text-gray-600">{selectedAlbum.description}</p>
              </div>
              <button
                onClick={() => {
                  setEditingImage({ album_id: selectedAlbum.id });
                  setShowImageModal(true);
                }}
                className="btn-primary flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                Ajouter une Image
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {selectedAlbum.gallery_images?.map((image) => (
                <div key={image.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                  <img
                    src={image.image_url}
                    alt={image.caption || ''}
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4">
                    <p className="text-sm text-gray-600 mb-3">{image.caption}</p>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingImage(image);
                          setShowImageModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteImage(image.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Albums Grid */
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {albums.map((album) => (
              <div key={album.id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <img
                  src={album.cover_image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'}
                  alt={album.name}
                  className="w-full h-48 object-cover cursor-pointer"
                  onClick={() => setSelectedAlbum(album)}
                />
                <div className="p-6">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-semibold text-gray-900">{album.name}</h3>
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                      album.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                    }`}>
                      {album.is_active ? 'Actif' : 'Inactif'}
                    </span>
                  </div>
                  <p className="text-gray-600 text-sm mb-3">{album.description}</p>
                  {album.event_date && (
                    <p className="text-gray-500 text-xs mb-4">
                      {new Date(album.event_date).toLocaleDateString('fr-CA')}
                    </p>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-500">
                      {album.gallery_images?.length || 0} photos
                    </span>
                    <div className="flex space-x-2">
                      <button
                        onClick={() => {
                          setEditingAlbum(album);
                          setShowAlbumModal(true);
                        }}
                        className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteAlbum(album.id)}
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
        )}
      </div>

      {/* Album Modal */}
      {showAlbumModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingAlbum.id ? 'Modifier l\'Album' : 'Nouvel Album'}
              </h3>
              <button
                onClick={() => setShowAlbumModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'album
                </label>
                <input
                  type="text"
                  value={editingAlbum.name || ''}
                  onChange={(e) => setEditingAlbum({ ...editingAlbum, name: e.target.value })}
                  className="input-field"
                  placeholder="Ex: Mariage de Marie et Jean"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={editingAlbum.description || ''}
                  onChange={(e) => setEditingAlbum({ ...editingAlbum, description: e.target.value })}
                  className="input-field resize-none"
                  rows={3}
                  placeholder="Description de l'événement..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image de couverture (URL)
                </label>
                <input
                  type="url"
                  value={editingAlbum.cover_image_url || ''}
                  onChange={(e) => setEditingAlbum({ ...editingAlbum, cover_image_url: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de l'événement
                </label>
                <input
                  type="date"
                  value={editingAlbum.event_date || ''}
                  onChange={(e) => setEditingAlbum({ ...editingAlbum, event_date: e.target.value })}
                  className="input-field"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="is_active"
                  checked={editingAlbum.is_active ?? true}
                  onChange={(e) => setEditingAlbum({ ...editingAlbum, is_active: e.target.checked })}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                />
                <label htmlFor="is_active" className="ml-2 block text-sm text-gray-900">
                  Album actif
                </label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowAlbumModal(false)}
                className="btn-outline"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveAlbum}
                className="btn-primary flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {showImageModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingImage.id ? 'Modifier l\'Image' : 'Ajouter une Image'}
              </h3>
              <button
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  URL de l'image
                </label>
                <input
                  type="url"
                  value={editingImage.image_url || ''}
                  onChange={(e) => setEditingImage({ ...editingImage, image_url: e.target.value })}
                  className="input-field"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Légende
                </label>
                <input
                  type="text"
                  value={editingImage.caption || ''}
                  onChange={(e) => setEditingImage({ ...editingImage, caption: e.target.value })}
                  className="input-field"
                  placeholder="Description de l'image..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ordre d'affichage
                </label>
                <input
                  type="number"
                  value={editingImage.sort_order || 0}
                  onChange={(e) => setEditingImage({ ...editingImage, sort_order: parseInt(e.target.value) })}
                  className="input-field"
                  min="0"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowImageModal(false)}
                className="btn-outline"
              >
                Annuler
              </button>
              <button
                onClick={handleSaveImage}
                className="btn-primary flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                Sauvegarder
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}