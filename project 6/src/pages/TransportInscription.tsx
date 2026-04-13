import { useState } from 'react';
import { motion } from 'framer-motion';
import { supabase } from '../lib/BoltDatabase';
import {
  Ambulance,
  MapPin,
  Phone,
  Mail,
  Car,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Clock,
  Package,
  FileText,
} from 'lucide-react';

interface FormData {
  full_name: string;
  email: string;
  phone: string;
  governorate: string;
  cities: string;
  vehicle_type: string;
  equipment_wheelchair: boolean;
  equipment_oxygen: boolean;
  equipment_stretcher: boolean;
  equipment_defibrillator: boolean;
  equipment_air_conditioning: boolean;
  availability: string;
  subscription_tier: 'gratuit' | 'premium';
  notes: string;
  accept_terms: boolean;
}

const tunisianGovernorates = [
  'Tunis',
  'Ariana',
  'Ben Arous',
  'Manouba',
  'Nabeul',
  'Zaghouan',
  'Bizerte',
  'Béja',
  'Jendouba',
  'Kef',
  'Siliana',
  'Sousse',
  'Monastir',
  'Mahdia',
  'Sfax',
  'Kairouan',
  'Kasserine',
  'Sidi Bouzid',
  'Gabès',
  'Médenine',
  'Tataouine',
  'Gafsa',
  'Tozeur',
  'Kébili',
];

const vehicleTypes = [
  { value: 'voiture_standard', label: 'Voiture Standard', description: 'Véhicule adapté au transport de personnes à mobilité réduite' },
  { value: 'van_amenage', label: 'Van Aménagé', description: 'Van équipé pour le transport médical non urgent' },
  { value: 'ambulance_privee', label: 'Ambulance Privée', description: 'Ambulance complète avec équipement médical' },
];

const availabilityOptions = [
  { value: '24/7', label: '24h/24 - 7j/7', icon: Clock },
  { value: 'jour', label: 'Journée uniquement (8h-20h)' },
  { value: 'nuit', label: 'Nuit uniquement (20h-8h)' },
  { value: 'sur_rdv', label: 'Sur rendez-vous' },
];

export default function TransportInscription() {
  const [form, setForm] = useState<FormData>({
    full_name: '',
    email: '',
    phone: '',
    governorate: '',
    cities: '',
    vehicle_type: '',
    equipment_wheelchair: false,
    equipment_oxygen: false,
    equipment_stretcher: false,
    equipment_defibrillator: false,
    equipment_air_conditioning: false,
    availability: '24/7',
    subscription_tier: 'gratuit',
    notes: '',
    accept_terms: false,
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const target = e.target as HTMLInputElement;
    const { name, value, type } = target;
    const checked = target.checked;

    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const validateForm = (): boolean => {
    if (!form.full_name.trim()) {
      setErrorMsg('Le nom complet est obligatoire');
      return false;
    }
    if (!form.email.trim() || !form.email.includes('@')) {
      setErrorMsg('Veuillez entrer une adresse email valide');
      return false;
    }
    if (!form.phone.trim()) {
      setErrorMsg('Le numéro de téléphone est obligatoire');
      return false;
    }
    if (!form.governorate) {
      setErrorMsg('Veuillez sélectionner un gouvernorat');
      return false;
    }
    if (!form.vehicle_type) {
      setErrorMsg('Veuillez sélectionner un type de véhicule');
      return false;
    }
    if (!form.accept_terms) {
      setErrorMsg('Vous devez accepter les conditions d\'utilisation');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccess(false);

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {
      const payload = {
        full_name: form.full_name.trim(),
        email: form.email.trim().toLowerCase(),
        phone: form.phone.trim(),
        governorate: form.governorate,
        cities: form.cities.trim() || null,
        vehicle_type: form.vehicle_type,
        equipment: {
          wheelchair: form.equipment_wheelchair,
          oxygen: form.equipment_oxygen,
          stretcher: form.equipment_stretcher,
          defibrillator: form.equipment_defibrillator,
          air_conditioning: form.equipment_air_conditioning,
        },
        availability: form.availability,
        subscription_tier: form.subscription_tier,
        notes: form.notes.trim() || null,
        status: 'pending',
      };

      const { error } = await supabase
        .from('medical_transport_providers')
        .insert([payload]);

      if (error) {
        console.error('Supabase error:', error);
        setErrorMsg('Une erreur est survenue lors de l\'inscription. Veuillez réessayer.');
      } else {
        setSuccess(true);
        setForm({
          full_name: '',
          email: '',
          phone: '',
          governorate: '',
          cities: '',
          vehicle_type: '',
          equipment_wheelchair: false,
          equipment_oxygen: false,
          equipment_stretcher: false,
          equipment_defibrillator: false,
          equipment_air_conditioning: false,
          availability: '24/7',
          subscription_tier: 'gratuit',
          notes: '',
          accept_terms: false,
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (error) {
      console.error('Error:', error);
      setErrorMsg('Une erreur inattendue est survenue. Veuillez réessayer.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-gray-50 py-16 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="max-w-2xl mx-auto"
        >
          <div className="bg-white border border-green-200 rounded-3xl p-8 md:p-12 shadow-xl text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-green-100 rounded-full mb-6"
            >
              <CheckCircle2 className="w-12 h-12 text-green-600" />
            </motion.div>

            <h1 className="text-3xl md:text-4xl font-light text-gray-900 mb-4">
              Inscription réussie !
            </h1>

            <div className="bg-green-50 border border-green-200 rounded-2xl p-6 mb-8">
              <p className="text-gray-700 leading-relaxed mb-4">
                Merci pour votre inscription ! Votre demande a été transmise avec succès à notre équipe.
              </p>
              <div className="flex items-start gap-3 text-left">
                <ShieldCheck className="w-5 h-5 text-green-600 mt-1 flex-shrink-0" />
                <p className="text-sm text-gray-600">
                  Votre profil sera validé sous <strong>24 à 48 heures</strong>. Vous recevrez un email de confirmation dès que votre compte sera approuvé.
                </p>
              </div>
            </div>

            <button
              onClick={() => setSuccess(false)}
              className="inline-flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <Ambulance className="w-5 h-5" />
              Nouvelle inscription
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12"
        >
          <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 rounded-full mb-6">
            <Ambulance className="w-8 h-8 text-red-600" />
          </div>
          <h1 className="text-3xl md:text-5xl font-light text-gray-900 mb-4">
            Inscription Prestataire
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Rejoignez le réseau <strong>Dalil Tounes</strong> et proposez vos services de transport médical aux citoyens tunisiens.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-white border border-gray-200 rounded-3xl shadow-xl p-8 md:p-10"
        >
          <form onSubmit={handleSubmit} className="space-y-8">
            <div>
              <h2 className="text-xl font-medium text-gray-900 mb-6 flex items-center gap-2">
                <Mail className="w-5 h-5 text-red-600" />
                Informations personnelles
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Nom complet <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    name="full_name"
                    value={form.full_name}
                    onChange={handleChange}
                    placeholder="Ex: Ahmed Ben Ali"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Téléphone <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+216 XX XXX XXX"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email <span className="text-red-600">*</span>
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="votre.email@exemple.com"
                      className="w-full pl-11 pr-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-medium text-gray-900 mb-6 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-red-600" />
                Zone de service
              </h2>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Gouvernorat principal <span className="text-red-600">*</span>
                  </label>
                  <select
                    name="governorate"
                    value={form.governorate}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                    required
                  >
                    <option value="">Sélectionnez un gouvernorat</option>
                    {tunisianGovernorates.map((gov) => (
                      <option key={gov} value={gov}>
                        {gov}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Villes desservies
                  </label>
                  <input
                    type="text"
                    name="cities"
                    value={form.cities}
                    onChange={handleChange}
                    placeholder="Ex: Tunis, La Marsa, Carthage"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                  />
                  <p className="text-xs text-gray-500 mt-1">Séparez par des virgules</p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-medium text-gray-900 mb-6 flex items-center gap-2">
                <Car className="w-5 h-5 text-red-600" />
                Véhicule et équipements
              </h2>

              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Type de véhicule <span className="text-red-600">*</span>
                </label>
                <div className="grid md:grid-cols-3 gap-4">
                  {vehicleTypes.map((vehicle) => (
                    <label
                      key={vehicle.value}
                      className={`relative flex flex-col p-4 border-2 rounded-xl cursor-pointer transition-all ${
                        form.vehicle_type === vehicle.value
                          ? 'border-red-500 bg-red-50'
                          : 'border-gray-200 hover:border-red-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="vehicle_type"
                        value={vehicle.value}
                        checked={form.vehicle_type === vehicle.value}
                        onChange={handleChange}
                        className="sr-only"
                      />
                      <span className="font-medium text-gray-900 mb-1">{vehicle.label}</span>
                      <span className="text-xs text-gray-600">{vehicle.description}</span>
                      {form.vehicle_type === vehicle.value && (
                        <CheckCircle2 className="absolute top-3 right-3 w-5 h-5 text-red-600" />
                      )}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  <Package className="inline w-4 h-4 mr-1" />
                  Équipements disponibles
                </label>
                <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {[
                    { name: 'equipment_wheelchair', label: 'Fauteuil roulant' },
                    { name: 'equipment_oxygen', label: 'Oxygène' },
                    { name: 'equipment_stretcher', label: 'Brancard' },
                    { name: 'equipment_defibrillator', label: 'Défibrillateur' },
                    { name: 'equipment_air_conditioning', label: 'Climatisation' },
                  ].map((equipment) => (
                    <label
                      key={equipment.name}
                      className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer transition-all"
                    >
                      <input
                        type="checkbox"
                        name={equipment.name}
                        checked={form[equipment.name as keyof FormData] as boolean}
                        onChange={handleChange}
                        className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500"
                      />
                      <span className="text-sm text-gray-700">{equipment.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-medium text-gray-900 mb-6 flex items-center gap-2">
                <Clock className="w-5 h-5 text-red-600" />
                Disponibilité
              </h2>
              <div className="grid sm:grid-cols-2 gap-4">
                {availabilityOptions.map((option) => (
                  <label
                    key={option.value}
                    className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${
                      form.availability === option.value
                        ? 'border-red-500 bg-red-50'
                        : 'border-gray-200 hover:border-red-300'
                    }`}
                  >
                    <input
                      type="radio"
                      name="availability"
                      value={option.value}
                      checked={form.availability === option.value}
                      onChange={handleChange}
                      className="w-5 h-5 text-red-600 focus:ring-2 focus:ring-red-500"
                    />
                    <span className="text-sm font-medium text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div className="border-t border-gray-200 pt-8">
              <h2 className="text-xl font-medium text-gray-900 mb-6 flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                Informations complémentaires
              </h2>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Remarques ou informations supplémentaires
                </label>
                <textarea
                  name="notes"
                  value={form.notes}
                  onChange={handleChange}
                  rows={4}
                  placeholder="Décrivez votre expérience, certifications, services spécifiques..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all resize-none"
                />
              </div>
            </div>

            {errorMsg && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl"
              >
                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-800">{errorMsg}</p>
              </motion.div>
            )}

            <div className="border-t border-gray-200 pt-8">
              <label className="flex items-start gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  name="accept_terms"
                  checked={form.accept_terms}
                  onChange={handleChange}
                  className="w-5 h-5 text-red-600 rounded focus:ring-2 focus:ring-red-500 mt-0.5"
                  required
                />
                <span className="text-sm text-gray-700 leading-relaxed">
                  J'accepte les conditions d'utilisation et je m'engage à fournir des services de qualité conformes aux normes de sécurité. Je comprends que mon profil sera vérifié avant publication.
                  <span className="text-red-600 ml-1">*</span>
                </span>
              </label>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-6">
              <button
                type="submit"
                disabled={submitting}
                className="flex-1 inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-xl font-medium hover:from-red-700 hover:to-red-800 transition-all shadow-lg hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Ambulance className="w-5 h-5" />
                    S'inscrire comme prestataire
                  </>
                )}
              </button>
            </div>

            <p className="text-xs text-center text-gray-500">
              Votre demande sera examinée sous 24 à 48 heures. Vous recevrez une confirmation par email.
            </p>
          </form>
        </motion.div>
      </div>
    </div>
  );
}
