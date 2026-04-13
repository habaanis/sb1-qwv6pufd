import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { supabase } from '../lib/BoltDatabase';
import { Facebook, Linkedin, Youtube, Instagram } from 'lucide-react';

const SECTEURS_OPTIONS = [
  { value: 'education', label: 'Événement scolaire / éducatif' },
  { value: 'Loisirs & Événements', label: 'Événement loisir / sortie' },
  { value: 'entreprise', label: 'Événement professionnel / entreprise' },
] as const;

interface BusinessEvent {
  id: string;
  event_name: string;
  event_date: string | null;          // ⬅ peut être null
  end_date?: string | null;
  location: string;
  city: string;
  event_type: string;
  short_description: string;
  organizer: string | null;
  registration_url?: string | null;
  image_url?: string | null;
  featured: boolean;
  created_at: string;
  event_period_label?: string | null; // période libre (ex: 2026/2027)
  secteur_evenement?: 'education' | 'Loisirs & Événements' | 'entreprise' | null;

  // 👇 NOUVEAU
  instagram_url?: string | null;
  facebook_url?: string | null;
  linkedin_url?: string | null;
  x_url?: string | null;
  youtube_url?: string | null;
}

export const BusinessEvents = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États des filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCity, setSelectedCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [onlyUpcoming, setOnlyUpcoming] = useState(true); // coché par défaut

  const [showForm, setShowForm] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const eventsRef = useRef<HTMLDivElement>(null);

  // Détecter le secteur depuis l'URL (ex: #/business-events?sector=education)
  const urlParams = new URLSearchParams(window.location.hash.split('?')[1] || '');
  const sectorFromUrl = urlParams.get('sector') as 'education' | 'Loisirs & Événements' | 'entreprise' | null;
  const defaultSector = sectorFromUrl || 'entreprise'; // Par défaut 'entreprise'

  const [formData, setFormData] = useState({
    event_name: '',
    event_date: '',           // ⬅ champ texte, mais pas obligatoire
    end_date: '',
    location: '',
    city: '',
    short_description: '',
    organizer: '',
    registration_url: '',
    image_url: '',
    event_period_label: '',   // ⬅ période libre
    secteur_evenement: defaultSector, // NOUVEAU : secteur par défaut
    // 👇 NOUVEAU
    instagram_url: '',
    facebook_url: '',
    linkedin_url: '',
    x_url: '',
    youtube_url: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('featured_events')
        .select('*')
        .order('event_date', { ascending: true });

      if (fetchError) {
        console.warn('⚠️ featured_events table not available:', fetchError.message);
        setError('Impossible de charger les événements pour le moment.');
        setEvents([]);
        return;
      }

      console.log('[BusinessEvents] events loaded', data);
      setEvents(data || []);
    } catch (err) {
      console.warn('⚠️ Error fetching events:', err);
      setError('Une erreur est survenue lors du chargement des événements.');
      setEvents([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError(false);

    try {
      const payload = {
        event_name: formData.event_name,
        event_date: formData.event_date || null,             // ⬅ null si vide
        end_date: formData.end_date || null,
        location: formData.location,
        city: formData.city,
        short_description: formData.short_description,
        organizer: formData.organizer || null,
        registration_url: formData.registration_url || null,
        image_url: formData.image_url || null,
        event_period_label: formData.event_period_label || null,
        secteur_evenement: formData.secteur_evenement, // 🔥 NOUVEAU : secteur de l'événement
        // 👇 NOUVEAU
        instagram_url: formData.instagram_url || null,
        facebook_url: formData.facebook_url || null,
        linkedin_url: formData.linkedin_url || null,
        x_url: formData.x_url || null,
        youtube_url: formData.youtube_url || null,
      };

      const { error: insertError } = await supabase
        .from('featured_events')
        .insert([payload]);

      if (insertError) {
        console.warn('⚠️ Cannot submit event - table not available:', insertError.message);
        setSubmitError(true);
        return;
      }

      setSubmitSuccess(true);
      setFormData({
        event_name: '',
        event_date: '',
        end_date: '',
        location: '',
        city: '',
        short_description: '',
        organizer: '',
        registration_url: '',
        image_url: '',
        event_period_label: '',
        secteur_evenement: defaultSector, // Garder le même secteur
        instagram_url: '',
        facebook_url: '',
        linkedin_url: '',
        x_url: '',
        youtube_url: '',
      });
      fetchEvents();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (err) {
      console.error('Error submitting event:', err);
      setSubmitError(true);
      setTimeout(() => setSubmitError(false), 5000);
    }
  };

  const scrollToEvents = () => {
    const section = document.getElementById('business-events-list');
    section?.scrollIntoView({ behavior: 'smooth' });
  };

  // Construction des options de filtre (ville & catégorie)
  const cityOptions = Array.from(
    new Set(events.map((e) => (e.city || '').trim()).filter(Boolean))
  ).sort();

  const categoryOptions = Array.from(
    new Set(events.map((e) => (e.event_type || '').trim()).filter(Boolean))
  ).sort();

  // Filtrage des événements
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const filteredEvents = events.filter((event) => {
    const search = searchTerm.trim().toLowerCase();

    // Filtre recherche textuelle
    if (search) {
      const haystack = [
        event.event_name,
        event.short_description || '',
        event.city || '',
        event.event_type || '',
        event.organizer || '',
        event.event_period_label || '',
      ]
        .join(' ')
        .toLowerCase();

      if (!haystack.includes(search)) return false;
    }

    // Filtre par ville
    if (selectedCity && (event.city || '').trim() !== selectedCity) {
      return false;
    }

    // Filtre par catégorie
    if (selectedCategory && (event.event_type || '').trim() !== selectedCategory) {
      return false;
    }

    // Filtre événements à venir uniquement (basé sur les dates uniquement)
    if (onlyUpcoming && event.event_date) {
      const dateToCompareStr = event.end_date || event.event_date;
      const dateToCompare = new Date(dateToCompareStr);
      dateToCompare.setHours(0, 0, 0, 0);

      if (!isNaN(dateToCompare.getTime()) && dateToCompare < today) {
        return false;
      }
    }

    return true;
  });


  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-[#4A1D43] via-[#800020] to-[#4A1D43] py-16 px-4 overflow-hidden border-b-2 border-[#D4AF37]"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-[#D4AF37] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-light text-white mb-4" style={{ lineHeight: '1.2', fontFamily: "'Playfair Display', serif" }}>
              {t.businessEvents.title}
            </h1>
            <p className="text-lg text-white/90 font-light mb-6">
              {t.businessEvents.subtitle}
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToEvents}
              className="inline-flex items-center gap-2 px-8 py-3 bg-[#D4AF37] text-[#4A1D43] rounded-lg hover:shadow-lg transition-all font-semibold border-2 border-[#D4AF37]"
            >
              {t.businessEvents.viewEvents}
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Introduction Section */}
      <section className="py-12 px-4">
        <div className="max-w-4xl mx-auto space-y-4">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-base text-gray-700 leading-relaxed"
            style={{ lineHeight: '1.7' }}
          >
            {t.businessEvents.introduction.paragraph1}
          </motion.p>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-base text-gray-700 leading-relaxed"
            style={{ lineHeight: '1.7' }}
          >
            {t.businessEvents.introduction.paragraph2}
          </motion.p>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-base text-gray-700 leading-relaxed"
            style={{ lineHeight: '1.7' }}
          >
            {t.businessEvents.introduction.paragraph3}
          </motion.p>
        </div>
      </section>

      {/* Events Section */}
      <section id="business-events-list" ref={eventsRef} className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Titre */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="mb-6"
          >
            <h2 className="text-3xl font-light text-[#4A1D43]" style={{ fontFamily: "'Playfair Display', serif" }}>{t.businessEvents.upcomingEvents}</h2>
          </motion.div>

          {/* Bloc de filtres */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="relative z-0 mb-6 bg-white border-2 border-[#D4AF37] rounded-lg p-5 shadow-sm"
          >
            {/* Recherche textuelle */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Rechercher un événement
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher un événement, une ville, une entreprise..."
                  className="w-full px-4 py-2.5 border border-[#D4AF37] rounded-lg text-sm focus:ring-2 focus:ring-[#4A1D43] focus:border-[#4A1D43]"
                />
              </div>
            </div>

            {/* Filtres structurés */}
            <div className="grid md:grid-cols-3 gap-4">
              {/* Ville */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville
                </label>
                <select
                  value={selectedCity}
                  onChange={(e) => setSelectedCity(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#D4AF37] rounded-lg text-sm focus:ring-2 focus:ring-[#4A1D43] focus:border-[#4A1D43]"
                >
                  <option value="">Toutes les villes</option>
                  {cityOptions.map((city) => (
                    <option key={city} value={city}>
                      {city}
                    </option>
                  ))}
                </select>
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catégorie
                </label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full px-3 py-2.5 border border-[#D4AF37] rounded-lg text-sm focus:ring-2 focus:ring-[#4A1D43] focus:border-[#4A1D43]"
                >
                  <option value="">Toutes les catégories</option>
                  {categoryOptions.map((category) => (
                    <option key={category} value={category}>
                      {t.businessEvents.eventTypes[category as keyof typeof t.businessEvents.eventTypes] || category}
                    </option>
                  ))}
                </select>
              </div>

              {/* Événements à venir */}
              <div className="flex items-end">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={onlyUpcoming}
                    onChange={(e) => setOnlyUpcoming(e.target.checked)}
                    className="w-4 h-4 text-[#800020] border-[#D4AF37] rounded focus:ring-[#800020]"
                  />
                  <span className="text-sm text-gray-700">
                    Afficher uniquement les événements à venir
                  </span>
                </label>
              </div>
            </div>
          </motion.div>

          {/* États : loading / erreur / liste */}
          {loading ? (
            <div className="text-center py-16">
              <div className="inline-block w-12 h-12 border-4 border-[#800020] border-t-transparent rounded-full animate-spin"></div>
              <p className="mt-4 text-sm text-gray-600">Chargement des événements...</p>
            </div>
          ) : error ? (
            <div className="mb-6 p-4 rounded-lg bg-[#800020]/5 border border-[#D4AF37] text-[#800020] text-sm">
              {error}
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-12 border-2 border-gray-100">
                  <p className="text-xl text-gray-600 font-light">
                    Aucun événement trouvé pour ces critères.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {filteredEvents.map((event, index) => {
                return (
                  <motion.div
                    key={event.id}
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    className={`bg-white rounded-xl overflow-hidden shadow-lg hover:shadow-2xl transition-all ${
                      event.featured ? 'border-2 border-[#D4AF37]' : 'border border-gray-200'
                    }`}
                  >
                    {event.featured && (
                      <div className="bg-gradient-to-r from-[#4A1D43] to-[#800020] text-[#D4AF37] text-xs font-semibold py-2 px-4 text-center">
                        {t.businessEvents.eventCard.featured}
                      </div>
                    )}

                    {event.image_url && (
                      <div className="h-24 overflow-hidden bg-gray-100 flex items-center justify-center">
                        <img
                          src={event.image_url.split(',')[0].trim()}
                          alt={event.event_name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    )}

                    <div className="p-3 flex flex-col h-full">
                      <div className="mb-2">
                        <span className="text-xs font-medium text-[#4A1D43] bg-[#D4AF37]/20 px-2 py-0.5 rounded-full border border-[#D4AF37]">
                          {t.businessEvents.eventTypes[event.event_type as keyof typeof t.businessEvents.eventTypes]}
                        </span>
                      </div>

                      <h3 className="text-xs font-semibold text-gray-900 mb-2 line-clamp-2">
                        {event.event_name}
                      </h3>

                      <div className="space-y-1 mb-3 text-xs text-gray-600">
                        <div>
                          <strong>Date:</strong>{' '}
                          <span>
                            {event.event_period_label && event.event_period_label.trim() !== ''
                              ? event.event_period_label
                              : (() => {
                                  if (!event.event_date) return '';

                                  const start = new Date(event.event_date);
                                  const startLabel = !isNaN(start.getTime())
                                    ? start.toLocaleDateString()
                                    : event.event_date;

                                  if (event.end_date) {
                                    const end = new Date(event.end_date);
                                    const endLabel = !isNaN(end.getTime())
                                      ? end.toLocaleDateString()
                                      : event.end_date;

                                    return `Du ${startLabel} au ${endLabel}`;
                                  }

                                  return startLabel;
                                })()}
                          </span>
                        </div>
                        <div>
                          <strong>Lieu:</strong> {event.city}, {event.location}
                        </div>
                        {event.organizer && (
                          <div>
                            <strong>Org:</strong> {event.organizer}
                          </div>
                        )}
                      </div>

                      <p className="text-xs text-gray-600 leading-relaxed mb-3 line-clamp-2 flex-grow">
                        {event.short_description}
                      </p>

                      {event.registration_url && (
                        <a
                          href={event.registration_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[#800020] font-medium hover:gap-2 transition-all text-xs mb-2"
                        >
                          <span>{t.businessEvents.eventCard.learnMore}</span>
                          <span>→</span>
                        </a>
                      )}

                      {(event.instagram_url || event.facebook_url || event.linkedin_url || event.x_url || event.youtube_url) && (
                        <div className="mt-auto pt-2 flex items-center gap-2 border-t border-gray-100">
                          {event.instagram_url && (
                            <a
                              href={event.instagram_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-full bg-pink-50 hover:bg-pink-100 text-pink-600 transition"
                              title="Instagram"
                            >
                              <Instagram className="w-3 h-3" />
                            </a>
                          )}
                          {event.facebook_url && (
                            <a
                              href={event.facebook_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-full bg-blue-50 hover:bg-blue-100 text-blue-600 transition"
                              title="Facebook"
                            >
                              <Facebook className="w-3 h-3" />
                            </a>
                          )}
                          {event.linkedin_url && (
                            <a
                              href={event.linkedin_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-full bg-sky-50 hover:bg-sky-100 text-sky-700 transition"
                              title="LinkedIn"
                            >
                              <Linkedin className="w-3 h-3" />
                            </a>
                          )}
                          {event.youtube_url && (
                            <a
                              href={event.youtube_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-1.5 rounded-full bg-[#800020]/5 hover:bg-[#800020]/10 text-[#800020] transition"
                              title="YouTube"
                            >
                              <Youtube className="w-3 h-3" />
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Submit Form Section */}
      <section className="py-12 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-6">
              <h2 className="text-3xl font-light text-[#4A1D43] mb-3" style={{ fontFamily: "'Playfair Display', serif" }}>
                {t.businessEvents.submitForm.title}
              </h2>
              <p className="text-gray-600">
                {t.businessEvents.submitForm.description}
              </p>
            </div>

            {!showForm ? (
              <div className="text-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setShowForm(true)}
                  className="px-8 py-3 bg-gradient-to-r from-[#4A1D43] to-[#800020] text-[#D4AF37] rounded-lg hover:shadow-lg transition-all font-semibold border-2 border-[#D4AF37]"
                >
                  {t.businessEvents.submitForm.title}
                </motion.button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="relative z-50 bg-white rounded-2xl p-8 shadow-lg space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.businessEvents.submitForm.eventName} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.event_name}
                      onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {/* on enlève l'étoile visuelle ici */}
                      {t.businessEvents.submitForm.date}
                      <span className="block text-xs text-gray-500">
                        (facultatif – si la date est connue)
                      </span>
                    </label>
                    <input
                      type="date"
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.businessEvents.submitForm.city} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.businessEvents.submitForm.location} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                    />
                  </div>
                </div>

                {/* Date de fin */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Date de fin (optionnel)
                  </label>
                  <input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                    className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                  />
                </div>

                {/* Période libre */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Période (optionnelle)
                    <span className="block text-xs text-gray-500">
                      Exemple : 2026, Mars 2027, 2026/2027…
                    </span>
                  </label>
                  <input
                    type="text"
                    value={formData.event_period_label}
                    onChange={(e) =>
                      setFormData({ ...formData, event_period_label: e.target.value })
                    }
                    className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                    placeholder="Ex : 2026/2027"
                  />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Type d'événement *
                    </label>
                    <select
                      required
                      value={formData.secteur_evenement}
                      onChange={(e) => setFormData({ ...formData, secteur_evenement: e.target.value as 'education' | 'Loisirs & Événements' | 'entreprise' })}
                      className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                    >
                      {SECTEURS_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.businessEvents.submitForm.organizer}
                    </label>
                    <input
                      type="text"
                      value={formData.organizer}
                      onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.businessEvents.submitForm.shortDescription} *
                  </label>
                  <textarea
                    required
                    rows={4}
                    value={formData.short_description}
                    onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                    className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.businessEvents.submitForm.website}
                  </label>
                  <input
                    type="url"
                    value={formData.registration_url}
                    onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                    className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.businessEvents.submitForm.image}
                  </label>
                  <input
                    type="url"
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                  />
                  <p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                    ⚠️ Merci d'utiliser des images importées directement (hébergées sur votre site ou un service d'hébergement d'images) au lieu de liens Facebook pour éviter les erreurs d'affichage.
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Instagram
                    </label>
                    <input
                      type="url"
                      value={formData.instagram_url}
                      onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                      placeholder="https://instagram.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Facebook
                    </label>
                    <input
                      type="url"
                      value={formData.facebook_url}
                      onChange={(e) => setFormData({ ...formData, facebook_url: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      LinkedIn
                    </label>
                    <input
                      type="url"
                      value={formData.linkedin_url}
                      onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                      placeholder="https://linkedin.com/..."
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      X (Twitter)
                    </label>
                    <input
                      type="url"
                      value={formData.x_url}
                      onChange={(e) => setFormData({ ...formData, x_url: e.target.value })}
                      className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                      placeholder="https://x.com/..."
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Lien YouTube (optionnel)
                  </label>
                  <input
                    type="url"
                    value={formData.youtube_url}
                    onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                    placeholder="https://youtube.com/..."
                    className="w-full px-4 py-2 border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#800020] focus:border-transparent"
                  />
                </div>

                {submitSuccess && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg"
                  >
                    {t.businessEvents.submitForm.success}
                  </motion.div>
                )}

                {submitError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-[#800020]/5 border border-[#D4AF37] text-[#800020] px-4 py-3 rounded-lg"
                  >
                    {t.businessEvents.submitForm.error}
                  </motion.div>
                )}

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
                  >
                    {t.businessEvents.submitForm.submit}
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-6 py-3 border border-[#D4AF37] text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
                  >
                    {t.common.cancel}
                  </button>
                </div>
              </form>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

export default BusinessEvents;


