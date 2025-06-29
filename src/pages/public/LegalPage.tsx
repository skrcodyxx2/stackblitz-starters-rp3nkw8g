import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import Header from '../../components/common/Header';
import Footer from '../../components/common/Footer';

const defaultContent = {
  'politique-confidentialite': {
    title: 'Politique de Confidentialité',
    content: 'Notre politique de confidentialité sera mise à jour prochainement.'
  },
  'conditions-utilisation': {
    title: 'Conditions d\'Utilisation',
    content: 'Nos conditions d\'utilisation seront mises à jour prochainement.'
  }
};

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
        .limit(1);

      if (error) {
        console.error('Erreur Supabase:', error);
        useDefaultContent();
        return;
      }

      if (data && data.length > 0) {
        const settings = data[0];
        if (type === 'politique-confidentialite') {
          setTitle('Politique de Confidentialité');
          setContent(settings.privacy_policy || defaultContent['politique-confidentialite'].content);
        } else if (type === 'conditions-utilisation') {
          setTitle('Conditions d\'Utilisation');
          setContent(settings.terms_of_service || defaultContent['conditions-utilisation'].content);
        }
      } else {
        useDefaultContent();
      }
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
      useDefaultContent();
    } finally {
      setLoading(false);
    }
  };

  const useDefaultContent = () => {
    if (type && defaultContent[type as keyof typeof defaultContent]) {
      const defaultData = defaultContent[type as keyof typeof defaultContent];
      setTitle(defaultData.title);
      setContent(defaultData.content);
    } else {
      setTitle('Page non trouvée');
      setContent('Le contenu demandé n\'a pas été trouvé.');
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