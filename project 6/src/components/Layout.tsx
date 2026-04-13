import { ReactNode, useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { Menu, X, ChevronDown, ChevronRight } from 'lucide-react';
import LanguageSelector from './LanguageSelector';
import Footer from './Footer';
import { WhatsAppSupport } from './WhatsAppSupport';

interface NavItem {
  label: string;
  path: string;
  children?: Array<{ label: string; path: string }>;
}

interface LayoutProps {
  children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const navigate = useNavigate();
  const location = useLocation();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const [mobileExpandedMenu, setMobileExpandedMenu] = useState<string | null>(null);
  const isRTL = language === 'ar';

  const showAdminLink = import.meta.env.DEV || import.meta.env.VITE_SHOW_ADMIN_LINK === 'true';

  const navigationStructure: NavItem[] = [
    {
      label: t.nav.home || 'Accueil',
      path: '/',
    },
    {
      label: t.nav.businesses || 'Entreprises',
      path: '/businesses',
      children: [
        { label: t.navMenu?.businesses?.directory || 'Annuaire', path: '/businesses' },
        { label: t.navMenu?.businesses?.partners || 'Partenaires', path: '/partner-search' },
        { label: 'Candidats disponibles', path: '/candidats' },
        { label: t.navMenu?.businesses?.events || 'Événements', path: '/business-events' },
      ],
    },
    {
      label: t.nav.citizens || 'Citoyens',
      path: '/citizens',
      children: [
        { label: 'Santé', path: '/citizens/health' },
        { label: 'Éducation', path: '/education' },
        { label: 'Services Citoyens', path: '/citizens/services' },
        { label: 'Commerces & Magasins', path: '/citizens/shops' },
        { label: 'Loisirs & Événements', path: '/citizens/leisure' },
        { label: 'Tourisme Local & Expatriation', path: '/citizens/tourism' },
      ],
    },
    {
      label: t.nav.jobs || 'Emploi',
      path: '/jobs',
      children: [
        { label: t.navMenu?.jobs?.browse || 'Parcourir', path: '/jobs' },
        { label: t.navMenu?.jobs?.post || 'Publier', path: '/emplois/publier' },
      ],
    },
    {
      label: t.nav.subscription || 'Abonnement',
      path: '/subscription',
    },
    {
      label: 'Notre Concept',
      path: '/concept',
    },
  ];

  const toggleMenu = (label: string) => {
    setOpenMenu(openMenu === label ? null : label);
  };

  const handleNavClick = (path: string) => {
    setOpenMenu(null);
    setShowMobileMenu(false);
    setMobileExpandedMenu(null);
    navigate(path);
  };

  const handleNavigateToSubscription = () => {
    navigate('/subscription');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openMenu && !(event.target as Element).closest('.nav-dropdown-container')) {
        setOpenMenu(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [openMenu]);

  const isActive = (path: string) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className={`min-h-screen bg-white ${isRTL ? 'rtl' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center gap-2 cursor-pointer">
              <div className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center shadow-sm">
                <img
                  src="/images/logo_dalil_tounes_sceau_luxe.png"
                  alt="Dalil Tounes"
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center', borderRadius: '50%' }}
                />
              </div>
              <h1 className="text-lg font-semibold text-gray-900">
                Dalil Tounes
              </h1>
            </Link>

            <div className="hidden md:flex items-center gap-6">
              {navigationStructure.map((navItem, index) => (
                <div
                  key={index}
                  className="relative nav-dropdown-container"
                  onMouseEnter={() => navItem.children && setOpenMenu(navItem.label)}
                  onMouseLeave={() => navItem.children && setOpenMenu(null)}
                >
                  {navItem.children ? (
                    <button
                      onClick={() => handleNavClick(navItem.path)}
                      className={`text-sm transition-all flex items-center gap-1 ${
                        isActive(navItem.path)
                          ? 'text-orange-600 font-medium'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {navItem.label}
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          openMenu === navItem.label ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  ) : (
                    <Link
                      to={navItem.path}
                      className={`text-sm transition-all ${
                        isActive(navItem.path)
                          ? 'text-orange-600 font-medium'
                          : 'text-gray-600 hover:text-gray-900'
                      }`}
                    >
                      {navItem.label}
                    </Link>
                  )}

                  {navItem.children && openMenu === navItem.label && (
                    <div className="absolute top-full left-0 pt-2">
                      <div className="bg-white rounded-lg shadow-xl py-2 min-w-[250px] border border-gray-200">
                        {navItem.children.map((child, childIndex) => (
                          <Link
                            key={childIndex}
                            to={child.path}
                            onClick={() => {
                              setOpenMenu(null);
                            }}
                            className="block w-full text-left text-sm px-4 py-2.5 hover:bg-orange-50 transition-colors text-gray-700 hover:text-orange-600"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <LanguageSelector />

              {showAdminLink && (
                <div
                  className="relative nav-dropdown-container"
                  onMouseEnter={() => setOpenMenu('Admin')}
                  onMouseLeave={() => setOpenMenu(null)}
                >
                  <button
                    className="flex items-center gap-1 px-3 py-1.5 text-sm rounded-md border border-gray-200 hover:bg-gray-100 text-gray-700 transition-all"
                  >
                    Admin
                    <ChevronDown
                      className={`w-4 h-4 transition-transform ${
                        openMenu === 'Admin' ? 'rotate-180' : ''
                      }`}
                    />
                  </button>

                  {openMenu === 'Admin' && (
                    <div className="absolute top-full right-0 pt-2">
                      <div className="bg-white rounded-lg shadow-xl py-2 min-w-[220px] border border-gray-200">
                        <Link
                          to="/admin/sourcing"
                          onClick={() => setOpenMenu(null)}
                          className="block w-full text-left text-sm px-4 py-2.5 hover:bg-orange-50 transition-colors text-gray-700 hover:text-orange-600"
                        >
                          Sourcing Rapide
                        </Link>
                        <Link
                          to="/around-me"
                          onClick={() => setOpenMenu(null)}
                          className="block w-full text-left text-sm px-4 py-2.5 hover:bg-orange-50 transition-colors text-gray-700 hover:text-orange-600"
                        >
                          Autour de moi
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              )}
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
              <div className="flex flex-col gap-2">
                {navigationStructure.map((navItem, index) => (
                  <div key={index}>
                    <div className="flex items-center gap-1">
                      {navItem.children ? (
                        <button
                          onClick={() => handleNavClick(navItem.path)}
                          className={`flex-1 text-left px-4 py-2 rounded-lg transition-all ${
                            isActive(navItem.path) ? 'bg-orange-100 text-orange-600 font-semibold' : 'text-gray-700 hover:bg-orange-50'
                          }`}
                        >
                          {navItem.label}
                        </button>
                      ) : (
                        <Link
                          to={navItem.path}
                          onClick={() => setShowMobileMenu(false)}
                          className={`flex-1 text-left px-4 py-2 rounded-lg transition-all ${
                            isActive(navItem.path) ? 'bg-orange-100 text-orange-600 font-semibold' : 'text-gray-700 hover:bg-orange-50'
                          }`}
                        >
                          {navItem.label}
                        </Link>
                      )}
                      {navItem.children && (
                        <button
                          onClick={() => setMobileExpandedMenu(mobileExpandedMenu === navItem.label ? null : navItem.label)}
                          className="px-3 py-2 rounded-lg text-gray-600 hover:bg-orange-50 transition-colors"
                        >
                          <ChevronRight
                            className={`w-4 h-4 transition-transform ${
                              mobileExpandedMenu === navItem.label ? 'rotate-90' : ''
                            }`}
                          />
                        </button>
                      )}
                    </div>

                    {navItem.children && mobileExpandedMenu === navItem.label && (
                      <div className="ml-4 mt-1 space-y-1">
                        {navItem.children.map((child, childIndex) => (
                          <Link
                            key={childIndex}
                            to={child.path}
                            onClick={() => {
                              setShowMobileMenu(false);
                              setMobileExpandedMenu(null);
                            }}
                            className="block w-full text-left px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {showAdminLink && (
                  <div>
                    <button
                      onClick={() => {
                        setMobileExpandedMenu(mobileExpandedMenu === 'Admin' ? null : 'Admin');
                      }}
                      className="w-full text-left px-4 py-2 rounded-lg transition-all flex items-center justify-between text-gray-700 hover:bg-orange-50"
                    >
                      <span>Admin</span>
                      <ChevronRight
                        className={`w-4 h-4 transition-transform ${
                          mobileExpandedMenu === 'Admin' ? 'rotate-90' : ''
                        }`}
                      />
                    </button>

                    {mobileExpandedMenu === 'Admin' && (
                      <div className="ml-4 mt-1 space-y-1">
                        <Link
                          to="/admin/sourcing"
                          onClick={() => {
                            setShowMobileMenu(false);
                            setMobileExpandedMenu(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          Sourcing Rapide
                        </Link>
                        <Link
                          to="/around-me"
                          onClick={() => {
                            setShowMobileMenu(false);
                            setMobileExpandedMenu(null);
                          }}
                          className="block w-full text-left px-4 py-2 text-sm rounded-lg text-gray-600 hover:bg-orange-50 hover:text-orange-600 transition-colors"
                        >
                          Autour de moi
                        </Link>
                      </div>
                    )}
                  </div>
                )}

                <div className="border-t border-gray-200 pt-3 mt-2 px-4">
                  <LanguageSelector />
                </div>
              </div>
            </div>
          )}
        </div>
      </nav>

      {location.pathname === '/' && (
        <div className="bg-yellow-400 border-b border-yellow-500 sticky top-16 z-40">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center justify-between gap-4">
              <div className="text-center flex-1">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <span className="text-xl">🎉</span>
                  <p className="text-sm md:text-base font-bold text-gray-900">
                    {t.home?.banner?.title || 'Offre de lancement exceptionnelle !'}
                  </p>
                  <span className="text-xl">🎉</span>
                </div>
                <p className="text-xs md:text-sm text-gray-800">
                  {t.home?.banner?.subtitle || '2 mois gratuits pour toute inscription'}
                </p>
              </div>
              <button
                onClick={handleNavigateToSubscription}
                className="flex-shrink-0 px-4 py-2 md:px-6 md:py-2.5 bg-gray-900 text-white text-sm md:text-base font-semibold rounded-lg hover:bg-gray-800 hover:scale-105 transition-all duration-200 shadow-md hover:shadow-lg whitespace-nowrap"
                aria-label="Discover offer"
              >
                {t.home?.banner?.button || 'Découvrir'}
              </button>
            </div>
          </div>
        </div>
      )}

      <main className="min-h-[calc(100vh-5rem)]">{children}</main>

      <Footer />

      <WhatsAppSupport phoneNumber="+21612345678" />
    </div>
  );
};
