import React, { useState, useEffect } from 'react';
import { Settings, Save, Globe, Mail, Phone, MapPin } from 'lucide-react';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';
import type { Database } from '../../types/database';

type CompanySettings = Database['public']['Tables']['company_settings']['Row'];

const defaultSettings: Partial<CompanySettings> = {
  name: 'Dounie Cuisine Pro',
  slogan: 'Saveurs Authentiques Caribéennes',
  description: 'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne.',
  address: 'Montréal, Québec, Canada',
  phone: '+1 (514) 123-4567',
  email: 'info@dounieculisine.ca',
  website: 'https://dounieculisine.ca',
  hero_title: 'Saveurs Authentiques Caribéennes',
  hero_subtitle: 'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne. Nous créons des expériences culinaires mémorables pour tous vos événements.',
  hero_image_url: 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop',
  tax_tps: 0.05,
  tax_tvq: 0.09975,
  business_hours: {
    monday: { open: "09:00", close: "18:00", closed: false },
    tuesday: { open: "09:00", close: "18:00", closed: false },
    wednesday: { open: "09:00", close: "18:00", closed: false },
    thursday: { open: "09:00", close: "18:00", closed: false },
    friday: { open: "09:00", close: "18:00", closed: false },
    saturday: { open: "10:00", close: "16:00", closed: false },
    sunday: { open: "10:00", close: "16:00", closed: true }
  },
  social_media: {
    facebook: "",
    instagram: "",
    twitter: "",
    linkedin: ""
  },
  privacy_policy: 'Notre politique de confidentialité sera mise à jour prochainement.',
  terms_of_service: 'Nos conditions d\'utilisation seront mises à jour prochainement.',
  about_us: 'Dounie Cuisine Pro est une entreprise familiale spécialisée dans la cuisine haïtienne et caribéenne. Nous offrons des services de traiteur haut de gamme pour tous vos événements spéciaux.'
};

export default function AdminSettings() {
  const [settings, setSettings] = useState<Partial<CompanySettings>>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeSection, setActiveSection] = useState('general');

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('*')
        .limit(1);

      if (error) {
        console.error('Erreur Supabase:', error);
        setLoading(false);
        return; // Use default settings
      }

      if (data && data.length > 0) {
        const dbSettings = data[0];
        setSettings({
          ...defaultSettings,
          ...dbSettings,
          // Ensure nested objects are properly merged
          business_hours: { ...defaultSettings.business_hours, ...dbSettings.business_hours },
          social_media: { ...defaultSettings.social_media, ...dbSettings.social_media }
        });
      }
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
      // Keep default settings on error
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const { data: existingData } = await supabase
        .from('company_settings')
        .select('id')
        .limit(1);

      if (existingData && existingData.length > 0) {
        // Update existing record
        const { error } = await supabase
          .from('company_settings')
          .update({
            ...settings,
            updated_at: new Date().toISOString()
          })
          .eq('id', existingData[0].id);

        if (error) throw error;
      } else {
        // Insert new record
        const { error } = await supabase
          .from('company_settings')
          .insert({
            ...settings,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (error) throw error;
      }

      toast.success('Paramètres sauvegardés avec succès');
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      toast.error('Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const updateSettings = (field: string, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  const updateNestedSettings = (parent: string, field: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [parent]: {
        ...prev[parent],
        [field]: value
      }
    }));
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
              <h1 className="text-2xl font-bold text-gray-900">Paramètres de l'Entreprise</h1>
              <p className="text-gray-600">Configurez les informations publiques de votre entreprise</p>
            </div>
            <button 
              onClick={handleSave}
              disabled={saving}
              className="btn-primary flex items-center"
            >
              <Save className="w-5 h-5 mr-2" />
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Sections</h3>
              <nav className="space-y-2">
                {[
                  { id: 'general', name: 'Informations Générales', icon: Settings },
                  { id: 'contact', name: 'Contact', icon: Phone },
                  { id: 'content', name: 'Contenu du Site', icon: Globe },
                  { id: 'hours', name: 'Horaires', icon: Settings },
                  { id: 'social', name: 'Réseaux Sociaux', icon: Settings },
                  { id: 'legal', name: 'Mentions Légales', icon: Settings }
                ].map((section) => {
                  const Icon = section.icon;
                  return (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={`w-full text-left px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 flex items-center ${
                        activeSection === section.id
                          ? 'text-primary-600 bg-primary-50'
                          : 'text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {section.name}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-8">
            {/* General Information */}
            {activeSection === 'general' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Settings className="w-5 h-5 mr-2" />
                  Informations Générales
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Nom de l'entreprise
                      </label>
                      <input
                        type="text"
                        value={settings.name || ''}
                        onChange={(e) => updateSettings('name', e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Slogan
                      </label>
                      <input
                        type="text"
                        value={settings.slogan || ''}
                        onChange={(e) => updateSettings('slogan', e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Description
                    </label>
                    <textarea
                      rows={4}
                      value={settings.description || ''}
                      onChange={(e) => updateSettings('description', e.target.value)}
                      className="input-field resize-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Logo URL
                      </label>
                      <input
                        type="url"
                        value={settings.logo_url || ''}
                        onChange={(e) => updateSettings('logo_url', e.target.value)}
                        className="input-field"
                        placeholder="https://example.com/logo.png"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Favicon URL
                      </label>
                      <input
                        type="url"
                        value={settings.favicon_url || ''}
                        onChange={(e) => updateSettings('favicon_url', e.target.value)}
                        className="input-field"
                        placeholder="https://example.com/favicon.ico"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Information */}
            {activeSection === 'contact' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Phone className="w-5 h-5 mr-2" />
                  Informations de Contact
                </h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Téléphone
                      </label>
                      <input
                        type="tel"
                        value={settings.phone || ''}
                        onChange={(e) => updateSettings('phone', e.target.value)}
                        className="input-field"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Email
                      </label>
                      <input
                        type="email"
                        value={settings.email || ''}
                        onChange={(e) => updateSettings('email', e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Adresse
                    </label>
                    <textarea
                      rows={3}
                      value={settings.address || ''}
                      onChange={(e) => updateSettings('address', e.target.value)}
                      className="input-field resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Site Web
                    </label>
                    <input
                      type="url"
                      value={settings.website || ''}
                      onChange={(e) => updateSettings('website', e.target.value)}
                      className="input-field"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Content Management */}
            {activeSection === 'content' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center">
                  <Globe className="w-5 h-5 mr-2" />
                  Contenu du Site
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Titre Principal (Hero)
                    </label>
                    <input
                      type="text"
                      value={settings.hero_title || ''}
                      onChange={(e) => updateSettings('hero_title', e.target.value)}
                      className="input-field"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Sous-titre (Hero)
                    </label>
                    <textarea
                      rows={3}
                      value={settings.hero_subtitle || ''}
                      onChange={(e) => updateSettings('hero_subtitle', e.target.value)}
                      className="input-field resize-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Image Hero URL
                    </label>
                    <input
                      type="url"
                      value={settings.hero_image_url || ''}
                      onChange={(e) => updateSettings('hero_image_url', e.target.value)}
                      className="input-field"
                      placeholder="https://example.com/hero-image.jpg"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      À Propos
                    </label>
                    <textarea
                      rows={6}
                      value={settings.about_us || ''}
                      onChange={(e) => updateSettings('about_us', e.target.value)}
                      className="input-field resize-none"
                      placeholder="Histoire de l'entreprise, mission, valeurs..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Business Hours */}
            {activeSection === 'hours' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Horaires d'Ouverture
                </h3>
                
                <div className="space-y-4">
                  {Object.entries(settings.business_hours || {}).map(([day, hours]: [string, any]) => (
                    <div key={day} className="flex items-center space-x-4">
                      <div className="w-24">
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {day === 'monday' ? 'Lundi' :
                           day === 'tuesday' ? 'Mardi' :
                           day === 'wednesday' ? 'Mercredi' :
                           day === 'thursday' ? 'Jeudi' :
                           day === 'friday' ? 'Vendredi' :
                           day === 'saturday' ? 'Samedi' : 'Dimanche'}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={!hours?.closed}
                          onChange={(e) => updateNestedSettings('business_hours', day, {
                            ...hours,
                            closed: !e.target.checked
                          })}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
                        />
                        <span className="text-sm text-gray-600">Ouvert</span>
                      </div>
                      {!hours?.closed && (
                        <>
                          <input
                            type="time"
                            value={hours?.open || '09:00'}
                            onChange={(e) => updateNestedSettings('business_hours', day, {
                              ...hours,
                              open: e.target.value
                            })}
                            className="input-field w-32"
                          />
                          <span className="text-gray-500">à</span>
                          <input
                            type="time"
                            value={hours?.close || '18:00'}
                            onChange={(e) => updateNestedSettings('business_hours', day, {
                              ...hours,
                              close: e.target.value
                            })}
                            className="input-field w-32"
                          />
                        </>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Social Media */}
            {activeSection === 'social' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Réseaux Sociaux
                </h3>
                
                <div className="space-y-4">
                  {[
                    { key: 'facebook', label: 'Facebook', placeholder: 'https://facebook.com/votre-page' },
                    { key: 'instagram', label: 'Instagram', placeholder: 'https://instagram.com/votre-compte' },
                    { key: 'twitter', label: 'Twitter', placeholder: 'https://twitter.com/votre-compte' },
                    { key: 'linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/company/votre-entreprise' }
                  ].map((social) => (
                    <div key={social.key}>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {social.label}
                      </label>
                      <input
                        type="url"
                        value={settings.social_media?.[social.key] || ''}
                        onChange={(e) => updateNestedSettings('social_media', social.key, e.target.value)}
                        className="input-field"
                        placeholder={social.placeholder}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Legal */}
            {activeSection === 'legal' && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-6">
                  Mentions Légales
                </h3>
                
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Politique de Confidentialité
                    </label>
                    <textarea
                      rows={8}
                      value={settings.privacy_policy || ''}
                      onChange={(e) => updateSettings('privacy_policy', e.target.value)}
                      className="input-field resize-none"
                      placeholder="Votre politique de confidentialité..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Conditions d'Utilisation
                    </label>
                    <textarea
                      rows={8}
                      value={settings.terms_of_service || ''}
                      onChange={(e) => updateSettings('terms_of_service', e.target.value)}
                      className="input-field resize-none"
                      placeholder="Vos conditions d'utilisation..."
                    />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}