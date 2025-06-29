import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Star, Users, Clock, Award } from 'lucide-react';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';
import { supabase } from '../../lib/supabase';

interface CompanySettings {
  hero_title: string;
  hero_subtitle: string;
  hero_image_url: string;
  about_us: string;
}

export default function HomePage() {
  const [settings, setSettings] = useState<CompanySettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCompanySettings();
  }, []);

  const fetchCompanySettings = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('hero_title, hero_subtitle, hero_image_url, about_us')
        .single();

      if (error) throw error;
      setSettings(data);
    } catch (error) {
      console.error('Erreur lors du chargement des paramètres:', error);
    } finally {
      setLoading(false);
    }
  };

  const features = [
    {
      icon: <Star className="w-8 h-8 text-primary-600" />,
      title: 'Cuisine Authentique',
      description: 'Saveurs traditionnelles haïtiennes et caribéennes préparées avec passion et expertise.',
    },
    {
      icon: <Users className="w-8 h-8 text-primary-600" />,
      title: 'Service Personnalisé',
      description: 'Chaque événement est unique. Nous adaptons nos services à vos besoins spécifiques.',
    },
    {
      icon: <Clock className="w-8 h-8 text-primary-600" />,
      title: 'Ponctualité Garantie',
      description: 'Respect des délais et des horaires pour que votre événement se déroule parfaitement.',
    },
    {
      icon: <Award className="w-8 h-8 text-primary-600" />,
      title: 'Qualité Premium',
      description: 'Ingrédients frais et de qualité supérieure pour des plats exceptionnels.',
    },
  ];

  const testimonials = [
    {
      name: 'Marie Dubois',
      role: 'Organisatrice d\'événements',
      content: 'Dounie Cuisine a transformé notre mariage en une expérience culinaire inoubliable. La qualité et le service étaient exceptionnels.',
      rating: 5,
    },
    {
      name: 'Jean-Pierre Martin',
      role: 'Directeur d\'entreprise',
      content: 'Pour nos événements corporatifs, nous faisons toujours appel à Dounie Cuisine. Professionnalisme et saveurs au rendez-vous.',
      rating: 5,
    },
    {
      name: 'Sophie Lavoie',
      role: 'Particulier',
      content: 'Un service traiteur de qualité exceptionnelle. Les plats haïtiens étaient délicieux et authentiques.',
      rating: 5,
    },
  ];

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
      <section className="relative bg-gradient-to-r from-primary-900 via-primary-800 to-secondary-800 text-white overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-40"></div>
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${settings?.hero_image_url || 'https://images.pexels.com/photos/1640777/pexels-photo-1640777.jpeg?auto=compress&cs=tinysrgb&w=1920&h=1080&fit=crop'})`
          }}
        ></div>
        <div className="relative container-custom section-padding">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6 animate-fade-in text-white">
              {settings?.hero_title || 'Saveurs Authentiques Caribéennes'}
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-100 animate-fade-in animation-delay-200">
              {settings?.hero_subtitle || 'Service traiteur haut de gamme spécialisé dans la cuisine haïtienne et caribéenne. Nous créons des expériences culinaires mémorables pour tous vos événements.'}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 animate-fade-in animation-delay-400">
              <Link to="/menu" className="btn-primary inline-flex items-center justify-center">
                Découvrir notre Menu
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link to="/reservation" className="btn-outline bg-white bg-opacity-10 backdrop-blur-sm border-white text-white hover:bg-white hover:text-primary-900">
                Réserver un Événement
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Pourquoi Choisir Dounie Cuisine ?
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Notre engagement envers l'excellence culinaire et le service client exceptionnel 
              fait de nous le choix privilégié pour vos événements spéciaux.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div 
                key={index} 
                className="text-center p-6 rounded-xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300 animate-slide-up"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="flex justify-center mb-4">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600">
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      {settings?.about_us && (
        <section className="section-padding bg-gray-50">
          <div className="container-custom">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-4xl font-bold text-gray-900 mb-8">
                À Propos de Nous
              </h2>
              <p className="text-lg text-gray-700 leading-relaxed">
                {settings.about_us}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Services Preview */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 mb-6">
                Nos Services Complets
              </h2>
              <p className="text-lg text-gray-600 mb-8">
                Au-delà de la cuisine exceptionnelle, nous offrons une gamme complète de services 
                pour faire de votre événement un succès total.
              </p>
              
              <div className="space-y-6">
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-primary-600 font-bold">🍽️</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Service Traiteur Premium</h3>
                    <p className="text-gray-600">Cuisine haïtienne et caribéenne authentique pour tous types d'événements.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-secondary-600 font-bold">🎵</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Animation & DJ</h3>
                    <p className="text-gray-600">Ambiance musicale professionnelle adaptée à votre événement.</p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-4">
                  <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <span className="text-accent-600 font-bold">🎉</span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Organisation d'Événements</h3>
                    <p className="text-gray-600">Planification complète de vos mariages, anniversaires et événements corporatifs.</p>
                  </div>
                </div>
              </div>
              
              <Link to="/services" className="btn-primary mt-8 inline-flex items-center">
                Découvrir tous nos Services
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
            </div>
            
            <div className="relative">
              <img 
                src="https://images.pexels.com/photos/1640772/pexels-photo-1640772.jpeg?auto=compress&cs=tinysrgb&w=800&h=600&fit=crop"
                alt="Service traiteur professionnel"
                className="rounded-2xl shadow-2xl w-full h-96 object-cover"
              />
              <div className="absolute -bottom-6 -left-6 bg-white p-6 rounded-xl shadow-lg">
                <div className="flex items-center space-x-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">500+</div>
                    <div className="text-sm text-gray-600">Événements</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-secondary-600">98%</div>
                    <div className="text-sm text-gray-600">Satisfaction</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Ce que Disent nos Clients
            </h2>
            <p className="text-xl text-gray-600">
              La satisfaction de nos clients est notre plus grande récompense.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div 
                key={index} 
                className="bg-white p-8 rounded-xl hover:shadow-lg transition-shadow duration-300"
              >
                <div className="flex items-center mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 italic">
                  "{testimonial.content}"
                </p>
                <div>
                  <div className="font-semibold text-gray-900">{testimonial.name}</div>
                  <div className="text-sm text-gray-600">{testimonial.role}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary-600 to-secondary-600 text-white">
        <div className="container-custom text-center">
          <h2 className="text-4xl font-bold mb-6 text-white">
            Prêt à Créer votre Événement Mémorable ?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-100">
            Contactez-nous dès aujourd'hui pour discuter de vos besoins et recevoir un devis personnalisé.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/contact" className="btn-secondary bg-white text-primary-600 hover:bg-gray-100">
              Nous Contacter
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