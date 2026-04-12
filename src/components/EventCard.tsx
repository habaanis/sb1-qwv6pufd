import React from 'react';
import { Star } from 'lucide-react';
import { analyzeTicketLink, getPrixValue } from '../lib/ticketLinkAnalyzer';
import SignatureCard from './SignatureCard';

interface EventCardProps {
  id: string;
  titre: string;
  description: string;
  date_debut: string;
  localisation_ville: string;
  prix: string;
  type_evenement: string;
  lien_billetterie?: string;
  image_url?: string;
  accessible_enfants: boolean;
  niveau_abonnement: string;
  organisateur?: string;
  note_moyenne?: number;
  nombre_avis?: number;
  onImageClick?: () => void;
  is_premium?: boolean;
}

const EventCard: React.FC<EventCardProps> = ({
  titre,
  description,
  date_debut,
  localisation_ville,
  prix,
  type_evenement,
  lien_billetterie,
  image_url,
  accessible_enfants,
  niveau_abonnement,
  organisateur,
  note_moyenne = 0,
  nombre_avis = 0,
  onImageClick,
  is_premium = false,
}) => {
  const formatFullDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
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
    <SignatureCard isPremium={is_premium} className="overflow-hidden max-w-2xl">
      {/* Badge Premium */}
      {is_premium && (
        <div className="absolute -top-1.5 -right-1.5 bg-gradient-to-r from-[#D4AF37] to-[#FFD700] text-[#4A1D43] px-2.5 py-0.5 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg z-20">
          <Star className="w-3 h-3 fill-[#4A1D43]" />
          PREMIUM
        </div>
      )}

      <div className="flex flex-col md:flex-row">
      <div className="relative w-full md:w-48 h-40 md:h-auto bg-gradient-to-br from-[#4A1D43] via-[#6B2A5C] to-[#D4AF37] overflow-hidden group md:flex-shrink-0">
        {image_url && (
          <img
            src={image_url}
            alt={titre}
            className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 cursor-pointer"
            onClick={onImageClick}
            loading="lazy"
          />
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent"></div>

        <div className="absolute top-2 left-2">
          <div className="px-2 py-0.5 bg-black/50 backdrop-blur-sm rounded text-xs text-white">
            {type_evenement}
          </div>
        </div>

        {accessible_enfants && (
          <div className="absolute top-2 right-2">
            <span className="px-2 py-0.5 bg-[#4A1D43]/90 backdrop-blur-sm text-white text-xs rounded flex items-center gap-1">
              Kids
            </span>
          </div>
        )}
      </div>

      <div className={`flex-1 p-3 ${is_premium ? 'bg-[#4A1D43]' : 'bg-white'}`}>
        <h3 className={`text-base font-bold mb-2 line-clamp-1 ${is_premium ? 'text-white' : 'text-gray-900'}`}>
          {titre}
        </h3>
        <p className={`text-xs mb-2 line-clamp-2 leading-relaxed ${is_premium ? 'text-gray-200' : 'text-gray-600'}`}>
          {description}
        </p>

        {note_moyenne > 0 && (
          <div className="mb-2">
            {renderStars(note_moyenne, nombre_avis)}
          </div>
        )}

        <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs mb-2">
          <div className={`flex items-center gap-1 ${is_premium ? 'text-gray-200' : 'text-slate-700'}`}>
            <span className="font-medium">{formatFullDate(date_debut)}</span>
          </div>

          <div className={`flex items-center gap-1 ${is_premium ? 'text-gray-200' : 'text-gray-700'}`}>
            <span>{localisation_ville}</span>
          </div>

          <div className={`flex items-center gap-1 ${is_premium ? 'text-gray-200' : 'text-gray-700'}`}>
            <span className={`font-semibold ${is_premium ? 'text-[#D4AF37]' : 'text-[#D4AF37]'}`}>{prix}</span>
          </div>
        </div>

        {organisateur && (
          <div className={`text-xs mb-1.5 italic ${is_premium ? 'text-gray-300' : 'text-gray-500'}`}>
            Par {organisateur}
          </div>
        )}

        {(() => {
          const linkAnalysis = analyzeTicketLink(lien_billetterie);

          if (linkAnalysis.show) {
            return (
              <a
                href={lien_billetterie}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full py-1.5 ${
                  is_premium
                    ? 'bg-[#D4AF37] text-[#4A1D43] hover:bg-[#C4A027]'
                    : linkAnalysis.colorClass
                } text-white rounded font-semibold text-center transition-all text-xs`}
              >
                {linkAnalysis.text}
              </a>
            );
          }

          return (
            <div className="flex justify-center">
              <span className={`px-3 py-1.5 rounded text-xs font-medium ${
                is_premium
                  ? 'bg-[#5A2D53] text-[#D4AF37]'
                  : 'bg-gray-100 text-gray-700'
              }`}>
                {getPrixValue(prix) === 0 ? 'Entrée Libre' : 'Plus d\'infos sur place'}
              </span>
            </div>
          );
        })()}
      </div>
      </div>
    </SignatureCard>
  );
};

export default EventCard;
