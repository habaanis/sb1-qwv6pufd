import React from 'react';
import { Building2, MapPin, Clock, Briefcase, Award } from 'lucide-react';
import { JobPosting } from '../hooks/useJobSearch';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';

interface JobCardProps {
  job: JobPosting;
  onClick: () => void;
}

export default function JobCard({ job, onClick }: JobCardProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const getContractLabel = (type?: string) => {
    if (!type) return job.type_contrat || '';
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

  const getSeniorityLabel = (level?: string) => {
    if (!level) return null;
    const labels: Record<string, string> = {
      'junior': t.jobPost?.seniority?.junior || 'Junior',
      'mid': t.jobPost?.seniority?.mid || 'Intermédiaire',
      'senior': t.jobPost?.seniority?.senior || 'Senior',
      'all': t.jobPost?.seniority?.all || 'Tous niveaux'
    };
    return labels[level] || level;
  };

  const displayDescription = job.description_poste || job.description || '';
  const topSkills = (job.competences_cles || job.skills || []).slice(0, 6);

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all cursor-pointer border border-gray-100 hover:border-orange-300 p-6"
    >
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-gray-900 mb-2 hover:text-orange-600 transition-colors">
            {job.titre_poste || job.title}
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-3">
            <div className="flex items-center gap-2">
              <Building2 className="w-4 h-4 text-orange-600" />
              <span className="font-medium">{job.nom_entreprise || job.company}</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-blue-600" />
              <span>{job.ville || job.city}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-green-600" />
              <span>{getContractLabel(job.type_contrat || job.contract_type)}</span>
            </div>
            {(job.niveau_experience || job.seniority) && (
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 text-purple-600" />
                <span>{getSeniorityLabel(job.niveau_experience || job.seniority)}</span>
              </div>
            )}
          </div>

          <p className="text-gray-600 line-clamp-2 mb-3">
            {displayDescription}
          </p>

          {topSkills.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {topSkills.map((skill, idx) => (
                <span
                  key={idx}
                  className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-50 text-orange-700 border border-orange-200"
                >
                  {skill}
                </span>
              ))}
              {(job.competences_cles || job.skills || []).length > 6 && (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  +{(job.competences_cles || job.skills || []).length - 6}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center md:items-start">
          <button className="px-6 py-3 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg hover:shadow-lg hover:from-orange-600 hover:to-orange-700 transition-all font-medium whitespace-nowrap">
            {t.common?.viewDetails || 'Voir l\'offre'}
          </button>
        </div>
      </div>
    </div>
  );
}
