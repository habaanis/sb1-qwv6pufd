import React, { useState, useEffect } from 'react';
import { Upload, X, Plus } from 'lucide-react'; // 👈 plus de Loader ici
import { supabase } from '../../lib/supabaseClient';
import { useLanguage } from '../../context/LanguageContext';
import { useTranslation } from '../../lib/i18n';
import { useFormTranslation } from '../../hooks/useFormTranslation';
import CityAutocomplete from '../CityAutocomplete';

interface CandidateFormProps {
  userId: string;
  onSuccess?: () => void;
}

interface CandidateData {
  nom_complet: string;
  prenom: string;
  email: string;
  telephone: string;
  adresse: string;
  ville_residence: string;
  category: string;
  diplome: string;
  competences: string[];
  annees_experience: number;
  languages: string[];
  contrats_souhaites: string[];
  visibility: 'private' | 'public';
  cv_url: string;
  availability: string;
  est_premium: boolean;
}

const CATEGORIES = ['sante', 'it', 'education', 'administration', 'magasin', 'autres'];
const CONTRACT_TYPES = ['CDI', 'CDD', 'Intérim', 'Stage', 'Freelance'];
const DIPLOMES = ['Baccalauréat', 'Licence', 'Master', 'Ingénieur', 'Doctorat', 'Autre'];

// Normalisation pour dédupliquer les compétences
const normalizeSkill = (skill: string): string =>
  skill
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

export default function CandidateForm({ userId, onSuccess }: CandidateFormProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const { submission_lang } = useFormTranslation();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<CandidateData>({
    nom_complet: '',
    prenom: '',
    email: '',
    telephone: '',
    adresse: '',
    ville_residence: '',
    category: '',
    diplome: '',
    competences: [],
    annees_experience: 0,
    languages: [],
    contrats_souhaites: [],
    visibility: 'public',
    cv_url: '',
    availability: '',
    est_premium: false,
  });

  const [skillInput, setSkillInput] = useState('');
  const [languageInput, setLanguageInput] = useState('');

  // 🔹 Chargement éventuel d'un profil existant
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const { data, error } = await supabase
          .from('candidates')              // 👈 table "candidates"
          .select('*')
          .eq('created_by', userId)        // 👈 colonne "created_by" (uuid)
          .maybeSingle();

        if (error) {
          console.error('[CandidateForm] Error loading profile:', error);
        }

        if (data) {
          setFormData({
            nom_complet: data.nom_complet || '',
            prenom: data.prenom || '',
            email: data.email || '',
            telephone: data.telephone || '',
            adresse: data.adresse || '',
            ville_residence: data.ville_residence || '',
            category: data.category || 'autres',
            diplome: data.diplome || '',
            competences: data.competences || [],
            annees_experience: data.annees_experience || 0,
            languages: data.languages || [],
            contrats_souhaites: data.contrats_souhaites || [],
            visibility: data.visibility || 'public',
            cv_url: data.cv_url || '',
            availability: data.availability || '',
            est_premium: data.est_premium || false,
          });
        }
      } catch (err) {
        console.error('[CandidateForm] Unexpected error loading profile:', err);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, [userId]);

  const handleCVUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      setMessage({ type: 'error', text: t.candidate.form.errors.pdfOnly });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setMessage({ type: 'error', text: t.candidate.form.errors.fileTooLarge });
      return;
    }

    setUploading(true);
    setMessage(null);

    try {
      const timestamp = Date.now();
      const fileName = `${userId}/${timestamp}.pdf`;

      const { error: uploadError } = await supabase.storage
        .from('cv')                        // 👉 bucket "cv"
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        console.error('[CandidateForm] Upload error:', uploadError);
        throw uploadError;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from('cv').getPublicUrl(fileName);

      setFormData((prev) => ({ ...prev, cv_url: publicUrl }));
      setMessage({ type: 'success', text: t.candidate.form.cvUploaded });
    } catch (error: any) {
      console.error('[CandidateForm] Upload exception:', error);
      setMessage({
        type: 'error',
        text: error?.message || t.candidate.form.errors.uploadFailed,
      });
    } finally {
      setUploading(false);
    }
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    const normalized = normalizeSkill(skillInput);
    const existing = formData.competences.map(normalizeSkill);
    if (!existing.includes(normalized)) {
      setFormData((prev) => ({
        ...prev,
        competences: [...prev.competences, skillInput.trim()],
      }));
    }
    setSkillInput('');
  };

  const removeSkill = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      competences: formData.competences.filter((_, i) => i !== index),
    }));
  };

  const addLanguage = () => {
    if (!languageInput.trim()) return;
    if (!formData.languages.includes(languageInput.trim())) {
      setFormData((prev) => ({
        ...prev,
        languages: [...prev.languages, languageInput.trim()],
      }));
    }
    setLanguageInput('');
  };

  const removeLanguage = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      languages: prev.languages.filter((_, i) => i !== index),
    }));
  };

  const toggleContract = (contract: string) => {
    setFormData((prev) => ({
      ...prev,
      contrats_souhaites: prev.contrats_souhaites.includes(contract)
        ? prev.contrats_souhaites.filter((c) => c !== contract)
        : [...prev.contrats_souhaites, contract],
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      // 🔹 déduplique les compétences sans perdre la forme d'origine
      const seen = new Set<string>();
      const dedupedSkills: string[] = [];
      for (const skill of formData.competences) {
        const k = normalizeSkill(skill);
        if (!seen.has(k)) {
          seen.add(k);
          dedupedSkills.push(skill.trim());
        }
      }

      const payload = {
        ...formData,
        competences: dedupedSkills,
        created_by: userId,
        updated_at: new Date().toISOString(),
        submission_lang,
      };

      // LOG DE DÉBOGAGE - Données prêtes pour Supabase
      console.log('=== DONNÉES PRÊTES POUR SUPABASE ===');
      console.log('Formulaire CandidateForm - Profil Candidat');
      console.log('Données formatées:', JSON.stringify(payload, null, 2));
      console.log('Types des champs:');
      console.log('- nom_complet (string):', typeof payload.nom_complet, payload.nom_complet);
      console.log('- prenom (string):', typeof payload.prenom, payload.prenom);
      console.log('- email (string):', typeof payload.email, payload.email);
      console.log('- telephone (string):', typeof payload.telephone, payload.telephone);
      console.log('- adresse (string):', typeof payload.adresse, payload.adresse);
      console.log('- ville_residence (string):', typeof payload.ville_residence, payload.ville_residence);
      console.log('- category (string):', typeof payload.category, payload.category);
      console.log('- diplome (string):', typeof payload.diplome, payload.diplome);
      console.log('- competences (array):', Array.isArray(payload.competences), payload.competences);
      console.log('- annees_experience (number):', typeof payload.annees_experience, payload.annees_experience);
      console.log('- languages (array):', Array.isArray(payload.languages), payload.languages);
      console.log('- contrats_souhaites (array):', Array.isArray(payload.contrats_souhaites), payload.contrats_souhaites);
      console.log('- visibility (string):', typeof payload.visibility, payload.visibility);
      console.log('- cv_url (string):', typeof payload.cv_url, payload.cv_url);
      console.log('- availability (string):', typeof payload.availability, payload.availability);
      console.log('- est_premium (boolean):', typeof payload.est_premium, payload.est_premium);
      console.log('- created_by (string/uuid):', typeof payload.created_by, payload.created_by);
      console.log('- updated_at (string/ISO):', typeof payload.updated_at, payload.updated_at);
      console.log('=====================================');

      // Validation des champs obligatoires
      if (!payload.nom_complet || !payload.nom_complet.trim()) {
        console.error('❌ ERREUR: Le nom complet est obligatoire');
        setMessage({
          type: 'error',
          text: 'Le nom complet est obligatoire',
        });
        setSaving(false);
        return;
      }

      // Validation du format email si présent
      if (payload.email && payload.email.trim()) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(payload.email)) {
          console.error('❌ ERREUR: Format email invalide:', payload.email);
          setMessage({
            type: 'error',
            text: 'Format email invalide',
          });
          setSaving(false);
          return;
        }
      }

      // Validation annees_experience est bien un nombre
      if (typeof payload.annees_experience !== 'number' || payload.annees_experience < 0) {
        console.error('❌ ERREUR: annees_experience doit être un nombre positif');
        payload.annees_experience = 0; // Valeur par défaut
      }

      // Validation des types array
      if (!Array.isArray(payload.competences)) payload.competences = [];
      if (!Array.isArray(payload.languages)) payload.languages = [];
      if (!Array.isArray(payload.contrats_souhaites)) payload.contrats_souhaites = [];

      console.log('✅ Validation réussie. Envoi à Supabase...');

      // ⚠️ on enlève onConflict: 'created_by' pour éviter l'erreur 400
      const { error } = await supabase.from('candidates').upsert(payload);

      if (error) {
        console.error('❌ ERREUR Supabase:', error);
        console.error('Code:', error.code);
        console.error('Message:', error.message);
        console.error('Details:', error.details);
        setMessage({
          type: 'error',
          text: error.message || t.candidate.form.errors.saveFailed,
        });
        return;
      }

      console.log('✅ SUCCÈS: Profil candidat enregistré dans Supabase');
      setMessage({ type: 'success', text: t.candidate.form.success });
      if (onSuccess) onSuccess();
    } catch (error: any) {
      console.error('❌ ERREUR INATTENDUE:', error);
      setMessage({
        type: 'error',
        text: error?.message || t.candidate.form.errors.saveFailed,
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    // 🔁 petit spinner CSS simple, pas d'icône Loader
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {message && (
        <div
          className={`p-4 rounded-lg ${
            message.type === 'success'
              ? 'bg-green-900/30 border border-green-600 text-green-300'
              : 'bg-red-900/30 border border-red-600 text-red-300'
          }`}
        >
          {message.text}
        </div>
      )}

      {/* Nom complet */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.candidate.form.fullName} <span className="text-[#D4AF37]">*</span>
        </label>
        <input
          type="text"
          value={formData.nom_complet}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, nom_complet: e.target.value }))
          }
          className="w-full px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
          required
        />
      </div>

      {/* Prénom */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.candidate.form.prenom || 'Prénom'}
        </label>
        <input
          type="text"
          value={formData.prenom}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, prenom: e.target.value }))
          }
          className="w-full px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          Email
        </label>
        <input
          type="email"
          value={formData.email}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, email: e.target.value }))
          }
          className="w-full px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
        />
      </div>

      {/* Téléphone */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.candidate.form.phone}
        </label>
        <input
          type="tel"
          value={formData.telephone}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, telephone: e.target.value }))
          }
          className="w-full px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
        />
      </div>

      {/* Adresse */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.candidate.form.address}
        </label>
        <input
          type="text"
          value={formData.adresse}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, adresse: e.target.value }))
          }
          className="w-full px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
        />
      </div>

      {/* Ville */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.candidate.form.city} <span className="text-red-500">*</span>
        </label>
        <CityAutocomplete
          value={formData.ville_residence}
          onChange={(city) => setFormData((prev) => ({ ...prev, ville_residence: city }))}
        />
      </div>

      {/* Catégorie */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.candidate.form.category} <span className="text-red-500">*</span>
        </label>
        <select
          value={formData.category}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, category: e.target.value }))
          }
          className="w-full px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
          required
        >
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>
              {t.candidate.categories[cat as keyof typeof t.candidate.categories] ||
                cat}
            </option>
          ))}
        </select>
      </div>

      {/* Diplôme */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.candidate.form.diplome || 'Diplôme'}
        </label>
        <select
          value={formData.diplome}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, diplome: e.target.value }))
          }
          className="w-full px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
        >
          <option value="">{t.candidate.form.diplomeSelect || 'Sélectionnez votre diplôme'}</option>
          {DIPLOMES.map((dip) => (
            <option key={dip} value={dip}>
              {dip}
            </option>
          ))}
        </select>
      </div>

      {/* Compétences */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.candidate.form.skills}
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
            className="flex-1 px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] placeholder-gray-500"
            placeholder={t.candidate.form.skillsPlaceholder}
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
          {formData.competences.map((skill, index) => (
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

      {/* Années d'expérience */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.candidate.form.experienceYears}
        </label>
        <input
          type="number"
          min="0"
          max="50"
          value={formData.annees_experience}
          onChange={(e) =>
            setFormData((prev) => ({
              ...prev,
              annees_experience: parseInt(e.target.value, 10) || 0,
            }))
          }
          className="w-full px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
        />
      </div>

      {/* Langues */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.candidate.form.languages}
        </label>
        <div className="flex gap-2 mb-2">
          <input
            type="text"
            value={languageInput}
            onChange={(e) => setLanguageInput(e.target.value)}
            onKeyPress={(e) =>
              e.key === 'Enter' && (e.preventDefault(), addLanguage())
            }
            className="flex-1 px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] placeholder-gray-500"
            placeholder={t.candidate.form.languagesPlaceholder}
          />
          <button
            type="button"
            onClick={addLanguage}
            className="px-4 py-2 bg-[#D4AF37] text-[#4A1D43] rounded-lg hover:bg-[#C19B2F] transition-colors font-semibold"
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.languages.map((lang, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#4A1D43]/30 text-[#D4AF37] border border-[#D4AF37] rounded-full text-sm"
            >
              {lang}
              <button type="button" onClick={() => removeLanguage(index)}>
                <X className="w-4 h-4" />
              </button>
            </span>
          ))}
        </div>
      </div>

      {/* Types de contrat */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.candidate.form.desiredContracts}
        </label>
        <div className="flex flex-wrap gap-2">
          {CONTRACT_TYPES.map((contract) => (
            <button
              key={contract}
              type="button"
              onClick={() => toggleContract(contract)}
              className={`px-4 py-2 rounded-lg border transition-colors ${
                formData.contrats_souhaites.includes(contract)
                  ? 'bg-[#D4AF37] text-[#4A1D43] border-[#D4AF37] font-semibold'
                  : 'bg-[#2A1525] text-[#F5F5DC] border-[#D4AF37] hover:bg-[#4A1D43]/20'
              }`}
            >
              {contract}
            </button>
          ))}
        </div>
      </div>

      {/* Disponibilité */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.candidate.form.availability}
        </label>
        <input
          type="text"
          value={formData.availability}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, availability: e.target.value }))
          }
          className="w-full px-4 py-2 bg-[#2A1525] text-[#F5F5DC] border border-[#D4AF37] rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
          placeholder={t.candidate.form.availabilityPlaceholder}
        />
      </div>

      {/* Upload CV */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.candidate.form.cvUpload}
        </label>
        <div className="flex items-center gap-4">
          <label className="flex-1 flex items-center justify-center gap-2 px-4 py-3 border-2 border-dashed border-[#D4AF37] rounded-lg cursor-pointer hover:border-[#C19B2F] transition-colors bg-[#2A1525]">
            <Upload className="w-5 h-5 text-[#D4AF37]" />
            <span className="text-sm text-[#F5F5DC]">
              {uploading ? t.candidate.form.uploading : t.candidate.form.uploadPdf}
            </span>
            <input
              type="file"
              accept=".pdf"
              onChange={handleCVUpload}
              className="hidden"
              disabled={uploading}
            />
          </label>
          {formData.cv_url && (
            <a
              href={formData.cv_url}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm text-[#D4AF37] hover:text-[#C19B2F] border border-[#D4AF37] rounded-lg hover:bg-[#4A1D43]/20 transition-colors"
            >
              {t.candidate.form.viewCv}
            </a>
          )}
        </div>
      </div>

      {/* Visibilité */}
      <div>
        <label className="block text-sm font-medium text-[#F5F5DC] mb-2">
          {t.candidate.form.visibility}
        </label>
        <div className="flex gap-4">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="public"
              checked={formData.visibility === 'public'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  visibility: e.target.value as 'public',
                }))
              }
              className="w-4 h-4 text-[#D4AF37] focus:ring-[#D4AF37]"
            />
            <span className="text-sm text-[#F5F5DC]">
              {t.candidate.form.visibilityPublic}
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="radio"
              value="private"
              checked={formData.visibility === 'private'}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  visibility: e.target.value as 'private',
                }))
              }
              className="w-4 h-4 text-[#D4AF37] focus:ring-[#D4AF37]"
            />
            <span className="text-sm text-[#F5F5DC]">
              {t.candidate.form.visibilityPrivate}
            </span>
          </label>
        </div>
      </div>

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
                {t.candidate.form.premiumProfile || 'Profil Premium'}
              </span>
              <span className="px-2 py-0.5 bg-gradient-to-r from-[#D4AF37] to-[#C19B2F] text-[#4A1D43] text-xs font-bold rounded-full">
                PREMIUM
              </span>
            </div>
            <p className="text-xs text-[#E8D5C4]">
              {t.candidate.form.premiumDescription || 'Mettez en avant votre profil avec un badge doré visible par les entreprises'}
            </p>
          </div>
        </label>
      </div>

      {/* Bouton submit */}
      <div className="flex justify-end">
        <button
          type="submit"
          disabled={saving || uploading}
          className="px-6 py-3 bg-white text-[#4A1D43] rounded-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 border-2 border-[#D4AF37] font-semibold"
        >
          {saving && (
            <span className="inline-block w-4 h-4 border-2 border-[#4A1D43] border-t-transparent rounded-full animate-spin" />
          )}
          {t.candidate.form.submit}
        </button>
      </div>
    </form>
  );
}


