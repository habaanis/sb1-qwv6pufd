import { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { Building2, User, CreditCard, CheckCircle2, X } from 'lucide-react';

interface RegistrationFormProps {
  onClose: () => void;
}

export const RegistrationForm = ({ onClose }: RegistrationFormProps) => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

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
    subscriptionPlan: 'Premium',
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

    const emailBody = `
NOUVELLE INSCRIPTION ENTREPRISE - DALIL TOUNES

=== INFORMATIONS SUR L'ENTREPRISE ===
Nom: ${formData.companyName}
Forme juridique: ${formData.legalForm}
N° Registre de commerce: ${formData.registrationNumber}
Adresse: ${formData.street}, ${formData.city} ${formData.postalCode}, ${formData.governorate}
Téléphone: ${formData.phone}
Email: ${formData.email}
Site web: ${formData.website || 'Non renseigné'}
Secteur d'activité: ${formData.sector}
Description: ${formData.companyDescription}

=== CONTACT PRINCIPAL ===
Nom: ${formData.contactName}
Fonction: ${formData.contactPosition}
Téléphone direct: ${formData.contactPhone}
Email professionnel: ${formData.contactEmail}

=== ABONNEMENT ===
Formule choisie: ${formData.subscriptionPlan}
Durée: ${formData.subscriptionDuration === 'annual' ? 'Annuel' : 'Mensuel'}

Consentement aux CGU: Oui
    `.trim();

    const mailtoLink = `mailto:contact@dalil-tounes.com?subject=Nouvelle inscription - ${formData.companyName}&body=${encodeURIComponent(emailBody)}`;

    window.location.href = mailtoLink;

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 1000);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-md w-full p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {t.subscription.form.success}
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
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-lg max-w-4xl w-full my-8">
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-lg">
          <h2 className="text-2xl font-semibold text-gray-900">{t.subscription.form.title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Building2 className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">{t.subscription.form.companyInfo}</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.subscription.form.companyName} *
                </label>
                <input
                  type="text"
                  name="companyName"
                  required
                  value={formData.companyName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.subscription.form.legalForm} *
                </label>
                <select
                  name="legalForm"
                  required
                  value={formData.legalForm}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  {Object.entries(t.subscription.form.legalForms).map(([key, value]) => (
                    <option key={key} value={value}>{value}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.subscription.form.registrationNumber} *
                </label>
                <input
                  type="text"
                  name="registrationNumber"
                  required
                  value={formData.registrationNumber}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.subscription.form.street} *
                </label>
                <input
                  type="text"
                  name="street"
                  required
                  value={formData.street}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.subscription.form.city} *
                </label>
                <input
                  type="text"
                  name="city"
                  required
                  value={formData.city}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.subscription.form.postalCode} *
                </label>
                <input
                  type="text"
                  name="postalCode"
                  required
                  value={formData.postalCode}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.subscription.form.governorate} *
                </label>
                <input
                  type="text"
                  name="governorate"
                  required
                  value={formData.governorate}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.subscription.form.phone} *
                </label>
                <input
                  type="tel"
                  name="phone"
                  required
                  value={formData.phone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.subscription.form.email} *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.subscription.form.website}
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.subscription.form.sector} *
                </label>
                <select
                  name="sector"
                  required
                  value={formData.sector}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                >
                  <option value="">Sélectionner</option>
                  {Object.entries(t.subscription.form.sectors).map(([key, value]) => (
                    <option key={key} value={value}>{value}</option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.subscription.form.companyDescription} *
                </label>
                <textarea
                  name="companyDescription"
                  required
                  rows={4}
                  value={formData.companyDescription}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <User className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">{t.subscription.form.contactInfo}</h3>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.subscription.form.contactName} *
                </label>
                <input
                  type="text"
                  name="contactName"
                  required
                  value={formData.contactName}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.subscription.form.contactPosition} *
                </label>
                <input
                  type="text"
                  name="contactPosition"
                  required
                  value={formData.contactPosition}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.subscription.form.contactPhone} *
                </label>
                <input
                  type="tel"
                  name="contactPhone"
                  required
                  value={formData.contactPhone}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t.subscription.form.contactEmail} *
                </label>
                <input
                  type="email"
                  name="contactEmail"
                  required
                  value={formData.contactEmail}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <CreditCard className="w-5 h-5 text-orange-600" />
              <h3 className="text-lg font-semibold text-gray-900">{t.subscription.form.subscriptionChoice}</h3>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Formule d'abonnement *
                </label>
                <div className="grid md:grid-cols-3 gap-3">
                  {['Basique', 'Premium', 'Enterprise'].map((plan) => (
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
                <div className="grid md:grid-cols-2 gap-3">
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
            </div>
          </div>

          <div className="border-t border-gray-200 pt-6">
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
              className="flex-1 px-6 py-3 bg-orange-600 text-white rounded-md font-medium hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? t.common.loading : t.subscription.form.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
