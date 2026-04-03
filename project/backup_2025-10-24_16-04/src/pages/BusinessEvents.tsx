import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { Calendar, MapPin, Users, TrendingUp, Filter, ChevronDown } from 'lucide-react';
import { supabase } from '../lib/BoltDatabase';

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
  created_at: string;
}

export const BusinessEvents = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [events, setEvents] = useState<BusinessEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedType, setSelectedType] = useState<string>('all');
  const [showForm, setShowForm] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);
  const eventsRef = useRef<HTMLDivElement>(null);

  const [formData, setFormData] = useState({
    event_name: '',
    event_date: '',
    location: '',
    city: '',
    type: 'conference',
    short_description: '',
    organizer: '',
    website: '',
    image_url: '',
  });

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const { data, error } = await supabase
        .from('business_events')
        .select('*')
        .gte('event_date', new Date().toISOString().split('T')[0])
        .order('event_date', { ascending: true });

      if (error) throw error;
      setEvents(data || []);
    } catch (error) {
      console.error('Error fetching events:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError(false);

    try {
      const { error } = await supabase
        .from('business_events')
        .insert([formData]);

      if (error) throw error;

      setSubmitSuccess(true);
      setFormData({
        event_name: '',
        event_date: '',
        location: '',
        city: '',
        type: 'conference',
        short_description: '',
        organizer: '',
        website: '',
        image_url: '',
      });
      fetchEvents();
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      console.error('Error submitting event:', error);
      setSubmitError(true);
      setTimeout(() => setSubmitError(false), 5000);
    }
  };

  const scrollToEvents = () => {
    eventsRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredEvents = selectedType === 'all'
    ? events
    : events.filter(event => event.type === selectedType);

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'salon': return Users;
      case 'conference': return TrendingUp;
      case 'formation': return Calendar;
      default: return Users;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-red-50 via-white to-orange-50 py-20 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-20 left-10 w-96 h-96 bg-red-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-orange-600 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-6xl font-light text-gray-900 mb-6" style={{ lineHeight: '1.2' }}>
              {t.businessEvents.title}
            </h1>
            <p className="text-xl text-gray-600 font-light mb-8">
              {t.businessEvents.subtitle}
            </p>

            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={scrollToEvents}
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg transition-all font-medium"
            >
              {t.businessEvents.viewEvents}
              <ChevronDown className="w-5 h-5" />
            </motion.button>
          </motion.div>
        </div>
      </motion.div>

      {/* Introduction Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-lg text-gray-700 leading-relaxed"
            style={{ lineHeight: '1.8' }}
          >
            {t.businessEvents.introduction.paragraph1}
          </motion.p>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="text-lg text-gray-700 leading-relaxed"
            style={{ lineHeight: '1.8' }}
          >
            {t.businessEvents.introduction.paragraph2}
          </motion.p>
          <motion.p
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2, duration: 0.6 }}
            className="text-lg text-gray-700 leading-relaxed"
            style={{ lineHeight: '1.8' }}
          >
            {t.businessEvents.introduction.paragraph3}
          </motion.p>
        </div>
      </section>

      {/* Events Section */}
      <section ref={eventsRef} className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          {/* Filter */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            className="mb-12 flex flex-wrap items-center justify-between gap-4"
          >
            <h2 className="text-3xl font-light text-gray-900">{t.businessEvents.upcomingEvents}</h2>

            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-gray-500" />
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              >
                <option value="all">{t.businessEvents.eventTypes.all}</option>
                <option value="salon">{t.businessEvents.eventTypes.salon}</option>
                <option value="conference">{t.businessEvents.eventTypes.conference}</option>
                <option value="formation">{t.businessEvents.eventTypes.formation}</option>
                <option value="networking">{t.businessEvents.eventTypes.networking}</option>
                <option value="autre">{t.businessEvents.eventTypes.autre}</option>
              </select>
            </div>
          </motion.div>

          {/* Events Grid */}
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block w-12 h-12 border-4 border-red-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : filteredEvents.length === 0 ? (
            <div className="text-center py-16 px-4">
              <div className="max-w-2xl mx-auto">
                <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-12 border-2 border-gray-100">
                  <Calendar className="w-20 h-20 text-gray-300 mx-auto mb-6" />
                  <p className="text-xl text-gray-600 font-light">{t.businessEvents.noEvents}</p>
                </div>
              </div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event, index) => {
                const TypeIcon = getTypeIcon(event.type);
                return (
                  <motion.div
                    key={event.id}
                    initial={{ y: 30, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1, duration: 0.5 }}
                    whileHover={{ scale: 1.03, y: -5 }}
                    className={`bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all ${
                      event.featured ? 'border-2 border-red-600' : 'border-2 border-transparent'
                    }`}
                  >
                    {event.featured && (
                      <div className="bg-gradient-to-r from-red-600 to-red-700 text-white text-xs font-medium py-2 px-4 text-center">
                        {t.businessEvents.eventCard.featured}
                      </div>
                    )}

                    {event.image_url && (
                      <div className="h-48 overflow-hidden bg-gray-100">
                        <img
                          src={event.image_url}
                          alt={event.event_name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}

                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <div className="p-2 bg-red-100 rounded-lg">
                          <TypeIcon className="w-4 h-4 text-red-600" />
                        </div>
                        <span className="text-xs font-medium text-gray-600">
                          {t.businessEvents.eventTypes[event.type as keyof typeof t.businessEvents.eventTypes]}
                        </span>
                      </div>

                      <h3 className="text-xl font-semibold text-gray-900 mb-3">
                        {event.event_name}
                      </h3>

                      <div className="space-y-2 mb-4 text-sm text-gray-600">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          <span>{new Date(event.event_date).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          <span>{event.city}, {event.location}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          <span>{event.organizer}</span>
                        </div>
                      </div>

                      <p className="text-sm text-gray-600 leading-relaxed mb-6 line-clamp-3">
                        {event.short_description}
                      </p>

                      {event.website && (
                        <a
                          href={event.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 text-red-600 font-medium hover:gap-3 transition-all text-sm"
                        >
                          <span>{t.businessEvents.eventCard.learnMore}</span>
                          <span>→</span>
                        </a>
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
      <section className="py-16 px-4 bg-gray-50">
        <div className="max-w-3xl mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-center mb-8">
              <h2 className="text-3xl font-light text-gray-900 mb-3">
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
                  className="px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl hover:shadow-lg transition-all font-medium"
                >
                  {t.businessEvents.submitForm.title}
                </motion.button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg space-y-6">
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.businessEvents.submitForm.date} *
                    </label>
                    <input
                      type="date"
                      required
                      value={formData.event_date}
                      onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.businessEvents.submitForm.type} *
                    </label>
                    <select
                      required
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                    >
                      <option value="salon">{t.businessEvents.eventTypes.salon}</option>
                      <option value="conference">{t.businessEvents.eventTypes.conference}</option>
                      <option value="formation">{t.businessEvents.eventTypes.formation}</option>
                      <option value="networking">{t.businessEvents.eventTypes.networking}</option>
                      <option value="autre">{t.businessEvents.eventTypes.autre}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.businessEvents.submitForm.organizer} *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.organizer}
                      onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.businessEvents.submitForm.website}
                  </label>
                  <input
                    type="url"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
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
                    className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg"
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
                    className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all"
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
