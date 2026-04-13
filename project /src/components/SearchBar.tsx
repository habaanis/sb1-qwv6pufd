import React from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabaseClient';
import { Tables } from '../lib/dbTables';
import { detectIntent, getCategoryRoute, getCategoryDisplayName, PageCategorie } from '../lib/intentDetection';
import { FORCE_ENTERPRISE_ONLY } from '../config/searchMode';
import { expandQuery, rankItemByQuery, MIN_CHARS } from '../lib/searchSynonyms';
import { expandCityVariants } from '../lib/geoAliases';
import { buildEntrepriseUrl } from '../lib/url';
import { useLanguage } from '../context/LanguageContext';
import { t, isRTL, type Lang } from '../lib/i18n';
import { METIERS_DOMAINES } from '../lib/categories';
import { normalizeText } from '../lib/textNormalization';
import { ChevronDown } from 'lucide-react';
import LocationSelectTunisie from './LocationSelectTunisie';

type Scope = 'global' | 'sante' | 'education' | 'administration' | 'loisirs' | 'magasin' | 'marche_local' | 'tourism' | 'services';
type Mode = 'entreprises' | 'annonces' | 'evenements';

interface EntrepriseItem {
  id: string;
  nom?: string;
  ville: string;
  categorie?: string;
  matiere?: string;
  _rank?: number;
}

interface AnnonceItem {
  id: string;
  titre: string;
  ville: string;
  categorie: string;
  urgent?: boolean;
  prix?: number;
}

interface EventItem {
  id: string;
  titre: string;
  ville: string;
  categorie: string;
  date_debut?: string;
  date_fin?: string;
}

type ResultItem = EntrepriseItem | AnnonceItem | EventItem;

interface VilleItem {
  ville: string;
}

type Props = {
  scope: Scope;
  mode?: Mode;
  intentEnabled?: boolean;
  showSeeAllItem?: boolean;
  className?: string;
  enabled?: boolean;
};

export default function SearchBar({
  scope,
  mode = 'entreprises',
  intentEnabled = false,
  showSeeAllItem = true,
  className = '',
  enabled = true
}: Props) {
  if (!enabled) return null;

  mode = 'entreprises';
  const { language } = useLanguage();
  const navigate = useNavigate();
  const dir = isRTL(language as Lang) ? 'rtl' : 'ltr';

  const [q, setQ] = React.useState('');
  const [city, setCity] = React.useState('');
  const [metier, setMetier] = React.useState('');
  const [ent, setEnt] = React.useState<ResultItem[]>([]);
  const [villes, setVilles] = React.useState<VilleItem[]>([]);
  const [loadingEnt, setLoadingEnt] = React.useState(false);
  const [loadingVille, setLoadingVille] = React.useState(false);
  const [errEnt, setErrEnt] = React.useState<string | null>(null);
  const [errVille, setErrVille] = React.useState<string | null>(null);
  const tEnt = React.useRef<number | null>(null);
  const tVille = React.useRef<number | null>(null);
  const cache = React.useRef<Map<string, ResultItem[]>>(new Map());

  const isGlobal = scope === 'global';
  const pageLabel = isGlobal ? null : getCategoryDisplayName(scope as PageCategorie);

  const like = (s: string) => `%${(s || '').trim()}%`;

  async function fetchEntreprisesDirect(q: string, cityParam: string, limit = 12) {
    const tableName = scope === 'education' ? Tables.PROFESSEURS : Tables.ENTREPRISE;
    const nameField = 'nom';

    let query = supabase
      .from(tableName)
      .select(scope === 'education' ? 'id, nom, ville, matiere' : 'id, nom, ville, categorie')
      .order(nameField, { ascending: true })
      .limit(limit);

    if (q) {
      if (scope === 'education') {
        query = query.or(`nom.ilike.%${q}%,matiere.ilike.%${q}%`);
      } else {
        query = query.ilike('nom', like(q));
      }
    }

    if (cityParam && cityParam.trim().length > 0) {
      query = query.eq('gouvernorat', cityParam);
    }

    // Filtre spécifique pour la page magasin
    if (scope === 'magasin') {
      query = query.eq('"page commerce local"', true);
    }

    return await query;
  }


  const onChangeQ = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.currentTarget.value ?? '';
    setQ(v);
    if (tEnt.current) window.clearTimeout(tEnt.current);
    tEnt.current = window.setTimeout(async () => {
      const trimmedValue = v.trim();

      if (trimmedValue.length < MIN_CHARS) {
        setEnt([]);
        return;
      }

      const cacheKey = `${normalizeText(trimmedValue)}-${city}-${scope}`;
      if (cache.current.has(cacheKey)) {
        setEnt(cache.current.get(cacheKey)!);
        return;
      }

      setLoadingEnt(true);
      setErrEnt(null);
      try {
        let allResults: any[] = [];
        const searchPattern = `%${trimmedValue}%`;

        if (scope === 'education') {
          let query = supabase
            .from(Tables.PROFESSEURS)
            .select('id, nom, ville, matiere')
            .or(`nom.ilike.${searchPattern},matiere.ilike.${searchPattern}`)
            .order('nom', { ascending: true })
            .limit(12);

          if (city && city.trim().length > 0) {
            query = query.eq('gouvernorat', city);
          }

          const resp = await query;
          allResults = resp.data || [];
        } else {
          // Utilisation de la nouvelle fonction RPC avec priorisation intelligente
          const resp = await supabase.rpc('search_entreprise_smart', {
            p_q: trimmedValue,
            p_ville: city && city.trim().length > 0 ? city : null,
            p_categorie: metier && metier.trim().length > 0 ? metier : null,
            p_scope: scope !== 'global' ? scope : null,
            p_limit: 30
          });

          if (resp.error) {
            console.error('Search query error:', resp.error);
            setErrEnt(resp.error.message);
            setEnt([]);
            setLoadingEnt(false);
            return;
          }

          // Les résultats sont déjà triés par pertinence (score DESC)
          allResults = (resp.data || []).map(item => {
            // Mapping du score pour compatibilité avec l'ancien système
            const score = item.score || 0;
            let priority = 3;
            if (score >= 50) priority = 0; // Catégorie exacte/commence par
            else if (score >= 20) priority = 1; // Nom exact/commence par
            else if (score >= 10) priority = 2; // Contient dans nom

            return { ...item, _priority: priority };
          })
          .sort((a, b) => {
            if (a._priority !== b._priority) return a._priority - b._priority;
            const nameA = a.nom || '';
            const nameB = b.nom || '';
              return nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' });
            })
            .slice(0, 12)
            .map(({ _priority, ...rest }) => rest);
        }

        cache.current.set(cacheKey, allResults);
        if (cache.current.size > 50) {
          const firstKey = cache.current.keys().next().value;
          cache.current.delete(firstKey);
        }

        setEnt(allResults);
      } catch (err) {
        console.error('Search error:', err);
        setErrEnt(err instanceof Error ? err.message : 'Erreur de recherche');
        setEnt([]);
      } finally {
        setLoadingEnt(false);
      }
    }, 100);
  };

  const onChangeCity = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = e.currentTarget.value ?? '';
    setCity(v);
    if (tVille.current) window.clearTimeout(tVille.current);
    tVille.current = window.setTimeout(async () => {
      if (v.trim().length < MIN_CHARS) {
        setVilles([]);
        return;
      }
      setLoadingVille(true);
      setErrVille(null);
      try {
        const variants = expandCityVariants(v, language as Lang);
        const allCities: VilleItem[] = [];

        for (const variant of variants) {
          const resp = await supabase
            .from(Tables.CITIES)
            .select('ville')
            .ilike('ville', like(variant))
            .order('ville', { ascending: true })
            .limit(8);

          if (resp.data) {
            allCities.push(...resp.data);
          }
          if (resp.error) setErrVille(resp.error.message);
        }

        const seen = new Set<string>();
        const unique = allCities.filter(c => {
          const key = normalizeText(c.ville);
          if (seen.has(key)) return false;
          seen.add(key);
          return true;
        });

        setVilles(unique.slice(0, 8));
      } finally {
        setLoadingVille(false);
      }
    }, 200);
  };

  React.useEffect(() => {
    return () => {
      if (tEnt.current) window.clearTimeout(tEnt.current);
      if (tVille.current) window.clearTimeout(tVille.current);
    };
  }, []);

  const goTo = (path: string) => {
    // Enlever le # si présent pour compatibilité
    const cleanPath = path.startsWith('#') ? path.substring(1) : path;
    navigate(cleanPath);
  };

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const query = q.trim();
    const villeParam = city.trim();
    let detectedCategory: string | undefined;

    if (isGlobal && intentEnabled) {
      const res = detectIntent(query);
      if (res.categorie && res.shouldRedirect) {
        const label = getCategoryDisplayName(res.categorie);
        if (confirm(`Aller directement vers la page ${label} ?`)) {
          const route = getCategoryRoute(res.categorie);
          const params = new URLSearchParams();
          if (query) params.set('q', query);
          if (villeParam) params.set('ville', villeParam);
          goTo(`${route}?${params.toString()}`);
          return;
        }
        detectedCategory = res.categorie;
      }
    }

    if (!isGlobal) {
      const params = new URLSearchParams();
      if (query) params.set('q', query);
      if (villeParam) params.set('ville', villeParam);
      params.set('page_categorie', scope);
      const routeMap: Record<string, string> = {
        sante: '#/citizens/health',
        education: '#/education',
        administration: '#/citizens/admin',
        loisirs: '#/citizens/leisure',
        magasin: '#/citizens/shops',
        marche_local: '#/local-marketplace',
        tourism: '#/citizens/tourism',
        services: '#/citizens/services',
      };
      goTo(`${routeMap[scope] || '#/entreprises'}?${params.toString()}`);
      return;
    }

    const url = buildEntrepriseUrl({
      q: query || undefined,
      ville: villeParam || undefined,
      categorie: detectedCategory
    });
    goTo(url);
  };

  const renderSeeAll = () => {
    if (!showSeeAllItem) return null;

    if (isGlobal && q.trim().length >= 2) {
      const res = detectIntent(q);
      if (res.categorie && res.confidence >= 0.75) {
        const label = getCategoryDisplayName(res.categorie);
        const url = buildEntrepriseUrl({
          q: q.trim(),
          ville: city.trim() || undefined,
          categorie: res.categorie
        });
        return (
          <li
            className="py-2.5 px-2 font-medium cursor-pointer hover:bg-blue-50 rounded transition text-blue-700 flex items-center gap-2"
            onClick={() => goTo(url)}
          >
            <span>➡️</span>
            <span>Voir tout dans {label}</span>
          </li>
        );
      }

      if (q.trim().length >= 2) {
        const url = buildEntrepriseUrl({
          q: q.trim(),
          ville: city.trim() || undefined
        });
        return (
          <li
            className="py-2.5 px-2 font-medium cursor-pointer hover:bg-gray-50 rounded transition text-gray-700 flex items-center gap-2"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => goTo(url)}
          >
            <span>➡️</span>
            <span>{t(language as Lang, 'search.seeAll')}</span>
          </li>
        );
      }
    }

    if (!isGlobal && q.trim().length >= 2 && pageLabel) {
      const params = new URLSearchParams();
      if (q.trim()) params.set('q', q.trim());
      if (city.trim()) params.set('ville', city.trim());
      params.set('page_categorie', scope);
      const routeMap: Record<string, string> = {
        sante: '#/citizens/health',
        education: '#/education',
        administration: '#/citizens/admin',
        loisirs: '#/citizens/leisure',
        magasin: '#/citizens/shops',
        marche_local: '#/local-marketplace',
        tourism: '#/citizens/tourism',
        services: '#/citizens/services',
      };
      return (
        <li
          className="py-2.5 px-2 font-medium cursor-pointer hover:bg-orange-50 rounded transition text-orange-700 flex items-center gap-2"
          onClick={() => goTo(`${routeMap[scope] || '#/entreprises'}?${params.toString()}`)}
        >
          <span>➡️</span>
          <span>Voir tout dans {pageLabel}</span>
        </li>
      );
    }

    return null;
  };

  const hasResults = q.trim().length >= MIN_CHARS && (ent.length > 0 || !loadingEnt || showSeeAllItem);

  return (
    <form
      onSubmit={onSubmit}
      className={`relative w-full z-[10000] ${className ?? ''}`}
      data-search-bar="true"
      data-search-scope={isGlobal ? 'entreprise-ville' : `entreprise-ville:${scope}`}
      data-component-name="SearchBar"
    >
      <div className="w-full grid grid-cols-1 md:grid-cols-3 gap-2.5">
        <div className="relative z-10">
          <input
            type="search"
            inputMode="search"
            autoCapitalize="none"
            autoCorrect="off"
            spellCheck={false}
            dir={dir}
            placeholder={t(language as Lang, 'search.placeholderQuery')}
            className="w-full px-3 py-2 rounded-lg border border-[#D4AF37] bg-white text-sm focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
            value={q}
            onChange={onChangeQ}
            onFocus={() => q.trim().length >= MIN_CHARS && onChangeQ({ currentTarget: { value: q } } as any)}
          />
        </div>
        <div className="relative z-10">
          <LocationSelectTunisie
            value={city}
            onChange={setCity}
            placeholder={t(language as Lang, 'search.placeholderCity')}
            className="px-3 py-2 rounded-lg text-sm"
          />
        </div>
        <div className="relative z-10">
          <select
            value={metier}
            onChange={(e) => setMetier(e.target.value)}
            className="w-full px-3 py-2 pr-9 rounded-lg border border-[#D4AF37] bg-white appearance-none text-gray-900 text-sm focus:ring-1 focus:ring-[#D4AF37] focus:border-[#D4AF37] outline-none"
            dir={dir}
          >
            {METIERS_DOMAINES.map((m) => (
              <option key={m.value} value={m.value}>
                {m.value === '' ? t(language as Lang, 'search.allCategories') : m.label}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#4A1D43] pointer-events-none" />
        </div>
      </div>

      {hasResults && (
        <div
          className="absolute left-0 right-0 mt-2 rounded-xl border bg-white shadow-xl p-3 space-y-3 max-h-[70vh] overflow-auto z-[10001]"
          style={{ pointerEvents: 'auto' }}
        >
          <ul className="divide-y">
            {renderSeeAll()}
            {ent.length > 0 ? (
              <>
                <li className="py-1 text-xs font-semibold text-gray-500 sticky top-0 bg-white">
                  Entreprises
                </li>
                {ent.map((item: any) => {
                  const displayName = item.nom;
                  const displayCategory = item.matiere || item.categorie;
                  return (
                    <li
                      key={item.id}
                      className="py-2 cursor-pointer hover:bg-gray-50"
                      onMouseDown={(ev) => ev.preventDefault()}
                      onClick={() => goTo(`#/entreprises/${item.id}`)}
                    >
                      <div className="font-medium">{displayName}</div>
                      <div className="text-xs text-gray-500">{item.ville} · {displayCategory}</div>
                    </li>
                  );
                })}
              </>
            ) : (
              !loadingEnt && q.trim().length >= MIN_CHARS && (
                <li className="py-4 text-center text-gray-500">
                  Aucun résultat trouvé
                </li>
              )
            )}
          </ul>
          <div className="text-xs text-gray-500 pt-1">
            {loadingEnt && <span>Chargement...</span>}
            {!loadingEnt && ent.length > 0 && <span>Entreprises: {ent.length}</span>}
            {errEnt && <span className="text-red-600">Erreur: {errEnt}</span>}
          </div>
        </div>
      )}

      <button type="submit" className="hidden">
        {t(language as Lang, 'search.searchBtn')}
      </button>
    </form>
  );
}
