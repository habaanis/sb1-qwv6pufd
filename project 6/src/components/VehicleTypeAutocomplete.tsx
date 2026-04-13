import { useState, useEffect, useRef } from 'react';
import { Ambulance } from 'lucide-react';

interface VehicleTypeAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const VEHICLE_TYPES = [
  { value: 'ambulance', label: 'Ambulance privée', icon: '🚑' },
  { value: 'voiture_adaptee', label: 'Voiture adaptée PMR', icon: '🚗' },
  { value: 'van_amenage', label: 'Van aménagé', icon: '🚐' },
  { value: 'taxi_medical', label: 'Taxi médical', icon: '🚕' },
  { value: 'vehicule_oxygene', label: 'Véhicule avec oxygène', icon: '💨' },
  { value: 'transport_dialyse', label: 'Transport dialyse', icon: '🏥' },
  { value: 'fauteuil_roulant', label: 'Transport fauteuil roulant', icon: '♿' },
  { value: 'brancard', label: 'Transport brancard', icon: '🛏️' },
];

export default function VehicleTypeAutocomplete({
  value,
  onChange,
  placeholder = 'Type de véhicule',
  className = ''
}: VehicleTypeAutocompleteProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [filteredOptions, setFilteredOptions] = useState(VEHICLE_TYPES);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (value.length >= 2) {
      const filtered = VEHICLE_TYPES.filter(type =>
        type.label.toLowerCase().includes(value.toLowerCase())
      );
      setFilteredOptions(filtered);
      setIsOpen(filtered.length > 0);
    } else if (value.length === 0) {
      setFilteredOptions(VEHICLE_TYPES);
    } else {
      setFilteredOptions(VEHICLE_TYPES);
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

  const handleSelect = (type: typeof VEHICLE_TYPES[0]) => {
    onChange(type.label);
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
          <Ambulance className="w-4 h-4 text-gray-400" />
        </span>
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            setIsOpen(true);
            setFilteredOptions(VEHICLE_TYPES);
          }}
          placeholder={placeholder}
          className="w-full pl-9 pr-3 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none text-sm"
        />
      </div>

      {isOpen && filteredOptions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {filteredOptions.map((type, index) => {
            const lowerLabel = type.label.toLowerCase();
            const lowerValue = value.toLowerCase();
            const startIndex = lowerLabel.indexOf(lowerValue);

            return (
              <button
                key={type.value}
                type="button"
                onClick={() => handleSelect(type)}
                onMouseEnter={() => setHighlightedIndex(index)}
                className={`w-full text-left px-4 py-2.5 text-sm transition-colors border-b border-gray-100 last:border-0
                  ${highlightedIndex === index ? 'bg-orange-50 text-orange-900' : 'hover:bg-gray-50 text-gray-700'}
                `}
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg">{type.icon}</span>
                  <span>
                    {startIndex >= 0 && value.length >= 2 ? (
                      <>
                        {type.label.substring(0, startIndex)}
                        <span className="font-semibold text-orange-600">
                          {type.label.substring(startIndex, startIndex + value.length)}
                        </span>
                        {type.label.substring(startIndex + value.length)}
                      </>
                    ) : (
                      type.label
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
