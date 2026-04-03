import { Search } from 'lucide-react';
import LocationSelectTunisie from './LocationSelectTunisie';
import { EDUCATION_CATEGORIES } from '../lib/educationCategories';

interface EducationSearchBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedGouvernorat: string;
  onSelectedGouvernoratChange: (value: string) => void;
  selectedCategory: string;
  onSelectedCategoryChange: (value: string) => void;
  onSearch: () => void;
}

export default function EducationSearchBar({
  searchTerm,
  onSearchTermChange,
  selectedGouvernorat,
  onSelectedGouvernoratChange,
  selectedCategory,
  onSelectedCategoryChange,
  onSearch
}: EducationSearchBarProps) {
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
            placeholder="École primaire, lycée, université..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm"
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

        {/* Menu déroulant type d'établissement */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Type d'établissement
          </label>
          <select
            value={selectedCategory}
            onChange={(e) => onSelectedCategoryChange(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all text-sm bg-white text-gray-900"
          >
            <option value="" className="text-gray-900 bg-white">Tous les types</option>
            {EDUCATION_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value} className="text-gray-900 bg-white">
                {cat.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="mt-4 flex justify-center">
        <button
          onClick={onSearch}
          className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg hover:shadow-lg transition-all font-medium"
        >
          Rechercher
        </button>
      </div>
    </div>
  );
}
