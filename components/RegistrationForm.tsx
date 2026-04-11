import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Toast } from './Toast';

interface RegistrationFormProps {
  onClose: () => void;
  selectedPlan?: string;
}

export const RegistrationForm = ({ onClose, selectedPlan }: RegistrationFormProps) => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const [formData, setFormData] = useState({
    companyName: '',
    legalForm: '',
    registrationNumber: '',
    street: '',
    city: '',
    postalCode: '',
    governorate: '',
    phone: '',
    email: '',
    website: '',
    sector: '',
    companyDescription: '',
    contactName: '',
    contactPosition: '',
    contactPhone: '',
    contactEmail: '',
    videoUrl: '',
    facebookUrl: '',
    instagramUrl: '',
    linkedinUrl: '',
    tiktokUrl: '',
    youtubeUrl: '',
    subscriptionPlan: selectedPlan || 'Premium',
    subscriptionDuration: 'annual',
    consent: false,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Validation du format email societe
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(formData.email)) {
        setToastMessage('Une erreur est survenue. Veuillez réessayer.');
        setToastType('error');
        setShowToast(true);
        setLoading(false);
        return;
      }

      // Préparer les données pour la table suggestions_entreprises avec tous les nouveaux champs
      const suggestionData = {
        nom_entreprise: formData.companyName.trim(),
        secteur: formData.sector.trim(),
        ville: formData.city.trim(),
        contact_suggere: `Tel: ${formData.phone} | Contact: ${formData.contactName} (${formData.contactPosition}) - ${formData.contactPhone}`,
        email_suggesteur: formData.email.trim().toLowerCase(),
        raison_suggestion: `Demande d'inscription entreprise

INFORMATIONS DÉTAILLÉES:
- Forme juridique: ${formData.legalForm}
- Registre commerce: ${formData.registrationNumber}
- Adresse: ${formData.street}, ${formData.city} ${formData.postalCode}, ${formData.governorate}
- Email contact: ${formData.contactEmail}
${formData.website ? `- Site web: ${formData.website}` : ''}
- Plan abonnement: ${formData.subscriptionPlan} (${formData.subscriptionDuration === 'annual' ? 'Annuel' : 'Mensuel'})
- Description: ${formData.companyDescription}

PRÉSENCE DIGITALE:
${formData.videoUrl ? `- Vidéo: ${formData.videoUrl}` : ''}
${formData.facebookUrl ? `- Facebook: ${formData.facebookUrl}` : ''}
${formData.instagramUrl ? `- Instagram: ${formData.instagramUrl}` : ''}
${formData.linkedinUrl ? `- LinkedIn: ${formData.linkedinUrl}` : ''}
${formData.tiktokUrl ? `- TikTok: ${formData.tiktokUrl}` : ''}
${formData.youtubeUrl ? `- YouTube: ${formData.youtubeUrl}` : ''}`,
        type_demande: 'inscription',
        video_url: formData.videoUrl || null,
        pack_type: formData.subscriptionPlan || null,
        facebook_url: formData.facebookUrl || null,
        instagram_url: formData.instagramUrl || null,
        linkedin_url: formData.linkedinUrl || null,
        tiktok_url: formData.tiktokUrl || null,
        youtube_url: formData.youtubeUrl || null,
      };

      // Validation des champs obligatoires
      if (!suggestionData.nom_entreprise || !suggestionData.secteur) {
        setToastMessage('Une erreur est survenue. Veuillez réessayer.');
        setToastType('error');
        setShowToast(true);
        setLoading(false);
        return;
      }

      // Envoyer à Supabase - Table suggestions_entreprises
      const { data, error } = await supabase
        .from('suggestions_entreprises')
        .insert([suggestionData])
        .select();

      if (error) {
        setToastMessage('Une erreur est survenue. Veuillez réessayer.');
        setToastType('error');
        setShowToast(true);
        setLoading(false);
        return;
      }

      // Afficher Toast de succès
      setToastMessage('Demande envoyée avec succès ! Merci de votre contribution.');
      setToastType('success');
      setShowToast(true);

      // Réinitialiser le formulaire
      setFormData({
        companyName: '',
        legalForm: '',
        registrationNumber: '',
        street: '',
        city: '',
        postalCode: '',
        governorate: '',
        phone: '',
        email: '',
        website: '',
        sector: '',
        companyDescription: '',
        contactName: '',
        contactPosition: '',
        contactPhone: '',
        contactEmail: '',
        videoUrl: '',
        facebookUrl: '',
        instagramUrl: '',
        linkedinUrl: '',
        tiktokUrl: '',
        youtubeUrl: '',
        subscriptionPlan: 'Premium',
        subscriptionDuration: 'annual',
        consent: false,
      });

      setLoading(false);
      setSubmitted(true);

      // Fermer le formulaire après 2 secondes
      setTimeout(() => {
        onClose();
      }, 2000);

      // Envoyer un email de notification (optionnel, en arrière-plan)
      setTimeout(() => {
        const isPremium = formData.subscriptionPlan === 'Premium' || formData.subscriptionPlan === 'Enterprise';
        const emailBody = `
NOUVELLE DEMANDE D'INSCRIPTION ENTREPRISE - DALIL TOUNES

ID Demande: ${data?.[0]?.id}
Statut: Nouvelle (À traiter)

=== INFORMATIONS ENTREPRISE ===
Nom société: ${formData.companyName}
Forme juridique: ${formData.legalForm}
N° Registre commerce: ${formData.registrationNumber}
Adresse rue: ${formData.street}
Ville: ${formData.city}
Code postal: ${formData.postalCode}
Gouvernorat: ${formData.governorate}
Téléphone: ${formData.phone}
Email société: ${formData.email}
Site web: ${formData.website || 'Non renseigné'}
Secteur activité: ${formData.sector}

=== CONTACT PRINCIPAL ===
Nom contact: ${formData.contactName}
Fonction contact: ${formData.contactPosition}
Téléphone contact: ${formData.contactPhone}
Email professionnel: ${formData.contactEmail}

=== ABONNEMENT DEMANDÉ ===
Formule: ${formData.subscriptionPlan}
Durée: ${formData.subscriptionDuration === 'annual' ? 'Annuel' : 'Mensuel'}
Premium: ${isPremium ? 'Oui' : 'Non'}

Consentement aux CGU: Oui

Les données ont été enregistrées dans Supabase.
        `.trim();

        const mailtoLink = `mailto:contact@dalil-tounes.com?subject=Nouvelle inscription - ${formData.companyName}&body=${encodeURIComponent(emailBody)}`;
        window.location.href = mailtoLink;
      }, 100);
    } catch (err) {
      setToastMessage('Une erreur est survenue. Veuillez réessayer.');
      setToastType('error');
      setShowToast(true);
      setLoading(false);
    }
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Demande envoyée avec succès ! Merci de votre contribution.
          </h3>
          <button
            onClick={onClose}
            className="mt-6 px-6 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 transition-colors"
          >
            {t.common.close}
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Toast
        message={toastMessage}
        type={toastType}
        isVisible={showToast}
        onClose={() => setShowToast(false)}
      />

      <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-3xl w-full my-8 max-h-[90vh] flex flex-col overflow-hidden">
        <div className="bg-white border-b border-gray-200 px-5 py-3 flex items-center justify-between rounded-t-lg flex-shrink-0">
          <h2 className="text-xl font-semibold text-gray-900">{t.subscription.form.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          <div>
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{t.subscription.form.companyInfo}</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.companyName} *
                </label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.legalForm} *
                </label>
                <select
                  name="legalForm"
                  required
                  value={formData.legalForm}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                >
                  <option value="">Sélectionner</option>
                  {Object.entries(t.subscription.form.legalForms).map(([key, value]) => (
                    <option key={key} value={value}>{value}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.registrationNumber} *
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  required
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.street} *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.city} *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.postalCode} *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.governorate} *
                </label>
                <input
                  type="text"
                  name="governorate"
                  required
                  value={formData.governorate}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.phone} *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.email} *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.website}
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.sector} *
                </label>
                <select
                  name="sector"
                  required
                  value={formData.sector}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                >
                  <option value="">Sélectionner</option>
                  {Object.entries(t.subscription.form.sectors).map(([key, value]) => (
                    <option key={key} value={value}>{value}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.companyDescription} *
                </label>
                <textarea
                  name="companyDescription"
                  required
                  rows={4}
                  value={formData.companyDescription}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{t.subscription.form.contactInfo}</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-2">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.contactName} *
                </label>
                <input
                  type="text"
                  name="contactName"
                  required
                  value={formData.contactName}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.contactPosition} *
                </label>
                <input
                  type="text"
                  name="contactPosition"
                  required
                  value={formData.contactPosition}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.contactPhone} *
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  required
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.contactEmail} *
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  required
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{t.subscription.form.digitalPresence}</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-2">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.videoUrl}
                </label>
                <input
                  type="url"
                  name="videoUrl"
                  value={formData.videoUrl}
                  onChange={handleChange}
                  placeholder={t.subscription.form.videoUrlPlaceholder}
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-700 mb-3">{t.subscription.form.socialNetworks}</p>
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.facebookUrl}
                </label>
                <input
                  type="url"
                  name="facebookUrl"
                  value={formData.facebookUrl}
                  onChange={handleChange}
                  placeholder="https://facebook.com/..."
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.instagramUrl}
                </label>
                <input
                  type="url"
                  name="instagramUrl"
                  value={formData.instagramUrl}
                  onChange={handleChange}
                  placeholder="https://instagram.com/..."
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.linkedinUrl}
                </label>
                <input
                  type="url"
                  name="linkedinUrl"
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/..."
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.tiktokUrl}
                </label>
                <input
                  type="url"
                  name="tiktokUrl"
                  value={formData.tiktokUrl}
                  onChange={handleChange}
                  placeholder="https://tiktok.com/@..."
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-gray-700 mb-0.5">
                  {t.subscription.form.youtubeUrl}
                </label>
                <input
                  type="url"
                  name="youtubeUrl"
                  value={formData.youtubeUrl}
                  onChange={handleChange}
                  placeholder="https://youtube.com/..."
                  className="w-full px-3 py-1.5 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="mb-2">
              <h3 className="text-lg font-semibold text-gray-900">{t.subscription.form.subscriptionChoice}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formule d'abonnement *
                </label>
                <div className="grid md:grid-cols-4 gap-3">
                  {['Découverte', 'Artisan', 'Premium', 'Elite Pro'].map((plan) => (
                    <label
                      key={plan}
                      className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                        formData.subscriptionPlan === plan
                          ? 'border-orange-600 bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <input
                        type="radio"
                        name="subscriptionPlan"
                        value={plan}
                        checked={formData.subscriptionPlan === plan}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="font-medium text-gray-900">{plan}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {t.subscription.form.subscriptionDuration} *
                </label>
                <div className="grid md:grid-cols-2 gap-2">
                  <label
                    className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.subscriptionDuration === 'monthly'
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="subscriptionDuration"
                      value="monthly"
                      checked={formData.subscriptionDuration === 'monthly'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <span className="font-medium text-gray-900">{t.subscription.form.monthly}</span>
                  </label>
                  <label
                    className={`relative flex items-center justify-center p-4 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.subscriptionDuration === 'annual'
                        ? 'border-orange-600 bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="subscriptionDuration"
                      value="annual"
                      checked={formData.subscriptionDuration === 'annual'}
                      onChange={handleChange}
                      className="sr-only"
                    />
                    <div className="text-center">
                      <span className="font-medium text-gray-900">{t.subscription.form.annual}</span>
                      <span className="block text-xs text-green-600 font-medium mt-1">+ 6 mois offerts</span>
                    </div>
                  </label>
                </div>
              </div>

              {formData.subscriptionPlan && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-2">
                  <p className="text-xs text-blue-700">
                    {formData.subscriptionPlan === 'Découverte' && t.subscription.form.photosLimitDecouverte}
                    {formData.subscriptionPlan === 'Artisan' && t.subscription.form.photosLimitArtisan}
                    {formData.subscriptionPlan === 'Premium' && t.subscription.form.photosLimitPremium}
                    {formData.subscriptionPlan === 'Elite Pro' && t.subscription.form.photosLimitElite}
                  </p>
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-gray-200 pt-3">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                name="consent"
                required
                checked={formData.consent}
                onChange={handleChange}
                className="mt-1 w-4 h-4 text-orange-600 border-gray-300 rounded focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">
                {t.subscription.form.consent}{' '}
                <a href="#" className="text-orange-600 hover:underline">
                  {t.subscription.form.termsLink}
                </a>{' '}
                et{' '}
                <a href="#" className="text-orange-600 hover:underline">
                  {t.subscription.form.privacyLink}
                </a>
              </span>
            </label>
          </div>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-md font-medium hover:bg-gray-50 transition-colors"
            >
              {t.common.cancel}
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-2.5 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
            >
              {loading ? t.common.loading : t.subscription.form.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
    </>
  );
};
