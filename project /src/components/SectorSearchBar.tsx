import { useState, useEffect } from 'react';
import { Search, MapPin, Filter } from 'lucide-react';
import { useSectorCategories } from '../hooks/useSectorCategories';
import LocationSelectTunisie from './LocationSelectTunisie';

interface SectorSearchBarProps {
  secteur: string;
  onSearch: (params: SearchParams) => void;
  placeholder?: string;
  cityPlaceholder?: string;
  showFilters?: boolean;
  isRTL?: boolean;
  className?: string;
}

export interface SearchParams {
  keyword: string;
  city: string;
  categorie: string;
  subCategory: string;
}

export default function SectorSearchBar({
  secteur,
  onSearch,
  placeholder = 'Rechercher...',
  cityPlaceholder = 'Ville ou délégation',
  showFilters = true,
  isRTL = false,
  className = ''
}: SectorSearchBarProps) {
  const [keyword, setKeyword] = useState('');
  const [city, setCity] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState('all');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  const { categories, subCategories, loading, loadSubCategoriesByCategory } = useSectorCategories(secteur);

  useEffect(() => {
    if (selectedCategory && selectedCategory !== 'all') {
      loadSubCategoriesByCategory(selectedCategory);
    } else {
      setSelectedSubCategory('all');
    }
  }, [selectedCategory]);

  const handleSearch = () => {
    onSearch({
      keyword,
      city,
      categorie: selectedCategory === 'all' ? '' : selectedCategory,
      subCategory: selectedSubCategory === 'all' ? '' : selectedSubCategory
    });
  };

  const handleReset = () => {
    setKeyword('');
    setCity('');
    setSelectedCategory('all');
    setSelectedSubCategory('all');
    onSearch({
      keyword: '',
      city: '',
      categorie: '',
      subCategory: ''
    });
  };

  return (
    <div className={`bg-white rounded-2xl p-6 shadow-lg ${className}`}>
      <div className={`flex flex-col md:flex-row gap-3 ${isRTL ? 'md:flex-row-reverse' : ''}`}>
        {/* Keyword Search */}
        <div className="flex-1 relative">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400`} />
          <input
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
            placeholder={placeholder}
            className={`w-full ${isRTL ? 'pr-10 text-right' : 'pl-10'} py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900`}
          />
        </div>

        {/* Governorate Search */}
        <div className="md:w-72">
          <LocationSelectTunisie
            value={city}
            onChange={setCity}
            placeholder={cityPlaceholder}
          />
        </div>

        {/* Mobile Filter Toggle */}
        <button
          onClick={() => setShowFiltersMobile(!showFiltersMobile)}
          className="md:hidden px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition flex items-center justify-center gap-2"
        >
          <Filter className="w-5 h-5" />
          Filtres
        </button>
      </div>

      {/* Category and Sub-Category Filters */}
      {showFilters && (
        <div className={`mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 ${showFiltersMobile ? 'block' : 'hidden md:grid'}`}>
          {/* Category Select */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            disabled={loading}
            className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
          >
            <option value="all">Toutes les catégories</option>
            {categories.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label} {cat.count ? `(${cat.count})` : ''}
              </option>
            ))}
          </select>

          {/* Sub-Category Select (only if a category is selected and has sub-categories) */}
          {selectedCategory !== 'all' && subCategories.length > 0 && (
            <select
              value={selectedSubCategory}
              onChange={(e) => setSelectedSubCategory(e.target.value)}
              disabled={loading}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-900 text-sm"
            >
              <option value="all">Toutes les sous-catégories</option>
              {subCategories.map((subCat) => (
                <option key={subCat.value} value={subCat.value}>
                  {subCat.label} {subCat.count ? `(${subCat.count})` : ''}
                </option>
              ))}
            </select>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className={`mt-4 flex ${isRTL ? 'flex-row-reverse' : ''} gap-3`}>
        <button
          onClick={handleSearch}
          className="flex-1 px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition shadow-md"
        >
          Rechercher
        </button>
        <button
          onClick={handleReset}
          className="px-6 py-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 border border-gray-300 transition"
        >
          Réinitialiser
        </button>
      </div>
    </div>
  );
}
