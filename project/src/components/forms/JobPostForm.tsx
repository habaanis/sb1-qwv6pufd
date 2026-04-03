import React, { useState, useEffect } from 'react';
import { Plus, X, CheckCircle } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../lib/i18n';
import { useFormTranslation } from '../../hooks/useFormTranslation';
import CityAutocomplete from '../CityAutocomplete';

interface JobPostFormProps {
  userId: string;
  jobId?: string;
  onSuccess?: () => void;
}

interface JobData {
  titre_poste: string;
  nom_entreprise: string;
  adresse_entreprise: string;
  ville: string;
  secteur_emploi: string;
  type_contrat: string;
  niveau_experience: string;
  competences_cles: string[];
  description_poste: string;
  exigences_profil: string;
  salaire_min: number | null;
  salaire_max: number | null;
  email_contact: string;
  telephone_contact: string;
  statut: 'active' | 'closed';
  est_premium: boolean;
}

const CATEGORIES = ['sante', 'it', 'education', 'administration', 'magasin', 'autres'];
const CONTRACT_TYPES = ['CDI', 'CDD', 'Intérim', 'Stage', 'Freelance'];
const SENIORITY_LEVELS = ['junior', 'mid', 'senior', 'all'];

// Function to normalize skills (lowercase + remove accents)
const normalizeSkill = (skill: string): string => {
  return skill
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();
};

export default function JobPostForm({ userId, jobId, onSuccess }: JobPostFormProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const { submission_lang } = useFormTranslation();

  const [loading, setLoading] = useState(!!jobId);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [showSuccessToast, setShowSuccessToast] = useState(false);

  const [formData, setFormData] = useState<JobData>({
    titre_poste: '',
    nom_entreprise: '',
    adresse_entreprise: '',
    ville: '',
    secteur_emploi: 'autres',
    type_contrat: 'CDI',
    niveau_experience: 'all',
    competences_cles: [],
    description_poste: '',
    exigences_profil: '',
    salaire_min: null,
    salaire_max: null,
    email_contact: '',
    telephone_contact: '',
    statut: 'active',
    est_premium: false,
  });

  const [skillInput, setSkillInput] = useState('');

  // Load existing job if editing
  useEffect(() => {
    const loadJob = async () => {
      if (!jobId) {
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from('job_postings')
          .select('*')
          .eq('id', jobId)
          .eq('created_by', userId)
          .maybeSingle();

        if (error) throw error;

        if (data) {
          setFormData({
            titre_poste: data.titre_poste || '',
            nom_entreprise: data.nom_entreprise || '',
            adresse_entreprise: data.adresse_entreprise || '',
            ville: data.ville || '',
            secteur_emploi: data.secteur_emploi || 'autres',
            type_contrat: data.type_contrat || 'CDI',
            niveau_experience: data.niveau_experience || 'all',
            competences_cles: data.competences_cles || [],
            description_poste: data.description_poste || '',
            exigences_profil: data.exigences_profil || '',
            salaire_min: data.salaire_min || null,
            salaire_max: data.salaire_max || null,
            email_contact: data.email_contact || '',
            telephone_contact: data.telephone_contact || '',
            statut: data.statut || 'active',
            est_premium: data.est_premium || false,
          });
        }
      } catch (error) {
        console.error('Error loading job:', error);
      } finally {
        setLoading(false);
      }
    };

    loadJob();
  }, [jobId, userId]);

  const addSkill = () => {
    if (!skillInput.trim()) return;
    const normalized = normalizeSkill(skillInput);
    if (!formData.competences_cles.map(normalizeSkill).includes(normalized)) {
      setFormData((prev) => ({ ...prev, competences_cles: [...prev.competences_cles, skillInput.trim()] }));
    }
    setSkillInput('');
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      competences_cles: prev.competences_cles.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // Normalize and deduplicate competences_cles
      const normalizedSkills = Array.from(
        new Set(formData.competences_cles.map(normalizeSkill))
      );

      // Vérifier si userId est un UUID valide
      const isValidUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(userId);

      // Construire le payload avec les nouveaux noms de colonnes en français
      const payload: any = {
        titre_poste: formData.titre_poste.trim(),
        nom_entreprise: formData.nom_entreprise.trim(),
        adresse_entreprise: formData.adresse_entreprise?.trim() || null,
        ville: formData.ville.trim(),
        secteur_emploi: formData.secteur_emploi,
        type_contrat: formData.type_contrat,
        niveau_experience: formData.niveau_experience,
        competences_cles: normalizedSkills,
        description_poste: formData.description_poste.trim(),
        exigences_profil: formData.exigences_profil?.trim() || formData.description_poste.trim(),
        salaire_min: formData.salaire_min || null,
        salaire_max: formData.salaire_max || null,
        email_contact: formData.email_contact.trim(),
        telephone_contact: formData.telephone_contact?.trim() || null,
        statut: formData.statut,
        est_premium: formData.est_premium,
        // N'inclure created_by que si c'est un UUID valide (utilisateur authentifié)
        ...(isValidUUID && { created_by: userId }),
        submission_lang,
      };

      // LOG DE DÉBOGAGE - Données prêtes pour Supabase
      console.log('=== DONNÉES PRÊTES POUR SUPABASE ===');
      console.log(`Formulaire JobPostForm - ${jobId ? 'Mise à jour' : 'Nouvelle'} Offre d'Emploi`);
      console.log('Données formatées:', JSON.stringify(payload, null, 2));
      console.log('Types des champs:');
      console.log('- titre_poste (string):', typeof payload.titre_poste, payload.titre_poste);
      console.log('- nom_entreprise (string):', typeof payload.nom_entreprise, payload.nom_entreprise);
      console.log('- adresse_entreprise (string|null):', typeof payload.adresse_entreprise, payload.adresse_entreprise);
      console.log('- ville (string):', typeof payload.ville, payload.ville);
      console.log('- secteur_emploi (string):', typeof payload.secteur_emploi, payload.secteur_emploi);
      console.log('- type_contrat (string):', typeof payload.type_contrat, payload.type_contrat);
      console.log('- niveau_experience (string):', typeof payload.niveau_experience, payload.niveau_experience);
      console.log('- competences_cles (array):', Array.isArray(payload.competences_cles), payload.competences_cles);
      console.log('- description_poste (string):', typeof payload.description_poste, payload.description_poste.substring(0, 50) + '...');
      console.log('- exigences_profil (string):', typeof payload.exigences_profil, payload.exigences_profil.substring(0, 50) + '...');
      console.log('- salaire_min (number|null):', typeof payload.salaire_min, payload.salaire_min);
      console.log('- salaire_max (number|null):', typeof payload.salaire_max, payload.salaire_max);
      console.log('- email_contact (string):', typeof payload.email_contact, payload.email_contact);
      console.log('- telephone_contact (string|null):', typeof payload.telephone_contact, payload.telephone_contact);
      console.log('- statut (string):', typeof payload.statut, payload.statut);
      console.log('- est_premium (boolean):', typeof payload.est_premium, payload.est_premium);
      console.log('- created_by (string/uuid):', typeof payload.created_by, payload.created_by);
      console.log('=====================================');

      // Validation des champs obligatoires
      const requiredFields = ['titre_poste', 'nom_entreprise', 'ville', 'secteur_emploi', 'description_poste', 'email_contact'];
      const missingFields = requiredFields.filter(field => !payload[field] || payload[field].trim() === '');

      if (missingFields.length > 0) {
        console.error('❌ ERREUR: Champs obligatoires manquants:', missingFields);
        setMessage({
          type: 'error',
          text: `Champs obligatoires manquants: ${missingFields.join(', ')}`
        });
        setSaving(false);
        return;
      }

      // Validation du format email
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(payload.email_contact)) {
        console.error('❌ ERREUR: Format email invalide:', payload.email_contact);
        setMessage({
          type: 'error',
          text: 'Format email invalide'
        });
        setSaving(false);
        return;
      }

      // Validation des nombres
      if (payload.salaire_min !== null && (typeof payload.salaire_min !== 'number' || payload.salaire_min < 0)) {
        console.error('❌ ERREUR: salaire_min doit être un nombre positif');
        payload.salaire_min = null;
      }
      if (payload.salaire_max !== null && (typeof payload.salaire_max !== 'number' || payload.salaire_max < 0)) {
        console.error('❌ ERREUR: salaire_max doit être un nombre positif');
        payload.salaire_max = null;
      }

      // Validation des types array
      if (!Array.isArray(payload.competences_cles)) payload.competences_cles = [];

      console.log('✅ Validation réussie. Envoi à Supabase...');

      if (jobId) {
        // Update existing job
        const { data, error } = await supabase
          .from('job_postings')
          .update(payload)
          .eq('id', jobId)
          .eq('created_by', userId)
          .select();

        if (error) {
          console.error('❌ ERREUR Supabase (UPDATE):', error);
          console.error('Code:', error.code);
          console.error('Message:', error.message);
          console.error('Details:', error.details);
          console.error('Hint:', error.hint);

          setMessage({
            type: 'error',
            text: `Erreur lors de la mise à jour : ${error.message}${error.details ? ` (${error.details})` : ''}`
          });
          return;
        }

        console.log('✅ SUCCÈS: Offre d\'emploi mise à jour dans Supabase');
        console.log('Données mises à jour:', data);
        setMessage({ type: 'success', text: 'Offre d\'emploi mise à jour avec succès !' });
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 5000);
      } else {
        // Insert new job
        const { data, error } = await supabase
          .from('job_postings')
          .insert([payload])
          .select();

        if (error) {
          console.error('❌ ERREUR Supabase (INSERT):', error);
          console.error('Code:', error.code);
          console.error('Message:', error.message);
          console.error('Details:', error.details);
          console.error('Hint:', error.hint);

          setMessage({
            type: 'error',
            text: `Erreur lors de la publication : ${error.message}${error.details ? ` (${error.details})` : ''}`
          });
          return;
        }

        console.log('✅ SUCCÈS: Offre d\'emploi créée dans Supabase');
        console.log('Données créées:', data);
        console.log('ID offre:', data?.[0]?.id);
        setMessage({ type: 'success', text: 'Formulaire envoyé avec succès ! Votre offre d\'emploi a été publiée.' });
        setShowSuccessToast(true);
        setTimeout(() => setShowSuccessToast(false), 5000);
      }

      if (onSuccess) {
        setTimeout(onSuccess, 1500);
      }
    } catch (err: any) {
      console.error('❌ ERREUR INATTENDUE:', err);
      setMessage({
        type: 'error',
        text: `${t.common.error.unexpected} : ${err.message || t.common.error.pleaseTryAgain}`
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block w-8 h-8 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Toast de succès en vert */}
      {showSuccessToast && (
        <div className="fixed top-4 right-4 z-50 animate-slide-in-right">
          <div className="bg-green-600 text-white px-6 py-4 rounded-lg shadow-2xl flex items-center gap-3 min-w-[320px] border-2 border-green-400">
            <CheckCircle className="w-6 h-6 flex-shrink-0" />
            <div className="flex-1">
              <p className="font-bold text-lg">Formulaire envoyé avec succès !</p>
              <p className="text-sm text-green-100">Votre offre d'emploi a été publiée.</p>
            </div>
          </div>
        </div>
      )}

      {/* Message d'erreur */}
      {message && message.type === 'error' && (
        <div className="bg-red-900/30 border border-red-600 text-red-300 p-3 rounded-md mb-4">
          {message.text}
        </div>
      )}

      {/* Job Title */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.jobPost.form.title} <span className="text-[#D4AF37]">*</span>
        </label>
        <input
          type="text"
          value={formData.titre_poste}
          onChange={(e) => setFormData((prev) => ({ ...prev, titre_poste: e.target.value }))}
          className="w-full px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] placeholder-gray-500"
          placeholder={t.jobPost.form.titlePlaceholder}
          required
        />
      </div>

      {/* Company */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.jobPost.form.company} <span className="text-[#D4AF37]">*</span>
        </label>
        <input
          type="text"
          value={formData.nom_entreprise}
          onChange={(e) => setFormData((prev) => ({ ...prev, nom_entreprise: e.target.value }))}
          className="w-full px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
          required
        />
      </div>

      {/* Company Address */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.jobPost.form.companyAddress || 'Adresse de l\'entreprise'}
        </label>
        <input
          type="text"
          value={formData.adresse_entreprise}
          onChange={(e) => setFormData((prev) => ({ ...prev, adresse_entreprise: e.target.value }))}
          className="w-full px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] placeholder-gray-500"
          placeholder={t.jobPost.form.companyAddressPlaceholder || 'Ex: Avenue Habib Bourguiba, Tunis'}
        />
      </div>

      {/* City */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.jobPost.form.city} <span className="text-[#D4AF37]">*</span>
        </label>
        <CityAutocomplete
          value={formData.ville}
          onChange={(city) => setFormData((prev) => ({ ...prev, ville: city }))}
        />
      </div>

      {/* Category and Contract Type - Grid */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
            {t.jobPost.form.category} <span className="text-[#D4AF37]">*</span>
          </label>
          <select
            value={formData.secteur_emploi}
            onChange={(e) => setFormData((prev) => ({ ...prev, secteur_emploi: e.target.value }))}
            className="w-full px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] [&>option]:bg-[#2A1525] [&>option]:text-[#F5F5DC]"
            required
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {t.jobPost.categories[cat as keyof typeof t.jobPost.categories] || cat}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
            {t.jobPost.form.contractType} <span className="text-[#D4AF37]">*</span>
          </label>
          <select
            value={formData.type_contrat}
            onChange={(e) => setFormData((prev) => ({ ...prev, type_contrat: e.target.value }))}
            className="w-full px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] [&>option]:bg-[#2A1525] [&>option]:text-[#F5F5DC]"
            required
          >
            {CONTRACT_TYPES.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Seniority */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.jobPost.form.seniority} <span className="text-[#D4AF37]">*</span>
        </label>
        <select
          value={formData.niveau_experience}
          onChange={(e) => setFormData((prev) => ({ ...prev, niveau_experience: e.target.value }))}
          className="w-full px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] [&>option]:bg-[#2A1525] [&>option]:text-[#F5F5DC]"
          required
        >
          {SENIORITY_LEVELS.map((level) => (
            <option key={level} value={level}>
              {t.jobPost.seniority[level as keyof typeof t.jobPost.seniority] || level}
            </option>
          ))}
        </select>
      </div>

      {/* Skills */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.jobPost.form.skills}
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            className="flex-1 px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] placeholder-gray-500"
            placeholder={t.jobPost.form.skillsPlaceholder}
          />
          <button
            type="button"
            onClick={addSkill}
            className="px-4 py-2 bg-[#D4AF37] text-[#4A1D43] rounded-lg hover:bg-[#C19B2F] transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.competences_cles.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#4A1D43]/30 text-[#D4AF37] border border-[#D4AF37] rounded-full text-sm"
            >
              {skill}
              <button type="button" onClick={() => removeSkill(index)}>
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.jobPost.form.description} <span className="text-[#D4AF37]">*</span>
        </label>
        <textarea
          value={formData.description_poste}
          onChange={(e) => setFormData((prev) => ({ ...prev, description_poste: e.target.value }))}
          className="w-full px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] min-h-[150px] placeholder-gray-500"
          placeholder={t.jobPost.form.descriptionPlaceholder}
          required
        />
      </div>

      {/* Exigences Profil */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          Exigences du Profil
        </label>
        <textarea
          value={formData.exigences_profil}
          onChange={(e) => setFormData((prev) => ({ ...prev, exigences_profil: e.target.value }))}
          className="w-full px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] min-h-[100px] placeholder-gray-500"
          placeholder="Détaillez les compétences et qualifications requises..."
        />
      </div>

      {/* Salary Range */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.jobPost.form.salaryRange}
        </label>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="number"
            min="0"
            value={formData.salaire_min || ''}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, salaire_min: e.target.value ? parseFloat(e.target.value) : null }))
            }
            className="px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] placeholder-gray-500"
            placeholder={t.jobPost.form.salaryMin}
          />
          <input
            type="number"
            min="0"
            value={formData.salaire_max || ''}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, salaire_max: e.target.value ? parseFloat(e.target.value) : null }))
            }
            className="px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] placeholder-gray-500"
            placeholder={t.jobPost.form.salaryMax}
          />
        </div>
      </div>

      {/* Contact Information */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
            {t.jobPost.form.contactEmail} <span className="text-[#D4AF37]">*</span>
          </label>
          <input
            type="email"
            value={formData.email_contact}
            onChange={(e) => setFormData((prev) => ({ ...prev, email_contact: e.target.value }))}
            className="w-full px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
            {t.jobPost.form.contactPhone}
          </label>
          <input
            type="tel"
            value={formData.telephone_contact}
            onChange={(e) => setFormData((prev) => ({ ...prev, telephone_contact: e.target.value }))}
            className="w-full px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
          />
        </div>
      </div>

      {/* Status */}
      {jobId && (
        <div>
          <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
            {t.jobPost.form.status}
          </label>
          <div className="flex gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="active"
                checked={formData.statut === 'active'}
                onChange={(e) => setFormData((prev) => ({ ...prev, statut: e.target.value as 'active' }))}
                className="w-4 h-4 text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <span className="text-sm text-[#F5F5DC]">{t.jobPost.form.statusActive}</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                value="closed"
                checked={formData.statut === 'closed'}
                onChange={(e) => setFormData((prev) => ({ ...prev, statut: e.target.value as 'closed' }))}
                className="w-4 h-4 text-[#D4AF37] focus:ring-[#D4AF37]"
              />
              <span className="text-sm text-[#F5F5DC]">{t.jobPost.form.statusClosed}</span>
            </label>
          </div>
        </div>
      )}

      {/* Option Premium */}
      <div className="border-2 border-[#D4AF37] bg-[#4A1D43]/20 rounded-lg p-4">
        <label className="flex items-center gap-3 cursor-pointer">
          <input
            type="checkbox"
            checked={formData.est_premium}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, est_premium: e.target.checked }))
            }
            className="w-5 h-5 text-[#D4AF37] focus:ring-[#D4AF37] rounded"
          />
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-sm font-semibold text-[#F5F5DC]">
                {t.jobPost.form.premiumJob || 'Offre Premium'}
              </span>
              <span className="px-2 py-0.5 bg-gradient-to-r from-[#D4AF37] to-[#C19B2F] text-[#4A1D43] text-xs font-bold rounded-full">
                PREMIUM
              </span>
            </div>
            <p className="text-xs text-[#E8D5C4]">
              {t.jobPost.form.premiumJobDescription || 'Mettez en avant votre offre avec un badge doré visible par les candidats'}
            </p>
          </div>
        </label>
      </div>

      {/* Submit Button */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving}
          className="px-6 py-3 bg-white text-[#4A1D43] rounded-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border-2 border-[#D4AF37] font-semibold transition-all"
        >
          {saving && <span className="inline-block w-4 h-4 border-2 border-[#4A1D43] border-t-transparent rounded-full animate-spin" />}
          Publier l'offre
        </button>
      </div>
    </form>
  );
}
