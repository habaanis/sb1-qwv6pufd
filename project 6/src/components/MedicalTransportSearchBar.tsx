import { useState } from 'react';
import { Search, Ambulance } from 'lucide-react';
import LocationSelectTunisie from './LocationSelectTunisie';

interface MedicalTransportSearchBarProps {
  onSearch: (filters: TransportFilters) => void;
  loading?: boolean;
}

export interface TransportFilters {
  gouvernorat: string;
  vehicleType: string;
  urgenceOnly: boolean;
}

export default function MedicalTransportSearchBar({ onSearch, loading }: MedicalTransportSearchBarProps) {
  const [gouvernorat, setGouvernorat] = useState('');
  const [vehicleType, setVehicleType] = useState('');
  const [urgenceOnly, setUrgenceOnly] = useState(false);

  const handleSearch = () => {
    onSearch({ gouvernorat, vehicleType, urgenceOnly });
  };

  const handleUrgenceToggle = () => {
    const newValue = !urgenceOnly;
    setUrgenceOnly(newValue);
    setVehicleType(newValue ? 'Ambulance' : '');
    onSearch({ gouvernorat, vehicleType: newValue ? 'Ambulance' : vehicleType, urgenceOnly: newValue });
  };

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Ligne 1: Filtres principaux */}
        <div className="grid md:grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Gouvernorat
            </label>
            <LocationSelectTunisie
              value={gouvernorat}
              onChange={(val) => {
                setGouvernorat(val);
                if (val || vehicleType || urgenceOnly) {
                  onSearch({ gouvernorat: val, vehicleType, urgenceOnly });
                }
              }}
              placeholder="Sélectionner un gouvernorat"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type de véhicule
            </label>
            <select
              value={vehicleType}
              onChange={(e) => {
                const val = e.target.value;
                setVehicleType(val);
                if (val === 'Ambulance') {
                  setUrgenceOnly(false);
                }
                onSearch({ gouvernorat, vehicleType: val, urgenceOnly: val === 'Ambulance' ? false : urgenceOnly });
              }}
              disabled={urgenceOnly}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
            >
              <option value="">Tous les types</option>
              <option value="Ambulance">🚑 Ambulance</option>
              <option value="Taxi">🚕 Taxi Médical</option>
              <option value="Taxi Collectif">🚐 Taxi Collectif</option>
              <option value="Louage">🚌 Louage</option>
            </select>
          </div>

          <div className="flex items-end">
            <button
              onClick={handleSearch}
              disabled={loading}
              className="w-full px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" />
              {loading ? 'Recherche...' : 'Rechercher'}
            </button>
          </div>
        </div>

        {/* Ligne 2: Bouton Urgences */}
        <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
          <button
            onClick={handleUrgenceToggle}
            className={`px-5 py-2.5 rounded-lg font-medium transition-all flex items-center gap-2 ${
              urgenceOnly
                ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                : 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
            }`}
          >
            <Ambulance className="w-4 h-4" />
            Urgences uniquement (24h/7j)
          </button>

          {urgenceOnly && (
            <span className="text-sm text-gray-600 animate-pulse">
              Affichage des ambulances disponibles 24h/7j
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
