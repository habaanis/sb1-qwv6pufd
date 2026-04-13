import { useState, useEffect } from 'react';
import { Search, Plus, MapPin, Tag, TrendingUp, AlertCircle, Zap } from 'lucide-react';
import { supabase } from '../lib/BoltDatabase';
import { useLanguage } from '../context/LanguageContext';
import AnnouncementForm from '../components/AnnouncementForm';
import AnnouncementDetail from '../components/AnnouncementDetail';
import MarketplaceCard from '../components/MarketplaceCard';
import LocationSelectTunisie from '../components/LocationSelectTunisie';
import BonnesAffaires from '../components/BonnesAffaires';
import AlerteRechercheForm from '../components/AlerteRechercheForm';
import SearchBar from '../components/SearchBar';
import { isSearchBarAllowed } from '../config/searchBars';
import { getSupabaseImageUrl } from '../lib/imageUtils';

interface Announcement {
  id: string;
  titre: string;
  description: string;
  prix: number;
  localisation_ville: string;
  contact_tel: string;
  photo_url: string[];
  categorie: string;
  type_annonce: string;
  vues: number;
  created_at: string;
}

const translations = {
  fr: {
    title: 'Le Marché Local : Vendez, Achetez et Échangez près de chez vous',
    slogan: 'Petites annonces 100% tunisiennes et hyper-locales. Trouvez des trésors, vendez ce dont vous n\'avez plus besoin, ou échangez avec d\'autres. Le commerce et le troc de particulier à particulier, en toute simplicité et proximité, sans frais cachés.',
    postAd: 'DÉPOSER UNE ANNONCE GRATUITE',
    searchPlaceholder: 'Que cherchez-vous ? (voiture, meuble, service...)',
    cityPlaceholder: 'Dans quelle ville / délégation ?',
    search: 'Rechercher',
    categories: 'Catégorie',
    allCategories: 'Toutes les catégories',
    adType: 'Type d\'annonce',
    allTypes: 'Tous les types',
    sell: 'Vendre',
    buy: 'Acheter',
    exchange: 'Échanger',
    rulesTitle: 'Nos Règles pour un Marché Sûr',
    rule1: 'Annonces interdites : Armes, stupéfiants, produits illégaux',
    rule2: 'Obligation d\'afficher un prix réel',
    rule3: 'Système simple pour signaler une annonce suspecte',
    noResults: 'Aucune annonce trouvée',
    loading: 'Chargement...',
    tnd: 'TND',
    views: 'vues',
    contact: 'Contacter',
    categoryList: {
      vehicles: 'Véhicules',
      house: 'Maison & Jardin',
      electronics: 'Électronique',
      realestate: 'Immobilier',
      sports: 'Sport & Loisirs',
      clothing: 'Vêtements',
      services: 'Services'
    }
  },
  en: {
    title: 'Local Market: Buy, Sell and Exchange Near You',
    slogan: '100% Tunisian and hyper-local classified ads. Find treasures, sell what you no longer need, or exchange with others. Person-to-person commerce and barter, simply and locally, with no hidden fees.',
    postAd: 'POST A FREE AD',
    searchPlaceholder: 'What are you looking for? (car, furniture, service...)',
    cityPlaceholder: 'In which city / delegation?',
    search: 'Search',
    categories: 'Category',
    allCategories: 'All categories',
    adType: 'Ad type',
    allTypes: 'All types',
    sell: 'Sell',
    buy: 'Buy',
    exchange: 'Exchange',
    rulesTitle: 'Our Rules for a Safe Market',
    rule1: 'Prohibited ads: Weapons, drugs, illegal products',
    rule2: 'Obligation to display a real price',
    rule3: 'Simple system to report suspicious ads',
    noResults: 'No ads found',
    loading: 'Loading...',
    tnd: 'TND',
    views: 'views',
    contact: 'Contact',
    categoryList: {
      vehicles: 'Vehicles',
      house: 'House & Garden',
      electronics: 'Electronics',
      realestate: 'Real Estate',
      sports: 'Sports & Leisure',
      clothing: 'Clothing',
      services: 'Services'
    }
  },
  ar: {
    title: 'السوق المحلي: بيع، شراء وتبادل بالقرب منك',
    slogan: 'إعلانات مبوبة تونسية 100٪ ومحلية للغاية. اعثر على كنوز، بع ما لم تعد بحاجة إليه، أو تبادل مع الآخرين. التجارة والمقايضة من شخص لشخص، ببساطة وقرب، بدون رسوم خفية.',
    postAd: 'نشر إعلان مجاني',
    searchPlaceholder: 'ماذا تبحث؟ (سيارة، أثاث، خدمة...)',
    cityPlaceholder: 'في أي مدينة / معتمدية؟',
    search: 'بحث',
    categories: 'الفئة',
    allCategories: 'جميع الفئات',
    adType: 'نوع الإعلان',
    allTypes: 'جميع الأنواع',
    sell: 'بيع',
    buy: 'شراء',
    exchange: 'تبادل',
    rulesTitle: 'قواعدنا لسوق آمن',
    rule1: 'الإعلانات المحظورة: الأسلحة، المخدرات، المنتجات غير القانونية',
    rule2: 'إلزامية عرض سعر حقيقي',
    rule3: 'نظام بسيط للإبلاغ عن إعلان مشبوه',
    noResults: 'لم يتم العثور على إعلانات',
    loading: 'جاري التحميل...',
    tnd: 'دينار',
    views: 'مشاهدة',
    contact: 'اتصل',
    categoryList: {
      vehicles: 'المركبات',
      house: 'المنزل والحديقة',
      electronics: 'الإلكترونيات',
      realestate: 'العقارات',
      sports: 'الرياضة والترفيه',
      clothing: 'الملابس',
      services: 'الخدمات'
    }
  },
  it: {
    title: 'Mercato Locale: Compra, Vendi e Scambia Vicino a Te',
    slogan: 'Annunci 100% tunisini e iper-locali. Trova tesori, vendi ciò di cui non hai più bisogno, o scambia con altri. Commercio e baratto da persona a persona, in tutta semplicità e vicinanza, senza costi nascosti.',
    postAd: 'PUBBLICA UN ANNUNCIO GRATUITO',
    searchPlaceholder: 'Cosa stai cercando? (auto, mobili, servizio...)',
    cityPlaceholder: 'In quale città / delegazione?',
    search: 'Cerca',
    categories: 'Categoria',
    allCategories: 'Tutte le categorie',
    adType: 'Tipo di annuncio',
    allTypes: 'Tutti i tipi',
    sell: 'Vendere',
    buy: 'Comprare',
    exchange: 'Scambiare',
    rulesTitle: 'Le Nostre Regole per un Mercato Sicuro',
    rule1: 'Annunci vietati: Armi, stupefacenti, prodotti illegali',
    rule2: 'Obbligo di visualizzare un prezzo reale',
    rule3: 'Sistema semplice per segnalare un annuncio sospetto',
    noResults: 'Nessun annuncio trovato',
    loading: 'Caricamento...',
    tnd: 'TND',
    views: 'visualizzazioni',
    contact: 'Contatta',
    categoryList: {
      vehicles: 'Veicoli',
      house: 'Casa e Giardino',
      electronics: 'Elettronica',
      realestate: 'Immobiliare',
      sports: 'Sport e Tempo Libero',
      clothing: 'Abbigliamento',
      services: 'Servizi'
    }
  },
  ru: {
    title: 'Местный рынок: Покупайте, продавайте и обменивайте рядом',
    slogan: '100% тунисские и гиперлокальные объявления. Находите сокровища, продавайте то, что вам больше не нужно, или обменивайтесь с другими. Торговля и бартер между людьми, просто и близко, без скрытых комиссий.',
    postAd: 'РАЗМЕСТИТЬ БЕСПЛАТНОЕ ОБЪЯВЛЕНИЕ',
    searchPlaceholder: 'Что вы ищете? (автомобиль, мебель, услуга...)',
    cityPlaceholder: 'В каком городе / делегации?',
    search: 'Поиск',
    categories: 'Категория',
    allCategories: 'Все категории',
    adType: 'Тип объявления',
    allTypes: 'Все типы',
    sell: 'Продать',
    buy: 'Купить',
    exchange: 'Обменять',
    rulesTitle: 'Наши правила безопасного рынка',
    rule1: 'Запрещенные объявления: Оружие, наркотики, незаконные товары',
    rule2: 'Обязательство указывать реальную цену',
    rule3: 'Простая система для сообщения о подозрительных объявлениях',
    noResults: 'Объявления не найдены',
    loading: 'Загрузка...',
    tnd: 'ТНД',
    views: 'просмотров',
    contact: 'Связаться',
    categoryList: {
      vehicles: 'Транспорт',
      house: 'Дом и сад',
      electronics: 'Электроника',
      realestate: 'Недвижимость',
      sports: 'Спорт и досуг',
      clothing: 'Одежда',
      services: 'Услуги'
    }
  }
};

export default function LocalMarketplace() {
  const { language } = useLanguage();
  const t = translations[language] || translations.fr;
  const isRTL = language === 'ar';

  const url = new URL(window.location.href);
  const qParam = (url.searchParams.get('q') || '').trim();
  const villeParam = (url.searchParams.get('ville') || '').trim();

  const [showForm, setShowForm] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<string | null>(null);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchKeyword, setSearchKeyword] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedType, setSelectedType] = useState('');
  const [showUrgentOnly, setShowUrgentOnly] = useState(false);

  const categories = [
    { value: 'Véhicules', label: t.categoryList.vehicles },
    { value: 'Maison & Jardin', label: t.categoryList.house },
    { value: 'Électronique', label: t.categoryList.electronics },
    { value: 'Immobilier', label: t.categoryList.realestate },
    { value: 'Sport & Loisirs', label: t.categoryList.sports },
    { value: 'Vêtements', label: t.categoryList.clothing },
    { value: 'Services', label: t.categoryList.services }
  ];

  useEffect(() => {
    if (qParam) setSearchKeyword(qParam);
    if (villeParam) setSelectedCity(villeParam);

    fetchAnnouncements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchAnnouncements = async () => {
    setLoading(true);
    setError('');
    try {
      let query = supabase
        .from('v_annonces_visibles')
        .select('*');

      if (showUrgentOnly) {
        query = query.eq('urgent', true);
      }

      const { data, error: fetchError } = await query
        .order('urgent', { ascending: false })
        .order('date_publication', { ascending: false })
        .limit(50);

      if (fetchError) {
        throw fetchError;
      }

      setAnnouncements(data || []);
    } catch (err: any) {
      console.error('Error fetching announcements:', err);
      setError('Erreur de chargement des annonces');
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    setError('');
    try {
      let query = supabase.from('v_annonces_visibles').select('*');

      if (searchKeyword) {
        query = query.or(`title.ilike.%${searchKeyword}%,description.ilike.%${searchKeyword}%,category.ilike.%${searchKeyword}%`);
      }

      if (selectedCity) {
        query = query.ilike('city', `%${selectedCity}%`);
      }

      if (selectedCategory) {
        query = query.eq('category', selectedCategory);
      }

      if (selectedType) {
        query = query.eq('type_annonce', selectedType);
      }

      if (showUrgentOnly) {
        query = query.eq('urgent', true);
      }

      const { data, error: searchError } = await query
        .order('urgent', { ascending: false })
        .order('date_publication', { ascending: false })
        .limit(50);

      if (searchError) {
        throw searchError;
      }

      setAnnouncements(data || []);
    } catch (err: any) {
      console.error('Error searching announcements:', err);
      setError('Erreur de recherche');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={`min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50 ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="max-w-7xl mx-auto px-4 py-12">
        {/* Header Section with Banner Image */}
        <div className="relative rounded-3xl overflow-hidden mb-12 shadow-2xl">
          <div className="relative h-80">
            <img
              src={getSupabaseImageUrl('petite annonce.jpg')}
              alt="Petites Annonces"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
              <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 drop-shadow-2xl">
                {t.title}
              </h1>
              <p className="text-lg md:text-xl text-white max-w-3xl mx-auto leading-relaxed mb-8 drop-shadow-lg">
                {t.slogan}
              </p>
              <button
                onClick={() => setShowForm(true)}
                className="inline-flex items-center gap-3 bg-gradient-to-r from-[#D62828] to-[#b91c1c] text-white px-8 py-4 rounded-full font-bold text-lg shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all"
              >
                <Plus className="w-6 h-6" />
                {t.postAd}
              </button>
            </div>
          </div>
        </div>

        {/* Search Section */}
        <div className="bg-white rounded-3xl shadow-xl p-8 mb-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="lg:col-span-2">
              <div className="relative">
                <Search className={`absolute ${isRTL ? 'right-4' : 'left-4'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
                <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder={t.searchPlaceholder}
                  data-search-bar="true"
                  data-search-scope="annonce"
                  data-component-name="LocalMarketplace-Search"
                  className={`w-full ${isRTL ? 'pr-12 pl-4' : 'pl-12 pr-4'} py-3 rounded-xl border-2 border-gray-200 focus:border-[#D62828] focus:ring-4 focus:ring-orange-100 outline-none transition-all`}
                />
              </div>
            </div>

            <div>
              <LocationSelectTunisie
                value={selectedCity}
                onChange={setSelectedCity}
                placeholder={t.cityPlaceholder}
              />
            </div>

            <div>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-[#D62828] focus:ring-4 focus:ring-orange-100 outline-none transition-all"
              >
                <option value="">{t.allCategories}</option>
                {categories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div>
              <button
                onClick={handleSearch}
                className="w-full bg-[#D62828] text-white px-6 py-3 rounded-xl font-semibold hover:bg-[#b91c1c] transition-all shadow-lg hover:shadow-xl"
              >
                {t.search}
              </button>
            </div>
          </div>

          <div className="flex gap-4 mt-4 flex-wrap">
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="px-4 py-2 rounded-lg border-2 border-gray-200 focus:border-[#D62828] outline-none transition-all text-sm"
            >
              <option value="">{t.allTypes}</option>
              <option value="sell">{t.sell}</option>
              <option value="buy">{t.buy}</option>
              <option value="exchange">{t.exchange}</option>
            </select>

            <label className="flex items-center gap-2 px-4 py-2 rounded-lg border-2 border-gray-200 hover:border-orange-300 cursor-pointer transition-all">
              <input
                type="checkbox"
                checked={showUrgentOnly}
                onChange={(e) => setShowUrgentOnly(e.target.checked)}
                className="w-4 h-4 text-[#D62828] focus:ring-[#D62828] rounded"
              />
              <Zap className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">Urgent uniquement</span>
            </label>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p>{error}</p>
          </div>
        )}

        {/* Bonnes Affaires Section */}
        <BonnesAffaires onSelectDeal={(dealId) => setSelectedAnnouncement(dealId)} />

        {/* Alerte Recherche Section */}
        <AlerteRechercheForm />

        {/* Rules Section */}
        <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl p-6 mb-12">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-6 h-6 text-[#D62828] flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-bold text-gray-900 mb-3">{t.rulesTitle}</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li>• {t.rule1}</li>
                <li>• {t.rule2}</li>
                <li>• {t.rule3}</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Announcements Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-block w-16 h-16 border-4 border-[#D62828] border-t-transparent rounded-full animate-spin"></div>
            <p className="text-gray-600 mt-4">{t.loading}</p>
          </div>
        ) : announcements.length === 0 ? (
          <div className="text-center py-20">
            <TrendingUp className="w-20 h-20 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-xl">{t.noResults}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {announcements.map((announcement) => (
              <MarketplaceCard
                key={announcement.id}
                announcement={announcement}
                onClick={() => setSelectedAnnouncement(announcement.id)}
              />
            ))}
          </div>
        )}
      </div>

      {/* Announcement Form Modal */}
      {showForm && (
        <AnnouncementForm
          onClose={() => setShowForm(false)}
          onSuccess={() => {
            setShowForm(false);
            fetchAnnouncements();
          }}
          language={language}
        />
      )}

      {/* Announcement Detail Modal */}
      {selectedAnnouncement && (
        <AnnouncementDetail
          announcementId={selectedAnnouncement}
          onClose={() => setSelectedAnnouncement(null)}
        />
      )}
    </div>
  );
}
