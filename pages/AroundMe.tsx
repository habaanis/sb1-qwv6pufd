import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase } from '../lib/BoltDatabase';
import { MapPin, Navigation, Phone, AlertCircle, Loader, Target, Building2, Star } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { ImageWithFallback } from '../components/ImageWithFallback';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom user location marker with pulse effect
const userLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iIzM4NzVkNyIgZmlsbC1vcGFjaXR5PSIwLjMiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxMiIgZmlsbD0iIzM4NzVkNyIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjMiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSI1IiBmaWxsPSIjZmZmIi8+PC9zdmc+',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

function getGoogleMapsDirectionsUrl(latitude?: number, longitude?: number, address?: string): string {
  if (latitude && longitude) {
    return `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;
  }
  if (address) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(address)}`;
  }
  return '#';
}

interface Etablissement {
  id: string;
  nom: string;
  categorie?: string;
  sous_categories?: string;
  ville: string;
  adresse?: string;
  telephone?: string;
  latitude?: number;
  longitude?: number;
  image_url?: string;
  distance?: number;
}

// Component to setup map - only centers initially
function SetupMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 13);
  }, []); // Empty dependency array - only run once on mount
  return null;
}

export default function AroundMe() {
  const { language } = useLanguage();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [radius, setRadius] = useState(5); // km - Rayon par défaut pour les visiteurs
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const mapRef = useRef<any>(null);

  // Récupérer le paramètre de recherche depuis l'URL
  const [searchFilter, setSearchFilter] = useState<string>('');
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.split('?')[1] || '');
    const searchParam = params.get('search') || '';
    setSearchFilter(searchParam);
  }, []);

  const translations = {
    fr: {
      title: 'Établissements autour de moi',
      subtitle: 'Trouvez les établissements proches de votre position',
      loading: 'Localisation en cours...',
      geoError: 'Impossible d\'obtenir votre position',
      geoPermission: 'Veuillez autoriser la géolocalisation pour utiliser cette fonctionnalité',
      noResults: 'Aucun établissement trouvé dans ce rayon',
      radius: 'Rayon de recherche',
      km: 'km',
      results: 'établissements trouvés',
      recenter: 'Me localiser',
      yourPosition: 'Votre position',
      distance: 'distance',
      phone: 'Téléphone',
      category: 'Catégorie',
    },
    ar: {
      title: 'المؤسسات حولي',
      subtitle: 'ابحث عن المؤسسات القريبة من موقعك',
      loading: 'جارٍ تحديد الموقع...',
      geoError: 'تعذر الحصول على موقعك',
      geoPermission: 'يرجى السماح بتحديد الموقع الجغرافي لاستخدام هذه الميزة',
      noResults: 'لم يتم العثور على مؤسسات في هذا النطاق',
      radius: 'نطاق البحث',
      km: 'كم',
      results: 'مؤسسات موجودة',
      recenter: 'حدد موقعي',
      yourPosition: 'موقعك',
      distance: 'المسافة',
      phone: 'الهاتف',
      category: 'الفئة',
    },
    en: {
      title: 'Businesses around me',
      subtitle: 'Find businesses near your location',
      loading: 'Locating...',
      geoError: 'Unable to get your location',
      geoPermission: 'Please allow geolocation to use this feature',
      noResults: 'No businesses found in this radius',
      radius: 'Search radius',
      km: 'km',
      results: 'businesses found',
      recenter: 'Locate me',
      yourPosition: 'Your position',
      distance: 'distance',
      phone: 'Phone',
      category: 'Category',
    },
  };

  const t = translations[language as keyof typeof translations] || translations.fr;

  // Get user location
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const coords: [number, number] = [
            position.coords.latitude,
            position.coords.longitude,
          ];
          setUserLocation(coords);
          setLoading(false);
        },
        (err) => {
          console.error('Geolocation error:', err);
          setError(t.geoPermission);
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setError(t.geoError);
      setLoading(false);
    }
  }, []);

  // Fetch nearby businesses
  useEffect(() => {
    if (!userLocation) return;

    const fetchNearbyBusinesses = async () => {
      try {
        // Si un filtre métier est spécifié, utiliser la fonction RPC optimisée
        if (searchFilter && searchFilter.trim().length > 0) {
          // Utiliser la fonction search_entreprise_smart avec filtre géographique
          const { data, error } = await supabase.rpc('search_entreprise_smart', {
            p_q: searchFilter.trim(),
            p_ville: null, // Pas de filtre ville (on utilise GPS)
            p_categorie: null,
            p_scope: null,
            p_limit: 200
          });

          if (error) throw error;

          if (data) {
            // Filtrer par GPS et calculer la distance
            const withDistance = data
              .filter((business: any) => business.latitude && business.longitude)
              .map((business: any) => {
                const distance = calculateDistance(
                  userLocation[0],
                  userLocation[1],
                  business.latitude!,
                  business.longitude!
                );
                return { ...business, distance };
              })
              .filter((b: any) => b.distance <= radius)
              .sort((a: any, b: any) => {
                // Trier par score de pertinence puis distance
                if (b.score !== a.score) return b.score - a.score;
                return a.distance - b.distance;
              });

            setEtablissements(withDistance as Etablissement[]);
          }
        } else {
          // Pas de filtre métier : afficher tous les établissements
          const { data, error } = await supabase
            .from('entreprise')
            .select('id, nom, "catégorie", "sous-catégories", ville, adresse, telephone, latitude, longitude, image_url')
            .not('latitude', 'is', null)
            .not('longitude', 'is', null);

          if (error) throw error;

          if (data) {
            // Calculate distance for each business
            const withDistance = data
              .map((business) => {
                const distance = calculateDistance(
                  userLocation[0],
                  userLocation[1],
                  business.latitude!,
                  business.longitude!
                );
                return { ...business, distance };
              })
              .filter((b) => b.distance <= radius)
              .sort((a, b) => a.distance - b.distance);

            setEtablissements(withDistance as Etablissement[]);
          }
        }
      } catch (err) {
        console.error('Error fetching businesses:', err);
      }
    };

    fetchNearbyBusinesses();
  }, [userLocation, radius, searchFilter]);

  // Calculate distance between two GPS coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return (value * Math.PI) / 180;
  };

  const recenterMap = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView(userLocation, 13);
    }
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} ${t.km}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-blue-600 animate-spin mx-auto mb-4" />
          <p className="text-lg text-gray-700">{t.loading}</p>
        </div>
      </div>
    );
  }

  if (error || !userLocation) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-orange-100 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">{t.geoError}</h2>
          <p className="text-gray-600">{error || t.geoPermission}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3 mb-2">
            <Target className="w-8 h-8" />
            <h1 className="text-3xl font-bold">{t.title}</h1>
          </div>
          <p className="text-blue-100">{t.subtitle}</p>

          {/* Indicateur de filtre actif */}
          {searchFilter && searchFilter.trim().length > 0 && (
            <div className="mt-3 inline-flex items-center gap-2 bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full">
              <Building2 className="w-4 h-4" />
              <span className="text-sm font-medium">
                {language === 'fr' && `Filtre: ${searchFilter}`}
                {language === 'ar' && `تصفية: ${searchFilter}`}
                {language === 'en' && `Filter: ${searchFilter}`}
              </span>
              <button
                onClick={() => {
                  setSearchFilter('');
                  window.history.replaceState(null, '', '#/autour-de-moi');
                }}
                className="ml-2 text-white/80 hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Controls */}
        <div className="bg-white rounded-xl shadow-md p-4 mb-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-gray-700">{t.radius}:</label>
              <select
                value={radius}
                onChange={(e) => setRadius(Number(e.target.value))}
                className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value={2}>2 {t.km}</option>
                <option value={5}>5 {t.km}</option>
                <option value={10}>10 {t.km}</option>
                <option value={20}>20 {t.km}</option>
                <option value={50}>50 {t.km}</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-blue-600" />
              <span className="text-lg font-semibold text-gray-900">
                {etablissements.length} {t.results}
              </span>
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden mb-6 relative">
          <div className="h-[500px] relative">
            <MapContainer
              center={userLocation}
              zoom={13}
              style={{ height: '100%', width: '100%' }}
              ref={mapRef}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {/* User location marker */}
              <Marker position={userLocation} icon={userLocationIcon}>
                <Popup>
                  <div className="text-center py-2">
                    <div className="text-2xl mb-2">📍</div>
                    <p className="font-bold text-blue-600 text-base">{t.yourPosition}</p>
                    <p className="text-xs text-gray-500 mt-1">GPS: {userLocation[0].toFixed(5)}, {userLocation[1].toFixed(5)}</p>
                  </div>
                </Popup>
              </Marker>

              {/* Business markers */}
              {etablissements.map((business) => (
                business.latitude && business.longitude && (
                  <Marker
                    key={business.id}
                    position={[business.latitude, business.longitude]}
                    eventHandlers={{
                      click: () => setSelectedId(business.id),
                    }}
                  >
                    <Popup>
                      <div className="min-w-[200px]">
                        <h3 className="font-bold text-gray-900 mb-1">{business.nom}</h3>
                        {business.categorie && (
                          <p className="text-sm text-gray-600 mb-1">{business.categorie}</p>
                        )}
                        <p className="text-xs text-gray-500 mb-2">
                          <MapPin className="w-3 h-3 inline mr-1" />
                          {business.ville}
                        </p>
                        {business.distance !== undefined && (
                          <p className="text-sm font-medium text-blue-600 mb-2">
                            📍 {formatDistance(business.distance)}
                          </p>
                        )}
                        <a
                          href={getGoogleMapsDirectionsUrl(business.latitude, business.longitude, business.adresse)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 px-3 py-1.5 bg-[#D4AF37] text-white text-xs font-medium rounded-lg hover:bg-[#B8941F] transition-colors"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <Navigation className="w-3 h-3" />
                          Itinéraire
                        </a>
                      </div>
                    </Popup>
                  </Marker>
                )
              ))}

              <SetupMap center={userLocation} />
            </MapContainer>

            {/* Floating recenter button - Style doré moderne */}
            <button
              onClick={recenterMap}
              className="group absolute bottom-6 right-6 z-[1000] bg-gradient-to-br from-[#D4AF37] to-[#FFD700] hover:from-[#C4A027] hover:to-[#EFC700] text-white p-5 rounded-full shadow-[0_8px_30px_rgba(212,175,55,0.6)] hover:shadow-[0_12px_40px_rgba(212,175,55,0.8)] border-3 border-white transition-all duration-300 hover:scale-110 active:scale-95"
              title={t.recenter}
              aria-label={t.recenter}
            >
              <div className="relative">
                <Navigation className="w-7 h-7 group-hover:rotate-12 transition-transform" />
                <div className="absolute inset-0 bg-white/20 rounded-full animate-ping opacity-75"></div>
              </div>
            </button>
          </div>
        </div>

        {/* Results List */}
        {etablissements.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {etablissements.map((business) => (
              <div
                key={business.id}
                className={`bg-white rounded-xl shadow-md overflow-hidden transition-all hover:shadow-xl cursor-pointer ${
                  selectedId === business.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => {
                  setSelectedId(business.id);
                  if (business.latitude && business.longitude && mapRef.current) {
                    mapRef.current.setView([business.latitude, business.longitude], 15);
                  }
                }}
              >
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{business.nom}</h3>
                  {business.categorie && (
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                      <Star className="w-4 h-4 text-orange-500" />
                      {business.categorie}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    {business.ville} - {business.adresse}
                  </p>
                  {business.telephone && (
                    <p className="text-sm text-gray-600 mb-2 flex items-center gap-1">
                      <Phone className="w-4 h-4 text-green-500" />
                      {business.telephone}
                    </p>
                  )}
                  {business.distance !== undefined && (
                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between gap-2">
                      <span className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium">
                        <Navigation className="w-4 h-4" />
                        {formatDistance(business.distance)}
                      </span>
                      <a
                        href={getGoogleMapsDirectionsUrl(business.latitude, business.longitude, business.adresse)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#D4AF37] text-white text-xs font-medium rounded-lg hover:bg-[#B8941F] transition-colors shadow-sm hover:shadow-md"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Navigation className="w-3.5 h-3.5" />
                        GPS
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-md p-12 text-center">
            <AlertCircle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-lg text-gray-600">{t.noResults}</p>
          </div>
        )}
      </div>
    </div>
  );
}
