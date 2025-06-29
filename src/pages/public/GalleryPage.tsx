import React, { useState, useEffect } from 'react';
import { X, ChevronLeft, ChevronRight } from 'lucide-react';
import { apiService } from '../../lib/api';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import type { GalleryAlbum, GalleryImage } from '../../lib/database';

type AlbumWithImages = GalleryAlbum & { gallery_images: GalleryImage[] };

export default function GalleryPage() {
  const [albums, setAlbums] = useState<AlbumWithImages[]>([]);
  const [selectedAlbum, setSelectedAlbum] = useState<AlbumWithImages | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAlbums();
  }, []);

  const fetchAlbums = async () => {
    try {
      const data = apiService.getGalleryAlbumsWithImages(true); // Only active albums
      setAlbums(data);
    } catch (error) {
      console.error('Erreur lors du chargement des albums:', error);
    } finally {
      setLoading(false);
    }
  };

  const openAlbum = (album: AlbumWithImages) => {
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
          {I see you're trying to use `apt` but it's not available in this environment. This is a WebContainer environment that doesn't have full Linux package management capabilities. Let me create a complete local deployment solution that works within the current environment constraints.

<boltArtifact id="local-deployment-setup" title="Local Deployment with SQLite Database">