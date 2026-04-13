import React, { useState, useEffect } from 'react';
import { Briefcase } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import JobPostForm from '../components/forms/JobPostForm';

export default function PublishJob() {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [anonymousUserId, setAnonymousUserId] = useState<string>('');

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);

      if (!user) {
        let storedId = localStorage.getItem('dalil_anonymous_job_id');
        if (!storedId) {
          storedId = `anon_job_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('dalil_anonymous_job_id', storedId);
        }
        setAnonymousUserId(storedId);
      }

      setLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSuccess = () => {
    setTimeout(() => {
      window.location.hash = '#/jobs';
    }, 2000);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const userId = user?.id || anonymousUserId;

  return (
    <div className="min-h-screen bg-[#4A1D43] py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-light text-[#F5F5DC] mb-2">
            {t.jobPost?.title || 'Publier une offre d\'emploi'}
          </h1>
          <p className="text-[#E8D5C4]">
            {t.jobPost?.subtitle || 'Trouvez les meilleurs talents en Tunisie'}
          </p>
        </div>

        <div className="bg-[#2A1525] border border-[#D4AF37] rounded-lg p-4 mb-8">
          <p className="text-sm text-[#F5F5DC]">
            {t.jobPost?.infoBanner || 'Votre offre sera visible par des milliers de candidats qualifiés'}
          </p>
        </div>

        <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl p-6 md:p-8 border border-[#D4AF37]">
          <JobPostForm userId={userId} onSuccess={handleSuccess} />
        </div>

        <div className="mt-8 bg-[#2A1525] border border-[#D4AF37] rounded-lg p-6">
          <h3 className="text-lg font-medium text-[#F5F5DC] mb-3">
            {t.jobPost?.help?.title || 'Conseils pour une offre efficace'}
          </h3>
          <ul className="space-y-2 text-sm text-[#E8D5C4]">
            <li>• {t.jobPost?.help?.tip1 || 'Rédigez un titre clair et précis'}</li>
            <li>• {t.jobPost?.help?.tip2 || 'Détaillez les missions et responsabilités'}</li>
            <li>• {t.jobPost?.help?.tip3 || 'Précisez les compétences requises'}</li>
            <li>• {t.jobPost?.help?.tip4 || 'Indiquez la fourchette de salaire si possible'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
