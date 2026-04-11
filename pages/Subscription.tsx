import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { Check, Star } from 'lucide-react';
import { RegistrationForm } from '../components/RegistrationForm';
import { QuoteForm } from '../components/QuoteForm';

export const Subscription = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [showRegistration, setShowRegistration] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string>('');
  const [billingPeriod, setBillingPeriod] = useState<'monthly' | 'annual'>('monthly');
  const [showQuoteForm, setShowQuoteForm] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash.includes('#form-inscription-entreprise')) {
      setTimeout(() => {
        const element = document.getElementById('form-inscription-entreprise');
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
    }
  }, []);

  const plansConfig = [
    {
      key: 'decouverte',
      bgColor: 'bg-[#F8FAFC]',
      headerColor: 'bg-gray-100',
      textColor: 'text-gray-900',
      bottomTriangleColor: '#6B7280',
      tier: 'decouverte' as const,
    },
    {
      key: 'artisan',
      bgColor: 'bg-[#4A1D43]',
      headerColor: 'bg-[#4A1D43]',
      textColor: 'text-white',
      popular: true,
      bottomTriangleColor: '#5A2D53',
      tier: 'artisan' as const,
    },
    {
      key: 'premium',
      bgColor: 'bg-[#064E3B]',
      headerColor: 'bg-[#064E3B]',
      textColor: 'text-white',
      bottomTriangleColor: '#065F46',
      tier: 'premium' as const,
    },
    {
      key: 'elitePro',
      bgColor: 'bg-[#121212]',
      headerColor: 'bg-[#121212]',
      textColor: 'text-[#D4AF37]',
      bottomTriangleColor: '#1E1E1E',
      isElite: true,
      tier: 'elite' as const,
    },
    {
      key: 'custom',
      bgColor: 'bg-gray-50',
      headerColor: 'bg-gray-200',
      textColor: 'text-gray-900',
      bottomTriangleColor: '#9CA3AF',
      isCustom: true,
      tier: 'custom' as const,
    },
  ];

  return (
    <div className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-light mb-3 text-gray-900">
            {t.subscription.title}
          </h1>
          <p className="text-base text-gray-600 max-w-2xl mx-auto">{t.subscription.subtitle}</p>
        </div>

        <section className="mb-12">
          <div className="bg-gradient-to-br from-red-50 via-orange-50 to-amber-50 rounded-3xl p-10 md:p-14 shadow-[0_4px_20px_rgba(0,0,0,0.05)]">
            <div className="text-center mb-8">
              <h2 className="text-2xl md:text-3xl font-light text-gray-900 mb-4">
                Faites rayonner votre marque en Tunisie
              </h2>
              <div className="max-w-3xl mx-auto">
                <p className="text-gray-800 text-base md:text-lg leading-relaxed" style={{ fontFamily: "'Cormorant Garamond', serif" }}>
                  Dalil Tounes est la plateforme de référence pour connecter votre entreprise avec des milliers de clients potentiels à travers la Tunisie. Rejoignez notre communauté d'entreprises qui font confiance à notre expertise pour développer leur visibilité et leur activité.
                </p>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
                <div className="text-3xl mb-3">🎯</div>
                <h3 className="font-semibold text-gray-900 mb-2">Visibilité Maximale</h3>
                <p className="text-sm text-gray-600">
                  Apparaissez en première position dans les résultats de recherche et attirez plus de clients.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
                <div className="text-3xl mb-3">📊</div>
                <h3 className="font-semibold text-gray-900 mb-2">Statistiques Détaillées</h3>
                <p className="text-sm text-gray-600">
                  Suivez vos performances avec des rapports complets sur vos vues, clics et interactions.
                </p>
              </div>

              <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm">
                <div className="text-3xl mb-3">⭐</div>
                <h3 className="font-semibold text-gray-900 mb-2">Badge Premium</h3>
                <p className="text-sm text-gray-600">
                  Distinguez-vous avec un badge doré et renforcez la confiance de vos clients.
                </p>
              </div>
            </div>
          </div>
        </section>

        <div
          id="form-inscription-entreprise"
          className="scroll-mt-32 bg-gradient-to-br from-[#4A1D43] to-[#5A2D53] rounded-[20px] border-2 border-[#D4AF37] overflow-hidden mb-12 shadow-[0_8px_32px_rgba(212,175,55,0.15),0_0_40px_rgba(212,175,55,0.08)]"
        >
          <div className="p-8 md:p-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white rounded-full text-xs font-bold mb-4 shadow-lg">
              <span>🎁</span>
              <span>{t.home.offer.badge}</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              {t.home.offer.title}
            </h2>

            <div className="max-w-3xl mx-auto space-y-4 mb-8">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-[#D4AF37]/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">✨</span>
                  <p className="text-base font-medium text-white">
                    {t.home.offer.freeMonths}
                  </p>
                </div>
                <p className="text-sm text-gray-200">{t.home.offer.noCommitment}</p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-[#D4AF37]/30">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">🚀</span>
                  <p className="text-base font-medium text-white">
                    {t.home.offer.bonusMonths}
                  </p>
                </div>
                <p className="text-sm text-gray-200">{t.home.offer.annualCondition}</p>
              </div>

              <div className="bg-[#D4AF37] rounded-lg p-4 text-[#4A1D43]">
                <div className="flex items-center justify-center gap-2 mb-2">
                  <span className="text-2xl">🎯</span>
                  <p className="text-lg font-bold">
                    {t.home.offer.totalMonths}
                  </p>
                </div>
                <p className="text-sm">{t.home.offer.allFeatures}</p>
              </div>
            </div>

            <p className="text-sm text-gray-200 mb-6">
              {t.home.offer.description}
            </p>

            <button
              onClick={() => {
                setSelectedPlan('Artisan');
                setShowRegistration(true);
              }}
              className="px-8 py-3 bg-[#D4AF37] text-[#4A1D43] rounded-lg text-sm font-bold hover:bg-[#C4A027] transition-colors shadow-lg hover:shadow-xl"
            >
              {t.subscription.registerButton}
            </button>
          </div>
        </div>

        {/* Toggle Mensuel / Annuel */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center bg-gray-100 rounded-lg p-1">
            <button
              onClick={() => setBillingPeriod('monthly')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'monthly'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.subscription.billing.monthly}
            </button>
            <button
              onClick={() => setBillingPeriod('annual')}
              className={`px-6 py-2 rounded-md text-sm font-medium transition-all ${
                billingPeriod === 'annual'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {t.subscription.billing.annual}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-5 gap-6 mb-12 max-w-6xl mx-auto items-start">
          {plansConfig.map((planConfig) => {
            const plan = t.subscription.plans[planConfig.key];
            const isArtisan = planConfig.key === 'artisan';
            const isPremium = planConfig.key === 'premium';
            const isElitePro = planConfig.isElite || false;
            const isCustom = planConfig.isCustom || false;
            const isDecouverte = planConfig.key === 'decouverte';
            const displayPrice = billingPeriod === 'annual' && (isArtisan || isPremium || isElitePro) ? (plan.annualPrice || plan.price) : plan.price;

            const borderStyle = isCustom
              ? '2px dashed #9CA3AF'
              : isDecouverte
              ? '1px solid #D4AF37'
              : '2px solid #D4AF37';

            const shadowStyle = (isArtisan || isPremium || isElitePro)
              ? '0 8px 32px rgba(212, 175, 55, 0.15), 0 0 40px rgba(212, 175, 55, 0.08)'
              : '0 2px 10px rgba(0,0,0,0.05)';

            return (
              <div
                key={planConfig.key}
                className={`relative rounded-[20px] transition-all ${planConfig.bgColor} flex flex-col h-full overflow-hidden group hover:-translate-y-1`}
                style={{
                  border: borderStyle,
                  boxShadow: shadowStyle
                }}
              >
                {planConfig.popular && (
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full flex items-center gap-1 z-20 shadow-lg">
                    <Star className="w-3 h-3 fill-current" />
                    <span className="text-xs font-bold">{plan.popular}</span>
                  </div>
                )}

                {/* Glass shine effect for premium tiers */}
                {(isArtisan || isPremium || isElitePro) && (
                  <>
                    <div
                      className="absolute inset-0 rounded-[20px] opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10"
                      style={{
                        background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.8) 50%, transparent 100%)',
                        animation: 'shine 1.5s ease-in-out',
                        transform: 'translateX(-100%)',
                      }}
                    />
                    <style>{`
                      @keyframes shine {
                        0% { transform: translateX(-100%) skewX(-15deg); }
                        100% { transform: translateX(200%) skewX(-15deg); }
                      }
                      .group:hover > div:nth-child(${planConfig.popular ? '3' : '2'}) {
                        animation: shine 1.5s ease-in-out;
                      }
                    `}</style>
                  </>
                )}

                {/* Triangle doré en position absolue au sommet de la carte */}
                <div
                  className="absolute left-1/2 -translate-x-1/2 z-10"
                  style={{
                    top: '0',
                    width: 0,
                    height: 0,
                    borderLeft: '20px solid transparent',
                    borderRight: '20px solid transparent',
                    borderTop: '16px solid #D4AF37',
                  }}
                />

                {/* En-tête */}
                <div className={`${planConfig.headerColor} py-2.5 px-4`}>
                  <h3 className={`text-sm font-bold text-center tracking-wide uppercase ${
                    isElitePro ? 'text-[#D4AF37]' :
                    isArtisan || isPremium ? 'text-white' :
                    'text-gray-900'
                  }`}>
                    {plan.name}
                  </h3>
                </div>

                {/* Première ligne de séparation dorée fine sous le nom */}
                <div
                  className="w-full"
                  style={{ height: '1px', backgroundColor: '#D4AF37' }}
                />

                <div className={`px-5 pt-4 pb-4 flex flex-col flex-grow ${isElitePro ? 'text-[#D4AF37]' : isArtisan || isPremium ? 'text-white' : 'text-gray-900'}`}>
                  <div>
                    <div className="text-center mb-2">
                      {billingPeriod === 'annual' && (isArtisan || isPremium || isElitePro) && plan.annualSavings && (
                        <div className="mb-2 inline-block px-3 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                          {plan.annualSavings}
                        </div>
                      )}
                    {isCustom ? (
                      <>
                        <div className="text-2xl font-bold mb-1 text-gray-900">
                          {plan.subtitle}
                        </div>
                        <p className="text-xs text-gray-600 mt-2 px-2">
                          {plan.description}
                        </p>
                      </>
                    ) : (
                      <>
                        <div className={`text-3xl font-bold mb-1 ${
                          isElitePro ? 'text-[#D4AF37]' :
                          isArtisan || isPremium ? 'text-white' :
                          'text-gray-900'
                        }`}>
                          {displayPrice}
                        </div>
                        {displayPrice !== 'Gratuit' && displayPrice !== 'Free' && displayPrice !== 'مجاني' && displayPrice !== 'Gratuito' && displayPrice !== 'Бесплатно' && (
                          <p className={`text-xs ${
                            isElitePro ? 'text-gray-400' :
                            isArtisan || isPremium ? 'text-gray-200' :
                            'text-gray-600'
                          }`}>
                            {t.subscription.perMonth}
                          </p>
                        )}
                      </>
                    )}
                  </div>

                    {/* Deuxième ligne de séparation dorée épaisse sous le prix avec triangle */}
                    <div className="relative mb-3 -mx-6">
                      <div style={{ height: '3px', backgroundColor: '#D4AF37' }} />
                      {/* Triangle coloré centré sur la ligne de séparation */}
                      <div
                        className="absolute left-1/2 -translate-x-1/2"
                        style={{
                          top: '0',
                          width: 0,
                          height: 0,
                          borderLeft: '20px solid transparent',
                          borderRight: '20px solid transparent',
                          borderTop: `20px solid ${planConfig.bottomTriangleColor}`,
                        }}
                      />
                    </div>

                    <ul className="space-y-2">
                    {/* Section Inclus pour Elite Pro (exclusif mode annuel) */}
                    {isElitePro && billingPeriod === 'annual' && (
                      <>
                        <li className="flex items-start gap-2 pb-2 border-b border-gray-200">
                          <div
                            className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#D4AF37' }}
                          >
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="text-xs font-bold leading-relaxed text-[#D4AF37]">
                            {plan.annualBonus}
                          </span>
                        </li>
                        {plan.annualFlyersBonus && (
                          <li className="flex items-start gap-2 pb-2 border-b border-gray-200">
                            <div
                              className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: '#D4AF37' }}
                            >
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                            <span className="text-xs font-bold leading-relaxed text-[#D4AF37]">
                              {plan.annualFlyersBonus}
                            </span>
                          </li>
                        )}
                        <li className="py-1.5">
                          <div
                            className="w-full"
                            style={{ height: '1.5px', backgroundColor: '#D4AF37' }}
                          />
                        </li>
                      </>
                    )}
                    {/* Bonus annuel pour Premium */}
                    {billingPeriod === 'annual' && isPremium && !isElitePro && plan.annualBonus && (
                      <>
                        <li className="flex items-start gap-2 pb-2 border-b border-gray-200">
                          <div
                            className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                            style={{ backgroundColor: '#D4AF37' }}
                          >
                            <Check className="w-2.5 h-2.5 text-white" />
                          </div>
                          <span className="text-xs font-bold leading-relaxed text-orange-600">
                            {plan.annualBonus}
                          </span>
                        </li>
                        {plan.annualFlyersBonus && (
                          <li className="flex items-start gap-2 pb-2 border-b border-gray-200">
                            <div
                              className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                              style={{ backgroundColor: '#D4AF37' }}
                            >
                              <Check className="w-2.5 h-2.5 text-white" />
                            </div>
                            <span className="text-xs font-bold leading-relaxed text-orange-600">
                              {plan.annualFlyersBonus}
                            </span>
                          </li>
                        )}
                      </>
                    )}
                    {plan.features.map((feature: string, featureIndex: number) => (
                      <li key={featureIndex} className="flex items-start gap-2">
                        <div
                          className="mt-0.5 w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                          style={{ backgroundColor: '#D4AF37' }}
                        >
                          <Check className="w-2.5 h-2.5 text-white" />
                        </div>
                        <span className={`text-xs leading-relaxed ${
                          isElitePro ? 'text-gray-300' :
                          isArtisan || isPremium ? 'text-gray-200' :
                          'text-gray-700'
                        }`}>
                          {feature}
                        </span>
                      </li>
                    ))}
                    </ul>
                  </div>

                  <button
                    onClick={() => {
                      if (isCustom) {
                        setShowQuoteForm(true);
                      } else {
                        const planNameMap: Record<string, string> = {
                          'decouverte': 'Découverte',
                          'artisan': 'Artisan',
                          'premium': 'Premium',
                          'elitePro': 'Elite Pro'
                        };
                        setSelectedPlan(planNameMap[planConfig.key] || 'Premium');
                        setShowRegistration(true);
                      }
                    }}
                    className={`w-full py-3 rounded-lg text-sm font-bold transition-all mt-auto ${
                      isCustom
                        ? 'bg-gray-700 text-white hover:bg-gray-800 shadow-md hover:shadow-lg border-2 border-dashed border-gray-400'
                        : isElitePro
                        ? 'bg-[#D4AF37] text-[#121212] hover:bg-[#C4A027] shadow-md hover:shadow-lg'
                        : isArtisan
                        ? 'bg-[#D4AF37] text-[#4A1D43] hover:bg-[#C4A027] shadow-md hover:shadow-lg'
                        : isPremium
                        ? 'bg-[#D4AF37] text-[#064E3B] hover:bg-[#C4A027] shadow-md hover:shadow-lg'
                        : 'border-2 border-[#D4AF37] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-gray-900 shadow-sm hover:shadow-md'
                    }`}
                  >
                    {isCustom ? t.subscription.requestQuote : `${t.subscription.chooseButton} ${plan.name}`}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {showRegistration && (
        <RegistrationForm
          onClose={() => setShowRegistration(false)}
          selectedPlan={selectedPlan}
        />
      )}

      {showQuoteForm && (
        <QuoteForm onClose={() => setShowQuoteForm(false)} />
      )}
    </div>
  );
};
