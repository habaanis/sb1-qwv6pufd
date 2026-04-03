import React from 'react';
import { X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface FilterChip {
  id: string;
  label: string;
  count?: number;
}

interface Props {
  categories: FilterChip[];
  selectedCategories: string[];
  onToggleCategory: (categoryId: string) => void;
  onClearAll?: () => void;
  className?: string;
}

export default function FilterChips({
  categories,
  selectedCategories,
  onToggleCategory,
  onClearAll,
  className = ''
}: Props) {
  const { language } = useLanguage();

  if (categories.length === 0) return null;

  const getLabel = (key: string) => {
    const labels: Record<string, Record<string, string>> = {
      clearAll: {
        fr: 'Effacer tout',
        ar: 'مسح الكل',
        en: 'Clear all'
      },
      filterBy: {
        fr: 'Filtrer par :',
        ar: 'تصفية حسب:',
        en: 'Filter by:'
      }
    };
    return labels[key]?.[language] || labels[key]?.['fr'] || key;
  };

  return (
    <div className={`bg-white rounded-lg border border-gray-200 p-3 ${className}`}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-medium text-gray-700">
          {getLabel('filterBy')}
        </span>
        {selectedCategories.length > 0 && onClearAll && (
          <button
            onClick={onClearAll}
            className="text-xs text-gray-500 hover:text-[#4A1D43] transition-colors flex items-center gap-1"
          >
            <X className="w-3 h-3" />
            {getLabel('clearAll')}
          </button>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        {categories.map((category) => {
          const isSelected = selectedCategories.includes(category.id);

          return (
            <button
              key={category.id}
              onClick={() => onToggleCategory(category.id)}
              className={`
                inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium
                transition-all duration-200 border
                ${
                  isSelected
                    ? 'bg-[#4A1D43] text-white border-[#4A1D43] shadow-[0_2px_8px_rgba(74,29,67,0.3)]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[#D4AF37] hover:bg-gray-50'
                }
              `}
            >
              <span>{category.label}</span>
              {category.count !== undefined && (
                <span
                  className={`
                    px-1.5 py-0.5 rounded-full text-[10px] font-semibold
                    ${
                      isSelected
                        ? 'bg-white/20 text-white'
                        : 'bg-gray-100 text-gray-600'
                    }
                  `}
                >
                  {category.count}
                </span>
              )}
              {isSelected && (
                <X className="w-3 h-3 ml-0.5" />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
