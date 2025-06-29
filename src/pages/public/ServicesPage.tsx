import React from 'react';
import { Link } from 'react-router-dom';
import { Music, Users, Calendar, Utensils, Star, ArrowRight } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

export default function ServicesPage() {
  const services = [
    {
      icon: <Utensils className="w-12 h-12 text-primary-600" />,
      title: 'Service Traiteur Premium',
      description: 'Cuisine haïtienne et caribéenne authentique préparée avec passion pour tous vos événements.',
      features: [
        'Menu personnalisé selon vos goûts',
        'Ingrédients frais et de qualité',
        'Service professionnel',
        'Présentation soignée'
      ],
      price: 'À partir de 25$/personne'
    },
    {
      icon: <Music className="w-12 h-12 text-secondary-600" />,
      title: 'Animation & DJ',
      description: 'Ambiance musicale professionnelle adaptée à votre événement et à vos invités.',
      features: [
        'DJ professionnel expérimenté',
        'Matériel audio haute qualité',
        'Playlist personnalisée',
        'Animation interactive'
      ],
      price: 'À partir de 300$/événement'
    },
    {
      icon: <Calendar className="w-12 h-12 text-accent-600" />,
      title: 'Organisation d\'Événements',
      description: 'Planification complète de vos mariages, anniversaires et événements corporatifs.',
      features: [
        'Coordination complète',
        'Gestion des fournisseurs',
        'Timeline détaillée',
        'Support le jour J'
      ],
      price: 'Devis personnalisé'
    },
    {
      icon: <Users className="w-12 h-12 text-primary-600" />,
      title: 'Consultation Culinaire',
      description: 'Conseils personnalisés pour créer le menu parfait pour votre événement.',
      features: [
        'Analyse de vos besoins',
        'Recommandations expertes',
        'Adaptation aux régimes spéciaux',
        'Calcul des portions'
      ],
      price: 'Consultation gratuite'
    }
  ];

  const eventTypes = [
    {
      title: 'Mariages',
      description: 'Célébrez votre union avec des saveurs authentiques',
      image: 'https://images.pexels.com/photos/1024993/pexels-photo-1024993.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
    },
    {
      title: 'Anniversaires',
      description: 'Fêtes d\'anniversaire mémorables pour tous les âges',
      image: 'https://images.pexels.com/photos/1729797/pexels-photo-1729797.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
    },
    {
      title: 'Événements Corporatifs',
      description: 'Impressionnez vos clients et collaborateurs',
      image: 'https://images.pexels.com/photos/1181396/pexels-photo-1181396.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
    },
    {
      title: 'Célébrations Familiales',
      description: 'Rassemblements familiaux chaleureux et authentiques',
      image: 'https://images.pexels.com/photos/3184183/pexels-photo-3184183.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop'
    }
  ];

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
              Nos Services
              <span className="block text-secondary-400">Complets</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100">
              Au-delà de la cuisine exceptionnelle, nous offrons une gamme complète de services 
              pour faire de votre événement un succès total.
            </p>
            <Link to="/contact" className="btn-primary inline-flex items-center">
              Demander un Devis
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Nos Services Premium
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Une expertise complète pour créer des expériences culinaires et événementielles 
              exceptionnelles qui marquent les esprits.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service, index) => (
              <div 
                key={index} 
                className="card p-8 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2"
              >
                <div className="flex items-center mb-6">
                  {service.icon}
                  <div className="ml-4">
                    <h3 className="text-2xl font-bold text-gray-900">{service.title}</h3>
                    <p className="text-primary-600 font-semibold">{service.price}</p>
                  </div>
                </div>
                
                <p className="text-gray-600 mb-6">{service.description}</p>
                
                <ul className="space-y-3 mb-6">
                  {service.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center">
                      <Star className="w-5 h-5 text-yellow-400 mr-3 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                <Link 
                  to="/contact" 
                  className="btn-outline w-full text-center inline-block"
                >
                  En Savoir Plus
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Event Types Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Types d'Événements
            </h2>
            <p className="text-xl text-gray-600">
              Nous nous adaptons à tous vos événements spéciaux
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {eventTypes.map((event, index) => (
              <div 
                key={index} 
                className="group relative overflow-hidden rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <div className="aspect-w-4 aspect-h-3">
                  <img 
                    src={event.image}
                    alt={event.title}
                    className="w-full h-64 object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent"></div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <h3 className="text-xl font-bold mb-2">{event.title}</h3>
                  <p className="text-sm text-gray-200">{event.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Notre Processus
            </h2>
            <p className="text-xl text-gray-600">
              Une approche méthodique pour garantir le succès de votre événement
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Consultation',
                description: 'Nous discutons de vos besoins, préférences et budget pour comprendre votre vision.'
              },
              {
                step: '02',
                title: 'Planification',
                description: 'Création d\'un plan détaillé incluant menu, timeline et coordination des services.'
              },
              {
                step: '03',
                title: 'Préparation',
                description: 'Préparation méticuleuse de tous les éléments avec des ingrédients de qualité premium.'
              },
              {
                step: '04',
                title: 'Exécution',
                description: 'Service professionnel le jour J avec attention aux détails et satisfaction garantie.'
              }
            ].map((process, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-full flex items-center justify-center text-white font-bold text-xl mx-auto mb-4">
                  {process.step}
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{process.title}</h3>
                <p className="text-gray-600">{process.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Prêt à Planifier votre Événement ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-100">
            Contactez-nous dès aujourd'hui pour une consultation gratuite et découvrez comment 
            nous pouvons transformer votre vision en réalité.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-secondary bg-white text-primary-600 hover:bg-gray-100">
              Consultation Gratuite
            </Link>
            <Link to="/reservation" className="btn-outline border-white text-white hover:bg-white hover:text-primary-600">
              Faire une Réservation
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}