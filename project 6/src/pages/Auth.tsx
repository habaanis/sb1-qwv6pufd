import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import SignupForm from '../components/auth/SignupForm';
import LoginForm from '../components/auth/LoginForm';

interface AuthProps {
  onNavigate: (page: 'candidateDashboard' | 'companyDashboard') => void;
}

export default function Auth({ onNavigate }: AuthProps) {
  const { user, userType, loading } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>('signup');

  useEffect(() => {
    if (!loading && user && userType) {
      if (userType === 'candidate') {
        onNavigate('candidateDashboard');
      } else {
        onNavigate('companyDashboard');
      }
    }
  }, [user, userType, loading, onNavigate]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-orange-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const handleSignupSuccess = (userType: 'candidate' | 'company') => {
    if (userType === 'candidate') {
      onNavigate('candidateDashboard');
    } else {
      onNavigate('companyDashboard');
    }
  };

  const handleLoginSuccess = () => {
    if (userType === 'candidate') {
      onNavigate('candidateDashboard');
    } else {
      onNavigate('companyDashboard');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            Dalil Tounes
          </h1>
          <p className="text-xl text-gray-600">
            Votre guide professionnel en Tunisie
          </p>
        </div>

        {mode === 'signup' ? (
          <SignupForm
            onSuccess={handleSignupSuccess}
            onSwitchToLogin={() => setMode('login')}
          />
        ) : (
          <LoginForm
            onSuccess={handleLoginSuccess}
            onSwitchToSignup={() => setMode('signup')}
          />
        )}
      </div>
    </div>
  );
}
