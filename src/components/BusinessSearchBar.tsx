import { Search, Building2 } from 'lucide-react';
import LocationSelectTunisie from './LocationSelectTunisie';
import { ENTREPRISE_CATEGORIES } from '../lib/entrepriseCategories';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';

interface BusinessSearchBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedCity: string;
  onSelectedCityChange: (value: string) => void;
  selectedCategory: string;
  onSelectedCategoryChange: (value: string) => void;
  onSearch?: () => void;
}

export default function BusinessSearchBar({
  searchTerm,
  onSearchTermChange,
  selectedCity,
  onSelectedCityChange,
  selectedCategory,
  onSelectedCategoryChange,
  onSearch
}: BusinessSearchBarProps) {
  const { language } = useLanguage();
  const t = useTranslation(language);

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && onSearch) {
      onSearch();
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 isolate" style={{ border: '2px solid #D4AF37', position: 'relative', zIndex: 10 }}>
      <div className="space-y-4">
        <div className="relative" style={{ zIndex: 10 }}>
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#4A1D43] pointer-events-none z-10" />
          <input
            type="text"
            placeholder="Recherche intelligente : nom, métier, badges, mots-clés..."
            value={searchTerm}
            onChange={(e) => onSearchTermChange(e.target.value)}
            onKeyPress={handleKeyPress}
            autoComplete="off"
            style={{ position: 'relative', zIndex: 1 }}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none bg-white"
          />
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div style={{ position: 'relative', zIndex: 2 }}>
            <LocationSelectTunisie
              value={selectedCity}
              onChange={onSelectedCityChange}
              placeholder={t.businesses?.allCities || 'Tous les gouvernorats'}
              className="px-4 py-3 border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37]"
            />
          </div>

          <div className="relative" style={{ zIndex: 2 }}>
            <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
              <Building2 className="w-4 h-4 text-[#4A1D43]" />
            </span>
            <select
              value={selectedCategory}
              onChange={(e) => onSelectedCategoryChange(e.target.value)}
              style={{ position: 'relative', zIndex: 1 }}
              className="w-full pl-9 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none bg-white cursor-pointer"
            >
              <option value="">Toutes les catégories</option>
              {ENTREPRISE_CATEGORIES.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
