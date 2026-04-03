import { Phone, MapPin, Users, Clock, Star, Ambulance, Car } from 'lucide-react';
import { motion } from 'framer-motion';
import SignatureCard from './SignatureCard';

interface MedicalTransportCardProps {
  provider: {
    id: string;
    full_name: string;
    governorate: string;
    ville_base?: string;
    vehicle_type: string;
    type_service?: string;
    capacite_passagers?: number;
    telephone_contact?: string;
    phone?: string;
    est_disponible_nuit?: boolean;
    est_premium?: boolean;
    zone_couverture?: string;
    equipment?: any;
  };
}

export default function MedicalTransportCard({ provider }: MedicalTransportCardProps) {
  const isAmbulance = provider.vehicle_type?.toLowerCase().includes('ambulance');
  const isTaxi = provider.vehicle_type?.toLowerCase().includes('taxi') ||
                 provider.vehicle_type?.toLowerCase().includes('louage');

  const phoneNumber = provider.telephone_contact || provider.phone;
  const isPremium = provider.est_premium || false;

  const iconBg = isAmbulance ? 'bg-blue-100 text-blue-700' : 'bg-yellow-100 text-yellow-700';

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <SignatureCard isPremium={isPremium} className="p-5">
        {/* Badge Premium */}
        {isPremium && (
          <div className="absolute -top-2 -right-2 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1 shadow-lg z-10">
            <Star className="w-3 h-3 fill-white" />
            PREMIUM
          </div>
        )}

        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className={`${iconBg} w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 shadow-sm`}>
            {isAmbulance ? (
              <Ambulance className="w-7 h-7" />
            ) : (
              <Car className="w-7 h-7" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <h3 className={`text-lg font-bold leading-tight mb-1 truncate ${isPremium ? 'text-white' : 'text-gray-900'}`}>
              {provider.full_name}
            </h3>
            <div className="flex items-center gap-2 text-base font-semibold mt-1">
              <MapPin className="w-5 h-5 flex-shrink-0 text-[#D4AF37]" />
              <span className={`truncate ${isPremium ? 'text-gray-200' : 'text-gray-800'}`}>
                {provider.ville_base || provider.governorate}
              </span>
            </div>
          </div>
        </div>

        {/* Informations */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-sm">
            <div className={`px-3 py-1.5 rounded-lg font-medium ${
              isPremium
                ? 'bg-[#5A2D53] text-[#D4AF37]'
                : isAmbulance ? 'bg-blue-100 text-blue-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {provider.vehicle_type}
            </div>
          </div>

          {/* Capacité pour taxis */}
          {isTaxi && provider.capacite_passagers && (
            <div className={`flex items-center gap-2 text-sm ${isPremium ? 'text-gray-200' : 'text-gray-700'}`}>
              <Users className={`w-4 h-4 ${isPremium ? 'text-[#D4AF37]' : 'text-gray-500'}`} />
              <span className="font-medium">Capacité: {provider.capacite_passagers} passagers</span>
            </div>
          )}

          {/* Disponibilité 24/7 */}
          {provider.est_disponible_nuit && (
            <div className="flex items-center gap-2 text-sm">
              <Clock className="w-4 h-4 text-green-600" />
              <span className={`font-medium ${isPremium ? 'text-green-400' : 'text-green-700'}`}>Disponible 24h/7j</span>
            </div>
          )}

          {/* Zone de couverture */}
          {provider.zone_couverture && (
            <div className={`text-xs ${isPremium ? 'text-gray-300' : 'text-gray-600'}`}>
              <span className="font-medium">Zone:</span> {provider.zone_couverture}
            </div>
          )}
        </div>

        {/* Bouton d'appel */}
        {phoneNumber && (
          <a
            href={`tel:${phoneNumber}`}
            className={`block w-full py-3 px-4 rounded-lg font-semibold text-center transition-all shadow-sm hover:shadow-md ${
              isPremium
                ? 'bg-[#D4AF37] text-[#4A1D43] hover:bg-[#C4A027]'
                : isAmbulance
                ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800'
                : 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700'
            }`}
          >
            <div className="flex items-center justify-center gap-2">
              <Phone className="w-5 h-5" />
              <span>Appeler maintenant</span>
            </div>
            <div className="text-xs mt-1 opacity-90">{phoneNumber}</div>
          </a>
        )}
      </SignatureCard>
    </motion.div>
  );
}
