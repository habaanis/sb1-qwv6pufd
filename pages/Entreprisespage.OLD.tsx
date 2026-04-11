// ⚠️ FICHIER NEUTRALISÉ - NE PLUS IMPORTER CE COMPOSANT
// Ce fichier a été remplacé par src/pages/Businesses.tsx
// Conservé uniquement pour référence historique
// TODO: Supprimer ce fichier après validation complète

import React from 'react';
import { supabase } from '../lib/supabaseClient';
import { readParams } from '../lib/urlParams';
import { RPC } from '../lib/dbTables';
import { ChevronDown } from 'lucide-react';

const CATEGORIES = [
  { value: '', label: 'Toutes les catégories' },
  { value: 'Médecin', label: 'Médecin / Santé', domain: 'Santé' },
  { value: 'Dentiste', label: 'Dentiste / Santé', domain: 'Santé' },
  { value: 'Pharmacie', label: 'Pharmacie / Santé', domain: 'Santé' },
  { value: 'Kinésithérapeute', label: 'Kinésithérapeute / Santé', domain: 'Santé' },
  { value: 'Infirmier', label: 'Infirmier / Santé', domain: 'Santé' },
  { value: 'Psychologue', label: 'Psychologue / Santé', domain: 'Santé' },
  { value: 'Vétérinaire', label: 'Vétérinaire / Santé', domain: 'Santé' },
  { value: 'Avocat', label: 'Avocat / Juridique', domain: 'Juridique' },
  { value: 'Notaire', label: 'Notaire / Juridique', domain: 'Juridique' },
  { value: 'Huissier', label: 'Huissier / Juridique', domain: 'Juridique' },
  { value: 'Expert-comptable', label: 'Expert-comptable / Finance', domain: 'Finance' },
  { value: 'Banque', label: 'Banque / Finance', domain: 'Finance' },
  { value: 'Assurance', label: 'Assurance / Finance', domain: 'Finance' },
  { value: 'Architecte', label: 'Architecte / Construction', domain: 'Construction' },
  { value: 'Ingénieur', label: 'Ingénieur / Construction', domain: 'Construction' },
  { value: 'Maçon', label: 'Maçon / Construction', domain: 'Construction' },
  { value: 'Électricien', label: 'Électricien / Construction', domain: 'Construction' },
  { value: 'Plombier', label: 'Plombier / Construction', domain: 'Construction' },
  { value: 'Menuisier', label: 'Menuisier / Construction', domain: 'Construction' },
  { value: 'Peintre', label: 'Peintre / Construction', domain: 'Construction' },
  { value: 'Restaurant', label: 'Restaurant / Alimentation', domain: 'Alimentation' },
  { value: 'Café', label: 'Café / Alimentation', domain: 'Alimentation' },
  { value: 'Pâtisserie', label: 'Pâtisserie / Alimentation', domain: 'Alimentation' },
  { value: 'Boulangerie', label: 'Boulangerie / Alimentation', domain: 'Alimentation' },
  { value: 'Supermarché', label: 'Supermarché / Commerce', domain: 'Commerce' },
  { value: 'Épicerie', label: 'Épicerie / Commerce', domain: 'Commerce' },
  { value: 'Coiffeur', label: 'Coiffeur / Beauté', domain: 'Beauté' },
  { value: 'Esthéticienne', label: 'Esthéticienne / Beauté', domain: 'Beauté' },
  { value: 'Salon de beauté', label: 'Salon de beauté / Beauté', domain: 'Beauté' },
  { value: 'Garage', label: 'Garage / Automobile', domain: 'Automobile' },
  { value: 'Mécanicien', label: 'Mécanicien / Automobile', domain: 'Automobile' },
  { value: 'Carrossier', label: 'Carrossier / Automobile', domain: 'Automobile' },
  { value: 'École', label: 'École / Éducation', domain: 'Éducation' },
  { value: 'Université', label: 'Université / Éducation', domain: 'Éducation' },
  { value: 'Centre de formation', label: 'Centre de formation / Éducation', domain: 'Éducation' },
  { value: 'Hôtel', label: 'Hôtel / Tourisme', domain: 'Tourisme' },
  { value: 'Agence de voyage', label: 'Agence de voyage / Tourisme', domain: 'Tourisme' },
  { value: 'Location de voitures', label: 'Location de voitures / Tourisme', domain: 'Tourisme' },
  { value: 'Agence immobilière', label: 'Agence immobilière / Immobilier', domain: 'Immobilier' },
  { value: 'Informatique', label: 'Informatique / Technologie', domain: 'Technologie' },
  { value: 'Développeur web', label: 'Développeur web / Technologie', domain: 'Technologie' },
  { value: 'Graphiste', label: 'Graphiste / Communication', domain: 'Communication' },
  { value: 'Photographe', label: 'Photographe / Communication', domain: 'Communication' },
  { value: 'Imprimerie', label: 'Imprimerie / Communication', domain: 'Communication' },
  { value: 'Transporteur', label: 'Transporteur / Transport', domain: 'Transport' },
  { value: 'Taxi', label: 'Taxi / Transport', domain: 'Transport' },
  { value: 'Pressing', label: 'Pressing / Services', domain: 'Services' },
  { value: 'Blanchisserie', label: 'Blanchisserie / Services', domain: 'Services' },
  { value: 'Nettoyage', label: 'Nettoyage / Services', domain: 'Services' },
];

export default function EntreprisesPage() {
  const [rows, setRows] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = React.useState('');
  const { q, ville } = readParams();
  const pageCat = (new URL(window.location.href)).searchParams.get('page_categorie') || '';

  React.useEffect(() => {
    const run = async () => {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase.rpc(RPC.ENTERPRISE_SEARCH_LIST, {
        p_q: q || null,
        p_ville: ville || null,
        p_categorie: selectedCategory || pageCat || null,
        p_limit: 80
      });

      if (err) setError(err.message);
      setRows(data ?? []);
      setLoading(false);
    };
    run();
  }, [q, ville, pageCat, selectedCategory]);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6 text-gray-900">Annuaire des Entreprises</h1>

      <div className="mb-6 bg-white rounded-xl shadow-sm border border-gray-200 p-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[250px]">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Filtrer par métier / domaine
            </label>
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2.5 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white appearance-none"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat.value} value={cat.value}>
                    {cat.label}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
            </div>
          </div>

          <div className="text-sm text-gray-600">
            {q && (
              <span className="inline-block bg-orange-50 text-orange-700 px-3 py-1 rounded-full mr-2">
                Recherche: <b>{q}</b>
              </span>
            )}
            {ville && (
              <span className="inline-block bg-blue-50 text-blue-700 px-3 py-1 rounded-full mr-2">
                Ville: <b>{ville}</b>
              </span>
            )}
            {(selectedCategory || pageCat) && (
              <span className="inline-block bg-green-50 text-green-700 px-3 py-1 rounded-full">
                Catégorie: <b>{selectedCategory || pageCat}</b>
              </span>
            )}
          </div>
        </div>
      </div>

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <p className="mt-2 text-gray-600">Chargement...</p>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
          Erreur: {error}
        </div>
      )}

      {!loading && rows.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-xl">
          <p className="text-gray-500 text-lg">Aucune entreprise trouvée</p>
          <p className="text-gray-400 text-sm mt-2">Essayez de modifier vos critères de recherche</p>
        </div>
      )}

      {!loading && rows.length > 0 && (
        <div className="mb-4 text-sm text-gray-600">
          <b>{rows.length}</b> entreprise{rows.length > 1 ? 's' : ''} trouvée{rows.length > 1 ? 's' : ''}
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {rows.map(e => (
          <div key={e.id} className="border border-gray-200 rounded-xl p-5 bg-white hover:shadow-xl hover:border-orange-300 transition-all duration-300">
            <div className="font-semibold text-lg text-gray-900 mb-2">{e.nom}</div>
            <div className="text-sm text-gray-600 mb-3 flex flex-wrap gap-2">
              {e.ville && (
                <span className="inline-flex items-center text-xs bg-gray-100 px-2 py-1 rounded">
                  📍 {e.ville}
                </span>
              )}
              {(e.categorie || e.sous_categories) && (
                <span className="inline-flex items-center text-xs bg-orange-50 text-orange-700 px-2 py-1 rounded">
                  {e.categorie || e.sous_categories}
                </span>
              )}
            </div>
            {e.page_categorie && (
              <div className="text-xs text-gray-500 mb-3">
                Domaine: <span className="font-medium">{e.page_categorie}</span>
              </div>
            )}
            <button
              className="w-full mt-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors font-medium"
              onClick={() => (window.location.hash = `#/entreprises/${e.id}`)}
            >
              Voir la fiche
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
