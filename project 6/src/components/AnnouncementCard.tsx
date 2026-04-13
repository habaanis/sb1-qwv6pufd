import { Phone, MapPin, Eye, Tag, Heart, Share2, Flag, Zap, BadgeCheck, Star, DollarSign } from 'lucide-react';
import { useState } from 'react';
import { supabase } from '../lib/BoltDatabase';
import NegotiationModal from './NegotiationModal';
import ReportModal from './ReportModal';
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
  est_urgent?: boolean;
  vendeur_badge?: string;
  vendeur_note?: number;
  favoris_par?: string[];
}

interface AnnouncementCardProps {
  announcement: Announcement;
  language: string;
}

const translations = {
  fr: {
    tnd: 'TND',
    views: 'vues',
    contact: 'Contacter',
    sell: 'À vendre',
    buy: 'Recherche',
    exchange: 'Échange',
    noPhoto: 'Pas de photo',
    postedOn: 'Publié le',
    urgent: 'URGENT',
    makeOffer: 'Faire une offre',
    share: 'Partager',
    report: 'Signaler',
    newSeller: 'Nouveau',
    verified: 'Vérifié',
    topSeller: 'Top Vendeur'
  },
  en: {
    tnd: 'TND',
    views: 'views',
    contact: 'Contact',
    sell: 'For sale',
    buy: 'Looking for',
    exchange: 'Exchange',
    noPhoto: 'No photo',
    postedOn: 'Posted on'
  },
  ar: {
    tnd: 'دينار',
    views: 'مشاهدة',
    contact: 'اتصل',
    sell: 'للبيع',
    buy: 'أبحث عن',
    exchange: 'تبادل',
    noPhoto: 'لا توجد صورة',
    postedOn: 'نشر في'
  },
  it: {
    tnd: 'TND',
    views: 'visualizzazioni',
    contact: 'Contatta',
    sell: 'In vendita',
    buy: 'Cerco',
    exchange: 'Scambio',
    noPhoto: 'Nessuna foto',
    postedOn: 'Pubblicato il'
  },
  ru: {
    tnd: 'ТНД',
    views: 'просмотров',
    contact: 'Связаться',
    sell: 'Продается',
    buy: 'Ищу',
    exchange: 'Обмен',
    noPhoto: 'Нет фото',
    postedOn: 'Опубликовано'
  }
};

export default function AnnouncementCard({ announcement, language }: AnnouncementCardProps) {
  const t = translations[language as keyof typeof translations] || translations.fr;
  const isRTL = language === 'ar';
  const [showContact, setShowContact] = useState(false);
  const [isFavorited, setIsFavorited] = useState(false);
  const [showNegotiation, setShowNegotiation] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(language === 'ar' ? 'ar-TN' : language === 'en' ? 'en-US' : 'fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const mainPhotoFilename = announcement.photo_url && announcement.photo_url.length > 0
    ? announcement.photo_url[0]
    : null;

  const mainPhotoUrl = getSupabaseImageUrl(mainPhotoFilename);

  return (
    <div className={`bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Photo Section */}
      <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        <img
          src={mainPhotoUrl}
          alt={announcement.titre}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            const target = e.target as HTMLImageElement;
            if (!target.src.includes('placeholder.jpg')) {
              target.src = '/images/placeholder.jpg';
            }
          }}
        />

        {/* Type Badge */}
        <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'}`}>
          <span className={`px-3 py-1 rounded-full text-xs font-bold text-white ${
            announcement.type_annonce === 'sell'
              ? 'bg-gradient-to-r from-green-500 to-green-600'
              : announcement.type_annonce === 'buy'
              ? 'bg-gradient-to-r from-blue-500 to-blue-600'
              : 'bg-gradient-to-r from-purple-500 to-purple-600'
          }`}>
            {announcement.type_annonce === 'sell' ? t.sell : announcement.type_annonce === 'buy' ? t.buy : t.exchange}
          </span>
        </div>

        {/* Views Counter */}
        <div className={`absolute bottom-4 ${isRTL ? 'right-4' : 'left-4'} flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full`}>
          <Eye className="w-3 h-3 text-white" />
          <span className="text-xs text-white">{announcement.vues} {t.views}</span>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title and Price */}
        <div className="mb-3">
          <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-[#D62828] transition-colors">
            {announcement.titre}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-[#D62828]">
              {announcement.prix.toLocaleString(language === 'ar' ? 'ar-TN' : 'fr-FR', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 3
              })}
            </span>
            <span className="text-sm text-gray-600">{t.tnd}</span>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
          {announcement.description}
        </p>

        {/* Details */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <MapPin className="w-4 h-4 text-[#D62828] flex-shrink-0" />
            <span className="font-medium">{announcement.localisation_ville}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <Tag className="w-4 h-4 text-[#D62828] flex-shrink-0" />
            <span>{announcement.categorie}</span>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {t.postedOn} {formatDate(announcement.created_at)}
          </span>

          <button
            onClick={() => setShowContact(!showContact)}
            className="flex items-center gap-2 bg-gradient-to-r from-[#D62828] to-[#b91c1c] text-white px-4 py-2 rounded-lg font-semibold hover:shadow-lg transition-all text-sm"
          >
            <Phone className="w-4 h-4" />
            {t.contact}
          </button>
        </div>

        {/* Contact Info (revealed on click) */}
        {showContact && (
          <div className="mt-3 p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-lg">
            <a
              href={`tel:${announcement.contact_tel}`}
              className="flex items-center justify-center gap-2 text-[#D62828] font-bold hover:underline"
            >
              <Phone className="w-5 h-5" />
              {announcement.contact_tel}
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
