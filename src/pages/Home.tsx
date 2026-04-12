import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { useNavigate } from 'react-router-dom';
import { MapPinned, MessageSquare, BarChart3, Smartphone, Navigation, ChevronRight } from 'lucide-react';
import { PremiumPartnersSection } from '../components/PremiumPartnersSection';
import CompanyCountCard from '../components/CompanyCountCard';
import UnifiedSearchBar from '../components/UnifiedSearchBar';
import { isSearchBarAllowed } from '../config/searchBars';
import HomeFeedbackWidget from '../components/HomeFeedbackWidget';
import LeisureEventsSection from '../components/LeisureEventsSection';
import { getSupabaseImageUrl } from '../lib/imageUtils';
import StructuredData from '../components/StructuredData';
import { generateOrganizationSchema, generateWebSiteSchema } from '../lib/structuredDataSchemas';
import React from 'react';



interface HomeProps {
  onNavigate?: (page: 'home' | 'businesses' | 'citizens' | 'jobs' | 'subscription' | 'candidateList' | 'businessList') => void;
  onSuggestBusiness?: () => void;
  onNavigateToBusiness?: (businessId: string) => void;
  onSearchSubmit?: (keyword: string, city: string) => void;
}

export const Home = ({ onNavigate, onSuggestBusiness, onNavigateToBusiness, onSearchSubmit }: HomeProps = {}) => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const navigate = useNavigate();

  // État pour capturer la valeur de recherche
  const [searchQuery, setSearchQuery] = React.useState('');

  const handleNavigateToBusinessDetail = (businessId: number | string) => {
    console.log('🔥 [Home] handleNavigateToBusinessDetail appelé');
    console.log('📌 businessId:', businessId);
    console.log('📌 onNavigateToBusiness:', !!onNavigateToBusiness);

    const id = typeof businessId === 'number' ? businessId.toString() : businessId;

    if (onNavigateToBusiness) {
      console.log('✅ Utilisation du callback onNavigateToBusiness');
      onNavigateToBusiness(id);
    } else {
      console.log('✅ Navigation directe vers /business/' + id);
      navigate(`/business/${id}`);
    }
  };

  const handleNavigate = (page: string) => {
    if (onNavigate) {
      onNavigate(page as any);
    } else {
      // Fallback navigation avec React Router
      const pageMap: Record<string, string> = {
        'businesses': '/businesses',
        'citizens': '/citizens',
        'jobs': '/jobs',
        'subscription': '/subscription',
        'candidateList': '/candidates',
        'businessList': '/business-list'
      };
      navigate(pageMap[page] || '/');
    }
  };

  return (
    <div>
      <StructuredData data={[generateOrganizationSchema(), generateWebSiteSchema()]} />

      {/* 1. Hero */}
      <section className="py-4 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="relative overflow-hidden rounded-3xl p-6 md:p-8 shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#D4AF37] text-center">
            <img
              src={getSupabaseImageUrl('drapeau-tunisie.jpg')}
              alt="Drapeau de la Tunisie"
              className="absolute inset-0 w-full h-full object-cover brightness-105"
            />
            <div className="absolute inset-0 bg-black/30"></div>

            <div className="relative z-10">
              <h1 className="text-2xl md:text-3xl font-light text-white mb-4 drop-shadow-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                {t.home.connection.title}
              </h1>
              <p className="text-base md:text-lg text-white leading-relaxed italic font-medium drop-shadow-lg" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                {t.home.connection.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 1.5 Bouton Concept Premium */}
      <section className="py-2.5 px-4">
        <div className="max-w-6xl mx-auto flex justify-center">
          <a
            href="#/notre-concept"
            className="group relative inline-flex items-center gap-2.5 px-6 py-2.5 bg-[#4A1D43] rounded-xl shadow-[0_4px_20px_rgba(212,175,55,0.25)] border border-[#D4AF37] hover:shadow-[0_8px_30px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-105 hover:bg-[#5A2D53]"
          >
            <span className="relative text-base font-semibold text-[#D4AF37]" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
              {t.concept.ctaButton}
            </span>
            <svg className="relative w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </section>

      {/* 2. Pourquoi choisir Dalil-Tounes */}
      <section id="section-pourquoi" className="py-3 px-4 bg-white scroll-mt-24">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-3">
            <h2 className="text-lg md:text-xl font-light text-gray-900 mb-1">
              {t.home.features.title}
            </h2>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-2">
            <div className="group bg-white rounded-xl p-3 border border-[#D4AF37] hover:shadow-[0_6px_20px_rgba(74,29,67,0.12)] transition-all duration-300 hover:scale-105">
              <div className="w-8 h-8 bg-transparent rounded-lg flex items-center justify-center mb-2 group-hover:bg-[#D4AF37]/10 transition-colors">
                <MapPinned className="w-3.5 h-3.5 text-[#4A1D43]" />
              </div>
              <h3 className="text-xs font-medium text-gray-900 mb-1">
                {t.home.features.localSeo.title}
              </h3>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                {t.home.features.localSeo.description}
              </p>
            </div>

            <div className="group bg-white rounded-xl p-3 border border-[#D4AF37] hover:shadow-[0_6px_20px_rgba(74,29,67,0.12)] transition-all duration-300 hover:scale-105">
              <div className="w-8 h-8 bg-transparent rounded-lg flex items-center justify-center mb-2 group-hover:bg-[#D4AF37]/10 transition-colors">
                <MessageSquare className="w-3.5 h-3.5 text-[#4A1D43]" />
              </div>
              <h3 className="text-xs font-medium text-gray-900 mb-1">
                {t.home.features.reviews.title}
              </h3>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                {t.home.features.reviews.description}
              </p>
            </div>

            <div className="group bg-white rounded-xl p-3 border border-[#D4AF37] hover:shadow-[0_6px_20px_rgba(74,29,67,0.12)] transition-all duration-300 hover:scale-105">
              <div className="w-8 h-8 bg-transparent rounded-lg flex items-center justify-center mb-2 group-hover:bg-[#D4AF37]/10 transition-colors">
                <BarChart3 className="w-3.5 h-3.5 text-[#4A1D43]" />
              </div>
              <h3 className="text-xs font-medium text-gray-900 mb-1">
                {t.home.features.analytics.title}
              </h3>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                {t.home.features.analytics.description}
              </p>
            </div>

            <div className="group bg-white rounded-xl p-3 border border-[#D4AF37] hover:shadow-[0_6px_20px_rgba(74,29,67,0.12)] transition-all duration-300 hover:scale-105">
              <div className="w-8 h-8 bg-transparent rounded-lg flex items-center justify-center mb-2 group-hover:bg-[#D4AF37]/10 transition-colors">
                <Smartphone className="w-3.5 h-3.5 text-[#4A1D43]" />
              </div>
              <h3 className="text-xs font-medium text-gray-900 mb-1">
                {t.home.features.mobileApp.title}
              </h3>
              <p className="text-[11px] text-gray-600 leading-relaxed">
                {t.home.features.mobileApp.description}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Compteur */}
      <section className="px-4 py-2">
        <CompanyCountCard language={language} />
      </section>

      {/* 5. Établissements à la Une */}
      <PremiumPartnersSection onCardClick={(id) => handleNavigateToBusinessDetail(id)} />

      {/* 5.5 Slogan Marketing */}
      <section className="py-8 px-4 bg-white">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl md:text-3xl font-light mb-3 text-[#4A0404]" style={{ fontFamily: "'Playfair Display', serif" }}>
            Les réseaux sociaux sont pour le divertissement, Dalil Tounes est l'outil de votre réussite.
          </h2>
          <div className="flex justify-center">
            <div className="w-[40px] h-[1px] bg-[#D4AF37]"></div>
          </div>
        </div>
      </section>

      {/* 6. Barre de recherche */}
      <section className="py-2 px-4 relative z-[1000] overflow-visible">
        <div className="max-w-5xl mx-auto relative z-[1001] overflow-visible">
          {isSearchBarAllowed('home') && (
            <div className="bg-white rounded-xl shadow-[0_4px_20px_rgba(0,0,0,0.05)] border border-[#D4AF37] p-2.5 md:p-3 relative overflow-visible">
              <UnifiedSearchBar />
            </div>
          )}

          <div className="text-center mt-3">
            <p className="text-xs text-gray-500 mb-2.5">
              Vous connaissez une bonne adresse ? Partagez-la ici !
            </p>
            <button
              onClick={onSuggestBusiness}
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#4A1D43] hover:bg-[#5A2D53] text-[#D4AF37] font-bold rounded-xl border border-[#D4AF37] shadow-[0_4px_15px_rgba(212,175,55,0.25)] hover:shadow-[0_6px_25px_rgba(212,175,55,0.4)] transition-all duration-300 hover:scale-105 text-sm"
            >
              {t.home.suggestBusiness}
            </button>
          </div>
        </div>
      </section>

      {/* 7. Section Marketing Épurée */}
      <section className="py-6 px-4 bg-white relative z-[1]">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-lg md:text-xl font-light mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
            <span className="text-[#4A0404]">Vous êtes présent, mais êtes-vous trouvable ?</span>
          </p>

          <div className="flex justify-center">
            <div className="w-[40px] h-[1px] bg-[#D4AF37]"></div>
          </div>
        </div>
      </section>

      {/* 8. Loisirs & Événements */}
      <LeisureEventsSection />

      {/* 8. Avis (Feedback) */}
      <section className="py-2.5 px-4 bg-gradient-to-b from-gray-50 to-white relative z-[1]">
        <div className="max-w-2xl mx-auto relative z-[1]">
          <HomeFeedbackWidget />
        </div>
      </section>
    </div>
  );
};
