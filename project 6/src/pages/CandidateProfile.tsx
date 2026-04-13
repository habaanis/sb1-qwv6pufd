import React, { useState, useEffect } from 'react';
import { UserCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import CandidateForm from '../components/forms/CandidateForm';

export default function CandidateProfile() {
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
        let storedId = localStorage.getItem('dalil_anonymous_candidate_id');
        if (!storedId) {
          storedId = `anon_cv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
          localStorage.setItem('dalil_anonymous_candidate_id', storedId);
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

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const userId = user?.id || anonymousUserId;

  return (
    <div className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-16 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-2">
            {t.candidate?.title || 'Déposer mon CV'}
          </h1>
          <p className="text-gray-600">
            {t.candidate?.subtitle || 'Soyez visible auprès des recruteurs tunisiens'}
          </p>
        </div>

        <div className="bg-gradient-to-r from-amber-50 to-yellow-50 border-2 border-amber-200 rounded-lg p-4 mb-8">
          <div className="flex items-start gap-3">
            <span className="px-2 py-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-900 text-xs font-bold rounded-full">
              PREMIUM
            </span>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900 mb-1">
                Passez en Premium pour plus de visibilité
              </p>
              <p className="text-xs text-gray-600">
                Votre profil apparaîtra en priorité auprès des recruteurs Élite
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <CandidateForm userId={userId} />
        </div>

        <div className="mt-8 bg-gray-50 rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            {t.candidate?.help?.title || 'Conseils pour un CV efficace'}
          </h3>
          <ul className="space-y-2 text-sm text-gray-600">
            <li>• {t.candidate?.help?.tip1 || 'Renseignez toutes vos coordonnées'}</li>
            <li>• {t.candidate?.help?.tip2 || 'Listez vos compétences principales'}</li>
            <li>• {t.candidate?.help?.tip3 || 'Indiquez votre expérience professionnelle'}</li>
            <li>• {t.candidate?.help?.tip4 || 'Téléchargez votre CV au format PDF'}</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
