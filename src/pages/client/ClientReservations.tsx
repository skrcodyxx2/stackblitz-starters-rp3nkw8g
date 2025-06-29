import React from 'react';
import { Calendar, Eye, Edit } from 'lucide-react';

export default function ClientReservations() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes Réservations</h1>
              <p className="text-gray-600">Gérez vos réservations d'événements</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <Calendar className="w-5 h-5 mr-2" />
              Mes Réservations
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Mariage</h4>
                  <p className="text-sm text-gray-600">25 Mars 2024 - 18:00</p>
                  <p className="text-sm text-gray-600">120 invités</p>
                </div>
                <div className="text-right">
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                    Confirmée
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="btn-outline flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Voir Détails
                </button>
                <button className="btn-outline flex items-center">
                  <Edit className="w-4 h-4 mr-2" />
                  Modifier
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}