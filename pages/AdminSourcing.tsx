import { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { supabase, SUPABASE_URL } from '../lib/BoltDatabase';
import { Lock, CheckCircle, MapPin, Phone, Building2, Tag, Map, Navigation, Maximize2, Minimize2, Filter, ExternalLink, AlertCircle, Loader, Eye } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';

// Fix Leaflet default marker icon
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

// Custom user location marker with pulse effect
const userLocationIcon = new L.Icon({
  iconUrl: 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxOCIgZmlsbD0iI2VmNDQ0NCIgZmlsbC1vcGFjaXR5PSIwLjMiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSIxMiIgZmlsbD0iI2VmNDQ0NCIgc3Ryb2tlPSIjZmZmIiBzdHJva2Utd2lkdGg9IjMiLz48Y2lyY2xlIGN4PSIyMCIgY3k9IjIwIiByPSI1IiBmaWxsPSIjZmZmIi8+PC9zdmc+',
  iconSize: [40, 40],
  iconAnchor: [20, 20],
  popupAnchor: [0, -20],
});

const TUNISIAN_CITIES = [
  'Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Nabeul', 'Zaghouan', 'Bizerte',
  'Béja', 'Jendouba', 'Kef', 'Siliana', 'Sousse', 'Monastir', 'Mahdia',
  'Sfax', 'Kairouan', 'Kasserine', 'Sidi Bouzid', 'Gabès', 'Médenine',
  'Tataouine', 'Gafsa', 'Tozeur', 'Kébili'
].sort();

const CATEGORIES = [
  'Magasin',
  'Santé',
  'Loisir',
  'Éducation',
  'B2B/Partenariat'
];

interface Etablissement {
  id: string;
  nom: string;
  categorie?: string;
  ville: string;
  adresse?: string;
  telephone?: string;
  latitude?: number;
  longitude?: number;
  distance?: number;
  views_count?: number;
}

// Component to track user position and auto-center map
function TrackingMap({ position, isTracking }: { position: [number, number]; isTracking: boolean }) {
  const map = useMap();

  useEffect(() => {
    if (isTracking && position) {
      map.setView(position, map.getZoom(), { animate: true });
    }
  }, [position, isTracking, map]);

  return null;
}

// Initial setup
function SetupMap({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 15);
  }, []);
  return null;
}

export default function AdminSourcing() {
  const { language } = useLanguage();
  const t = useTranslation(language);

  useEffect(() => {
    document.title = 'Admin Sourcing - Dalil Tounes';
    const metaRobots = document.createElement('meta');
    metaRobots.name = 'robots';
    metaRobots.content = 'noindex, nofollow';
    document.head.appendChild(metaRobots);

    return () => {
      document.head.removeChild(metaRobots);
    };
  }, []);

  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Map states
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [etablissements, setEtablissements] = useState<Etablissement[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [isTracking, setIsTracking] = useState(false);
  const [proximityRadius, setProximityRadius] = useState(0.5); // 500m
  const [nearbyCount, setNearbyCount] = useState(0);
  const mapRef = useRef<any>(null);
  const watchIdRef = useRef<number | null>(null);

  const [formData, setFormData] = useState({
    nom: '',
    telephone: '',
    ville: '',
    adresse: '',
    gps: '',
    categories: [] as string[]
  });

  const [successMessage, setSuccessMessage] = useState('');

  // Get user location with high accuracy
  useEffect(() => {
    if (!isAuthenticated) return;

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
          setError('Erreur de géolocalisation. Veuillez activer le GPS.');
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0,
        }
      );
    } else {
      setError('Géolocalisation non disponible sur cet appareil');
      setLoading(false);
    }
  }, [isAuthenticated]);

  // Fetch nearby businesses
  useEffect(() => {
    if (!userLocation) return;

    const fetchNearbyBusinesses = async () => {
      try {
        const { data, error } = await supabase
          .from('entreprise')
          .select('id, nom, categorie, ville, adresse, telephone, latitude, longitude, views_count')
          .not('latitude', 'is', null)
          .not('longitude', 'is', null);

        if (error) throw error;

        if (data) {
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
            .sort((a, b) => a.distance - b.distance);

          setEtablissements(withDistance);

          // Count businesses within proximity radius
          const nearby = withDistance.filter((b) => b.distance <= proximityRadius);
          setNearbyCount(nearby.length);
        }
      } catch (error) {
        console.error('Error fetching businesses:', error);
      }
    };

    fetchNearbyBusinesses();
  }, [userLocation, proximityRadius]);

  // Toggle tracking mode
  const toggleTracking = () => {
    if (!isTracking) {
      // Start tracking
      if ('geolocation' in navigator) {
        const watchId = navigator.geolocation.watchPosition(
          (position) => {
            const coords: [number, number] = [
              position.coords.latitude,
              position.coords.longitude,
            ];
            setUserLocation(coords);
          },
          (err) => {
            console.error('Tracking error:', err);
          },
          {
            enableHighAccuracy: true,
            timeout: 5000,
            maximumAge: 0,
          }
        );
        watchIdRef.current = watchId;
        setIsTracking(true);
      }
    } else {
      // Stop tracking
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
        watchIdRef.current = null;
      }
      setIsTracking(false);
    }
  };

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
    const R = 6371; // Earth radius in km
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  };

  const toRad = (value: number): number => {
    return (value * Math.PI) / 180;
  };

  const formatDistance = (distance: number): string => {
    if (distance < 1) {
      return `${Math.round(distance * 1000)} m`;
    }
    return `${distance.toFixed(1)} km`;
  };

  const recenterMap = () => {
    if (userLocation && mapRef.current) {
      mapRef.current.setView(userLocation, 15);
    }
  };

  const getSupabaseUrl = (id: string): string => {
    const projectUrl = SUPABASE_URL || '';
    const projectId = projectUrl.replace('https://', '').split('.')[0];
    return `https://supabase.com/dashboard/project/${projectId}/editor/28539?schema=public&tableId=28539&filter=id%3Aeq%3A${id}`;
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'daliltounes2025') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Mot de passe incorrect');
    }
  };

  const handleCategoryToggle = (category: string) => {
    setFormData(prev => ({
      ...prev,
      categories: prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category]
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.nom || !formData.telephone) {
      alert('Le nom et le téléphone sont obligatoires');
      return;
    }

    setSuccessMessage('');

    try {
      let latitude = null;
      let longitude = null;

      if (formData.gps.trim()) {
        const gpsMatch = formData.gps.match(/([-]?\d+\.?\d*)[,\s]+([-]?\d+\.?\d*)/);
        if (gpsMatch) {
          latitude = parseFloat(gpsMatch[1]);
          longitude = parseFloat(gpsMatch[2]);
        }
      }

      const { error } = await supabase
        .from('entreprise')
        .insert({
          nom: formData.nom.trim(),
          telephone: formData.telephone.trim(),
          ville: formData.ville || 'Non spécifié',
          adresse: formData.adresse.trim() || null,
          latitude,
          longitude,
          categories: formData.categories.join(', ') || 'Non catégorisé',
          status: 'pending'
        });

      if (error) throw error;

      setSuccessMessage(`✅ "${formData.nom}" ajouté !`);

      setFormData({
        nom: '',
        telephone: '',
        ville: '',
        adresse: '',
        gps: '',
        categories: []
      });

      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error: any) {
      alert(`Erreur: ${error.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="flex flex-col items-center mb-6">
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4">
              <Lock className="w-8 h-8 text-orange-600" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Outil de Sourcing Rapide</h1>
            <p className="text-sm text-gray-600 mt-2">Accès réservé aux administrateurs</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                placeholder="Entrez le mot de passe"
              />
            </div>

            {authError && (
              <div className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded">
                {authError}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-orange-600 text-white py-3 rounded-lg font-medium hover:bg-orange-700 transition"
            >
              Se connecter
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <Loader className="w-12 h-12 text-orange-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-700 font-medium">Initialisation du GPS...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 to-red-50 flex items-center justify-center px-4">
        <div className="text-center">
          <AlertCircle className="w-16 h-16 text-red-600 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2">Erreur GPS</h2>
          <p className="text-gray-600">{error}</p>
        </div>
      </div>
    );
  }

  if (!userLocation) return null;

  return (
    <div className={`${isFullScreen ? 'fixed inset-0 z-50' : 'min-h-screen'} bg-white`}>
      {/* Header with controls */}
      <div className="bg-gradient-to-r from-orange-600 to-red-600 text-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-bold">Sourcing Terrain</h1>
            <p className="text-sm text-orange-100">Mode cartographie avancé</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleTracking}
              className={`p-3 rounded-lg transition ${
                isTracking
                  ? 'bg-green-500 hover:bg-green-600'
                  : 'bg-white/20 hover:bg-white/30'
              }`}
              title={isTracking ? 'Arrêter le suivi' : 'Activer le suivi'}
            >
              <Navigation className={`w-5 h-5 ${isTracking ? 'animate-pulse' : ''}`} />
            </button>
            <button
              onClick={() => setIsFullScreen(!isFullScreen)}
              className="p-3 rounded-lg bg-white/20 hover:bg-white/30 transition"
              title={isFullScreen ? 'Quitter plein écran' : 'Plein écran'}
            >
              {isFullScreen ? <Minimize2 className="w-5 h-5" /> : <Maximize2 className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Proximity counter */}
        <div className="mt-3 bg-white/10 backdrop-blur-sm rounded-lg p-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            <span className="font-medium">Rayon: {Math.round(proximityRadius * 1000)}m</span>
          </div>
          <div className="bg-white text-orange-600 px-4 py-1.5 rounded-full font-bold text-sm">
            {nearbyCount} établissement{nearbyCount > 1 ? 's' : ''}
          </div>
        </div>

        {successMessage && (
          <div className="mt-3 bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2">
            <CheckCircle className="w-4 h-4" />
            {successMessage}
          </div>
        )}
      </div>

      {/* Map */}
      <div className={`${isFullScreen ? 'h-[calc(100vh-200px)]' : 'h-[600px]'} relative`}>
        <MapContainer
          center={userLocation}
          zoom={15}
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
                <div className="text-2xl mb-2">🎯</div>
                <p className="font-bold text-orange-600 text-base">Ma position</p>
                <p className="text-xs text-gray-500 mt-1">
                  {isTracking && '🔴 Suivi actif'}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Business markers within proximity */}
          {etablissements
            .filter((b) => b.distance && b.distance <= proximityRadius)
            .map((business) =>
              business.latitude && business.longitude ? (
                <Marker
                  key={business.id}
                  position={[business.latitude, business.longitude]}
                >
                  <Popup>
                    <div className="min-w-[200px]">
                      <h3 className="font-bold text-gray-900 mb-1">{business.nom}</h3>
                      {business.views_count !== undefined && business.views_count > 0 && (
                        <p className="text-xs text-blue-600 font-medium mb-1 flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {business.views_count} vue{business.views_count > 1 ? 's' : ''}
                        </p>
                      )}
                      {business.categorie && (
                        <p className="text-xs text-gray-600 mb-1">
                          <Tag className="w-3 h-3 inline mr-1" />
                          {business.categorie}
                        </p>
                      )}
                      <p className="text-xs text-gray-500 mb-2">
                        <MapPin className="w-3 h-3 inline mr-1" />
                        {business.ville}
                      </p>
                      {business.distance !== undefined && (
                        <p className="text-sm font-medium text-orange-600 mb-2">
                          📍 {formatDistance(business.distance)}
                        </p>
                      )}
                      <a
                        href={getSupabaseUrl(business.id)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 bg-orange-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-orange-700 transition"
                      >
                        <ExternalLink className="w-3 h-3" />
                        Modifier la fiche
                      </a>
                    </div>
                  </Popup>
                </Marker>
              ) : null
            )}

          <SetupMap center={userLocation} />
          {isTracking && <TrackingMap position={userLocation} isTracking={isTracking} />}
        </MapContainer>

        {/* Recenter button */}
        {!isTracking && (
          <button
            onClick={recenterMap}
            className="absolute bottom-6 right-6 z-[1000] bg-orange-600 hover:bg-orange-700 text-white p-4 rounded-full shadow-2xl border-2 border-white transition-all hover:scale-110 active:scale-95"
            title="Recentrer"
          >
            <Navigation className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
}
