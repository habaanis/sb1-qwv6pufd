import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Calendar, Users, DollarSign, Star, Ticket, Music, Sparkles, PartyPopper, Clock, ArrowLeft, ChevronLeft, ChevronRight, Camera, Waves, Utensils, Film, MapPinned, Plus } from 'lucide-react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { supabase } from '../lib/BoltDatabase';
import { useLanguage } from '../context/LanguageContext';
import { Language, translations as i18nTranslations } from '../lib/i18n';
import LoisirSearchBar from '../components/LoisirSearchBar';
import { getSupabaseImageUrl } from '../lib/imageUtils';
import EventCard from '../components/EventCard';
import LeisureEventProposalForm from '../components/LeisureEventProposalForm';
import { LOISIRS_CATEGORIES_KEYS } from '../lib/loisirCategories';
import { SECTEURS_CULTURE } from '../lib/cultureEventCategories';
import BackButton from '../components/BackButton';
import CategorySearchBar from '../components/CategorySearchBar';
import { UnifiedBusinessCard } from '../components/UnifiedBusinessCard';
import { BusinessDetail } from '../components/BusinessDetail';
import { useNavigate } from '../lib/url';

const GOUVERNORATS_TUNISIE = [
  'Tunis',
  'Ariana',
  'Ben Arous',
  'Manouba',
  'Nabeul',
  'Zaghouan',
  'Bizerte',
  'Béja',
  'Le Kef',
  'Siliana',
  'Sousse',
  'Monastir',
  'Mahdia',
  'Sfax',
  'Kairouan',
  'Kasserine',
  'Sidi Bouzid',
  'Gabès',
  'Medenine',
  'Tataouine',
  'Gafsa',
  'Tozeur',
  'Kebili',
  'Jendouba'
];

interface Evenement {
  id: string;
  titre: string;
  description: string;
  description_courte?: string;
  date_debut: string;
  date_fin: string;
  localisation_ville: string;
  lieu?: string;
  prix: string;
  type_evenement: string;
  type_affichage?: string;
  lien_billetterie?: string;
  image_url?: string;
  telephone_contact?: string;
  niveau_abonnement: string;
  organisateur?: string;
  est_annuel?: boolean;
  secteur_evenement?: string;
  accessible_enfants?: boolean;
  note_moyenne?: number;
  nombre_avis?: number;
}

interface Etablissement {
  id: string;
  nom: string;
  secteur: string;
  sous_categories?: string;
  ville: string;
  adresse?: string;
  telephone?: string;
  latitude?: number;
  longitude?: number;
}

interface CitizensLeisureProps {
  onNavigateBack?: () => void;
}

export default function CitizensLeisure({ onNavigateBack }: CitizensLeisureProps = {}) {
  const navigate = useNavigate();
  const { language } = useLanguage();

  const url = new URL(window.location.href);
  const qParam = (url.searchParams.get('q') || '').trim();
  const villeParam = (url.searchParams.get('ville') || '').trim();
  const tabParam = url.searchParams.get('tab') as 'evenements' | 'lieux' | null;
  const categoryParam = url.searchParams.get('category') || '';

  const [activeTab, setActiveTab] = useState<'evenements' | 'lieux'>(tabParam || 'evenements');
  const [categoryFilter, setCategoryFilter] = useState<string>(categoryParam);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedTemporalite, setSelectedTemporalite] = useState('all');
  const [kidsOnly, setKidsOnly] = useState(false);
  const [selectedPrice, setSelectedPrice] = useState('all');
  const [selectedActivityType, setSelectedActivityType] = useState('all');
  const [evenements, setEvenements] = useState<Evenement[]>([]);
  const [lieux, setLieux] = useState<Etablissement[]>([]);
  const [featuredEvents, setFeaturedEvents] = useState<Evenement[]>([]);
  const [weeklyEvent, setWeeklyEvent] = useState<Evenement | null>(null);
  const [monthlyEvent, setMonthlyEvent] = useState<Evenement | null>(null);
  const [selectedBusiness, setSelectedBusiness] = useState<any | null>(null);
  const [annualEvent, setAnnualEvent] = useState<Evenement | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showMap, setShowMap] = useState(false);
  const [selectedMarker, setSelectedMarker] = useState<string | null>(null);
  const carouselRef = useRef<HTMLDivElement>(null);
  const [hoveredEventId, setHoveredEventId] = useState<string | null>(null);
  const [showProposalForm, setShowProposalForm] = useState(false);

  const translations: Record<Language, any> = {
    fr: {
      title: 'Agenda Loisirs & événements',
      subtitle: 'Votre guide Premium des sorties en Tunisie.',
      description: 'Marre de l\'ennui ? Devenez l\'expert de votre propre ville ! De la plage la plus secrète au festival incontournable, Dalil Tounes vous connecte aux meilleures activités et événements de votre ville et de toute la Tunisie.',
      backButton: 'Retour aux catégories',
      premiumAgenda: {
        weekly: {
          badge: 'Cette Semaine',
          title: 'Concert de Malouf',
          date: 'Vendredi 7 Fév.',
          location: 'Médina de Mahdia'
        },
        monthly: {
          badge: 'Ce Mois-ci',
          title: 'Festival des Cerfs-Volants',
          date: 'Du 15 au 20 Fév.',
          location: 'Plage de Mahdia'
        },
        annual: {
          badge: 'Événements Annuels',
          title: 'Festival International de Musique Symphonique',
          date: 'Été 2026',
          location: 'Amphithéâtre d\'El Jem'
        }
      },
      tabEvents: 'ÉVÉNEMENTS',
      tabPlaces: 'LIEUX PERMANENTS',
      searchPlaceholder: 'Ex: cinéma, festival, plage, concert...',
      locationAll: 'Toute la Tunisie',
      temporaliteAll: 'Toutes les dates',
      temporaliteWeekly: 'Cette Semaine',
      temporaliteMonthly: 'Ce Mois-ci',
      temporaliteAnnual: 'Cette Année',
      kidsAccessible: 'Accessible aux enfants',
      priceAll: 'Tous les prix',
      priceFree: 'Gratuit',
      pricePaid: 'Payant',
      featured: 'À la Une - Événements',
      buyTickets: 'Acheter des billets',
      moreInfo: 'Plus d\'infos',
      noEvents: 'Aucun événement trouvé',
      noPlaces: 'Aucun lieu trouvé',
      modifyFilters: 'Essayez de modifier vos filtres',
      touristInfo: 'Vous êtes visiteur ? Découvrez notre guide des Sites Historiques avec accès aux informations en Anglais/Français.',
      touristLink: 'Guide Touristique',
      organizer: 'Organisé par',
      from: 'Du',
      to: 'au',
      loading: 'Chargement...',
      authenticTourism: 'Découvrez la Tunisie des Terres. Loin des circuits balisés et du béton des hôtels, l\'âme de la Tunisie se cache dans ses villages de montagne, ses sites antiques méconnus et le savoir-faire de ses artisans. Nous avons sélectionné pour vous des expériences authentiques pour valoriser notre patrimoine et soutenir l\'économie locale.',
      authenticTourismHighlight: 'Explorez l\'intérieur, rencontrez l\'histoire.',
      proposeEvent: 'Proposer un événement loisir'
    },
    en: {
      title: 'Leisure & Events Agenda',
      subtitle: 'Your Premium guide to outings in Tunisia.',
      description: 'Your source of inspiration for outings! Find the nearest cinema, the best beach, or discover upcoming cultural events, festivals and concerts. From local to national, plan your free time with Dalil Tounes.',
      backButton: 'Back to categories',
      premiumAgenda: {
        weekly: {
          badge: 'This Week',
          title: 'Malouf Concert',
          date: 'Friday, Feb 7',
          location: 'Mahdia Medina'
        },
        monthly: {
          badge: 'This Month',
          title: 'Kite Festival',
          date: 'Feb 15-20',
          location: 'Mahdia Beach'
        },
        annual: {
          badge: 'Annual Events',
          title: 'International Symphonic Music Festival',
          date: 'Summer 2026',
          location: 'El Jem Amphitheater'
        }
      },
      tabEvents: 'EVENTS',
      tabPlaces: 'PERMANENT PLACES',
      searchPlaceholder: 'Ex: cinema, festival, beach, concert...',
      locationAll: 'All Tunisia',
      temporaliteAll: 'All dates',
      temporaliteWeekly: 'This Week',
      temporaliteMonthly: 'This Month',
      temporaliteAnnual: 'This Year',
      kidsAccessible: 'Kids friendly',
      priceAll: 'All prices',
      priceFree: 'Free',
      pricePaid: 'Paid',
      featured: 'Featured Events',
      buyTickets: 'Buy tickets',
      moreInfo: 'More info',
      noEvents: 'No events found',
      noPlaces: 'No places found',
      modifyFilters: 'Try modifying your filters',
      touristInfo: 'Are you a visitor? Discover our Historical Sites guide with access to information in English/French.',
      touristLink: 'Tourist Guide',
      organizer: 'Organized by',
      from: 'From',
      to: 'to',
      loading: 'Loading...',
      authenticTourism: 'Discover Authentic Tunisia. Far from standard tourist circuits and hotel concrete, Tunisia\'s soul lies in its mountain villages, ancient hidden sites, and artisan craftsmanship. We\'ve selected authentic experiences to showcase our heritage and support the local economy.',
      authenticTourismHighlight: 'Explore the interior, meet history.',
      proposeEvent: 'Propose a leisure event'
    },
    ar: {
      title: 'أجندة الترفيه والفعاليات',
      subtitle: 'دليلك البريميوم للخروجات في تونس.',
      description: 'مصدر إلهامك للخروج! ابحث عن أقرب سينما، أفضل شاطئ، أو اكتشف الفعاليات الثقافية والمهرجانات والحفلات القادمة. من المحلي إلى الوطني، خطط لوقت فراغك مع دليل تونس.',
      backButton: 'العودة إلى الفئات',
      premiumAgenda: {
        weekly: {
          badge: 'هذا الأسبوع',
          title: 'حفل المالوف',
          date: 'الجمعة 7 فبراير',
          location: 'مدينة المهدية العتيقة'
        },
        monthly: {
          badge: 'هذا الشهر',
          title: 'مهرجان الطائرات الورقية',
          date: 'من 15 إلى 20 فبراير',
          location: 'شاطئ المهدية'
        },
        annual: {
          badge: 'الفعاليات السنوية',
          title: 'مهرجان الموسيقى السيمفونية الدولي',
          date: 'صيف 2026',
          location: 'مسرح الجم الروماني'
        }
      },
      tabEvents: 'الفعاليات',
      tabPlaces: 'الأماكن الدائمة',
      searchPlaceholder: 'مثال: سينما، مهرجان، شاطئ، حفل...',
      locationAll: 'كل تونس',
      temporaliteAll: 'جميع التواريخ',
      temporaliteWeekly: 'هذا الأسبوع',
      temporaliteMonthly: 'هذا الشهر',
      temporaliteAnnual: 'هذا العام',
      kidsAccessible: 'مناسب للأطفال',
      priceAll: 'جميع الأسعار',
      priceFree: 'مجاني',
      pricePaid: 'مدفوع',
      featured: 'الفعاليات المميزة',
      buyTickets: 'شراء التذاكر',
      moreInfo: 'المزيد من المعلومات',
      noEvents: 'لم يتم العثور على فعاليات',
      noPlaces: 'لم يتم العثور على أماكن',
      modifyFilters: 'حاول تعديل المرشحات',
      touristInfo: 'هل أنت زائر؟ اكتشف دليل المواقع التاريخية مع الوصول إلى المعلومات بالإنجليزية/الفرنسية.',
      touristLink: 'دليل السياحة',
      organizer: 'منظم من قبل',
      from: 'من',
      to: 'إلى',
      loading: 'جاري التحميل...',
      authenticTourism: 'اكتشف تونس الأصيلة. بعيداً عن المسارات السياحية المعتادة وخرسانة الفنادق، تكمن روح تونس في قراها الجبلية ومواقعها الأثرية المخفية وحرفية حرفييها. لقد اخترنا لك تجارب أصيلة لتسليط الضوء على تراثنا ودعم الاقتصاد المحلي.',
      authenticTourismHighlight: 'استكشف الداخل، التقِ بالتاريخ.',
      proposeEvent: 'اقترح حدثاً ترفيهياً'
    },
    it: {
      title: 'Agenda Tempo Libero ed Eventi',
      subtitle: 'La tua guida Premium alle uscite in Tunisia.',
      description: 'La tua fonte di ispirazione per le uscite! Trova il cinema più vicino, la migliore spiaggia, o scopri eventi culturali, festival e concerti in arrivo. Dal locale al nazionale, pianifica il tuo tempo libero con Dalil Tounes.',
      backButton: 'Torna alle categorie',
      premiumAgenda: {
        weekly: {
          badge: 'Questa Settimana',
          title: 'Concerto di Malouf',
          date: 'Venerdì 7 Feb.',
          location: 'Medina di Mahdia'
        },
        monthly: {
          badge: 'Questo Mese',
          title: 'Festival degli Aquiloni',
          date: 'Dal 15 al 20 Feb.',
          location: 'Spiaggia di Mahdia'
        },
        annual: {
          badge: 'Eventi Annuali',
          title: 'Festival Internazionale di Musica Sinfonica',
          date: 'Estate 2026',
          location: 'Anfiteatro di El Jem'
        }
      },
      tabEvents: 'EVENTI',
      tabPlaces: 'LUOGHI PERMANENTI',
      searchPlaceholder: 'Es: cinema, festival, spiaggia, concerto...',
      locationAll: 'Tutta la Tunisia',
      locationMahdia: 'Mahdia',
      locationCenter: 'Regione Centro',
      locationNorth: 'Regione Nord',
      locationSouth: 'Regione Sud',
      temporaliteAll: 'Tutte le date',
      temporaliteWeekly: 'Questa Settimana',
      temporaliteMonthly: 'Questo Mese',
      temporaliteAnnual: 'Quest\'Anno',
      kidsAccessible: 'Adatto ai bambini',
      priceAll: 'Tutti i prezzi',
      priceFree: 'Gratuito',
      pricePaid: 'A pagamento',
      featured: 'Eventi in Evidenza',
      buyTickets: 'Acquista biglietti',
      moreInfo: 'Più informazioni',
      noEvents: 'Nessun evento trovato',
      noPlaces: 'Nessun luogo trovato',
      modifyFilters: 'Prova a modificare i filtri',
      touristInfo: 'Sei un visitatore? Scopri la nostra guida ai Siti Storici con accesso alle informazioni in Inglese/Francese.',
      touristLink: 'Guida Turistica',
      organizer: 'Organizzato da',
      from: 'Dal',
      to: 'al',
      loading: 'Caricamento...',
      authenticTourism: 'Scopri la Tunisia Autentica. Lontano dai circuiti turistici standard e dal cemento degli hotel, l\'anima della Tunisia si trova nei suoi villaggi di montagna, nei siti antichi nascosti e nell\'artigianato. Abbiamo selezionato esperienze autentiche per valorizzare il nostro patrimonio e sostenere l\'economia locale.',
      authenticTourismHighlight: 'Esplora l\'interno, incontra la storia.',
      proposeEvent: 'Proponi un evento per il tempo libero'
    },
    ru: {
      title: 'Программа Досуга и Мероприятий',
      subtitle: 'Ваш премиум-гид по развлечениям в Тунисе.',
      description: 'Ваш источник вдохновения для прогулок! Найдите ближайший кинотеатр, лучший пляж или откройте для себя предстоящие культурные мероприятия, фестивали и концерты. От местного до национального, планируйте свое свободное время с Dalil Tounes.',
      backButton: 'Вернуться к категориям',
      premiumAgenda: {
        weekly: {
          badge: 'На Этой Неделе',
          title: 'Концерт Малуфа',
          date: 'Пятница, 7 Февраля',
          location: 'Медина Махдии'
        },
        monthly: {
          badge: 'В Этом Месяце',
          title: 'Фестиваль Воздушных Змеев',
          date: 'С 15 по 20 Февр.',
          location: 'Пляж Махдии'
        },
        annual: {
          badge: 'Ежегодные События',
          title: 'Международный Фестиваль Симфонической Музыки',
          date: 'Лето 2026',
          location: 'Амфитеатр Эль-Джема'
        }
      },
      tabEvents: 'МЕРОПРИЯТИЯ',
      tabPlaces: 'ПОСТОЯННЫЕ МЕСТА',
      searchPlaceholder: 'Например: кино, фестиваль, пляж, концерт...',
      locationAll: 'Весь Тунис',
      locationMahdia: 'Махдия',
      locationCenter: 'Центральный регион',
      locationNorth: 'Северный регион',
      locationSouth: 'Южный регион',
      temporaliteAll: 'Все даты',
      temporaliteWeekly: 'На Этой Неделе',
      temporaliteMonthly: 'В Этом Месяце',
      temporaliteAnnual: 'В Этом Году',
      kidsAccessible: 'Подходит для детей',
      priceAll: 'Все цены',
      priceFree: 'Бесплатно',
      pricePaid: 'Платно',
      featured: 'Избранные события',
      buyTickets: 'Купить билеты',
      moreInfo: 'Подробнее',
      noEvents: 'События не найдены',
      noPlaces: 'Места не найдены',
      modifyFilters: 'Попробуйте изменить фильтры',
      touristInfo: 'Вы посетитель? Откройте для себя наш гид по историческим местам с доступом к информации на английском/французском.',
      touristLink: 'Туристический гид',
      organizer: 'Организатор',
      from: 'С',
      to: 'по',
      loading: 'Загрузка...',
      authenticTourism: 'Откройте для себя настоящий Тунис. Вдали от стандартных туристических маршрутов и бетона отелей, душа Туниса живет в горных деревнях, скрытых древних местах и ремесленном мастерстве. Мы отобрали аутентичные впечатления, чтобы показать наше наследие и поддержать местную экономику.',
      authenticTourismHighlight: 'Исследуйте внутренние районы, встретьте историю.',
      proposeEvent: 'Предложить развлекательное мероприятие'
    }
  };

  const t = translations[language];

  const getTranslatedText = (item: Evenement, field: 'titre' | 'description'): string => {
    return field === 'titre' ? item.titre : item.description;
  };

  const formatEventDate = (dateDebut: string, dateFin: string): string => {
    const debut = new Date(dateDebut);
    const fin = new Date(dateFin);

    const options: Intl.DateTimeFormatOptions = {
      weekday: 'long',
      day: 'numeric',
      month: 'short'
    };

    if (debut.toDateString() === fin.toDateString()) {
      return debut.toLocaleDateString(language === 'ar' ? 'ar-TN' : language === 'en' ? 'en-US' : 'fr-FR', options);
    } else {
      return `${debut.toLocaleDateString(language === 'ar' ? 'ar-TN' : language === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' })} - ${fin.toLocaleDateString(language === 'ar' ? 'ar-TN' : language === 'en' ? 'en-US' : 'fr-FR', { day: 'numeric', month: 'short' })}`;
    }
  };

  useEffect(() => {
    if (qParam) setSearchQuery(qParam);
    if (villeParam) setSelectedLocation(villeParam);

    loadFeaturedEvents();
    loadAgendaEvents();
    if (activeTab === 'evenements') {
      loadEvenements();
    } else {
      loadLieux();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, selectedLocation, selectedTemporalite, kidsOnly, selectedPrice, searchQuery, categoryFilter, selectedActivityType]);

  const loadFeaturedEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('evenements_locaux')
        .select('*')
        .eq('est_valide', true)
        .gte('date_debut', new Date().toISOString())
        .order('date_debut', { ascending: true })
        .limit(5);

      if (!error && data) {
        setFeaturedEvents(data);
      }
    } catch (error) {
      console.error('Erreur chargement événements VIP:', error);
    }
  };

  const loadAgendaEvents = async () => {
    try {
      const { data: weekly } = await supabase
        .from('evenements_locaux')
        .select('*')
        .eq('est_valide', true)
        .eq('type_affichage', 'hebdo')
        .order('date_debut', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (weekly) {
        setWeeklyEvent(weekly);
      }

      const { data: monthly } = await supabase
        .from('evenements_locaux')
        .select('*')
        .eq('est_valide', true)
        .eq('type_affichage', 'mensuel')
        .order('date_debut', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (monthly) {
        setMonthlyEvent(monthly);
      }

      const { data: annual } = await supabase
        .from('evenements_locaux')
        .select('*')
        .eq('est_valide', true)
        .eq('type_affichage', 'annuel')
        .order('date_debut', { ascending: true })
        .limit(1)
        .maybeSingle();

      if (annual) {
        setAnnualEvent(annual);
      }
    } catch (error) {
      console.error('Erreur chargement événements agenda:', error);
    }
  };

  const loadEvenements = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('evenements_locaux')
        .select('*')
        .eq('est_valide', true)
        .gte('date_debut', new Date().toISOString());

      if (searchQuery) {
        query = query.or(`titre.ilike.%${searchQuery}%,description_courte.ilike.%${searchQuery}%,secteur_evenement.ilike.%${searchQuery}%`);
      }

      if (selectedLocation !== 'all') {
        query = query.ilike('localisation_ville', selectedLocation);
      }

      if (selectedTemporalite === 'hebdo') {
        query = query.eq('type_affichage', 'hebdo');
      } else if (selectedTemporalite === 'mensuel') {
        query = query.eq('type_affichage', 'mensuel');
      } else if (selectedTemporalite === 'annuel') {
        query = query.eq('type_affichage', 'annuel');
      }

      if (selectedPrice !== 'all') {
        query = query.eq('prix', selectedPrice);
      }

      if (selectedActivityType !== 'all' && selectedActivityType !== '') {
        query = query.eq('secteur_evenement', selectedActivityType);
      }

      const { data, error } = await query.order('date_debut', { ascending: true });

      if (!error && data) {
        setEvenements(data);
      }
    } catch (error) {
      console.error('Erreur chargement événements:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLieux = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from('entreprise')
        .select('id, nom, secteur, sous_categories, ville, adresse, telephone, latitude, longitude')
        .eq('secteur', 'Loisirs & Événements');

      if (searchQuery) {
        query = query.or(`nom.ilike.%${searchQuery}%,sous_categories.ilike.%${searchQuery}%`);
      }

      if (categoryFilter) {
        query = query.ilike('sous_categories', `%${categoryFilter}%`);
      }

      if (selectedLocation !== 'all') {
        query = query.ilike('ville', selectedLocation);
      }

      const { data, error } = await query.order('nom', { ascending: true });

      if (!error && data) {
        setLieux(data);
      }
    } catch (error) {
      console.error('Erreur chargement lieux:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language, { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % featuredEvents.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + featuredEvents.length) % featuredEvents.length);
  };

  const getTypeIcon = (type: string) => {
    const typeMap: Record<string, any> = {
      'Cinéma': Film,
      'Cinema': Film,
      'Concert': Music,
      'Festival': PartyPopper,
      'Sport': Users,
      'Plage': Waves,
      'Beach': Waves,
      'Restaurant': Utensils,
      'Exposition': Camera,
      'Exhibition': Camera
    };
    return typeMap[type] || MapPinned;
  };

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (carouselRef.current) {
      const scrollAmount = 320;
      carouselRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  const renderStars = (rating: number, count: number) => {
    return (
      <div className="flex items-center gap-2">
        <div className="flex items-center gap-1">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={`w-4 h-4 ${
                star <= rating
                  ? 'fill-[#D4AF37] text-[#D4AF37]'
                  : 'text-gray-300'
              }`}
            />
          ))}
        </div>
        <span className="text-sm text-gray-600">({count})</span>
      </div>
    );
  };

  return (
    <div
      className="min-h-screen bg-[#f5f5dc]"
      dir={language === 'ar' ? 'rtl' : 'ltr'}
      style={language === 'ar' ? { fontFamily: "'Amiri', 'Cairo', 'Tajawal', serif" } : {}}
    >
      {/* Premium Header Section avec Image Drapeau Tunisien */}
      <div className="relative py-6 overflow-hidden" style={{ borderBottom: '2px solid #D4AF37' }}>
        {/* Image de fond - Drapeau Tunisien */}
        <div className="absolute inset-0">
          <img
            src="https://kmvjegbtroksjqaqliyv.supabase.co/storage/v1/object/public/photos-dalil/drapeau-tunisie.jpg"
            alt="Drapeau de la Tunisie"
            className="w-full h-full object-cover brightness-105"
          />
          {/* Overlay bleu profond pour lisibilité */}
          <div className="absolute inset-0 bg-[#0c2461] opacity-65"></div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {onNavigateBack && (
            <div className="mb-4">
              <BackButton onNavigateBack={onNavigateBack} label="Retour aux services citoyens" />
            </div>
          )}

          {onNavigateBack && (
            <button
              onClick={onNavigateBack}
              className="absolute top-0 left-4 flex items-center gap-2 text-white/70 hover:text-white transition-colors bg-white/5 backdrop-blur-sm px-4 py-2 rounded-full border border-white/10"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">{t.backButton}</span>
            </button>
          )}

          {/* Logo Chéchia Dorée */}
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4AF37] blur-2xl opacity-30 rounded-full"></div>
              <img
                src={getSupabaseImageUrl('logo-chechia-dore.png')}
                alt="Chéchia Tunisienne"
                className="relative w-12 h-12 object-contain drop-shadow-2xl"
                onError={(e) => {
                  e.currentTarget.src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Ccircle cx="50" cy="50" r="45" fill="%23D4AF37"/%3E%3Ctext x="50" y="60" text-anchor="middle" fill="%23fff" font-size="40" font-family="serif"%3E✺%3C/text%3E%3C/svg%3E';
                }}
              />
            </div>
          </div>

          {/* Titre Principal */}
          <div className="text-center mb-6">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-serif font-bold text-[#D4AF37] mb-3" style={{ textShadow: '2px 2px 8px rgba(0,0,0,0.9)' }}>
              {t.title}
            </h1>
            <p className="text-sm md:text-base text-gray-300 font-light tracking-wide mb-4">
              {t.subtitle}
            </p>

            {/* Texte descriptif intégré dans le header */}
            <div className="max-w-4xl mx-auto mt-6">
              <p className="text-white/95 text-base md:text-lg leading-relaxed italic font-light" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.8), 0px 0px 10px rgba(0,0,0,0.5)' }}>
                {t.authenticTourism} <span className="font-semibold text-[#D4AF37]" style={{ textShadow: '2px 2px 6px rgba(0,0,0,0.9)' }}>{t.authenticTourismHighlight}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Barre de recherche */}
      <section className="px-4 py-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <CategorySearchBar
            listePageValue="loisirs & évènements"
            placeholder={language === 'fr' ? 'Rechercher un événement ou lieu de loisir...' : language === 'ar' ? 'البحث عن حدث أو مكان ترفيهي...' : 'Search for an event or leisure place...'}
            onSelectBusiness={(businessId) => navigate(`/business/${businessId}`)}
            onSearch={(query, ville) => {
              const params = new URLSearchParams();
              if (query) params.set('q', query);
              if (ville) params.set('ville', ville);
              window.location.href = `#/citizens-leisure?${params.toString()}`;
            }}
          />
        </div>
      </section>

      {/* Premium Agenda Cards - 3 Columns (hors header, sur fond beige) */}
      <div className="bg-[#F8F9FA] py-6 border-b border-[#D4AF37]/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* CARTE 1 - L'Hebdo (Affinée) */}
            {weeklyEvent ? (
              <div className="group relative bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg" style={{ border: '1px solid #D4AF37' }}>
                <div className="bg-[#4A1D43] px-3 py-1.5 text-center">
                  <span className="text-white font-semibold text-xs tracking-wider uppercase">{t.premiumAgenda.weekly.badge}</span>
                </div>
                <div className="relative h-24 overflow-hidden">
                  <img
                    src={(weeklyEvent.image_url?.split(',')[0]?.trim()) || "https://images.pexels.com/photos/1762578/pexels-photo-1762578.jpeg?auto=compress&cs=tinysrgb&w=600"}
                    alt={getTranslatedText(weeklyEvent, 'titre')}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="text-sm font-bold text-[#4A1D43] line-clamp-2">
                    {getTranslatedText(weeklyEvent, 'titre')}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[#4A1D43]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{formatEventDate(weeklyEvent.date_debut, weeklyEvent.date_fin)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#4A1D43]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-xs">{weeklyEvent.localisation_ville}</span>
                  </div>
                  {weeklyEvent.prix && (
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-[#D4AF37]/20 text-[#4A1D43] rounded-full text-xs font-medium">
                        {weeklyEvent.prix}
                      </span>
                    </div>
                  )}
                  {weeklyEvent.lien_billetterie && (
                    <a
                      href={weeklyEvent.lien_billetterie}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#4A1D43] hover:bg-[#5A2D53] text-white rounded-md transition-colors text-xs font-medium"
                      style={{ border: '1px solid #D4AF37' }}
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{t.buyTickets}</span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative bg-white/50 rounded-lg overflow-hidden opacity-60" style={{ border: '1px solid #D4AF37' }}>
                <div className="bg-[#4A1D43]/70 px-3 py-1.5 text-center">
                  <span className="text-white font-semibold text-xs tracking-wider uppercase">{t.premiumAgenda.weekly.badge}</span>
                </div>
                <div className="p-6 text-center text-gray-500">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40 text-[#4A1D43]" />
                  <p className="text-xs">{t.noEvents}</p>
                </div>
              </div>
            )}

            {/* CARTE 2 - Le Mensuel (Affinée) */}
            {monthlyEvent ? (
              <div className="group relative bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg" style={{ border: '1px solid #D4AF37' }}>
                <div className="bg-[#4A1D43] px-3 py-1.5 text-center">
                  <span className="text-white font-semibold text-xs tracking-wider uppercase">{t.premiumAgenda.monthly.badge}</span>
                </div>
                <div className="relative h-24 overflow-hidden">
                  <img
                    src={(monthlyEvent.image_url?.split(',')[0]?.trim()) || "https://images.pexels.com/photos/3010168/pexels-photo-3010168.jpeg?auto=compress&cs=tinysrgb&w=600"}
                    alt={getTranslatedText(monthlyEvent, 'titre')}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="text-sm font-bold text-[#4A1D43] line-clamp-2">
                    {getTranslatedText(monthlyEvent, 'titre')}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[#4A1D43]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{formatEventDate(monthlyEvent.date_debut, monthlyEvent.date_fin)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#4A1D43]">
                    <MapPin className="w-3.5 h-3.5" />
                    <span className="text-xs">{monthlyEvent.localisation_ville}</span>
                  </div>
                  {monthlyEvent.prix && (
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-[#D4AF37]/20 text-[#4A1D43] rounded-full text-xs font-medium">
                        {monthlyEvent.prix}
                      </span>
                    </div>
                  )}
                  {monthlyEvent.lien_billetterie && (
                    <a
                      href={monthlyEvent.lien_billetterie}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#4A1D43] hover:bg-[#5A2D53] text-white rounded-md transition-colors text-xs font-medium"
                      style={{ border: '1px solid #D4AF37' }}
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{t.buyTickets}</span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative bg-white/50 rounded-lg overflow-hidden opacity-60" style={{ border: '1px solid #D4AF37' }}>
                <div className="bg-[#4A1D43]/70 px-3 py-1.5 text-center">
                  <span className="text-white font-semibold text-xs tracking-wider uppercase">{t.premiumAgenda.monthly.badge}</span>
                </div>
                <div className="p-6 text-center text-gray-500">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40 text-[#4A1D43]" />
                  <p className="text-xs">{t.noEvents}</p>
                </div>
              </div>
            )}

            {/* CARTE 3 - L'Annuel (Premium Bordeaux avec bordure dorée) */}
            {annualEvent ? (
              <div className="group relative bg-white rounded-lg overflow-hidden transition-all duration-300 hover:shadow-lg" style={{ border: '2px solid #D4AF37' }}>
                <div className="bg-[#4A1D43] px-3 py-1.5 text-center">
                  <span className="text-white font-semibold text-xs tracking-wider uppercase">{t.premiumAgenda.annual.badge}</span>
                </div>
                <div className="relative h-24 overflow-hidden">
                  <img
                    src={(annualEvent.image_url?.split(',')[0]?.trim()) || "https://images.pexels.com/photos/8349107/pexels-photo-8349107.jpeg?auto=compress&cs=tinysrgb&w=600"}
                    alt={getTranslatedText(annualEvent, 'titre')}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                </div>
                <div className="p-3 space-y-2">
                  <h3 className="text-sm font-bold text-[#4A1D43] line-clamp-2">
                    {getTranslatedText(annualEvent, 'titre')}
                  </h3>
                  <div className="flex items-center gap-1.5 text-[#4A1D43]">
                    <Calendar className="w-3.5 h-3.5" />
                    <span className="text-xs font-medium">{formatEventDate(annualEvent.date_debut, annualEvent.date_fin)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-[#4A1D43]">
                    <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="text-xs">{annualEvent.localisation_ville}</span>
                  </div>
                  {annualEvent.prix && (
                    <div className="flex items-center gap-1.5">
                      <span className="px-2 py-0.5 bg-[#D4AF37]/20 text-[#4A1D43] rounded-full text-xs font-medium">
                        {annualEvent.prix}
                      </span>
                    </div>
                  )}
                  {annualEvent.lien_billetterie && (
                    <a
                      href={annualEvent.lien_billetterie}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-[#4A1D43] hover:bg-[#5A2D53] text-white rounded-md transition-colors text-xs font-medium"
                      style={{ border: '1px solid #D4AF37' }}
                    >
                      <Ticket className="w-3.5 h-3.5" />
                      <span>{t.buyTickets}</span>
                    </a>
                  )}
                </div>
              </div>
            ) : (
              <div className="relative bg-white/50 rounded-lg overflow-hidden opacity-60" style={{ border: '2px solid #D4AF37' }}>
                <div className="bg-[#4A1D43]/70 px-3 py-1.5 text-center">
                  <span className="text-white font-semibold text-xs tracking-wider uppercase">{t.premiumAgenda.annual.badge}</span>
                </div>
                <div className="p-6 text-center text-gray-500">
                  <Calendar className="w-10 h-10 mx-auto mb-3 opacity-40 text-[#4A1D43]" />
                  <p className="text-xs">{t.noEvents}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Bouton Proposer un événement */}
        <div className="mb-6 text-center">
          <button
            onClick={() => setShowProposalForm(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#4A1D43] hover:bg-[#5A2D53] text-[#D4AF37] hover:text-white rounded-lg font-semibold hover:shadow-xl transition-all hover:scale-105 text-xs"
            style={{ border: '1px solid #D4AF37', fontFamily: "'Playfair Display', serif" }}
          >
            <Plus className="w-3.5 h-3.5 text-[#D4AF37]" />
            {t.proposeEvent}
          </button>
        </div>

        {/* Featured Events Carousel - Netflix Style */}
        {featuredEvents.length > 0 && (
          <div className="mb-10">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-[#4A1D43] flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-[#D4AF37] animate-pulse" />
                {t.featured}
              </h2>
              <div className="flex gap-3">
                <button
                  onClick={() => scrollCarousel('left')}
                  className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                  style={{ border: '2px solid #D4AF37' }}
                >
                  <ChevronLeft className="w-6 h-6 text-[#4A1D43]" />
                </button>
                <button
                  onClick={() => scrollCarousel('right')}
                  className="p-3 bg-white rounded-full shadow-lg hover:shadow-xl hover:scale-110 transition-all duration-300"
                  style={{ border: '2px solid #D4AF37' }}
                >
                  <ChevronRight className="w-6 h-6 text-[#4A1D43]" />
                </button>
              </div>
            </div>

            <div
              ref={carouselRef}
              className="flex gap-4 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
              style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
            >
              {featuredEvents.map((event) => {
                const TypeIcon = getTypeIcon(event.type_evenement);
                return (
                  <div
                    key={event.id}
                    onMouseEnter={() => setHoveredEventId(event.id)}
                    onMouseLeave={() => setHoveredEventId(null)}
                    className={`flex-shrink-0 w-64 bg-white rounded-xl shadow-lg overflow-hidden transition-all duration-300 ${
                      hoveredEventId === event.id ? 'scale-105 shadow-2xl' : ''
                    }`}
                    style={{ border: '2px solid #D4AF37' }}
                  >
                    <div className="relative h-32 bg-gradient-to-br from-gray-200 to-gray-300">
                      {event.image_url && (
                        <img
                          src={event.image_url.split(',')[0].trim()}
                          alt={getTranslatedText(event, 'titre')}
                          className="absolute inset-0 w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent"></div>
                      <div className="absolute top-3 left-3 flex gap-2">
                        <span className="px-2.5 py-1 bg-[#D4AF37] text-[#4A1D43] font-bold text-xs rounded-full shadow-lg">
                          ⭐ VIP
                        </span>
                      </div>
                      <div className="absolute bottom-3 left-3">
                        <div className="flex items-center gap-2 text-white">
                          <TypeIcon className="w-4 h-4" />
                          <span className="font-semibold text-xs">{event.type_evenement}</span>
                        </div>
                      </div>
                    </div>

                    <div className="p-3">
                      <h3 className="text-base font-bold text-gray-900 mb-2.5 line-clamp-2 hover:text-[#D4AF37] transition-colors">
                        {getTranslatedText(event, 'titre')}
                      </h3>

                      <div className="space-y-1.5 mb-3">
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="w-4 h-4 text-[#D4AF37]" />
                          <span className="font-medium">{formatDate(event.date_debut)}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <MapPin className="w-4 h-4 text-[#D4AF37]" />
                          <span>{event.localisation_ville}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <DollarSign className="w-4 h-4 text-[#D4AF37]" />
                          <span className="font-bold text-[#D4AF37]">{event.prix}</span>
                        </div>
                      </div>

                      {event.lien_billetterie && (
                        <a
                          href={event.lien_billetterie}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block w-full py-2 bg-[#4A1D43] hover:bg-[#5A2D53] text-white rounded-lg font-bold text-center hover:shadow-xl transition-all hover:scale-105 text-sm"
                          style={{ border: '2px solid #D4AF37' }}
                        >
                          <Ticket className="w-4 h-4 inline mr-2" />
                          {t.buyTickets}
                        </a>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-2xl shadow-xl p-2.5 mb-8" style={{ border: '2px solid #D4AF37' }}>
          <div className="grid grid-cols-2 gap-2.5">
            <button
              onClick={() => setActiveTab('evenements')}
              className={`py-3 px-4 rounded-xl font-bold text-base transition-all duration-300 ${
                activeTab === 'evenements'
                  ? 'bg-[#4A1D43] text-white shadow-2xl scale-105'
                  : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 hover:bg-[#4A1D43]/10 hover:text-[#4A1D43]'
              }`}
              style={{ border: '2px solid #D4AF37' }}
            >
              <Music className="w-5 h-5 inline mr-2" />
              {t.tabEvents}
            </button>
            <button
              onClick={() => setActiveTab('lieux')}
              className={`py-3 px-4 rounded-xl font-bold text-base transition-all duration-300 ${
                activeTab === 'lieux'
                  ? 'bg-[#4A1D43] text-white shadow-2xl scale-105'
                  : 'bg-gradient-to-r from-gray-100 to-gray-50 text-gray-700 hover:bg-[#4A1D43]/10 hover:text-[#4A1D43]'
              }`}
              style={{ border: '2px solid #D4AF37' }}
            >
              <MapPin className="w-5 h-5 inline mr-2" />
              {t.tabPlaces}
            </button>
          </div>

          {/* Subtitle Below Tabs */}
          <div className="flex items-center justify-center gap-4 mt-5 max-w-5xl mx-auto">
            <img
              src={getSupabaseImageUrl('ibn-khaldoun.jpg')}
              alt="Ibn Khaldoun"
              className="w-12 h-12 object-cover rounded-full opacity-80 shadow-lg"
              loading="lazy"
            />
            <p className="text-center text-gray-700 text-base italic font-light leading-relaxed">
              Trouvez des idées, vérifiez les horaires et réservez votre place. Votre temps libre commence ici !
            </p>
            <img
              src={getSupabaseImageUrl('ibn-khaldoun.jpg')}
              alt="Ibn Khaldoun"
              className="w-12 h-12 object-cover rounded-full opacity-80 shadow-lg"
              loading="lazy"
            />
          </div>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-2xl shadow-xl p-5 mb-8" style={{ border: '2px solid #D4AF37' }}>
          {/* Active Filter Badge */}
          {categoryFilter && (
            <div className="mb-6 flex items-center gap-3">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-[#4A1D43] text-white rounded-full font-semibold text-sm shadow-lg">
                Filtre actif: {categoryFilter}
              </span>
              <button
                onClick={() => {
                  setCategoryFilter('');
                  window.history.replaceState({}, '', '#/citizens/leisure');
                }}
                className="text-sm text-gray-600 hover:text-[#4A1D43] underline"
              >
                Effacer le filtre
              </button>
            </div>
          )}

          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 bg-[#4A1D43] rounded-full p-1">
                <Search className="w-3.5 h-3.5 text-white" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t.searchPlaceholder}
                data-search-bar="true"
                data-search-scope="loisir"
                data-component-name="CitizensLeisure-Search"
                className="w-full pl-10 pr-4 py-2 rounded-lg border border-[#D4AF37]/30 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none transition-all text-sm shadow-sm"
              />
            </div>

            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-3">
              {/* Location Filter */}
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#D4AF37]/30 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none bg-white font-medium shadow-sm transition-all hover:shadow-md max-h-96 overflow-y-auto text-xs"
              >
                <option value="all">{t.locationAll}</option>
                {GOUVERNORATS_TUNISIE.map((gouvernorat) => (
                  <option key={gouvernorat} value={gouvernorat}>
                    {gouvernorat}
                  </option>
                ))}
              </select>

              {/* Activity Type Filter (Events only) */}
              {activeTab === 'evenements' && (
                <select
                  value={selectedActivityType}
                  onChange={(e) => setSelectedActivityType(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#D4AF37]/30 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none bg-white font-medium shadow-sm transition-all hover:shadow-md text-xs"
                >
                  <option value="all">🎨 Tous les types</option>
                  {SECTEURS_CULTURE.map((secteur) => (
                    <option key={secteur} value={secteur}>
                      {secteur}
                    </option>
                  ))}
                </select>
              )}

              {/* Temporalité Filter (Events only) */}
              {activeTab === 'evenements' && (
                <select
                  value={selectedTemporalite}
                  onChange={(e) => setSelectedTemporalite(e.target.value)}
                  className="px-3 py-2 rounded-lg border border-[#D4AF37]/30 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none bg-white font-medium shadow-sm transition-all hover:shadow-md text-xs"
                >
                  <option value="all">📅 {t.temporaliteAll}</option>
                  <option value="hebdo">📆 {t.temporaliteWeekly}</option>
                  <option value="mensuel">🗓️ {t.temporaliteMonthly}</option>
                  <option value="annuel">⭐ {t.temporaliteAnnual}</option>
                </select>
              )}

              {/* Price Filter */}
              <select
                value={selectedPrice}
                onChange={(e) => setSelectedPrice(e.target.value)}
                className="px-3 py-2 rounded-lg border border-[#D4AF37]/30 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 outline-none bg-white font-medium shadow-sm transition-all hover:shadow-md text-xs"
              >
                <option value="all">{t.priceAll}</option>
                <option value="Gratuit">{t.priceFree}</option>
                <option value="Payant">{t.pricePaid}</option>
              </select>

              {/* Kids Filter */}
              <button
                onClick={() => setKidsOnly(!kidsOnly)}
                className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg font-semibold transition-all shadow-sm hover:shadow-md text-xs ${
                  kidsOnly
                    ? 'bg-[#4A1D43] text-white shadow-lg'
                    : 'bg-white text-gray-700 border border-[#D4AF37]/30 hover:border-[#D4AF37]'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                {t.kidsAccessible}
              </button>
            </div>
          </div>
        </div>

        {/* Map Toggle Button - Lieux Only */}
        {activeTab === 'lieux' && lieux.length > 0 && (
          <div className="flex justify-end mb-6">
            <button
              onClick={() => setShowMap(!showMap)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${
                showMap
                  ? 'bg-[#4A1D43] text-white shadow-lg'
                  : 'bg-white text-gray-700 border-2 border-[#D4AF37] hover:border-[#4A1D43]'
              }`}
            >
              <MapPinned className="w-5 h-5" />
              {showMap ? 'Masquer la Carte' : 'Afficher sur la Carte'}
            </button>
          </div>
        )}

        {/* Interactive Map */}
        {activeTab === 'lieux' && showMap && lieux.length > 0 && (
          <div className="bg-white rounded-3xl shadow-2xl p-6 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4 flex items-center gap-2">
              <MapPinned className="w-6 h-6 text-[#D4AF37]" />
              Carte Interactive des Lieux
            </h3>
            <div className="h-96 rounded-2xl overflow-hidden shadow-lg">
              <MapContainer
                center={[35.5047, 11.0622]}
                zoom={7}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                {lieux
                  .filter((lieu) => lieu.latitude && lieu.longitude)
                  .map((lieu) => (
                    <Marker
                      key={lieu.id}
                      position={[lieu.latitude!, lieu.longitude!]}
                      eventHandlers={{
                        click: () => setSelectedMarker(lieu.id),
                      }}
                    >
                      <Popup>
                        <div className="p-2">
                          <h4 className="font-bold text-gray-900 mb-1">{lieu.nom}</h4>
                          {lieu.sous_categories && (
                            <p className="text-xs text-[#D4AF37] font-medium mb-2">{lieu.sous_categories}</p>
                          )}
                          {lieu.adresse && (
                            <p className="text-sm text-gray-600">{lieu.adresse}</p>
                          )}
                        </div>
                      </Popup>
                    </Marker>
                  ))}
              </MapContainer>
            </div>
          </div>
        )}

        {/* Results */}
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-16 h-16 border-4 border-[#4A1D43] border-t-transparent rounded-full animate-spin" />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {activeTab === 'evenements' ? (
              evenements.length === 0 ? (
                <div className="col-span-full bg-white rounded-xl p-12 text-center">
                  <Calendar className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">{t.noEvents}</p>
                  <p className="text-sm text-gray-400 mt-2">{t.modifyFilters}</p>
                </div>
              ) : (
                evenements.map((event) => (
                  <EventCard
                    key={event.id}
                    id={event.id}
                    titre={getTranslatedText(event, 'titre')}
                    description={getTranslatedText(event, 'description')}
                    date_debut={event.date_debut}
                    localisation_ville={event.localisation_ville}
                    prix={event.prix}
                    type_evenement={event.type_evenement}
                    lien_billetterie={event.lien_billetterie}
                    image_url={event.image_url}
                    accessible_enfants={event.accessible_enfants}
                    niveau_abonnement={event.niveau_abonnement}
                    organisateur={event.organisateur}
                    note_moyenne={event.note_moyenne}
                    nombre_avis={event.nombre_avis}
                  />
                ))
              )
            ) : (
              lieux.length === 0 ? (
                <div className="col-span-full bg-white rounded-xl p-12 text-center">
                  <MapPin className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">{t.noPlaces}</p>
                  <p className="text-sm text-gray-400 mt-2">{t.modifyFilters}</p>
                </div>
              ) : (
                lieux.map((lieu) => (
                  <UnifiedBusinessCard
                    key={lieu.id}
                    business={lieu as any}
                    onClick={() => setSelectedBusiness(lieu)}
                  />
                ))
              )
            )}
          </div>
        )}
      </div>

      {showProposalForm && (
        <LeisureEventProposalForm onClose={() => setShowProposalForm(false)} />
      )}

      {selectedBusiness && (
        <BusinessDetail
          business={selectedBusiness}
          onClose={() => setSelectedBusiness(null)}
          asModal={true}
        />
      )}
    </div>
  );
}
