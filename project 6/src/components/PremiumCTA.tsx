import { Sparkles, ArrowRight } from 'lucide-react';

interface PremiumCTAProps {
  title: string;
  buttonText: string;
  subtitle?: string;
  onClick?: () => void;
}

export const PremiumCTA = ({ title, buttonText, subtitle, onClick }: PremiumCTAProps) => {
  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-gray-800 to-black rounded-3xl p-12 overflow-hidden shadow-2xl">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37] animate-pulse"></div>
      </div>

      <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]"></div>
      <div className="absolute bottom-0 left-0 right-0 h-2 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]"></div>

      <div className="relative z-10 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] w-16 h-16 rounded-full flex items-center justify-center shadow-xl animate-bounce">
            <Sparkles className="w-8 h-8 text-white" />
          </div>
        </div>

        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]">
            {title}
          </span>
        </h2>

        {subtitle && (
          <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
            {subtitle}
          </p>
        )}

        <button
          onClick={onClick}
          className="group relative inline-flex items-center gap-3 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] px-10 py-5 rounded-xl font-bold text-xl text-white shadow-xl hover:shadow-2xl transition-all duration-300 hover:scale-105 overflow-hidden"
        >
          <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity duration-300"></span>
          <span className="relative flex items-center gap-3">
            {buttonText}
            <ArrowRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
          </span>
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-[#FFD700] to-[#D4AF37] blur-lg opacity-50 group-hover:opacity-75 transition-opacity"></div>
        </button>

        <p className="text-gray-500 text-sm mt-6 italic">
          Offre exclusive - Places limitées
        </p>
      </div>

      <div className="absolute -top-24 -right-24 w-48 h-48 bg-[#D4AF37] rounded-full blur-3xl opacity-20"></div>
      <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-[#FFD700] rounded-full blur-3xl opacity-20"></div>
    </div>
  );
};
