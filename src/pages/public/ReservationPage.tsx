import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Calendar, Users, MapPin, Clock, ChevronRight, ChevronLeft } from 'lucide-react';
import toast from 'react-hot-toast';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

const reservationSchema = z.object({
  // Étape 1: Informations personnelles
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Adresse email invalide'),
  phone: z.string().min(10, 'Numéro de téléphone invalide'),
  
  // Étape 2: Détails de l'événement
  eventType: z.string().min(1, 'Veuillez sélectionner un type d\'événement'),
  eventDate: z.string().min(1, 'Veuillez sélectionner une date'),
  eventTime: z.string().min(1, 'Veuillez sélectionner une heure'),
  guestCount: z.number().min(1, 'Le nombre d\'invités doit être d\'au moins 1'),
  
  // Étape 3: Lieu et services
  venueAddress: z.string().min(5, 'Veuillez fournir une adresse complète'),
  services: z.array(z.string()).min(1, 'Veuillez sélectionner au moins un service'),
  
  // Étape 4: Demandes spéciales
  specialRequests: z.string().optional(),
  dietaryRestrictions: z.string().optional(),
  budget: z.string().optional(),
});

type ReservationFormData = z.infer<typeof reservationSchema>;

export default function ReservationPage() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const totalSteps = 4;

  const {
    register,
    handleSubmit,
    watch,
    trigger,
    reset,
    formState: { errors },
  } = useForm<ReservationFormData>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      services: [],
    },
  });

  const watchedServices = watch('services') || [];

  const eventTypes = [
    'Mariage',
    'Anniversaire',
    'Événement corporatif',
    'Réunion familiale',
    'Baptême/Communion',
    'Graduation',
    'Autre'
  ];

  const availableServices = [
    { id: 'catering', name: 'Service Traiteur', description: 'Cuisine haïtienne et caribéenne' },
    { id: 'dj', name: 'Animation DJ', description: 'Musique et animation' },
    { id: 'planning', name: 'Organisation d\'événement', description: 'Planification complète' },
    { id: 'decoration', name: 'Décoration', description: 'Décoration thématique' },
  ];

  const timeSlots = [
    '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', 
    '16:00', '17:00', '18:00', '19:00', '20:00', '21:00'
  ];

  const nextStep = async () => {
    const fieldsToValidate = getFieldsForStep(currentStep);
    const isValid = await trigger(fieldsToValidate);
    
    if (isValid && currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const getFieldsForStep = (step: number) => {
    switch (step) {
      case 1:
        return ['firstName', 'lastName', 'email', 'phone'] as const;
      case 2:
        return ['eventType', 'eventDate', 'eventTime', 'guestCount'] as const;
      case 3:
        return ['venueAddress', 'services'] as const;
      case 4:
        return [] as const;
      default:
        return [] as const;
    }
  };

  const onSubmit = async (data: ReservationFormData) => {
    setIsLoading(true);
    try {
      // Simuler l'envoi de la réservation
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Réservation envoyée avec succès ! Nous vous contacterons dans les 24h.');
      reset();
      setCurrentStep(1);
    } catch (error) {
      toast.error('Erreur lors de l\'envoi de la réservation. Veuillez réessayer.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleServiceChange = (serviceId: string, checked: boolean) => {
    const currentServices = watchedServices;
    if (checked) {
      return [...currentServices, serviceId];
    } else {
      return currentServices.filter(id => id !== serviceId);
    }
  };

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
        <div className="relative container-custom py-16">
          <div className="max-w-3xl">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Réservation
              <span className="block text-secondary-400">d'Événement</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200">
              Planifiez votre événement parfait en quelques étapes simples. 
              Nous nous occupons de tout pour vous.
            </p>
          </div>
        </div>
      </section>

      {/* Reservation Form */}
      <section className="section-padding bg-white">
        <div className="container-custom max-w-4xl">
          {/* Progress Bar */}
          <div className="mb-12">
            <div className="flex items-center justify-between mb-4">
              {[1, 2, 3, 4].map((step) => (
                <div
                  key={step}
                  className={`flex items-center justify-center w-10 h-10 rounded-full font-bold ${
                    step <= currentStep
                      ? 'bg-primary-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {step}
                </div>
              ))}
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / totalSteps) * 100}%` }}
              ></div>
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span>Informations</span>
              <span>Événement</span>
              <span>Services</span>
              <span>Finalisation</span>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)}>
            {/* Étape 1: Informations personnelles */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Vos Informations
                  </h2>
                  <p className="text-gray-600">
                    Commençons par vos informations de contact
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Prénom *
                    </label>
                    <input
                      {...register('firstName')}
                      type="text"
                      className="input-field"
                      placeholder="Votre prénom"
                    />
                    {errors.firstName && (
                      <p className="mt-2 text-sm text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Nom *
                    </label>
                    <input
                      {...register('lastName')}
                      type="text"
                      className="input-field"
                      placeholder="Votre nom"
                    />
                    {errors.lastName && (
                      <p className="mt-2 text-sm text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
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

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone *
                  </label>
                  <input
                    {...register('phone')}
                    type="tel"
                    className="input-field"
                    placeholder="+1 (514) 123-4567"
                  />
                  {errors.phone && (
                    <p className="mt-2 text-sm text-red-600">{errors.phone.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Étape 2: Détails de l'événement */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Détails de l'Événement
                  </h2>
                  <p className="text-gray-600">
                    Parlez-nous de votre événement
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Type d'événement *
                  </label>
                  <select {...register('eventType')} className="input-field">
                    <option value="">Sélectionnez un type</option>
                    {eventTypes.map((type) => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </select>
                  {errors.eventType && (
                    <p className="mt-2 text-sm text-red-600">{errors.eventType.message}</p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Date de l'événement *
                    </label>
                    <input
                      {...register('eventDate')}
                      type="date"
                      className="input-field"
                      min={new Date().toISOString().split('T')[0]}
                    />
                    {errors.eventDate && (
                      <p className="mt-2 text-sm text-red-600">{errors.eventDate.message}</p>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Heure *
                    </label>
                    <select {...register('eventTime')} className="input-field">
                      <option value="">Sélectionnez une heure</option>
                      {timeSlots.map((time) => (
                        <option key={time} value={time}>{time}</option>
                      ))}
                    </select>
                    {errors.eventTime && (
                      <p className="mt-2 text-sm text-red-600">{errors.eventTime.message}</p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nombre d'invités *
                  </label>
                  <input
                    {...register('guestCount', { valueAsNumber: true })}
                    type="number"
                    className="input-field"
                    placeholder="Ex: 50"
                    min="1"
                  />
                  {errors.guestCount && (
                    <p className="mt-2 text-sm text-red-600">{errors.guestCount.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Étape 3: Lieu et services */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Lieu et Services
                  </h2>
                  <p className="text-gray-600">
                    Où aura lieu votre événement et quels services souhaitez-vous ?
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Adresse du lieu *
                  </label>
                  <textarea
                    {...register('venueAddress')}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Adresse complète du lieu de l'événement"
                  />
                  {errors.venueAddress && (
                    <p className="mt-2 text-sm text-red-600">{errors.venueAddress.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-4">
                    Services souhaités *
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {availableServices.map((service) => (
                      <div
                        key={service.id}
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
                          watchedServices.includes(service.id)
                            ? 'border-primary-600 bg-primary-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <label className="flex items-start cursor-pointer">
                          <input
                            type="checkbox"
                            value={service.id}
                            {...register('services')}
                            className="mt-1 mr-3"
                          />
                          <div>
                            <h3 className="font-semibold text-gray-900">{service.name}</h3>
                            <p className="text-sm text-gray-600">{service.description}</p>
                          </div>
                        </label>
                      </div>
                    ))}
                  </div>
                  {errors.services && (
                    <p className="mt-2 text-sm text-red-600">{errors.services.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Étape 4: Demandes spéciales */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">
                    Finalisation
                  </h2>
                  <p className="text-gray-600">
                    Derniers détails pour personnaliser votre événement
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Budget approximatif
                  </label>
                  <select {...register('budget')} className="input-field">
                    <option value="">Sélectionnez une fourchette</option>
                    <option value="moins-1000">Moins de 1 000$</option>
                    <option value="1000-2500">1 000$ - 2 500$</option>
                    <option value="2500-5000">2 500$ - 5 000$</option>
                    <option value="5000-10000">5 000$ - 10 000$</option>
                    <option value="plus-10000">Plus de 10 000$</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Restrictions alimentaires
                  </label>
                  <textarea
                    {...register('dietaryRestrictions')}
                    rows={3}
                    className="input-field resize-none"
                    placeholder="Allergies, régimes spéciaux, préférences alimentaires..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Demandes spéciales
                  </label>
                  <textarea
                    {...register('specialRequests')}
                    rows={4}
                    className="input-field resize-none"
                    placeholder="Toute demande particulière, thème spécifique, arrangements spéciaux..."
                  />
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-12">
              <button
                type="button"
                onClick={prevStep}
                disabled={currentStep === 1}
                className={`flex items-center px-6 py-3 rounded-lg font-medium transition-colors duration-200 ${
                  currentStep === 1
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                <ChevronLeft className="w-5 h-5 mr-2" />
                Précédent
              </button>

              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="btn-primary flex items-center"
                >
                  Suivant
                  <ChevronRight className="w-5 h-5 ml-2" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isLoading}
                  className="btn-primary flex items-center"
                >
                  {isLoading ? (
                    <div className="loading-spinner w-5 h-5 mr-2"></div>
                  ) : (
                    <Calendar className="w-5 h-5 mr-2" />
                  )}
                  Confirmer la Réservation
                </button>
              )}
            </div>
          </form>
        </div>
      </section>

      <Footer />
    </div>
  );
}