import { Bug } from 'lucide-react';
import { DebugSearch } from '../lib/supabaseClient';

export default function DebugSearchBadge() {
  if (!DebugSearch.enabled) {
    return null;
  }

  const handleClick = () => {
    window.open('#/searchDebug', '_blank');
  };

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-4 right-4 z-50 flex items-center gap-2 bg-red-600 text-white px-4 py-3 rounded-lg shadow-lg hover:bg-red-700 transition-all hover:scale-105"
      title="Ouvrir Debug Search"
    >
      <Bug className="w-5 h-5" />
      <span className="font-medium">Debug Search</span>
    </button>
  );
}
