import React, { useState, useEffect, useRef } from 'react';
import { Plus, X } from 'lucide-react';
import { Sector, filterSkillSuggestions, normalizeSkill } from '../lib/skillsSuggestions';

interface SkillAutocompleteProps {
  sector: Sector;
  skills: string[];
  onChange: (skills: string[]) => void;
  placeholder?: string;
  maxSkills?: number;
}

export default function SkillAutocomplete({
  sector,
  skills,
  onChange,
  placeholder = 'Ex: JavaScript, React, Node.js...',
  maxSkills = 20,
}: SkillAutocompleteProps) {
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (inputValue.length >= 2) {
      const filtered = filterSkillSuggestions(sector, inputValue, 8);
      setSuggestions(filtered);
      setShowSuggestions(filtered.length > 0);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
    setSelectedIndex(-1);
  }, [inputValue, sector]);

  // Fermer les suggestions au clic extérieur
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const addSkill = (skill: string) => {
    if (!skill.trim()) return;

    const normalized = normalizeSkill(skill);

    // Vérifier si la compétence existe déjà (normalisée)
    const exists = skills.some(s => normalizeSkill(s) === normalized);

    if (!exists && skills.length < maxSkills) {
      onChange([...skills, skill.trim()]);
    }

    setInputValue('');
    setShowSuggestions(false);
    setSelectedIndex(-1);
  };

  const removeSkill = (index: number) => {
    onChange(skills.filter((_, i) => i !== index));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        addSkill(suggestions[selectedIndex]);
      } else {
        addSkill(inputValue);
      }
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, -1));
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setSelectedIndex(-1);
    }
  };

  return (
    <div ref={wrapperRef} className="relative">
      {/* Input + Bouton Ajouter */}
      <div className="flex gap-2 mb-2">
        <div className="flex-1 relative">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (inputValue.length >= 2 && suggestions.length > 0) {
                setShowSuggestions(true);
              }
            }}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            placeholder={placeholder}
            disabled={skills.length >= maxSkills}
          />

          {/* Liste de suggestions */}
          {showSuggestions && suggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => addSkill(suggestion)}
                  className={`w-full px-4 py-2 text-left hover:bg-orange-50 transition-colors ${
                    index === selectedIndex ? 'bg-orange-100' : ''
                  }`}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>

        <button
          type="button"
          onClick={() => addSkill(inputValue)}
          disabled={!inputValue.trim() || skills.length >= maxSkills}
          className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Liste des compétences ajoutées */}
      <div className="flex flex-wrap gap-2">
        {skills.map((skill, index) => (
          <span
            key={index}
            className="inline-flex items-center gap-1 px-3 py-1 bg-orange-100 text-orange-800 rounded-full text-sm"
          >
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(index)}
              className="hover:bg-orange-200 rounded-full p-0.5 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </span>
        ))}
      </div>

      {/* Indicateur limite */}
      {skills.length >= maxSkills && (
        <p className="text-xs text-gray-500 mt-2">
          Maximum de {maxSkills} compétences atteint
        </p>
      )}
    </div>
  );
}
