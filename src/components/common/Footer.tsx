import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Phone, Mail, MapPin, Facebook, Instagram, Twitter } from 'lucide-react';
import { supabase } from '../../lib/supabase';

interface CompanySettings {
  name: string;
  slogan: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  social_media: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    linkedin?: string;
  };
}

const defaultSettings: CompanySettings = {
  name: 'Dounie Cuisine Pro',
  slogan: 'Service Traiteur Premium',
  description: 'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne. Nous créons des expériences culinaires mémorables pour tous vos événements.',
  address: 'Montréal, Québec, Canada',
  phone: '+1 (514) 123-4567',
  email: 'info@dounieculisine.ca',
  social_media: {
    facebook: 'https://facebook.com/dounieculisine',
    instagram: 'https://instagram.com/dounieculisine',
    twitter: 'https://twitter.com/dounieculisine'
  }
};

export default function Footer() {
  const [settings, setSettings] = useState<CompanySettings>(defaultSettings);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    try {
      setIsLoading(true);
      
      // Add timeout to prevent hanging requests
      const timeoutPromise = new Promise<{data: null, error: Error}>((_, reject) =>
        setTimeout(() => reject(new Error('Request timeout')), 10000)
      );

      const fetchPromise = supabase
        .from('company_settings')
        .select('name, slogan, description, address, phone, email, social_media')
        .limit(1);
      
      const { data, error } = await Promise.race([fetchPromise, timeoutPromise]) as any;

      if (error) {
        console.warn('Unable to fetch company settings from database, using defaults:', error.message);
        return; // Use default settings
      }

      if (data && data.length > 0) {
        const dbSettings = data[0];
        setSettings({
          name: dbSettings.name || defaultSettings.name,
          slogan: dbSettings.slogan || defaultSettings.slogan,
          description: dbSettings.description || defaultSettings.description,
          address: dbSettings.address || defaultSettings.address,
          phone: dbSettings.phone || defaultSettings.phone,
          email: dbSettings.email || defaultSettings.email,
          social_media: dbSettings.social_media || defaultSettings.social_media
        });
      }
    } catch (error) {
      // Handle network errors gracefully
      if (error instanceof TypeError && error.message.includes('fetch')) {
        console.warn('Network error: Unable to connect to database. Using default company settings.');
      } else if (error instanceof Error && error.message === 'Request timeout') {
        console.warn('Database request timed out. Using default company settings.');
      } else {
        console.warn('Error loading company settings:', error);
      }
      // Keep default settings on any error
    } finally {
      setIsLoading(false);
    }
  };

  // Don't render until we've attempted to load settings
  if (isLoading) {
    return (
      <footer className="bg-gray-900 text-white">
        <div className="container-custom section-padding">
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-400"></div>
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="container-custom section-padding">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Company Info */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">DC</span>
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">
                  {settings.name}
                </h3>
                <p className="text-sm text-gray-400">
                  {settings.slogan}
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {settings.description}
            </p>
            <div className="flex space-x-4">
              {settings.social_media?.facebook && (
                <a 
                  href={settings.social_media.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings.social_media?.instagram && (
                <a 
                  href={settings.social_media.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings.social_media?.twitter && (
                <a 
                  href={settings.social_media.twitter} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
                >
                  <Twitter className="w-5 h-5" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Liens Rapides</h4>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Accueil
                </Link>
              </li>
              <li>
                <Link to="/menu" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Menu
                </Link>
              </li>
              <li>
                <Link to="/services" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Services
                </Link>
              </li>
              <li>
                <Link to="/galerie" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Galerie
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-white transition-colors duration-200">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Services */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Nos Services</h4>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-400">Service Traiteur</span>
              </li>
              <li>
                <span className="text-gray-400">Animation DJ</span>
              </li>
              <li>
                <span className="text-gray-400">Organisation d'Événements</span>
              </li>
              <li>
                <span className="text-gray-400">Livraison à Domicile</span>
              </li>
              <li>
                <span className="text-gray-400">Consultation Culinaire</span>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-lg font-semibold mb-4 text-white">Contact</h4>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <MapPin className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  {settings.address}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  {settings.phone}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  {settings.email}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              © 2024 Dounie Cuisine Pro. Tous droits réservés.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link to="/legal/politique-confidentialite" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Politique de Confidentialité
              </Link>
              <Link to="/legal/conditions-utilisation" className="text-gray-400 hover:text-white text-sm transition-colors duration-200">
                Conditions d'Utilisation
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}