import { Search } from 'lucide-react';
import LocationSelectTunisie from './LocationSelectTunisie';
import { SANTE_CATEGORIES } from '../lib/santeCategories';

interface HealthSearchBarProps {
  searchTerm: string;
  onSearchTermChange: (value: string) => void;
  selectedGouvernorat: string;
  onSelectedGouvernoratChange: (value: string) => void;
  selectedCategory: string;
  onSelectedCategoryChange: (value: string) => void;
  onSearch: () => void;
}

export default function HealthSearchBar({
  searchTerm,
  onSearchTermChange,
  selectedGouvernorat,
  onSelectedGouvernoratChange,
  selectedCategory,
  onSelectedCategoryChange,
  onSearch,
}: HealthSearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col md:flex-row gap-3">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchTermChange(e.target.value)}
              placeholder="Que cherchez-vous ? (Médecin, pharmacie, clinique, spécialité...)"
              className="w-full pl-10 pr-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition"
            />
          </div>

          <div className="md:w-64">
            <LocationSelectTunisie
              value={selectedGouvernorat}
              onChange={onSelectedGouvernoratChange}
              placeholder="Gouvernorat"
            />
          </div>

          <div className="md:w-72">
            <select
              value={selectedCategory}
              onChange={(e) => onSelectedCategoryChange(e.target.value)}
              className="w-full px-4 py-3 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-rose-500 outline-none transition bg-white"
            >
              {SANTE_CATEGORIES.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            className="px-6 py-3 bg-rose-600 text-white text-sm font-medium rounded-lg hover:bg-rose-700 transition-colors shadow-sm"
          >
            Rechercher
          </button>
          <button
            type="button"
            onClick={() => {
              onSearchTermChange('');
              onSelectedGouvernoratChange('');
              onSelectedCategoryChange('');
              onSearch();
            }}
            className="px-6 py-3 bg-white text-gray-700 text-sm font-medium rounded-lg border border-gray-300 hover:bg-gray-50 transition-colors"
          >
            Réinitialiser
          </button>
        </div>
      </div>
    </form>
  );
}
