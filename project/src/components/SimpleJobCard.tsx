import { MapPin, Clock } from 'lucide-react';
import { SimpleJobPosting } from '../hooks/useSimpleJobSearch';

interface SimpleJobCardProps {
  job: SimpleJobPosting;
  onClick: () => void;
}

export default function SimpleJobCard({ job, onClick }: SimpleJobCardProps) {
  const getContractLabel = (type?: string | null) => {
    if (!type) return 'Non spécifié';
    const labels: Record<string, string> = {
      'CDI': 'CDI',
      'CDD': 'CDD',
      'Intérim': 'Intérim',
      'Stage': 'Stage',
      'Freelance': 'Freelance',
      'full-time': 'Temps plein',
      'part-time': 'Temps partiel',
      'contract': 'Contrat',
      'internship': 'Stage'
    };
    return labels[type] || type;
  };

  const isNew = () => {
    const createdDate = new Date(job.created_at);
    const now = new Date();
    const diffInDays = (now.getTime() - createdDate.getTime()) / (1000 * 60 * 60 * 24);
    return diffInDays <= 7;
  };

  const truncateDescription = (text: string, maxLength: number = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const displayDescription = job.description_poste || job.description || '';
  const displayContractType = job.type_contrat || job.contract_type;
  const isPremium = job.is_premium;

  return (
    <div
      onClick={onClick}
      className="bg-white hover:bg-gray-50 rounded-lg transition-all cursor-pointer border border-[#D4AF37] p-4 hover:shadow-lg max-w-3xl mx-auto"
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-sm font-semibold text-[#4A1D43] hover:text-[#800020] transition-colors line-clamp-1">
              {job.titre_poste || job.title}
            </h3>
            {isNew() && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-medium bg-[#D4AF37]/15 text-[#800020] border border-[#D4AF37]">
                Nouveau
              </span>
            )}
            {isPremium && (
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-md text-xs font-bold bg-gradient-to-r from-[#800020] to-[#4A1D43] text-[#D4AF37] border border-[#D4AF37] shadow-sm">
                Premium
              </span>
            )}
          </div>

          <div className="space-y-1">
            <p className="text-sm font-medium text-[#800020]">{job.nom_entreprise || job.company}</p>

            <div className="flex items-center gap-4 text-xs text-gray-600">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3 text-[#800020]" />
                {job.ville || job.city}
              </span>
              {displayContractType && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-[#800020]" />
                  {getContractLabel(displayContractType)}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex-shrink-0">
          <button className="px-5 py-2 bg-gradient-to-r from-[#800020] to-[#4A1D43] text-white rounded-lg hover:from-[#900030] hover:to-[#5A2D53] transition-all text-sm font-semibold border border-[#D4AF37] shadow-md hover:shadow-lg">
            Voir
          </button>
        </div>
      </div>
    </div>
  );
}
