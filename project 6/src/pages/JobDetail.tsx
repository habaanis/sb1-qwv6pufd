import React, { useState, useEffect } from 'react';
import { X, Building2, MapPin, Clock, Award, DollarSign, Mail, Phone, Calendar, Loader, Users } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { JobPosting } from '../hooks/useJobSearch';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';

interface JobDetailProps {
  jobId: string;
  onClose: () => void;
}

export default function JobDetail({ jobId, onClose }: JobDetailProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [job, setJob] = useState<JobPosting | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isOwner, setIsOwner] = useState(false);

  useEffect(() => {
    loadJob();
  }, [jobId]);

  async function loadJob() {
    try {
      setLoading(true);
      setError(null);

      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();

      const { data, error: fetchError } = await supabase
        .from('job_postings')
        .select('*')
        .eq('id', jobId)
        .eq('statut', 'active')
        .maybeSingle();

      if (fetchError) throw fetchError;

      if (!data) {
        setError('Offre non trouvée ou expirée');
        return;
      }

      setJob(data as JobPosting);

      // Vérifier si l'utilisateur est le créateur de l'offre
      if (user && data.created_by === user.id) {
        setIsOwner(true);
      }
    } catch (err) {
      console.error('Error loading job:', err);
      setError('Impossible de charger l\'offre');
    } finally {
      setLoading(false);
    }
  }

  const getContractLabel = (type?: string | null) => {
    if (!type) return '';
    const labels: Record<string, string> = {
      'CDI': 'CDI',
      'CDD': 'CDD',
      'Intérim': 'Intérim',
      'Stage': 'Stage',
      'Freelance': 'Freelance',
      'full-time': t.jobs?.filter?.fullTime || 'Temps plein',
      'part-time': t.jobs?.filter?.partTime || 'Temps partiel',
      'contract': t.jobs?.filter?.contract || 'Contrat',
      'internship': t.jobs?.filter?.internship || 'Stage'
    };
    return labels[type] || type;
  };

  const getSeniorityLabel = (level?: string | null) => {
    if (!level) return null;
    const labels: Record<string, string> = {
      'junior': t.jobPost?.seniority?.junior || 'Junior (0-2 ans)',
      'mid': t.jobPost?.seniority?.mid || 'Intermédiaire (3-5 ans)',
      'senior': t.jobPost?.seniority?.senior || 'Senior (5+ ans)',
      'all': t.jobPost?.seniority?.all || 'Tous niveaux'
    };
    return labels[level] || level;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl p-12 border border-gray-700">
          <Loader className="w-12 h-12 animate-spin text-[#D4AF37] mx-auto" />
        </div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl p-8 max-w-md border border-gray-700">
          <h3 className="text-xl font-bold text-red-400 mb-4">{t.common?.error || 'Erreur'}</h3>
          <p className="text-gray-300 mb-6">{error}</p>
          <button
            onClick={onClose}
            className="w-full px-6 py-3 bg-[#4A1D43] text-white rounded-lg hover:bg-[#3A1533] transition-colors"
          >
            {t.common?.close || 'Fermer'}
          </button>
        </div>
      </div>
    );
  }

  const displayDescription = job.description_poste || job.description || '';
  const displayRequirements = job.exigences_profil || job.requirements || '';
  const displaySkills = job.competences_cles || job.skills || [];
  const salaryDisplay = job.salaire_min && job.salaire_max
    ? `${job.salaire_min} - ${job.salaire_max} TND/mois`
    : null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1A1A1A] rounded-2xl shadow-2xl max-w-4xl w-full my-8 border-[1.5px] border-[#D4AF37]">
        {/* Header */}
        <div className="sticky top-0 bg-[#4A1D43] text-white px-8 py-8 rounded-t-2xl">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 hover:bg-white/20 rounded-full transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
          <h1 className="text-3xl font-bold mb-3">{job.titre_poste || job.title}</h1>
          <div className="flex flex-wrap items-center gap-4 text-[#F5F5DC]">
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-[#D4AF37]" />
              <span className="font-semibold">{job.nom_entreprise || job.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-[#D4AF37]" />
              <span>{job.ville || job.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-[#D4AF37]" />
              <span>{getContractLabel(job.type_contrat || job.contract_type)}</span>
            </div>
            {(job.niveau_experience || job.seniority) && (
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-[#D4AF37]" />
                <span>{getSeniorityLabel(job.niveau_experience || job.seniority)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div className="p-8 space-y-6">
          {/* Salary */}
          {salaryDisplay && (
            <div className="bg-[#0F172A] border-2 border-[#D4AF37] rounded-lg p-4">
              <h3 className="text-lg font-bold text-[#D4AF37] mb-2 flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-[#D4AF37]" />
                {t.jobs?.details?.salary || 'Salaire'}
              </h3>
              <p className="text-[#D4AF37] font-semibold text-lg">{salaryDisplay}</p>
            </div>
          )}

          {/* Skills */}
          {displaySkills.length > 0 && (
            <div>
              <h3 className="text-lg font-bold text-gray-200 mb-3">
                {t.jobPost?.form?.skills || 'Compétences requises'}
              </h3>
              <div className="flex flex-wrap gap-2">
                {displaySkills.map((skill, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-[#4A1D43]/20 text-[#D4AF37] border border-[#D4AF37]"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <h3 className="text-lg font-bold text-gray-200 mb-3">
              {t.common?.description || 'Description'}
            </h3>
            <p className="text-[#F5F5DC] leading-relaxed whitespace-pre-line">
              {displayDescription}
            </p>
          </div>

          {/* Requirements */}
          {displayRequirements && (
            <div>
              <h3 className="text-lg font-bold text-gray-200 mb-3">
                {t.jobs?.details?.requirements || 'Exigences du profil'}
              </h3>
              <p className="text-[#F5F5DC] leading-relaxed whitespace-pre-line">
                {displayRequirements}
              </p>
            </div>
          )}

          {/* Contact */}
          <div className="border-t border-gray-700 pt-6">
            <h3 className="text-lg font-bold text-gray-200 mb-3">
              {t.common?.contact || 'Contact'}
            </h3>
            <div className="space-y-2">
              <div className="flex items-center gap-3 text-[#F5F5DC]">
                <Mail className="w-5 h-5 text-[#D4AF37]" />
                <a href={`mailto:${job.email_contact || job.contact_email}`} className="hover:text-[#D4AF37] transition-colors">
                  {job.email_contact || job.contact_email}
                </a>
              </div>
              {(job.telephone_contact || job.contact_phone) && (
                <div className="flex items-center gap-3 text-[#F5F5DC]">
                  <Phone className="w-5 h-5 text-[#D4AF37]" />
                  <a href={`tel:${job.telephone_contact || job.contact_phone}`} className="hover:text-[#D4AF37] transition-colors">
                    {job.telephone_contact || job.contact_phone}
                  </a>
                </div>
              )}
              <div className="flex items-center gap-3 text-[#F5F5DC] text-sm mt-4">
                <Calendar className="w-4 h-4 text-[#D4AF37]" />
                <span>
                  {t.common?.publishedOn || 'Publié le'} {new Date(job.created_at).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="border-t border-gray-700 pt-6">
            {isOwner ? (
              <button
                onClick={() => {
                  onClose();
                  window.location.hash = `#/emplois/${jobId}/candidats`;
                }}
                className="w-full px-6 py-4 bg-white text-[#4A1D43] rounded-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all font-semibold text-lg flex items-center justify-center gap-2 border-2 border-[#D4AF37]"
              >
                <Users className="w-5 h-5" />
                <span>Voir les candidats correspondants</span>
              </button>
            ) : (
              <button
                onClick={() => window.location.href = `mailto:${job.email_contact || job.contact_email}?subject=Candidature: ${job.titre_poste || job.title}`}
                className="w-full px-6 py-4 bg-white text-[#4A1D43] rounded-lg hover:shadow-[0_0_30px_rgba(212,175,55,0.5)] transition-all font-semibold text-lg border-2 border-[#D4AF37]"
              >
                {t.common?.apply || 'Postuler à cette offre'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
