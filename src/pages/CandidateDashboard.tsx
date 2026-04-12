import React, { useState, useEffect } from 'react';
import { User, FileText, Briefcase, Settings, LogOut, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import CandidateForm from '../components/forms/CandidateForm';
import { supabase } from '../lib/supabaseClient';

interface CandidateDashboardProps {
  onNavigate: (page: any) => void;
}

export default function CandidateDashboard({ onNavigate }: CandidateDashboardProps) {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'jobs' | 'settings'>('profile');
  const [showWelcome, setShowWelcome] = useState(false);
  const [candidateData, setCandidateData] = useState<any>(null);

  useEffect(() => {
    const isNewUser = localStorage.getItem(`newUser_${user?.id}`);
    if (isNewUser) {
      setShowWelcome(true);
      localStorage.removeItem(`newUser_${user?.id}`);
      setTimeout(() => setShowWelcome(false), 5000);
    }

    loadCandidateData();
  }, [user]);

  const loadCandidateData = async () => {
    if (!user) return;

    const { data } = await supabase
      .from('candidates')
      .select('*')
      .eq('created_by', user.id)
      .maybeSingle();

    setCandidateData(data);
  };

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-[#4A1D43]">
      {showWelcome && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-lg shadow-2xl animate-slide-in-right">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">🎉</span>
            </div>
            <div>
              <div className="font-bold text-lg">Bienvenue sur Dalil Tounes !</div>
              <div className="text-sm text-orange-100">Votre compte candidat a été créé avec succès</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <User className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Tableau de bord Candidat
                </h1>
                <p className="text-sm text-gray-500">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5" />
              <span>Déconnexion</span>
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex gap-6">
          <div className="w-64 flex-shrink-0">
            <nav className="bg-white rounded-lg shadow-sm p-4 space-y-2">
              <button
                onClick={() => setActiveTab('profile')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'profile'
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <FileText className="w-5 h-5" />
                <span className="font-medium">Mon profil</span>
              </button>
              <button
                onClick={() => setActiveTab('jobs')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'jobs'
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                <span className="font-medium">Mes candidatures</span>
              </button>
              <button
                onClick={() => setActiveTab('settings')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'settings'
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Settings className="w-5 h-5" />
                <span className="font-medium">Paramètres</span>
              </button>
            </nav>

            {candidateData?.is_premium && (
              <div className="mt-4 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-lg p-4 text-center">
                <Crown className="w-8 h-8 text-slate-900 mx-auto mb-2" />
                <div className="text-sm font-bold text-slate-900">Compte Premium</div>
                <div className="text-xs text-slate-800">Profil mis en avant</div>
              </div>
            )}
          </div>

          <div className="flex-1">
            <div className="bg-[#1A1A1A] border border-[#D4AF37] rounded-lg shadow-2xl p-6">
              {activeTab === 'profile' && (
                <div>
                  <h2 className="text-2xl font-bold text-[#F5F5DC] mb-6">Mon Profil</h2>
                  {user && <CandidateForm userId={user.id} onSuccess={loadCandidateData} />}
                </div>
              )}

              {activeTab === 'jobs' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Mes Candidatures</h2>
                  <div className="text-center py-12 text-gray-500">
                    <Briefcase className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Aucune candidature pour le moment</p>
                    <button
                      onClick={() => onNavigate('jobs')}
                      className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Voir les offres
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Paramètres</h2>
                  <div className="space-y-4">
                    <div className="border-b pb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Email</h3>
                      <p className="text-gray-600">{user?.email}</p>
                    </div>
                    <div className="border-b pb-4">
                      <h3 className="font-semibold text-gray-900 mb-2">Type de compte</h3>
                      <p className="text-gray-600">Candidat</p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
