import { motion } from 'framer-motion';
import { Calendar, MapPin, TrendingUp } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';

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

interface FeaturedEventCardProps {
  event: BusinessEvent | null;
  onDiscoverClick: () => void;
  highlight?: boolean;
}

export const FeaturedEventCard = ({ event, onDiscoverClick, highlight = false }: FeaturedEventCardProps) => {
  const { language } = useLanguage();
  const t = useTranslation(language);

  if (!event) {
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

  return (
    <section className="py-16 px-4 bg-white">
      <div className="max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          whileHover={{ scale: 1.01 }}
          className={`group relative rounded-2xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-500 ${
            highlight ? 'ring-2 ring-[#C9A96E] ring-offset-4' : ''
          }`}
        >
          {/* Background Image */}
          {event.image_url && (
            <div className="relative h-[500px] overflow-hidden">
              <img
                src={event.image_url}
                alt={event.event_name}
                className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-[800ms] ease-out"
              />

              {/* Sophisticated Dark Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent"></div>
              <div className="absolute inset-0 bg-black/20"></div>
            </div>
          )}

          {/* Content Overlay - Refined Typography */}
          <div className="absolute inset-0 flex flex-col justify-end p-8 md:p-12 text-white">
            <div className="max-w-3xl">
              {/* Premium Badge */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2, duration: 0.5 }}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium mb-6 shadow-2xl border ${
                  highlight
                    ? 'bg-gradient-to-r from-[#C9A96E] to-[#B8935A] border-[#C9A96E]/30'
                    : 'bg-gradient-to-r from-red-600 to-red-700 border-white/20'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                <span className="tracking-wide uppercase">
                  {highlight ? 'ÉVÉNEMENT PREMIUM' : t.businessEvents.eventCard.featured}
                </span>
              </motion.div>

              {/* Elegant Title with Serif Font */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <div
                  className={`h-1 w-16 mb-4 ${
                    highlight ? 'bg-gradient-to-r from-[#C9A96E] to-transparent' : 'bg-gradient-to-r from-red-600 to-transparent'
                  }`}
                ></div>
                <h2
                  className="text-3xl md:text-5xl font-light mb-6 tracking-tight"
                  style={{
                    fontFamily: "'Playfair Display', serif",
                    lineHeight: '1.2',
                    textShadow: '0 2px 10px rgba(0,0,0,0.3)'
                  }}
                >
                  {event.event_name}
                </h2>
              </motion.div>

              {/* Date & Location with Refined Icons */}
              <motion.div
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="flex flex-wrap gap-6 mb-6 text-base"
              >
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg backdrop-blur-sm ${
                    highlight ? 'bg-[#C9A96E]/20' : 'bg-red-600/20'
                  }`}>
                    <Calendar className={`w-4 h-4 ${highlight ? 'text-[#C9A96E]' : 'text-red-400'}`} />
                  </div>
                  <span className="font-light tracking-wide">
                    {new Date(event.event_date).toLocaleDateString(
                      language === 'fr' ? 'fr-FR' : language === 'ar' ? 'ar-TN' : language === 'it' ? 'it-IT' : 'en-US',
                      { day: 'numeric', month: 'long', year: 'numeric' }
                    )}
                  </span>
                </div>
                <div className="flex items-center gap-2.5">
                  <div className={`p-1.5 rounded-lg backdrop-blur-sm ${
                    highlight ? 'bg-[#C9A96E]/20' : 'bg-red-600/20'
                  }`}>
                    <MapPin className={`w-4 h-4 ${highlight ? 'text-[#C9A96E]' : 'text-red-400'}`} />
                  </div>
                  <span className="font-light tracking-wide">{event.city}, {event.location}</span>
                </div>
              </motion.div>

              {/* Elegant Description */}
              <motion.p
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-white/90 leading-relaxed mb-8 max-w-2xl font-light text-base md:text-lg"
                style={{ lineHeight: '1.7' }}
              >
                {event.short_description}
              </motion.p>

              {/* Refined CTA Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
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

                {event.website && (
                  <motion.a
                    href={event.website}
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
      </div>
    </section>
  );
};
