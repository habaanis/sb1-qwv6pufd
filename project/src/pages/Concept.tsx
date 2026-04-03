import { Building2, MapPin, Users, Crown, Sparkles, Award, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { SEOHead } from '../components/SEOHead';
import { SocialShareButtons } from '../components/SocialShareButtons';
import { LazyImage } from '../components/LazyImage';
import StructuredData from '../components/StructuredData';
import { generateAboutPageSchema } from '../lib/structuredDataSchemas';
import { useHreflangPath } from '../hooks/useHreflangPath';

export default function Concept() {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const currentPath = useHreflangPath();

  const handleJoinElite = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    window.location.hash = '#/subscription';
  };

  const pillars = [
    {
      icon: Users,
      titleKey: 'concept.pillars.artisans.title',
      subtitleKey: 'concept.pillars.artisans.subtitle',
      descriptionKey: 'concept.pillars.artisans.description',
      color: 'from-[#D4AF37] to-[#FFD700]',
      iconBg: 'bg-[#D4AF37]',
      image: 'https://images.pexels.com/photos/5710038/pexels-photo-5710038.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      icon: Building2,
      titleKey: 'concept.pillars.businesses.title',
      subtitleKey: 'concept.pillars.businesses.subtitle',
      descriptionKey: 'concept.pillars.businesses.description',
      color: 'from-[#4A90E2] to-[#5BA3F5]',
      iconBg: 'bg-[#4A90E2]',
      image: 'https://images.pexels.com/photos/380769/pexels-photo-380769.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      icon: MapPin,
      titleKey: 'concept.pillars.tourism.title',
      subtitleKey: 'concept.pillars.tourism.subtitle',
      descriptionKey: 'concept.pillars.tourism.description',
      color: 'from-[#C62828] to-[#E53935]',
      iconBg: 'bg-[#C62828]',
      image: 'https://images.pexels.com/photos/19869459/pexels-photo-19869459.jpeg?auto=compress&cs=tinysrgb&w=800'
    },
    {
      icon: Star,
      titleKey: 'concept.pillars.citizens.title',
      subtitleKey: 'concept.pillars.citizens.subtitle',
      descriptionKey: 'concept.pillars.citizens.description',
      color: 'from-[#556B2F] to-[#6B8E23]',
      iconBg: 'bg-[#556B2F]',
      image: 'https://images.pexels.com/photos/1181406/pexels-photo-1181406.jpeg?auto=compress&cs=tinysrgb&w=800'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <StructuredData data={generateAboutPageSchema()} />

      <SEOHead
        title="Dalil Tounes | L'Excellence au Service de la Tunisie"
        description="Découvrez notre vision premium : L'Humain, le Digital et le Patrimoine réunis pour booster la visibilité tunisienne. Rejoignez l'élite des établissements tunisiens."
        image="https://dalil-tounes.com/og-concept-premium.jpg"
        type="website"
        currentPath={currentPath}
      />

      <SocialShareButtons
        floating
        title="Dalil Tounes - Notre Concept"
        description="Regarde ce projet magnifique pour la Tunisie"
      />

      <section className="relative min-h-[60vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 bg-amber-900">
          <LazyImage
            src="/images/cat_magasin.jpg.jpg"
            alt="Artisan tourneur sur bois tunisien dans son atelier"
            className="w-full h-full object-cover"
            style={{
              filter: 'brightness(0.7)',
              minHeight: '100%',
              minWidth: '100%'
            }}
            fallbackSrc="https://images.pexels.com/photos/6527036/pexels-photo-6527036.jpeg?auto=compress&cs=tinysrgb&w=1920"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/30"></div>
        </div>

        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]"></div>

        <div className="max-w-6xl mx-auto px-6 text-center relative z-10 py-10">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 drop-shadow-2xl">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]">{t.concept.mainTitle}</span>
          </h1>
          <p className="text-2xl md:text-3xl text-white mb-6 drop-shadow-xl font-light tracking-wide" style={{ textShadow: '0 4px 12px rgba(0,0,0,0.6)' }}>
            {t.concept.subtitle}
          </p>

          <div className="bg-white/20 backdrop-blur-lg max-w-3xl mx-auto p-6 rounded-2xl border border-[#D4AF37]/40 shadow-2xl">
            <p className="text-lg text-white leading-relaxed font-medium drop-shadow-lg">
              {t.concept.intro}
            </p>
          </div>
        </div>
      </section>

      <section className="py-8 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-3">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]">{t.concept.pillarsTitle}</span>
            </h2>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              {t.concept.pillarsSubtitle}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {pillars.map((pillar, idx) => (
              <div
                key={idx}
                className="group bg-white/80 backdrop-blur-sm rounded-2xl overflow-hidden hover:shadow-2xl transition-all transform hover:-translate-y-2"
              >
                <div className="relative h-48 overflow-hidden">
                  <LazyImage
                    src={pillar.image}
                    alt={t[pillar.titleKey as keyof typeof t] as string}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className={`absolute inset-0 bg-gradient-to-t ${pillar.color} opacity-60`}></div>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] to-[#FFD700]"></div>
                  <div className="absolute top-4 left-4">
                    <div className={`${pillar.iconBg} w-16 h-16 rounded-full flex items-center justify-center shadow-2xl ring-4 ring-[#D4AF37]/50 group-hover:scale-110 transition-transform`}>
                      <pillar.icon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                </div>

                <div className="p-6 relative">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{t.concept.pillars[pillar.titleKey.split('.')[2] as 'artisans' | 'businesses' | 'tourism' | 'citizens'].title}</h3>
                  <p className={`text-transparent bg-clip-text bg-gradient-to-r ${pillar.color} font-semibold italic mb-3 text-base`}>
                    {t.concept.pillars[pillar.titleKey.split('.')[2] as 'artisans' | 'businesses' | 'tourism' | 'citizens'].subtitle}
                  </p>
                  <p className="text-gray-700 leading-relaxed text-base">
                    {t.concept.pillars[pillar.titleKey.split('.')[2] as 'artisans' | 'businesses' | 'tourism' | 'citizens'].description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-8 shadow-2xl">
            <h2 className="text-3xl md:text-4xl font-bold text-center mb-6">
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]">{t.concept.commitment.title}</span>
            </h2>

            <div className="space-y-4 text-base text-gray-700 leading-relaxed">
              <p className="text-lg text-center font-medium text-gray-800">
                {t.concept.commitment.question}
              </p>
              <p>{t.concept.commitment.paragraph1}</p>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-5 my-4">
                <p className="font-bold text-lg text-center text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]">
                  {t.concept.commitment.mission}
                </p>
              </div>
              <p>{t.concept.commitment.paragraph2}</p>
              <p>
                <span className="font-bold text-[#C62828]">{t.concept.mainTitle}</span> {t.concept.commitment.paragraph3}
              </p>
              <div className="border-2 border-[#D4AF37] rounded-xl p-6 mt-6 bg-gradient-to-r from-[#D4AF37]/5 to-transparent">
                <p className="font-bold text-xl text-center text-gray-900 mb-3">
                  {t.concept.commitment.together}
                </p>
                <p className="text-center text-gray-600 italic text-sm">
                  {t.concept.commitment.values}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="relative py-8 px-6 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-[#1a1a1a]">
          <div className="absolute inset-0 opacity-30">
            <LazyImage
              src="/images/entreprise_banner.webp"
              alt="Elite business professionals background"
              className="w-full h-full object-cover"
              fallbackSrc="https://images.pexels.com/photos/208736/pexels-photo-208736.jpeg?auto=compress&cs=tinysrgb&w=1920"
            />
          </div>
        </div>

        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]"></div>
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]"></div>

        <div className="max-w-6xl mx-auto relative z-10">
          <h2 className="text-4xl md:text-5xl font-bold text-center mb-4">
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]">{t.concept.elite.title}</span>
          </h2>
          <p className="text-xl md:text-2xl text-center text-[#D4AF37] mb-3 font-semibold">
            {t.concept.elite.subtitle}
          </p>
          <p className="text-center text-gray-300 mb-10 text-lg max-w-3xl mx-auto">
            {t.concept.elite.description}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
            {[
              { icon: Crown, titleKey: 'concept.elite.features.visibility.title', descriptionKey: 'concept.elite.features.visibility.description' },
              { icon: Sparkles, titleKey: 'concept.elite.features.support.title', descriptionKey: 'concept.elite.features.support.description' },
              { icon: Award, titleKey: 'concept.elite.features.marketing.title', descriptionKey: 'concept.elite.features.marketing.description' }
            ].map((feature, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-md rounded-xl p-6 hover:bg-white/10 transition-all group">
                <div className="bg-gradient-to-r from-[#D4AF37] to-[#FFD700] w-16 h-16 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-xl">
                  <feature.icon className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{t.concept.elite.features[feature.titleKey.split('.')[3] as 'visibility' | 'support' | 'marketing'].title}</h3>
                <p className="text-gray-300 leading-relaxed text-base">{t.concept.elite.features[feature.titleKey.split('.')[3] as 'visibility' | 'support' | 'marketing'].description}</p>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button
              onClick={handleJoinElite}
              className="group relative bg-gradient-to-r from-[#D4AF37] to-[#FFD700] px-10 py-4 rounded-xl font-bold text-xl text-white hover:scale-105 transition-transform shadow-2xl overflow-hidden"
            >
              <span className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20 transition-opacity"></span>
              <span className="relative">{t.concept.elite.ctaButton}</span>
            </button>
            <p className="text-gray-400 mt-4 text-sm italic">
              {t.concept.elite.limited}
            </p>
          </div>
        </div>
      </section>

      <footer className="relative bg-gradient-to-b from-gray-900 to-black text-white py-6 px-6">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-6">
            <h3 className="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-[#D4AF37] via-[#FFD700] to-[#D4AF37]">{t.concept.mainTitle}</h3>
            <p className="text-gray-400 max-w-2xl mx-auto text-base leading-relaxed">
              {t.concept.footer.description}
            </p>
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">{t.concept.footer.copyright}</p>
            <p className="text-[#D4AF37] mt-2 font-medium text-sm">{t.concept.footer.made}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}