import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

export default function LegalPage() {
  const { type } = useParams<{ type: string }>();
  const [content, setContent] = useState<string>('');
  const [title, setTitle] = useState<string>('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLegalContent();
  }, [type]);

  const fetchLegalContent = async () => {
    try {
      const { data, error } = await supabase
        .from('company_settings')
        .select('privacy_policy, terms_of_service')
        .single();

      if (error) throw error;

      if (type === 'politique-confidentialite') {
        setTitle('Politique de Confidentialité');
        setContent(data.privacy_policy || 'Cette page sera mise à jour prochainement.');
      } else if (type === 'conditions-utilisation') {
        setTitle('Conditions d\'Utilisation');
        setContent(data.terms_of_service || 'Cette page sera mise à jour prochainement.');
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      setContent('Erreur lors du chargement du contenu.');
    } finally {
      setLoading(false);
    }
  };

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
      
      <section className="section-padding bg-white">
        <div className="container-custom max-w-4xl">
          <h1 className="text-4xl font-bold text-gray-900 mb-8">{title}</h1>
          <div className="prose prose-lg max-w-none">
            <div className="text-gray-700 leading-relaxed whitespace-pre-wrap">
              {content}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}