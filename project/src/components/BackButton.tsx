import { ArrowLeft, Home } from 'lucide-react';

interface BackButtonProps {
  onNavigate?: (page: string) => void;
  onNavigateBack?: () => void;
  label?: string;
  showHomeButton?: boolean;
}

export default function BackButton({ onNavigate, onNavigateBack, label, showHomeButton = true }: BackButtonProps) {
  const handleBackClick = () => {
    if (onNavigate) {
      onNavigate('citizens');
    } else if (onNavigateBack) {
      onNavigateBack();
    } else {
      window.location.hash = '#/citizens';
    }
  };

  const handleHomeClick = () => {
    if (onNavigate) {
      onNavigate('home');
    } else {
      window.location.hash = '#/';
    }
  };

  return (
    <div className="flex items-center gap-3 mb-6 flex-wrap">
      <button
        onClick={handleBackClick}
        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-[#4A1D43] hover:text-[#6B2A5E] transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span>{label || 'Retour aux services'}</span>
      </button>

      {showHomeButton && (
        <>
          <span className="text-gray-300">|</span>
          <button
            onClick={handleHomeClick}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 hover:text-[#4A1D43] transition-colors group"
          >
            <Home className="w-4 h-4 group-hover:scale-110 transition-transform" />
            <span>Accueil</span>
          </button>
        </>
      )}
    </div>
  );
}
