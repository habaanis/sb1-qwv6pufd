import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, ArrowLeft, Building2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { Toast } from './Toast';
import { useFormTranslation } from '../hooks/useFormTranslation';
import { useCategoryTranslation } from '../hooks/useCategoryTranslation';

interface SuggestionEntrepriseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SuggestionEntrepriseModal = ({ isOpen, onClose }: SuggestionEntrepriseModalProps) => {
  const { label, placeholder, button, message, submission_lang } = useFormTranslation();
  const { getCategory } = useCategoryTranslation();

  const [formData, setFormData] = useState({
    nomEntreprise: '',
    secteur: '',
    ville: '',
    contactSuggere: '',
    emailSuggesteur: '',
    raisonSuggestion: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Préparer les données pour Supabase - STRICTE CORRESPONDANCE avec les colonnes
      // Note: statut a une valeur par défaut 'en_attente', pas besoin de l'envoyer
      const suggestionData = {
        nom_entreprise: formData.nomEntreprise.trim(),
        secteur: formData.secteur.trim(),
        ville: formData.ville.trim() || null,
        contact_suggere: formData.contactSuggere.trim() || null,
        email_suggesteur: formData.emailSuggesteur.trim() || null,
        raison_suggestion: formData.raisonSuggestion.trim() || null,
        type_demande: 'suggestion',
      };

      // Ajouter submission_lang
      suggestionData.submission_lang = submission_lang;

      // Validation des champs obligatoires
      if (!suggestionData.nom_entreprise || !suggestionData.secteur) {
        setToastMessage(message('erreur'));
        setToastType('error');
        setShowToast(true);
        setIsSubmitting(false);
        return;
      }

      // Validation de l'email si présent
      if (suggestionData.email_suggesteur) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(suggestionData.email_suggesteur)) {
          setToastMessage(message('email_invalide'));
          setToastType('error');
          setShowToast(true);
          setIsSubmitting(false);
          return;
        }
      }

      const { data, error } = await supabase
        .from('suggestions_entreprises')
        .insert([suggestionData])
        .select();

      if (error) {
        setToastMessage(message('erreur'));
        setToastType('error');
        setShowToast(true);
        setIsSubmitting(false);
        return;
      }

      // Toast de succès
      setToastMessage(message('succes'));
      setToastType('success');
      setShowToast(true);

      // Réinitialiser le formulaire
      setFormData({
        nomEntreprise: '',
        secteur: '',
        ville: '',
        contactSuggere: '',
        emailSuggesteur: '',
        raisonSuggestion: '',
      });

      // Fermer la modal après 2 secondes
      setTimeout(() => {
        onClose();
      }, 2000);
    } catch (error: any) {
      setToastMessage(message('erreur'));
      setToastType('error');
      setShowToast(true);
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Toast
            message={toastMessage}
            type={toastType}
            isVisible={showToast}
            onClose={() => setShowToast(false)}
          />

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
            onClick={onClose}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', duration: 0.5 }}
              className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                    <Building2 className="w-5 h-5 text-orange-600" />
                  </div>
                  <h2 className="text-xl font-semibold text-gray-900">{label('nom_entreprise')}</h2>
                </div>
                <button
                  onClick={onClose}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-6">
                <p className="text-sm text-gray-600 mb-4">
                  {label('description')}
                </p>

                <div className="bg-orange-50 border-l-4 border-orange-500 p-4 mb-6">
                  <p className="text-sm font-medium text-orange-800">
                    {label('description')}
                  </p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label('nom')} <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="nomEntreprise"
                        value={formData.nomEntreprise}
                        onChange={handleChange}
                        required
                        placeholder={placeholder('nom')}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        {label('categorie')} <span className="text-red-500">*</span>
                      </label>
                      <select
                        name="secteur"
                        value={formData.secteur}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all outline-none"
                      >
                        <option value="">{placeholder('categorie')}</option>
                        <option value="restauration">{getCategory('restaurant')}</option>
                        <option value="commerce">{getCategory('pret_a_porter')}</option>
                        <option value="services">{getCategory('services_aux_entreprises')}</option>
                        <option value="sante">{getCategory('centre_medical')}</option>
                        <option value="education">{getCategory('ecole_privee')}</option>
                        <option value="immobilier">{getCategory('services_aux_entreprises')}</option>
                        <option value="construction">{getCategory('btp_construction')}</option>
                        <option value="technologie">{getCategory('informatique_telecom')}</option>
                        <option value="tourisme">{getCategory('autre_activite_pro')}</option>
                        <option value="transport">{getCategory('transport_logistique')}</option>
                        <option value="autre">{getCategory('autre_activite_pro')}</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label('ville')}
                    </label>
                    <input
                      type="text"
                      name="ville"
                      value={formData.ville}
                      onChange={handleChange}
                      placeholder={placeholder('ville')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label('telephone')}
                    </label>
                    <input
                      type="text"
                      name="contactSuggere"
                      value={formData.contactSuggere}
                      onChange={handleChange}
                      placeholder={placeholder('telephone')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label('email')}
                    </label>
                    <input
                      type="email"
                      name="emailSuggesteur"
                      value={formData.emailSuggesteur}
                      onChange={handleChange}
                      placeholder={placeholder('email')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      {label('description')}
                    </label>
                    <textarea
                      name="raisonSuggestion"
                      value={formData.raisonSuggestion}
                      onChange={handleChange}
                      rows={3}
                      placeholder={placeholder('description')}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-orange-400 focus:ring-4 focus:ring-orange-100 transition-all resize-none outline-none"
                    ></textarea>
                  </div>

                  <div className="flex gap-3 pt-4">
                    <button
                      type="button"
                      onClick={onClose}
                      className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-colors"
                    >
                      {button('annuler')}
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="submit"
                      disabled={isSubmitting}
                      className="flex-1 px-6 py-3 bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl font-medium hover:from-orange-700 hover:to-red-700 transition-all shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>{button('envoyer')}</span>
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4" />
                          <span>{button('envoyer')}</span>
                        </>
                      )}
                    </motion.button>
                  </div>
                </form>
              </div>
            </motion.div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
