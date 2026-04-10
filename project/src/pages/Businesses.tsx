import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { supabase } from '../lib/supabaseClient';
import { buildEntrepriseUrl, getHashQueryParams } from '../lib/url';
import { readParams } from '../lib/urlParams';
import { generateBusinessUrl } from '../lib/slugify';
import { RPC, Tables } from '../lib/dbTables';
import SearchBar from '../components/SearchBar';
import BusinessSearchBar from '../components/BusinessSearchBar';
import CategorySearchBar from '../components/CategorySearchBar';
import { FeaturedEventsCarousel } from '../components/FeaturedEventsCarousel';
import { FeaturedBusinessesStrip } from '../components/FeaturedBusinessesStrip';
import { METIERS_DOMAINES } from '../lib/categories';
import { FINANCE_SUBCATEGORIES } from '../lib/entrepriseCategories';
import { Search, MapPin, Phone, Mail, Globe, Building2, X, Plus, ChevronDown, Star, Award, Briefcase } from 'lucide-react';
import { Toast } from '../components/Toast';
import { getSupabaseImageUrl } from '../lib/imageUtils';
import { RegistrationForm } from '../components/RegistrationForm';
import SignatureCard from '../components/SignatureCard';
import { normalizeText } from '../lib/textNormalization';
import { BusinessCard } from '../components/BusinessCard';
import { BusinessDetail } from '../components/BusinessDetail';
import { getSubscriptionPriority } from '../lib/subscriptionHelper';
import { extractMainCategory, getAllKeywords } from '../lib/categoryDisplay';
import StructuredData from '../components/StructuredData';
import { generateCollectionPageSchema } from '../lib/structuredDataSchemas';
import FilterChips from '../components/FilterChips';

interface Business {
  id: string;
  name: string;
  category: string;
  subCategories?: string;
  city: string;
  address: string;
  phone: string;
  email: string;
  website?: string;
  description: string;
  services?: string;
  imageUrl?: string | null;
  logoUrl?: string | null;
  gouvernorat?: string;
  secteur?: string;
  statut_abonnement?: string | null;
  'niveau priorité abonnement'?: number | null;
  badges?: string[];
  mots_cles_recherche?: string;
  instagram?: string;
  facebook?: string;
  tiktok?: string;
  linkedin?: string;
  youtube?: string;
  lien_x?: string;
  horaires_ok?: string | null;
}

interface BusinessesProps {
  showSuggestionForm?: boolean;
  onCloseSuggestionForm?: () => void;
  onNavigate?: (page: any) => void;
  initialSearchKeyword?: string;
  initialSearchCity?: string;
  onClearSearch?: () => void;
}

export const Businesses = ({
  showSuggestionForm = false,
  onCloseSuggestionForm,
  onNavigate,
  initialSearchKeyword = '',
  initialSearchCity = '',
  onClearSearch
}: BusinessesProps) => {
  const { language } = useLanguage();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const t = useTranslation(language);
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState(initialSearchKeyword || '');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedCity, setSelectedCity] = useState(initialSearchCity || '');
  const [pageCategorie, setPageCategorie] = useState<string | null>(null);
  const [showSuggestForm, setShowSuggestForm] = useState(showSuggestionForm);
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null);
  const [preselectedBusinessId, setPreselectedBusinessId] = useState<string | null>(null);
  const [searching, setSearching] = useState(false);
  const [premiumJobs, setPremiumJobs] = useState<any[]>([]);
  const [loadingPremiumJobs, setLoadingPremiumJobs] = useState(false);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [filterPremium, setFilterPremium] = useState(false);
  const [filterCommerceLocal, setFilterCommerceLocal] = useState(false);
  const [availableCategories, setAvailableCategories] = useState<Array<{id: string, label: string, count: number}>>([]);
  const [selectedChipCategories, setSelectedChipCategories] = useState<string[]>([]);

  const resultsRef = useRef<HTMLDivElement>(null);

  // Protection anti-blocage : forcer arrêt du loading après 5s
  useEffect(() => {
    if (!loading && !searching) return;

    const timeout = setTimeout(() => {
      if (loading || searching) {
        console.warn('⚠️ [TIMEOUT] Loading bloqué > 5s, déblocage forcé');
        setLoading(false);
        setSearching(false);
      }
    }, 5000);
    return () => clearTimeout(timeout);
  }, [loading, searching]);

  const hasActiveSearch = !!searchTerm || !!selectedCity || !!selectedCategory || !!pageCategorie || filterPremium || filterCommerceLocal;

  // Extraire les catégories disponibles depuis les résultats
  useEffect(() => {
    if (businesses.length === 0 || !searchTerm) {
      setAvailableCategories([]);
      return;
    }

    const categoryCount = new Map<string, number>();

    businesses.forEach((biz) => {
      const categories = [
        biz.category,
        biz.secteur,
        ...(biz.subCategories?.split(',').map(s => s.trim()) || [])
      ].filter(Boolean);

      categories.forEach((cat) => {
        if (cat && cat.trim()) {
          const normalized = cat.trim();
          categoryCount.set(normalized, (categoryCount.get(normalized) || 0) + 1);
        }
      });
    });

    const chips = Array.from(categoryCount.entries())
      .map(([label, count]) => ({ id: label, label, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    setAvailableCategories(chips);
  }, [businesses, searchTerm]);

  // Handler pour les chips
  const handleToggleChipCategory = (categoryId: string) => {
    setSelectedChipCategories((prev) => {
      if (prev.includes(categoryId)) {
        return prev.filter((id) => id !== categoryId);
      } else {
        return [...prev, categoryId];
      }
    });
  };

  const handleClearAllChips = () => {
    setSelectedChipCategories([]);
  };

  // Filtrer les résultats selon les chips sélectionnés
  const chipFilteredBusinesses = selectedChipCategories.length > 0
    ? businesses.filter((biz) => {
        const bizCategories = [
          biz.category,
          biz.secteur,
          ...(biz.subCategories?.split(',').map(s => s.trim()) || [])
        ].filter(Boolean).map(c => c.trim());

        return selectedChipCategories.some((chipCat) =>
          bizCategories.some((bizCat) => bizCat === chipCat)
        );
      })
    : businesses;

  const [suggestionForm, setSuggestionForm] = useState({
    name: '',
    category: '',
    city: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    description: '',
  });

  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error'; isVisible: boolean }>({
    message: '',
    type: 'success',
    isVisible: false,
  });

  useEffect(() => {
    setShowSuggestForm(showSuggestionForm);
  }, [showSuggestionForm]);

  useEffect(() => {
    const loadUrlParams = () => {
      console.log('═══════════════════════════════════════');
      console.log('🌐 [DEBUG URL] Chargement des paramètres URL...');

      const params = readParams();
      console.log('[DEBUG URL] readParams() retourne:', params);

      const urlQ = params.q || initialSearchKeyword || '';
      const urlVille = params.ville || initialSearchCity || '';
      const urlCategorie = params.categorie || '';
      const urlSelectedId = params.selected_id || '';

      const hashParams = getHashQueryParams();
      const pageCat = hashParams.get('page_categorie');
      const premiumParam = hashParams.get('premium');
      const commerceLocalParam = hashParams.get('commerce_local');

      // Détection de l'ancre #suggest-business pour ouvrir le formulaire de suggestion
      const currentPath = window.location.pathname + window.location.search + window.location.hash;
      if (currentPath.includes('suggest-business')) {
        setShowSuggestForm(true);
      }

      console.log('[DEBUG URL] Paramètres extraits:', {
        urlQ,
        urlVille,
        urlCategorie,
        urlSelectedId,
        pageCat,
        premiumParam,
        commerceLocalParam,
        suggestFormTrigger: currentPath.includes('suggest-business')
      });
      console.log('═══════════════════════════════════════\n');

      // ✅ PROTECTION BOUCLE INFINIE : ne setState que si vraiment différent
      if (urlQ !== searchTerm) {
        console.log(`[DEBUG] Mise à jour searchTerm: "${searchTerm}" → "${urlQ}"`);
        setSearchTerm(urlQ);
      }
      if (urlVille !== selectedCity) {
        console.log(`[DEBUG] Mise à jour selectedCity: "${selectedCity}" → "${urlVille}"`);
        setSelectedCity(urlVille);
      }
      if (urlCategorie !== selectedCategory) {
        console.log(`[DEBUG] Mise à jour selectedCategory: "${selectedCategory}" → "${urlCategorie}"`);
        setSelectedCategory(urlCategorie);
      }
      const newPreselected = urlSelectedId || null;
      if (newPreselected !== preselectedBusinessId) {
        console.log(`[DEBUG] Mise à jour preselectedBusinessId: "${preselectedBusinessId}" → "${newPreselected}"`);
        setPreselectedBusinessId(newPreselected);
      }
      const newPremium = premiumParam === 'true';
      if (newPremium !== filterPremium) {
        console.log(`[DEBUG] Mise à jour filterPremium: ${filterPremium} → ${newPremium}`);
        setFilterPremium(newPremium);
      }
      const newCommerceLocal = commerceLocalParam === 'true';
      if (newCommerceLocal !== filterCommerceLocal) {
        console.log(`[DEBUG] Mise à jour filterCommerceLocal: ${filterCommerceLocal} → ${newCommerceLocal}`);
        setFilterCommerceLocal(newCommerceLocal);
      }

      if (pageCat && pageCat !== pageCategorie) {
        console.log(`[DEBUG] Mise à jour pageCategorie: "${pageCategorie}" → "${pageCat}"`);
        setPageCategorie(pageCat);
      }
    };

    loadUrlParams();

    const handleHashChange = () => {
      console.log('[DEBUG] Hash changed, reloading params');
      loadUrlParams();
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [initialSearchKeyword, initialSearchCity]);

  useEffect(() => {
    fetchPremiumJobs();
  }, []);

  const fetchPremiumJobs = async () => {
    try {
      setLoadingPremiumJobs(true);
      const { data, error } = await supabase
        .from(Tables.JOB_POSTINGS)
        .select('*')
        .eq('statut', 'active')
        .eq('est_premium', true)
        .order('created_at', { ascending: false })
        .limit(6);

      if (error) throw error;
      setPremiumJobs(data || []);
    } catch (error) {
      console.error('Error fetching premium jobs:', error);
    } finally {
      setLoadingPremiumJobs(false);
    }
  };

  // Garde anti-boucle : stocker les dernières valeurs
  const prevSearchRef = useRef({ searchTerm: '', selectedCity: '', selectedCategory: '', pageCategorie: null as string | null, filterPremium: false, filterCommerceLocal: false });
  const isInitialMount = useRef(true);

  useEffect(() => {
    // Au premier render, déclencher la recherche appropriée
    if (isInitialMount.current) {
      isInitialMount.current = false;
      console.log('[DEBUG INIT] Premier mount, déclenchement recherche initiale');
      // Si aucun filtre, on charge toutes les entreprises
      if (!searchTerm && !selectedCity && !selectedCategory && !pageCategorie && !filterPremium && !filterCommerceLocal) {
        console.log('[DEBUG INIT] Aucun filtre → fetchBusinesses()');
        fetchBusinesses();
      } else {
        // Si des filtres sont présents (depuis URL), on lance la recherche filtrée
        console.log('[DEBUG INIT] Filtres présents → performSearch()');
        performSearch();
      }
      return;
    }

    // Ne déclencher que si les valeurs ont VRAIMENT changé
    const hasRealChange =
      prevSearchRef.current.searchTerm !== searchTerm ||
      prevSearchRef.current.selectedCity !== selectedCity ||
      prevSearchRef.current.selectedCategory !== selectedCategory ||
      prevSearchRef.current.pageCategorie !== pageCategorie ||
      prevSearchRef.current.filterPremium !== filterPremium ||
      prevSearchRef.current.filterCommerceLocal !== filterCommerceLocal;

    if (!hasRealChange) {
      console.log('⏭️ [SKIP] Aucun changement réel détecté, skip');
      return;
    }

    console.log('🔄 [DEBUG useEffect] Changement détecté:', {
      searchTerm,
      selectedCity,
      selectedCategory,
      pageCategorie,
      filterPremium,
      filterCommerceLocal
    });

    // Mettre à jour les références
    prevSearchRef.current = { searchTerm, selectedCity, selectedCategory, pageCategorie, filterPremium, filterCommerceLocal };

    const delayDebounceFn = setTimeout(() => {
      if (searchTerm.length >= 1 || selectedCity || selectedCategory || filterPremium || filterCommerceLocal) {
        console.log('➡️ [DEBUG] Déclenchement de performSearch()');
        performSearch();
      } else {
        console.log('➡️ [DEBUG] Déclenchement de fetchBusinesses()');
        fetchBusinesses();
      }
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchTerm, selectedCity, selectedCategory, pageCategorie, filterPremium, filterCommerceLocal]);

  useEffect(() => {
    // ✅ CORRECTION BOUCLE INFINIE : enlever selectedBusiness des dépendances
    // car setSelectedBusiness() déclenche ce useEffect à nouveau
    if (preselectedBusinessId && !selectedBusiness && businesses.length > 0) {
      const found = businesses.find((b) => b.id === preselectedBusinessId);
      if (found) {
        console.log(`[DEBUG] Préselection entreprise trouvée: ${found.name}`);
        setSelectedBusiness(found);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [preselectedBusinessId, businesses]);

  const fetchBusinesses = async () => {
    console.log('═══════════════════════════════════════');
    console.log('🔍 [DEBUG fetchBusinesses] Démarrage...');
    console.log('═══════════════════════════════════════');

    setLoading(true);

    // Protection : forcer arrêt du loading après 10s max
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ [PROTECTION] fetchBusinesses timeout atteint, déblocage forcé');
      setLoading(false);
    }, 10000);

    try {
      let query = supabase
        .from(Tables.ENTREPRISE)
        .select('id, nom, secteur, "sous-catégories", "catégorie", gouvernorat, ville, adresse, telephone, email, site_web, description, services, image_url, logo_url, "statut Abonnement", "niveau priorité abonnement", "mots cles recherche", "Lien Instagram", "lien facebook", "Lien TikTok", "Lien LinkedIn", "Lien YouTube", lien_x, horaires_ok')
        .order('"niveau priorité abonnement"', { ascending: false, nullsFirst: false })
        .order('nom', { ascending: true })
        .limit(10);

      if (pageCategorie) {
        console.log(`[DEBUG] Filtre pageCategorie appliqué: "${pageCategorie}"`);
        query = query.contains('"liste pages"', [pageCategorie]);
      }

      console.log('[DEBUG] Exécution de la requête Supabase...');
      const { data, error } = await query;

      if (error) {
        console.error('❌ [ERREUR CRITIQUE] Échec de la requête Supabase:');
        console.error('Code erreur:', error.code);
        console.error('Message:', error.message);
        console.error('Details:', error.details);
        console.error('Hint:', error.hint);
        setBusinesses([]);
        return;
      }

      console.log(`[DEBUG] ✅ Données reçues: ${data?.length || 0} entreprises`);

      if (data && data.length > 0) {
        console.log('[DEBUG] Colonnes disponibles dans data[0]:', Object.keys(data[0]));
        console.log('[DEBUG] Exemple première entreprise:', {
          id: data[0].id,
          nom: data[0].nom,
          secteur: data[0].secteur,
          sous_categories: data[0]['sous-catégories'],
          categorie: data[0]['catégorie'],
          badges_from_db: data[0].badges,
          services: data[0].services?.substring(0, 50) + '...' || 'NULL',
          mots_cles_recherche: data[0]['mots cles recherche']?.substring(0, 100) + '...' || 'NULL',
          statut_abonnement: data[0]['statut Abonnement'],
          gouvernorat: data[0].gouvernorat,
          ville: data[0].ville
        });
      }

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

      console.log(`[DEBUG] ✅ Mapping terminé: ${mappedData.length} entreprises`);
      console.log('═══════════════════════════════════════\n');

      setBusinesses(mappedData);
    } catch (error) {
      console.error('❌ [ERROR] fetchBusinesses:', error);
      setBusinesses([]);
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
      console.log('✅ [DEBUG] fetchBusinesses terminé, loading=false');
    }
  };

  const performSearch = async () => {
    console.log('═══════════════════════════════════════');
    console.log('🔍 [DEBUG performSearch] Démarrage...');
    console.log('Terme recherché:', searchTerm);
    console.log('Ville sélectionnée:', selectedCity);
    console.log('Catégorie sélectionnée:', selectedCategory);
    console.log('Filter Premium:', filterPremium);
    console.log('Filter Commerce Local:', filterCommerceLocal);
    console.log('═══════════════════════════════════════');

    if (searchTerm.length === 0 && !selectedCity && !selectedCategory && !filterPremium && !filterCommerceLocal) {
      console.log('[DEBUG] Aucun filtre actif, appel de fetchBusinesses()');
      fetchBusinesses();
      return;
    }

    setSearching(true);

    // Protection : forcer arrêt du searching après 10s max
    const timeoutId = setTimeout(() => {
      console.warn('⚠️ [PROTECTION] performSearch timeout atteint, déblocage forcé');
      setSearching(false);
    }, 10000);
    try {
      let query = supabase
        .from(Tables.ENTREPRISE)
        .select('id, nom, secteur, "sous-catégories", "catégorie", gouvernorat, ville, adresse, telephone, email, site_web, description, services, image_url, logo_url, "statut Abonnement", "niveau priorité abonnement", "mots cles recherche", "Lien Instagram", "lien facebook", "Lien TikTok", "Lien LinkedIn", "Lien YouTube", lien_x, horaires_ok')
        .order('"niveau priorité abonnement"', { ascending: false, nullsFirst: false })
        .order('nom', { ascending: true })
        .limit(30);

      if (searchTerm && searchTerm.trim().length >= 2) {
        const searchPattern = `%${searchTerm.trim()}%`;
        console.log(`[DEBUG] Filtre Recherche: "${searchTerm}" (pattern: ${searchPattern})`);
        query = query.or(`nom.ilike.${searchPattern},"mots cles recherche".ilike.${searchPattern},description.ilike.${searchPattern}`);
      }

      if (selectedCity) {
        console.log(`[DEBUG] Filtre Gouvernorat: "${selectedCity}"`);
        query = query.eq('gouvernorat', selectedCity);
      }

      if (selectedCategory === 'finance') {
        console.log(`[DEBUG] Filtre Finance avec sous-catégories:`, FINANCE_SUBCATEGORIES);
        query = query.overlaps('"sous-catégories"', FINANCE_SUBCATEGORIES);
      } else if (selectedCategory) {
        console.log(`[DEBUG] Filtre Catégorie: "${selectedCategory}"`);
        query = query.contains('"sous-catégories"', [selectedCategory]);
      }

      if (filterPremium) {
        console.log(`[DEBUG] Filtre Premium activé (Elite/Premium/Artisan)`);
        query = query.or('"statut Abonnement".ilike.%elite%,"statut Abonnement".ilike.%premium%,"statut Abonnement".ilike.%artisan%');
      }

      if (filterCommerceLocal) {
        console.log(`[DEBUG] Filtre Commerce Local activé`);
        query = query.eq('"page commerce local"', true);
      }

      console.log('[DEBUG] Exécution de la requête Supabase...');
      const { data, error } = await query;

      if (error) {
        console.error('❌ [ERREUR CRITIQUE RECHERCHE] Échec de la requête Supabase:');
        console.error('Code erreur:', error.code);
        console.error('Message:', error.message);
        console.error('Details:', error.details);
        console.error('Hint:', error.hint);
        console.error('Filtres appliqués:', {
          searchTerm,
          selectedCity,
          selectedCategory,
          filterPremium
        });
        throw error;
      }

      console.log(`[DEBUG] ✅ Données reçues: ${data?.length || 0} entreprises`);

      if (data && data.length > 0) {
        console.log('[DEBUG] Colonnes disponibles dans data[0]:', Object.keys(data[0]));
        console.log('[DEBUG] Exemple première entreprise:', {
          id: data[0].id,
          nom: data[0].nom,
          badges_from_db: data[0].badges,
          services: data[0].services?.substring(0, 50) + '...' || 'NULL',
          mots_cles_recherche: data[0]['mots cles recherche']?.substring(0, 100) + '...' || 'NULL',
          sous_categories: data[0]['sous-catégories'],
          categorie: data[0]['catégorie'],
          statut_abonnement: data[0]['statut Abonnement'],
          gouvernorat: data[0].gouvernorat
        });
      }

      let mappedData = (data || []).map((item: any) => ({
        id: item.id,
        name: item.nom,
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
        badges: item.badges || [],
        mots_cles_recherche: item['mots cles recherche'] || '',
        instagram: item['Lien Instagram'] || '',
        facebook: item['lien facebook'] || '',
        tiktok: item['Lien TikTok'] || '',
        linkedin: item['Lien LinkedIn'] || '',
        youtube: item['Lien YouTube'] || '',
        horaires_ok: item.horaires_ok || null,
      }));

      console.log(`[DEBUG] Mapping terminé: ${mappedData.length} entreprises`);

      if (searchTerm && searchTerm.length > 0) {
        const normalizedSearchTerm = normalizeText(searchTerm);
        console.log(`\n🔎 [Recherche Multi-colonnes] Terme recherché: "${searchTerm}"`);
        console.log(`🔎 [Recherche Multi-colonnes] Terme normalisé: "${normalizedSearchTerm}"`);
        console.log(`📊 [Debug] Nombre total avant filtre: ${mappedData.length}`);

        if (mappedData.length > 0) {
          console.log(`📋 [Debug] Exemple entreprise:`, {
            nom: mappedData[0].name,
            badges: mappedData[0].badges,
            mots_cles_recherche: mappedData[0].mots_cles_recherche?.substring(0, 100) || 'NULL',
            sous_categories: mappedData[0].category
          });
        }

        mappedData = mappedData.filter((business) => {
          // Sécurité totale contre les undefined/null
          const matchNom = normalizeText(business.name || '').includes(normalizedSearchTerm);
          const matchSecteur = normalizeText(business.secteur || '').includes(normalizedSearchTerm);

          // PRIORITÉ RECHERCHE: Tous les badges sont indexés (même ceux non affichés)
          let matchBadges = false;
          let matchedBadge = null;
          if (Array.isArray(business.badges) && business.badges.length > 0) {
            // Parcours de TOUS les badges (pas seulement les 2 affichés)
            business.badges.forEach(badge => {
              const normalizedBadge = normalizeText(badge || '');
              if (normalizedBadge.includes(normalizedSearchTerm)) {
                matchBadges = true;
                matchedBadge = badge;
              }
            });
          }

          const matchMotsCles = normalizeText(business.mots_cles_recherche || '').includes(normalizedSearchTerm);
          const matchCategory = normalizeText(business.category || '').includes(normalizedSearchTerm);
          const matchServices = normalizeText(business.services || '').includes(normalizedSearchTerm);

          const isMatch = matchNom || matchSecteur || matchBadges || matchMotsCles || matchCategory || matchServices;

          if (isMatch) {
            console.log(`✅ Match trouvé:`, {
              nom: business.name,
              matchNom,
              matchSecteur,
              matchBadges,
              badgeMatche: matchedBadge,
              totalBadges: business.badges?.length || 0,
              matchMotsCles,
              matchCategory,
              matchServices,
              secteur: business.secteur || 'NULL',
              badges_complet: business.badges || 'NULL',
              mots_cles: (business.mots_cles_recherche || '').substring(0, 50) + '...',
              services: (business.services || '').substring(0, 50) + '...'
            });
          }

          return isMatch;
        });

        console.log(`\n[Recherche Multi-colonnes] ✅ Résultats filtrés: ${mappedData.length}`);
      }

      // Trier par priorité d'abonnement (Elite > Premium > Artisan > Découverte)
      mappedData.sort((a, b) => {
        const priorityA = getSubscriptionPriority(a.statut_abonnement);
        const priorityB = getSubscriptionPriority(b.statut_abonnement);
        return priorityB - priorityA;
      });

      console.log('═══════════════════════════════════════\n');

      setBusinesses(mappedData);

      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error('❌ [ERROR] performSearch:', error);
      setBusinesses([]);
    } finally {
      clearTimeout(timeoutId);
      setSearching(false);
      console.log('✅ [DEBUG] performSearch terminé, searching=false');
    }
  };

  const handleSuggestionSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { error } = await supabase.from('suggestions_entreprises').insert([
        {
          nom_entreprise: suggestionForm.name,
          secteur: suggestionForm.category,
          ville: suggestionForm.city || null,
          contact_suggere: `${suggestionForm.phone || ''} ${suggestionForm.email ? `- ${suggestionForm.email}` : ''}`.trim(),
          raison_suggestion: `${suggestionForm.description || ''}${suggestionForm.address ? `\nAdresse: ${suggestionForm.address}` : ''}${suggestionForm.website ? `\nSite web: ${suggestionForm.website}` : ''}`,
          submission_lang: language,
        },
      ]);

      if (error) throw error;

      setToast({
        message: language === 'fr'
          ? 'Merci ! Votre suggestion a été envoyée avec succès.'
          : language === 'ar'
          ? 'شكراً! تم إرسال اقتراحك بنجاح.'
          : 'Thank you! Your suggestion has been sent successfully.',
        type: 'success',
        isVisible: true,
      });

      setSuggestionForm({
        name: '',
        category: '',
        city: '',
        address: '',
        phone: '',
        email: '',
        website: '',
        description: '',
      });

      setTimeout(() => {
        setShowSuggestForm(false);
        if (onCloseSuggestionForm) onCloseSuggestionForm();
      }, 1500);
    } catch (error) {
      console.error('Error submitting suggestion:', error);
      setToast({
        message: language === 'fr'
          ? 'Une erreur est survenue. Veuillez réessayer.'
          : language === 'ar'
          ? 'حدث خطأ. يرجى المحاولة مرة أخرى.'
          : 'An error occurred. Please try again.',
        type: 'error',
        isVisible: true,
      });
    }
  };

  const categories = Array.isArray(businesses) ? [...new Set(businesses.map((b) => b.category).filter(Boolean))].sort() : [];
  const cities = Array.isArray(businesses) ? [...new Set(businesses.map((b) => b.city).filter(Boolean))].sort() : [];

  const filteredBusinesses = Array.isArray(chipFilteredBusinesses) ? chipFilteredBusinesses : [];

  const businessListItems = Array.isArray(businesses) ? businesses.slice(0, 20).map(business => ({
    name: business.name || 'Sans nom',
    url: `${window.location.origin}/#/business/${business.id}`
  })) : [];

  return (
    <div className="min-h-screen bg-[#F8F9FA]">
      {Array.isArray(businesses) && businesses.length > 0 && (
        <StructuredData
          data={generateCollectionPageSchema(
            'Annuaire des Entreprises en Tunisie - Dalil Tounes',
            'Trouvez les meilleures entreprises et professionnels en Tunisie par secteur d\'activité',
            businessListItems
          )}
        />
      )}

      <div className="max-w-7xl mx-auto">
        {/* Hero Section Premium - Style CitizensLeisure adapté */}
        <div className="relative mb-8">
          {/* Image de fond drapeau tunisien avec taille réduite */}
          <div className="relative h-64 md:h-72 overflow-hidden">
            <img
              src="https://kmvjegbtroksjqaqliyv.supabase.co/storage/v1/object/public/photos-dalil/drapeau-tunisie.jpg"
              alt="Drapeau de la Tunisie"
              className="w-full h-full object-cover brightness-105"
            />
            {/* Overlay bleu profond pour lisibilité */}
            <div className="absolute inset-0 bg-[#0c2461] opacity-15"></div>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4 sm:px-6">
            {/* Titre Principal */}
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#D4AF37] mb-3" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9)' }}>
              {t.businesses.hero.title}
            </h1>

            {/* Texte descriptif intégré dans le header */}
            <div className="max-w-4xl mx-auto mt-4">
              <p className="text-white/95 text-base md:text-lg leading-relaxed italic font-light" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8), 0px 0px 10px rgba(0,0,0,0.5)' }}>
                {t.home.mission.description}
              </p>
            </div>
          </div>
        </div>


        {/* Bandeau d'événements entreprises */}
        <section id="section-evenements-entreprise" className="mb-6 px-4 scroll-mt-24">
          <FeaturedEventsCarousel />
        </section>

        {/* Sections Visuelles - Design Bordeaux & Or */}
        <div className="mb-8 px-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Carte Partenaires */}
            <div className="relative overflow-hidden rounded-xl h-48" style={{ border: '2px solid #D4AF37' }}>
              <img
                src={getSupabaseImageUrl('partenaires-fournisseurs.jpg')}
                alt="Collaboration entre entreprises"
                className="absolute inset-0 w-full h-full object-cover brightness-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#800020]/70 to-[#4A1D43]/70"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <h4 className="text-lg font-bold text-[#D4AF37] mb-2">
                  {t.businesses.categories.partners.title}
                </h4>
                <p className="text-white text-sm mb-4 line-clamp-2">
                  {t.businesses.categories.partners.description}
                </p>
                <button
                  onClick={() => onNavigate && onNavigate('partnerSearch')}
                  className="px-5 py-2 text-sm font-medium bg-white text-[#800020] rounded-lg hover:shadow-lg transition-all"
                  style={{ border: '1px solid #D4AF37' }}
                >
                  Accéder
                </button>
              </div>
            </div>

            {/* Carte Événements */}
            <div className="relative overflow-hidden rounded-xl h-48" style={{ border: '2px solid #D4AF37' }}>
              <img
                src={getSupabaseImageUrl('evenement entreprise.jpg')}
                alt="Événements entreprise"
                className="absolute inset-0 w-full h-full object-cover brightness-105"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-br from-[#800020]/70 to-[#4A1D43]/70"></div>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <h4 className="text-lg font-bold text-[#D4AF37] mb-2">
                  {t.businesses.categories.events.title}
                </h4>
                <p className="text-white text-sm mb-4 line-clamp-2">
                  {t.businesses.categories.events.description}
                </p>
                <button
                  onClick={() => onNavigate && onNavigate('businessEvents')}
                  className="px-5 py-2 text-sm font-medium bg-white text-[#800020] rounded-lg hover:shadow-lg transition-all"
                  style={{ border: '1px solid #D4AF37' }}
                >
                  Accéder
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Boutons d'accès rapide - Design Premium */}
        <div id="suggest-business" className="mb-8 px-4 flex flex-wrap gap-4 justify-center scroll-mt-24">
          <button
            type="button"
            onClick={() => setShowRegistrationForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-white text-[#4A1D43] text-sm md:text-base font-medium hover:shadow-lg transition-all"
            style={{ border: '2px solid #D4AF37' }}
          >
            Inscrire mon entreprise
          </button>

          <button
            type="button"
            onClick={() => {
              if (onNavigate) onNavigate('candidateList');
            }}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#4A1D43] text-white text-sm md:text-base font-medium hover:bg-[#5A2D53] transition-colors shadow-sm hover:shadow-md"
            style={{ border: '1px solid #D4AF37' }}
          >
            Voir les candidats disponibles
          </button>

          <button
            type="button"
            onClick={() => setShowSuggestForm(true)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[#4A1D43] text-white text-sm md:text-base font-medium hover:bg-[#5A2D53] transition-colors shadow-sm hover:shadow-md"
            style={{ border: '1px solid #D4AF37' }}
          >
            <Plus className="w-4 h-4" />
            {t.home.suggestBusiness}
          </button>
        </div>

        {/* Filtres chips pour affiner les résultats */}
        {availableCategories.length > 0 && (
          <div className="mb-6 px-4">
            <FilterChips
              categories={availableCategories}
              selectedCategories={selectedChipCategories}
              onToggleCategory={handleToggleChipCategory}
              onClearAll={handleClearAllChips}
            />
          </div>
        )}

        {/* Tags de filtres actifs - Design Premium */}
        {(selectedCity || selectedCategory) && (
          <div className="mb-8 px-4 flex flex-wrap gap-2 items-center">
            {selectedCity && (
              <span className="inline-flex items-center gap-1 bg-[#D4AF37]/10 text-[#4A1D43] px-3 py-1.5 rounded-full text-sm font-medium" style={{ border: '1px solid #D4AF37' }}>
                <MapPin className="w-3.5 h-3.5" />
                {selectedCity}
              </span>
            )}
            {selectedCategory && (
              <span className="inline-flex items-center gap-1 bg-[#D4AF37]/10 text-[#4A1D43] px-3 py-1.5 rounded-full text-sm font-medium" style={{ border: '1px solid #D4AF37' }}>
                <Building2 className="w-3.5 h-3.5" />
                {selectedCategory}
              </span>
            )}
          </div>
        )}

        {pageCategorie && (
          <div className="mb-6 px-4 flex items-center gap-2">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-lg shadow-sm" style={{ border: '1px solid #D4AF37' }}>
              <span className="text-sm font-medium text-[#4A1D43]">
                {t.businesses.activeFilter}: {pageCategorie}
              </span>
              <button
                onClick={() => {
                  setPageCategorie(null);
                  navigate('/entreprises');
                }}
                className="text-[#4A1D43] hover:text-[#D4AF37] transition"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {showSuggestForm && (
          <div className="fixed inset-0 bg-black/80 z-[99999] flex items-center justify-center p-4" onClick={(e) => e.target === e.currentTarget && setShowSuggestForm(false)}>
            <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative z-[100000]">
              <div className="sticky top-0 bg-white border-b px-6 py-4 flex justify-between items-center">
                <h2 className="text-xl font-medium text-gray-900">{t.businesses.suggestTitle}</h2>
                <button
                  onClick={() => {
                    setShowSuggestForm(false);
                    if (onCloseSuggestionForm) onCloseSuggestionForm();
                  }}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <form onSubmit={handleSuggestionSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.businesses.form.name} *</label>
                  <input
                    type="text"
                    required
                    value={suggestionForm.name}
                    onChange={(e) => setSuggestionForm({ ...suggestionForm, name: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.businesses.form.category} *</label>
                    <input
                      type="text"
                      required
                      value={suggestionForm.category}
                      onChange={(e) => setSuggestionForm({ ...suggestionForm, category: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.businesses.form.city} *</label>
                    <input
                      type="text"
                      required
                      value={suggestionForm.city}
                      onChange={(e) => setSuggestionForm({ ...suggestionForm, city: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.businesses.form.address} *</label>
                  <input
                    type="text"
                    required
                    value={suggestionForm.address}
                    onChange={(e) => setSuggestionForm({ ...suggestionForm, address: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.businesses.form.phone} *</label>
                    <input
                      type="tel"
                      required
                      value={suggestionForm.phone}
                      onChange={(e) => setSuggestionForm({ ...suggestionForm, phone: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">{t.businesses.form.email} *</label>
                    <input
                      type="email"
                      required
                      value={suggestionForm.email}
                      onChange={(e) => setSuggestionForm({ ...suggestionForm, email: e.target.value })}
                      className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.businesses.form.website}</label>
                  <input
                    type="url"
                    value={suggestionForm.website}
                    onChange={(e) => setSuggestionForm({ ...suggestionForm, website: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t.businesses.form.description} *</label>
                  <textarea
                    required
                    rows={3}
                    value={suggestionForm.description}
                    onChange={(e) => setSuggestionForm({ ...suggestionForm, description: e.target.value })}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setShowSuggestForm(false);
                      if (onCloseSuggestionForm) onCloseSuggestionForm();
                    }}
                    className="flex-1 px-4 py-2 text-sm border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
                  >
                    {t.common.cancel}
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 text-sm bg-[#4A1D43] text-white rounded-md hover:bg-[#5A2D53]"
                    style={{ border: '1px solid #D4AF37' }}
                  >
                    {t.businesses.form.submit}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Barre de recherche entreprises - Z-index élevé pour interaction */}
        <div id="section-recherche-b2b" className="mb-8 px-4 scroll-mt-24 isolate" style={{ position: 'relative', zIndex: 999 }}>
          <CategorySearchBar
            listePageValue={null}
            placeholder={language === 'fr' ? 'Rechercher une entreprise...' : language === 'ar' ? 'البحث عن شركة...' : 'Search for a business...'}
            onSelectBusiness={async (businessId) => {
              try {
                const { data, error } = await supabase
                  .from(Tables.ENTREPRISE)
                  .select('*')
                  .eq('id', businessId)
                  .single();

                if (!error && data) {
                  const businessData: Business = {
                    id: data.id,
                    name: data.nom || '',
                    category: data.categorie || '',
                    subCategories: data.sous_categories || '',
                    city: data.ville || '',
                    address: data.adresse || '',
                    phone: data.telephone || '',
                    email: data.email || '',
                    website: data.site_web || '',
                    description: data.description || '',
                    services: data.services || '',
                    imageUrl: data.image_url,
                    logoUrl: data.logo_url,
                    gouvernorat: data.gouvernorat || '',
                    secteur: data.secteur || '',
                    statut_abonnement: data['statut Abonnement'],
                    'niveau priorité abonnement': data['niveau priorité abonnement'],
                    badges: data.badges || [],
                    mots_cles_recherche: data['mots cles recherche'] || '',
                    instagram: data['Lien Instagram'] || '',
                    facebook: data['lien facebook'] || '',
                    tiktok: data['Lien TikTok'] || '',
                    linkedin: data['Lien LinkedIn'] || '',
                    youtube: data['Lien YouTube'] || '',
                    lien_x: data.lien_x || '',
                    horaires_ok: data.horaires_ok
                  };
                  setSelectedBusiness(businessData);
                }
              } catch (err) {
                console.error('Erreur lors de la récupération de l\'entreprise:', err);
              }
            }}
            onSearch={(query, ville) => {
              setSearchTerm(query);
              setSelectedCity(ville);
            }}
            onClear={() => {
              setSearchTerm('');
              setSelectedCity('');
              setSelectedCategory('');
              setFilterPremium(false);
              setFilterCommerceLocal(false);
            }}
          />
        </div>

        {/* Affichage des résultats : avec ou sans recherche active */}
        <div ref={resultsRef} className="mb-12">
          {(loading || searching) ? (
            <div className="text-center py-12">
              <div className="inline-block w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-3 text-sm text-gray-600">{searching ? t.businesses.searching || t.common.loading : t.common.loading}</p>
            </div>
          ) : filteredBusinesses.length === 0 ? (
            <div className="text-center py-12">
              <Building2 className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <p className="text-sm text-gray-600">
                {hasActiveSearch ? t.common.noResults : 'Aucune entreprise disponible'}
              </p>
            </div>
          ) : (
            <div className="px-4">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-[#4A1D43]">
                  {hasActiveSearch ? 'Résultats de votre recherche' : 'Entreprises en vedette'}
                  <span className="ms-2 text-sm text-gray-500 font-normal">
                    ({hasActiveSearch ? filteredBusinesses.length : Math.min(9, filteredBusinesses.length)} {filteredBusinesses.length > 1 ? 'entreprises' : 'entreprise'})
                  </span>
                </h3>
                {hasActiveSearch && (
                  <button
                    onClick={() => {
                      setSearchTerm('');
                      setSelectedCity('');
                      setSelectedCategory('');
                      setPageCategorie(null);
                      setFilterPremium(false);
                      navigate('/entreprises');
                    }}
                    className="text-xs text-[#4A1D43] hover:text-[#D4AF37] font-medium"
                  >
                    Réinitialiser
                  </button>
                )}
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {Array.isArray(filteredBusinesses) && filteredBusinesses.slice(0, hasActiveSearch ? filteredBusinesses.length : 9).map((business) => {
                  if (!business || !business.id) return null;

                  return (
                    <BusinessCard
                      key={business.id}
                      business={{
                        id: business.id,
                        name: business.name,
                        category: business.category,
                        gouvernorat: business.gouvernorat,
                        statut_abonnement: business.statut_abonnement,
                        badges: business.badges || [],
                        imageUrl: business.imageUrl,
                        horaires_ok: business.horaires_ok
                      }}
                      onClick={() => {
                        console.log('🔍 [BusinessCard] Ouverture modal pour:', business.name, business.id);
                        setSelectedBusiness(business);
                      }}
                      variant="premium"
                    />
                  );
                })}
              </div>

              {!hasActiveSearch && filteredBusinesses.length > 9 && (
                <div className="mt-6 text-center">
                  <p className="text-sm text-gray-600 mb-3">
                    Vous recherchez une entreprise spécifique ? Utilisez la barre de recherche ci-dessus
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 rounded-lg text-xs text-[#4A1D43]" style={{ border: '1px solid #D4AF37' }}>
                    <Search className="w-4 h-4" />
                    <span className="font-medium">Plus de {filteredBusinesses.length - 9} entreprises disponibles via la recherche</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {selectedBusiness && (
          <BusinessDetail
            business={selectedBusiness}
            onClose={() => setSelectedBusiness(null)}
            asModal={true}
          />
        )}

        {/* Modal Formulaire Inscription Entreprise */}
        {showRegistrationForm && (
          <RegistrationForm onClose={() => setShowRegistrationForm(false)} />
        )}

        {/* Toast Notification */}
        <Toast
          message={toast.message}
          type={toast.type}
          isVisible={toast.isVisible}
          onClose={() => setToast({ ...toast, isVisible: false })}
          duration={4000}
        />
      </div>
    </div>
  );
};
