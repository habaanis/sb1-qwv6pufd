import { useEffect, useState } from 'react';
import { Calendar, MapPin, ArrowRight, ChevronLeft, ChevronRight, Tag } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { supabase } from '../lib/BoltDatabase';
import { SafeImage } from './SafeImage';

interface FeaturedEvent {
  id: string;
  event_name: string;
  short_description: string;
  city: string | null;
  location: string | null;
  event_date: string | null;
  end_date?: string | null;
  image_url?: string | null;
  registration_url?: string | null;
  event_type?: string | null;
}

export const FeaturedEventsCarousel = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const [events, setEvents] = useState<FeaturedEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  // 🔄 Charger les événements mis en avant
  useEffect(() => {
    const fetchEvents = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from('featured_events')
          .select(
            'id, event_name, short_description, city, location, event_date, end_date, image_url, registration_url, event_type'
          )
          .order('event_date', { ascending: true });

        if (error) {
          console.warn('[FeaturedEventsCarousel] Error fetching events:', error.message);
          setEvents([]);
          return;
        }

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const cleaned = (data || []).filter((event) => {
          if (!event.event_date && !event.end_date) return true;

          const start = event.event_date ? new Date(event.event_date) : null;
          const end = event.end_date ? new Date(event.end_date) : start;

          if (!end || isNaN(end.getTime())) return true;
          return end >= today;
        });

        // Si le filtre ne renvoie rien mais qu'il y a des données, on affiche tout
        if (cleaned.length === 0 && (data || []).length > 0) {
          setEvents(data as FeaturedEvent[]);
        } else {
          setEvents(cleaned as FeaturedEvent[]);
        }
      } catch (err) {
        console.warn('[FeaturedEventsCarousel] Unexpected error:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, []);

  // 🎞️ Auto-défilement
  useEffect(() => {
    if (events.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % events.length);
    }, 8000); // 8 secondes

    return () => clearInterval(interval);
  }, [events.length]);

  const goPrev = () => {
    if (!events.length) return;
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  };

  const goNext = () => {
    if (!events.length) return;
    setCurrentIndex((prev) => (prev + 1) % events.length);
  };

  if (loading || events.length === 0) {
    // Si tu préfères, on peut mettre un petit skeleton ici plus tard
    return null;
  }

  const event = events[currentIndex];

  const formatDateRange = (ev: FeaturedEvent): string => {
    if (!ev.event_date && !ev.end_date) return '';
    const format = (value: string | null) => {
      if (!value) return '';
      const d = new Date(value);
      if (isNaN(d.getTime())) return value;
      return d.toLocaleDateString();
    };

    const startLabel = format(ev.event_date);
    const endLabel = format(ev.end_date || null);

    if (startLabel && endLabel && startLabel !== endLabel) {
      return `Du ${startLabel} au ${endLabel}`;
    }
    return startLabel || endLabel || '';
  };

  const dateLabel = formatDateRange(event);

  const typeLabel =
    (event.event_type &&
      t.businessEvents?.eventTypes?.[
        event.event_type as keyof typeof t.businessEvents.eventTypes
      ]) ||
    event.event_type ||
    '';

  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg md:text-xl font-light text-gray-900">
          Ils font bouger la Tunisie
        </h3>
        {events.length > 1 && (
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={goPrev}
              className="p-2 rounded-full bg-white hover:bg-gray-50 transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.12)]"
              aria-label="Événement précédent"
            >
              <ChevronLeft className="w-5 h-5 text-gray-700" />
            </button>
            <button
              type="button"
              onClick={goNext}
              className="p-2 rounded-full bg-white hover:bg-gray-50 transition-all duration-300 shadow-[0_2px_10px_rgba(0,0,0,0.08)] hover:shadow-[0_4px_15px_rgba(0,0,0,0.12)]"
              aria-label="Événement suivant"
            >
              <ChevronRight className="w-5 h-5 text-gray-700" />
            </button>
          </div>
        )}
      </div>

      <div
        key={event.id}
        className="relative rounded-xl overflow-hidden hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-500 hover:scale-[1.01]"
        style={{
          border: '1px solid #D4AF37',
          height: '280px',
          maxHeight: '280px'
        }}
      >
        {/* Image de fond avec traitement premium */}
        {event.image_url && (
          <div className="absolute inset-0">
            <SafeImage
              src={event.image_url}
              alt={event.event_name}
              className="w-full h-full transition-all duration-500"
              fallbackType="icon"
              style={{
                objectFit: 'cover',
                objectPosition: 'center',
                filter: 'brightness(0.55)'
              }}
            />
          </div>
        )}

        {/* Overlay de cohérence colorimétrique */}
        <div
          className="absolute inset-0 transition-opacity duration-500"
          style={{
            backgroundColor: '#0c2461',
            opacity: 0.15,
            mixBlendMode: 'multiply'
          }}
        />

        {/* Overlay dégradé gauche pour lisibilité */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent transition-opacity duration-500" />

        {/* Contenu superposé */}
        <div className="relative h-full flex flex-col justify-between p-3 md:p-4 text-white">
          {/* En-tête avec badges */}
          <div className="flex flex-wrap items-center gap-1.5 mb-1.5">
            <span className="px-2.5 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-medium text-white flex items-center gap-1.5 shadow-lg" style={{ border: '1px solid #D4AF37' }}>
              <Calendar className="w-3.5 h-3.5" />
              {dateLabel || 'Date à venir'}
            </span>
            {typeLabel && (
              <span className="px-2.5 py-1 rounded-full bg-[#4A1D43]/80 backdrop-blur-md text-[10px] font-medium text-white flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5" />
                {typeLabel}
              </span>
            )}
          </div>

          {/* Contenu principal */}
          <div className="flex-1 flex flex-col justify-center max-w-2xl">
            {/* Localisation */}
            {event.city && (
              <div className="flex items-center gap-1.5 mb-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-[11px] font-medium text-[#D4AF37]">
                  {event.city}
                  {event.location && ` • ${event.location}`}
                </span>
              </div>
            )}

            {/* Titre */}
            <h4 className="text-base md:text-lg font-bold text-white mb-1.5 line-clamp-2 drop-shadow-lg">
              {event.event_name}
            </h4>

            {/* Description */}
            {event.short_description && (
              <p className="text-xs md:text-sm text-gray-100 mb-1.5 line-clamp-2 leading-relaxed drop-shadow-md">
                {event.short_description}
              </p>
            )}
          </div>

          {/* Footer avec bouton et pagination */}
          <div className="flex items-center justify-between gap-3">
            {event.registration_url && (
              <a
                href={event.registration_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-medium bg-white/95 text-[#4A1D43] hover:bg-white transition-all duration-300 group shadow-lg backdrop-blur-sm"
                style={{ border: '1px solid #D4AF37' }}
              >
                {t.businessEvents.eventCard.learnMore}
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </a>
            )}

            {events.length > 1 && (
              <div className="flex items-center gap-1 ml-auto">
                {events.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setCurrentIndex(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === currentIndex
                        ? 'w-5'
                        : 'bg-white/40 w-1.5 hover:bg-white/60'
                    }`}
                    style={index === currentIndex ? { backgroundColor: '#D4AF37' } : {}}
                    aria-label={`Aller à l'événement ${index + 1}`}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FeaturedEventsCarousel;

