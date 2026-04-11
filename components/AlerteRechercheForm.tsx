import { useState } from 'react';
import { Bell, Mail, MapPin, Tag, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/BoltDatabase';
import CityAutocomplete from './CityAutocomplete';

export default function AlerteRechercheForm() {
  const [formData, setFormData] = useState({
    user_email: '',
    mot_cle: '',
    ville: '',
    categorie: '',
    type_annonce: ''
  });
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastType, setToastType] = useState<'success' | 'error'>('success');
  const [toastMessage, setToastMessage] = useState('');

  const categories = [
    'Véhicules',
    'Maison & Jardin',
    'Électronique',
    'Immobilier',
    'Sport & Loisirs',
    'Vêtements',
    'Services'
  ];

  const showToastMessage = (type: 'success' | 'error', message: string) => {
    setToastType(type);
    setToastMessage(message);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!formData.user_email) {
      showToastMessage('error', 'Veuillez entrer votre email');
      return;
    }

    if (!formData.mot_cle && !formData.ville && !formData.categorie) {
      showToastMessage('error', 'Veuillez renseigner au moins un critère de recherche');
      return;
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.user_email)) {
      showToastMessage('error', 'Email invalide');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase
        .from('alertes_recherche')
        .insert([{
          user_email: formData.user_email,
          mot_cle: formData.mot_cle || null,
          ville: formData.ville || null,
          categorie: formData.categorie || null,
          type_annonce: formData.type_annonce || null,
          actif: true
        }]);

      if (error) throw error;

      showToastMessage('success', 'Alerte créée avec succès ! Vous serez notifié par email.');

      // Reset form
      setFormData({
        user_email: '',
        mot_cle: '',
        ville: '',
        categorie: '',
        type_annonce: ''
      });
    } catch (error: any) {
      console.error('Erreur création alerte:', error);
      showToastMessage('error', 'Une erreur est survenue. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 shadow-xl border-2 border-blue-200 mb-8">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
            <Bell className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Créer une alerte</h2>
            <p className="text-sm text-gray-600">Soyez notifié des nouvelles annonces qui vous intéressent</p>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Mail className="w-4 h-4 inline mr-1" />
                Email *
              </label>
              <input
                type="email"
                value={formData.user_email}
                onChange={(e) => setFormData({ ...formData, user_email: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                placeholder="votre@email.com"
                required
              />
            </div>

            {/* Keyword */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Mot-clé
              </label>
              <input
                type="text"
                value={formData.mot_cle}
                onChange={(e) => setFormData({ ...formData, mot_cle: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
                placeholder="Ex: iPhone, appartement..."
              />
            </div>

            {/* City */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <MapPin className="w-4 h-4 inline mr-1" />
                Ville
              </label>
              <CityAutocomplete
                value={formData.ville}
                onChange={(city) => setFormData({ ...formData, ville: city })}
                placeholder="Sélectionnez une ville"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                <Tag className="w-4 h-4 inline mr-1" />
                Catégorie
              </label>
              <select
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              >
                <option value="">Toutes les catégories</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Type d'annonce
              </label>
              <select
                value={formData.type_annonce}
                onChange={(e) => setFormData({ ...formData, type_annonce: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all"
              >
                <option value="">Tous les types</option>
                <option value="sell">À vendre</option>
                <option value="buy">Recherche</option>
                <option value="exchange">Échange</option>
              </select>
            </div>

            {/* Submit Button */}
            <div className="flex items-end">
              <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Création...
                  </>
                ) : (
                  <>
                    <Bell className="w-5 h-5" />
                    Créer l'alerte
                  </>
                )}
              </button>
            </div>
          </div>

          <p className="text-xs text-gray-500 text-center mt-4">
            💡 Vous recevrez un email à chaque nouvelle annonce correspondant à vos critères
          </p>
        </form>
      </div>

      {/* Toast Notification */}
      {showToast && (
        <div className="fixed bottom-8 right-8 z-[100] animate-slide-up">
          <div
            className={`flex items-center gap-3 px-6 py-4 rounded-xl shadow-2xl ${
              toastType === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {toastType === 'success' ? (
              <CheckCircle className="w-6 h-6" />
            ) : (
              <AlertCircle className="w-6 h-6" />
            )}
            <p className="font-semibold">{toastMessage}</p>
          </div>
        </div>
      )}
    </>
  );
}
