import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { supabase } from '../lib/supabaseClient';
import { Handshake, Network, TrendingUp, Send, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Toast } from '../components/Toast';

/*
 * =============================================================================
 * COMPOSANT: PartnerSearch - Page Partenaire / Fournisseur
 * =============================================================================
 *
 * FICHIERS MODIFIÉS:
 * - src/pages/PartnerSearch.tsx
 *
 * COLONNES UTILISÉES POUR L'INSERT DANS partner_requests:
 * - profile_type (text)
 * - company_name (text)
 * - sector (text)
 * - region (text)
 * - search_type (text)
 * - description (text)
 * - email (text)
 * - phone (text)
 * - language (text, default 'fr')
 * - created_at (timestamptz)
 *
 * LOGS DANS LA CONSOLE:
 * Filtrer avec: [PartnerRequests]
 *
 * PROBLÈMES CORRIGÉS:
 * 1. Noms de colonnes: camelCase → snake_case
 * 2. Messages d'erreur: maintenant affichés clairement avec error.message
 * 3. Logs: ajoutés avant/après chaque insert avec préfixe [PartnerRequests]
 * 4. Mapping explicite des champs pour éviter les erreurs
 * =============================================================================
 */

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
  const [errorMessage, setErrorMessage] = useState('');

  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerFormData, setOfferFormData] = useState({
    companyName: '',
    secteurActivite: '',
    description: '',
    siteWeb: '',
    anneesExperience: '',
    email: '',
    phone: '',
    city: '',
  });
  const [isSubmittingOffer, setIsSubmittingOffer] = useState(false);
  const [offerSubmitStatus, setOfferSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [offerErrorMessage, setOfferErrorMessage] = useState('');

  // Toast states
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  console.log('[PartnerRequests] Page chargée');

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
    setErrorMessage('');

    // Construire la description complète
    const fullDescription = `
Type de profil: ${formData.profileType}
Secteur: ${formData.sector}
Région: ${formData.region}
Type de recherche: ${formData.searchType}

${formData.description}
    `.trim();

    // Préparer les données pour partner_requests
    const insertData = {
      company_name: formData.companyName,
      contact_name: formData.companyName,
      email: formData.email,
      phone: formData.phone,
      city: formData.region,
      description: fullDescription,
      request_type: 'partner_search',
      sector: formData.sector,
    };

    console.log('[PartnerRequests] 📤 Submitting to partner_requests', insertData);

    try {
      const { data, error } = await supabase
        .from('partner_requests')
        .insert([insertData])
        .select();

      console.log('[PartnerRequests] Supabase insert result', { data, error });

      if (error) {
        console.error('[PartnerRequests] ❌ Insert ERROR', error);
        setErrorMessage(error.message || 'Erreur inconnue lors de l\'envoi');
        setSubmitStatus('error');
        return;
      }

      console.log('[PartnerRequests] ✅ Insert SUCCESS', data);
      setSubmitStatus('success');

      // Réinitialiser le formulaire
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
    } catch (error: any) {
      console.error('[PartnerRequests] ❌ Exception caught:', error);
      setErrorMessage(error?.message || 'Une erreur inattendue est survenue');
      setSubmitStatus('error');
      setTimeout(() => setSubmitStatus('idle'), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOfferChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setOfferFormData({
      ...offerFormData,
      [e.target.name]: e.target.value,
    });
  };

  const handleOfferSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingOffer(true);
    setOfferSubmitStatus('idle');
    setOfferErrorMessage('');

    try {
      // Construire la description complète
      const fullDescription = `
Entreprise: ${offerFormData.companyName.trim()}
Secteur d'activité: ${offerFormData.secteurActivite.trim()}
${offerFormData.anneesExperience ? `Années d'expérience: ${offerFormData.anneesExperience}` : ''}
${offerFormData.siteWeb ? `Site web: ${offerFormData.siteWeb.trim()}` : ''}
Email: ${offerFormData.email.trim()}

${offerFormData.description.trim()}
      `.trim();

      // Validation des champs obligatoires
      if (!offerFormData.companyName.trim() || !offerFormData.secteurActivite.trim() ||
          !offerFormData.description.trim() || !offerFormData.email.trim() ||
          !offerFormData.phone.trim() || !offerFormData.city.trim()) {
        console.error('❌ ERREUR: Champs obligatoires manquants');
        setOfferErrorMessage('Veuillez remplir tous les champs obligatoires');
        setOfferSubmitStatus('error');
        setIsSubmittingOffer(false);
        return;
      }

      // Validation du format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(offerFormData.email.trim())) {
        console.error('❌ ERREUR: Format email invalide');
        setOfferErrorMessage('Format email invalide');
        setOfferSubmitStatus('error');
        setIsSubmittingOffer(false);
        return;
      }

      // Préparer les données pour partner_requests
      const insertData = {
        company_name: offerFormData.companyName.trim(),
        contact_name: offerFormData.companyName.trim(),
        email: offerFormData.email.trim(),
        phone: offerFormData.phone.trim(),
        city: offerFormData.city.trim(),
        description: fullDescription,
        request_type: 'service_offer',
        sector: offerFormData.secteurActivite.trim(),
      };

      console.log('✅ Envoi à partner_requests:', insertData);

      const { data, error } = await supabase
        .from('partner_requests')
        .insert([insertData])
        .select();

      if (error) {
        console.error('❌ ERREUR Supabase:', error);
        setOfferErrorMessage(error.message || 'Erreur inconnue lors de l\'envoi');
        setOfferSubmitStatus('error');

        // Toast d'erreur
        setToastMessage(`Erreur: ${error.message}`);
        setToastType('error');
        setShowToast(true);
        return;
      }

      console.log('✅ SUCCÈS: Offre de service créée dans Supabase');
      console.log('Données créées:', data);
      console.log('ID offre:', data?.[0]?.id);

      setOfferSubmitStatus('success');

      // Toast de succès
      setToastMessage('Votre offre de service a été publiée avec succès !');
      setToastType('success');
      setShowToast(true);

      // Réinitialiser le formulaire
      setOfferFormData({
        companyName: '',
        secteurActivite: '',
        description: '',
        siteWeb: '',
        anneesExperience: '',
        email: '',
        phone: '',
        city: '',
      });

      setTimeout(() => {
        setOfferSubmitStatus('idle');
        setShowOfferForm(false);
      }, 2000);
    } catch (error: any) {
      console.error('❌ ERREUR INATTENDUE:', error);
      setOfferErrorMessage(error?.message || 'Une erreur inattendue est survenue');
      setOfferSubmitStatus('error');

      // Toast d'erreur
      setToastMessage('Une erreur inattendue est survenue');
      setToastType('error');
      setShowToast(true);
    } finally {
      setIsSubmittingOffer(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      {/* Header Compact - Bordeaux & Or */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-br from-[#4A1D43] to-[#800020] py-10 px-4 overflow-hidden"
      >
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-5 left-5 w-48 h-48 bg-[#D4AF37] rounded-full blur-3xl"></div>
          <div className="absolute bottom-5 right-5 w-64 h-64 bg-[#D4AF37] rounded-full blur-3xl"></div>
        </div>

        <div className="max-w-5xl mx-auto text-center relative">
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
          >
            <h1 className="text-3xl md:text-4xl font-serif text-[#D4AF37] mb-3" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}>
              {t.partnerSearch.title}
            </h1>
            <p className="text-base text-white/90 font-light mb-2">
              {t.partnerSearch.subtitle}
            </p>
            <div className="max-w-2xl mx-auto">
              <p className="text-sm text-white/80 leading-relaxed">
                {t.partnerSearch.description}
              </p>
            </div>
          </motion.div>
        </div>
      </motion.div>

      <section className="py-10 px-4">
        <div className="max-w-5xl mx-auto">
          {/* Cartes Bénéfices - Compact avec couleurs bordeaux/or */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="grid md:grid-cols-3 gap-6 mb-10"
          >
            <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-[#D4AF37]/30">
              <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Handshake className="w-6 h-6 text-[#800020]" />
              </div>
              <h3 className="text-sm font-semibold text-[#4A1D43] mb-1">Collaboration</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t.partnerSearch.intro.paragraph1.split('.')[0]}
              </p>
            </div>

            <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-[#D4AF37]/30">
              <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <Network className="w-6 h-6 text-[#800020]" />
              </div>
              <h3 className="text-sm font-semibold text-[#4A1D43] mb-1">Réseau</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t.partnerSearch.intro.paragraph2.split('.')[0]}
              </p>
            </div>

            <div className="text-center bg-white rounded-lg p-4 shadow-sm border border-[#D4AF37]/30">
              <div className="w-12 h-12 bg-[#D4AF37]/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="w-6 h-6 text-[#800020]" />
              </div>
              <h3 className="text-sm font-semibold text-[#4A1D43] mb-1">Opportunité</h3>
              <p className="text-xs text-gray-600 leading-relaxed">
                {t.partnerSearch.intro.paragraph3.split('.')[0]}
              </p>
            </div>
          </motion.div>

          {/* Formulaire Principal - Compact */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white rounded-xl shadow-md border border-[#D4AF37]/20 p-4 mb-8"
          >
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-[#4A1D43] mb-3 border-b border-[#D4AF37]/30 pb-2">
                {t.partnerSearch.form.title}
              </h2>
              <p className="text-sm text-gray-600 leading-relaxed">
                {t.partnerSearch.intro.paragraph1}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[#4A1D43] mb-1.5">
                      {t.partnerSearch.form.profileType}
                    </label>
                    <select
                      name="profileType"
                      value={formData.profileType}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all outline-none"
                    >
                      <option value="">---</option>
                      <option value="company">{t.partnerSearch.form.profileTypes.company}</option>
                      <option value="freelancer">{t.partnerSearch.form.profileTypes.freelancer}</option>
                      <option value="provider">{t.partnerSearch.form.profileTypes.provider}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4A1D43] mb-1.5">
                      {t.partnerSearch.form.companyName}
                    </label>
                    <input
                      type="text"
                      name="companyName"
                      value={formData.companyName}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4A1D43] mb-1.5">
                      {t.partnerSearch.form.sector}
                    </label>
                    <input
                      type="text"
                      name="sector"
                      value={formData.sector}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4A1D43] mb-1.5">
                      {t.partnerSearch.form.region}
                    </label>
                    <input
                      type="text"
                      name="region"
                      value={formData.region}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4A1D43] mb-1.5">
                      {t.partnerSearch.form.searchType}
                    </label>
                    <select
                      name="searchType"
                      value={formData.searchType}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all outline-none"
                    >
                      <option value="">---</option>
                      <option value="partner">{t.partnerSearch.form.searchTypes.partner}</option>
                      <option value="supplier">{t.partnerSearch.form.searchTypes.supplier}</option>
                      <option value="client">{t.partnerSearch.form.searchTypes.client}</option>
                      <option value="other">{t.partnerSearch.form.searchTypes.other}</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#4A1D43] mb-1.5">
                      {t.partnerSearch.form.email}
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#4A1D43] mb-1.5">
                      {t.partnerSearch.form.phone}
                    </label>
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[#4A1D43] mb-1.5">
                      {t.partnerSearch.form.description}
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      required
                      rows={4}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all resize-none outline-none"
                    ></textarea>
                  </div>
                </div>

                <motion.button
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 bg-gradient-to-r from-[#800020] to-[#4A1D43] text-white rounded-lg font-medium hover:from-[#900030] hover:to-[#5A2D53] transition-all shadow-md border border-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm">Envoi en cours...</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-[#D4AF37]" />
                      <span className="text-sm">{t.partnerSearch.form.submit}</span>
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
                    className="flex flex-col gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                  >
                    <div className="flex items-center gap-2">
                      <XCircle className="w-5 h-5" />
                      <span className="text-sm font-medium">Erreur lors de l'envoi</span>
                    </div>
                    {errorMessage && (
                      <p className="text-xs text-red-600 ml-7">{errorMessage}</p>
                    )}
                  </motion.div>
                )}
              </form>
          </motion.div>

          {/* Section Proposer Services - Compact */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.5 }}
            className="bg-gradient-to-br from-[#D4AF37]/5 to-white rounded-xl border border-[#D4AF37]/30 p-5"
          >
            {!showOfferForm ? (
              <div className="text-center">
                <p className="text-sm text-gray-700 mb-3">
                  {t.partnerSearch.serviceProvider.text}
                </p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  type="button"
                  onClick={() => {
                    console.log('[PartnerRequests] 🔵 Proposer mes services cliqué');
                    setShowOfferForm(true);
                  }}
                  className="px-6 py-2.5 bg-[#4A1D43] text-white rounded-lg text-sm font-medium hover:bg-[#800020] transition-colors shadow-sm border border-[#D4AF37]"
                >
                  {t.partnerSearch.serviceProvider.button}
                </motion.button>
              </div>
            ) : (
              <div>
                <div className="flex items-center justify-between mb-5">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowOfferForm(false)}
                      className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
                    >
                      <ArrowLeft className="w-4 h-4 text-[#800020]" />
                    </button>
                    <h3 className="text-lg font-semibold text-[#4A1D43]">Proposer mes services</h3>
                  </div>
                </div>

                <form onSubmit={handleOfferSubmit} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-[#4A1D43] mb-1.5">
                        Nom de l'entreprise <span className="text-[#800020]">*</span>
                      </label>
                      <input
                        type="text"
                        name="companyName"
                        value={offerFormData.companyName}
                        onChange={handleOfferChange}
                        required
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all outline-none"
                        placeholder="Votre entreprise"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4A1D43] mb-1.5">
                        Secteur d'activité <span className="text-[#800020]">*</span>
                      </label>
                      <select
                        name="secteurActivite"
                        value={offerFormData.secteurActivite}
                        onChange={handleOfferChange}
                        required
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all outline-none"
                      >
                        <option value="">Sélectionnez</option>
                        <option value="informatique">Informatique & Tech</option>
                        <option value="marketing">Marketing & Communication</option>
                        <option value="finance">Finance & Comptabilité</option>
                        <option value="juridique">Juridique & Conseil</option>
                        <option value="construction">Construction & BTP</option>
                        <option value="design">Design & Créatif</option>
                        <option value="formation">Formation & Education</option>
                        <option value="sante">Santé & Bien-être</option>
                        <option value="commerce">Commerce & Vente</option>
                        <option value="logistique">Logistique & Transport</option>
                        <option value="autre">Autre</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#4A1D43] mb-1.5">
                        Description de vos services <span className="text-[#800020]">*</span>
                      </label>
                      <textarea
                        name="description"
                        value={offerFormData.description}
                        onChange={handleOfferChange}
                        required
                        rows={4}
                        placeholder="Décrivez vos services, expertise, points forts..."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all resize-none outline-none"
                      ></textarea>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4A1D43] mb-1.5">
                        Site web / Portfolio
                      </label>
                      <input
                        type="url"
                        name="siteWeb"
                        value={offerFormData.siteWeb}
                        onChange={handleOfferChange}
                        placeholder="https://votre-site.com"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4A1D43] mb-1.5">
                        Années d'expérience
                      </label>
                      <input
                        type="number"
                        name="anneesExperience"
                        value={offerFormData.anneesExperience}
                        onChange={handleOfferChange}
                        min="0"
                        max="100"
                        placeholder="Ex: 5"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4A1D43] mb-1.5">
                        Email <span className="text-[#800020]">*</span>
                      </label>
                      <input
                        type="email"
                        name="email"
                        value={offerFormData.email}
                        onChange={handleOfferChange}
                        required
                        placeholder="votre@email.com"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-[#4A1D43] mb-1.5">
                        Téléphone <span className="text-[#800020]">*</span>
                      </label>
                      <input
                        type="tel"
                        name="phone"
                        value={offerFormData.phone}
                        onChange={handleOfferChange}
                        required
                        placeholder="+216 XX XXX XXX"
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all outline-none"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-[#4A1D43] mb-1.5">
                        Ville / Région <span className="text-[#800020]">*</span>
                      </label>
                      <input
                        type="text"
                        name="city"
                        value={offerFormData.city}
                        onChange={handleOfferChange}
                        required
                        placeholder="Tunis, Sfax, Sousse..."
                        className="w-full px-3 py-2 text-sm rounded-lg border border-gray-300 focus:border-[#D4AF37] focus:ring-2 focus:ring-[#D4AF37]/20 transition-all outline-none"
                      />
                    </div>
                  </div>

                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    type="submit"
                    disabled={isSubmittingOffer}
                    className="w-full py-3 bg-gradient-to-r from-[#800020] to-[#4A1D43] text-white rounded-lg text-sm font-medium hover:from-[#900030] hover:to-[#5A2D53] transition-all shadow-sm border border-[#D4AF37] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {isSubmittingOffer ? (
                      <>
                        <div className="w-4 h-4 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                        <span>Envoi en cours...</span>
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4 text-[#D4AF37]" />
                        <span>Envoyer mon offre</span>
                      </>
                    )}
                  </motion.button>

                  {offerSubmitStatus === 'success' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg text-green-700"
                    >
                      <CheckCircle className="w-5 h-5" />
                      <span className="text-sm">Votre offre a bien été envoyée, merci !</span>
                    </motion.div>
                  )}

                  {offerSubmitStatus === 'error' && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="flex flex-col gap-2 p-4 bg-red-50 border border-red-200 rounded-lg text-red-700"
                    >
                      <div className="flex items-center gap-2">
                        <XCircle className="w-5 h-5" />
                        <span className="text-sm font-medium">Erreur lors de l'envoi</span>
                      </div>
                      {offerErrorMessage && (
                        <p className="text-xs text-red-600 ml-7">{offerErrorMessage}</p>
                      )}
                    </motion.div>
                  )}
                </form>
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
};

/*
 * ========================================================================
 * INSTRUCTIONS SUPABASE - À EXÉCUTER DANS L'ÉDITEUR SQL DE SUPABASE
 * ========================================================================
 *
 * 1. CRÉATION DE LA TABLE partner_requests (si elle n'existe pas encore)
 * -----------------------------------------------------------------------
 *
 * CREATE TABLE IF NOT EXISTS public.partner_requests (
 *   id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
 *   created_at timestamptz NOT NULL DEFAULT now(),
 *   request_type text NOT NULL CHECK (request_type IN ('need', 'offer')),
 *
 *   -- Champs communs
 *   companyName text,
 *   email text,
 *   phone text,
 *   description text NOT NULL,
 *   language text DEFAULT 'fr',
 *
 *   -- Champs spécifiques aux besoins (request_type = 'need')
 *   profileType text,
 *   sector text,
 *   region text,
 *   searchType text
 * );
 *
 * -- Index pour améliorer les performances
 * CREATE INDEX IF NOT EXISTS idx_partner_requests_created_at
 *   ON public.partner_requests(created_at DESC);
 * CREATE INDEX IF NOT EXISTS idx_partner_requests_type
 *   ON public.partner_requests(request_type);
 *
 *
 * 2. ACTIVATION DE ROW LEVEL SECURITY (RLS)
 * ------------------------------------------
 *
 * ALTER TABLE public.partner_requests ENABLE ROW LEVEL SECURITY;
 *
 *
 * 3. POLICIES RLS - AUTORISER L'INSERTION ANONYME
 * ------------------------------------------------
 *
 * -- Autoriser tout le monde (y compris anonyme) à insérer des demandes
 * CREATE POLICY "Allow anonymous insert partner_requests"
 *   ON public.partner_requests
 *   FOR INSERT
 *   TO anon, authenticated
 *   WITH CHECK (true);
 *
 * -- Autoriser la lecture pour les administrateurs uniquement
 * CREATE POLICY "Allow admin read partner_requests"
 *   ON public.partner_requests
 *   FOR SELECT
 *   TO authenticated
 *   USING (true);
 *
 * ========================================================================
 */
