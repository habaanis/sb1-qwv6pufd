import { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation, Language } from '../lib/i18n';
import { getSupabaseImageUrl } from '../lib/imageUtils';

interface WelcomeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (page: 'businesses' | 'citizens' | 'jobs') => void;
}

export const WelcomeModal = ({ isOpen, onClose, onNavigate }: WelcomeModalProps) => {
  const { language, setLanguage } = useLanguage();
  const t = useTranslation(language);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleCategoryClick = (page: 'businesses' | 'citizens' | 'jobs') => {
    onNavigate(page);
    onClose();
  };

  const languages: { code: Language; flag: string }[] = [
    { code: 'fr', flag: '🇫🇷' },
    { code: 'en', flag: '🇬🇧' },
    { code: 'ar', flag: '🇹🇳' },
    { code: 'it', flag: '🇮🇹' },
    { code: 'ru', flag: '🇷🇺' },
  ];

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm"
          onClick={onClose}
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
            <svg viewBox="0 0 800 600" className="w-full h-full max-w-2xl">
              <rect x="0" y="0" width="800" height="200" fill="#E70013" />
              <rect x="0" y="200" width="800" height="200" fill="white" />
              <rect x="0" y="400" width="800" height="200" fill="#E70013" />
              <circle cx="400" cy="300" r="80" fill="white" />
              <circle cx="400" cy="300" r="60" fill="#E70013" />
              <polygon points="400,260 410,280 430,280 415,292 420,312 400,300 380,312 385,292 370,280 390,280" fill="white" />
            </svg>
          </div>

          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: 10 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative bg-white/70 backdrop-blur-xl border border-white/20 rounded-3xl shadow-[0_4px_30px_rgba(0,0,0,0.1)] p-10 max-w-md w-[90%] text-center overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div
              className="absolute inset-0 scale-125 translate-x-10 translate-y-10 bg-no-repeat bg-center opacity-100 mix-blend-soft-light pointer-events-none"
              style={{
                backgroundImage: `url(${getSupabaseImageUrl('drapeau-tunisie.jpg')})`,
                backgroundSize: 'contain'
              }}
            ></div>

            <h1 className="relative z-10 text-[24px] italic font-light text-[#3a3a3a] leading-relaxed mb-10 -mt-2" style={{ fontFamily: 'Georgia, serif' }}>
              {t.modal.welcome}{' '}
              <span className="text-[#D62828] font-normal">Dalil Tounes</span>
            </h1>

            <div className="relative z-10 flex flex-col gap-3 mb-8">
              <button
                onClick={() => handleCategoryClick('businesses')}
                className="group py-3 text-[15px] text-[#3a3a3a] font-light bg-white/50 hover:bg-[#D62828]/5 border border-white/20 rounded-2xl transition-all hover:shadow-[0_0_18px_rgba(214,40,40,0.25)] hover:-translate-y-0.5"
              >
                🏢 {t.modal.categories.businesses}
              </button>
              <button
                onClick={() => handleCategoryClick('citizens')}
                className="group py-3 text-[15px] text-[#3a3a3a] font-light bg-white/50 hover:bg-[#D62828]/5 border border-white/20 rounded-2xl transition-all hover:shadow-[0_0_18px_rgba(214,40,40,0.25)] hover:-translate-y-0.5"
              >
                👤 {t.modal.categories.citizens}
              </button>
              <button
                onClick={() => handleCategoryClick('jobs')}
                className="group py-3 text-[15px] text-[#3a3a3a] font-light bg-white/50 hover:bg-[#D62828]/5 border border-white/20 rounded-2xl transition-all hover:shadow-[0_0_18px_rgba(214,40,40,0.25)] hover:-translate-y-0.5"
              >
                💼 {t.modal.categories.jobs}
              </button>
            </div>

            <div className="relative z-10 flex justify-center gap-3 mb-6">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`w-7 h-7 rounded-full shadow-sm cursor-pointer transition-all text-lg flex items-center justify-center ${
                    language === lang.code
                      ? 'ring-2 ring-[#D62828]'
                      : 'hover:ring-2 hover:ring-[#D62828]/40'
                  }`}
                >
                  {lang.flag}
                </button>
              ))}
            </div>

            <button
              onClick={onClose}
              className="relative z-10 text-xs text-gray-500 hover:text-[#D62828] transition-all font-light"
            >
              {t.modal.close}
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
