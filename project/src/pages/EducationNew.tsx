import { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  GraduationCap,
  Search,
  MapPin,
  Award,
  Users,
  Euro,
  Bus,
  Star,
  ChevronDown,
  Filter,
  FileText,
  Briefcase,
  Globe,
  CheckCircle2,
  TrendingUp,
  Video,
  Navigation,
  Clock,
  Plus,
  X,
  Utensils,
  Home as HomeIcon,
  ArrowLeft,
  Calendar,
  Loader2,
  Tag
} from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { supabase } from '../lib/supabaseClient';
import { Tables } from '../lib/dbTables';
import CityAutocomplete from '../components/CityAutocomplete';
import EducationCompare from '../components/EducationCompare';
import SearchBar from '../components/SearchBar';
import EducationSearchBar from '../components/EducationSearchBar';
import { getEducationCategoryLabel } from '../lib/educationCategories';
import { readParams } from '../lib/urlParams';
import { UnifiedBusinessCard } from '../components/UnifiedBusinessCard';
import { useNavigate } from '../lib/url';
import { getSupabaseImageUrl } from '../lib/imageUtils';
import BackButton from '../components/BackButton';
import CategorySearchBar from '../components/CategorySearchBar';
import { BusinessCard } from '../components/BusinessCard';
import { BusinessDetail } from '../components/BusinessDetail';

interface Etablissement {
  id: string;
  nom: string;
  type_etablissement: string;
  niveau_etude: string;
  systeme_enseignement: string;
  langue_principale: string;
  frais_scolarite_range: string;
  frais_min?: number;
  frais_max?: number;
  adresse: string;
  ville: string;
  delegation: string;
  telephone: string;
  email: string;
  site_web: string;
  description: string;
  accreditations: string[];
  homologue_francais: boolean;
  homologation_etrangere: boolean;
  agrement_ministre: boolean;
  ratio_eleves_enseignant?: number;
  ratio_eleves_prof?: number;
  taux_reussite_bac?: number;
  transport_scolaire: boolean;
  cantine: boolean;
  internat: boolean;
  latitude?: number;
  longitude?: number;
  note_moyenne: number;
  nombre_avis: number;
  niveau_abonnement: number;
  services_inclus?: string[];
  annee_fondation?: number;
  capacite_accueil?: number;
  langues_enseignees?: string[];
  activites_extra?: string[];
  lien_video_visite?: string;
  photos?: string[];
}

interface JobOffer {
  id: string;
  titre: string;
  entreprise: string;
  ville: string;
  type_contrat: string;
  created_at: string;
}

const translations = {
  fr: {
    title: "Éducation & Formation : Trouvez l'établissement idéal",
    welcome: "Votre guide complet pour l'éducation en Tunisie. De la maternelle à l'université, et pour la formation continue, Dalil Tounes vous aide à choisir le meilleur parcours. Comparez les programmes, consultez les avis des parents, et inscrivez vos enfants en toute confiance.",
    searchPlaceholder: "École primaire, Lycée, Cours de langue, Université...",
    cityPlaceholder: "Dans quelle ville / délégation ?",
    yourAddress: "Votre adresse pour calculer les distances",
    calculateDistance: "Calculer",
    searchBtn: "Rechercher",
    resetBtn: "Réinitialiser",
    filters: "Filtres",
    compare: "Comparer",
    compareSelected: "Comparer les établissements sélectionnés",
    selectToCompare: "Sélectionner pour comparer",
    selected: "sélectionné(s)",
    maxSelection: "Maximum 3 établissements",
    distance: "Distance",
    travelTime: "Temps estimé",
    minutes: "min",
    typeOptions: {
      all: "Tous",
      public: "Public",
      prive: "Privé",
      international: "International/Homologué"
    },
    niveauOptions: {
      all: "Tous niveaux",
      creche: "Crèche",
      primaire: "Primaire",
      lycee: "Lycée",
      superieur: "Supérieur"
    },
    langueOptions: {
      all: "Toutes",
      francais: "Français",
      anglais: "Anglais",
      arabe: "Arabe",
      autre: "Autre"
    },
    prixOptions: {
      all: "Tous",
      faible: "Frais faibles",
      moyen: "Frais moyens",
      eleve: "Frais élevés"
    },
    systemFilter: "Système & Langue",
    systemOptions: {
      all: "Tous les systèmes",
      francais: "Français (Mission)",
      anglais: "Anglais (IB/Cambridge)",
      arabe: "Arabe (National)",
      allemand: "Allemand",
      autre: "Autre International"
    },
    results: "résultats",
    noResults: "Aucun établissement trouvé",
    homologue: "Homologué Français",
    homologueEtr: "Homologation Étrangère",
    agrementMin: "Agrément Ministère",
    ratio: "Ratio",
    tauxReussite: "Taux réussite BAC",
    transport: "Transport scolaire",
    cantine: "Cantine",
    internat: "Internat",
    avis: "avis",
    virtualTour: "Visite virtuelle disponible",
    founded: "Fondé en",
    adminBlock: {
      title: "Documents requis pour l'inscription",
      desc: "Trouvez les démarches administratives nécessaires",
      link: "Accéder à la section Administrative"
    },
    partnerBlock: {
      title: "Portes Ouvertes & Événements",
      desc: "Découvrez les événements organisés par nos établissements partenaires",
      link: "Voir les événements"
    },
    careersBlock: {
      title: "Carrières dans l'Éducation",
      desc: "Découvrez les dernières opportunités d'emploi dans le secteur éducatif",
      noJobs: "Aucune offre disponible pour le moment",
      viewAll: "Voir toutes les offres d'emploi"
    }
  },
  en: {
    title: "Education & Training: Find the Ideal Institution",
    welcome: "Your complete guide to education in Tunisia. From kindergarten to university, and for all continuous training, Dalil Tounes helps you choose the best path. Compare programs, check parent reviews, and register your children with confidence.",
    searchPlaceholder: "Primary School, High School, Language Course, University...",
    cityPlaceholder: "In which city / delegation?",
    yourAddress: "Your address to calculate distances",
    calculateDistance: "Calculate",
    searchBtn: "Search",
    resetBtn: "Reset",
    filters: "Filters",
    compare: "Compare",
    compareSelected: "Compare selected schools",
    selectToCompare: "Select to compare",
    selected: "selected",
    maxSelection: "Maximum 3 schools",
    distance: "Distance",
    travelTime: "Estimated time",
    minutes: "min",
    typeOptions: {
      all: "All",
      public: "Public",
      prive: "Private",
      international: "International/Accredited"
    },
    niveauOptions: {
      all: "All levels",
      creche: "Nursery",
      primaire: "Primary",
      lycee: "High School",
      superieur: "Higher Education"
    },
    langueOptions: {
      all: "All",
      francais: "French",
      anglais: "English",
      arabe: "Arabic",
      autre: "Other"
    },
    prixOptions: {
      all: "All",
      faible: "Low fees",
      moyen: "Medium fees",
      eleve: "High fees"
    },
    systemFilter: "System & Language",
    systemOptions: {
      all: "All systems",
      francais: "French (Mission)",
      anglais: "English (IB/Cambridge)",
      arabe: "Arabic (National)",
      allemand: "German",
      autre: "Other International"
    },
    results: "results",
    noResults: "No institutions found",
    homologue: "French Accredited",
    homologueEtr: "Foreign Accreditation",
    agrementMin: "Ministry Approval",
    ratio: "Ratio",
    tauxReussite: "BAC Success Rate",
    transport: "School transport",
    cantine: "Canteen",
    internat: "Boarding",
    avis: "reviews",
    virtualTour: "Virtual tour available",
    founded: "Founded",
    adminBlock: {
      title: "Required Documents for Registration",
      desc: "Find the necessary administrative procedures",
      link: "Access Administrative Section"
    },
    partnerBlock: {
      title: "Open Days & Events",
      desc: "Discover events organized by our partner institutions",
      link: "View events"
    },
    careersBlock: {
      title: "Careers in Education",
      desc: "Discover the latest job opportunities in the education sector",
      noJobs: "No offers available at the moment",
      viewAll: "View all job offers"
    }
  },
  ar: {
    title: "التعليم والتكوين: اعثر على المؤسسة المثالية",
    welcome: "دليلك الشامل للتعليم في تونس. من رياض الأطفال إلى الجامعة، ومروراً بالتدريب المستمر، يساعدك دليل تونس على اختيار المسار الأفضل. قارن البرامج، واطلع على آراء أولياء الأمور، وسجل أطفالك بثقة.",
    searchPlaceholder: "مدرسة ابتدائية، معهد، دروس لغة، جامعة...",
    cityPlaceholder: "في أي مدينة / ولاية؟",
    yourAddress: "عنوانك لحساب المسافات",
    calculateDistance: "احسب",
    searchBtn: "بحث",
    resetBtn: "إعادة تعيين",
    filters: "التصفية",
    compare: "قارن",
    compareSelected: "قارن المدارس المختارة",
    selectToCompare: "حدد للمقارنة",
    selected: "محدد",
    maxSelection: "بحد أقصى 3 مدارس",
    distance: "المسافة",
    travelTime: "الوقت المقدر",
    minutes: "دقيقة",
    typeOptions: {
      all: "الكل",
      public: "عمومي",
      prive: "خاص",
      international: "دولي / معتمد"
    },
    niveauOptions: {
      all: "جميع المستويات",
      creche: "روضة",
      primaire: "ابتدائي",
      lycee: "ثانوي",
      superieur: "عالي"
    },
    langueOptions: {
      all: "الكل",
      francais: "فرنسي",
      anglais: "إنجليزي",
      arabe: "عربي",
      autre: "أخرى"
    },
    prixOptions: {
      all: "الكل",
      faible: "رسوم منخفضة",
      moyen: "رسوم متوسطة",
      eleve: "رسوم مرتفعة"
    },
    systemFilter: "النظام واللغة",
    systemOptions: {
      all: "جميع الأنظمة",
      francais: "فرنسي (بعثة)",
      anglais: "إنجليزي (IB/Cambridge)",
      arabe: "عربي (وطني)",
      allemand: "ألماني",
      autre: "دولي آخر"
    },
    results: "نتيجة",
    noResults: "لم يتم العثور على مؤسسات",
    homologue: "معتمد فرنسي",
    homologueEtr: "اعتماد أجنبي",
    agrementMin: "موافقة الوزارة",
    ratio: "النسبة",
    tauxReussite: "معدل نجاح البكالوريا",
    transport: "نقل مدرسي",
    cantine: "مقصف",
    internat: "سكن داخلي",
    avis: "تقييم",
    virtualTour: "جولة افتراضية متاحة",
    founded: "تأسست",
    adminBlock: {
      title: "المستندات المطلوبة للتسجيل",
      desc: "اعثر على الإجراءات الإدارية اللازمة",
      link: "الوصول إلى القسم الإداري"
    },
    partnerBlock: {
      title: "أيام مفتوحة وفعاليات",
      desc: "اكتشف الأحداث التي تنظمها مؤسساتنا الشريكة",
      link: "عرض الفعاليات"
    },
    careersBlock: {
      title: "وظائف في التعليم",
      desc: "اكتشف أحدث فرص العمل في قطاع التعليم",
      noJobs: "لا توجد عروض متاحة في الوقت الحالي",
      viewAll: "عرض جميع عروض العمل"
    }
  }
};

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a =
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

export default function EducationNew() {
  const { language } = useLanguage();
  const tGlobal = useTranslation(language);
  const t = translations[language as keyof typeof translations] || translations.fr;
  const isRTL = language === 'ar';
  const { q, ville } = readParams();
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [userAddress, setUserAddress] = useState('');
  const [userCoords, setUserCoords] = useState<{lat: number, lng: number} | null>(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [niveauFilter, setNiveauFilter] = useState('all');
  const [langueFilter, setLangueFilter] = useState('all');
  const [prixFilter, setPrixFilter] = useState('all');
  const [systemFilter, setSystemFilter] = useState('all');

  const [isLoading, setIsLoading] = useState(false);
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [etablissementsWithDistance, setEtablissementsWithDistance] = useState<(Etablissement & {distance?: number, travelTime?: number})[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [showCompare, setShowCompare] = useState(false);

  const [jobOffers, setJobOffers] = useState<JobOffer[]>([]);

  const [entrepriseResults, setEntrepriseResults] = useState<any[]>([]);
  const [showEntrepriseResults, setShowEntrepriseResults] = useState(false);

  const [educationSearchTerm, setEducationSearchTerm] = useState('');
  const [educationSelectedGouvernorat, setEducationSelectedGouvernorat] = useState('');
  const [educationSelectedCategory, setEducationSelectedCategory] = useState('');
  const [selectedEducationBusiness, setSelectedEducationBusiness] = useState<any | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  const hasActiveEducationSearch = !!educationSearchTerm || !!educationSelectedGouvernorat || !!educationSelectedCategory;

  const [educationEvents, setEducationEvents] = useState<any[]>([]);
  const [eventsCity, setEventsCity] = useState('');

  const runEducationSearch = async () => {
    setIsLoading(true);
    setShowEntrepriseResults(true);

    try {
      let query = supabase
        .from(Tables.ENTREPRISE)
        .select('id, nom, secteur, sous_categories, categorie, gouvernorat, ville, adresse, telephone, email, site_web, description, services, image_url, logo_url, "statut Abonnement", "niveau priorité abonnement", "mots cles recherche", "Lien Instagram", "lien facebook", "Lien TikTok", "Lien LinkedIn", "Lien YouTube", lien_x, horaires_ok')
        .contains('"liste pages"', ['éducation'])
        .order('"niveau priorité abonnement"', { ascending: false, nullsFirst: false })
        .order('nom', { ascending: true })
        .limit(200);

      if (educationSelectedGouvernorat) {
        query = query.eq('gouvernorat', educationSelectedGouvernorat);
      }

      if (educationSelectedCategory) {
        query = query.eq('sous_categories', educationSelectedCategory);
      }

      if (educationSearchTerm && educationSearchTerm.trim().length > 0) {
        const searchPattern = `%${educationSearchTerm.trim()}%`;
        query = query.or(`nom.ilike.${searchPattern},sous_categories.ilike.${searchPattern},"mots cles recherche".ilike.${searchPattern}`);
      }

      const { data, error } = await query;
      console.log('DEBUG EDUCATION RESULTATS', { data, error, count: data?.length });

      if (error) {
        console.error('Erreur recherche éducation:', error);
        setEntrepriseResults([]);
      } else {
        const mappedData = (data || []).map((item: any) => ({
          id: item.id,
          name: item.nom || '',
          category: item.sous_categories || '',
          subCategories: item.sous_categories || '',
          gouvernorat: item.gouvernorat || '',
          secteur: item.secteur || '',
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
        setEntrepriseResults(mappedData);
      }

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error('Erreur recherche éducation:', error);
      setEntrepriseResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const runSearch = async () => {
    setIsLoading(true);
    try {
      // TODO: Table etablissements_education en cours de création
      // Temporairement désactivé pour éviter les erreurs console
      /*
      let query = supabase
        .from('etablissements_education')
        .select('*');

      // Filtrer par page_categorie si la table l'a
      // Note: etablissements_education est une table dédiée, pas entreprise
      // Donc pas besoin de filtrer par page_categorie ici

      query = query
        .order('niveau_abonnement', { ascending: false })
        .order('note_moyenne', { ascending: false });

      if (keyword) {
        query = query.or(`nom.ilike.%${keyword}%,description.ilike.%${keyword}%`);
      }

      if (city) {
        query = query.or(`ville.ilike.%${city}%,delegation.ilike.%${city}%`);
      }

      if (typeFilter !== 'all') {
        const typeMap: Record<string, string> = {
          public: 'Public',
          prive: 'Privé',
          international: 'International'
        };
        query = query.eq('type_etablissement', typeMap[typeFilter]);
      }

      if (niveauFilter !== 'all') {
        const niveauMap: Record<string, string> = {
          creche: 'Crèche',
          primaire: 'Primaire',
          lycee: 'Lycée',
          superieur: 'Supérieur'
        };
        query = query.eq('niveau_etude', niveauMap[niveauFilter]);
      }

      if (langueFilter !== 'all') {
        const langueMap: Record<string, string> = {
          francais: 'Français',
          anglais: 'Anglais',
          arabe: 'Arabe',
          autre: 'Autre'
        };
        query = query.eq('langue_principale', langueMap[langueFilter]);
      }

      if (prixFilter !== 'all') {
        const prixMap: Record<string, string> = {
          faible: 'Faible',
          moyen: 'Moyen',
          eleve: 'Élevé'
        };
        query = query.eq('frais_scolarite_range', prixMap[prixFilter]);
      }

      if (systemFilter !== 'all') {
        const systemMap: Record<string, string> = {
          francais: 'Français',
          anglais: 'Anglais',
          arabe: 'National',
          allemand: 'Allemand',
          autre: 'International'
        };
        query = query.eq('systeme_enseignement', systemMap[systemFilter]);
      }

      const { data, error } = await query;

      if (error) throw error;
      setEtablissements(data || []);

      if (userCoords && data) {
        const withDistance = data.map(etab => {
          if (etab.latitude && etab.longitude) {
            const dist = calculateDistance(userCoords.lat, userCoords.lng, etab.latitude, etab.longitude);
            const travelTime = Math.round((dist / 40) * 60);
            return { ...etab, distance: dist, travelTime };
          }
          return etab;
        });
        setEtablissementsWithDistance(withDistance);
      } else {
        setEtablissementsWithDistance(data || []);
      }
      */
      setEtablissements([]);
      setEtablissementsWithDistance([]);
    } catch (error) {
      console.error('Erreur recherche:', error);
      setEtablissements([]);
      setEtablissementsWithDistance([]);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateDistances = async () => {
    if (!userAddress) return;

    try {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserCoords({
              lat: position.coords.latitude,
              lng: position.coords.longitude
            });
            runSearch();
          },
          () => {
            alert(tGlobal.education.errors.geolocationDenied);
          }
        );
      }
    } catch (error) {
      console.error('Erreur géolocalisation:', error);
    }
  };

  const resetFilters = () => {
    setKeyword('');
    setCity('');
    setUserAddress('');
    setUserCoords(null);
    setTypeFilter('all');
    setNiveauFilter('all');
    setLangueFilter('all');
    setPrixFilter('all');
    setSystemFilter('all');
    setSelectedForCompare([]);
    setEtablissements([]);
    setEtablissementsWithDistance([]);
  };

  const toggleSelectForCompare = (id: string) => {
    setSelectedForCompare(prev => {
      if (prev.includes(id)) {
        return prev.filter(i => i !== id);
      } else if (prev.length < 3) {
        return [...prev, id];
      }
      return prev;
    });
  };

  const fetchJobOffers = async () => {
    try {
      const { data, error } = await supabase
        .from('job_postings')
        .select('id, title, company, city, contract_type, created_at')
        .ilike('category', '%enseignement%')
        .order('created_at', { ascending: false })
        .limit(3);

      if (error) throw error;
      setJobOffers(data || []);
    } catch (error) {
      console.error('Erreur chargement offres emploi:', error);
    }
  };

  useEffect(() => {
    fetchJobOffers();
    fetchEducationEvents();
  }, []);

  useEffect(() => {
    fetchEducationEvents();
  }, [eventsCity]);

  // Garde anti-boucle pour EducationNew
  const prevEducationSearchRef = useRef({ educationSearchTerm: '', educationSelectedGouvernorat: '', educationSelectedCategory: '' });
  const educationFetchAttemptsRef = useRef(0);
  const MAX_EDUCATION_ATTEMPTS = 3;

  useEffect(() => {
    // Garde: Limiter les tentatives
    if (educationFetchAttemptsRef.current >= MAX_EDUCATION_ATTEMPTS) {
      console.warn('⚠️ [EducationNew] Limite de tentatives atteinte');
      return;
    }

    // Garde: Vérifier changement réel
    const hasRealChange =
      prevEducationSearchRef.current.educationSearchTerm !== educationSearchTerm ||
      prevEducationSearchRef.current.educationSelectedGouvernorat !== educationSelectedGouvernorat ||
      prevEducationSearchRef.current.educationSelectedCategory !== educationSelectedCategory;

    if (!hasRealChange) {
      return;
    }

    prevEducationSearchRef.current = { educationSearchTerm, educationSelectedGouvernorat, educationSelectedCategory };
    educationFetchAttemptsRef.current += 1;

    const delayDebounceFn = setTimeout(() => {
      if (educationSearchTerm || educationSelectedGouvernorat || educationSelectedCategory) {
        runEducationSearch();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [educationSearchTerm, educationSelectedGouvernorat, educationSelectedCategory]);

  const fetchEducationEvents = async () => {
    try {
      let query = supabase
        .from('featured_events')
        .select('*')
        .eq('secteur_evenement', 'education')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true })
        .limit(10);

      if (eventsCity) {
        query = query.ilike('city', `%${eventsCity}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      setEducationEvents(data || []);
    } catch (error) {
      console.error('Erreur chargement événements éducation:', error);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    (async () => {
      // TODO: Table etablissements_education en cours de création
      // Temporairement désactivé pour éviter les erreurs console
      /*
      let query = supabase
        .from('etablissements_education')
        .select('*')
        .order('nom', { ascending: true })
        .limit(60);

      if (q) query = query.ilike('nom', `%${q}%`);
      if (ville) query = query.eq('gouvernorat', ville);

      const { data, error } = await query;
      if (error) {
        console.error('Erreur:', error);
        setEtablissements([]);
      } else {
        setEtablissements(data || []);
      }
      */
      setEtablissements([]);
      setIsLoading(false);
    })();
  }, [q, ville]);

  const displayedEtabs = userCoords ? etablissementsWithDistance : etablissements;

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Hero Section with Background Image */}
      <section
        className="relative text-white pb-10 px-4 bg-cover bg-center bg-no-repeat"
        style={{
          backgroundImage: `linear-gradient(rgba(74, 29, 67, 0.6), rgba(74, 29, 67, 0.6)), url(${getSupabaseImageUrl('classe-ecole.jpg')})`
        }}
      >
        {/* Bouton Retour aux catégories */}
        <div className="max-w-5xl mx-auto pt-4 mb-3">
          <button
            onClick={() => window.location.hash = '#/citizens'}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-[#D4AF37] bg-[#4A1D43] text-[#D4AF37] hover:bg-[#D4AF37] hover:text-[#4A1D43] transition-all duration-300 shadow-lg font-semibold"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="text-sm">Retour aux services citoyens</span>
          </button>
        </div>

        <div className="max-w-5xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="mb-3 py-8"
          >
            <h1 className="text-3xl md:text-4xl font-light mb-2 text-white drop-shadow-lg" style={{ fontFamily: "'Playfair Display', serif" }}>{t.title}</h1>
            <p className="text-base md:text-lg text-white leading-relaxed max-w-3xl mx-auto drop-shadow-md">
              {t.welcome}
            </p>
          </motion.div>

        </div>
      </section>

      {/* Barre de recherche */}
      <section className="px-4 py-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <CategorySearchBar
            listePageValue="éducation"
            placeholder={language === 'fr' ? 'Rechercher un établissement scolaire...' : language === 'ar' ? 'البحث عن مؤسسة تعليمية...' : 'Search for an educational institution...'}
            onSelectBusiness={(businessId) => navigate(`/business/${businessId}`)}
            onSearch={(query, ville) => {
              setEducationSearchTerm(query);
              setEducationSelectedGouvernorat(ville);
            }}
          />
        </div>
      </section>

      {/* BARRE A SUPPRIMÉE - SearchBar unifié global (non connectée à Supabase)
      <div className="max-w-5xl mx-auto px-4 py-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-white rounded-2xl p-6 mb-6 shadow-lg"
          >
            <SearchBar scope="education" enabled />
          </motion.div>
      </div>
      */}

      <div className="max-w-5xl mx-auto px-4 py-6">

          {/* Bandeau informatif Événements Scolaires - Version compacte */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15 }}
            className="bg-[#FAF9F6] rounded-lg px-3 py-2 mb-4 shadow-sm border border-[#D4AF37]"
          >
            <div className="flex flex-col md:flex-row items-start md:items-center gap-1.5">
              <div className="flex-1">
                <h3 className="text-base md:text-lg font-semibold text-[#4A1D43] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>
                  Vous organisez un événement scolaire ?
                </h3>
                <p className="text-xs text-gray-700 leading-snug mb-1.5">
                  Journée portes ouvertes, forum d'orientation, inscriptions… Proposez vos événements aux familles de votre région.
                </p>
                <a
                  href="#/education-event-form"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4A1D43] hover:bg-[#5A2D53] border border-[#D4AF37] text-[#D4AF37] hover:text-white font-semibold rounded-lg shadow-sm transition-all transform hover:scale-105 cursor-pointer text-xs"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  <Calendar className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Proposer un événement</span>
                </a>
              </div>
            </div>
          </motion.div>

          {/* BARRE C SUPPRIMÉE - Barre de recherche principale avec filtres manuels (non connectée à Supabase)
          {(q || ville) && (
            <div className="mb-6 text-sm text-gray-500">
              {q && <>Recherche : <b>{q}</b> · </>}
              {ville && <>Ville : <b>{ville}</b></>}
            </div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20"
          >
            <div className={`flex flex-col md:flex-row gap-3 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
              <div className="flex-1 relative">
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                <input
                  type="text"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  data-search-bar="true"
                  data-search-scope="education"
                  data-component-name="EducationNew-Keyword"
                  className={`w-full ${isRTL ? 'pr-10 text-right' : 'pl-10'} py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 text-gray-900`}
                />
              </div>
              <div className="md:w-72">
                <CityAutocomplete
                  value={city}
                  onChange={setCity}
                  placeholder={t.cityPlaceholder}
                />
              </div>
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="md:hidden px-6 py-3 rounded-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 transition flex items-center justify-center gap-2"
              >
                <Filter className="w-5 h-5" />
                {t.filters}
              </button>
            </div>

            <div className={`mt-4 flex ${isRTL ? 'flex-row-reverse' : ''} gap-3`}>
              <div className="flex-1 relative">
                <Navigation className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                <input
                  type="text"
                  value={userAddress}
                  onChange={(e) => setUserAddress(e.target.value)}
                  placeholder={t.yourAddress}
                  data-search-bar="true"
                  data-search-scope="adresse"
                  data-component-name="EducationNew-Address"
                  className={`w-full ${isRTL ? 'pr-10 text-right' : 'pl-10'} py-3 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 text-gray-900`}
                />
              </div>
              <button
                onClick={calculateDistances}
                disabled={!userAddress}
                className="px-6 py-3 rounded-lg bg-[#4A1D43] hover:bg-[#5A2D53] border-2 border-[#D4AF37] text-[#D4AF37] hover:text-white font-semibold transition shadow-lg disabled:opacity-50 flex items-center gap-2"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                <MapPin className="w-5 h-5" />
                {t.calculateDistance}
              </button>
            </div>

            <div className={`mt-4 grid grid-cols-1 md:grid-cols-5 gap-3 ${showFilters ? 'block' : 'hidden md:grid'}`}>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
              >
                <option value="all">{t.typeOptions.all}</option>
                <option value="public">{t.typeOptions.public}</option>
                <option value="prive">{t.typeOptions.prive}</option>
                <option value="international">{t.typeOptions.international}</option>
              </select>

              <select
                value={niveauFilter}
                onChange={(e) => setNiveauFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
              >
                <option value="all">{t.niveauOptions.all}</option>
                <option value="creche">{t.niveauOptions.creche}</option>
                <option value="primaire">{t.niveauOptions.primaire}</option>
                <option value="lycee">{t.niveauOptions.lycee}</option>
                <option value="superieur">{t.niveauOptions.superieur}</option>
              </select>

              <select
                value={langueFilter}
                onChange={(e) => setLangueFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
              >
                <option value="all">{t.langueOptions.all}</option>
                <option value="francais">{t.langueOptions.francais}</option>
                <option value="anglais">{t.langueOptions.anglais}</option>
                <option value="arabe">{t.langueOptions.arabe}</option>
                <option value="autre">{t.langueOptions.autre}</option>
              </select>

              <select
                value={prixFilter}
                onChange={(e) => setPrixFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
              >
                <option value="all">{t.prixOptions.all}</option>
                <option value="faible">{t.prixOptions.faible}</option>
                <option value="moyen">{t.prixOptions.moyen}</option>
                <option value="eleve">{t.prixOptions.eleve}</option>
              </select>

              <select
                value={systemFilter}
                onChange={(e) => setSystemFilter(e.target.value)}
                className="px-4 py-2 rounded-lg border-0 focus:ring-2 focus:ring-blue-500 text-gray-900 text-sm"
              >
                <option value="all">{t.systemOptions.all}</option>
                <option value="francais">{t.systemOptions.francais}</option>
                <option value="anglais">{t.systemOptions.anglais}</option>
                <option value="arabe">{t.systemOptions.arabe}</option>
                <option value="allemand">{t.systemOptions.allemand}</option>
                <option value="autre">{t.systemOptions.autre}</option>
              </select>
            </div>

            <div className={`mt-4 flex ${isRTL ? 'flex-row-reverse' : ''} gap-3`}>
              <button
                onClick={runSearch}
                disabled={isLoading}
                className="flex-1 px-6 py-3 rounded-lg bg-orange-600 hover:bg-orange-700 text-white font-medium transition shadow-lg disabled:opacity-50"
              >
                {t.searchBtn}
              </button>
              <button
                onClick={resetFilters}
                className="px-6 py-3 rounded-lg bg-white/20 hover:bg-white/30 text-white border border-white/30 transition"
              >
                {t.resetBtn}
              </button>
            </div>
          </motion.div>
          */}

          {/* Blocs d'information */}
          <section className="max-w-7xl mx-auto px-4 py-8">
            <div className="grid md:grid-cols-2 gap-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-gradient-to-br from-[#4A1D43]/5 to-[#D4AF37]/5 rounded-2xl p-6 border border-[#D4AF37]"
          >
            <h3 className="text-lg font-semibold text-[#4A1D43] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{t.adminBlock.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{t.adminBlock.desc}</p>
            <a
              href="#/citizens/admin"
              className="inline-flex items-center gap-2 text-[#4A1D43] hover:text-[#D4AF37] font-medium text-sm transition-colors"
            >
              {t.adminBlock.link}
              <ChevronDown className={`w-4 h-4 ${isRTL ? 'rotate-90' : '-rotate-90'}`} />
            </a>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-gradient-to-br from-[#4A1D43]/5 to-[#D4AF37]/5 rounded-2xl p-6 border border-[#D4AF37]"
          >
            <h3 className="text-lg font-semibold text-[#4A1D43] mb-2" style={{ fontFamily: "'Playfair Display', serif" }}>{t.partnerBlock.title}</h3>
            <p className="text-sm text-gray-600 mb-4">{t.partnerBlock.desc}</p>
            <button
              onClick={() => {
                const eventsSection = document.getElementById('education-events-section');
                eventsSection?.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }}
              className="inline-flex items-center gap-2 text-[#4A1D43] hover:text-[#D4AF37] font-medium text-sm transition-colors"
            >
              {t.partnerBlock.link}
              <ChevronDown className={`w-4 h-4 ${isRTL ? 'rotate-90' : '-rotate-90'}`} />
            </button>
          </motion.div>
            </div>
          </section>
        </div>

      {/* Bouton comparaison flottant */}
      {selectedForCompare.length > 0 && (
        <div className="fixed bottom-8 right-8 z-40">
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            onClick={() => setShowCompare(true)}
            className="bg-gradient-to-r from-[#4A1D43] to-[#6B2D5C] border-2 border-[#D4AF37] text-[#D4AF37] px-6 py-4 rounded-full shadow-2xl hover:shadow-3xl transition-all flex items-center gap-3"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            <Award className="w-6 h-6" />
            <div className="text-left">
              <div className="text-sm font-semibold">{t.compare}</div>
              <div className="text-xs opacity-90">{selectedForCompare.length} {t.selected}</div>
            </div>
          </motion.button>
        </div>
      )}

      {/* Modal comparaison */}
      {showCompare && selectedForCompare.length >= 2 && (
        <EducationCompare
          etablissements={displayedEtabs.filter(e => selectedForCompare.includes(e.id))}
          onClose={() => setShowCompare(false)}
          language={language}
        />
      )}

      {/* Résultats Entreprise (depuis table entreprise) */}
      {hasActiveEducationSearch && (
        <section ref={resultsRef} className="max-w-7xl mx-auto px-4 pb-8">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-2">
              Établissements d'éducation
            </h2>
            {hasActiveEducationSearch && (
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold text-blue-900">{entrepriseResults.length}</span> {t.results}
                </p>
                <button
                  onClick={() => {
                    setEducationSearchTerm('');
                    setEducationSelectedGouvernorat('');
                    setEducationSelectedCategory('');
                    setShowEntrepriseResults(false);
                    setEntrepriseResults([]);
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 underline"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            )}
          </div>

          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="w-8 h-8 text-[#D4AF37] animate-spin" />
              <p className="mt-2 text-xs text-gray-600 ml-2">Recherche en cours...</p>
            </div>
          ) : entrepriseResults.length === 0 ? (
            <div className="text-center py-4">
              <GraduationCap className="w-8 h-8 text-[#D4AF37]/30 mx-auto mb-2" />
              <h3 className="text-sm font-semibold text-gray-700 mb-1">Aucun établissement trouvé</h3>
              <p className="text-xs text-gray-500">Essayez de modifier vos critères de recherche</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {entrepriseResults.map((etablissement) => (
                <motion.div
                  key={etablissement.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <BusinessCard
                    business={etablissement}
                    onClick={() => setSelectedEducationBusiness(etablissement)}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Résultats établissements_education (table dédiée) */}
      <section className="max-w-7xl mx-auto px-4 pb-4">
        {!showEntrepriseResults && isLoading ? (
          <div className="text-center py-6">
            <div className="animate-spin rounded-full h-8 w-8 border-4 border-[#D4AF37] border-t-transparent mx-auto"></div>
          </div>
        ) : !showEntrepriseResults && displayedEtabs.length > 0 ? (
          <>
            <div className="mb-6 text-center">
              <p className="text-gray-600">
                <span className="font-semibold text-blue-900">{displayedEtabs.length}</span> {t.results}
              </p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {displayedEtabs.map((etab) => (
                <motion.div
                  key={etab.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`bg-white rounded-2xl border-2 ${selectedForCompare.includes(etab.id) ? 'border-[#D4AF37]' : 'border-[#D4AF37]/50'} shadow-sm hover:shadow-lg transition-all overflow-hidden relative`}
                >
                  {/* Bouton sélection comparaison */}
                  <button
                    onClick={() => toggleSelectForCompare(etab.id)}
                    disabled={selectedForCompare.length >= 3 && !selectedForCompare.includes(etab.id)}
                    className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} z-10 p-2 rounded-full ${selectedForCompare.includes(etab.id) ? 'bg-[#4A1D43] text-[#D4AF37]' : 'bg-white/90 text-gray-600'} hover:scale-110 transition-all shadow-lg disabled:opacity-50 disabled:cursor-not-allowed border border-[#D4AF37]`}
                  >
                    {selectedForCompare.includes(etab.id) ? (
                      <X className="w-5 h-5" />
                    ) : (
                      <Plus className="w-5 h-5" />
                    )}
                  </button>

                  {/* Header avec badges */}
                  <div className="relative bg-gradient-to-br from-[#4A1D43] to-[#6B2D5C] p-4 text-white">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-semibold text-lg leading-tight flex-1" style={{ fontFamily: "'Playfair Display', serif" }}>{etab.nom}</h3>
                      {etab.niveau_abonnement > 0 && (
                        <Award className="w-5 h-5 text-[#D4AF37] flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <span className="px-2 py-1 bg-white/20 rounded text-xs">
                        {etab.niveau_etude}
                      </span>
                      <span className="px-2 py-1 bg-white/20 rounded text-xs">
                        {etab.langue_principale}
                      </span>
                      {etab.homologue_francais && (
                        <span className="px-2 py-1 bg-green-500/90 rounded text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {t.homologue}
                        </span>
                      )}
                      {etab.homologation_etrangere && (
                        <span className="px-2 py-1 bg-blue-500/90 rounded text-xs flex items-center gap-1">
                          <Globe className="w-3 h-3" />
                          {t.homologueEtr}
                        </span>
                      )}
                      {etab.agrement_ministre && (
                        <span className="px-2 py-1 bg-purple-500/90 rounded text-xs flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {t.agrementMin}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Contenu */}
                  <div className="p-4">
                    {/* Distance */}
                    {etab.distance && (
                      <div className="mb-3 p-2 bg-green-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2 text-green-700">
                            <MapPin className="w-4 h-4" />
                            <span className="font-medium">{etab.distance.toFixed(1)} km</span>
                          </div>
                          <div className="flex items-center gap-2 text-green-600">
                            <Clock className="w-4 h-4" />
                            <span>~{etab.travelTime} {t.minutes}</span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="line-clamp-1">{etab.ville}</span>
                    </div>

                    {etab.description && (
                      <p className="text-sm text-gray-600 mb-3 line-clamp-2">{etab.description}</p>
                    )}

                    {/* KPIs */}
                    {(etab.taux_reussite_bac || (etab.ratio_eleves_enseignant || etab.ratio_eleves_prof)) && (
                      <div className="mb-3 p-3 bg-amber-50 rounded-lg">
                        <div className="text-xs font-semibold text-amber-900 mb-2">Statistiques clés</div>
                        {etab.taux_reussite_bac && (
                          <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                            <TrendingUp className="w-4 h-4 text-green-600" />
                            <span>{t.tauxReussite}: <span className="font-semibold text-green-700">{etab.taux_reussite_bac}%</span></span>
                          </div>
                        )}
                        {(etab.ratio_eleves_enseignant || etab.ratio_eleves_prof) && (
                          <div className="flex items-center gap-2 text-sm text-gray-700">
                            <Users className="w-4 h-4 text-blue-600" />
                            <span>{t.ratio}: {etab.ratio_eleves_enseignant || etab.ratio_eleves_prof}:1</span>
                          </div>
                        )}
                      </div>
                    )}

                    {/* Détails */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-700">
                        <Globe className="w-4 h-4 text-blue-600" />
                        <span>{etab.systeme_enseignement}</span>
                      </div>

                      {etab.transport_scolaire && (
                        <div className="flex items-center gap-2 text-sm text-green-700">
                          <Bus className="w-4 h-4" />
                          <span>{t.transport}</span>
                        </div>
                      )}

                      {etab.cantine && (
                        <div className="flex items-center gap-2 text-sm text-orange-700">
                          <Utensils className="w-4 h-4" />
                          <span>{t.cantine}</span>
                        </div>
                      )}

                      {etab.internat && (
                        <div className="flex items-center gap-2 text-sm text-purple-700">
                          <HomeIcon className="w-4 h-4" />
                          <span>{t.internat}</span>
                        </div>
                      )}

                      {etab.frais_scolarite_range && (
                        <div className="flex items-center gap-2 text-sm text-gray-700">
                          <Euro className="w-4 h-4 text-blue-600" />
                          <span>{etab.frais_scolarite_range}</span>
                        </div>
                      )}

                      {etab.lien_video_visite && (
                        <div className="flex items-center gap-2 text-sm text-yellow-700 font-medium">
                          <Video className="w-4 h-4" />
                          <span>{t.virtualTour}</span>
                        </div>
                      )}
                    </div>

                    {/* Accréditations */}
                    {etab.accreditations && etab.accreditations.length > 0 && (
                      <div className="mb-4">
                        <div className="flex flex-wrap gap-1">
                          {etab.accreditations.map((acc, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-blue-50 text-blue-700 rounded text-xs font-medium"
                            >
                              {acc}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Note et avis */}
                    {etab.note_moyenne > 0 && (
                      <div className="flex items-center gap-2 mb-4">
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.round(etab.note_moyenne)
                                  ? 'text-yellow-500 fill-yellow-500'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          ({etab.nombre_avis} {t.avis})
                        </span>
                      </div>
                    )}

                    {/* Contact */}
                    {etab.telephone && (
                      <a
                        href={`tel:${etab.telephone}`}
                        className="block w-full text-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition"
                      >
                        {etab.telephone}
                      </a>
                    )}
                  </div>
                </motion.div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center py-4">
            <GraduationCap className="w-8 h-8 text-[#D4AF37]/30 mx-auto mb-2" />
            <p className="text-sm text-gray-600">{t.noResults}</p>
          </div>
        )}
      </section>

      {/* Bloc Carrières dans l'Éducation - Version compacte */}
      <section className="max-w-7xl mx-auto px-4 pb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-xl px-4 py-4 border border-[#D4AF37] shadow-sm"
        >
          <div className="mb-3">
            <h2 className="text-lg font-semibold text-[#4A1D43] mb-1" style={{ fontFamily: "'Playfair Display', serif" }}>{t.careersBlock.title}</h2>
            <p className="text-xs text-gray-600">{t.careersBlock.desc}</p>
          </div>

          {jobOffers.length > 0 ? (
            <div className="grid md:grid-cols-3 gap-3 mb-3">
              {jobOffers.map((job) => (
                <div key={job.id} className="bg-[#FAF9F6] rounded-lg px-3 py-2 border border-[#D4AF37]/30 hover:shadow-md transition">
                  <h3 className="font-semibold text-[#4A1D43] mb-1 text-sm">{job.titre}</h3>
                  <p className="text-xs text-gray-600 mb-1">{job.entreprise}</p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <MapPin className="w-3 h-3 text-[#D4AF37]" />
                    <span>{job.ville}</span>
                  </div>
                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-[#D4AF37]/20 text-[#4A1D43] rounded-full text-[10px] font-medium">
                    {job.type_contrat}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-600 mb-3 text-sm">{t.careersBlock.noJobs}</p>
          )}

          <a
            href="#/jobs"
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#4A1D43] hover:bg-[#5A2D53] text-[#D4AF37] hover:text-white rounded-lg transition font-semibold text-xs border border-[#D4AF37]"
            style={{ fontFamily: "'Playfair Display', serif" }}
          >
            {t.careersBlock.viewAll}
            <ChevronDown className={`w-3.5 h-3.5 ${isRTL ? 'rotate-90' : '-rotate-90'}`} />
          </a>
        </motion.div>
      </section>

      {/* Section Événements Éducation (en bas avec ancre) - Version ultra compacte */}
      <section id="education-events-section" className="max-w-7xl mx-auto px-4 pb-6 scroll-mt-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gradient-to-br from-[#4A1D43]/5 to-[#D4AF37]/5 rounded-xl px-3 py-3 border border-[#D4AF37] shadow-sm"
        >
          <div className="mb-2">
            <h2 className="text-lg font-semibold text-[#4A1D43]" style={{ fontFamily: "'Playfair Display', serif" }}>Événements à venir</h2>
          </div>

          {/* Filtre par ville */}
          <div className="mb-3 max-w-md">
            <label className="block text-xs font-medium text-[#4A1D43] mb-1.5">
              Filtrer par ville
            </label>
            <select
              value={eventsCity}
              onChange={(e) => setEventsCity(e.target.value)}
              className="w-full px-3 py-1.5 rounded-lg border border-[#D4AF37] focus:ring-2 focus:ring-[#4A1D43] focus:border-transparent text-sm"
            >
              <option value="">Toutes les villes</option>
              <option value="Tunis">Tunis</option>
              <option value="Ariana">Ariana</option>
              <option value="Ben Arous">Ben Arous</option>
              <option value="La Manouba">La Manouba</option>
              <option value="Nabeul">Nabeul</option>
              <option value="Sousse">Sousse</option>
              <option value="Monastir">Monastir</option>
              <option value="Sfax">Sfax</option>
              <option value="Bizerte">Bizerte</option>
            </select>
          </div>

          {/* Liste simplifiée des événements */}
          {educationEvents.length > 0 ? (
            <div className="space-y-2">
              {educationEvents.map((event) => (
                <div
                  key={event.id}
                  className="bg-white rounded-lg px-3 py-2 border border-[#D4AF37]/30 hover:shadow-md transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-[#4A1D43] mb-1 text-sm" style={{ fontFamily: "'Playfair Display', serif" }}>
                        {event.event_name}
                      </h3>
                      {event.organizer && (
                        <p className="text-xs text-gray-600 mb-1.5">{event.organizer}</p>
                      )}
                      <div className="flex flex-wrap items-center gap-3 text-xs text-gray-600">
                        {event.event_date && (
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3 flex-shrink-0 text-[#D4AF37]" />
                            <span>
                              {new Date(event.event_date).toLocaleDateString('fr-FR', {
                                day: 'numeric',
                                month: 'long',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        )}
                        {event.city && (
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 flex-shrink-0 text-[#D4AF37]" />
                            <span>{event.city}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    {event.registration_url && (
                      <a
                        href={event.registration_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-shrink-0 px-3 py-1.5 bg-[#4A1D43] hover:bg-[#5A2D53] border border-[#D4AF37] text-[#D4AF37] hover:text-white rounded-lg transition text-xs font-semibold"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        S'inscrire
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600">
                {eventsCity
                  ? `Aucun événement à venir à ${eventsCity}`
                  : 'Aucun événement éducatif à venir pour le moment'}
              </p>
            </div>
          )}
        </motion.div>
      </section>

      {/* Modal de détails entreprise */}
      {selectedEducationBusiness && (
        <BusinessDetail
          business={selectedEducationBusiness}
          onClose={() => setSelectedEducationBusiness(null)}
          asModal={true}
        />
      )}
    </div>
  );
}
