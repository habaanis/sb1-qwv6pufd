import { Calendar, MapPin, Ticket } from 'lucide-react';
import { analyzeTicketLink, getPrixValue } from '../lib/ticketLinkAnalyzer';

interface CultureEventAgendaCardProps {
  event: {
    titre: string;
    ville: string;
    date_debut: string;
    date_fin?: string;
    image_url?: string;
    prix?: string;
    lien_billetterie?: string;
    description_courte?: string;
    secteur_evenement?: string;
  } | null;
  type: 'weekly' | 'monthly' | 'annual';
  badge: string;
  noEventText: string;
  buttonText: string;
}

const CultureEventAgendaCard = ({ event, type, badge, noEventText, buttonText }: CultureEventAgendaCardProps) => {
  const colors = {
    weekly: {
      border: 'border-cyan-500/30 hover:border-cyan-400/60',
      gradient: 'from-cyan-600 to-cyan-500',
      shadow: 'hover:shadow-[0_0_30px_rgba(34,211,238,0.3)]',
      text: 'text-cyan-400',
      badge: 'bg-cyan-500/20 text-cyan-300',
      button: 'bg-cyan-500 hover:bg-cyan-600',
      textColor: 'text-white'
    },
    monthly: {
      border: 'border-emerald-500/30 hover:border-emerald-400/60',
      gradient: 'from-emerald-600 to-emerald-500',
      shadow: 'hover:shadow-[0_0_30px_rgba(52,211,153,0.3)]',
      text: 'text-emerald-400',
      badge: 'bg-emerald-500/20 text-emerald-300',
      button: 'bg-emerald-500 hover:bg-emerald-600',
      textColor: 'text-white'
    },
    annual: {
      border: 'border-[#D4AF37]/30 hover:border-[#FFD700]/60',
      gradient: 'from-[#D4AF37] to-[#FFD700]',
      shadow: 'hover:shadow-[0_0_30px_rgba(212,175,55,0.4)]',
      text: 'text-[#FFD700]',
      badge: 'bg-[#D4AF37]/20 text-[#FFD700]',
      button: 'bg-[#D4AF37] hover:bg-[#FFD700] text-[#0f172a]',
      textColor: 'text-[#0f172a]'
    }
  };

  const color = colors[type];

  const formatEventDate = (dateDebut: string, dateFin?: string): string => {
    const debut = new Date(dateDebut);
    const fin = dateFin ? new Date(dateFin) : null;

    const options: Intl.DateTimeFormatOptions = {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    };

    if (fin && debut.toDateString() !== fin.toDateString()) {
      return `${debut.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long' })} - ${fin.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}`;
    }
    return debut.toLocaleDateString('fr-FR', options);
  };

  if (!event) {
    return (
      <div className={`group relative bg-gradient-to-b from-[#0f172a] to-[#1e293b] rounded-2xl border ${color.border} overflow-hidden opacity-50`}>
        <div className={`bg-gradient-to-r ${color.gradient} px-6 py-3 text-center`}>
          <span className={`${color.textColor} font-bold text-sm tracking-wider uppercase`}>{badge}</span>
        </div>
        <div className="p-6 text-center text-gray-400">
          <Calendar className="w-12 h-12 mx-auto mb-4 opacity-30" />
          <p>{noEventText}</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`group relative bg-gradient-to-b from-[#0f172a] to-[#1e293b] rounded-2xl border ${color.border} overflow-hidden transition-all duration-500 ${color.shadow} hover:scale-105`}>
      <div className={`bg-gradient-to-r ${color.gradient} px-6 py-3 text-center`}>
        <span className={`${color.textColor} font-bold text-sm tracking-wider uppercase`}>{badge}</span>
      </div>

      <div className="relative h-56 overflow-hidden">
        {event.image_url ? (
          <>
            <img
              src={event.image_url}
              alt={event.titre}
              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                const fallback = target.nextElementSibling as HTMLElement;
                if (fallback) fallback.style.display = 'flex';
              }}
            />
            <div className={`absolute inset-0 bg-gradient-to-br ${color.gradient} items-center justify-center p-6 hidden`}>
              <p className={`${color.textColor} text-2xl font-bold text-center`}>{event.titre}</p>
            </div>
          </>
        ) : (
          <div className={`absolute inset-0 bg-gradient-to-br ${color.gradient} flex items-center justify-center p-6`}>
            <p className={`${color.textColor} text-2xl font-bold text-center drop-shadow-lg`}>{event.titre}</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-transparent to-transparent pointer-events-none"></div>

        {/* Badge catégorie - gauche */}
        {event.secteur_evenement && (
          <div className="absolute top-3 left-3 z-10">
            <div className="bg-black/40 backdrop-blur-md rounded-lg px-3 py-1.5 shadow-lg">
              <span className="text-white text-xs font-medium">
                {event.secteur_evenement}
              </span>
            </div>
          </div>
        )}
      </div>

      <div className="p-6">
        <h3 className={`text-2xl font-serif font-bold line-clamp-2 mb-3 ${type === 'annual' ? 'text-transparent bg-gradient-to-r from-[#FFD700] to-[#D4AF37] bg-clip-text' : 'text-white'}`}>
          {event.titre}
        </h3>

        {event.description_courte && (
          <p className="text-gray-300 text-sm line-clamp-2 mb-4">
            {event.description_courte}
          </p>
        )}

        <div className="space-y-2.5 text-sm mb-5">
          <div className="flex items-center gap-2 text-slate-300">
            <Calendar className="w-4 h-4 text-slate-400" />
            <span className="font-medium">{formatEventDate(event.date_debut, event.date_fin)}</span>
          </div>

          <div className="flex items-center gap-2 text-gray-300">
            <MapPin className="w-4 h-4 text-gray-400" />
            <span>{event.ville}</span>
          </div>

          {event.prix && (
            <div className="flex items-center gap-2 text-gray-300">
              <Ticket className="w-4 h-4 text-gray-400" />
              <span className="font-semibold text-amber-400">{event.prix}</span>
            </div>
          )}
        </div>

        {(() => {
          const linkAnalysis = analyzeTicketLink(event.lien_billetterie);

          if (linkAnalysis.show) {
            return (
              <a
                href={event.lien_billetterie}
                target="_blank"
                rel="noopener noreferrer"
                className={`block w-full py-2.5 ${linkAnalysis.colorClass} text-white rounded-xl font-semibold text-center hover:shadow-xl transition-all hover:scale-105 text-sm`}
              >
                <Ticket className="w-4 h-4 inline mr-2" />
                {linkAnalysis.text}
              </a>
            );
          }

          return (
            <div className="flex justify-center">
              <span className="px-4 py-2 bg-white/5 text-gray-300 rounded-lg text-sm font-medium border border-white/10">
                {getPrixValue(event.prix) === 0 ? '🎁 Entrée Libre' : '📍 Plus d\'infos sur place'}
              </span>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default CultureEventAgendaCard;
