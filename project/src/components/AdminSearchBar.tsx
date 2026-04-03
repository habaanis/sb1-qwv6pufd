import { Search } from 'lucide-react';
import LocationSelectTunisie from './LocationSelectTunisie';
import { ADMIN_CATEGORIES } from '../lib/adminCategories';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';

interface AdminSearchBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedGouvernorat: string;
  onSelectedGouvernoratChange: (value: string) => void;
  selectedCategory: string;
  onSelectedCategoryChange: (value: string) => void;
  onSearch: () => void;
}

export default function AdminSearchBar({
  searchTerm,
  onSearchTermChange,
  selectedGouvernorat,
  onSelectedGouvernoratChange,
  selectedCategory,
  onSelectedCategoryChange,
  onSearch
}: AdminSearchBarProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSearch();
    }
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Champ de recherche texte */}
        <div className="relative">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Que cherchez-vous ?
          </label>
          <Search className="absolute left-3 bottom-3 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Banque, microfinance, assurance..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm"
          />
        </div>

        {/* Sélecteur de gouvernorat */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Gouvernorat
          </label>
          <LocationSelectTunisie
            value={selectedGouvernorat}
            onChange={onSelectedGouvernoratChange}
            placeholder="Tous les gouvernorats"
          />
        </div>

        {/* Menu déroulant type de service */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type de service
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onSelectedCategoryChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all text-sm bg-white"
          >
            <option value="">Tous les services</option>
            {ADMIN_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={onSearch}
          className="px-8 py-3 bg-gradient-to-r from-orange-600 to-orange-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
        >
          {t.common.search}
        </button>
      </div>
    </div>
  );
}
