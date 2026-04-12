import { MessageCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface WhatsAppSupportProps {
  phoneNumber?: string;
  messengerPageId?: string;
}

export const WhatsAppSupport = ({
  phoneNumber = '21627642252',
  messengerPageId = 'daliltounes'
}: WhatsAppSupportProps) => {
  const { language } = useLanguage();

  const translations = {
    fr: {
      whatsapp: 'Contactez-nous sur WhatsApp',
      messenger: 'Contactez-nous sur Messenger'
    },
    en: {
      whatsapp: 'Contact us on WhatsApp',
      messenger: 'Contact us on Messenger'
    },
    ar: {
      whatsapp: 'اتصل بنا عبر واتساب',
      messenger: 'اتصل بنا عبر ماسنجر'
    },
    it: {
      whatsapp: 'Contattaci su WhatsApp',
      messenger: 'Contattaci su Messenger'
    },
    ru: {
      whatsapp: 'Свяжитесь с нами в WhatsApp',
      messenger: 'Свяжитесь с нами в Messenger'
    }
  };

  const text = translations[language as keyof typeof translations] || translations.fr;

  const handleWhatsAppClick = () => {
    const message = encodeURIComponent('Bonjour, j\'ai besoin d\'aide sur Dalil Tounes');
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleMessengerClick = () => {
    window.open(`https://m.me/${messengerPageId}`, '_blank');
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-3">
      {/* Bouton Messenger */}
      <button
        onClick={handleMessengerClick}
        className="flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all hover:scale-110 hover:shadow-3xl group"
        style={{
          backgroundColor: '#0084FF',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}
        title={text.messenger}
        aria-label={text.messenger}
      >
        <MessageCircle className="w-7 h-7 text-white" strokeWidth={2.5} fill="white" />

        {/* Indicateur de disponibilité */}
        <span
          className="absolute top-0 right-0 w-3.5 h-3.5 bg-blue-300 rounded-full border-2 border-white"
          style={{
            animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
          }}
        />

        {/* Tooltip au survol */}
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {text.messenger}
          <span className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900" />
        </span>
      </button>

      {/* Bouton WhatsApp */}
      <button
        onClick={handleWhatsAppClick}
        className="flex items-center justify-center w-14 h-14 rounded-full shadow-2xl transition-all hover:scale-110 hover:shadow-3xl group"
        style={{
          backgroundColor: '#25D366',
          animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
        }}
        title={text.whatsapp}
        aria-label={text.whatsapp}
      >
        <MessageCircle className="w-7 h-7 text-white" strokeWidth={2.5} />

        {/* Indicateur de disponibilité */}
        <span
          className="absolute top-0 right-0 w-3.5 h-3.5 bg-green-400 rounded-full border-2 border-white"
          style={{
            animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite'
          }}
        />

        {/* Tooltip au survol */}
        <span className="absolute bottom-full right-0 mb-2 px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
          {text.whatsapp}
          <span className="absolute top-full right-4 -mt-1 border-4 border-transparent border-t-gray-900" />
        </span>
      </button>

      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.85;
          }
        }

        @keyframes ping {
          75%, 100% {
            transform: scale(2);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};
