import { Search, Building2 } from 'lucide-react';
import LocationSelectTunisie from './LocationSelectTunisie';
import { JOB_SECTORS } from '../lib/jobSectors';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';

interface JobSearchBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedGouvernorat: string;
  onSelectedGouvernoratChange: (value: string) => void;
  selectedJobSector: string;
  onSelectedJobSectorChange: (value: string) => void;
  companyName: string;
  onCompanyNameChange: (value: string) => void;
  onSearch: () => void;
}

export default function JobSearchBar({
  searchTerm,
  onSearchTermChange,
  selectedGouvernorat,
  onSelectedGouvernoratChange,
  selectedJobSector,
  onSelectedJobSectorChange,
  companyName,
  onCompanyNameChange,
  onSearch
}: JobSearchBarProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  const getSectorLabel = (sectorValue: string) => {
    const mapping: { [key: string]: keyof typeof t.jobs.search.domains } = {
      'Commerce & vente': 'commerce',
      'Hôtellerie & restauration': 'hospitality',
      'Administration & bureautique': 'administration',
      'Informatique & digital': 'it',
      'Santé & paramédical': 'health',
      'Éducation & formation': 'education',
      'Industrie & logistique': 'industry',
      'Artisanat & métiers manuels': 'crafts',
      'Services à la personne': 'services',
      'Autres métiers': 'other'
    };

    const key = mapping[sectorValue];
    return key ? t.jobs.search.domains[key] : sectorValue;
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6" style={{ border: '1.5px solid #D4AF37' }}>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.jobs.search.labelPosition}
          </label>
          <Search className="absolute left-3 bottom-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.jobs.search.placeholderPosition}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all text-sm text-gray-900"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.jobs.search.labelLocation}
          </label>
          <LocationSelectTunisie
            value={selectedGouvernorat}
            onChange={onSelectedGouvernoratChange}
            placeholder={t.jobs.search.placeholderLocation}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.jobs.search.labelDomain}
          </label>
          <select
            value={selectedJobSector}
            onChange={(e) => onSelectedJobSectorChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all text-sm bg-white text-gray-900"
          >
            <option value="" className="text-gray-900 bg-white">
              {t.jobs.search.domains.all}
            </option>
            {JOB_SECTORS.map((sector) => (
              <option key={sector.value} value={sector.value} className="text-gray-900 bg-white">
                {getSectorLabel(sector.value)}
              </option>
            ))}
          </select>
        </div>

        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {t.jobs.search.labelCompany}
          </label>
          <Building2 className="absolute left-3 bottom-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={t.jobs.search.placeholderCompany}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none transition-all text-sm text-gray-900"
          />
        </div>
      </div>

      <div className="mt-4 text-center text-xs text-gray-500">
        {t.jobs.search.autoUpdate}
      </div>
    </div>
  );
}
