import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import type { Database } from '../../types/database';

type Album = Database['public']['Tables']['gallery_albums']['Row'] & {
  gallery_images: Database['public']['Tables']['gallery_images']['Row'][];
};

export default function GalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
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
        .eq('is_active', true)
        .order('event_date', { ascending: false });

      if (error) throw error;
      setAlbums(data || []);
    } catch (error) {
      console.error('Erreur lors du chargement des albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAlbum = (album: Album) => {
    setSelectedAlbum(album);
  };

  const closeAlbum = () => {
    setSelectedAlbum(null);
    setSelectedImageIndex(null);
  };

  const openLightbox = (index: number) => {
    setSelectedImageIndex(index);
  };

  const closeLightbox = () => {
    setSelectedImageIndex(null);
  };

  const nextImage = () => {
    if (selectedAlbum && selectedImageIndex !== null) {
      const nextIndex = (selectedImageIndex + 1) % selectedAlbum.gallery_images.length;
      setSelectedImageIndex(nextIndex);
    }
  };

  const prevImage = () => {
    if (selectedAlbum && selectedImageIndex !== null) {
      const prevIndex = selectedImageIndex === 0 
        ? selectedAlbum.gallery_images.length - 1 
        : selectedImageIndex - 1;
      setSelectedImageIndex(prevIndex);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-CA', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

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
              <span className="block text-secondary-400">Galerie</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Découvrez nos créations culinaires et les moments mémorables que nous avons 
              contribué à créer pour nos clients à travers nos albums d'événements.
            </p>
          </div>
        </div>
      </section>

      {/* Albums Grid */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          {albums.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-xl text-gray-600">
                Aucun album disponible pour le moment.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {albums.map((album) => (
                <div
                  key={album.id}
                  className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer transform hover:-translate-y-2"
                  onClick={() => openAlbum(album)}
                >
                  <div className="aspect-w-16 aspect-h-12">
                    <img
                      src={album.cover_image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop'}
                      alt={album.name}
                      className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="text-xl font-bold mb-2">{album.name}</h3>
                    <p className="text-sm text-gray-200 mb-2">{album.description}</p>
                    {album.event_date && (
                      <p className="text-xs text-gray-300">{formatDate(album.event_date)}</p>
                    )}
                    <p className="text-xs text-gray-300">{album.gallery_images?.length || 0} photos</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Album Modal */}
      {selectedAlbum && (
        <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-6 text-white">
            <div>
              <h2 className="text-2xl font-bold">{selectedAlbum.name}</h2>
              <p className="text-gray-300">{selectedAlbum.description}</p>
              {selectedAlbum.event_date && (
                <p className="text-sm text-gray-400">{formatDate(selectedAlbum.event_date)}</p>
              )}
            </div>
            <button
              onClick={closeAlbum}
              className="text-white hover:text-gray-300 p-2"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Images Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedAlbum.gallery_images
                ?.sort((a, b) => a.sort_order - b.sort_order)
                .map((image, index) => (
                  <div
                    key={image.id}
                    className="relative group cursor-pointer"
                    onClick={() => openLightbox(index)}
                  >
                    <img
                      src={image.image_url}
                      alt={image.caption || ''}
                      className="w-full h-32 object-cover rounded-lg group-hover:opacity-80 transition-opacity duration-200"
                    />
                    {image.caption && (
                      <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                        <p className="text-xs truncate">{image.caption}</p>
                      </div>
                    )}
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedAlbum && selectedImageIndex !== null && selectedAlbum.gallery_images && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-60 flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <X className="w-8 h-8" />
          </button>
          
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          
          <div className="max-w-4xl max-h-full">
            <img
              src={selectedAlbum.gallery_images[selectedImageIndex].image_url}
              alt={selectedAlbum.gallery_images[selectedImageIndex].caption || ''}
              className="max-w-full max-h-full object-contain rounded-lg"
            />
            
            {selectedAlbum.gallery_images[selectedImageIndex].caption && (
              <div className="absolute bottom-4 left-4 right-4 text-white text-center bg-black bg-opacity-70 p-4 rounded-lg">
                <p className="text-lg">{selectedAlbum.gallery_images[selectedImageIndex].caption}</p>
                <p className="text-sm text-gray-300">
                  {selectedImageIndex + 1} / {selectedAlbum.gallery_images.length}
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}