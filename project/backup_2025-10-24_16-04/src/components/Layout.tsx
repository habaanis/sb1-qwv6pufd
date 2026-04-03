import { ReactNode } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation, Language } from '../lib/i18n';
import { Globe, Menu, X, ChevronDown, Phone, Mail, MapPin } from 'lucide-react';
import { useState } from 'react';

interface LayoutProps {
  children: ReactNode;
  currentPage: 'home' | 'businesses' | 'citizens' | 'jobs' | 'subscription';
  onNavigate: (page: 'home' | 'businesses' | 'citizens' | 'jobs' | 'subscription') => void;
}

export const Layout = ({ children, currentPage, onNavigate }: LayoutProps) => {
  const { language, setLanguage } = useLanguage();
  const t = useTranslation(language);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const isRTL = language === 'ar';

  const scrollToOffer = () => {
    const offerSection = document.getElementById('offer-section');
    if (offerSection) {
      offerSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const languages: { code: Language; name: string; flag: string }[] = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇹🇳' },
    { code: 'it', name: 'Italiano', flag: '🇮🇹' },
    { code: 'ru', name: 'Русский', flag: '🇷🇺' },
  ];

  return (
    <div className={`min-h-screen bg-white ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => onNavigate('home')}>
              <div className="w-8 h-8 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-sm font-bold">D</span>
              </div>
              <h1 className="text-lg font-semibold text-gray-900">
                Dalil Tounes
              </h1>
            </div>

            <div className="hidden md:flex items-center gap-6">
              <button
                onClick={() => onNavigate('home')}
                className={`text-sm transition-all ${
                  currentPage === 'home'
                    ? 'text-orange-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.nav.home}
              </button>
              <button
                onClick={() => onNavigate('businesses')}
                className={`text-sm transition-all ${
                  currentPage === 'businesses'
                    ? 'text-orange-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.nav.businesses}
              </button>
              <button
                onClick={() => onNavigate('citizens')}
                className={`text-sm transition-all ${
                  currentPage === 'citizens'
                    ? 'text-orange-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.nav.citizens}
              </button>
              <button
                onClick={() => onNavigate('jobs')}
                className={`text-sm transition-all ${
                  currentPage === 'jobs'
                    ? 'text-orange-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.nav.jobs}
              </button>
              <button
                onClick={() => onNavigate('subscription')}
                className={`text-sm transition-all ${
                  currentPage === 'subscription'
                    ? 'text-orange-600 font-medium'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {t.nav.subscription}
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowLangMenu(!showLangMenu)}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-all"
                >
                  <span className="text-lg">{languages.find((l) => l.code === language)?.flag}</span>
                  <span>{languages.find((l) => l.code === language)?.name}</span>
                </button>
                {showLangMenu && (
                  <div className="absolute top-full mt-1 right-0 bg-white rounded-lg shadow-lg py-1 min-w-[150px] border border-gray-200">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => {
                          setLanguage(lang.code);
                          setShowLangMenu(false);
                        }}
                        className={`w-full text-left text-sm px-3 py-1.5 hover:bg-gray-50 transition-colors flex items-center gap-2 ${
                          language === lang.code ? 'text-orange-600 font-medium' : 'text-gray-700'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span>{lang.name}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 text-gray-700 hover:text-orange-600"
            >
              {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {showMobileMenu && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <div className="flex flex-col gap-3">
                <button
                  onClick={() => {
                    onNavigate('home');
                    setShowMobileMenu(false);
                  }}
                  className={`text-left px-4 py-2 rounded-lg transition-all ${
                    currentPage === 'home' ? 'bg-orange-100 text-orange-600 font-semibold' : 'text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  {t.nav.home}
                </button>
                <button
                  onClick={() => {
                    onNavigate('businesses');
                    setShowMobileMenu(false);
                  }}
                  className={`text-left px-4 py-2 rounded-lg transition-all ${
                    currentPage === 'businesses' ? 'bg-orange-100 text-orange-600 font-semibold' : 'text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  {t.nav.businesses}
                </button>
                <button
                  onClick={() => {
                    onNavigate('citizens');
                    setShowMobileMenu(false);
                  }}
                  className={`text-left px-4 py-2 rounded-lg transition-all ${
                    currentPage === 'citizens' ? 'bg-orange-100 text-orange-600 font-semibold' : 'text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  {t.nav.citizens}
                </button>
                <button
                  onClick={() => {
                    onNavigate('jobs');
                    setShowMobileMenu(false);
                  }}
                  className={`text-left px-4 py-2 rounded-lg transition-all ${
                    currentPage === 'jobs' ? 'bg-orange-100 text-orange-600 font-semibold' : 'text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  {t.nav.jobs}
                </button>
                <button
                  onClick={() => {
                    onNavigate('subscription');
                    setShowMobileMenu(false);
                  }}
                  className={`text-left px-4 py-2 rounded-lg transition-all ${
                    currentPage === 'subscription' ? 'bg-orange-100 text-orange-600 font-semibold' : 'text-gray-700 hover:bg-orange-50'
                  }`}
                >
                  {t.nav.subscription}
                </button>
                <div className="border-t border-gray-200 pt-3 mt-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowMobileMenu(false);
                      }}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                        language === lang.code ? 'bg-orange-100 text-orange-600 font-semibold' : 'text-gray-700 hover:bg-orange-50'
                      }`}
                    >
                      <span className="text-lg">{lang.flag}</span>
                      <span>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {currentPage === 'home' && (
        <div className="bg-yellow-400 border-b border-yellow-500 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-center gap-3">
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-xl">🎉</span>
                  <p className="text-sm md:text-base font-bold text-gray-900">
                    {t.home.banner.title}
                  </p>
                  <span className="text-xl">🎉</span>
                </div>
                <p className="text-xs md:text-sm text-gray-800">
                  {t.home.banner.subtitle}
                </p>
              </div>
              <button
                onClick={scrollToOffer}
                className="flex-shrink-0 p-2 hover:bg-yellow-500 rounded-full transition-colors"
                aria-label="Scroll to offer"
              >
                <ChevronDown className="w-5 h-5 text-gray-900 animate-bounce" />
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-[calc(100vh-5rem)]">{children}</main>

      <footer className="bg-gray-900 text-white py-12 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-2">{t.footer.appName}</h3>
              <p className="text-gray-400 text-sm mb-4">{t.footer.appSubtitle}</p>
              <p className="text-gray-400 text-sm">{t.footer.description}</p>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">{t.footer.navigation}</h4>
              <ul className="space-y-2">
                <li>
                  <button
                    onClick={() => onNavigate('home')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t.footer.home}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('businesses')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t.footer.establishments}
                  </button>
                </li>
                <li>
                  <button
                    onClick={() => onNavigate('subscription')}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    {t.footer.subscriptions}
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">{t.footer.categories}</h4>
              <ul className="space-y-2">
                <li><span className="text-gray-400 text-sm">{t.footer.hotel}</span></li>
                <li><span className="text-gray-400 text-sm">{t.footer.cultural}</span></li>
                <li><span className="text-gray-400 text-sm">{t.footer.administrative}</span></li>
                <li><span className="text-gray-400 text-sm">{t.footer.sport}</span></li>
                <li><span className="text-gray-400 text-sm">{t.footer.health}</span></li>
                <li><span className="text-gray-400 text-sm">{t.footer.justice}</span></li>
                <li><span className="text-gray-400 text-sm">{t.footer.school}</span></li>
                <li><span className="text-gray-400 text-sm">{t.footer.taxi}</span></li>
                <li><span className="text-gray-400 text-sm">{t.footer.food}</span></li>
                <li><span className="text-gray-400 text-sm">{t.footer.misc}</span></li>
              </ul>
            </div>

            <div>
              <h4 className="text-lg font-semibold mb-4">{t.footer.contact}</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Phone className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400 text-sm">{t.footer.phone}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-400 text-sm">{t.footer.email}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-5 h-5 text-gray-400 mt-1" />
                  <div className="text-gray-400 text-sm">
                    <p>{t.footer.address}</p>
                    <p>{t.footer.city}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              {t.footer.copyright}
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
