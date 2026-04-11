import { useState, useEffect, useRef } from 'react';
import { MapPin, Filter, Clock, FileText, Users, Building2, AlertCircle, CheckCircle, Phone, ExternalLink, Download, ArrowLeft, Loader2, Tag, Landmark } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/supabaseClient';
import { Tables } from '../lib/dbTables';
import LocationSelectTunisie from '../components/LocationSelectTunisie';
import { useLanguage } from '../context/LanguageContext';
import { Language } from '../lib/i18n';
import SearchBar from '../components/SearchBar';
import AdminSearchBar from '../components/AdminSearchBar';
import { getAdminCategoryLabel } from '../lib/adminCategories';
import { readParams } from '../lib/urlParams';
import { getSupabaseImageUrl } from '../lib/imageUtils';
import CategorySearchBar from '../components/CategorySearchBar';
import UnifiedBusinessCard from '../components/UnifiedBusinessCard';
import { useNavigate } from '../lib/url';

interface Demarche {
  id: string;
  nom: string;
  nom_ar?: string;
  nom_en?: string;
  nom_it?: string;
  nom_ru?: string;
  categorie: string;
  description: string;
  description_ar?: string;
  description_en?: string;
  description_it?: string;
  description_ru?: string;
  pieces_requises: string[];
  pieces_requises_ar?: string[];
  pieces_requises_en?: string[];
  delai_traitement: string;
  cout: string;
  publics_concernes: string[];
  service_competent: string;
  formulaire_url: string | null;
  lien_pdf_formulaire?: string | null;
  notes: string;
}

interface Etablissement {
  id: string;
  nom: string;
  adresse: string;
  ville: string;
  telephone: string;
  categories: string;
  horaires: string;
  latitude: number;
  longitude: number;
}

interface CitizensAdminProps {
  onNavigateBack?: () => void;
}

export default function CitizensAdmin({ onNavigateBack }: CitizensAdminProps = {}) {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const { q, ville } = readParams();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [publicType, setPublicType] = useState<'citoyen' | 'expat' | 'visiteur'>('citoyen');
  const [serviceFilter, setServiceFilter] = useState('');
  const [showOpenNow, setShowOpenNow] = useState(false);
  const [demarches, setDemarches] = useState<Demarche[]>([]);
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDemarche, setSelectedDemarche] = useState<Demarche | null>(null);

  const [adminSearchTerm, setAdminSearchTerm] = useState('');
  const [adminSelectedGouvernorat, setAdminSelectedGouvernorat] = useState('');
  const [adminSelectedCategory, setAdminSelectedCategory] = useState('');
  const [adminResults, setAdminResults] = useState<any[]>([]);
  const [adminLoading, setAdminLoading] = useState(false);
  const adminResultsRef = useRef<HTMLDivElement>(null);
  const hasActiveAdminSearch = !!adminSearchTerm || !!adminSelectedGouvernorat || !!adminSelectedCategory;

  const getTranslatedText = (demarche: Demarche, field: 'nom' | 'description'): string => {
    if (field === 'nom') {
      switch (language) {
        case 'ar': return demarche.nom_ar || demarche.nom;
        case 'en': return demarche.nom_en || demarche.nom;
        case 'it': return demarche.nom_it || demarche.nom;
        case 'ru': return demarche.nom_ru || demarche.nom;
        default: return demarche.nom;
      }
    } else {
      switch (language) {
        case 'ar': return demarche.description_ar || demarche.description;
        case 'en': return demarche.description_en || demarche.description;
        case 'it': return demarche.description_it || demarche.description;
        case 'ru': return demarche.description_ru || demarche.description;
        default: return demarche.description;
      }
    }
  };

  const getTranslatedPieces = (demarche: Demarche): string[] => {
    switch (language) {
      case 'ar': return demarche.pieces_requises_ar || demarche.pieces_requises;
      case 'en': return demarche.pieces_requises_en || demarche.pieces_requises;
      default: return demarche.pieces_requises;
    }
  };

  const translations: Record<Language, any> = {
    fr: {
      title: 'Services Publics',
      subtitle: 'Vos Démarches Sans Stress',
      description: 'Fini les attentes inutiles et les documents manquants. Trouvez les bureaux, les horaires, les numéros de contact, et la liste exacte des pièces requises pour toutes vos démarches à Mahdia et en Tunisie. Votre guide pour une administration efficace.',
      backButton: 'Retour aux services citoyens',
      citizen: 'Citoyen Tunisien',
      expat: 'Expatrié / Résident Étranger',
      visitor: 'Visiteur / Touriste',
      searchPlaceholder: 'Ex : Carte d\'identité, Passeport, Acte de naissance...',
      cityPlaceholder: 'Dans quelle ville / délégation ?',
      searchButton: 'Rechercher',
      openNow: 'Ouvert Maintenant',
      allServices: 'Tous les services',
      infoTitle: 'Informations importantes',
      infoText: 'Les horaires d\'ouverture des administrations sont généralement de 8h à 13h et de 14h à 17h. Pensez à apporter les originaux et photocopies de vos documents.',
      demarchesTitle: 'Démarches Administratives',
      etablissementsTitle: 'Bureaux et Services',
      noDemarches: 'Aucune démarche trouvée',
      noEtablissements: 'Aucun établissement trouvé',
      modifyFilters: 'Essayez de modifier les filtres',
      piecesRequises: 'pièces requises',
      open: 'Ouvert',
      viewOnMap: 'Voir sur la carte',
      usefulLinks: 'Liens Utiles',
      rne: 'Registre National des Entreprises',
      ejustice: 'Services judiciaires en ligne',
      passport: 'Rendez-vous passeport en ligne',
      processingTime: 'Délai de traitement',
      cost: 'Coût',
      requiredDocs: 'Pièces Requises',
      competentService: 'Service compétent',
      downloadForm: 'Télécharger le Formulaire Officiel (PDF)',
      accessOnlineForm: 'Accéder au formulaire en ligne',
      legalWarning: 'Attention : Vérifiez toujours la validité de ce formulaire auprès de l\'administration concernée avant de vous déplacer.',
      loading: 'Chargement...'
    },
    en: {
      title: 'Public Services',
      subtitle: 'Your Stress-Free Procedures',
      description: 'No more unnecessary waiting and missing documents. Find offices, hours, contact numbers, and the exact list of required documents for all your procedures in Mahdia and Tunisia. Your guide to efficient administration.',
      backButton: 'Back to citizen services',
      citizen: 'Tunisian Citizen',
      expat: 'Expatriate / Foreign Resident',
      visitor: 'Visitor / Tourist',
      searchPlaceholder: 'E.g.: ID Card, Passport, Birth Certificate...',
      cityPlaceholder: 'In which city / delegation?',
      searchButton: 'Search',
      openNow: 'Open Now',
      allServices: 'All services',
      infoTitle: 'Important information',
      infoText: 'Administration opening hours are generally from 8am to 1pm and 2pm to 5pm. Remember to bring originals and photocopies of your documents.',
      demarchesTitle: 'Administrative Procedures',
      etablissementsTitle: 'Offices and Services',
      noDemarches: 'No procedure found',
      noEtablissements: 'No establishment found',
      modifyFilters: 'Try modifying the filters',
      piecesRequises: 'required documents',
      open: 'Open',
      viewOnMap: 'View on map',
      usefulLinks: 'Useful Links',
      rne: 'National Business Register',
      ejustice: 'Online judicial services',
      passport: 'Online passport appointment',
      processingTime: 'Processing time',
      cost: 'Cost',
      requiredDocs: 'Required Documents',
      competentService: 'Competent service',
      downloadForm: 'Download Official Form (PDF)',
      accessOnlineForm: 'Access online form',
      legalWarning: 'Warning: Always verify the validity of this form with the relevant administration before traveling.',
      loading: 'Loading...'
    },
    ar: {
      title: 'الخدمات العامة',
      subtitle: 'إجراءاتك دون ضغط',
      description: 'لا مزيد من الانتظار غير الضروري والوثائق المفقودة. ابحث عن المكاتب والجداول الزمنية وأرقام الاتصال والقائمة الدقيقة للوثائق المطلوبة لجميع إجراءاتك في المهدية وتونس. دليلك للإدارة الفعالة.',
      backButton: 'العودة إلى خدمات المواطن',
      citizen: 'مواطن تونسي',
      expat: 'مغترب / مقيم أجنبي',
      visitor: 'زائر / سائح',
      searchPlaceholder: 'مثال: بطاقة الهوية، جواز السفر، شهادة الميلاد...',
      cityPlaceholder: 'في أي مدينة / معتمدية؟',
      searchButton: 'بحث',
      openNow: 'مفتوح الآن',
      allServices: 'جميع الخدمات',
      infoTitle: 'معلومات مهمة',
      infoText: 'ساعات عمل الإدارات عموماً من 8 صباحاً إلى 1 ظهراً ومن 2 ظهراً إلى 5 مساءً. تذكر إحضار النسخ الأصلية والنسخ الضوئية من وثائقك.',
      demarchesTitle: 'الإجراءات الإدارية',
      etablissementsTitle: 'المكاتب والخدمات',
      noDemarches: 'لم يتم العثور على إجراءات',
      noEtablissements: 'لم يتم العثور على مؤسسات',
      modifyFilters: 'حاول تعديل المرشحات',
      piecesRequises: 'الوثائق المطلوبة',
      open: 'مفتوح',
      viewOnMap: 'عرض على الخريطة',
      usefulLinks: 'روابط مفيدة',
      rne: 'السجل الوطني للمؤسسات',
      ejustice: 'الخدمات القضائية عبر الإنترنت',
      passport: 'موعد جواز السفر عبر الإنترنت',
      processingTime: 'مدة المعالجة',
      cost: 'التكلفة',
      requiredDocs: 'الوثائق المطلوبة',
      competentService: 'الخدمة المختصة',
      downloadForm: 'تحميل النموذج الرسمي (PDF)',
      accessOnlineForm: 'الوصول إلى النموذج عبر الإنترنت',
      legalWarning: 'تحذير: يرجى دائماً التحقق من صحة هذا النموذج مع الإدارة المعنية قبل التنقل.',
      loading: 'جاري التحميل...'
    },
    it: {
      title: 'Servizi Pubblici',
      subtitle: 'Le tue procedure senza stress',
      description: 'Basta con attese inutili e documenti mancanti. Trova uffici, orari, numeri di contatto e l\'elenco esatto dei documenti richiesti per tutte le tue procedure a Mahdia e in Tunisia. La tua guida per un\'amministrazione efficiente.',
      backButton: 'Torna ai servizi cittadini',
      citizen: 'Cittadino Tunisino',
      expat: 'Espatriato / Residente Straniero',
      visitor: 'Visitatore / Turista',
      searchPlaceholder: 'Es: Carta d\'identità, Passaporto, Certificato di nascita...',
      cityPlaceholder: 'In quale città / delegazione?',
      searchButton: 'Cerca',
      openNow: 'Aperto Ora',
      allServices: 'Tutti i servizi',
      infoTitle: 'Informazioni importanti',
      infoText: 'Gli orari di apertura delle amministrazioni sono generalmente dalle 8:00 alle 13:00 e dalle 14:00 alle 17:00. Ricordati di portare i documenti originali e le fotocopie.',
      demarchesTitle: 'Procedure Amministrative',
      etablissementsTitle: 'Uffici e Servizi',
      noDemarches: 'Nessuna procedura trovata',
      noEtablissements: 'Nessun stabilimento trovato',
      modifyFilters: 'Prova a modificare i filtri',
      piecesRequises: 'documenti richiesti',
      open: 'Aperto',
      viewOnMap: 'Visualizza sulla mappa',
      usefulLinks: 'Link Utili',
      rne: 'Registro Nazionale delle Imprese',
      ejustice: 'Servizi giudiziari online',
      passport: 'Prenotazione appuntamento online',
      processingTime: 'Tempo di elaborazione',
      cost: 'Costo',
      requiredDocs: 'Documenti Richiesti',
      competentService: 'Servizio competente',
      downloadForm: 'Scarica il Modulo Ufficiale (PDF)',
      accessOnlineForm: 'Accedi al modulo online',
      legalWarning: 'Attenzione: Verifica sempre la validità di questo modulo con l\'amministrazione competente prima di recarti.',
      loading: 'Caricamento...'
    },
    ru: {
      title: 'Государственные Услуги',
      subtitle: 'Ваши процедуры без стресса',
      description: 'Больше никаких ненужных ожиданий и отсутствующих документов. Найдите офисы, расписания, контактные номера и точный список необходимых документов для всех ваших процедур в Махдии и Тунисе. Ваш путеводитель по эффективной администрации.',
      backButton: 'Вернуться к услугам для граждан',
      citizen: 'Тунисский гражданин',
      expat: 'Экспатриант / Иностранный резидент',
      visitor: 'Посетитель / Турист',
      searchPlaceholder: 'Пример: Удостоверение личности, Паспорт, Свидетельство о рождении...',
      cityPlaceholder: 'В каком городе / делегации?',
      searchButton: 'Поиск',
      openNow: 'Открыто Сейчас',
      allServices: 'Все услуги',
      infoTitle: 'Важная информация',
      infoText: 'Часы работы администраций обычно с 8:00 до 13:00 и с 14:00 до 17:00. Не забудьте принести оригиналы и ксерокопии ваших документов.',
      demarchesTitle: 'Административные процедуры',
      etablissementsTitle: 'Офисы и услуги',
      noDemarches: 'Процедур не найдено',
      noEtablissements: 'Учреждений не найдено',
      modifyFilters: 'Попробуйте изменить фильтры',
      piecesRequises: 'необходимые документы',
      open: 'Открыто',
      viewOnMap: 'Посмотреть на карте',
      usefulLinks: 'Полезные ссылки',
      rne: 'Национальный реестр предприятий',
      ejustice: 'Онлайн судебные услуги',
      passport: 'Онлайн запись на прием',
      processingTime: 'Время обработки',
      cost: 'Стоимость',
      requiredDocs: 'Необходимые документы',
      competentService: 'Компетентная служба',
      downloadForm: 'Скачать официальную форму (PDF)',
      accessOnlineForm: 'Доступ к онлайн-форме',
      legalWarning: 'Внимание: Всегда проверяйте действительность этой формы в соответствующей администрации перед поездкой.',
      loading: 'Загрузка...'
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (q) setSearchQuery(q);
    if (ville) setSelectedCity(ville);
  }, [q, ville]);

  useEffect(() => {
    loadDemarches();
    loadEtablissements();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [publicType, selectedCity, serviceFilter, q, ville]);

  const loadDemarches = async () => {
    setLoading(true);
    try {
      // TODO: Table demarches_administratives en cours de création
      // Temporairement désactivé pour éviter les erreurs console
      /*
      let query = supabase
        .from('demarches_administratives')
        .select('*');

      if (q) {
        query = query.or(`nom.ilike.%${q}%,description.ilike.%${q}%`);
      }

      if (publicType) {
        query = query.contains('publics_concernes', [publicType]);
      }

      if (serviceFilter) {
        query = query.eq('service_competent', serviceFilter);
      }

      const { data } = await query;
      setDemarches(data || []);
      */
      setDemarches([]);
    } catch (error) {
      console.error('Error loading demarches:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadEtablissements = async () => {
    try {
      // TODO: Table etablissements_education en cours de création
      // Temporairement désactivé pour éviter les erreurs console
      /*
      let query = supabase
        .from('etablissements_education')
        .select('*');

      if (ville) {
        query = query.eq('gouvernorat', ville);
      }

      const { data } = await query;
      setEtablissements(data || []);
      */
      setEtablissements([]);
    } catch (error) {
      console.error('Error loading etablissements:', error);
    }
  };

  const runAdminSearch = async () => {
    setAdminLoading(true);

    try {
      let query = supabase
        .from(Tables.ENTREPRISE)
        .select('id, nom, secteur, "sous-catégories", gouvernorat, "liste pages"')
        .contains('"liste pages"', ['services citoyens'])
        .order('nom', { ascending: true })
        .limit(100);

      if (adminSelectedGouvernorat) {
        query = query.eq('gouvernorat', adminSelectedGouvernorat);
      }

      if (adminSelectedCategory) {
        query = query.contains('"sous-catégories"', [adminSelectedCategory]);
      }

      if (adminSearchTerm) {
        query = query.or(`nom.ilike.%${adminSearchTerm}%,"mots cles recherche".ilike.%${adminSearchTerm}%,description.ilike.%${adminSearchTerm}%`);
      }

      const { data, error } = await query;
      console.log('DEBUG ADMIN RESULTATS', { data, error, count: data?.length });

      if (error) throw error;

      setAdminResults(data || []);

      setTimeout(() => {
        adminResultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    } catch (error) {
      console.error('Erreur recherche administratif:', error);
      setAdminResults([]);
    } finally {
      setAdminLoading(false);
    }
  };

  if (selectedDemarche) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedDemarche(null)}
            className="mb-4 flex items-center gap-2 text-[#4A1D43] hover:text-[#D4AF37] transition font-semibold"
          >
            <ArrowLeft className="w-5 h-5" />
            {t.backButton}
          </button>

          <div className="bg-white rounded-xl border-2 border-[#D4AF37] shadow-md p-6">
            <h1 className="text-2xl font-semibold text-[#4A1D43] mb-3">
              {getTranslatedText(selectedDemarche, 'nom')}
            </h1>

            <div className="prose max-w-none mb-4">
              <p className="text-gray-700 text-sm">{getTranslatedText(selectedDemarche, 'description')}</p>
            </div>

            <div className="grid md:grid-cols-2 gap-4 mb-4">
              <div className="bg-gradient-to-r from-[#4A1D43]/5 to-white rounded-lg border border-[#D4AF37] p-3">
                <div className="flex items-center gap-2 text-[#4A1D43] mb-1">
                  <Clock className="w-4 h-4" />
                  <span className="font-semibold text-sm">{t.processingTime}</span>
                </div>
                <p className="text-gray-900 text-sm">{selectedDemarche.delai_traitement}</p>
              </div>

              <div className="bg-gradient-to-r from-[#4A1D43]/5 to-white rounded-lg border border-[#D4AF37] p-3">
                <div className="flex items-center gap-2 text-[#4A1D43] mb-1">
                  <CheckCircle className="w-4 h-4" />
                  <span className="font-semibold text-sm">{t.cost}</span>
                </div>
                <p className="text-gray-900 text-sm">{selectedDemarche.cout}</p>
              </div>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 text-[#4A1D43] mb-2">
                <FileText className="w-4 h-4" />
                <span className="font-semibold text-base">{t.requiredDocs}</span>
              </div>
              <ul className="space-y-1.5">
                {getTranslatedPieces(selectedDemarche).map((piece, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-gray-700 text-sm">
                    <CheckCircle className="w-4 h-4 text-[#D4AF37] mt-0.5 flex-shrink-0" />
                    <span>{piece}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-4">
              <div className="flex items-center gap-2 text-[#4A1D43] mb-1">
                <Building2 className="w-4 h-4" />
                <span className="font-semibold text-sm">{t.competentService}</span>
              </div>
              <p className="text-gray-700 text-sm">{selectedDemarche.service_competent}</p>
            </div>

            {(selectedDemarche.lien_pdf_formulaire || selectedDemarche.formulaire_url) && (
              <div className="border-t border-[#D4AF37] pt-4">
                <div className="flex flex-col sm:flex-row gap-2">
                  {selectedDemarche.lien_pdf_formulaire && (
                    <a
                      href={selectedDemarche.lien_pdf_formulaire}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4A1D43] text-[#D4AF37] rounded-lg hover:bg-[#D4AF37] hover:text-[#4A1D43] transition font-semibold text-sm border-2 border-[#D4AF37]"
                    >
                      <Download className="w-4 h-4" />
                      {t.downloadForm}
                    </a>
                  )}
                  {selectedDemarche.formulaire_url && (
                    <a
                      href={selectedDemarche.formulaire_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-5 py-2.5 bg-[#4A1D43] text-[#D4AF37] rounded-lg hover:bg-[#D4AF37] hover:text-[#4A1D43] transition font-semibold text-sm border-2 border-[#D4AF37]"
                    >
                      <ExternalLink className="w-4 h-4" />
                      {t.accessOnlineForm}
                    </a>
                  )}
                </div>
                <div className="mt-3 p-3 bg-yellow-50 border border-yellow-300 rounded-lg">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 text-yellow-700 mt-0.5 flex-shrink-0" />
                    <p className="text-xs text-yellow-800">{t.legalWarning}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50">
      <section className="relative w-full overflow-hidden rounded-b-2xl shadow-md">
        <img
          src={getSupabaseImageUrl('cat_administratif.jpg')}
          alt="Services Publics en Tunisie"
          className="w-full h-[260px] object-cover brightness-[0.6]"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-[#4A1D43]/30 to-[#4A1D43]/40"></div>

        {onNavigateBack && (
          <div className="absolute top-4 left-4 z-10">
            <button
              onClick={onNavigateBack}
              className="flex items-center gap-2 text-[#D4AF37] hover:text-[#D4AF37]/80 transition-colors text-sm font-medium drop-shadow-lg"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>{t.backButton}</span>
            </button>
          </div>
        )}

        <div className="absolute inset-0 flex flex-col items-center justify-center text-center text-white px-4 py-6">
          <h1 className="text-3xl md:text-4xl font-semibold mb-2 drop-shadow-lg text-[#D4AF37]">
            {t.title}
          </h1>
          <p className="text-sm md:text-base font-light text-white/95 max-w-3xl leading-relaxed drop-shadow-lg">
            {t.description}
          </p>
        </div>
      </section>

      {/* Barre de recherche */}
      <section className="px-4 py-6">
        <div className="max-w-5xl mx-auto">
          <CategorySearchBar
            listePageValue="services citoyens"
            placeholder={language === 'fr' ? 'Rechercher un service administratif...' : language === 'ar' ? 'البحث عن خدمة إدارية...' : 'Search for an administrative service...'}
            onSelectBusiness={(businessId) => navigate(`/business/${businessId}`)}
            onSearch={(query, ville) => {
              setAdminSearchTerm(query);
              setAdminSelectedGouvernorat(ville);
            }}
          />
        </div>
      </section>

      {(q || ville) && (
        <section className="px-4 pb-2">
          <div className="max-w-5xl mx-auto">
            <div className="text-xs text-gray-500">
              {q && <>Recherche : <b>{q}</b> · </>}
              {ville && <>Ville : <b>{ville}</b></>}
            </div>
          </div>
        </section>
      )}

      <section className="px-4 pb-4">
        <div className="max-w-5xl mx-auto">
          <div className="bg-gradient-to-r from-[#4A1D43]/5 to-white border-2 border-[#D4AF37] rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-[#4A1D43] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-[#4A1D43] mb-0.5">{t.infoTitle}</h3>
                <p className="text-xs text-gray-700 leading-snug">{t.infoText}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="px-4 pb-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold text-[#4A1D43] mb-2">Services Administratifs & Financiers</h2>
          <p className="text-gray-600 text-xs mb-3">
            Trouvez les banques, assurances, bureaux de change et autres services administratifs près de chez vous.
          </p>
          <AdminSearchBar
            searchTerm={adminSearchTerm}
            onSearchTermChange={setAdminSearchTerm}
            selectedGouvernorat={adminSelectedGouvernorat}
            onSelectedGouvernoratChange={setAdminSelectedGouvernorat}
            selectedCategory={adminSelectedCategory}
            onSelectedCategoryChange={setAdminSelectedCategory}
            onSearch={runAdminSearch}
          />
        </div>
      </section>

      {hasActiveAdminSearch && (
        <section ref={adminResultsRef} className="px-4 pb-4">
          <div className="max-w-5xl mx-auto">
            <div className="mb-3">
              <h2 className="text-lg font-semibold text-[#4A1D43] mb-1">
                Résultats de recherche
              </h2>
              <div className="flex items-center justify-between">
                <p className="text-xs text-gray-600">
                  <span className="font-semibold text-[#4A1D43]">{adminResults.length}</span> résultats
                </p>
                <button
                  onClick={() => {
                    setAdminSearchTerm('');
                    setAdminSelectedGouvernorat('');
                    setAdminSelectedCategory('');
                    setAdminResults([]);
                  }}
                  className="text-xs text-gray-600 hover:text-[#4A1D43] underline"
                >
                  Réinitialiser la recherche
                </button>
              </div>
            </div>

            {adminLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-8 h-8 text-[#4A1D43] animate-spin" />
                <p className="text-xs text-gray-600 ml-3">Recherche en cours...</p>
              </div>
            ) : adminResults.length === 0 ? (
              <div className="text-center py-8">
                <Landmark className="w-12 h-12 text-gray-300 mx-auto mb-2" />
                <h3 className="text-sm font-semibold text-gray-700 mb-1">Aucun service trouvé</h3>
                <p className="text-xs text-gray-500">Essayez de modifier vos critères de recherche</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminResults.map((service) => (
                  <UnifiedBusinessCard
                    key={service.id}
                    business={service as any}
                    onClick={() => navigate(`/business/${service.id}`)}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      )}


      <section className="px-4 pb-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold text-[#4A1D43] mb-2">{t.demarchesTitle}</h2>
          {loading ? (
            <p className="text-gray-500 text-xs">{t.loading}</p>
          ) : demarches.length === 0 ? (
            <div className="text-center py-3">
              <p className="text-gray-600 text-xs">{t.noDemarches}</p>
              <p className="text-xs text-gray-500 mt-0.5">{t.modifyFilters}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {demarches.map((demarche) => (
                <div
                  key={demarche.id}
                  onClick={() => setSelectedDemarche(demarche)}
                  className="bg-white rounded-lg border-2 border-[#D4AF37] p-4 hover:shadow-md transition cursor-pointer hover:border-[#4A1D43]"
                >
                  <h3 className="font-semibold text-[#4A1D43] mb-1.5 text-sm">
                    {getTranslatedText(demarche, 'nom')}
                  </h3>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                    {getTranslatedText(demarche, 'description')}
                  </p>
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <FileText className="w-3.5 h-3.5" />
                    <span>
                      {getTranslatedPieces(demarche).length} {t.piecesRequises}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pb-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold text-[#4A1D43] mb-2">{t.etablissementsTitle}</h2>
          {etablissements.length === 0 ? (
            <div className="text-center py-3">
              <p className="text-gray-600 text-xs">{t.noEtablissements}</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {etablissements.map((etab) => (
                <div
                  key={etab.id}
                  className="bg-white rounded-lg border-2 border-[#D4AF37] p-4 hover:shadow-md transition"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <Building2 className="w-5 h-5 text-[#4A1D43] flex-shrink-0" />
                    <div>
                      <h3 className="font-semibold text-[#4A1D43] text-sm">{etab.nom}</h3>
                      <p className="text-xs text-gray-600">{etab.ville}</p>
                    </div>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex items-start gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-gray-500 flex-shrink-0 mt-0.5" />
                      <span className="text-gray-700">{etab.adresse}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-gray-500" />
                      <a href={`tel:${etab.telephone}`} className="text-[#D4AF37] hover:underline font-medium">
                        {etab.telephone}
                      </a>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-gray-500" />
                      <span className="text-gray-700">{etab.horaires}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="px-4 pb-6">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-lg font-semibold text-[#4A1D43] mb-2">{t.usefulLinks}</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <a
              href="https://www.rne.tn"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg border border-[#D4AF37] p-3 hover:bg-[#D4AF37]/10 hover:shadow-md transition-all flex items-start gap-2"
            >
              <ExternalLink className="w-4 h-4 text-[#4A1D43] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-[#4A1D43] text-sm">{t.rne}</h3>
              </div>
            </a>
            <a
              href="https://www.e-justice.tn"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg border border-[#D4AF37] p-3 hover:bg-[#D4AF37]/10 hover:shadow-md transition-all flex items-start gap-2"
            >
              <ExternalLink className="w-4 h-4 text-[#4A1D43] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-[#4A1D43] text-sm">{t.ejustice}</h3>
              </div>
            </a>
            <a
              href="https://www.passeport.gov.tn"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white rounded-lg border border-[#D4AF37] p-3 hover:bg-[#D4AF37]/10 hover:shadow-md transition-all flex items-start gap-2"
            >
              <ExternalLink className="w-4 h-4 text-[#4A1D43] flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-[#4A1D43] text-sm">{t.passport}</h3>
              </div>
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
