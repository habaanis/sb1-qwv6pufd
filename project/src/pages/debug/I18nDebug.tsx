import React from 'react';

export default function I18nDebug() {
  const missing = (typeof window !== 'undefined' && (window as any).__MISSING_I18N__) || {};
  const keys = Object.keys(missing).sort();

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-2">i18n — Clés manquantes</h1>
      <div className="text-sm text-gray-500 mb-4">{keys.length} clé(s) détectée(s)</div>
      {keys.length === 0 ? (
        <div className="text-gray-500">Aucune clé manquante détectée.</div>
      ) : (
        <ul className="space-y-1">
          {keys.map(k => (
            <li key={k} className="text-sm font-mono bg-yellow-50 border border-yellow-200 rounded px-2 py-1">
              {k}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
