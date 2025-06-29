import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { User, Mail, Phone, Save } from 'lucide-react';

export default function ClientProfile() {
  const { profile } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mon Profil</h1>
              <p className="text-gray-600">Gérez vos informations personnelles</p>
            </div>
            <button className="btn-primary flex items-center">
              <Save className="w-5 h-5 mr-2" />
              Sauvegarder
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
          <div className="space-y-6">
            <div className="flex items-center space-x-6">
              <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center">
                <User className="w-10 h-10 text-primary-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  {profile?.first_name} {profile?.last_name}
                </h3>
                <p className="text-gray-600">{profile?.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Prénom
                </label>
                <input
                  type="text"
                  defaultValue={profile?.first_name || ''}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom
                </label>
                <input
                  type="text"
                  defaultValue={profile?.last_name || ''}
                  className="input-field"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                defaultValue={profile?.email || ''}
                className="input-field"
                disabled
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone
              </label>
              <input
                type="tel"
                defaultValue={profile?.phone || ''}
                className="input-field"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}