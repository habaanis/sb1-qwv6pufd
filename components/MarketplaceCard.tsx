import { MapPin, Eye, Zap, Share2, Heart, BadgeCheck, Star } from 'lucide-react';
import { useState } from 'react';

interface MarketplaceCardProps {
  announcement: {
    id: string;
    title: string;
    price: number;
    city: string;
    photo_url: string[];
    urgent: boolean;
    date_publication: string;
    hours_ago: number;
    vendeur_badge?: string;
    vendeur_note?: number;
    vues?: number;
    type_annonce?: string;
  };
  onClick: () => void;
}

export default function MarketplaceCard({ announcement, onClick }: MarketplaceCardProps) {
  const [imageError, setImageError] = useState(false);

  const formatDate = (hoursAgo: number) => {
    if (hoursAgo < 1) return 'À l\'instant';
    if (hoursAgo < 24) return `Il y a ${Math.floor(hoursAgo)}h`;
    const days = Math.floor(hoursAgo / 24);
    if (days < 7) return `Il y a ${days}j`;
    return `Il y a ${Math.floor(days / 7)}sem`;
  };

  const handleShare = (platform: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const url = `${window.location.origin}/annonce/${announcement.id}`;
    const text = `${announcement.title} - ${announcement.price} TND sur Dalil Tounes`;

    let shareUrl = '';
    if (platform === 'whatsapp') {
      shareUrl = `https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`;
    } else if (platform === 'facebook') {
      shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
    }

    if (shareUrl) {
      window.open(shareUrl, '_blank', 'width=600,height=400');
    }
  };

  const mainPhoto = announcement.photo_url && announcement.photo_url.length > 0 && !imageError
    ? announcement.photo_url[0]
    : null;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all overflow-hidden group cursor-pointer transform hover:-translate-y-1"
    >
      {/* Image Section */}
      <div className="relative h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
        {mainPhoto ? (
          <img
            src={mainPhoto}
            alt={announcement.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400">
            <div className="text-center">
              <MapPin className="w-16 h-16 mx-auto mb-2 opacity-30" />
              <p className="text-sm">Pas de photo</p>
            </div>
          </div>
        )}

        {/* Urgent Badge */}
        {announcement.urgent && (
          <div className="absolute top-4 left-4">
            <span className="bg-red-500 text-white text-xs font-bold px-3 py-1.5 rounded-full flex items-center gap-1 shadow-lg animate-pulse">
              <Zap className="w-3 h-3 fill-current" />
              URGENT
            </span>
          </div>
        )}

        {/* Type Badge */}
        {announcement.type_annonce && (
          <div className="absolute top-4 right-4">
            <span className={`text-white text-xs font-bold px-3 py-1 rounded-full ${
              announcement.type_annonce === 'sell'
                ? 'bg-green-500'
                : announcement.type_annonce === 'buy'
                ? 'bg-blue-500'
                : 'bg-purple-500'
            }`}>
              {announcement.type_annonce === 'sell' ? 'Vente' : announcement.type_annonce === 'buy' ? 'Achat' : 'Échange'}
            </span>
          </div>
        )}

        {/* Views Counter */}
        {announcement.vues !== undefined && (
          <div className="absolute bottom-4 right-4 flex items-center gap-1 bg-black/50 backdrop-blur-sm px-2 py-1 rounded-full">
            <Eye className="w-3 h-3 text-white" />
            <span className="text-xs text-white">{announcement.vues}</span>
          </div>
        )}

        {/* Share Buttons - Visible on hover */}
        <div className="absolute bottom-4 left-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={(e) => handleShare('whatsapp', e)}
            className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition-all shadow-lg"
            title="Partager sur WhatsApp"
          >
            <Share2 className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => handleShare('facebook', e)}
            className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg"
            title="Partager sur Facebook"
          >
            <Share2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-5">
        {/* Title */}
        <h3 className="font-bold text-lg text-gray-900 mb-2 line-clamp-2 group-hover:text-[#D62828] transition-colors min-h-[56px]">
          {announcement.title}
        </h3>

        {/* Price */}
        <div className="mb-3">
          <div className="text-3xl font-bold text-[#D62828]">
            {announcement.price > 0 ? (
              <>
                {announcement.price.toLocaleString('fr-FR', {
                  minimumFractionDigits: 0,
                  maximumFractionDigits: 3
                })}
                <span className="text-sm ml-1">TND</span>
              </>
            ) : (
              <span className="text-lg text-gray-600">À négocier</span>
            )}
          </div>
        </div>

        {/* Location & Date */}
        <div className="flex items-center justify-between mb-3 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin className="w-4 h-4 text-[#D62828] flex-shrink-0" />
            <span className="font-medium truncate">{announcement.city}</span>
          </div>
          <span className="text-xs">{formatDate(announcement.hours_ago)}</span>
        </div>

        {/* Seller Badge */}
        {announcement.vendeur_badge && (
          <div className="flex items-center gap-2 pt-3 border-t border-gray-100">
            {announcement.vendeur_badge === 'top_vendeur' && (
              <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Star className="w-3 h-3 fill-current" />
                Top
              </span>
            )}
            {announcement.vendeur_badge === 'verifie' && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <BadgeCheck className="w-3 h-3" />
                Vérifié
              </span>
            )}
            {announcement.vendeur_note && announcement.vendeur_note > 0 && (
              <div className="flex items-center gap-1 text-yellow-600">
                <Star className="w-3 h-3 fill-current" />
                <span className="text-xs font-bold">{announcement.vendeur_note.toFixed(1)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
