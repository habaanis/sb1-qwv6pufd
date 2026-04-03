import { useState, useEffect, useRef } from 'react';
import { MapPin } from 'lucide-react';
import { searchCities } from '../lib/BoltDatabase';

interface City {
  name_fr: string;
  name_ar?: string;
  governorate_fr?: string;
}

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function CityAutocomplete({ value, onChange, placeholder = 'Ville', className = '' }: CityAutocompleteProps) {
  const [cities, setCities] = useState<City[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const fetchCities = async () => {
      if (value.length >= 2) {
        setIsLoading(true);
        const results = await searchCities(value);
        setCities(results);
        setShowDropdown(results.length > 0);
        setIsLoading(false);
      } else {
        setCities([]);
        setShowDropdown(false);
      }
    };

    const debounce = setTimeout(() => {
      fetchCities();
    }, 300);

    return () => clearTimeout(debounce);
  }, [value]);

  const handleSelect = (city: City) => {
    onChange(city.name_fr);
    setShowDropdown(false);
    setCities([]);
  };

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <MapPin className="w-4 h-4 text-gray-400" />
      </span>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={`w-full pl-9 pr-3 py-3 rounded-lg border border-gray-200 focus:ring-2 focus:ring-orange-200 focus:border-orange-300 outline-none text-sm ${className}`}
        autoComplete="off"
      />
      {showDropdown && cities.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          {cities.map((city, index) => (
            <button
              key={index}
              onClick={() => handleSelect(city)}
              className="w-full px-4 py-2.5 text-left hover:bg-gray-50 transition-colors flex items-start gap-2 border-b border-gray-100 last:border-b-0"
            >
              <MapPin className="w-4 h-4 text-orange-600 mt-0.5 flex-shrink-0" />
              <div className="flex-1">
                <div className="text-sm font-medium text-gray-900">{city.name_fr}</div>
                {city.governorate_fr && (
                  <div className="text-xs text-gray-500">{city.governorate_fr}</div>
                )}
              </div>
            </button>
          ))}
        </div>
      )}
      {isLoading && value.length >= 2 && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <div className="animate-spin rounded-full h-4 w-4 border-2 border-orange-600 border-t-transparent"></div>
        </div>
      )}
    </div>
  );
}
