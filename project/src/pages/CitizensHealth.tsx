import { useEffect, useMemo, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Phone, Shield, Building2, CheckCircle2, ArrowRight, X, Plus } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { getEmergencyFacilities, getOnCallPharmaciesLink, searchMedicalTransportProviders } from '../lib/BoltDatabase';
import LocationSelectTunisie from '../components/LocationSelectTunisie';
import SpecialtyAutocomplete from '../components/SpecialtyAutocomplete';
import VehicleTypeAutocomplete from '../components/VehicleTypeAutocomplete';
import TransportInscription from './TransportInscription';
import SearchBar from '../components/SearchBar';
import HealthSearchBar from '../components/HealthSearchBar';
import MedicalTransportSearchBar, { TransportFilters } from '../components/MedicalTransportSearchBar';
import MedicalTransportCard from '../components/MedicalTransportCard';
import MedicalTransportRegistrationForm from '../components/MedicalTransportRegistrationForm';
import { readParams } from '../lib/urlParams';
import { supabase } from '../lib/supabaseClient';
import { Tables } from '../lib/dbTables';
import { getSupabaseImageUrl } from '../lib/imageUtils';
import BackButton from '../components/BackButton';
import CategorySearchBar from '../components/CategorySearchBar';
import UnifiedBusinessCard from '../components/UnifiedBusinessCard';
import { BusinessCard } from '../components/BusinessCard';
import { BusinessDetail } from '../components/BusinessDetail';
import { useNavigate } from '../lib/url';

type Professional = {
  id: string;
  nom: string;
  ville?: string;
  categorie?: string;
  sous_categories?: string;
  telephone?: string;
  site_web?: string;
  photo_url?: string;
  accepte_cnam?: boolean;
};

interface CitizensHealthProps {
  onNavigate?: (page: any) => void;
}

export default function CitizensHealth({ onNavigate }: CitizensHealthProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const navigate = useNavigate();

  const [results, setResults] = useState<Professional[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [onCallLink, setOnCallLink] = useState<string | null>(null);
  const [emergencies, setEmergencies] = useState<{ name: string; phone?: string; address?: string }[]>([]);
  const [transportCity, setTransportCity] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [transportProviders, setTransportProviders] = useState<any[]>([]);
  const [loadingTransport, setLoadingTransport] = useState(false);
  const [showTransportModal, setShowTransportModal] = useState(false);
  const [specialty, setSpecialty] = useState('');
  const [city, setCity] = useState('');
  const [acceptCNAM, setAcceptCNAM] = useState(false);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedGouvernorat, setSelectedGouvernorat] = useState('');
  const [selectedSanteCategory, setSelectedSanteCategory] = useState('');
  const [filteredBusinesses, setFilteredBusinesses] = useState<any[]>([]);
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);

  const resultsRef = useRef<HTMLDivElement>(null);

  const isRTL = language === 'ar';
  const { q, ville } = readParams();

  const hasActiveSearch = !!searchTerm || !!selectedGouvernorat || !!selectedSanteCategory;

  const emergencyNumbers = useMemo(() => ([
    { num: '190', label: t.health.emergency.samu },
    { num: '198', label: t.health.emergency.civil },
    { num: '197', label: t.health.emergency.police },
  ]), [t]);

  const runSearch = async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from(Tables.ENTREPRISE)
        .select('id, nom, secteur, "sous-catégories", "catégorie", gouvernorat, ville, adresse, telephone, email, site_web, description, services, image_url, logo_url, "statut Abonnement", "niveau priorité abonnement", "mots cles recherche", "Lien Instagram", "lien facebook", "Lien TikTok", "Lien LinkedIn", "Lien YouTube", lien_x, horaires_ok, "liste pages"')
        .contains('"liste pages"', ['santé'])
        .order('"niveau priorité abonnement"', { ascending: false, nullsFirst: false })
        .order('nom', { ascending: true })
        .limit(200);

      if (selectedGouvernorat) {
        query = query.eq('gouvernorat', selectedGouvernorat);
      }

      if (selectedSanteCategory) {
        query = query.contains('"sous-catégories"', [selectedSanteCategory]);
      }

      if (searchTerm && searchTerm.trim().length > 0) {
        const searchPattern = `%${searchTerm.trim()}%`;
        query = query.or(`nom.ilike.${searchPattern},"mots cles recherche".ilike.${searchPattern},description.ilike.${searchPattern}`);
      }

      const { data, error: err } = await query;
      console.log('DEBUG SANTE RESULTATS', { data, error: err, count: data?.length });

      if (err) {
        setError(err.message);
        setFilteredBusinesses([]);
      } else {
        const mappedData = (data || []).map((item: any) => ({
          id: item.id,
          name: item.nom || '',
          category: Array.isArray(item['sous-catégories']) ? item['sous-catégories'].join(', ') : (item['sous-catégories'] || ''),
          subCategories: Array.isArray(item['sous-catégories']) ? item['sous-catégories'].join(', ') : (item['sous-catégories'] || ''),
          gouvernorat: item.gouvernorat || '',
          secteur: Array.isArray(item.secteur) ? item.secteur.join(', ') : (item.secteur || ''),
          city: item.ville || '',
          address: item.adresse || '',
          phone: item.telephone || '',
          email: item.email || '',
          website: item.site_web || '',
          description: item.description || '',
          services: item.services || '',
          imageUrl: item.image_url || null,
          logoUrl: item.logo_url || null,
          statut_abonnement: item['statut Abonnement'] || null,
          'niveau priorité abonnement': item['niveau priorité abonnement'] || null,
          badges: [],
          mots_cles_recherche: item['mots cles recherche'] || '',
          instagram: item['Lien Instagram'] || '',
          facebook: item['lien facebook'] || '',
          tiktok: item['Lien TikTok'] || '',
          linkedin: item['Lien LinkedIn'] || '',
          youtube: item['Lien YouTube'] || '',
          lien_x: item.lien_x || '',
          horaires_ok: item.horaires_ok || null,
        }));
        setFilteredBusinesses(mappedData);
      }

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } finally {
      setLoading(false);
    }
  };

  const searchTransport = async (filters: TransportFilters) => {
    setLoadingTransport(true);
    try {
      let query = supabase
        .from('medical_transport_providers')
        .select('*')
        .order('est_premium', { ascending: false })
        .order('created_at', { ascending: false });

      if (filters.gouvernorat) {
        query = query.eq('governorate', filters.gouvernorat);
      }

      if (filters.vehicleType) {
        query = query.eq('vehicle_type', filters.vehicleType);
      }

      if (filters.urgenceOnly) {
        query = query.eq('vehicle_type', 'Ambulance').eq('est_disponible_nuit', true);
      }

      const { data, error } = await query.limit(50);

      if (error) {
        console.error('Error fetching transport providers:', error);
        setTransportProviders([]);
      } else {
        setTransportProviders(data ?? []);
      }
    } finally {
      setLoadingTransport(false);
    }
  };

  // Garde anti-boucle pour CitizensHealth
  const prevHealthSearchRef = useRef({ searchTerm: '', selectedGouvernorat: '', selectedSanteCategory: '' });
  const healthFetchAttemptsRef = useRef(0);
  const MAX_HEALTH_ATTEMPTS = 3;

  useEffect(() => {
    // Garde: Limiter les tentatives
    if (healthFetchAttemptsRef.current >= MAX_HEALTH_ATTEMPTS) {
      console.warn('⚠️ [CitizensHealth] Limite de tentatives atteinte');
      return;
    }

    // Garde: Vérifier changement réel
    const hasRealChange =
      prevHealthSearchRef.current.searchTerm !== searchTerm ||
      prevHealthSearchRef.current.selectedGouvernorat !== selectedGouvernorat ||
      prevHealthSearchRef.current.selectedSanteCategory !== selectedSanteCategory;

    if (!hasRealChange) {
      return;
    }

    prevHealthSearchRef.current = { searchTerm, selectedGouvernorat, selectedSanteCategory };
    healthFetchAttemptsRef.current += 1;

    const delayDebounceFn = setTimeout(() => {
      if (searchTerm || selectedGouvernorat || selectedSanteCategory) {
        runSearch();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedGouvernorat, selectedSanteCategory]);

  useEffect(() => {
    (async () => {
      const link = await getOnCallPharmaciesLink();
      setOnCallLink(link);

      const em = await getEmergencyFacilities();
      setEmergencies(em ?? []);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      {/* Hero Banner - Header Compact avec overlay bordeaux */}
      <section className="relative w-full overflow-hidden rounded-b-3xl shadow-lg">
        <img
          src={getSupabaseImageUrl('sante.jpg')}
          alt="Soins médicaux et urgences en Tunisie"
          className="w-full h-[240px] object-cover"
        />
        {/* Overlay bordeaux léger */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4A1D43]/40 to-[#6B2D5C]/30"></div>

        {/* Bouton Retour en haut à gauche */}
        {onNavigate && (
          <button
            onClick={() => onNavigate({ page: 'citizens' })}
            className="absolute top-4 left-4 inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-[#D4AF37] bg-[#4A1D43]/80 text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#4A1D43] transition-all duration-300 shadow-lg backdrop-blur-sm z-10"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <ArrowRight className="w-4 h-4 rotate-180" />
            <span className="text-sm font-medium">Retour aux catégories</span>
          </button>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <motion.h1
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-4xl md:text-5xl font-light text-[#D4AF37] mb-3 drop-shadow-lg"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            Santé
          </motion.h1>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="text-base md:text-lg font-light text-white/95 max-w-3xl leading-relaxed drop-shadow-lg"
          >
            {t.health.hero.description}
          </motion.p>
        </div>
      </section>

      {/* Barre de recherche */}
      <section className="px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <CategorySearchBar
            listePageValue="santé"
            placeholder={language === 'fr' ? 'Rechercher un professionnel de santé...' : language === 'ar' ? 'البحث عن مهني صحي...' : 'Search for a healthcare professional...'}
            onSelectBusiness={(businessId) => navigate(`/business/${businessId}`)}
            onSearch={(query, ville) => {
              setSearchTerm(query);
              setSelectedGouvernorat(ville);
            }}
          />
        </div>
      </section>

      {/* Section santé */}
      <section className="px-4 py-4">
        <div className="max-w-5xl mx-auto">

          {error && <div className="mt-4 text-red-600">{t.common.error}: {error}</div>}

          {/* Résultats de recherche - affichés immédiatement après la barre si recherche active */}
          {hasActiveSearch && (
            <div ref={resultsRef} className="mt-8">
              {loading ? (
                <div className="text-center py-12">
                  <div className="inline-block w-8 h-8 border-2 border-[#4A1D43] border-t-transparent rounded-full animate-spin"></div>
                  <p className="mt-3 text-sm text-[#4A1D43]">Recherche en cours...</p>
                </div>
              ) : filteredBusinesses.length === 0 ? (
                <div className="text-center py-12">
                  <Building2 className="w-12 h-12 text-[#D4AF37]/50 mx-auto mb-3" />
                  <p className="text-sm text-[#4A1D43]">Aucun résultat trouvé</p>
                </div>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="text-2xl font-light text-[#4A1D43]" style={{ fontFamily: "'Playfair Display', serif" }}>
                      Résultats de votre recherche
                      <span className="ml-2 text-base text-[#D4AF37]">
                        ({filteredBusinesses.length} {filteredBusinesses.length > 1 ? 'résultats' : 'résultat'})
                      </span>
                    </h3>
                    <button
                      onClick={() => {
                        setSearchTerm('');
                        setSelectedGouvernorat('');
                        setSelectedSanteCategory('');
                        setFilteredBusinesses([]);
                      }}
                      className="px-4 py-2 rounded-lg border border-[#D4AF37] text-[#4A1D43] hover:bg-[#4A1D43] hover:text-[#D4AF37] transition-all text-sm"
                    >
                      Réinitialiser
                    </button>
                  </div>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredBusinesses.map((business) => (
                      <motion.div
                        key={business.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => {
                          console.log('--- CARTE UNIFIÉE CHARGÉE ---');
                          console.log('🔵 CLIC SANTÉ - ID:', business.id, 'Nom:', business.nom || business.name);
                          setSelectedBusiness(business);
                        }}
                        className="bg-white rounded-xl border-2 border-[#D4AF37] hover:shadow-2xl transition-all cursor-pointer overflow-hidden group"
                      >
                        {business.image_url && (
                          <div className="w-full h-32 bg-gradient-to-br from-[#4A1D43]/10 to-[#D4AF37]/10 overflow-hidden">
                            <img
                              src={business.image_url}
                              alt={business.nom || business.name}
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                              onError={(e) => { e.currentTarget.style.display = 'none'; }}
                            />
                          </div>
                        )}
                        <div className="p-4 bg-gradient-to-br from-white to-[#4A1D43]/5">
                          <h3 className="font-bold text-[#4A1D43] mb-1 text-base group-hover:text-[#D4AF37] transition-colors" style={{ fontFamily: "'Playfair Display', serif" }}>
                            {business.nom || business.name}
                          </h3>
                          <p className="text-sm text-gray-700 font-medium">{business.subCategories || business.category}</p>
                          {(business.ville || business.city) && (
                            <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                              <MapPin className="w-3 h-3 text-[#D4AF37]" />
                              {business.ville || business.city}
                            </p>
                          )}
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* Bloc Urgences - Charte Bordeaux/Or - Version compacte */}
      <section className="px-4 pt-2 pb-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-br from-[#4A1D43]/5 to-[#D4AF37]/5 border border-[#D4AF37] rounded-xl px-3 py-3 shadow-lg">
            <div className="text-center mb-2">
              <h2 className="text-xl font-light text-[#4A1D43]" style={{ fontFamily: "'Playfair Display', serif" }}>{t.health.emergency.title}</h2>
              <p className="text-[10px] text-gray-600 mt-0.5">{t.health.emergency.subtitle}</p>
            </div>

            <div className="flex flex-col md:flex-row justify-center gap-2">
              {emergencyNumbers.map((n, i) => (
                <a
                  key={i}
                  href={`tel:${n.num}`}
                  className="bg-[#4A1D43] hover:bg-[#5A2D53] rounded-lg px-3 py-2 border border-[#D4AF37] transition-all duration-300 flex flex-col items-center shadow-md hover:shadow-xl w-full md:w-[140px]"
                >
                  <Phone className="w-4 h-4 text-[#D4AF37] mb-1" />
                  <div className="text-lg font-semibold text-[#D4AF37] leading-none">{n.num}</div>
                  <div className="text-[10px] text-white/90 mt-1">{n.label}</div>
                </a>
              ))}
            </div>

            <div className="mt-2 grid md:grid-cols-2 gap-2">
              <div className="bg-white rounded-lg border border-[#D4AF37] px-2 py-2 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-1.5 text-[#4A1D43] mb-1">
                  <Shield className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-[11px] font-medium">{t.health.emergency.pharmacy.title}</span>
                </div>
                <p className="text-[10px] text-gray-600">
                  {onCallLink
                    ? <a className="text-[#4A1D43] hover:text-[#D4AF37] underline font-medium transition-colors" href={onCallLink} target="_blank" rel="noreferrer">{t.health.emergency.pharmacy.cta}</a>
                    : <span className="text-gray-500">{t.health.emergency.pharmacy.configureLink}</span>
                  }
                </p>
              </div>

              <div className="bg-white rounded-lg border border-[#D4AF37] px-2 py-2 hover:shadow-lg transition-all duration-300">
                <div className="flex items-center gap-1.5 text-[#4A1D43] mb-1">
                  <Building2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span className="text-[11px] font-medium">{t.health.emergency.hotlinesTitle}</span>
                </div>
                <ul className="text-[10px] text-gray-700 space-y-0.5">
                  {emergencies.length === 0 ? (
                    <li className="text-gray-500">{t.health.emergency.toComplete}</li>
                  ) : emergencies.map((e, idx) => (
                    <li key={idx} className="flex items-start gap-1.5">
                      <span className="mt-0.5 text-[#D4AF37]">•</span>
                      <span>
                        <span className="font-medium text-[#4A1D43]">{e.name}</span>{e.address ? ` — ${e.address}` : ''}
                        {e.phone && (
                          <>
                            {' · '}
                            <a href={`tel:${e.phone}`} className="text-[#4A1D43] hover:text-[#D4AF37] underline transition-colors">{e.phone}</a>
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


      {/* Bloc Transport Médical - Charte Bordeaux/Or - Version compacte */}
      <section className="px-4 pb-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Transport */}
          <div className="relative h-32 rounded-xl overflow-hidden mb-4 shadow-lg border border-[#D4AF37]">
            <img
              src={getSupabaseImageUrl('sante_banner.webp')}
              alt="Ambulance en urgence"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-[#4A1D43]/90 to-[#6B2D5C]/80"></div>
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-xl md:text-2xl font-light text-[#D4AF37] mb-1 drop-shadow-lg" style={{ fontFamily: "'Playfair Display', serif" }}>
                  🚑 Transport Médical
                </h2>
                <p className="text-white/95 text-xs md:text-sm font-light max-w-2xl mx-auto drop-shadow leading-snug">
                  Ambulances, taxis médicaux et transports adaptés disponibles 24h/7j. Trouvez rapidement un véhicule ou inscrivez-vous comme prestataire.
                </p>
              </motion.div>
            </div>
          </div>

          {/* Barre de recherche intelligente */}
          <MedicalTransportSearchBar
            onSearch={searchTransport}
            loading={loadingTransport}
          />

          {/* Résultats */}
          {loadingTransport ? (
            <div className="text-center py-16">
              <div className="inline-block w-12 h-12 border-4 border-[#4A1D43] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-[#4A1D43]">Recherche des prestataires...</p>
            </div>
          ) : transportProviders.length > 0 ? (
            <div className="mt-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-light text-[#4A1D43]" style={{ fontFamily: "'Playfair Display', serif" }}>
                  {transportProviders.length} prestataire{transportProviders.length > 1 ? 's' : ''} disponible{transportProviders.length > 1 ? 's' : ''}
                </h3>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {transportProviders.map((provider) => (
                  <MedicalTransportCard key={provider.id} provider={provider} />
                ))}
              </div>
            </div>
          ) : (
            <div className="mt-8 text-center py-12 bg-white rounded-xl border border-[#D4AF37]">
              <Building2 className="w-16 h-16 text-[#D4AF37]/50 mx-auto mb-4" />
              <p className="text-[#4A1D43] mb-2 font-medium">Aucun prestataire trouvé</p>
              <p className="text-sm text-gray-500">Essayez de modifier vos critères de recherche</p>
            </div>
          )}

          {/* CTA Inscription - Charte Bordeaux/Or */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="mt-8 bg-gradient-to-br from-[#4A1D43]/5 to-[#D4AF37]/5 border-2 border-[#D4AF37] rounded-2xl p-6 text-center shadow-lg"
          >
            <div className="max-w-2xl mx-auto">
              <h3 className="text-2xl font-light text-[#4A1D43] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>
                Vous avez un véhicule adapté ?
              </h3>
              <p className="text-gray-700 text-sm mb-4 leading-relaxed">
                Rejoignez notre réseau de prestataires de transport médical et aidez les citoyens à accéder plus facilement aux soins.
                Inscription gratuite et simple.
              </p>
              <button
                onClick={() => setShowTransportModal(true)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#4A1D43] text-[#D4AF37] text-sm font-semibold border border-[#D4AF37] hover:bg-[#5A2D53] hover:shadow-xl transition-all duration-300 transform hover:scale-105"
              >
                <Plus className="w-4 h-4" />
                S'inscrire comme prestataire
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Modal d'inscription transporteur */}
      {showTransportModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="relative bg-white rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <button
              onClick={() => setShowTransportModal(false)}
              className="sticky top-4 right-4 float-right z-10 p-2 rounded-full bg-gray-100 hover:bg-gray-200 transition"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
            <MedicalTransportRegistrationForm
              onSuccess={() => {
                setTimeout(() => setShowTransportModal(false), 2500);
              }}
              onCancel={() => setShowTransportModal(false)}
            />
          </motion.div>
        </div>
      )}

      {/* Bloc Guides - Charte Bordeaux/Or */}
      <section className="px-4 pb-12">
        <div className="max-w-5xl mx-auto grid md:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-[#D4AF37] p-4 hover:shadow-lg transition-all duration-300">
            <h4 className="text-sm font-medium text-[#4A1D43] mb-1.5" style={{ fontFamily: "'Playfair Display', serif" }}>{t.health.info.cnamTitle}</h4>
            <p className="text-xs text-gray-700">{t.health.info.cnamBody}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#D4AF37] p-4 hover:shadow-lg transition-all duration-300">
            <h4 className="text-sm font-medium text-[#4A1D43] mb-1.5" style={{ fontFamily: "'Playfair Display', serif" }}>{t.health.info.csbTitle}</h4>
            <p className="text-xs text-gray-700">{t.health.info.csbBody}</p>
          </div>
          <div className="bg-white rounded-xl border border-[#D4AF37] p-4 hover:shadow-lg transition-all duration-300">
            <h4 className="text-sm font-medium text-[#4A1D43] mb-1.5" style={{ fontFamily: "'Playfair Display', serif" }}>{t.health.info.tipsTitle}</h4>
            <p className="text-xs text-gray-700">{t.health.info.tipsBody}</p>
          </div>
        </div>
      </section>

      {/* Modal de détails entreprise */}
      {selectedBusiness && (
        <>
          {console.log('🟡 AFFICHAGE MODAL SANTÉ - Business:', selectedBusiness.nom)}
          <BusinessDetail
            business={selectedBusiness}
            onClose={() => setSelectedBusiness(null)}
            asModal={true}
          />
        </>
      )}
    </div>
  );
}
