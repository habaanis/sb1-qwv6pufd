import { MapPin } from 'lucide-react';
import { GOUVERNORATS_TUNISIE } from '../lib/tunisiaLocations';

interface LocationSelectTunisieProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export default function LocationSelectTunisie({
  value,
  onChange,
  placeholder = 'Dans quel gouvernorat ?',
  className = ''
}: LocationSelectTunisieProps) {
  return (
    <div className="relative flex-1" style={{ position: 'relative', zIndex: 1 }}>
      <span className="absolute inset-y-0 left-3 flex items-center pointer-events-none z-10">
        <MapPin className="w-4 h-4 text-[#4A1D43]" />
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={`w-full pl-9 pr-3 py-2 rounded-lg border border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none text-sm text-gray-900 bg-white cursor-pointer ${className}`}
        style={{ position: 'relative', zIndex: 1 }}
      >
        <option value="">{placeholder}</option>
        {GOUVERNORATS_TUNISIE.map((gouvernorat) => (
          <option key={gouvernorat} value={gouvernorat}>
            {gouvernorat}
          </option>
        ))}
      </select>
    </div>
  );
}
