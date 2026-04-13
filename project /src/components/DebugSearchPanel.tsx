import { useState, useEffect } from 'react';
import { DebugSearch, rpcLog, selectLikeLog, supabaseUrl, supabaseAnonKey } from '../lib/supabaseClient';
import { Tables, RPC } from '../lib/dbTables';
import { Search, Play, Trash2, Filter, X } from 'lucide-react';

interface DebugTrace {
  id: string;
  timestamp: number;
  pagePath: string;
  componentName?: string;
  scope?: string;
  action: 'rpc' | 'select';
  endpoint: string;
  payload: any;
  startedAt: number;
  durationMs?: number;
  rowCount?: number;
  error?: string;
}

export default function DebugSearchPanel() {
  const [traces, setTraces] = useState<DebugTrace[]>([]);
  const [filterScope, setFilterScope] = useState<string>('');
  const [filterType, setFilterType] = useState<string>('');
  const [filterEndpoint, setFilterEndpoint] = useState<string>('');
  const [detectedBars, setDetectedBars] = useState<any[]>([]);

  useEffect(() => {
    const logs = DebugSearch.get();
    const mapped = logs.map((log, idx) => ({
      id: `${log.ts}-${idx}`,
      timestamp: new Date(log.ts).getTime(),
      pagePath: log.page,
      componentName: log.component,
      scope: log.scope,
      action: log.type,
      endpoint: log.endpoint,
      payload: log.payload,
      startedAt: new Date(log.ts).getTime(),
      durationMs: log.durationMs,
      rowCount: log.rowCount,
      error: log.error
    }));
    setTraces(mapped);

    const unsubscribe = DebugSearch.on((newLogs) => {
      const newMapped = newLogs.map((log, idx) => ({
        id: `${log.ts}-${idx}`,
        timestamp: new Date(log.ts).getTime(),
        pagePath: log.page,
        componentName: log.component,
        scope: log.scope,
        action: log.type,
        endpoint: log.endpoint,
        payload: log.payload,
        startedAt: new Date(log.ts).getTime(),
        durationMs: log.durationMs,
        rowCount: log.rowCount,
        error: log.error
      }));
      setTraces(newMapped);
    });

    detectSearchBars();

    return unsubscribe;
  }, []);

  const detectSearchBars = () => {
    const bars = Array.from(document.querySelectorAll('[data-search-bar="true"]')).map((el: any) => ({
      scope: el.dataset.searchScope || 'unknown',
      placeholder: el.placeholder || '',
      value: el.value || '',
      component: el.dataset.componentName || 'Unknown'
    }));
    setDetectedBars(bars);
  };

  const handleTestBar = async (bar: any) => {
    console.log('Testing bar:', bar);
    await testEntreprises();
  };

  const testEntreprises = async () => {
    await rpcLog(RPC.SUGGEST_ENTREPRISES, {
      q: 'so',
      p_limit: 8,
      p_categorie: null,
      p_ville: null
    }, { component: 'DebugPanel-Test', scope: 'entreprise' });

    await rpcLog(RPC.SUGGEST_ENTREPRISES, {
      q: 'sous',
      p_limit: 8,
      p_categorie: null,
      p_ville: null
    }, { component: 'DebugPanel-Test', scope: 'entreprise' });
  };

  const testVilles = async () => {
    await rpcLog(RPC.SUGGEST_VILLES, {
      q: 'so',
      p_limit: 8
    }, { component: 'DebugPanel-Test', scope: 'ville' });

    await rpcLog(RPC.SUGGEST_VILLES, {
      q: 'sous',
      p_limit: 8
    }, { component: 'DebugPanel-Test', scope: 'ville' });
  };

  const testFallback = async () => {
    await selectLikeLog(
      Tables.ENTREPRISE,
      'nom',
      'so%',
      8,
      { component: 'DebugPanel-Fallback', scope: 'entreprise' }
    );
  };

  const clearTraces = () => {
    setTraces([]);
  };

  const filteredTraces = traces.filter(trace => {
    if (filterScope && trace.scope !== filterScope) return false;
    if (filterType && trace.action !== filterType) return false;
    if (filterEndpoint && !trace.endpoint.includes(filterEndpoint)) return false;
    return true;
  });

  const truncate = (str: string, len: number = 50) => {
    return str.length > len ? str.substring(0, len) + '...' : str;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Debug Search</h1>
          <p className="text-gray-600">Mode debug activé - VITE_DEBUG_SEARCH=1</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Environnement */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Environnement
            </h2>
            <div className="space-y-2 text-sm">
              <div>
                <span className="font-medium text-gray-700">SUPABASE_URL:</span>
                <div className="text-gray-600 break-all">{truncate(supabaseUrl, 40)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">ANON_KEY:</span>
                <div className="text-gray-600 break-all">{truncate(supabaseAnonKey, 40)}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Origin:</span>
                <div className="text-gray-600">{window.location.origin}</div>
              </div>
              <div>
                <span className="font-medium text-gray-700">Pathname:</span>
                <div className="text-gray-600">{window.location.pathname}</div>
              </div>
            </div>
          </div>

          {/* Card 2: Barres détectées */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Search className="w-5 h-5" />
              Barres détectées ({detectedBars.length})
            </h2>
            {detectedBars.length === 0 ? (
              <p className="text-gray-500 text-sm">Aucune barre détectée sur cette page</p>
            ) : (
              <div className="space-y-3">
                {detectedBars.map((bar, idx) => (
                  <div key={idx} className="border border-gray-200 rounded p-3">
                    <div className="text-xs text-gray-500 mb-1">Scope: {bar.scope}</div>
                    <div className="text-sm font-medium text-gray-700 mb-1">{bar.placeholder}</div>
                    <div className="text-xs text-gray-600 mb-2">Component: {bar.component}</div>
                    <button
                      onClick={() => handleTestBar(bar)}
                      className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 flex items-center gap-1"
                    >
                      <Play className="w-3 h-3" />
                      Tester
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Card 3: Boutons de test */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Play className="w-5 h-5" />
              Tests rapides
            </h2>
            <div className="space-y-3">
              <button
                onClick={testEntreprises}
                className="w-full bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 text-sm font-medium"
              >
                Test Entreprises (so + sous)
              </button>
              <button
                onClick={testVilles}
                className="w-full bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 text-sm font-medium"
              >
                Test Villes (so + sous)
              </button>
              <button
                onClick={testFallback}
                className="w-full bg-orange-600 text-white px-4 py-2 rounded hover:bg-orange-700 text-sm font-medium"
              >
                Test Fallback (select ilike)
              </button>
              <a
                href="#/debug/entreprise"
                className="block w-full bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700 text-sm font-medium text-center"
              >
                📊 Voir table entreprise (20 lignes)
              </a>
            </div>
          </div>
        </div>

        {/* Trace Table */}
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">
                Trace des appels Supabase ({filteredTraces.length})
              </h2>
              <button
                onClick={clearTraces}
                className="flex items-center gap-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 text-sm"
              >
                <Trash2 className="w-4 h-4" />
                Effacer
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-3 flex-wrap">
              <select
                value={filterScope}
                onChange={(e) => setFilterScope(e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-1"
              >
                <option value="">Tous les scopes</option>
                <option value="entreprise">Entreprise</option>
                <option value="ville">Ville</option>
                <option value="autre">Autre</option>
              </select>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="text-sm border border-gray-300 rounded px-3 py-1"
              >
                <option value="">Tous les types</option>
                <option value="rpc">RPC</option>
                <option value="select">SELECT</option>
              </select>

              <input
                type="text"
                value={filterEndpoint}
                onChange={(e) => setFilterEndpoint(e.target.value)}
                placeholder="Filtrer endpoint..."
                className="text-sm border border-gray-300 rounded px-3 py-1 flex-1 min-w-0"
              />

              {(filterScope || filterType || filterEndpoint) && (
                <button
                  onClick={() => {
                    setFilterScope('');
                    setFilterType('');
                    setFilterEndpoint('');
                  }}
                  className="text-sm text-gray-600 hover:text-gray-900 flex items-center gap-1"
                >
                  <X className="w-4 h-4" />
                  Reset
                </button>
              )}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Heure</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Page</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Composant</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Scope</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Type</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Endpoint</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Payload</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Durée</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Résultats</th>
                  <th className="px-4 py-3 text-left font-medium text-gray-700">Erreur</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredTraces.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center text-gray-500">
                      Aucune trace enregistrée. Effectuez une recherche pour voir les appels.
                    </td>
                  </tr>
                ) : (
                  filteredTraces.map(trace => (
                    <tr key={trace.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-gray-600">
                        {new Date(trace.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="px-4 py-3 text-gray-600">{trace.pagePath}</td>
                      <td className="px-4 py-3 text-gray-600">{trace.componentName || '-'}</td>
                      <td className="px-4 py-3">
                        {trace.scope && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {trace.scope}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block text-xs px-2 py-1 rounded ${
                          trace.action === 'rpc'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-purple-100 text-purple-800'
                        }`}>
                          {trace.action.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-700">
                        {truncate(trace.endpoint, 30)}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-gray-600">
                        <details className="cursor-pointer">
                          <summary>Voir</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto max-w-sm">
                            {JSON.stringify(trace.payload, null, 2)}
                          </pre>
                        </details>
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {trace.durationMs !== undefined ? `${trace.durationMs}ms` : '-'}
                      </td>
                      <td className="px-4 py-3 text-gray-600">
                        {trace.rowCount !== undefined ? (
                          <span className={`font-semibold ${
                            trace.rowCount === 0 ? 'text-red-600' : 'text-green-600'
                          }`}>
                            {trace.rowCount}
                          </span>
                        ) : '-'}
                      </td>
                      <td className="px-4 py-3">
                        {trace.error ? (
                          <span className="text-red-600 text-xs">{truncate(trace.error, 20)}</span>
                        ) : (
                          <span className="text-green-600 text-xs">OK</span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
