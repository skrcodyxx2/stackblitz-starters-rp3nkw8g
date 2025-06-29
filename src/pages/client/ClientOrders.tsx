import React from 'react';
import { ShoppingBag, Eye, Download } from 'lucide-react';

export default function ClientOrders() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Mes Commandes</h1>
              <p className="text-gray-600">Historique de vos commandes</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
              <ShoppingBag className="w-5 h-5 mr-2" />
              Historique des Commandes
            </h3>
          </div>
          <div className="divide-y divide-gray-200">
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h4 className="text-lg font-medium text-gray-900">Commande #001</h4>
                  <p className="text-sm text-gray-600">15 Mars 2024 - 10:30</p>
                </div>
                <div className="text-right">
                  <p className="text-lg font-semibold text-gray-900">245.99$</p>
                  <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800">
                    Livrée
                  </span>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button className="btn-outline flex items-center">
                  <Eye className="w-4 h-4 mr-2" />
                  Voir Détails
                </button>
                <button className="btn-outline flex items-center">
                  <Download className="w-4 h-4 mr-2" />
                  Facture
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}