import { useState } from 'react';
import { motion } from 'framer-motion';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { Calendar, ArrowLeft } from 'lucide-react';
import { supabase } from '../lib/BoltDatabase';
import { useFormTranslation } from '../hooks/useFormTranslation';

const SECTEURS_OPTIONS = [
  { value: 'education', label: 'Événement scolaire / éducatif' },
  { value: 'Loisirs & Événements', label: 'Événement loisir / sortie' },
  { value: 'entreprise', label: 'Événement professionnel / entreprise' },
] as const;

export const EducationEventForm = () => {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const { label, placeholder, button, message, submission_lang } = useFormTranslation();
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState(false);

  const [formData, setFormData] = useState({
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
    secteur_evenement: 'education' as 'education' | 'Loisirs & Événements' | 'entreprise',
    instagram_url: '',
    facebook_url: '',
    linkedin_url: '',
    x_url: '',
    youtube_url: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitSuccess(false);
    setSubmitError(false);

    try {
      const payload = {
        event_name: formData.event_name,
        event_date: formData.event_date || null,
        end_date: formData.end_date || null,
        location: formData.location,
        city: formData.city,
        short_description: formData.short_description,
        organizer: formData.organizer || null,
        registration_url: formData.registration_url || null,
        image_url: formData.image_url || null,
        event_period_label: formData.event_period_label || null,
        secteur_evenement: formData.secteur_evenement,
        instagram_url: formData.instagram_url || null,
        facebook_url: formData.facebook_url || null,
        linkedin_url: formData.linkedin_url || null,
        x_url: formData.x_url || null,
        youtube_url: formData.youtube_url || null,
        submission_lang,
      };

      const { error: insertError } = await supabase
        .from('featured_events')
        .insert([payload]);

      if (insertError) {
        console.warn('⚠️ Cannot submit event:', insertError.message);
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
        secteur_evenement: 'education',
        instagram_url: '',
        facebook_url: '',
        linkedin_url: '',
        x_url: '',
        youtube_url: '',
      });

      // Redirection vers la page Éducation après 1.5 secondes
      setTimeout(() => {
        window.location.hash = '#/education';
      }, 1500);
    } catch (err) {
      console.error('Error submitting event:', err);
      setSubmitError(true);
      setTimeout(() => setSubmitError(false), 5000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-12 px-4">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ y: 30, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
        >
          <button
            onClick={() => window.history.back()}
            className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour
          </button>

          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mb-4">
              <Calendar className="w-8 h-8 text-blue-600" />
            </div>
            <h1 className="text-3xl font-light text-gray-900 mb-3">
              Proposer un événement scolaire
            </h1>
            <p className="text-gray-600">
              Remplissez le formulaire ci-dessous pour soumettre votre événement éducatif.
              Après validation, il apparaîtra dans la rubrique Événements de Dalil Tounes.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-8 shadow-lg space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nom de l'événement *
                </label>
                <input
                  type="text"
                  required
                  value={formData.event_name}
                  onChange={(e) => setFormData({ ...formData, event_name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Journée portes ouvertes"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date de début
                  <span className="block text-xs text-gray-500">
                    (facultatif – si la date est connue)
                  </span>
                </label>
                <input
                  type="date"
                  value={formData.event_date}
                  onChange={(e) => setFormData({ ...formData, event_date: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ville *
                </label>
                <input
                  type="text"
                  required
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Tunis"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lieu *
                </label>
                <input
                  type="text"
                  required
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: École Primaire Carthage"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Date de fin (optionnel)
              </label>
              <input
                type="date"
                value={formData.end_date}
                onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

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
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex : Année scolaire 2026/2027"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                  Organisateur
                </label>
                <input
                  type="text"
                  value={formData.organizer}
                  onChange={(e) => setFormData({ ...formData, organizer: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ex: Lycée Bourguiba"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description *
              </label>
              <textarea
                required
                rows={4}
                value={formData.short_description}
                onChange={(e) => setFormData({ ...formData, short_description: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Décrivez votre événement..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Site web / Lien d'inscription
              </label>
              <input
                type="url"
                value={formData.registration_url}
                onChange={(e) => setFormData({ ...formData, registration_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL de l'image (optionnel)
              </label>
              <input
                type="url"
                value={formData.image_url}
                onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="https://..."
              />
              <p className="mt-2 text-xs text-amber-600 bg-amber-50 border border-amber-200 rounded-md px-3 py-2">
                ⚠️ Merci d'utiliser des images importées directement (hébergées sur votre site ou un service d'hébergement d'images) au lieu de liens Facebook pour éviter les erreurs d'affichage.
              </p>
            </div>

            <div className="border-t pt-6">
              <h3 className="text-sm font-medium text-gray-900 mb-4">Réseaux sociaux (optionnel)</h3>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Instagram
                  </label>
                  <input
                    type="url"
                    value={formData.instagram_url}
                    onChange={(e) => setFormData({ ...formData, instagram_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://facebook.com/..."
                  />
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mt-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    LinkedIn
                  </label>
                  <input
                    type="url"
                    value={formData.linkedin_url}
                    onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="https://x.com/..."
                  />
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lien YouTube
                </label>
                <input
                  type="url"
                  value={formData.youtube_url}
                  onChange={(e) => setFormData({ ...formData, youtube_url: e.target.value })}
                  placeholder="https://youtube.com/..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>

            {submitSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg"
              >
                Événement soumis avec succès ! Il sera visible après validation.
              </motion.div>
            )}

            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg"
              >
                Une erreur est survenue lors de la soumission. Veuillez réessayer.
              </motion.div>
            )}

            <button
              type="submit"
              className="w-full px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
            >
              Soumettre l'événement
            </button>
          </form>
        </motion.div>
      </div>
    </div>
  );
};

export default EducationEventForm;
