import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Shield, Building2, Search, CheckCircle2, ArrowRight, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { searchHealthProfessionals, getEmergencyFacilities, getOnCallPharmaciesLink, searchMedicalTransportProviders } from '../lib/BoltDatabase';
import CityAutocomplete from '../components/CityAutocomplete';
import TransportInscription from './TransportInscription';

type Professional = {
  id: string;
  nom: string;
  ville?: string;
  categories?: string;
  sous_categories?: string;
  telephone?: string;
  site_web?: string;
  photo_url?: string;
  accepte_cnam?: boolean;
};

export default function CitizensHealth() {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [acceptCNAM, setAcceptCNAM] = useState(false);
  const [results, setResults] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [onCallLink, setOnCallLink] = useState<string | null>(null);
  const [emergencies, setEmergencies] = useState<{ name: string; phone?: string; address?: string }[]>([]);
  const [transportCity, setTransportCity] = useState('');
  const [transportProviders, setTransportProviders] = useState<any[]>([]);
  const [loadingTransport, setLoadingTransport] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);

  const isRTL = language === 'ar';

  const emergencyNumbers = useMemo(() => ([
    { num: '190', label: t.health.emergency.samu },
    { num: '198', label: t.health.emergency.civil },
    { num: '197', label: t.health.emergency.police },
  ]), [t]);

  const runSearch = async () => {
    setLoading(true);
    try {
      const data = await searchHealthProfessionals({
        specialty,
        city,
        acceptCNAM,
        limit: 30
      });
      setResults(data ?? []);
    } finally {
      setLoading(false);
    }
  };

  const searchTransport = async () => {
    setLoadingTransport(true);
    try {
      const data = await searchMedicalTransportProviders({
        city: transportCity,
        limit: 20
      });
      setTransportProviders(data ?? []);
    } finally {
      setLoadingTransport(false);
    }
  };

  useEffect(() => {
    // Précharger pharmacies de garde (lien) + établissements 24/7
    (async () => {
      const link = await getOnCallPharmaciesLink();
      setOnCallLink(link);

      const em = await getEmergencyFacilities();
      setEmergencies(em ?? []);
    })();

    // Charger un premier échantillon
    runSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Bloc 1 — Accroche */}
      <section className="px-4 pt-14">
        <div className="max-w-5xl mx-auto text-center">
          <motion.h1
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-3xl md:text-5xl font-light text-gray-900"
            style={{ fontFamily: "'Playfair Display', serif" }}
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {t.health.title}
          </motion.h1>
          <motion.p
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05, duration: 0.5 }}
            className="text-gray-600 text-lg md:text-xl mt-4 font-light max-w-3xl mx-auto"
            dir={isRTL ? 'rtl' : 'ltr'}
          >
            {t.health.intro}
          </motion.p>
        </div>
      </section>

      {/* Bloc 2 — Urgences */}
      <section className="px-4 py-8">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-rose-50 to-red-50 border border-red-100 rounded-2xl p-6 md:p-8 shadow-sm">
            <div className="text-center mb-6">
              <h2 className="text-2xl font-light text-red-700">{t.health.emergency.title}</h2>
              <p className="text-sm text-red-600/80 mt-1">{t.health.emergency.subtitle}</p>
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-3 md:gap-4">
              {emergencyNumbers.map((n, i) => (
                <a
                  key={i}
                  href={`tel:${n.num}`}
                  className="bg-white/70 hover:bg-white/90 backdrop-blur-md rounded-xl px-5 py-3 border border-red-200 transition-all flex flex-col items-center shadow-sm hover:shadow-md w-full md:w-[180px]"
                >
                  <div className="text-xl font-semibold text-red-700 leading-none">{n.num}</div>
                  <div className="text-xs text-red-600/90 mt-1">{n.label}</div>
                </a>
              ))}
            </div>

            <div className="mt-6 grid md:grid-cols-2 gap-4">
              <div className="bg-white rounded-xl border border-red-100 p-4">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <Shield className="w-4 h-4" />
                  <span className="text-sm font-medium">{t.health.emergency.pharmacy.title}</span>
                </div>
                <p className="text-sm text-gray-600">
                  {onCallLink
                    ? <a className="text-red-700 hover:underline" href={onCallLink} target="_blank" rel="noreferrer">{t.health.emergency.pharmacy.cta}</a>
                    : <span className="text-gray-500">Lien local à configurer</span>
                  }
                </p>
              </div>

              <div className="bg-white rounded-xl border border-red-100 p-4">
                <div className="flex items-center gap-2 text-red-700 mb-2">
                  <Building2 className="w-4 h-4" />
                  <span className="text-sm font-medium">{t.health.emergency.hotlinesTitle}</span>
                </div>
                <ul className="text-sm text-gray-700 space-y-1">
                  {emergencies.length === 0 ? (
                    <li className="text-gray-500">À compléter (Supabase)</li>
                  ) : emergencies.map((e, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="mt-0.5">•</span>
                      <span>
                        <span className="font-medium">{e.name}</span>{e.address ? ` — ${e.address}` : ''}
                        {e.phone && (
                          <>
                            {' · '}
                            <a href={`tel:${e.phone}`} className="text-red-700 hover:underline">{e.phone}</a>
                          </>
                        )}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bloc 3 — Moteur de recherche pro santé */}
      <section className="px-4 pb-12">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white/90 backdrop-blur rounded-2xl border border-gray-200 shadow-sm p-4 md:p-5">
            <div className={`flex flex-col md:flex-row items-stretch gap-3 ${isRTL ? 'md:flex-row-reverse' : ''}`} dir={isRTL ? 'rtl' : 'ltr'}>
              <div className="relative flex-1">
                <span className="absolute inset-y-0 left-3 flex items-center">
                  <Search className="w-4 h-4 text-gray-400" />
                </span>
                <input
                  value={specialty}
                  onChange={(e) => setSpecialty(e.target.value)}
                  placeholder={t.health.search.specialtyPlaceholder}
                  className="w-full pl-9 pr-3 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none text-sm"
                />
              </div>
              <div className="md:w-72">
                <CityAutocomplete
                  value={city}
                  onChange={setCity}
                  placeholder={t.health.search.cityPlaceholder}
                />
              </div>
              <label className={`inline-flex items-center gap-2 select-none ${isRTL ? 'md:flex-row-reverse' : ''}`}>
                <input
                  type="checkbox"
                  className="rounded border-gray-300"
                  checked={acceptCNAM}
                  onChange={(e) => setAcceptCNAM(e.target.checked)}
                />
                <span className="text-sm text-gray-700">{t.health.search.cnAmLabel}</span>
              </label>
              <div className={`flex ${isRTL ? 'flex-row-reverse' : ''} gap-2`}>
                <button
                  onClick={runSearch}
                  className="px-5 py-3 rounded-lg bg-orange-600 text-white text-sm font-medium hover:bg-orange-700 transition shadow-sm inline-flex items-center gap-2"
                >
                  {t.health.search.searchBtn}
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => { setSpecialty(''); setCity(''); setAcceptCNAM(false); runSearch(); }}
                  className="px-4 py-3 rounded-lg bg-white text-gray-700 text-sm font-medium border border-gray-200 hover:bg-gray-50 transition"
                >
                  {t.health.search.reset}
                </button>
              </div>
            </div>
          </div>

          {/* Résultats */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg md:text-xl font-medium text-gray-900">{t.health.search.resultsTitle}</h3>
              <span className="text-sm text-gray-500">{loading ? '…' : `${results.length}`}</span>
            </div>

            {(!loading && results.length === 0) ? (
              <p className="text-sm text-gray-500">{t.health.search.noResults}</p>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {results.map((p) => (
                  <motion.div
                    key={p.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-200 p-4 hover:shadow-sm transition"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-lg bg-gray-100 overflow-hidden">
                        {p.photo_url
                          ? <img src={p.photo_url} alt={p.nom} className="w-full h-full object-cover" />
                          : <div className="w-full h-full grid place-items-center text-gray-400">🏥</div>}
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900 leading-tight">{p.nom}</div>
                        <div className="text-xs text-gray-500">
                          {[p.ville, p.sous_categories || p.categories].filter(Boolean).join(' · ')}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center gap-2 text-xs text-gray-600">
                      {p.accepte_cnam && (
                        <span className="inline-flex items-center gap-1 text-emerald-700">
                          <CheckCircle2 className="w-4 h-4" /> CNAM
                        </span>
                      )}
                    </div>

                    <div className="mt-3 flex items-center gap-3">
                      {p.telephone && (
                        <a href={`tel:${p.telephone}`} className="text-sm inline-flex items-center gap-2 text-orange-700 hover:underline">
                          <Phone className="w-4 h-4" /> {t.health.search.call}
                        </a>
                      )}
                      {p.site_web && (
                        <a href={p.site_web} target="_blank" rel="noreferrer" className="text-sm text-gray-700 hover:underline">
                          {t.health.search.website}
                        </a>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Bloc Transport Médical */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto bg-white rounded-2xl border border-gray-200 shadow-sm p-8">
          <div className="text-center mb-8">
            <h2 className="text-2xl font-light text-gray-900 mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
              🚑 Transport Médical
            </h2>
            <p className="text-gray-600 text-base font-light max-w-2xl mx-auto">
              Vous avez besoin d'un véhicule adapté ou d'un transfert médical ?
              Trouvez rapidement un transporteur agréé ou inscrivez-vous pour proposer vos services.
            </p>
          </div>

          {/* Recherche des prestataires existants */}
          <div className="mb-10">
            <div className="flex flex-col md:flex-row items-stretch gap-3">
              <CityAutocomplete
                value={transportCity}
                onChange={setTransportCity}
                placeholder="Ville (ex : Mahdia, Sousse...)"
              />
              <button
                onClick={searchTransport}
                disabled={loadingTransport}
                className="px-6 py-3 bg-orange-600 text-white rounded-lg font-medium hover:bg-orange-700 transition disabled:opacity-50"
              >
                {loadingTransport ? 'Recherche...' : 'Rechercher'}
              </button>
            </div>

            {/* Affichage des prestataires */}
            {transportProviders.length > 0 ? (
              <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {transportProviders.map((provider) => (
                  <motion.div
                    key={provider.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gray-50 rounded-xl border border-gray-200 p-4"
                  >
                    <div className="text-base font-semibold text-gray-900 mb-1">{provider.name}</div>
                    <div className="text-sm text-gray-500 mb-2">
                      {provider.city} {provider.vehicle_type && `· ${provider.vehicle_type}`}
                      {provider.sous_categories && `· ${provider.sous_categories}`}
                    </div>
                    {provider.phone && (
                      <a href={`tel:${provider.phone}`} className="text-sm text-orange-700 hover:underline inline-flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {provider.phone}
                      </a>
                    )}
                    {provider.is_cnam_approved && (
                      <div className="mt-2">
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-700">
                          <CheckCircle2 className="w-3 h-3" /> Agréé CNAM
                        </span>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            ) : !loadingTransport && transportCity && (
              <div className="mt-6 text-center text-sm text-gray-500">
                Aucun transporteur trouvé pour cette ville. Essayez une autre recherche.
              </div>
            )}</div>

          {/* Formulaire d'inscription des prestataires */}
          <div className="border-t border-gray-100 pt-8 text-center">
            <h3 className="text-lg font-medium text-gray-800 mb-3">Vous avez un véhicule adapté ?</h3>
            <p className="text-gray-600 text-sm mb-6">
              Rejoignez le réseau Dalil Tounes et aidez les citoyens à accéder plus facilement aux soins.
            </p>
            <button
              onClick={() => setShowTransportModal(true)}
              className="px-8 py-3 rounded-lg bg-gradient-to-r from-red-600 to-orange-600 text-white text-sm font-medium hover:shadow-lg transition-all"
            >
              S'inscrire comme prestataire
            </button>
          </div>
        </div>
      </section>

      {/* Modal d'inscription transporteur */}
      {showTransportModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowTransportModal(false)}
              className="absolute top-4 right-4 z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <TransportInscription />
          </div>
        </div>
      )}

      {/* Bloc 4 — Guides */}
      <section className="px-4 pb-16">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="text-base font-medium text-gray-900 mb-2">{t.health.info.cnamTitle}</h4>
            <p className="text-sm text-gray-600">{t.health.info.cnamBody}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="text-base font-medium text-gray-900 mb-2">{t.health.info.csbTitle}</h4>
            <p className="text-sm text-gray-600">{t.health.info.csbBody}</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-5">
            <h4 className="text-base font-medium text-gray-900 mb-2">{t.health.info.tipsTitle}</h4>
            <p className="text-sm text-gray-600">{t.health.info.tipsBody}</p>
          </div>
        </div>
      </section>
    </div>
  );
}
