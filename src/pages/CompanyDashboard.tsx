import React, { useState, useEffect } from 'react';
import { Briefcase, Users, Building2, Settings, LogOut, Crown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import JobPostForm from '../components/forms/JobPostForm';

interface CompanyDashboardProps {
  onNavigate: (page: any) => void;
}

export default function CompanyDashboard({ onNavigate }: CompanyDashboardProps) {
  const { user, signOut } = useAuth();
  const [activeTab, setActiveTab] = useState<'jobs' | 'candidates' | 'settings'>('jobs');
  const [showWelcome, setShowWelcome] = useState(false);

  useEffect(() => {
    const isNewUser = localStorage.getItem(`newUser_${user?.id}`);
    if (isNewUser) {
      setShowWelcome(true);
      localStorage.removeItem(`newUser_${user?.id}`);
      setTimeout(() => setShowWelcome(false), 5000);
    }
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    onNavigate('home');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {showWelcome && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-orange-500 to-orange-600 text-white px-6 py-4 rounded-lg shadow-2xl animate-slide-in-right">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center">
              <span className="text-2xl">🎉</span>
            </div>
            <div>
              <div className="font-bold text-lg">Bienvenue sur Dalil Tounes !</div>
              <div className="text-sm text-orange-100">Votre compte entreprise a été créé avec succès</div>
            </div>
          </div>
        </div>
      )}

      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
                <Building2 className="w-6 h-6 text-orange-600" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">
                  Tableau de bord Entreprise
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
                onClick={() => setActiveTab('jobs')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'jobs'
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Briefcase className="w-5 h-5" />
                <span className="font-medium">Mes offres</span>
              </button>
              <button
                onClick={() => setActiveTab('candidates')}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  activeTab === 'candidates'
                    ? 'bg-orange-50 text-orange-700'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Users className="w-5 h-5" />
                <span className="font-medium">Candidats</span>
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
          </div>

          <div className="flex-1">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {activeTab === 'jobs' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Publier une offre d'emploi</h2>
                  {user && <JobPostForm userId={user.id} />}
                </div>
              )}

              {activeTab === 'candidates' && (
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Candidats disponibles</h2>
                  <div className="text-center py-12 text-gray-500">
                    <Users className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                    <p>Aucun candidat pour le moment</p>
                    <button
                      onClick={() => onNavigate('candidateList')}
                      className="mt-4 px-6 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Voir les candidats
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
                      <p className="text-gray-600">Entreprise</p>
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
