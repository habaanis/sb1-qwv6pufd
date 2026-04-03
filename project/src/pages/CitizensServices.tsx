import { motion } from 'framer-motion';
import { Heart, Users, Baby, Building2, Phone, MapPin, Shield, AlertCircle, CheckCircle, Search, FileText, Clock, Download, ExternalLink } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { getStructureImageUrl } from '../lib/imageUtils';
import { useState, useEffect } from 'react';
import BackButton from '../components/BackButton';
import CategorySearchBar from '../components/CategorySearchBar';
import { UnifiedBusinessCard } from '../components/UnifiedBusinessCard';
import { supabase } from '../lib/supabaseClient';
import { BusinessDetail } from '../components/BusinessDetail';

interface CitizensServicesProps {
  onNavigateBack?: () => void;
}

interface Demarche {
  id: string;
  nom: string;
  nom_ar?: string;
  nom_en?: string;
  description: string;
  description_ar?: string;
  description_en?: string;
  pieces_requises: string[];
  pieces_requises_ar?: string[];
  pieces_requises_en?: string[];
  delai_traitement: string;
  cout: string;
  service_competent: string;
  formulaire_url?: string | null;
  lien_pdf_formulaire?: string | null;
}

export default function CitizensServices({ onNavigateBack }: CitizensServicesProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const ss = t.citizens.socialServices;

  const [activeTab, setActiveTab] = useState<'bureaux' | 'demarches' | 'social'>('bureaux');
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState<any>(null);
  const [selectedDemarche, setSelectedDemarche] = useState<Demarche | null>(null);

  const heroImageUrl = getStructureImageUrl('/images/service-social.jpg');

  useEffect(() => {
    if (activeTab === 'bureaux') {
      fetchBusinesses();
    }
  }, [activeTab]);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('entreprise')
        .select('*')
        .or('"liste pages".cs.{"services citoyens"},secteur.eq.Services')
        .limit(12);

      if (error) throw error;
      setBusinesses(data || []);
    } catch (error) {
      console.error('Erreur chargement entreprises:', error);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectBusinessById = async (businessId: string) => {
    try {
      const { data, error } = await supabase
        .from('entreprise')
        .select('*')
        .eq('id', businessId)
        .single();

      if (error) throw error;
      if (data) {
        setSelectedBusiness(data);
      }
    } catch (error) {
      console.error('Erreur chargement business:', error);
    }
  };

  const emergencyNumbers = [
    { label: ss.urgencyNumbers.samu, number: '190', icon: Phone },
    { label: ss.urgencyNumbers.protection, number: '198', icon: Shield },
    { label: ss.urgencyNumbers.police, number: '197', icon: AlertCircle },
    { label: ss.urgencyNumbers.sosEnfance, number: '1809', icon: Baby },
    { label: ss.urgencyNumbers.soutienFemmes, number: '1899', icon: Heart },
  ];

  const mockDemarches: Demarche[] = [
    {
      id: '1',
      nom: 'Carte d\'identité nationale',
      nom_ar: 'بطاقة التعريف الوطنية',
      nom_en: 'National ID Card',
      description: 'Obtention ou renouvellement de la carte d\'identité nationale pour les citoyens tunisiens.',
      description_ar: 'الحصول على بطاقة التعريف الوطنية أو تجديدها للمواطنين التونسيين.',
      description_en: 'Obtain or renew the national ID card for Tunisian citizens.',
      pieces_requises: [
        'Acte de naissance (original + 2 photocopies)',
        'Certificat de résidence (moins de 3 mois)',
        '2 photos d\'identité récentes',
        'Ancienne carte d\'identité (si renouvellement)'
      ],
      pieces_requises_ar: [
        'شهادة ميلاد (الأصل + نسختان)',
        'شهادة إقامة (أقل من 3 أشهر)',
        'صورتان شمسيتان حديثتان',
        'بطاقة التعريف القديمة (في حالة التجديد)'
      ],
      pieces_requises_en: [
        'Birth certificate (original + 2 copies)',
        'Residence certificate (less than 3 months)',
        '2 recent ID photos',
        'Old ID card (if renewal)'
      ],
      delai_traitement: '15 jours ouvrables',
      cout: '10 TND',
      service_competent: 'Mairie / Municipalité',
      formulaire_url: null,
      lien_pdf_formulaire: null
    },
    {
      id: '2',
      nom: 'Passeport biométrique',
      nom_ar: 'جواز السفر البيومتري',
      nom_en: 'Biometric Passport',
      description: 'Demande de passeport biométrique pour voyages internationaux.',
      description_ar: 'طلب جواز سفر بيومتري للسفر الدولي.',
      description_en: 'Apply for a biometric passport for international travel.',
      pieces_requises: [
        'Carte d\'identité nationale en cours de validité',
        'Extrait de naissance (n°12) original',
        'Certificat de résidence (moins de 3 mois)',
        '4 photos d\'identité aux normes biométriques',
        'Ancien passeport (si renouvellement)'
      ],
      pieces_requises_ar: [
        'بطاقة التعريف الوطنية سارية المفعول',
        'نسخة من عقد الميلاد (رقم 12) الأصلية',
        'شهادة إقامة (أقل من 3 أشهر)',
        '4 صور شمسية بمقاييس بيومترية',
        'جواز السفر القديم (في حالة التجديد)'
      ],
      pieces_requises_en: [
        'Valid national ID card',
        'Birth certificate (n°12) original',
        'Residence certificate (less than 3 months)',
        '4 biometric standard ID photos',
        'Old passport (if renewal)'
      ],
      delai_traitement: '3 à 6 semaines',
      cout: '100 TND (ordinaire) / 150 TND (urgent)',
      service_competent: 'Préfecture / Direction Générale de la Sûreté Nationale',
      formulaire_url: 'https://www.passeport.gov.tn',
      lien_pdf_formulaire: null
    },
    {
      id: '3',
      nom: 'Acte de naissance (Extrait n°12)',
      nom_ar: 'شهادة ميلاد (نسخة رقم 12)',
      nom_en: 'Birth Certificate (Extract n°12)',
      description: 'Obtention d\'un extrait d\'acte de naissance officiel.',
      description_ar: 'الحصول على نسخة رسمية من عقد الميلاد.',
      description_en: 'Obtain an official birth certificate extract.',
      pieces_requises: [
        'Carte d\'identité du demandeur',
        'Formulaire de demande rempli',
        'Frais de timbre'
      ],
      pieces_requises_ar: [
        'بطاقة التعريف الوطنية لمقدم الطلب',
        'استمارة الطلب المعبأة',
        'رسوم الطابع'
      ],
      pieces_requises_en: [
        'Applicant\'s ID card',
        'Completed application form',
        'Stamp fees'
      ],
      delai_traitement: 'Immédiat à 48h',
      cout: '2 TND',
      service_competent: 'Mairie / Bureau d\'État Civil',
      formulaire_url: null,
      lien_pdf_formulaire: null
    },
    {
      id: '4',
      nom: 'Certificat de résidence',
      nom_ar: 'شهادة إقامة',
      nom_en: 'Residence Certificate',
      description: 'Document attestant votre lieu de résidence actuel.',
      description_ar: 'وثيقة تثبت مكان إقامتك الحالي.',
      description_en: 'Document certifying your current place of residence.',
      pieces_requises: [
        'Carte d\'identité nationale',
        'Justificatif de domicile (facture STEG, SONEDE ou quittance de loyer)',
        'Présence physique obligatoire'
      ],
      pieces_requises_ar: [
        'بطاقة التعريف الوطنية',
        'ما يثبت العنوان (فاتورة STEG، SONEDE أو وصل إيجار)',
        'الحضور الشخصي إلزامي'
      ],
      pieces_requises_en: [
        'National ID card',
        'Proof of address (STEG, SONEDE bill or rent receipt)',
        'Physical presence required'
      ],
      delai_traitement: 'Immédiat',
      cout: 'Gratuit',
      service_competent: 'Omda / Cheikh',
      formulaire_url: null,
      lien_pdf_formulaire: null
    },
    {
      id: '5',
      nom: 'Extrait de casier judiciaire (Bulletin n°3)',
      nom_ar: 'بطاقة السوابق العدلية (النشرة رقم 3)',
      nom_en: 'Criminal Record Extract (Bulletin n°3)',
      description: 'Document attestant l\'absence de condamnations pénales.',
      description_ar: 'وثيقة تثبت عدم وجود سوابق عدلية.',
      description_en: 'Document certifying the absence of criminal convictions.',
      pieces_requises: [
        'Carte d\'identité nationale',
        'Timbre fiscal de 1 TND',
        'Formulaire de demande'
      ],
      pieces_requises_ar: [
        'بطاقة التعريف الوطنية',
        'طابع جبائي بقيمة 1 دينار',
        'استمارة الطلب'
      ],
      pieces_requises_en: [
        'National ID card',
        '1 TND fiscal stamp',
        'Application form'
      ],
      delai_traitement: '3 à 7 jours',
      cout: '1 TND',
      service_competent: 'Tribunal de Première Instance',
      formulaire_url: 'https://www.e-justice.tn',
      lien_pdf_formulaire: null
    },
    {
      id: '6',
      nom: 'Certificat de vie',
      nom_ar: 'شهادة حياة',
      nom_en: 'Life Certificate',
      description: 'Document attestant que vous êtes en vie (souvent requis pour les retraités).',
      description_ar: 'وثيقة تثبت أنك على قيد الحياة (مطلوبة عادة للمتقاعدين).',
      description_en: 'Document certifying that you are alive (often required for retirees).',
      pieces_requises: [
        'Carte d\'identité nationale',
        'Présence physique obligatoire'
      ],
      pieces_requises_ar: [
        'بطاقة التعريف الوطنية',
        'الحضور الشخصي إلزامي'
      ],
      pieces_requises_en: [
        'National ID card',
        'Physical presence required'
      ],
      delai_traitement: 'Immédiat',
      cout: 'Gratuit',
      service_competent: 'Omda / Cheikh / Municipalité',
      formulaire_url: null,
      lien_pdf_formulaire: null
    }
  ];

  const getTranslatedText = (demarche: Demarche, field: 'nom' | 'description'): string => {
    if (field === 'nom') {
      switch (language) {
        case 'ar': return demarche.nom_ar || demarche.nom;
        case 'en': return demarche.nom_en || demarche.nom;
        default: return demarche.nom;
      }
    } else {
      switch (language) {
        case 'ar': return demarche.description_ar || demarche.description;
        case 'en': return demarche.description_en || demarche.description;
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

  if (selectedDemarche) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 p-4">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setSelectedDemarche(null)}
            className="mb-4 flex items-center gap-2 text-[#4A1D43] hover:text-[#D4AF37] transition font-semibold"
          >
            <MapPin className="w-5 h-5" />
            {language === 'fr' ? 'Retour aux démarches' : language === 'ar' ? 'العودة إلى الإجراءات' : 'Back to procedures'}
          </button>

          <div className="bg-white rounded-2xl border-2 border-[#D4AF37] shadow-lg p-6">
            <h1
              className="text-3xl font-bold text-[#4A1D43] mb-4"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {getTranslatedText(selectedDemarche, 'nom')}
            </h1>

            <p className="text-gray-700 leading-relaxed mb-6">
              {getTranslatedText(selectedDemarche, 'description')}
            </p>

            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gradient-to-r from-[#4A1D43]/5 to-white rounded-xl border-2 border-[#D4AF37] p-4">
                <div className="flex items-center gap-2 text-[#4A1D43] mb-2">
                  <Clock className="w-5 h-5" />
                  <span className="font-semibold">
                    {language === 'fr' ? 'Délai de traitement' : language === 'ar' ? 'مدة المعالجة' : 'Processing time'}
                  </span>
                </div>
                <p className="text-gray-900 font-medium">{selectedDemarche.delai_traitement}</p>
              </div>

              <div className="bg-gradient-to-r from-[#4A1D43]/5 to-white rounded-xl border-2 border-[#D4AF37] p-4">
                <div className="flex items-center gap-2 text-[#4A1D43] mb-2">
                  <CheckCircle className="w-5 h-5" />
                  <span className="font-semibold">
                    {language === 'fr' ? 'Coût' : language === 'ar' ? 'التكلفة' : 'Cost'}
                  </span>
                </div>
                <p className="text-gray-900 font-medium">{selectedDemarche.cout}</p>
              </div>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 text-[#4A1D43] mb-3">
                <FileText className="w-5 h-5" />
                <span
                  className="font-bold text-lg"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {language === 'fr' ? 'Pièces Requises' : language === 'ar' ? 'الوثائق المطلوبة' : 'Required Documents'}
                </span>
              </div>
              <ul className="space-y-3">
                {getTranslatedPieces(selectedDemarche).map((piece, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-gray-700">
                    <div className="w-6 h-6 bg-[#D4AF37] rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <CheckCircle className="w-4 h-4 text-[#4A1D43]" />
                    </div>
                    <span className="leading-relaxed">{piece}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mb-6">
              <div className="flex items-center gap-2 text-[#4A1D43] mb-2">
                <Building2 className="w-5 h-5" />
                <span className="font-semibold">
                  {language === 'fr' ? 'Service compétent' : language === 'ar' ? 'الخدمة المختصة' : 'Competent service'}
                </span>
              </div>
              <p className="text-gray-700">{selectedDemarche.service_competent}</p>
            </div>

            {(selectedDemarche.lien_pdf_formulaire || selectedDemarche.formulaire_url) && (
              <div className="border-t-2 border-[#D4AF37] pt-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  {selectedDemarche.lien_pdf_formulaire && (
                    <a
                      href={selectedDemarche.lien_pdf_formulaire}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-[#4A1D43] text-[#D4AF37] rounded-lg hover:bg-[#D4AF37] hover:text-[#4A1D43] transition font-semibold border-2 border-[#D4AF37]"
                    >
                      <Download className="w-5 h-5" />
                      {language === 'fr' ? 'Télécharger le formulaire PDF' : language === 'ar' ? 'تحميل النموذج PDF' : 'Download PDF form'}
                    </a>
                  )}
                  {selectedDemarche.formulaire_url && (
                    <a
                      href={selectedDemarche.formulaire_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-center gap-2 px-6 py-3 bg-[#4A1D43] text-[#D4AF37] rounded-lg hover:bg-[#D4AF37] hover:text-[#4A1D43] transition font-semibold border-2 border-[#D4AF37]"
                    >
                      <ExternalLink className="w-5 h-5" />
                      {language === 'fr' ? 'Accéder au formulaire en ligne' : language === 'ar' ? 'الوصول إلى النموذج عبر الإنترنت' : 'Access online form'}
                    </a>
                  )}
                </div>
                <div className="mt-4 p-4 bg-yellow-50 border-2 border-yellow-400 rounded-lg">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-yellow-700 flex-shrink-0 mt-0.5" />
                    <p className="text-sm text-yellow-800 leading-relaxed">
                      {language === 'fr' ? 'Attention : Vérifiez toujours la validité de ce formulaire auprès de l\'administration concernée avant de vous déplacer.' :
                       language === 'ar' ? 'تحذير: يرجى دائماً التحقق من صحة هذا النموذج مع الإدارة المعنية قبل التنقل.' :
                       'Warning: Always verify the validity of this form with the relevant administration before traveling.'}
                    </p>
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
      {/* Bouton Retour */}
      <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-[#D4AF37] px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto">
          <BackButton onNavigateBack={onNavigateBack} label={ss.backButton} />
        </div>
      </div>

      {/* Hero Banner Bordeaux/Or - Compact */}
      <section className="relative w-full h-[220px] overflow-hidden">
        <div className={`absolute inset-0 bg-gradient-to-br from-gray-200 via-gray-100 to-white transition-opacity duration-500 ${imageLoaded && !imageError ? 'opacity-0' : 'opacity-100'}`}></div>

        <img
          src={heroImageUrl}
          alt="Services Citoyens"
          className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-500 ${imageLoaded && !imageError ? 'opacity-100' : 'opacity-0'}`}
          loading="lazy"
          onLoad={() => setImageLoaded(true)}
          onError={() => {
            setImageError(true);
            console.error('Failed to load hero image:', heroImageUrl);
          }}
        />

        <div className="absolute inset-0 bg-gradient-to-r from-[#4A1D43]/90 via-[#4A1D43]/75 to-[#D4AF37]/30"></div>

        <div className="relative h-full flex items-center justify-center px-4">
          <div className="max-w-4xl mx-auto text-center text-white">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.6 }}
            >
              <h1
                className="text-3xl md:text-4xl font-bold mb-3 tracking-wide text-white"
                style={{
                  fontFamily: "'Playfair Display', serif",
                  textShadow: '0 4px 12px rgba(0,0,0,0.8), 0 2px 4px rgba(0,0,0,0.6)'
                }}
              >
                Services Citoyens
              </h1>
              <p
                className="text-sm md:text-base font-light text-white/95 leading-relaxed max-w-3xl mx-auto"
                style={{
                  textShadow: '0 3px 8px rgba(0,0,0,0.7), 0 1px 3px rgba(0,0,0,0.5)'
                }}
              >
                {language === 'fr' ? 'La Tunisie dispose d\'un réseau de services sociaux dédiés au soutien des familles, à l\'accès aux soins et à la protection de l\'enfance. Découvrez les programmes nationaux et les structures locales qui vous accompagnent.' :
                 language === 'ar' ? 'تمتلك تونس شبكة من الخدمات الاجتماعية المخصصة لدعم الأسر والوصول إلى الرعاية الصحية وحماية الطفل. اكتشف البرامج الوطنية والهياكل المحلية التي ترافقك.' :
                 language === 'en' ? 'Tunisia has a network of social services dedicated to supporting families, access to care and child protection. Discover the national programs and local structures that support you.' :
                 'La Tunisia ha una rete di servizi sociali dedicati al sostegno delle famiglie, all\'accesso alle cure e alla protezione dell\'infanzia. Scopri i programmi nazionali e le strutture locali che ti accompagnano.'}
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Système d'Onglets 3 tabs Bordeaux/Or - Sticky */}
      <section className="sticky top-[60px] z-10 px-4 py-2 bg-white border-b border-[#D4AF37] shadow-sm">
        <div className="max-w-5xl mx-auto">
          <div className="flex gap-2 justify-center flex-wrap">
            <button
              onClick={() => setActiveTab('bureaux')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'bureaux'
                  ? 'bg-[#4A1D43] text-[#D4AF37] shadow-lg border-2 border-[#D4AF37]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
              }`}
              style={{ fontFamily: activeTab === 'bureaux' ? "'Playfair Display', serif" : 'inherit' }}
            >
              <Building2 className="w-5 h-5" />
              <span>
                {language === 'fr' ? 'Bureaux' :
                 language === 'ar' ? 'المكاتب' :
                 language === 'en' ? 'Offices' :
                 'Uffici'}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('demarches')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'demarches'
                  ? 'bg-[#4A1D43] text-[#D4AF37] shadow-lg border-2 border-[#D4AF37]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
              }`}
              style={{ fontFamily: activeTab === 'demarches' ? "'Playfair Display', serif" : 'inherit' }}
            >
              <FileText className="w-5 h-5" />
              <span>
                {language === 'fr' ? 'Démarches' :
                 language === 'ar' ? 'الإجراءات' :
                 language === 'en' ? 'Procedures' :
                 'Procedure'}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('social')}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-semibold transition-all ${
                activeTab === 'social'
                  ? 'bg-[#4A1D43] text-[#D4AF37] shadow-lg border-2 border-[#D4AF37]'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200 border-2 border-transparent'
              }`}
              style={{ fontFamily: activeTab === 'social' ? "'Playfair Display', serif" : 'inherit' }}
            >
              <Heart className="w-5 h-5" />
              <span>
                {language === 'fr' ? 'Social' :
                 language === 'ar' ? 'الشؤون الاجتماعية' :
                 language === 'en' ? 'Social' :
                 'Sociale'}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Contenu Onglet BUREAUX - Compact */}
      {activeTab === 'bureaux' && (
        <>
          {/* Barre de recherche sous les onglets */}
          <section className="px-4 py-2 bg-white">
            <div className="max-w-5xl mx-auto">
              <CategorySearchBar
                listePageValue="services citoyens"
                placeholder={language === 'fr' ? 'Rechercher un service citoyen...' : language === 'ar' ? 'البحث عن خدمة المواطن...' : 'Search for a citizen service...'}
                onSelectBusiness={(businessId) => handleSelectBusinessById(businessId)}
                onSearch={(query, ville) => {
                  console.log('Recherche Services Citoyens:', { query, ville });
                }}
              />
            </div>
          </section>

          {!loading && businesses.length > 0 && (
            <section className="px-4 py-2 bg-white">
              <div className="max-w-6xl mx-auto">
                <h2
                  className="text-xl font-bold text-[#4A1D43] mb-3 text-center"
                  style={{ fontFamily: "'Playfair Display', serif" }}
                >
                  {language === 'fr' ? 'Bureaux & Établissements publics' :
                   language === 'ar' ? 'المكاتب والمؤسسات العامة' :
                   language === 'en' ? 'Offices & Public establishments' :
                   'Uffici e stabilimenti pubblici'}
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                  {businesses.map((business) => (
                    <UnifiedBusinessCard
                      key={business.id}
                      business={business}
                      onClick={() => setSelectedBusiness(business)}
                    />
                  ))}
                </div>
              </div>
            </section>
          )}

          {loading && (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#4A1D43]"></div>
            </div>
          )}

          {!loading && businesses.length === 0 && (
            <div className="text-center py-4">
              <Search className="w-10 h-10 mx-auto text-[#D4AF37] mb-2" />
              <p className="text-gray-600 text-sm">
                {language === 'fr' ? 'Aucun bureau trouvé. Utilisez la recherche ci-dessus.' :
                 language === 'ar' ? 'لم يتم العثور على مكاتب. استخدم البحث أعلاه.' :
                 'No offices found. Use the search above.'}
              </p>
            </div>
          )}
        </>
      )}

      {/* Contenu Onglet DÉMARCHES - Compact */}
      {activeTab === 'demarches' && (
        <section className="px-4 py-2 bg-white">
          <div className="max-w-6xl mx-auto">
            <h2
              className="text-xl font-bold text-[#4A1D43] mb-2 text-center"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              {language === 'fr' ? 'Démarches Administratives' :
               language === 'ar' ? 'الإجراءات الإدارية' :
               language === 'en' ? 'Administrative Procedures' :
               'Procedure Amministrative'}
            </h2>
            <p className="text-center text-gray-600 mb-3 max-w-3xl mx-auto text-xs">
              {language === 'fr' ? 'Retrouvez toutes les informations pour vos démarches : documents requis, délais, coûts et services compétents.' :
               language === 'ar' ? 'اعثر على جميع المعلومات لإجراءاتك: الوثائق المطلوبة والمواعيد النهائية والتكاليف والخدمات المختصة.' :
               language === 'en' ? 'Find all the information for your procedures: required documents, deadlines, costs and competent services.' :
               'Trova tutte le informazioni per le tue procedure: documenti richiesti, scadenze, costi e servizi competenti.'}
            </p>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-3">
              {mockDemarches.map((demarche) => (
                <motion.div
                  key={demarche.id}
                  onClick={() => setSelectedDemarche(demarche)}
                  whileHover={{ y: -3, scale: 1.01 }}
                  className="bg-white rounded-lg border-2 border-[#D4AF37] p-4 hover:shadow-lg transition-all cursor-pointer hover:border-[#4A1D43] group"
                >
                  <div className="flex items-start gap-2 mb-2">
                    <div className="w-8 h-8 bg-[#4A1D43] rounded-lg flex items-center justify-center flex-shrink-0 group-hover:bg-[#D4AF37] transition-colors">
                      <FileText className="w-4 h-4 text-[#D4AF37] group-hover:text-[#4A1D43]" />
                    </div>
                    <div className="flex-1">
                      <h3
                        className="font-bold text-[#4A1D43] mb-1 text-sm"
                        style={{ fontFamily: "'Playfair Display', serif" }}
                      >
                        {getTranslatedText(demarche, 'nom')}
                      </h3>
                    </div>
                  </div>
                  <p className="text-gray-600 text-xs mb-3 line-clamp-2 leading-snug">
                    {getTranslatedText(demarche, 'description')}
                  </p>
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-1 text-[#4A1D43]">
                      <FileText className="w-3 h-3" />
                      <span className="font-medium">
                        {getTranslatedPieces(demarche).length} {language === 'fr' ? 'pièces' : language === 'ar' ? 'وثائق' : 'docs'}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 text-[#4A1D43]">
                      <Clock className="w-3 h-3" />
                      <span className="font-medium">{demarche.delai_traitement}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Contenu Onglet SOCIAL (Ancien contenu social intact) */}
      {activeTab === 'social' && (
        <>
          <section className="px-4 py-2 bg-gray-50">
            <div className="max-w-5xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <div className="text-center mb-3">
                  <h2
                    className="text-3xl font-bold text-[#4A1D43] mb-3 tracking-wide"
                    style={{ fontFamily: "'Playfair Display', serif" }}
                  >
                    {ss.urgencyNumbers.title}
                  </h2>
                  <p className="text-gray-600">
                    {ss.urgencyNumbers.subtitle}
                  </p>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {emergencyNumbers.map((item, idx) => {
                    const Icon = item.icon;
                    return (
                      <motion.a
                        key={item.number}
                        href={`tel:${item.number}`}
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: idx * 0.05, duration: 0.4 }}
                        className="flex flex-col items-center justify-center bg-[#4A1D43] rounded-lg px-3 py-3 hover:bg-[#5A2D53] hover:shadow-lg hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer border-2 border-[#D4AF37]"
                      >
                        <div className="w-8 h-8 rounded-lg bg-[#D4AF37] flex items-center justify-center shadow-md mb-1.5">
                          <Icon className="w-4 h-4 text-[#4A1D43]" />
                        </div>
                        <span className="font-medium text-[#D4AF37] text-xs text-center line-clamp-2 mb-1">{item.label}</span>
                        <span
                          className="text-lg font-bold text-[#D4AF37]"
                          style={{ fontFamily: "'Playfair Display', serif" }}
                        >
                          {item.number}
                        </span>
                      </motion.a>
                    );
                  })}
                </div>
              </motion.div>
            </div>
          </section>

          <section className="px-4 py-2 bg-white">
            <div className="max-w-6xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4 }}
              >
                <div className="flex items-center gap-3 mb-4 justify-center">
                  <div className="w-10 h-10 bg-[#4A1D43] rounded-lg flex items-center justify-center shadow border-2 border-[#D4AF37]">
                    <Heart className="w-5 h-5 text-[#D4AF37]" />
                  </div>
                  <div className="text-center">
                    <h2
                      className="text-xl font-bold text-[#4A1D43] tracking-wide"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {ss.sections.national.title}
                    </h2>
                    <p className="text-sm text-gray-600">{ss.sections.national.subtitle}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div className="bg-white rounded-lg p-3 shadow hover:shadow-md transition-all border-2 border-[#D4AF37]">
                    <h3
                      className="text-sm font-bold text-[#4A1D43] mb-1.5"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {ss.sections.national.amenSocial.title}
                    </h3>
                    <p className="text-gray-700 mb-2 leading-snug text-xs line-clamp-3">
                      {ss.sections.national.amenSocial.description}
                    </p>
                    <div className="bg-[#4A1D43] rounded p-2">
                      <p className="text-xs font-medium text-[#D4AF37]">
                        ✓ {ss.sections.national.amenSocial.benefits}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow hover:shadow-md transition-all border-2 border-[#D4AF37]">
                    <h3
                      className="text-sm font-bold text-[#4A1D43] mb-1.5"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {ss.sections.national.pnafn.title}
                    </h3>
                    <p className="text-gray-700 mb-2 leading-snug text-xs line-clamp-3">
                      {ss.sections.national.pnafn.description}
                    </p>
                    <div className="bg-[#4A1D43] rounded p-2">
                      <p className="text-xs font-medium text-[#D4AF37]">
                        ✓ {ss.sections.national.pnafn.benefits}
                      </p>
                    </div>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow hover:shadow-md transition-all border-2 border-[#D4AF37]">
                    <div className="w-8 h-8 bg-[#4A1D43] rounded-lg flex items-center justify-center mx-auto mb-1.5">
                      <Shield className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <h3
                      className="text-sm font-bold text-[#4A1D43] mb-1.5 text-center"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {ss.sections.health.cnam.title}
                    </h3>
                    <p className="text-gray-700 mb-2 leading-snug text-xs line-clamp-2">
                      {ss.sections.health.cnam.description}
                    </p>
                    <a
                      href="tel:80101142"
                      className="flex items-center justify-center gap-1.5 text-[#4A1D43] font-semibold hover:text-[#D4AF37] transition-colors text-xs"
                    >
                      <Phone className="w-3 h-3" />
                      <span>80 101 142</span>
                    </a>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow hover:shadow-md transition-all border-2 border-[#D4AF37]">
                    <div className="w-8 h-8 bg-[#4A1D43] rounded-lg flex items-center justify-center mx-auto mb-1.5">
                      <Baby className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <h3
                      className="text-sm font-bold text-[#4A1D43] mb-1.5 text-center"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {ss.sections.childhood.allocations.title}
                    </h3>
                    <p className="text-gray-700 leading-snug text-xs line-clamp-2">
                      {ss.sections.childhood.allocations.description}
                    </p>
                  </div>

                  <div className="bg-white rounded-lg p-3 shadow hover:shadow-md transition-all border-2 border-[#D4AF37]">
                    <div className="w-8 h-8 bg-[#4A1D43] rounded-lg flex items-center justify-center mx-auto mb-1.5">
                      <Building2 className="w-4 h-4 text-[#D4AF37]" />
                    </div>
                    <h3
                      className="text-sm font-bold text-[#4A1D43] mb-1.5 text-center"
                      style={{ fontFamily: "'Playfair Display', serif" }}
                    >
                      {ss.ulpsInfo.title}
                    </h3>
                    <p className="text-gray-700 leading-snug text-xs line-clamp-2">
                      {ss.ulpsInfo.description}
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </section>


          <section className="px-4 py-3 bg-[#4A1D43] border-t-2 border-[#D4AF37]">
            <div className="max-w-4xl mx-auto text-center">
              <p className="text-sm text-[#D4AF37] font-medium">
                {language === 'fr' ? 'Ensemble, construisons une société plus juste et plus solidaire pour tous les Tunisiens.' :
                 language === 'ar' ? 'معا، لنبني مجتمعا أكثر عدلا وتضامنا لجميع التونسيين.' :
                 language === 'en' ? 'Together, let\'s build a more just and supportive society for all Tunisians.' :
                 'Insieme, costruiamo una società più giusta e solidale per tutti i tunisini.'}
              </p>
            </div>
          </section>
        </>
      )}

      {selectedBusiness && (
        <div
          className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setSelectedBusiness(null)}
        >
          <div
            className="relative max-w-2xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <BusinessDetail
              business={selectedBusiness}
              onNavigateBack={() => setSelectedBusiness(null)}
              onClose={() => setSelectedBusiness(null)}
              asModal={true}
            />
          </div>
        </div>
      )}
    </div>
  );
}
