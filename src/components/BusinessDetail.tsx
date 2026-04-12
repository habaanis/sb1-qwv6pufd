import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, MapPin, Phone, Mail, Globe, Star, Instagram, Facebook, Linkedin, Youtube, Navigation, Download, QrCode, Clock, ChevronDown, Link as LinkIcon, Check } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { ImageGallery } from '../components/ImageGallery';
import VideoPlayer from '../components/VideoPlayer';
import EntrepriseAvisForm from '../components/EntrepriseAvisForm';
import { generateShareUrl, extractIdFromSlugUrl } from '../lib/slugify';
import { SEOHead } from './SEOHead';
import { useHreflangPath } from '../hooks/useHreflangPath';
import {
  mapSubscriptionToTier,
  getTierLabel,
  isPremiumTier,
  getMediaLimits
} from '../lib/subscriptionTiers';
import { useViewTracking } from '../hooks/useViewTracking';
import StructuredData from '../components/StructuredData';
import { generateLocalBusinessSchema } from '../lib/structuredDataSchemas';
import {
  getParsedSchedule,
  translateScheduleTitle,
  translateScheduleNotAvailable,
  translateOpenStatus,
  translateClosedStatus,
  getDayName,
  formatTodayScheduleText,
  getTodaySchedule
} from '../lib/horaireUtils';
import { useCategoryTranslation } from '../hooks/useCategoryTranslation';
import { getMultilingualField } from '../lib/databaseI18n';
import { getLogoUrl, getLogoStyle, getLogoContainerStyle } from '../lib/logoUtils';

// Normalise les données business provenant de sources différentes (Airtable vs Supabase)
function normalizeBusiness(business: any): any {
  if (!business) return null;

  return {
    id: business.id,
    nom: business.nom || business.name || '',
    categorie: business.categorie || business.category || '',
    sous_categories: business.sous_categories || business.subCategories || '',
    ville: business.ville || business.city || business.gouvernorat || '',
    gouvernorat: business.gouvernorat || business.city || '',
    adresse: business.adresse || business.address || '',
    telephone: business.telephone || business.phone || '',
    email: business.email || '',
    site_web: business.site_web || business.website || '',
    description: business.description || '',
    services: business.services || '',
    latitude: business.latitude,
    longitude: business.longitude,
    created_at: business.created_at,
    image_url: business.image_url || business.imageUrl,
    logo_url: getLogoUrl(business.logo_url || business.logoUrl),
    statut_abonnement: business.statut_abonnement || business['statut Abonnement'],
    'Lien Instagram': business['Lien Instagram'] || business.instagram,
    'Lien TikTok': business['Lien TikTok'] || business.tiktok,
    'Lien LinkedIn': business['Lien LinkedIn'] || business.linkedin,
    'Lien YouTube': business['Lien YouTube'] || business.youtube,
    'lien facebook': business['lien facebook'] || business.facebook,
    'Lien Avis Google': business['Lien Avis Google'],
    video_url: business.video_url,
    horaires_ok: business.horaires_ok
  };
}

function getGoogleMapsDirectionsUrl(latitude?: number | null, longitude?: number | null, address?: string): string {
  if (latitude && longitude) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
  return '#';
}

interface BusinessDetailProps {
  businessId?: string;
  business?: any;
  onNavigateBack?: () => void;
  onClose?: () => void;
  asModal?: boolean;
}

interface Business {
  id: string;
  nom: string;
  categorie?: string;
  sous_categories?: string;
  ville: string;
  adresse: string;
  telephone: string;
  email: string;
  site_web?: string;
  description: string;
  services?: string;
  latitude?: number;
  longitude?: number;
  created_at?: string;
  image_url?: string;
  logo_url?: string;
  statut_abonnement?: string | null;
  'Lien Instagram'?: string;
  'Lien TikTok'?: string;
  'Lien LinkedIn'?: string;
  'Lien YouTube'?: string;
  'lien facebook'?: string;
  'Lien Avis Google'?: string;
  video_url?: string;
  horaires_ok?: string | null;
}

export const BusinessDetail = ({
  businessId: businessIdProp,
  business: businessProp,
  onNavigateBack,
  onClose,
  asModal = false
}: BusinessDetailProps) => {
  console.log('🟢 --- CHARGEMENT DU NOUVEAU MODÈLE 450PX ELITE --- 🟢');
  console.log('Business reçu BRUT:', businessProp);

  // Récupérer l'ID depuis l'URL si pas passé en prop
  const { id: urlId, slug: urlSlug } = useParams<{ id?: string; slug?: string }>();
  const navigate = useNavigate();

  // Si on a un slug (route /p/:slug), extraire l'ID du slug
  let extractedId: string | null = null;
  if (urlSlug && !urlId) {
    // Format attendu: nom-entreprise-recXXXXXXXX (Airtable ID = dernier segment après le dernier tiret)
    // Ex: "skila-mhadia-recmhQeR" → "recmhQeR"
    const segments = urlSlug.split('-');
    const lastSegment = segments[segments.length - 1];
    // Airtable IDs start with "rec" followed by alphanumeric chars, or can be any short ID
    if (lastSegment && lastSegment.length >= 6) {
      extractedId = lastSegment;
      console.log('📌 ID extrait du slug (dernier segment):', extractedId);
    }
  }

  const businessId = businessIdProp || urlId || extractedId;

  // Normaliser les données pour supporter Airtable et Supabase
  const normalizedBusiness = normalizeBusiness(businessProp);
  console.log('Business NORMALISÉ:', normalizedBusiness);
  console.log('BusinessId from prop:', businessIdProp);
  console.log('BusinessId from URL:', urlId);
  console.log('Final businessId:', businessId);
  console.log('Slug from URL:', urlSlug);
  console.log('AsModal:', asModal);

  const { language } = useLanguage();
  const { getCategory } = useCategoryTranslation();
  const currentPath = useHreflangPath();
  const [business, setBusiness] = useState<Business | null>(normalizedBusiness);
  const [loading, setLoading] = useState(!businessProp);
  const [error, setError] = useState(false);
  const qrCodeRef = useRef<HTMLDivElement>(null);
  const [averageRating, setAverageRating] = useState<number | null>(null);
  const [reviewCount, setReviewCount] = useState<number>(0);
  const [showFullSchedule, setShowFullSchedule] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const actualBusinessId = businessId || businessProp?.id;
  useViewTracking(actualBusinessId);

  const loadedBusinessIdRef = useRef<string | null>(null);
  const handleCloseRef = onClose || onNavigateBack || (() => navigate(-1));

  const translatedCategory = business ? getCategory(getMultilingualField(business, 'categorie', language, true) || business.categorie || '') : '';

  useEffect(() => {
    if (asModal && handleCloseRef) {
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = 'unset';
      };
    }
  }, [asModal, handleCloseRef]);

  const downloadQRCode = () => {
    if (!qrCodeRef.current) return;
    const svg = qrCodeRef.current.querySelector('svg');
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();

    img.onload = () => {
      canvas.width = img.width;
      canvas.height = img.height;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL('image/png');

      const downloadLink = document.createElement('a');
      downloadLink.download = `qr-code-${business?.nom || 'entreprise'}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
  };

  const copyLink = () => {
    if (!business || !actualBusinessId) return;
    const shareUrl = generateShareUrl(business.nom, actualBusinessId);
    navigator.clipboard.writeText(shareUrl).then(() => {
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 2000);
    });
  };

  const shareViaWhatsApp = () => {
    if (!business || !actualBusinessId) return;
    const shareUrl = generateShareUrl(business.nom, actualBusinessId);
    const shareText = `${business.nom} - ${translatedCategory}\n${shareUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
  };

  const shareViaMessenger = () => {
    if (!business || !actualBusinessId) return;
    const shareUrl = generateShareUrl(business.nom, actualBusinessId);
    window.open(`https://www.facebook.com/dialog/send?link=${encodeURIComponent(shareUrl)}&app_id=YOUR_APP_ID&redirect_uri=${encodeURIComponent(shareUrl)}`, '_blank');
  };

  const shareViaTelegram = () => {
    if (!business || !actualBusinessId) return;
    const shareUrl = generateShareUrl(business.nom, actualBusinessId);
    const shareText = `${business.nom} - ${translatedCategory}`;
    window.open(`https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`, '_blank');
  };

  useEffect(() => {
    if (businessProp) {
      const normalized = normalizeBusiness(businessProp);
      setBusiness(normalized);
      setLoading(false);
      loadedBusinessIdRef.current = businessProp.id;
      return;
    }

    if (!actualBusinessId) {
      setError(true);
      setLoading(false);
      return;
    }

    if (loadedBusinessIdRef.current === actualBusinessId) {
      return;
    }

    const fetchBusiness = async () => {
      console.log('🚀 [BusinessDetail] fetchBusiness démarré');
      console.log('📌 actualBusinessId:', actualBusinessId);
      console.log('📌 businessProp:', businessProp);

      setLoading(true);
      setError(false);

      try {
        console.log('🔍 Recherche par ID:', actualBusinessId);

        let query = supabase.from('entreprise').select('*');

        // Recherche exacte d'abord, puis par préfixe pour les IDs extraits d'un slug (premiers 8 chars du UUID)
        query = query.or(`id.eq.${actualBusinessId},id.ilike.${actualBusinessId}%`);

        console.log('⏳ Exécution de la requête Supabase...');
        const { data, error } = await query.maybeSingle();

        console.log('📊 Résultat Supabase:', { data, error });

        if (error || !data) {
          console.error('❌ Erreur lors du chargement de l\'entreprise:', error);
          console.error('❌ Pas de données:', !data);
          setError(true);
          setLoading(false);
          return;
        }

        console.log('✅ Entreprise trouvée:', data.nom);

        const mappedBusiness = {
          ...data,
          image_url: data.image_url || data.imageUrl || data.Image,
          logo_url: data.logo_url || data.logoUrl || data.Logo,
          statut_abonnement: (data['statut Abonnement'] || '').trim().toLowerCase() || null
        };
        const normalized = normalizeBusiness(mappedBusiness);
        setBusiness(normalized as Business);

        // Récupérer les avis
        try {
          const { data: avisData } = await supabase
            .from('avis_entreprise')
            .select('note')
            .eq('entreprise_id', actualBusinessId)
            .eq('status', 'approved');

          if (avisData && avisData.length > 0) {
            const totalRating = avisData.reduce((sum, avis) => sum + (avis.note || 0), 0);
            const avgRating = totalRating / avisData.length;
            setAverageRating(Number(avgRating.toFixed(1)));
            setReviewCount(avisData.length);
          }
        } catch (avisErr) {
          console.error('Erreur avis:', avisErr);
        }

        loadedBusinessIdRef.current = actualBusinessId;
      } catch (err) {
        console.error('Erreur fetch business:', err);
        setError(true);
      } finally {
        setLoading(false);
      }
    };

    fetchBusiness();
  }, [businessId, businessProp, actualBusinessId]);

  const translations = {
    fr: {
      loading: 'Chargement...',
      notFound: 'Entreprise introuvable.',
      backToSearch: 'Retour',
      description: 'À propos',
      services: 'Services',
      contact: 'Contact',
      qrCodeTitle: 'QR Code',
      downloadQR: 'Télécharger',
      directions: 'Itinéraire GPS',
      leaveReview: 'Laissez votre avis',
      openingHours: 'Horaires',
      linkCopied: 'Lien copié',
      recommendText: 'Recommander ce professionnel à un proche',
      shareViaWhatsApp: 'Partager via WhatsApp',
      shareViaMessenger: 'Partager via Messenger',
      shareViaTelegram: 'Partager via Telegram'
    },
    en: {
      loading: 'Loading...',
      notFound: 'Business not found.',
      backToSearch: 'Back',
      description: 'About',
      services: 'Services',
      contact: 'Contact',
      qrCodeTitle: 'QR Code',
      downloadQR: 'Download',
      directions: 'Get Directions',
      leaveReview: 'Leave a Review',
      openingHours: 'Opening Hours',
      linkCopied: 'Link copied',
      recommendText: 'Recommend this professional to a friend',
      shareViaWhatsApp: 'Share via WhatsApp',
      shareViaMessenger: 'Share via Messenger',
      shareViaTelegram: 'Share via Telegram'
    },
    ar: {
      loading: 'جارٍ التحميل...',
      notFound: 'الشركة غير موجودة.',
      backToSearch: 'رجوع',
      description: 'حول',
      services: 'الخدمات',
      contact: 'اتصال',
      qrCodeTitle: 'رمز QR',
      downloadQR: 'تحميل',
      directions: 'الاتجاهات',
      leaveReview: 'اترك تقييمك',
      openingHours: 'ساعات العمل',
      linkCopied: 'تم نسخ الرابط',
      recommendText: 'أوصي بهذا المحترف لصديق',
      shareViaWhatsApp: 'مشاركة عبر واتساب',
      shareViaMessenger: 'مشاركة عبر ماسنجر',
      shareViaTelegram: 'مشاركة عبر تيليجرام'
    },
    it: {
      loading: 'Caricamento...',
      notFound: 'Azienda non trovata.',
      backToSearch: 'Indietro',
      description: 'Informazioni',
      services: 'Servizi',
      contact: 'Contatto',
      qrCodeTitle: 'QR Code',
      downloadQR: 'Scarica',
      directions: 'Indicazioni',
      leaveReview: 'Lascia una recensione',
      openingHours: 'Orari',
      linkCopied: 'Link copiato',
      recommendText: 'Consiglia questo professionista a un amico',
      shareViaWhatsApp: 'Condividi su WhatsApp',
      shareViaMessenger: 'Condividi su Messenger',
      shareViaTelegram: 'Condividi su Telegram'
    },
    ru: {
      loading: 'Загрузка...',
      notFound: 'Компания не найдена.',
      backToSearch: 'Назад',
      description: 'О нас',
      services: 'Услуги',
      contact: 'Контакт',
      qrCodeTitle: 'QR код',
      downloadQR: 'Скачать',
      directions: 'Маршрут',
      leaveReview: 'Оставить отзыв',
      openingHours: 'Часы работы',
      linkCopied: 'Ссылка скопирована',
      recommendText: 'Порекомендовать этого специалиста другу',
      shareViaWhatsApp: 'Поделиться в WhatsApp',
      shareViaMessenger: 'Поделиться в Messenger',
      shareViaTelegram: 'Поделиться в Telegram'
    }
  };

  const text = translations[language as keyof typeof translations] || translations.fr;
  const isRTL = language === 'ar';

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg">{text.loading}</p>
      </div>
    );
  }

  if (error || !business) {
    const handleBack = onClose || onNavigateBack || (() => navigate(-1));
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <p className="text-gray-500 text-lg mb-6">{text.notFound}</p>
        <button
          onClick={handleBack}
          className="flex items-center gap-2 px-6 py-3 bg-[#D62828] text-white rounded-3xl hover:bg-[#b91c1c] transition-all"
        >
          <ArrowLeft size={20} />
          {text.backToSearch}
        </button>
      </div>
    );
  }

  const tier = mapSubscriptionToTier({
    statut_abonnement: business.statut_abonnement || null
  });
  const isPremium = isPremiumTier(tier);
  const tierLabel = getTierLabel(tier, language);
  const mediaLimits = getMediaLimits(tier);

  const handleClose = onClose || onNavigateBack || (() => navigate(-1));

  const getTierColors = () => {
    switch(tier) {
      case 'elite':
        return {
          background: '#000000',
          border: '#D4AF37',
          gold: '#D4AF37'
        };
      case 'premium':
        return {
          background: '#064E3B',
          border: '#D4AF37',
          gold: '#D4AF37'
        };
      case 'artisan':
        return {
          background: '#7F1D1D',
          border: '#DC2626',
          gold: '#DC2626'
        };
      default:
        return {
          background: '#064E3B',
          border: '#D4AF37',
          gold: '#D4AF37'
        };
    }
  };

  const colors = getTierColors();

  // Récupération des champs traduits avec fallback
  const translatedDescription = business ? (getMultilingualField(business, 'description', language, true) || business.description || '') : '';
  const translatedServices = business ? (getMultilingualField(business, 'services', language, true) || business.services || '') : '';

  const content = (
    <div className={asModal ? "" : "py-10 px-4"} dir={isRTL ? 'rtl' : 'ltr'}>
      {business && actualBusinessId && (
        <>
          <SEOHead
            title={`${business.nom} - ${translatedCategory} | Dalil Tounes`}
            description={translatedDescription || `${business.nom} à ${business.ville}. ${translatedCategory}. Contactez-nous au ${business.telephone || 'voir coordonnées'}`}
            keywords={`${business.nom}, ${translatedCategory}, ${business.ville}, Tunisie, ${business.tags?.join(', ') || ''}`}
            image={business.image_url || undefined}
            canonical={generateShareUrl(business.nom, actualBusinessId)}
            type="article"
            author={business.nom}
            currentPath={currentPath}
          />
          <StructuredData
            data={generateLocalBusinessSchema({
              nom: business.nom,
              ville: business.ville,
              adresse: business.adresse,
              telephone: business.telephone,
              site_web: business.site_web,
              photo_url: business.image_url,
              latitude: business.latitude,
              longitude: business.longitude,
              note_moyenne: averageRating || undefined,
              nombre_avis: reviewCount,
              categorie: translatedCategory,
              statut_abonnement: business.statut_abonnement || undefined,
              description: translatedDescription,
            })}
          />
        </>
      )}

      {/* Carte Prestige - 450px max + Fluide sans scroll interne */}
      <div className="max-w-[450px] md:max-w-[650px] w-full mx-auto shadow-2xl transition-all duration-300"
           style={{
             borderRadius: '16px',
             border: `2px solid ${colors.border}`,
             backgroundColor: colors.background,
             position: 'relative'
           }}>

        {/* Effet brillant */}
        <div className="absolute inset-0 pointer-events-none modal-shine-effect"></div>

        {/* Galerie Photos - Bannière sans espace noir au-dessus */}
        <div className="relative pb-20">
          {business.image_url && (
            <ImageGallery
              imageUrls={business.image_url}
              altText={business.nom}
              className="w-full rounded-t-2xl"
              maxPhotos={6}
              height="240px"
              objectFit="cover"
            />
          )}

          {/* Logo rond - Toujours affiché avec fallback */}
          <div className="absolute left-1/2 -translate-x-1/2 bottom-4 z-10">
            <div
              className="w-32 h-32 shadow-2xl"
              style={getLogoContainerStyle(colors.gold, '5px')}
            >
              <img
                src={business.logo_url}
                alt="Logo"
                className="w-full h-full"
                style={getLogoStyle(business.logo_url)}
              />
            </div>
          </div>
        </div>

        <div className="px-2 pb-1 pt-2 text-center space-y-1">
          {/* Nom & Catégorie avec Bouton Copier Lien */}
          <div className="flex items-center justify-center gap-2 px-1">
            <h1 className="text-base font-bold text-white tracking-tight leading-tight truncate">{business.nom}</h1>
            <button
              onClick={copyLink}
              className="flex-shrink-0 transition-all hover:scale-110"
              style={{ color: linkCopied ? '#10B981' : colors.gold }}
              title={linkCopied ? text.linkCopied : 'Copier le lien'}
            >
              {linkCopied ? <Check size={16} /> : <LinkIcon size={16} />}
            </button>
          </div>
          {translatedCategory && (
            <p className="font-medium text-xs truncate px-1" style={{ color: colors.gold }}>{translatedCategory}</p>
          )}

          {/* Ville & Téléphone - Ultra compact */}
          <div className="flex flex-col items-center text-gray-200 text-xs">
            <div className="flex items-center gap-1 truncate max-w-full px-1">
              <MapPin size={11} className="flex-shrink-0" style={{ color: colors.gold }} />
              <span className="truncate">{business.ville}</span>
            </div>
            <div className="flex items-center gap-1 font-bold truncate max-w-full px-1" style={{ color: colors.gold }}>
              <Phone size={11} className="flex-shrink-0" />
              <button
                onClick={(e) => { e.stopPropagation(); window.location.href = `tel:${business.telephone}`; }}
                className="hover:underline truncate cursor-pointer bg-transparent border-none p-0 font-bold text-xs"
                style={{ color: colors.gold }}
              >
                {business.telephone}
              </button>
            </div>
          </div>

          {/* Description compacte - Traduite */}
          {translatedDescription && (
            <div className="text-left px-1">
              <p className="text-gray-300 text-[10px] leading-relaxed line-clamp-2 break-words">{translatedDescription}</p>
            </div>
          )}

          {/* Horaires d'ouverture - Accordéon fermé par défaut */}
          {business.horaires_ok && (() => {
            const parsedSchedule = getParsedSchedule(business.horaires_ok);
            const now = new Date();
            const todayIndex = (now.getDay() + 6) % 7;

            return (
              <div className="text-left">
                <button
                  onClick={() => setShowFullSchedule(!showFullSchedule)}
                  className="w-full flex items-center justify-between p-1.5 rounded-lg transition-all bg-white/5 hover:bg-white/10"
                  style={{
                    border: `1px solid ${colors.gold}20`
                  }}
                >
                  <div className="flex items-center gap-1">
                    <Clock size={10} className={parsedSchedule.isCurrentlyOpen ? 'text-green-400' : 'text-red-400'} />
                    <span className="text-white font-semibold text-[10px]">{text.openingHours}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${
                      parsedSchedule.isCurrentlyOpen
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {parsedSchedule.isCurrentlyOpen
                        ? translateOpenStatus(language)
                        : translateClosedStatus(language)
                      }
                    </span>
                    <ChevronDown
                      size={12}
                      className="transition-transform"
                      style={{
                        color: colors.gold,
                        transform: showFullSchedule ? 'rotate(180deg)' : 'rotate(0deg)'
                      }}
                    />
                  </div>
                </button>

                <div
                  style={{
                    maxHeight: showFullSchedule ? '300px' : '0',
                    overflow: 'hidden',
                    transition: 'max-height 0.3s ease, opacity 0.3s ease',
                    opacity: showFullSchedule ? 1 : 0
                  }}
                >
                  <div className="rounded-lg p-2 mt-1.5 bg-white/5">
                    {parsedSchedule.schedule.length > 0 ? (
                      <div className="grid grid-cols-[auto_1fr] gap-x-2 gap-y-0.5">
                        {parsedSchedule.schedule.map((day, index) => {
                          const dayIndex = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'].findIndex(d => day.day.includes(d));
                          const isToday = dayIndex === todayIndex;

                          return (
                            <React.Fragment key={`schedule-${index}`}>
                              <span
                                className="text-[9px] rounded px-1 py-0.5"
                                style={{
                                  fontWeight: isToday ? '700' : '500',
                                  color: day.isOpen ? (isToday ? '#FFFFFF' : 'rgba(255, 255, 255, 0.7)') : '#EF4444',
                                  backgroundColor: isToday ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                                }}
                              >
                                {getDayName(dayIndex, language)}
                              </span>
                              <span
                                className="text-[9px] text-left rounded px-1 py-0.5"
                                style={{
                                  fontWeight: isToday ? '600' : '400',
                                  color: day.isOpen ? (isToday ? '#FFFFFF' : 'rgba(255, 255, 255, 0.6)') : '#EF4444',
                                  backgroundColor: isToday ? 'rgba(59, 130, 246, 0.1)' : 'transparent'
                                }}
                              >
                                {day.hours}
                              </span>
                            </React.Fragment>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="text-gray-400 text-[10px] italic">
                        {translateScheduleNotAvailable(language)}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            );
          })()}

          {/* Ligne d'Action Horizontale : Réseaux Sociaux + GPS */}
          <div className="flex items-center justify-center gap-1.5 pt-0.5 flex-wrap px-1" style={{ borderTop: `1px solid ${colors.gold}30` }}>
            {/* Réseaux Sociaux - Compacts */}
            <div className="flex gap-1 flex-shrink-0">
              {business.email && (
                <a
                  href={`mailto:${business.email}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center w-6 h-6 rounded-full transition-all hover:scale-110 bg-[#6B7280] cursor-pointer"
                  title={business.email}
                >
                  <Mail size={10} className="text-white" />
                </a>
              )}
              {business['Lien Instagram'] && (
                <a
                  href={business['Lien Instagram']}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center w-6 h-6 rounded-full transition-all hover:scale-110 bg-gradient-to-br from-[#F58529] via-[#DD2A7B] to-[#8134AF] cursor-pointer"
                >
                  <Instagram size={10} className="text-white" />
                </a>
              )}
              {business['lien facebook'] && (
                <a
                  href={business['lien facebook']}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center w-6 h-6 rounded-full transition-all hover:scale-110 bg-[#1877F2] cursor-pointer"
                >
                  <Facebook size={10} className="text-white" />
                </a>
              )}
              {business['Lien TikTok'] && (
                <a
                  href={business['Lien TikTok']}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center w-6 h-6 rounded-full transition-all hover:scale-110 bg-black cursor-pointer"
                >
                  <svg className="text-[#00F2EA]" width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/>
                  </svg>
                </a>
              )}
              {business['Lien LinkedIn'] && (
                <a
                  href={business['Lien LinkedIn']}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center w-6 h-6 rounded-full transition-all hover:scale-110 bg-[#0A66C2] cursor-pointer"
                >
                  <Linkedin size={10} className="text-white" />
                </a>
              )}
              {business['Lien YouTube'] && (
                <a
                  href={business['Lien YouTube']}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={(e) => e.stopPropagation()}
                  className="flex items-center justify-center w-6 h-6 rounded-full transition-all hover:scale-110 bg-[#FF0000] cursor-pointer"
                >
                  <Youtube size={10} className="text-white" />
                </a>
              )}
            </div>

            {/* Bouton Site Web */}
            {business.site_web && (
              <button
                onClick={(e) => { e.stopPropagation(); window.open(business.site_web!.startsWith('http') ? business.site_web! : `https://${business.site_web}`, '_blank'); }}
                className="inline-flex items-center gap-0.5 text-white px-2 py-0.5 rounded-full font-bold text-[8px] uppercase tracking-wide shadow-lg hover:scale-105 transition-transform flex-shrink-0 cursor-pointer"
                style={{ backgroundColor: '#1a7f5a' }}
                title={business.site_web}
              >
                <Globe size={9} strokeWidth={3} />
                <span className="truncate max-w-[80px]">Site web</span>
              </button>
            )}

            {/* Bouton GPS - Pilule compacte */}
            {(business.latitude && business.longitude) || business.adresse ? (
              <a
                href={getGoogleMapsDirectionsUrl(business.latitude, business.longitude, business.adresse)}
                target="_blank"
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="inline-flex items-center gap-0.5 text-white px-2 py-0.5 rounded-full font-bold text-[8px] uppercase tracking-wide shadow-lg hover:scale-105 transition-transform flex-shrink-0 cursor-pointer"
                style={{ backgroundColor: colors.gold }}
              >
                <Navigation size={9} strokeWidth={3} />
                <span className="truncate max-w-[100px]">{text.directions}</span>
              </a>
            ) : null}
          </div>

          {/* QR Code - Collé sans marge */}
          <div className="pt-0.5">
            <div className="flex flex-col items-center">
              <div ref={qrCodeRef} className="inline-block p-0.5 rounded bg-white mb-0.5">
                <QRCodeSVG
                  value={window.location.href}
                  size={60}
                  level="H"
                  includeMargin={true}
                  fgColor={colors.gold}
                  bgColor="#FFFFFF"
                />
              </div>
              <button
                onClick={downloadQRCode}
                className="flex items-center gap-0.5 px-1.5 py-0.5 rounded-full transition-all text-[8px] font-medium"
                style={{
                  backgroundColor: `${colors.gold}20`,
                  color: colors.gold
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = `${colors.gold}30`}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = `${colors.gold}20`}
              >
                <Download size={8} />
                {text.downloadQR}
              </button>
            </div>
          </div>

          {/* Formulaire Avis Intégré - Mini bloc */}
          <div className="mt-0.5 pt-0.5" style={{ borderTop: `1px solid ${colors.gold}30` }}>
            <EntrepriseAvisForm entrepriseId={actualBusinessId || ''} />
          </div>

          {/* Zone de Partage Elite */}
          <div className="mt-1 pt-1" style={{ borderTop: `0.5px solid ${colors.gold}40` }}>
            <p
              className="text-[9px] font-medium mb-1.5 px-1"
              style={{
                color: colors.gold,
                textAlign: isRTL ? 'right' : 'center'
              }}
            >
              {text.recommendText}
            </p>
            <div className={`flex items-center gap-2 ${isRTL ? 'justify-end' : 'justify-center'} px-1`}>
              {/* WhatsApp */}
              <button
                onClick={shareViaWhatsApp}
                className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110"
                style={{
                  backgroundColor: `${colors.gold}15`,
                  border: `1px solid ${colors.gold}30`
                }}
                title={text.shareViaWhatsApp}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  style={{ color: colors.gold }}
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
              </button>

              {/* Messenger */}
              <button
                onClick={shareViaMessenger}
                className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110"
                style={{
                  backgroundColor: `${colors.gold}15`,
                  border: `1px solid ${colors.gold}30`
                }}
                title={text.shareViaMessenger}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="currentColor"
                  style={{ color: colors.gold }}
                >
                  <path d="M12 0C5.373 0 0 4.975 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.092.3 2.246.464 3.443.464 6.627 0 12-4.974 12-11.11C24 4.974 18.627 0 12 0zm1.191 14.963l-3.055-3.26-5.963 3.26L10.732 8l3.131 3.259L19.752 8l-6.561 6.963z"/>
                </svg>
              </button>

              {/* Telegram */}
              <button
                onClick={shareViaTelegram}
                className="flex items-center justify-center w-8 h-8 rounded-full transition-all hover:scale-110"
                style={{
                  backgroundColor: `${colors.gold}15`,
                  border: `1px solid ${colors.gold}30`
                }}
                title={text.shareViaTelegram}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="w-4 h-4"
                  fill="currentColor"
                  style={{ color: colors.gold }}
                >
                  <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Bouton Retour - Ultra Compact */}
      {handleClose && (
        <div className="text-center mt-4">
          <button
            onClick={handleClose}
            className="inline-flex items-center gap-1.5 px-5 py-2 rounded-full transition-all shadow-lg font-bold text-xs bg-[#D4AF37] text-white hover:bg-[#C19B2E]"
          >
            <ArrowLeft size={16} />
            {text.backToSearch}
          </button>
        </div>
      )}

      {/* CSS pour effet brillant */}
      <style>{`
        .modal-shine-effect::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 50%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(212, 175, 55, 0.3), transparent);
          transform: skewX(-20deg);
          animation: autoShine 3s infinite ease-in-out;
          pointer-events: none;
        }
        @keyframes autoShine {
          0% { left: -100%; }
          100% { left: 200%; }
        }
      `}</style>
    </div>
  );

  if (asModal && handleClose) {
    return (
      <div
        className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-md p-4 overflow-y-auto"
        onClick={handleClose}
      >
        <div
          className="relative max-w-[450px] md:max-w-[650px] w-full my-8"
          onClick={(e) => e.stopPropagation()}
        >
          {content}
        </div>
      </div>
    );
  }

  return content;
};
  
