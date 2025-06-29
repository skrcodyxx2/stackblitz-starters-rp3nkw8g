import React from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { Users, ShoppingBag, Calendar, DollarSign, TrendingUp, Clock } from 'lucide-react';

export default function AdminDashboard() {
  const { profile } = useAuth();

  const stats = [
    {
      title: 'Commandes du jour',
      value: '12',
      change: '+8%',
      icon: <ShoppingBag className="w-6 h-6 text-primary-600" />,
      color: 'bg-primary-50'
    },
    {
      title: 'Réservations',
      value: '5',
      change: '+15%',
      icon: <Calendar className="w-6 h-6 text-secondary-600" />,
      color: 'bg-secondary-50'
    },
    {
      title: 'Revenus du mois',
      value: '15,420$',
      change: '+12%',
      icon: <DollarSign className="w-6 h-6 text-green-600" />,
      color: 'bg-green-50'
    },
    {
      title: 'Nouveaux clients',
      value: '28',
      change: '+23%',
      icon: <Users className="w-6 h-6 text-blue-600" />,
      color: 'bg-blue-50'
    }
  ];

  const recentOrders = [
    { id: '001', client: 'Marie Dubois', amount: '245$', status: 'En préparation', time: '10:30' },
    { id: '002', client: 'Jean Martin', amount: '180$', status: 'Confirmée', time: '11:15' },
    { id: '003', client: 'Sophie Lavoie', amount: '320$', status: 'Livrée', time: '12:00' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Tableau de Bord</h1>
              <p className="text-gray-600">Bienvenue, {profile?.first_name || 'Administrateur'}</p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-gray-500">
                <Clock className="w-4 h-4 inline mr-1" />
                Dernière mise à jour: {new Date().toLocaleTimeString('fr-CA')}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => (
            <div key={index} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-sm text-green-600 flex items-center">
                    <TrendingUp className="w-4 h-4 mr-1" />
                    {stat.change}
                  </p>
                </div>
                <div className={`p-3 rounded-lg ${stat.color}`}>
                  {stat.icon}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent Orders */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Commandes Récentes</h3>
            </div>
            <div className="p-6">
              <div className="space-y-4">
                {recentOrders.map((order) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900">{order.client}</p>
                      <p className="text-sm text-gray-600">Commande #{order.id} - {order.time}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{order.amount}</p>
                      <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                        order.status === 'Livrée' ? 'bg-green-100 text-green-800' :
                        order.status === 'En préparation' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Actions Rapides</h3>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-4">
                <button className="p-4 text-left bg-primary-50 hover:bg-primary-100 rounded-lg transition-colors duration-200">
                  <ShoppingBag className="w-8 h-8 text-primary-600 mb-2" />
                  <p className="font-medium text-gray-900">Nouvelle Commande</p>
                  <p className="text-sm text-gray-600">Créer une commande</p>
                </button>
                <button className="p-4 text-left bg-secondary-50 hover:bg-secondary-100 rounded-lg transition-colors duration-200">
                  <Calendar className="w-8 h-8 text-secondary-600 mb-2" />
                  <p className="font-medium text-gray-900">Réservation</p>
                  <p className="text-sm text-gray-600">Gérer les réservations</p>
                </button>
                <button className="p-4 text-left bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors duration-200">
                  <Users className="w-8 h-8 text-blue-600 mb-2" />
                  <p className="font-medium text-gray-900">Clients</p>
                  <p className="text-sm text-gray-600">Gérer les clients</p>
                </button>
                <button className="p-4 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors duration-200">
                  <DollarSign className="w-8 h-8 text-green-600 mb-2" />
                  <p className="font-medium text-gray-900">Finances</p>
                  <p className="text-sm text-gray-600">Voir les rapports</p>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}