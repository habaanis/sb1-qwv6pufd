import { useState } from 'react';
import { Search, MapPin } from 'lucide-react';
import { LOISIRS_CATEGORIES_KEYS } from '../lib/loisirCategories';
import { GOUVERNORATS_TUNISIE } from '../lib/tunisiaLocations';
import { useLanguage } from '../context/LanguageContext';
import { translations } from '../lib/i18n';

interface LoisirSearchBarProps {
  onSearch: (searchTerm: string, ville: string, category: string) => void;
}

export default function LoisirSearchBar({ onSearch }: LoisirSearchBarProps) {
  const [loisirSearchTerm, setLoisirSearchTerm] = useState('');
  const [selectedLoisirVille, setSelectedLoisirVille] = useState('');
  const [selectedLoisirCategory, setSelectedLoisirCategory] = useState('');
  const { language } = useLanguage();
  const t = translations[language];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(loisirSearchTerm, selectedLoisirVille, selectedLoisirCategory);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-lg p-6 border border-orange-100">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Que cherchez-vous ?
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              value={loisirSearchTerm}
              onChange={(e) => setLoisirSearchTerm(e.target.value)}
              placeholder="Café culturel, musée, site archéologique, expo..."
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all"
            />
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gouvernorat
            </label>
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedLoisirVille}
                onChange={(e) => setSelectedLoisirVille(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all appearance-none bg-white"
              >
                <option value="">Tous les gouvernorats</option>
                {GOUVERNORATS_TUNISIE.map((gov) => (
                  <option key={gov} value={gov}>
                    {gov}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de loisir
            </label>
            <select
              value={selectedLoisirCategory}
              onChange={(e) => setSelectedLoisirCategory(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none transition-all appearance-none bg-white"
            >
              {LOISIRS_CATEGORIES_KEYS.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.emoji} {cat.emoji && ' '}{t.citizens.leisureCategories[cat.key as keyof typeof t.citizens.leisureCategories]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <button
          type="submit"
          className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-red-600 text-white rounded-lg hover:shadow-lg transition-all font-semibold"
        >
          <Search className="w-5 h-5" />
          Rechercher
        </button>
      </div>
    </form>
  );
}
