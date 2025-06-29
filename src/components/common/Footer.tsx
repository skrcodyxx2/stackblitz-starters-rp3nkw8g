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

export default function Footer() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('name, slogan, description, address, phone, email, social_media')
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    }
  };

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
                  {settings?.name || 'Dounie Cuisine'}
                </h3>
                <p className="text-sm text-gray-400">
                  {settings?.slogan || 'Service Traiteur Premium'}
                </p>
              </div>
            </div>
            <p className="text-gray-400 text-sm mb-4">
              {settings?.description || 'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne. Nous créons des expériences culinaires mémorables pour tous vos événements.'}
            </p>
            <div className="flex space-x-4">
              {settings?.social_media?.facebook && (
                <a 
                  href={settings.social_media.facebook} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
                >
                  <Facebook className="w-5 h-5" />
                </a>
              )}
              {settings?.social_media?.instagram && (
                <a 
                  href={settings.social_media.instagram} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-400 hover:text-primary-400 transition-colors duration-200"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              )}
              {settings?.social_media?.twitter && (
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
                  {settings?.address || 'Montréal, Québec, Canada'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  {settings?.phone || '+1 (514) 123-4567'}
                </span>
              </div>
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-primary-400 flex-shrink-0" />
                <span className="text-gray-400 text-sm">
                  {settings?.email || 'info@dounieculisine.ca'}
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