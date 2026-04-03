import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { supabase } from '../lib/BoltDatabase';
import { Handshake, Network, TrendingUp, Send, CheckCircle, XCircle } from 'lucide-react';

export const PartnerSearch = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const [formData, setFormData] = useState({
    profileType: '',
    companyName: '',
    sector: '',
    region: '',
    searchType: '',
    description: '',
    email: '',
    phone: '',
    language: language,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const { error } = await supabase
        .from('partner_requests')
        .insert([{ ...formData, language }]);

      if (error) throw error;

      setSubmitStatus('success');
      setFormData({
        profileType: '',
        companyName: '',
        sector: '',
        region: '',
        searchType: '',
        description: '',
        email: '',
        phone: '',
        language: language,
      });

      setTimeout(() => setSubmitStatus('idle'), 5000);
    } catch (error) {
      console.error('Error submitting partner request:', error);
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="relative bg-gradient-to-br from-red-50 via-white to-orange-50 py-16 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 left-10 w-64 h-64 bg-red-600 rounded-full blur-3xl"></div>
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-orange-600 rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-4xl mx-auto text-center relative">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl font-light text-gray-900 mb-4">
              {t.partnerSearch.title}
            </h1>
            <p className="text-lg text-gray-600 font-light mb-6">
              {t.partnerSearch.subtitle}
            </p>
            <div className="max-w-3xl mx-auto">
              <p className="text-sm text-gray-600 leading-relaxed" style={{ lineHeight: '1.8' }}>
                {t.partnerSearch.description}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="grid md:grid-cols-3 gap-8 mb-16"
          >
            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Handshake className="w-8 h-8 text-orange-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Collaboration</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t.partnerSearch.intro.paragraph1.split('.')[0]}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Network className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Réseau</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t.partnerSearch.intro.paragraph2.split('.')[0]}
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-green-600" />
              </div>
              <h3 className="text-sm font-medium text-gray-900 mb-2">Opportunité</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t.partnerSearch.intro.paragraph3.split('.')[0]}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.6 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 md:p-12 mb-12"
          >
            <div className="prose prose-sm max-w-none mb-8">
              <p className="text-gray-600 leading-relaxed mb-4">
                {t.partnerSearch.intro.paragraph1}
              </p>
              <p className="text-gray-600 leading-relaxed mb-4">
                {t.partnerSearch.intro.paragraph2}
              </p>
              <p className="text-gray-600 leading-relaxed">
                {t.partnerSearch.intro.paragraph3}
              </p>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-2xl font-light text-gray-900 mb-6">
                {t.partnerSearch.form.title}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.partnerSearch.form.profileType}
                    </label>
                    <select
                      name="profileType"
                      value={formData.profileType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                    >
                      <option value="">---</option>
                      <option value="company">{t.partnerSearch.form.profileTypes.company}</option>
                      <option value="freelancer">{t.partnerSearch.form.profileTypes.freelancer}</option>
                      <option value="provider">{t.partnerSearch.form.profileTypes.provider}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.partnerSearch.form.companyName}
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.partnerSearch.form.sector}
                    </label>
                    <input
                      type="text"
                      name="sector"
                      value={formData.sector}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.partnerSearch.form.region}
                    </label>
                    <input
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.partnerSearch.form.searchType}
                    </label>
                    <select
                      name="searchType"
                      value={formData.searchType}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                    >
                      <option value="">---</option>
                      <option value="partner">{t.partnerSearch.form.searchTypes.partner}</option>
                      <option value="supplier">{t.partnerSearch.form.searchTypes.supplier}</option>
                      <option value="client">{t.partnerSearch.form.searchTypes.client}</option>
                      <option value="other">{t.partnerSearch.form.searchTypes.other}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.partnerSearch.form.email}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.partnerSearch.form.phone}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {t.partnerSearch.form.description}
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 transition-all resize-none"
                    ></textarea>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-lg font-medium hover:from-orange-700 hover:to-red-700 transition-all shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
                      <span>{t.partnerSearch.form.submit}</span>
                    </>
                  )}
                </motion.button>

                {submitStatus === 'success' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
                  >
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm">{t.partnerSearch.form.success}</span>
                  </motion.div>
                )}

                {submitStatus === 'error' && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                  >
                    <XCircle className="w-5 h-5" />
                    <span className="text-sm">{t.partnerSearch.form.error}</span>
                  </motion.div>
                )}
              </form>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.6 }}
            className="bg-gradient-to-br from-blue-50 to-white rounded-2xl border border-blue-200 p-8 text-center"
          >
            <p className="text-gray-700 mb-4">
              {t.partnerSearch.serviceProvider.text}
            </p>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              {t.partnerSearch.serviceProvider.button}
            </motion.button>
          </motion.div>
        </div>
      </section>
    </div>
  );
};
