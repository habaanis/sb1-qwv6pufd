import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { MapPinned, MessageSquare, BarChart3, Smartphone } from 'lucide-react';
import { FeaturedEventsCarousel } from '../components/FeaturedEventsCarousel';
import CompanyCountCard from '../components/CompanyCountCard';
import SearchBarHome from '../components/SearchBarHome';
import SupabaseStatus from '../components/SupabaseStatus';

interface HomeProps {
  onNavigate: (page: 'home' | 'businesses' | 'citizens' | 'jobs' | 'subscription') => void;
  onSuggestBusiness: () => void;
  onNavigateToBusiness: (businessId: string) => void;
  onSearchSubmit?: (keyword: string, city: string) => void;
}

export const Home = ({ onNavigate, onSuggestBusiness, onNavigateToBusiness, onSearchSubmit }: HomeProps) => {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const handleSearch = (keyword: string, city: string) => {
    console.log('Search submitted:', keyword, city);
    if (onSearchSubmit) {
      onSearchSubmit(keyword, city);
    }
    onNavigate('businesses');
  };

  const handleNavigateToBusinessDetail = (businessId: number) => {
    onNavigateToBusiness(businessId.toString());
  };

  return (
    <div>
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-orange-50 to-amber-50 rounded-2xl p-8 md:p-12 shadow-sm border border-orange-100 text-center mb-12">
            <h1 className="text-2xl md:text-3xl font-light text-gray-900 mb-6" style={{ fontFamily: "'Playfair Display', serif" }}>
              {t.home.connection.title}
            </h1>
            <p className="text-base md:text-lg text-gray-700 leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {t.home.connection.description}
            </p>
          </div>

          <SearchBarHome
            language={language}
            onSearch={handleSearch}
            onNavigateToBusiness={handleNavigateToBusinessDetail}
          />

          <div className="text-center mt-6">
            <button
              onClick={onSuggestBusiness}
              className="text-sm text-orange-600 hover:text-orange-700 font-medium"
            >
              {t.home.suggestBusiness}
            </button>
          </div>
        </div>
      </section>

      <section className="px-4">
        <CompanyCountCard language={language} />
      </section>

      <FeaturedEventsCarousel
        onDiscoverClick={() => window.location.hash = '#/business-events'}
        autoplay={true}
        interval={7000}
        showArrows={true}
        showIndicators={true}
      />

      <section className="py-16 px-4 bg-gradient-to-b from-white to-gray-50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-3">
              {t.home.features.title}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
            <div className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all border border-gray-100">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                <MapPinned className="w-6 h-6 text-orange-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">
                {t.home.features.localSeo.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t.home.features.localSeo.description}
              </p>
            </div>

            <div className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all border border-gray-100">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                <MessageSquare className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">
                {t.home.features.reviews.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t.home.features.reviews.description}
              </p>
            </div>

            <div className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all border border-gray-100">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                <BarChart3 className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">
                {t.home.features.analytics.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t.home.features.analytics.description}
              </p>
            </div>

            <div className="group bg-white rounded-xl p-6 hover:shadow-lg transition-all border border-gray-100">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                <Smartphone className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-base font-medium text-gray-900 mb-2">
                {t.home.features.mobileApp.title}
              </h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t.home.features.mobileApp.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 rounded-2xl p-10 md:p-14 shadow-sm border border-red-100">
            <div className="space-y-6 text-gray-800">
              <p className="text-lg md:text-xl leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Ici, nous avons réuni pour vous tous les établissements et services de Tunisie, afin que vous puissiez les trouver facilement, sans stress et sans perdre de temps.
              </p>

              <p className="text-base md:text-lg leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Que vous soyez citoyen tunisien, entreprise ou visiteur de passage, Dalil Tounes est là pour vous guider : hôtels, administrations, hôpitaux, commerces, métiers, et même les plus beaux lieux touristiques comme nos sites archéologiques et musées.
              </p>

              <p className="text-lg md:text-xl leading-relaxed italic" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Notre but est simple : vous simplifier la vie et mettre en valeur les richesses de notre pays et le savoir-faire de ses professionnels.
              </p>

              <p className="text-base md:text-lg leading-relaxed text-center" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                Parce qu'en Tunisie, l'accueil est une tradition… et sur Dalil Tounes, nous voulons que vous vous sentiez comme chez vous <span className="text-red-600">❤️</span>
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="offer-section" className="py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200 overflow-hidden">
            <div className="p-8 md:p-12 text-center">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-orange-600 text-white rounded-full text-xs font-medium mb-4">
                <span>🎁</span>
                <span>{t.home.offer.badge}</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-6">
                {t.home.offer.title}
              </h2>

              <div className="max-w-3xl mx-auto space-y-4 mb-8">
                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl">✨</span>
                    <p className="text-base font-medium text-gray-900">
                      {t.home.offer.freeMonths}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">{t.home.offer.noCommitment}</p>
                </div>

                <div className="bg-white rounded-lg p-4 border border-orange-200">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl">🚀</span>
                    <p className="text-base font-medium text-gray-900">
                      {t.home.offer.bonusMonths}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600">{t.home.offer.annualCondition}</p>
                </div>

                <div className="bg-orange-600 rounded-lg p-4 text-white">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <span className="text-2xl">🎯</span>
                    <p className="text-lg font-medium">
                      {t.home.offer.totalMonths}
                    </p>
                  </div>
                  <p className="text-sm text-orange-100">{t.home.offer.allFeatures}</p>
                </div>
              </div>

              <p className="text-sm text-gray-600 mb-6">
                {t.home.offer.description}
              </p>

              <button
                onClick={() => onNavigate('subscription')}
                className="px-8 py-3 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 transition-colors shadow-sm"
              >
                {t.home.offer.cta}
              </button>
            </div>
          </div>
        </div>
      </section>

      <SupabaseStatus />
    </div>
  );
};
