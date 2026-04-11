import { useState, useEffect, useRef } from 'react';
import { Search, Loader2 } from 'lucide-react';

interface SpecialtyAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const MEDICAL_SPECIALTIES = [
  'Médecin généraliste',
  'Cardiologue',
  'Dermatologue',
  'Gynécologue',
  'Pédiatre',
  'Ophtalmologue',
  'Dentiste',
  'Psychiatre',
  'Orthopédiste',
  'ORL',
  'Radiologue',
  'Neurologue',
  'Urologue',
  'Endocrinologue',
  'Rhumatologue',
  'Gastro-entérologue',
  'Pneumologue',
  'Néphrologue',
  'Chirurgien',
  'Anesthésiste',
  'Sage-femme',
  'Infirmier',
  'Kinésithérapeute',
  'Psychologue',
  'Nutritionniste',
  'Diététicien',
  'Pharmacien',
  'Orthophoniste',
  'Laboratoire d\'analyse',
  'Centre de dialyse',
  'Clinique',
  'Hôpital',
  'Cabinet médical',
  'Centre de santé',
];

export default function SpecialtyAutocomplete({
  value,
  onChange,
  placeholder = 'Spécialité médicale',
  className = ''
}: SpecialtyAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState<string[]>([]);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value.length >= 2) {
      const filtered = MEDICAL_SPECIALTIES.filter(specialty =>
        specialty.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
      setIsOpen(filtered.length > 0);
    } else {
      setFilteredOptions([]);
      setIsOpen(false);
    }
  }, [value]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (specialty: string) => {
    onChange(specialty);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen || filteredOptions.length === 0) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setHighlightedIndex(prev =>
          prev < filteredOptions.length - 1 ? prev + 1 : prev
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : 0));
        break;
      case 'Enter':
        e.preventDefault();
        if (highlightedIndex >= 0) {
          handleSelect(filteredOptions[highlightedIndex]);
        }
        break;
      case 'Escape':
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  return (
    <div ref={wrapperRef} className={`relative ${className}`}>
      <div className="relative">
        <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
          <Search className="w-4 h-4 text-gray-400" />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (value.length >= 2 && filteredOptions.length > 0) {
              setIsOpen(true);
            }
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none text-sm"
        />
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map((specialty, index) => {
            const lowerSpecialty = specialty.toLowerCase();
            const lowerValue = value.toLowerCase();
            const startIndex = lowerSpecialty.indexOf(lowerValue);

            return (
              <button
                key={specialty}
                type="button"
                onClick={() => handleSelect(specialty)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-b border-gray-100 last:border-0
                  ${highlightedIndex === index ? 'bg-orange-50 text-orange-900' : 'hover:bg-gray-50 text-gray-700'}
                `}
              >
                <div className="flex items-center gap-2">
                  <span className="text-lg">🏥</span>
                  <span>
                    {startIndex >= 0 ? (
                      <>
                        {specialty.substring(0, startIndex)}
                        <span className="font-semibold text-orange-600">
                          {specialty.substring(startIndex, startIndex + value.length)}
                        </span>
                        {specialty.substring(startIndex + value.length)}
                      </>
                    ) : (
                      specialty
                    )}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
