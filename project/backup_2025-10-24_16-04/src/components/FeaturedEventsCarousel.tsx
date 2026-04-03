import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, MapPin, ChevronLeft, ChevronRight, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { getFeaturedEvents } from '../lib/BoltDatabase';

interface BusinessEvent {
  id: string;
  event_name: string;
  event_date: string;
  location: string;
  city: string;
  type: string;
  short_description: string;
  organizer: string;
  website?: string;
  image_url?: string;
  featured: boolean;
}

interface FeaturedEventsCarouselProps {
  onDiscoverClick: () => void;
  autoplay?: boolean;
  interval?: number;
  showArrows?: boolean;
  showIndicators?: boolean;
}

export const FeaturedEventsCarousel = ({
  onDiscoverClick,
  autoplay = true,
  interval = 7000,
  showArrows = true,
  showIndicators = true,
}: FeaturedEventsCarouselProps) => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);
  const [loading, setLoading] = useState(true);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const data = await getFeaturedEvents(5);
      if (data && data.length > 0) {
        setEvents(data);
      }
    } catch (err) {
      console.error('Error loading featured events:', err);
    } finally {
      setLoading(false);
    }
  };

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % events.length);
  }, [events.length]);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + events.length) % events.length);
  }, [events.length]);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (autoplay && !isHovered && events.length > 1) {
      const timer = setInterval(nextSlide, interval);
      return () => clearInterval(timer);
    }
  }, [autoplay, isHovered, events.length, interval, nextSlide]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') prevSlide();
      if (e.key === 'ArrowRight') nextSlide();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextSlide, prevSlide]);

  if (loading) {
    return (
      <section className="py-16 px-4 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-center h-[500px] bg-gray-50 rounded-2xl">
            <div className="w-12 h-12 border-4 border-red-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        </div>
      </section>
    );
  }

  if (events.length === 0) {
    return (
      <section className="py-16 px-4 bg-white">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-12 md:p-16 text-center border border-gray-200 shadow-lg"
          >
            <div className="max-w-2xl mx-auto">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-gray-100 rounded-full mb-6">
                <Calendar className="w-10 h-10 text-gray-400" />
              </div>
              <h3
                className="text-2xl md:text-3xl font-light text-gray-800 mb-4"
                style={{ fontFamily: "'Playfair Display', serif" }}
              >
                {t.businessEvents.noEvents}
              </h3>
              <p className="text-gray-600 mb-8 font-light text-lg" style={{ lineHeight: '1.7' }}>
                {language === 'fr' && 'Découvrez les prochains événements professionnels sur notre page dédiée.'}
                {language === 'en' && 'Discover upcoming professional events on our dedicated page.'}
                {language === 'ar' && 'اكتشف الفعاليات المهنية القادمة على صفحتنا المخصصة.'}
                {language === 'it' && 'Scopri i prossimi eventi professionali sulla nostra pagina dedicata.'}
                {language === 'ru' && 'Откройте для себя предстоящие профессиональные мероприятия на нашей специальной странице.'}
              </p>
              <motion.button
                onClick={onDiscoverClick}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <span>{t.businessEvents.featuredEvent.viewAll}</span>
                <span>→</span>
              </motion.button>
            </div>
          </motion.div>
        </div>
      </section>
    );
  }

  const currentEvent = events[currentIndex];

  return (
    <section className="py-16 px-4 bg-white" role="region" aria-roledescription="carousel" aria-label="Featured Events">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="relative rounded-2xl overflow-hidden shadow-xl"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="relative h-[500px] overflow-hidden">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentEvent.id}
                custom={direction}
                initial={{ opacity: 0, rotateY: direction * 5, scale: 0.95 }}
                animate={{ opacity: 1, rotateY: 0, scale: 1 }}
                exit={{ opacity: 0, rotateY: direction * -5, scale: 0.95 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="absolute inset-0"
                style={{ perspective: '1000px' }}
              >
                {currentEvent.image_url && (
                  <>
                    <img
                      src={currentEvent.image_url}
                      alt={currentEvent.event_name}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
                    <div className="absolute inset-0 bg-black/20"></div>

                    <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/40 to-transparent"></div>
                    <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-black/90 to-transparent"></div>

                    <div className="absolute left-0 top-0 bottom-0 w-32 bg-gradient-to-r from-black/30 to-transparent"></div>
                    <div className="absolute right-0 top-0 bottom-0 w-32 bg-gradient-to-l from-black/30 to-transparent"></div>
                  </>
                )}

                <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-white">
                  <div className="max-w-3xl">
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2, duration: 0.5 }}
                      className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6 shadow-2xl border bg-gradient-to-r from-red-600 to-red-700 border-white/20"
                    >
                      <TrendingUp className="w-4 h-4" />
                      <span className="tracking-wide uppercase">{t.businessEvents.eventCard.featured}</span>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3, duration: 0.5 }}
                    >
                      <div className="h-1 w-16 mb-4 bg-gradient-to-r from-red-600 to-transparent"></div>
                      <h2
                        className="text-3xl md:text-5xl font-light mb-6 tracking-tight"
                        style={{
                          fontFamily: "'Playfair Display', serif",
                          lineHeight: '1.2',
                          textShadow: '0 2px 10px rgba(0,0,0,0.3)',
                        }}
                      >
                        {currentEvent.event_name}
                      </h2>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.4, duration: 0.5 }}
                      className="flex flex-wrap gap-6 mb-6 text-base"
                    >
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg backdrop-blur-sm bg-red-600/20">
                          <Calendar className="w-4 h-4 text-red-400" />
                        </div>
                        <span className="font-light tracking-wide">
                          {new Date(currentEvent.event_date).toLocaleDateString(
                            language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-TN' : language === 'it' ? 'it-IT' : 'en-US',
                            { day: 'numeric', month: 'long', year: 'numeric' }
                          )}
                        </span>
                      </div>
                      <div className="flex items-center gap-2.5">
                        <div className="p-1.5 rounded-lg backdrop-blur-sm bg-red-600/20">
                          <MapPin className="w-4 h-4 text-red-400" />
                        </div>
                        <span className="font-light tracking-wide">
                          {currentEvent.city}, {currentEvent.location}
                        </span>
                      </div>
                    </motion.div>

                    <motion.p
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.5, duration: 0.5 }}
                      className="text-white/90 leading-relaxed mb-8 max-w-2xl font-light text-base md:text-lg"
                      style={{ lineHeight: '1.7' }}
                    >
                      {currentEvent.short_description}
                    </motion.p>

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6, duration: 0.5 }}
                      className="flex flex-wrap gap-4"
                    >
                      <motion.button
                        onClick={onDiscoverClick}
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        className="group/btn px-8 py-4 bg-white text-red-600 rounded-xl font-medium shadow-2xl hover:shadow-red-600/20 transition-all duration-400 ease-out"
                      >
                        <span className="flex items-center gap-2">
                          <span>{t.businessEvents.featuredEvent.discover}</span>
                          <span className="group-hover/btn:translate-x-1 transition-transform duration-300">→</span>
                        </span>
                      </motion.button>

                      {currentEvent.website && (
                        <motion.a
                          href={currentEvent.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          whileHover={{ y: -2 }}
                          whileTap={{ scale: 0.98 }}
                          className="px-8 py-4 border-2 border-white/30 backdrop-blur-sm text-white rounded-xl font-medium hover:bg-white/10 hover:border-white transition-all duration-400"
                        >
                          {t.businessEvents.eventCard.register}
                        </motion.a>
                      )}
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          </div>

          {showArrows && events.length > 1 && (
            <>
              <button
                onClick={prevSlide}
                aria-label="Événement précédent"
                className="absolute left-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm text-white rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 hover:bg-white/20 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={nextSlide}
                aria-label="Événement suivant"
                className="absolute right-4 top-1/2 -translate-y-1/2 p-3 bg-white/10 backdrop-blur-sm text-white rounded-full opacity-0 hover:opacity-100 transition-opacity duration-300 hover:bg-white/20 focus:opacity-100 focus:outline-none focus:ring-2 focus:ring-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}

          {showIndicators && events.length > 1 && (
            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
              {events.map((_, index) => (
                <button
                  key={index}
                  onClick={() => goToSlide(index)}
                  aria-label={`Aller à l'événement ${index + 1}`}
                  className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-red-600 w-8'
                      : 'bg-white/50 hover:bg-white/80'
                  }`}
                />
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </section>
  );
};
