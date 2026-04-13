import { Calendar, MapPin, Users } from 'lucide-react';
import { SafeImage } from './SafeImage';

export interface FeaturedEvent {
  id: string;
  event_name: string;
  event_date: string | null;
  end_date?: string | null;
  city?: string | null;
  location?: string | null;
  event_type?: string | null;
  short_description?: string | null;
  organizer?: string | null;
  registration_url?: string | null;
  image_url?: string | null;
  featured?: boolean | null;
  instagram_url?: string | null;
  facebook_url?: string | null;
  linkedin_url?: string | null;
  x_url?: string | null;
  youtube_url?: string | null;
  event_period_label?: string | null;
}

interface FeaturedEventCardProps {
  event: FeaturedEvent;
  onClick?: () => void;
}

const formatEventDate = (eventDate: string | null, endDate?: string | null): string => {
  if (!eventDate) return '';

  const start = new Date(eventDate);
  const isValidStart = !isNaN(start.getTime());

  if (!endDate) {
    return isValidStart ? start.toLocaleDateString() : eventDate;
  }

  const end = new Date(endDate);
  const isValidEnd = !isNaN(end.getTime());

  if (isValidStart && isValidEnd) {
    return `Du ${start.toLocaleDateString()} au ${end.toLocaleDateString()}`;
  }

  return isValidStart ? start.toLocaleDateString() : eventDate;
};

export const FeaturedEventCard = ({ event, onClick }: FeaturedEventCardProps) => {
  const dateDisplay = event.event_period_label || formatEventDate(event.event_date, event.end_date);

  return (
    <div
      onClick={onClick}
      className="
        min-w-[260px] max-w-xs
        bg-white
        rounded-xl
        px-4 py-4
        text-left
        hover:shadow-md
        hover:-translate-y-0.5
        transition-all
        cursor-pointer
        flex-shrink-0
      "
      style={{ border: '2px solid #D4AF37' }}
    >
      {event.image_url && (
        <div className="w-full h-40 sm:h-48 md:h-56 rounded-lg overflow-hidden mb-3">
          <SafeImage
            src={event.image_url}
            alt={event.event_name}
            className="w-full h-full object-contain"
            fallbackType="icon"
          />
        </div>
      )}

      {dateDisplay && (
        <div className="mb-2">
          <span className="inline-flex items-center gap-1 bg-orange-50 text-orange-700 text-xs rounded-full px-2 py-0.5">
            <Calendar className="w-3 h-3" />
            {dateDisplay}
          </span>
        </div>
      )}

      <h3 className="text-base font-semibold text-gray-900 mb-2 line-clamp-2">
        {event.event_name}
      </h3>

      {(event.city || event.location) && (
        <div className="flex items-center gap-1 text-xs text-gray-600 mb-2">
          <MapPin className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">
            {event.city && event.location ? `${event.city} · ${event.location}` : event.city || event.location}
          </span>
        </div>
      )}

      {event.short_description && (
        <p className="text-sm text-gray-600 mb-3 line-clamp-3">
          {event.short_description}
        </p>
      )}

      {event.organizer && (
        <div className="flex items-center gap-1 text-xs text-gray-500 mb-3">
          <Users className="w-3 h-3 flex-shrink-0" />
          <span className="truncate">Organisé par {event.organizer}</span>
        </div>
      )}

      <div className="text-sm text-orange-600 font-medium flex items-center gap-1">
        <span>Voir les détails</span>
        <span>→</span>
      </div>
    </div>
  );
};
