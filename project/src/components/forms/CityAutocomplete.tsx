import React from 'react';

interface CityAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
}

export default function CityAutocomplete({ value, onChange }: CityAutocompleteProps) {
  return (
    <input
      type="text"
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
      placeholder="Votre ville"
    />
  );
}
