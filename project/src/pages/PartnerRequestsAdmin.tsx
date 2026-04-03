import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useLanguage } from '../context/LanguageContext';
import { useTranslation } from '../lib/i18n';
import { Mail, Phone, MapPin, Clock, Filter } from 'lucide-react';

interface PartnerRequest {
  id: string;
  request_type: string | null;
  company_name: string | null;
  sector: string | null;
  region: string | null;
  search_type: string | null;
  email: string | null;
  phone: string | null;
  description: string | null;
  created_at: string;
}

// 🔍 LABELS DES TYPES DE REQUÊTES
// Basé sur les valeurs réelles de la colonne request_type
const REQUEST_TYPE_LABELS: Record<string, string> = {
  need: "Besoin partenaire / fournisseur",
  partner_need: "Besoin partenaire / fournisseur", // Alias
  offer: "Prestataire de services",
  service_provider: "Prestataire de services", // Alias
  unknown: "Type non spécifié",
};

const formatRequestType = (value: string | null) => {
  if (!value) return '—';
  return REQUEST_TYPE_LABELS[value] || value;
};

const formatDate = (iso: string) => {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return iso;
  }
};

export default function PartnerRequestsAdmin() {
  const { language } = useLanguage();
  const t = useTranslation(language);
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  // 🎯 TYPES DE FILTRES
  // 'all' = tous
  // 'need' = besoins partenaires (request_type = 'need' ou 'partner_need')
  // 'offer' = prestataires de services (request_type = 'offer' ou 'service_provider')
  type FilterType = 'all' | 'need' | 'offer';
  const [filterType, setFilterType] = useState<FilterType>('all');

  useEffect(() => {
    const loadRequests = async () => {
      setLoading(true);
      setError(null);
      console.log('[PartnerRequestsAdmin] 🔍 Chargement des demandes partenaires...');

      try {
        const { data, error } = await supabase
          .from('partner_requests')
          .select('*')
          .order('created_at', { ascending: false });

        if (error) {
          console.error('[PartnerRequestsAdmin] ❌ Erreur Supabase:', error);
          throw error;
        }

        const mapped = (data || []).map((item: any): PartnerRequest => ({
          id: item.id,
          request_type: item.request_type ?? null,
          company_name: item.company_name ?? null,
          sector: item.sector ?? null,
          region: item.region ?? null,
          search_type: item.search_type ?? null,
          email: item.email ?? null,
          phone: item.phone ?? null,
          description: item.description ?? null,
          created_at: item.created_at,
        }));

        console.log('[PartnerRequestsAdmin] ✅ Demandes chargées:', {
          count: mapped.length,
          sample: mapped[0],
        });

        // 🔎 LOG: Afficher tous les types de request_type présents
        const requestTypes = Array.from(new Set(mapped.map(r => r.request_type)));
        console.log('[PartnerRequestsAdmin] 🔎 Types de requêtes présents:', requestTypes);

        setRequests(mapped);
      } catch (e: any) {
        setError(e.message || 'Erreur de chargement des demandes');
      } finally {
        setLoading(false);
      }
    };

    loadRequests();
  }, []);

  // 🧮 FILTRAGE DES DEMANDES
  // Applique le filtre sélectionné sur la liste complète
  const filteredRequests = requests.filter((r) => {
    if (filterType === 'all') return true;

    // Filtre "Besoins partenaires"
    if (filterType === 'need') {
      return r.request_type === 'need' || r.request_type === 'partner_need';
    }

    // Filtre "Prestataires / services"
    if (filterType === 'offer') {
      return r.request_type === 'offer' || r.request_type === 'service_provider';
    }

    return true;
  });

  // 🧮 LOG: Afficher le résultat du filtrage
  console.log('[PartnerRequestsAdmin] 🧮 Filtre actif:', filterType);
  console.log('[PartnerRequestsAdmin] ✅ Nombre de demandes affichées:', filteredRequests.length);

  return (
    <div className="py-8 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-light text-gray-900">
              Demandes partenaires (admin)
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              Vue interne pour suivre les demandes reçues depuis la page Partenaire / Fournisseur.
            </p>
          </div>
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-gray-100 text-xs text-gray-700">
            Total : {requests.length}
          </span>
        </div>

        {/* Filtres */}
        <div className="mb-6 bg-white border border-gray-200 rounded-lg p-4 flex flex-wrap items-center gap-3">
          <div className="inline-flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filtrer par type</span>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setFilterType('all')}
              className={`px-3 py-1.5 rounded-full text-xs border ${
                filterType === 'all'
                  ? 'bg-slate-900 text-white border-slate-900'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Tous
            </button>
            <button
              type="button"
              onClick={() => setFilterType('need')}
              className={`px-3 py-1.5 rounded-full text-xs border ${
                filterType === 'need'
                  ? 'bg-orange-600 text-white border-orange-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Besoins partenaires
            </button>
            <button
              type="button"
              onClick={() => setFilterType('offer')}
              className={`px-3 py-1.5 rounded-full text-xs border ${
                filterType === 'offer'
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
            >
              Prestataires / services
            </button>
          </div>
        </div>

        {loading && (
          <div className="text-center py-16">
            <div className="inline-block w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <p className="mt-3 text-sm text-gray-600">Chargement des demandes...</p>
          </div>
        )}

        {error && !loading && (
          <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && filteredRequests.length === 0 && (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg bg-gray-50">
            <p className="text-sm text-gray-600">
              Aucune demande trouvée pour le moment.
            </p>
          </div>
        )}

        {!loading && !error && filteredRequests.length > 0 && (
          <div className="space-y-4">
            {filteredRequests.map((req) => (
              <div
                key={req.id}
                className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                  <div>
                    <h2 className="text-sm font-medium text-gray-900">
                      {req.company_name || 'Entreprise / profil non renseigné'}
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 mt-1 text-xs text-gray-500">
                      {req.sector && (
                        <span className="px-2 py-0.5 rounded-full bg-gray-100">
                          {req.sector}
                        </span>
                      )}
                      {req.region && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 text-blue-700">
                          <MapPin className="w-3 h-3" />
                          {req.region}
                        </span>
                      )}
                      {req.search_type && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-50 text-amber-800">
                          {req.search_type}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <span
                      className={`inline-flex items-center px-2 py-1 rounded-full text-[11px] font-medium ${
                        req.request_type === 'offer' || req.request_type === 'service_provider'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                          : req.request_type === 'need' || req.request_type === 'partner_need'
                          ? 'bg-orange-50 text-orange-700 border border-orange-100'
                          : 'bg-gray-50 text-gray-700 border border-gray-100'
                      }`}
                    >
                      {formatRequestType(req.request_type)}
                    </span>
                    <div className="flex items-center gap-1 text-[11px] text-gray-500 mt-1 justify-end">
                      <Clock className="w-3 h-3" />
                      <span>{formatDate(req.created_at)}</span>
                    </div>
                  </div>
                </div>

                <p className="text-sm text-gray-700 mb-3 whitespace-pre-line">
                  {req.description || 'Pas de description fournie.'}
                </p>

                <div className="flex flex-wrap gap-4 text-xs text-gray-600 border-t pt-3 mt-2">
                  {req.email && (
                    <div className="inline-flex items-center gap-1">
                      <Mail className="w-3 h-3" />
                      <a href={`mailto:${req.email}`} className="hover:underline">
                        {req.email}
                      </a>
                    </div>
                  )}
                  {req.phone && (
                    <div className="inline-flex items-center gap-1">
                      <Phone className="w-3 h-3" />
                      <a href={`tel:${req.phone}`} className="hover:underline">
                        {req.phone}
                      </a>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
