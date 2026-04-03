import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { Check, Star, Sparkles } from 'lucide-react';
import { RegistrationForm } from '../components/RegistrationForm';

export const Subscription = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [showRegistration, setShowRegistration] = useState(false);

  const plans = [
    {
      name: 'Basique',
      price: 'Gratuit',
      color: 'from-gray-500 to-gray-700',
      features: [
        'Consultation du répertoire',
        'Recherche de base',
        'Profil d\'entreprise simple',
        'Support par email',
      ],
    },
    {
      name: 'Premium',
      price: '99 TND/mois',
      color: 'from-orange-500 to-red-600',
      popular: true,
      features: [
        'Toutes les fonctionnalités Basiques',
        'Profil entreprise enrichi',
        'Photos et galerie',
        'Statistiques de visibilité',
        'Mise en avant dans les résultats',
        'Badge Premium',
        'Support prioritaire',
      ],
    },
    {
      name: 'Enterprise',
      price: '299 TND/mois',
      color: 'from-blue-600 to-blue-800',
      features: [
        'Toutes les fonctionnalités Premium',
        'Publicité ciblée',
        'API d\'intégration',
        'Gestion multi-emplacements',
        'Rapport analytique détaillé',
        'Gestionnaire de compte dédié',
        'Formation personnalisée',
      ],
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

        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-lg border border-orange-200 overflow-hidden mb-12">
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
              onClick={() => setShowRegistration(true)}
              className="px-8 py-3 bg-orange-600 text-white rounded-md text-sm font-medium hover:bg-orange-700 transition-colors shadow-sm"
            >
              {t.subscription.registerButton}
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-lg border transition-all ${
                plan.popular ? 'border-orange-500 shadow-md' : 'border-gray-200'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-orange-600 text-white px-3 py-1 rounded-full flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  <span className="text-xs font-medium">Populaire</span>
                </div>
              )}

              <div className={`bg-gradient-to-br ${plan.color} text-white p-6 rounded-t-lg`}>
                <h3 className="text-lg font-medium mb-2">{plan.name}</h3>
                <div className="text-3xl font-light mb-1">{plan.price}</div>
                {plan.price !== 'Gratuit' && <p className="text-xs opacity-90">par mois</p>}
              </div>

              <div className="p-6">
                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-start gap-2">
                      <div className={`mt-0.5 w-4 h-4 rounded-full bg-gradient-to-br ${plan.color} flex items-center justify-center flex-shrink-0`}>
                        <Check className="w-2.5 h-2.5 text-white" />
                      </div>
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => setShowRegistration(true)}
                  className={`w-full py-2.5 rounded-md text-sm font-medium transition-all ${
                    plan.popular
                      ? 'bg-orange-600 text-white hover:bg-orange-700'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Choisir {plan.name}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="grid md:grid-cols-3 gap-6 text-center">
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-light text-orange-600 mb-1">1000+</div>
            <p className="text-sm text-gray-600">Entreprises référencées</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-light text-orange-600 mb-1">50,000+</div>
            <p className="text-sm text-gray-600">Visiteurs mensuels</p>
          </div>
          <div className="bg-white rounded-lg border border-gray-200 p-6">
            <div className="text-3xl font-light text-orange-600 mb-1">24/7</div>
            <p className="text-sm text-gray-600">Support disponible</p>
          </div>
        </div>
      </div>

      {showRegistration && <RegistrationForm onClose={() => setShowRegistration(false)} />}
    </div>
  );
};
