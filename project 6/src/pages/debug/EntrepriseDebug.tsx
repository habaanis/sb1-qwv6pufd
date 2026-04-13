import React from 'react';
import { supabase } from '../../lib/supabaseClient';
import { Tables } from '../../lib/dbTables';

export default function EntrepriseDebug() {
  const [rows, setRows] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [loading, setLoading] = React.useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    // Requête simple (sans filtre) : 20 premières lignes
    const { data, error } = await supabase
      .from(Tables.ENTREPRISE)
      .select('id, nom, ville, categorie')
      .order('nom', { ascending: true })
      .limit(20);
    if (error) setError(error.message);
    setRows(data ?? []);
    setLoading(false);
  };

  React.useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Debug : 20 premières lignes — entreprise</h1>
        <a
          href="#/searchDebug"
          className="text-sm text-blue-600 hover:text-blue-700 underline"
        >
          ← Retour au panneau de debug
        </a>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={load}
          className="px-3 py-2 rounded border hover:bg-gray-50 transition-colors"
        >
          Recharger
        </button>
        <span className="text-sm text-gray-600">
          {loading ? 'Chargement…' : `Résultats : ${rows.length}`}
        </span>
      </div>
      {error && <div className="text-red-600 font-medium">Erreur: {error}</div>}
      <div className="overflow-auto rounded border">
        <table className="w-full text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-2 text-left">id</th>
              <th className="p-2 text-left">nom</th>
              <th className="p-2 text-left">ville</th>
              <th className="p-2 text-left">categorie</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t hover:bg-gray-50">
                <td className="p-2 break-all font-mono text-xs">{r.id}</td>
                <td className="p-2">{r.nom}</td>
                <td className="p-2">{r.ville}</td>
                <td className="p-2">{r.categorie}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
