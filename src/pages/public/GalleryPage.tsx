import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import type { Database } from '../../types/database';
import toast from 'react-hot-toast';

type Album = Database['public']['Tables']['gallery_albums']['Row'] & {
  gallery_images?: Database['public']['Tables']['gallery_images']['Row'][];
};

// Default albums to show when database connection fails
const defaultAlbums: Album[] = [
  {
    id: '1',
    name: 'Mariage de Marie et Jean',
    description: 'Magnifique célébration de mariage avec 120 invités dans un cadre enchanteur',
    cover_image_url: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    event_date: '2024-06-15',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    gallery_images: [
      {
        id: '1-1',
        album_id: '1',
        image_url: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
        caption: 'Table d\'honneur magnifiquement dressée avec décoration florale',
        sort_order: 1,
        created_at: new Date().toISOString()
      },
      {
        id: '1-2',
        album_id: '1',
        image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
        caption: 'Buffet de plats haïtiens traditionnels avec griot et riz collé',
        sort_order: 2,
        created_at: new Date().toISOString()
      }
    ]
  },
  {
    id: '2',
    name: 'Anniversaire 50 ans de Paul',
    description: 'Fête d\'anniversaire familiale avec cuisine traditionnelle et ambiance chaleureuse',
    cover_image_url: 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
    event_date: '2024-05-20',
    is_active: true,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    gallery_images: [
      {
        id: '2-1',
        album_id: '2',
        image_url: 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop',
        caption: 'Gâteau d\'anniversaire et desserts créoles',
        sort_order: 1,
        created_at: new Date().toISOString()
      }
    ]
  }
];

export default function GalleryPage() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise<{data: null, error: Error}>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const fetchPromise = supabase
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
      
      const result = await Promise.race([fetchPromise, timeoutPromise]);
      
      if (result.error) {
        console.warn('Error fetching albums:', result.error);
        throw result.error;
      }
      
      setAlbums(result.data || []);
      
      if (result.data && result.data.length === 0) {
        console.log('No albums found, using default data');
        setAlbums(defaultAlbums);
      }
    } catch (error) {
      console.error('Error fetching gallery albums:', error);
      
      // Handle different error types
      if (error instanceof TypeError && error.message.includes('fetch')) {
        setError('Problème de connexion au serveur. Veuillez vérifier votre connexion internet.');
        toast.error('Problème de connexion au serveur');
      } else if (error instanceof Error && error.message === 'Request timeout') {
        setError('La requête a pris trop de temps. Veuillez réessayer plus tard.');
        toast.error('Temps d\'attente dépassé');
      } else {
        setError('Une erreur est survenue lors du chargement de la galerie.');
        toast.error('Erreur de chargement');
      }
      
      // Use default data as fallback
      setAlbums(defaultAlbums);
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
    if (selectedAlbum && selectedImageIndex !== null && selectedAlbum.gallery_images) {
      const nextIndex = (selectedImageIndex + 1) % selectedAlbum.gallery_images.length;
      setSelectedImageIndex(nextIndex);
    }
  };

  const prevImage = () => {
    if (selectedAlbum && selectedImageIndex !== null && selectedAlbum.gallery_images) {
      const prevIndex = selectedImageIndex === 0 
        ? selectedAlbum.gallery_images.length - 1 
        : selectedImageIndex - 1;
      setSelectedImageIndex(prevIndex);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('fr-CA', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (e) {
      console.error('Error formatting date:', e);
      return dateString;
    }
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6 text-white text-shadow-lg">
              Notre
              <span className="block text-secondary-400">Galerie</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 text-shadow-md">
              Découvrez nos créations culinaires et les moments mémorables que nous avons 
              contribué à créer pour nos clients à travers nos albums d'événements.
            </p>
          </div>
        </div>
      </section>

      {/* Albums Grid */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          {error && (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-8">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    {error}
                    <button 
                      onClick={fetchAlbums} 
                      className="ml-2 font-medium text-yellow-700 underline"
                    >
                      Réessayer
                    </button>
                  </p>
                </div>
              </div>
            </div>
          )}

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
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop';
                      }}
                    />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70 group-hover:opacity-90 transition-opacity duration-300"></div>
                  <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                    <h3 className="text-xl font-bold mb-2 text-shadow-md">{album.name}</h3>
                    <p className="text-sm text-gray-200 mb-2 text-shadow-sm">{album.description}</p>
                    {album.event_date && (
                      <p className="text-xs text-gray-300 text-shadow-sm">{formatDate(album.event_date)}</p>
                    )}
                    <p className="text-xs text-gray-300 text-shadow-sm">{album.gallery_images?.length || 0} photos</p>
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
              <h2 className="text-2xl font-bold text-shadow-md">{selectedAlbum.name}</h2>
              <p className="text-gray-300 text-shadow-sm">{selectedAlbum.description}</p>
              {selectedAlbum.event_date && (
                <p className="text-sm text-gray-400 text-shadow-sm">{formatDate(selectedAlbum.event_date)}</p>
              )}
            </div>
            <button
              onClick={closeAlbum}
              className="text-white hover:text-gray-300 p-2 bg-black bg-opacity-50 rounded-full"
            >
              <X className="w-8 h-8" />
            </button>
          </div>

          {/* Images Grid */}
          <div className="flex-1 overflow-y-auto p-6">
            {selectedAlbum.gallery_images && selectedAlbum.gallery_images.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {selectedAlbum.gallery_images
                  .sort((a, b) => a.sort_order - b.sort_order)
                  .map((image, index) => (
                    <div
                      key={image.id}
                      className="relative group cursor-pointer"
                      onClick={() => openLightbox(index)}
                    >
                      <img
                        src={image.image_url}
                        alt={image.caption || ''}
                        className="w-full h-32 md:h-48 object-cover rounded-lg group-hover:opacity-80 transition-opacity duration-200"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=400&h=300&fit=crop';
                        }}
                      />
                      {image.caption && (
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-70 text-white p-2 rounded-b-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <p className="text-xs truncate text-shadow-sm">{image.caption}</p>
                        </div>
                      )}
                    </div>
                  ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full">
                <p className="text-white text-xl">Aucune image disponible dans cet album.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Lightbox */}
      {selectedAlbum && selectedImageIndex !== null && selectedAlbum.gallery_images && (
        <div className="fixed inset-0 bg-black bg-opacity-95 z-60 flex items-center justify-center p-4">
          <button
            onClick={closeLightbox}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 p-2 rounded-full"
          >
            <X className="w-8 h-8" />
          </button>
          
          <button
            onClick={prevImage}
            className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 p-2 rounded-full"
          >
            <ChevronLeft className="w-8 h-8" />
          </button>
          
          <button
            onClick={nextImage}
            className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10 bg-black bg-opacity-50 p-2 rounded-full"
          >
            <ChevronRight className="w-8 h-8" />
          </button>
          
          <div className="max-w-4xl max-h-full flex flex-col items-center">
            <img
              src={selectedAlbum.gallery_images[selectedImageIndex].image_url}
              alt={selectedAlbum.gallery_images[selectedImageIndex].caption || ''}
              className="max-w-full max-h-[80vh] object-contain rounded-lg"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop';
              }}
            />
            
            {selectedAlbum.gallery_images[selectedImageIndex].caption && (
              <div className="mt-4 text-white text-center bg-black bg-opacity-70 p-4 rounded-lg w-full">
                <p className="text-lg text-shadow-sm">{selectedAlbum.gallery_images[selectedImageIndex].caption}</p>
                <p className="text-sm text-gray-300 mt-2">
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