import { useEffect } from 'react';
import { DebugSearch } from '../../lib/supabaseClient';
import DebugSearchPanel from '../../components/DebugSearchPanel';

export default function SearchDebug() {
  useEffect(() => {
    if (!DebugSearch.enabled) {
      window.location.hash = '#/';
    }
  }, []);

  if (!DebugSearch.enabled) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Mode Debug Désactivé</h2>
          <p className="text-gray-600">Cette page n'est accessible qu'en mode développement.</p>
        </div>
      </div>
    );
  }

  return <DebugSearchPanel />;
}
