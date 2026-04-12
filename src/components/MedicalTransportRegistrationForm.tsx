import { useState } from 'react';
import { Ambulance, Car, Check, Loader } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import LocationSelectTunisie from './LocationSelectTunisie';
import { Toast } from './Toast';

interface MedicalTransportRegistrationFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function MedicalTransportRegistrationForm({ onSuccess, onCancel }: MedicalTransportRegistrationFormProps) {
  const [loading, setLoading] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState<'success' | 'error' | 'warning' | 'info'>('info');

  const [formData, setFormData] = useState({
    nom_complet: '',
    email: '',
    telephone: '',
    gouvernorat: '',
    ville_base: '',
    types_vehicules: [] as string[], // Multi-select
    capacite_passagers: '',
    num_licence: '',
    zone_couverture: '',
    disponible_24h: false,
    services_proposes: [] as string[], // Multi-select
    notes: '',
  });

  // Gestion des checkboxes multi-sélection
  const handleVehicleTypeToggle = (type: string) => {
    setFormData(prev => ({
      ...prev,
      types_vehicules: prev.types_vehicules.includes(type)
        ? prev.types_vehicules.filter(t => t !== type)
        : [...prev.types_vehicules, type]
    }));
  };

  const handleServiceToggle = (service: string) => {
    setFormData(prev => ({
      ...prev,
      services_proposes: prev.services_proposes.includes(service)
        ? prev.services_proposes.filter(s => s !== service)
        : [...prev.services_proposes, service]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Convertir les tableaux en chaînes séparées par des virgules
      const typesVehiculesStr = formData.types_vehicules.join(', ');
      const servicesProposesStr = formData.services_proposes.join(', ');

      // Combiner véhicules et services pour capacite_vehicule
      const capaciteVehiculeData = [typesVehiculesStr, servicesProposesStr].filter(Boolean).join(' | ');

      // Préparer les données pour la table suggestions_entreprises (format standard)
      const suggestionData = {
        nom_entreprise: `Transport Médical - ${typesVehiculesStr || 'Non spécifié'}`,
        secteur: 'Transport Médical',
        ville: formData.ville_base || formData.gouvernorat,
        contact_suggere: `Tel: ${formData.telephone} | ${formData.nom_complet}${formData.num_licence ? ` | Licence: ${formData.num_licence}` : ''}`,
        email_suggesteur: formData.email,
        capacite_vehicule: capaciteVehiculeData || null,
        raison_suggestion: `Demande d'inscription transport médical

INFORMATIONS DÉTAILLÉES:
- Contact: ${formData.nom_complet}
- Email: ${formData.email}
- Téléphone: ${formData.telephone}
- Gouvernorat: ${formData.gouvernorat}
- Ville de base: ${formData.ville_base}
- Types de véhicules: ${typesVehiculesStr || 'Non spécifié'}
${formData.capacite_passagers ? `- Capacité: ${formData.capacite_passagers} passagers` : ''}
${formData.num_licence ? `- Numéro de licence: ${formData.num_licence}` : ''}
${formData.zone_couverture ? `- Zone de couverture: ${formData.zone_couverture}` : ''}
- Disponibilité: ${formData.disponible_24h ? 'Disponible 24h/7j' : 'Disponibilité limitée'}
${servicesProposesStr ? `- Services proposés: ${servicesProposesStr}` : ''}
${formData.notes ? `\n\nNotes supplémentaires:\n${formData.notes}` : ''}`,
        type_demande: 'transport',
      };

      // Insérer dans suggestions_entreprises
      const { error: insertError } = await supabase
        .from('suggestions_entreprises')
        .insert([suggestionData]);

      if (insertError) throw insertError;

      // Afficher Toast de succès
      setToastMessage('Demande envoyée avec succès ! Merci de votre contribution.');
      setToastType('success');
      setShowToast(true);

      // Réinitialiser le formulaire
      setFormData({
        nom_complet: '',
        email: '',
        telephone: '',
        gouvernorat: '',
        ville_base: '',
        types_vehicules: [],
        capacite_passagers: '',
        num_licence: '',
        zone_couverture: '',
        disponible_24h: false,
        services_proposes: [],
        notes: '',
      });

      // Fermer après 2 secondes si onSuccess est fourni
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (err) {
      setToastMessage('Une erreur est survenue. Veuillez réessayer.');
      setToastType('error');
      setShowToast(true);
    } finally {
      setLoading(false);
    }
  };

  if (false) {
    return (
      <div className="text-center py-12">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Demande envoyée avec succès ! Merci de votre contribution.</h3>
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

      <div className="p-6 md:p-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-2">
            Inscription Transport Médical
          </h2>
          <p className="text-gray-600">
            Rejoignez notre réseau de prestataires de transport médical
          </p>
          <div className="mt-4 bg-blue-50 border-l-4 border-blue-500 p-4 mx-auto max-w-lg">
            <p className="text-sm font-medium text-blue-800">
              Vous connaissez une bonne adresse ? Partagez-la ici !
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">

        {/* Informations personnelles */}
        <div className="bg-gray-50 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h3>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom complet *
              </label>
              <input
                type="text"
                required
                value={formData.nom_complet}
                onChange={(e) => setFormData({ ...formData, nom_complet: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Votre nom complet"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="votre@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Téléphone *
              </label>
              <input
                type="tel"
                required
                value={formData.telephone}
                onChange={(e) => setFormData({ ...formData, telephone: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="+216 XX XXX XXX"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Gouvernorat *
              </label>
              <LocationSelectTunisie
                value={formData.gouvernorat}
                onChange={(val) => setFormData({ ...formData, gouvernorat: val })}
                placeholder="Sélectionner"
              />
            </div>
          </div>
        </div>

        {/* Informations véhicule */}
        <div className="bg-gray-50 rounded-xl p-5">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Informations véhicule</h3>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-3">
              Types de véhicules * <span className="text-gray-500 text-xs">(Plusieurs choix possibles)</span>
            </label>
            <div className="grid md:grid-cols-2 gap-3">
              {[
                { value: 'Ambulance', icon: '🚑', label: 'Ambulance' },
                { value: 'Taxi Médical', icon: '🚕', label: 'Taxi Médical' },
                { value: 'Taxi Collectif', icon: '🚐', label: 'Taxi Collectif' },
                { value: 'Louage', icon: '🚌', label: 'Louage' },
              ].map(vehicle => (
                <label
                  key={vehicle.value}
                  className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                    formData.types_vehicules.includes(vehicle.value)
                      ? 'border-blue-500 bg-blue-50'
                      : 'border-gray-200 hover:border-blue-300'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={formData.types_vehicules.includes(vehicle.value)}
                    onChange={() => handleVehicleTypeToggle(vehicle.value)}
                    className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                  <span className="text-2xl">{vehicle.icon}</span>
                  <span className="font-medium text-gray-700">{vehicle.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 mt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Ville de base *
              </label>
              <input
                type="text"
                required
                value={formData.ville_base}
                onChange={(e) => setFormData({ ...formData, ville_base: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Tunis, Sfax..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Numéro de licence
              </label>
              <input
                type="text"
                value={formData.num_licence}
                onChange={(e) => setFormData({ ...formData, num_licence: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Numéro de licence professionnelle"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Capacité de passagers
              </label>
              <input
                type="number"
                min="1"
                max="50"
                value={formData.capacite_passagers}
                onChange={(e) => setFormData({ ...formData, capacite_passagers: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: 4, 8, 12..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Zone de couverture
              </label>
              <input
                type="text"
                value={formData.zone_couverture}
                onChange={(e) => setFormData({ ...formData, zone_couverture: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Grand Tunis, Sousse et environs..."
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Services proposés <span className="text-gray-500 text-xs">(Plusieurs choix possibles)</span>
              </label>
              <div className="grid md:grid-cols-2 gap-3">
                {[
                  { value: 'Urgence', icon: '🚨' },
                  { value: 'Transport programmé', icon: '📅' },
                  { value: 'Transport inter-hospitalier', icon: '🏥' },
                  { value: 'Transport domicile-hôpital', icon: '🏠' },
                ].map(service => (
                  <label
                    key={service.value}
                    className={`flex items-center gap-3 p-3 border-2 rounded-lg cursor-pointer transition-all ${
                      formData.services_proposes.includes(service.value)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={formData.services_proposes.includes(service.value)}
                      onChange={() => handleServiceToggle(service.value)}
                      className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <span className="text-2xl">{service.icon}</span>
                    <span className="font-medium text-gray-700">{service.value}</span>
                  </label>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Disponibilité */}
        <div className="bg-gray-50 rounded-xl p-5">
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={formData.disponible_24h}
              onChange={(e) => setFormData({ ...formData, disponible_24h: e.target.checked })}
              className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <div>
              <span className="font-medium text-gray-900">Disponible 24h/7j</span>
              <p className="text-sm text-gray-600">Je suis disponible pour les urgences de nuit et weekends</p>
            </div>
          </label>
        </div>

        {/* Notes */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Notes supplémentaires
          </label>
          <textarea
            rows={4}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Informations complémentaires, équipements spéciaux, certifications..."
          />
        </div>

        {/* Boutons */}
        <div className="flex gap-4 pt-4">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Check className="w-5 h-5" />
                Envoyer ma demande
              </>
            )}
          </button>
        </div>
      </form>
    </div>
    </>
  );
}
