import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Phone, Mail, Clock, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

const contactSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().optional(),
  subject: z.string().min(5, 'Le sujet doit contenir au moins 5 caractères'),
  message: z.string().min(10, 'Le message doit contenir au moins 10 caractères'),
  eventType: z.string().optional(),
  eventDate: z.string().optional(),
  guestCount: z.string().optional(),
});

type ContactFormData = z.infer<typeof contactSchema>;

export default function ContactPage() {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ContactFormData>({
    resolver: zodResolver(contactSchema),
  });

  const onSubmit = async (data: ContactFormData) => {
    setIsLoading(true);
    try {
      // Simuler l'envoi du formulaire
      await new Promise(resolve => setTimeout(resolve, 1000));
      toast.success('Message envoyé avec succès ! Nous vous répondrons dans les plus brefs délais.');
      reset();
    } catch (error) {
      toast.error('Erreur lors de l\'envoi du message. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const contactInfo = [
    {
      icon: <MapPin className="w-6 h-6 text-primary-600" />,
      title: 'Adresse',
      details: ['Montréal, Québec', 'Canada']
    },
    {
      icon: <Phone className="w-6 h-6 text-primary-600" />,
      title: 'Téléphone',
      details: ['+1 (514) 123-4567']
    },
    {
      icon: <Mail className="w-6 h-6 text-primary-600" />,
      title: 'Email',
      details: ['info@dounieculisine.ca', 'contact@dounieculisine.ca']
    },
    {
      icon: <Clock className="w-6 h-6 text-primary-600" />,
      title: 'Horaires',
      details: ['Lun-Ven: 9h00 - 18h00', 'Sam-Dim: Sur rendez-vous']
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
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Contactez
              <span className="block text-secondary-400">Nous</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Prêt à créer votre événement mémorable ? Contactez-nous pour discuter 
              de vos besoins et recevoir un devis personnalisé.
            </p>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Envoyez-nous un Message
              </h2>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Nom complet *
                    </label>
                    <input
                      {...register('name')}
                      type="text"
                      className="input-field"
                      placeholder="Votre nom"
                    />
                    {errors.name && (
                      <p className="mt-2 text-sm text-red-600">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email *
                    </label>
                    <input
                      {...register('email')}
                      type="email"
                      className="input-field"
                      placeholder="votre@email.com"
                    />
                    {errors.email && (
                      <p className="mt-2 text-sm text-red-600">{errors.email.message}</p>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                      Téléphone
                    </label>
                    <input
                      {...register('phone')}
                      type="tel"
                      className="input-field"
                      placeholder="+1 (514) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="eventType" className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'événement
                    </label>
                    <select {...register('eventType')} className="input-field">
                      <option value="">Sélectionnez un type</option>
                      <option value="mariage">Mariage</option>
                      <option value="anniversaire">Anniversaire</option>
                      <option value="corporatif">Événement corporatif</option>
                      <option value="familial">Réunion familiale</option>
                      <option value="autre">Autre</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label htmlFor="eventDate" className="block text-sm font-medium text-gray-700 mb-2">
                      Date souhaitée
                    </label>
                    <input
                      {...register('eventDate')}
                      type="date"
                      className="input-field"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="guestCount" className="block text-sm font-medium text-gray-700 mb-2">
                      Nombre d'invités
                    </label>
                    <input
                      {...register('guestCount')}
                      type="number"
                      className="input-field"
                      placeholder="Ex: 50"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                    Sujet *
                  </label>
                  <input
                    {...register('subject')}
                    type="text"
                    className="input-field"
                    placeholder="Sujet de votre message"
                  />
                  {errors.subject && (
                    <p className="mt-2 text-sm text-red-600">{errors.subject.message}</p>
                  )}
                </div>

                <div>
                  <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                    Message *
                  </label>
                  <textarea
                    {...register('message')}
                    rows={6}
                    className="input-field resize-none"
                    placeholder="Décrivez votre projet, vos besoins spécifiques, vos préférences culinaires..."
                  />
                  {errors.message && (
                    <p className="mt-2 text-sm text-red-600">{errors.message.message}</p>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full btn-primary flex items-center justify-center"
                >
                  {isLoading ? (
                    <div className="loading-spinner w-5 h-5"></div>
                  ) : (
                    <>
                      <Send className="w-5 h-5 mr-2" />
                      Envoyer le Message
                    </>
                  )}
                </button>
              </form>
            </div>

            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-6">
                Informations de Contact
              </h2>
              
              <div className="space-y-8 mb-8">
                {contactInfo.map((info, index) => (
                  <div key={index} className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      {info.icon}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">
                        {info.title}
                      </h3>
                      {info.details.map((detail, detailIndex) => (
                        <p key={detailIndex} className="text-gray-600">
                          {detail}
                        </p>
                      ))}
                    </div>
                  </div>
                ))}
              </div>

              {/* Map Placeholder */}
              <div className="bg-gray-200 rounded-xl h-64 flex items-center justify-center">
                <div className="text-center">
                  <MapPin className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600">Carte interactive</p>
                  <p className="text-sm text-gray-500">Montréal, Québec</p>
                </div>
              </div>

              {/* Quick Contact */}
              <div className="mt-8 p-6 bg-gradient-to-r from-primary-50 to-secondary-50 rounded-xl">
                <h3 className="text-xl font-bold text-gray-900 mb-4">
                  Besoin d'une Réponse Rapide ?
                </h3>
                <p className="text-gray-600 mb-4">
                  Pour les demandes urgentes ou les questions immédiates, 
                  n'hésitez pas à nous appeler directement.
                </p>
                <a 
                  href="tel:+15141234567" 
                  className="btn-primary inline-flex items-center"
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Appeler Maintenant
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}